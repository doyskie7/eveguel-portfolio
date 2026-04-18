import { useState, useRef, useEffect, useCallback } from "react";
import * as THREE from "three";

const GREETING = "Hey there! I'm Eveguel's AI assistant. I know everything about him — his skills, experience, projects, and more. What would you like to know?";

const SUGGESTIONS = [
  "What's your tech stack?",
  "Tell me about your automation work",
  "Are you available for freelance?",
  "What AI tools have you used?",
];

// ─── TTS hook ────────────────────────────────────────────────────────────────
function useVoice() {
  const speakingRef = useRef(false);
  const [speaking, setSpeaking] = useState(false);

  const getVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    return (
      voices.find((v) => v.name === "Google US English") ||
      voices.find((v) => v.name.includes("Daniel")) ||
      voices.find((v) => v.lang === "en-US" && !v.name.toLowerCase().includes("female")) ||
      voices.find((v) => v.lang === "en-US") ||
      null
    );
  };

  const speak = useCallback((text) => {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    const voice = getVoice();
    if (voice) utter.voice = voice;
    utter.rate = 1;
    utter.pitch = 1;
    utter.volume = 1;
    utter.onstart = () => { speakingRef.current = true; setSpeaking(true); };
    utter.onend   = () => { speakingRef.current = false; setSpeaking(false); };
    utter.onerror = () => { speakingRef.current = false; setSpeaking(false); };
    window.speechSynthesis.speak(utter);
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    speakingRef.current = false;
    setSpeaking(false);
  }, []);

  return { speak, stop, speaking, speakingRef };
}

// ─── Speech-input hook ────────────────────────────────────────────────────────
function useSpeechInput({ onInterim, onFinal }) {
  const recognitionRef = useRef(null);
  const listeningRef   = useRef(false);   // user intent: true = wants to listen
  const interimRef     = useRef("");
  const onInterimRef   = useRef(onInterim);
  const onFinalRef     = useRef(onFinal);
  const [listening, setListening] = useState(false);
  const supported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  onInterimRef.current = onInterim;
  onFinalRef.current   = onFinal;

  // Creates and starts one recognition session.
  // Calls itself again on silence timeout (listeningRef still true) so the
  // green UI stays solid — only the browser's internal session cycles, not ours.
  const startSession = useCallback(() => {
    if (!supported) return;
    const SR  = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.continuous     = true;
    rec.interimResults = true;
    rec.lang           = "en-US";

    rec.onresult = (e) => {
      let interim = "", final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t;
        else interim += t;
      }
      if (final) {
        interimRef.current   = "";
        listeningRef.current = false;   // done — user spoke
        setListening(false);
        try { rec.abort(); } catch (_) {}
        onFinalRef.current(final);
      } else if (interim) {
        interimRef.current = interim;
        onInterimRef.current(interim);
      }
    };

    rec.onend = () => {
      if (!listeningRef.current) {
        // Either user stopped manually or a final result was already delivered
        setListening(false);
        return;
      }

      const leftover = interimRef.current.trim();
      if (leftover) {
        // Had partial speech when session cut off — send it
        interimRef.current   = "";
        listeningRef.current = false;
        setListening(false);
        onFinalRef.current(leftover);
      } else {
        // Pure silence timeout — restart the session silently, keep UI green
        setTimeout(() => {
          if (listeningRef.current) startSession();
        }, 80);
      }
    };

    rec.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        listeningRef.current = false;
        setListening(false);
      }
      // no-speech: onend fires next and will restart cleanly
    };

    recognitionRef.current = rec;
    try { rec.start(); } catch (_) {}
  }, [supported]);

  const start = useCallback(() => {
    if (!supported || listeningRef.current) return;
    interimRef.current   = "";
    listeningRef.current = true;
    setListening(true);
    startSession();
  }, [supported, startSession]);

  const stop = useCallback(() => {
    interimRef.current   = "";
    listeningRef.current = false;
    setListening(false);
    try { recognitionRef.current?.abort(); } catch (_) {}
  }, []);

  const toggle = useCallback(() => {
    if (listeningRef.current) stop(); else start();
  }, [start, stop]);

  return { toggle, stop, listening, listeningRef, supported };
}

// ─── 3D Orb ───────────────────────────────────────────────────────────────────
function OrbScene({ mountRef, speakingRef, listeningRef }) {
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;
    let W = container.clientWidth;
    let H = container.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 100);
    camera.position.z = 5.5;

    const geometry = new THREE.IcosahedronGeometry(1.6, 4);
    const originalPos = new Float32Array(geometry.attributes.position.array);

    const solidMat = new THREE.MeshPhongMaterial({
      color: 0x312e81,
      emissive: 0x1e1b4b,
      specular: 0x818cf8,
      shininess: 80,
      transparent: true,
      opacity: 0.85,
    });
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      wireframe: true,
      transparent: true,
      opacity: 0.5,
    });

    scene.add(new THREE.Mesh(geometry, solidMat));
    scene.add(new THREE.Mesh(geometry, wireMat));

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(2.1, 0.02, 8, 80),
      new THREE.MeshBasicMaterial({ color: 0x6366f1, transparent: true, opacity: 0.3 })
    );
    ring.rotation.x = Math.PI / 4;
    scene.add(ring);

    const ring2Mat = new THREE.MeshBasicMaterial({ color: 0x818cf8, transparent: true, opacity: 0.15 });
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.015, 8, 80), ring2Mat);
    ring2.rotation.x = -Math.PI / 3;
    ring2.rotation.y = Math.PI / 5;
    scene.add(ring2);

    const pCount = 60;
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      const r     = 2.2 + Math.random() * 0.8;
      pPos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      pPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pPos[i * 3 + 2] = r * Math.cos(phi);
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0xa5b4fc, size: 0.06, transparent: true, opacity: 0.7 });
    scene.add(new THREE.Points(pGeo, pMat));

    scene.add(new THREE.AmbientLight(0x312e81, 3));
    const light1 = new THREE.PointLight(0x6366f1, 6, 15);
    light1.position.set(3, 3, 3);
    scene.add(light1);
    const light2 = new THREE.PointLight(0xa5b4fc, 4, 15);
    light2.position.set(-3, -2, 2);
    scene.add(light2);

    // Extra green light for listening state
    const listenLight = new THREE.PointLight(0x22c55e, 0, 12);
    listenLight.position.set(0, 3, 2);
    scene.add(listenLight);

    let time = 0;
    let animId;
    const meshes = scene.children.filter((c) => c.isMesh && c.geometry === geometry);

    const animate = () => {
      animId = requestAnimationFrame(animate);
      time += 0.016;

      const isSpeaking  = speakingRef.current;
      const isListening = listeningRef.current;
      const pos = geometry.attributes.position;

      for (let i = 0; i < pos.count; i++) {
        const ox = originalPos[i * 3];
        const oy = originalPos[i * 3 + 1];
        const oz = originalPos[i * 3 + 2];
        const len = Math.sqrt(ox * ox + oy * oy + oz * oz);
        const nx = ox / len, ny = oy / len, nz = oz / len;

        let amplitude, speed;
        if (isSpeaking) {
          amplitude = 0.18 + Math.sin(time * 12 + i * 0.4) * 0.12 + Math.random() * 0.08;
          speed = 6;
        } else if (isListening) {
          // Ripple inward — orb "listens" by contracting
          amplitude = 0.08 + Math.sin(time * 8 + i * 0.6) * 0.06 + Math.random() * 0.04;
          speed = 4;
        } else {
          amplitude = 0.05 + Math.sin(time * 0.8) * 0.03;
          speed = 1.2;
        }

        const wave =
          Math.sin(time * speed + nx * 6) *
          Math.cos(time * speed * 0.8 + ny * 6) *
          Math.sin(time * speed * 0.6 + nz * 4) *
          amplitude;

        pos.array[i * 3]     = ox + nx * wave;
        pos.array[i * 3 + 1] = oy + ny * wave;
        pos.array[i * 3 + 2] = oz + nz * wave;
      }

      pos.needsUpdate = true;
      geometry.computeVertexNormals();

      const rotSpeed = isSpeaking ? 0.012 : isListening ? 0.008 : 0.004;
      meshes.forEach((m, idx) => {
        m.rotation.y += rotSpeed;
        m.rotation.x += rotSpeed * (idx === 0 ? 0.4 : 0.4);
      });

      ring.rotation.z  += 0.005;
      ring2.rotation.z -= 0.003;
      ring2.rotation.x += 0.002;

      // Color shift based on state
      if (isListening) {
        solidMat.color.setHex(0x14532d);
        solidMat.emissive.setHex(0x052e16);
        wireMat.color.setHex(0x22c55e);
        ring2Mat.color.setHex(0x22c55e);
        light1.color.setHex(0x22c55e);
        listenLight.intensity = 4 + Math.sin(time * 10) * 2;
      } else if (isSpeaking) {
        solidMat.color.setHex(0x312e81);
        solidMat.emissive.setHex(0x1e1b4b);
        wireMat.color.setHex(0x6366f1);
        ring2Mat.color.setHex(0x818cf8);
        light1.color.setHex(0x6366f1);
        listenLight.intensity = 0;
      } else {
        solidMat.color.setHex(0x312e81);
        solidMat.emissive.setHex(0x1e1b4b);
        wireMat.color.setHex(0x6366f1);
        ring2Mat.color.setHex(0x818cf8);
        light1.color.setHex(0x6366f1);
        listenLight.intensity = 0;
      }

      light1.intensity = isSpeaking ? 6 + Math.sin(time * 20) * 4 : isListening ? 5 + Math.sin(time * 8) * 3 : 6;
      solidMat.emissiveIntensity = isSpeaking ? 0.4 + Math.sin(time * 15) * 0.3 : isListening ? 0.3 : 0.1;
      wireMat.opacity = isSpeaking ? 0.6 + Math.sin(time * 10) * 0.2 : isListening ? 0.7 : 0.4;

      renderer.render(scene, camera);
    };

    animate();

    const onResize = () => {
      W = container.clientWidth; H = container.clientHeight;
      renderer.setSize(W, H);
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
      renderer.dispose();
      geometry.dispose(); solidMat.dispose(); wireMat.dispose();
      pGeo.dispose(); pMat.dispose(); ring2Mat.dispose();
    };
  }, [mountRef, speakingRef, listeningRef]);

  return null;
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AIChatPage({ onClose }) {
  const [messages, setMessages] = useState([{ role: "assistant", content: GREETING }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const mountRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const { speak, stop: stopSpeaking, speaking, speakingRef } = useVoice();

  const sendRef = useRef(null);

  const handleInterim = useCallback((t) => setInput(t), []);
  const handleFinal   = useCallback((t) => {
    setInput("");
    sendRef.current?.(t);
  }, []);

  const { toggle: toggleMic, stop: stopMic, listening, listeningRef, supported: micSupported } =
    useSpeechInput({ onInterim: handleInterim, onFinal: handleFinal });

  useEffect(() => {
    const trySpeak = () => speak(GREETING);
    if (window.speechSynthesis.getVoices().length > 0) {
      setTimeout(trySpeak, 400);
    } else {
      window.speechSynthesis.addEventListener("voiceschanged", trySpeak, { once: true });
    }
    return () => {
      stopSpeaking();
      stopMic();
      window.speechSynthesis.removeEventListener("voiceschanged", trySpeak);
    };
  }, [speak, stopSpeaking, stopMic]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(text) {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput("");
    setShowSuggestions(false);
    stopSpeaking();
    stopMic();

    const updated = [...messages, { role: "user", content: msg }];
    setMessages(updated);
    setLoading(true);

    try {
      const apiMessages = updated.slice(1).map((m) => ({ role: m.role, content: m.content }));
      const res  = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });
      const data  = await res.json();
      const reply = data.reply || "Sorry, something went wrong.";
      setMessages([...updated, { role: "assistant", content: reply }]);
      speak(reply);
    } catch {
      setMessages([...updated, { role: "assistant", content: "Connection error. Please try again." }]);
    }
    setLoading(false);
  }

  // Keep ref current every render so voice sends always use the latest closure
  sendRef.current = sendMessage;

  function handleMicClick() {
    if (listening) {
      stopMic();
    } else {
      stopSpeaking();
      toggleMic();
    }
  }

  const statusLabel = speaking ? "Speaking..." : listening ? "Listening..." : loading ? "Thinking..." : "Ready to chat";
  const statusColor = speaking ? "#22c55e" : listening ? "#22c55e" : loading ? "#f59e0b" : "#555";

  return (
    <div style={{ position: "fixed", inset: 0, background: "#08080f", zIndex: 2000, display: "flex", flexDirection: "column", fontFamily: "Inter, sans-serif" }}>

      {/* Header */}
      <div style={{ padding: "14px 20px", borderBottom: "1px solid #1e1e2e", display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: statusColor, boxShadow: (speaking || listening) ? `0 0 8px ${statusColor}` : "none", transition: "all .3s" }} />
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 700, color: "#e8e8e8", fontSize: "0.95rem" }}>Eveguel's AI Assistant</p>
          <p style={{ fontSize: "0.75rem", color: statusColor, transition: "color .3s" }}>{statusLabel}</p>
        </div>
        <button onClick={() => { stopSpeaking(); stopMic(); onClose(); }}
          style={{ background: "none", border: "1px solid #2e2e3e", color: "#888", padding: "7px 16px", borderRadius: 8, cursor: "pointer", fontFamily: "inherit", fontSize: "0.85rem" }}>
          ✕ Close
        </button>
      </div>

      {/* 3D Orb */}
      <div
        ref={mountRef}
        style={{ height: "min(300px, 38vh)", flexShrink: 0, position: "relative", cursor: speaking ? "pointer" : "default" }}
        onClick={() => speaking && stopSpeaking()}
        title={speaking ? "Click to stop speaking" : ""}
      >
        <OrbScene mountRef={mountRef} speakingRef={speakingRef} listeningRef={listeningRef} />

        {/* Voice bars (speaking) */}
        {speaking && (
          <div style={{ position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 4, alignItems: "flex-end", height: 22 }}>
            {[0,1,2,3,4,5,6].map((i) => (
              <div key={i} style={{ width: 4, borderRadius: 2, background: "#6366f1", animation: `voiceBar .6s ease ${i * .08}s infinite alternate` }} />
            ))}
          </div>
        )}

        {/* Ripple rings (listening) */}
        {listening && (
          <div style={{ position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 4, alignItems: "flex-end", height: 22 }}>
            {[0,1,2,3,4,5,6].map((i) => (
              <div key={i} style={{ width: 4, borderRadius: 2, background: "#22c55e", animation: `voiceBar .5s ease ${i * .07}s infinite alternate` }} />
            ))}
          </div>
        )}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", alignItems: "flex-end", gap: 8 }}>
            {m.role === "assistant" && (
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", flexShrink: 0 }}>🤖</div>
            )}
            <div style={{
              maxWidth: "72%",
              background: m.role === "user" ? "linear-gradient(135deg,#6366f1,#4f46e5)" : "#13131f",
              border: m.role === "assistant" ? "1px solid #1e1e2e" : "none",
              padding: "10px 15px",
              borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
              fontSize: "0.88rem", color: "#e8e8e8", lineHeight: 1.6,
            }}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem" }}>🤖</div>
            <div style={{ background: "#13131f", border: "1px solid #1e1e2e", padding: "12px 16px", borderRadius: "18px 18px 18px 4px", display: "flex", gap: 5, alignItems: "center" }}>
              {[0,1,2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#6366f1", animation: `bounce 1s ease ${i*.2}s infinite` }} />)}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {showSuggestions && (
        <div style={{ padding: "0 20px 10px", display: "flex", flexWrap: "wrap", gap: 6 }}>
          {SUGGESTIONS.map((s) => (
            <button key={s} onClick={() => sendMessage(s)}
              style={{ background: "#13131f", border: "1px solid #2e2e3e", borderRadius: 20, padding: "6px 14px", fontSize: "0.78rem", color: "#888", cursor: "pointer", fontFamily: "inherit" }}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input row */}
      <div style={{ padding: "12px 20px 20px", borderTop: "1px solid #1e1e2e", display: "flex", gap: 10 }}>
        {/* Mic button */}
        {micSupported && (
          <button
            onClick={handleMicClick}
            title={listening ? "Stop listening" : "Speak your question"}
            style={{
              width: 50, height: 50, borderRadius: 12, border: "none", cursor: "pointer", flexShrink: 0,
              background: listening ? "linear-gradient(135deg,#16a34a,#15803d)" : "#13131f",
              boxShadow: listening ? "0 0 16px rgba(34,197,94,0.5)" : "none",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all .25s",
            }}
          >
            {listening ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <rect x="6" y="6" width="12" height="12" rx="2" fill="#fff" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <rect x="9" y="2" width="6" height="12" rx="3" fill="#6366f1" />
                <path d="M5 11a7 7 0 0014 0" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" />
                <line x1="12" y1="18" x2="12" y2="22" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" />
                <line x1="8" y1="22" x2="16" y2="22" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" />
              </svg>
            )}
          </button>
        )}

        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder={listening ? "Listening… speak now" : "Ask anything about Eveguel…"}
          style={{
            flex: 1, background: listening ? "#0d1f14" : "#13131f",
            border: `1px solid ${listening ? "#22c55e" : "#2e2e3e"}`,
            borderRadius: 12, padding: "13px 18px", color: listening ? "#86efac" : "#e8e8e8",
            fontSize: "0.9rem", outline: "none", fontFamily: "inherit", transition: "all .25s",
          }}
        />

        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          style={{
            background: "linear-gradient(135deg,#6366f1,#4f46e5)", border: "none", borderRadius: 12,
            padding: "13px 22px", color: "#fff", cursor: "pointer", fontWeight: 600,
            opacity: loading || !input.trim() ? 0.4 : 1, fontFamily: "inherit", fontSize: "0.9rem",
          }}
        >
          Send
        </button>
      </div>

      <style>{`
        @keyframes bounce   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        @keyframes voiceBar { from{height:4px} to{height:20px} }
      `}</style>
    </div>
  );
}
