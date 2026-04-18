import { useState, useRef, useEffect, useCallback } from "react";
import * as THREE from "three";

const GREETING = "Hey there! I'm Eveguel's AI assistant. I know everything about him — his skills, experience, projects, and more. What would you like to know?";

const SUGGESTIONS = [
  "What's your tech stack?",
  "Tell me about your automation work",
  "Are you available for freelance?",
  "What AI tools have you used?",
];

function useVoice() {
  const speakingRef = useRef(false);
  const [speaking, setSpeaking] = useState(false);
  const utteranceRef = useRef(null);

  const getVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    return (
      voices.find((v) => v.name === "Google US English") ||
      voices.find((v) => v.name.includes("Daniel")) ||
      voices.find((v) => v.lang === "en-US" && !v.name.includes("Female")) ||
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
    utter.onend = () => { speakingRef.current = false; setSpeaking(false); };
    utter.onerror = () => { speakingRef.current = false; setSpeaking(false); };
    utteranceRef.current = utter;
    window.speechSynthesis.speak(utter);
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    speakingRef.current = false;
    setSpeaking(false);
  }, []);

  return { speak, stop, speaking, speakingRef };
}

function OrbScene({ mountRef, speakingRef }) {
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

    // Main orb geometry (shared between solid + wireframe mesh)
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

    const solidMesh = new THREE.Mesh(geometry, solidMat);
    const wireMesh = new THREE.Mesh(geometry, wireMat);
    scene.add(solidMesh);
    scene.add(wireMesh);

    // Outer glow ring
    const ringGeo = new THREE.TorusGeometry(2.1, 0.02, 8, 80);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x6366f1, transparent: true, opacity: 0.3 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 4;
    scene.add(ring);

    const ring2 = new THREE.Mesh(
      new THREE.TorusGeometry(2.4, 0.015, 8, 80),
      new THREE.MeshBasicMaterial({ color: 0x818cf8, transparent: true, opacity: 0.15 })
    );
    ring2.rotation.x = -Math.PI / 3;
    ring2.rotation.y = Math.PI / 5;
    scene.add(ring2);

    // Particles around orb
    const pCount = 60;
    const pPositions = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 2.2 + Math.random() * 0.8;
      pPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pPositions[i * 3 + 2] = r * Math.cos(phi);
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPositions, 3));
    const pMat = new THREE.PointsMaterial({ color: 0xa5b4fc, size: 0.06, transparent: true, opacity: 0.7 });
    scene.add(new THREE.Points(pGeo, pMat));

    // Lights
    scene.add(new THREE.AmbientLight(0x312e81, 3));
    const light1 = new THREE.PointLight(0x6366f1, 6, 15);
    light1.position.set(3, 3, 3);
    scene.add(light1);
    const light2 = new THREE.PointLight(0xa5b4fc, 4, 15);
    light2.position.set(-3, -2, 2);
    scene.add(light2);

    let time = 0;
    let animId;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      time += 0.016;

      const isSpeaking = speakingRef.current;
      const pos = geometry.attributes.position;

      for (let i = 0; i < pos.count; i++) {
        const ox = originalPos[i * 3];
        const oy = originalPos[i * 3 + 1];
        const oz = originalPos[i * 3 + 2];
        const len = Math.sqrt(ox * ox + oy * oy + oz * oz);
        const nx = ox / len;
        const ny = oy / len;
        const nz = oz / len;

        let amplitude, speed;
        if (isSpeaking) {
          amplitude = 0.18 + Math.sin(time * 12 + i * 0.4) * 0.12 + Math.random() * 0.08;
          speed = 6;
        } else {
          amplitude = 0.05 + Math.sin(time * 0.8) * 0.03;
          speed = 1.2;
        }

        const wave =
          Math.sin(time * speed + nx * 6) *
          Math.cos(time * speed * 0.8 + ny * 6) *
          Math.sin(time * speed * 0.6 + nz * 4) *
          amplitude;

        pos.array[i * 3] = ox + nx * wave;
        pos.array[i * 3 + 1] = oy + ny * wave;
        pos.array[i * 3 + 2] = oz + nz * wave;
      }

      pos.needsUpdate = true;
      geometry.computeVertexNormals();

      const rotSpeed = isSpeaking ? 0.012 : 0.004;
      solidMesh.rotation.y += rotSpeed;
      solidMesh.rotation.x += rotSpeed * 0.4;
      wireMesh.rotation.copy(solidMesh.rotation);

      ring.rotation.z += 0.005;
      ring2.rotation.z -= 0.003;
      ring2.rotation.x += 0.002;

      // Pulse light on speaking
      light1.intensity = isSpeaking ? 6 + Math.sin(time * 20) * 4 : 6;
      solidMat.emissiveIntensity = isSpeaking ? 0.4 + Math.sin(time * 15) * 0.3 : 0.1;
      wireMat.opacity = isSpeaking ? 0.6 + Math.sin(time * 10) * 0.2 : 0.4;

      renderer.render(scene, camera);
    };

    animate();

    const onResize = () => {
      W = container.clientWidth;
      H = container.clientHeight;
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
      geometry.dispose();
      solidMat.dispose();
      wireMat.dispose();
      pGeo.dispose();
      pMat.dispose();
    };
  }, [mountRef, speakingRef]);

  return null;
}

export default function AIChatPage({ onClose }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: GREETING },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const mountRef = useRef(null);
  const messagesEndRef = useRef(null);
  const { speak, stop, speaking, speakingRef } = useVoice();

  // Speak greeting on open (wait for voices to load)
  useEffect(() => {
    const trySpeak = () => speak(GREETING);
    if (window.speechSynthesis.getVoices().length > 0) {
      setTimeout(trySpeak, 400);
    } else {
      window.speechSynthesis.addEventListener("voiceschanged", trySpeak, { once: true });
    }
    return () => {
      stop();
      window.speechSynthesis.removeEventListener("voiceschanged", trySpeak);
    };
  }, [speak, stop]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text) {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");
    setShowSuggestions(false);
    stop();

    const updated = [...messages, { role: "user", content: msg }];
    setMessages(updated);
    setLoading(true);

    try {
      const apiMessages = updated.slice(1).map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });
      const data = await res.json();
      const reply = data.reply || "Sorry, something went wrong.";
      setMessages([...updated, { role: "assistant", content: reply }]);
      speak(reply);
    } catch {
      const err = "Connection error. Please try again.";
      setMessages([...updated, { role: "assistant", content: err }]);
    }
    setLoading(false);
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "#08080f", zIndex: 2000, display: "flex", flexDirection: "column", fontFamily: "Inter, sans-serif" }}>
      {/* Header */}
      <div style={{ padding: "14px 20px", borderBottom: "1px solid #1e1e2e", display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: speaking ? "#22c55e" : loading ? "#f59e0b" : "#6366f1", boxShadow: speaking ? "0 0 8px #22c55e" : "none", transition: "all .3s" }} />
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 700, color: "#e8e8e8", fontSize: "0.95rem" }}>Eveguel's AI Assistant</p>
          <p style={{ fontSize: "0.75rem", color: speaking ? "#22c55e" : loading ? "#f59e0b" : "#555" }}>
            {speaking ? "Speaking..." : loading ? "Thinking..." : "Ready to chat"}
          </p>
        </div>
        <button onClick={() => { stop(); onClose(); }} style={{ background: "none", border: "1px solid #2e2e3e", color: "#888", padding: "7px 16px", borderRadius: 8, cursor: "pointer", fontFamily: "inherit", fontSize: "0.85rem" }}>
          ✕ Close
        </button>
      </div>

      {/* 3D Orb */}
      <div
        ref={mountRef}
        style={{ height: "min(300px, 38vh)", flexShrink: 0, position: "relative", cursor: speaking ? "pointer" : "default" }}
        onClick={() => speaking && stop()}
        title={speaking ? "Click to stop speaking" : ""}
      >
        <OrbScene mountRef={mountRef} speakingRef={speakingRef} />
        {speaking && (
          <div style={{ position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 4, alignItems: "flex-end", height: 20 }}>
            {[0,1,2,3,4,5,6].map((i) => (
              <div key={i} style={{
                width: 4,
                borderRadius: 2,
                background: "#6366f1",
                animation: `voiceBar 0.6s ease ${i * 0.08}s infinite alternate`,
              }} />
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
              fontSize: "0.88rem",
              color: "#e8e8e8",
              lineHeight: 1.6,
            }}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem" }}>🤖</div>
            <div style={{ background: "#13131f", border: "1px solid #1e1e2e", padding: "12px 16px", borderRadius: "18px 18px 18px 4px", display: "flex", gap: 5, alignItems: "center" }}>
              {[0,1,2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#6366f1", animation: `bounce 1s ease ${i*0.2}s infinite` }} />)}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {showSuggestions && (
        <div style={{ padding: "0 20px 10px", display: "flex", flexWrap: "wrap", gap: 6 }}>
          {SUGGESTIONS.map((s) => (
            <button key={s} onClick={() => send(s)} style={{ background: "#13131f", border: "1px solid #2e2e3e", borderRadius: 20, padding: "6px 14px", fontSize: "0.78rem", color: "#888", cursor: "pointer", fontFamily: "inherit" }}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ padding: "12px 20px 20px", borderTop: "1px solid #1e1e2e", display: "flex", gap: 10 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask anything about Eveguel..."
          style={{ flex: 1, background: "#13131f", border: "1px solid #2e2e3e", borderRadius: 12, padding: "13px 18px", color: "#e8e8e8", fontSize: "0.9rem", outline: "none", fontFamily: "inherit" }}
        />
        <button
          onClick={() => send()}
          disabled={loading || !input.trim()}
          style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)", border: "none", borderRadius: 12, padding: "13px 22px", color: "#fff", cursor: "pointer", fontWeight: 600, opacity: loading || !input.trim() ? 0.4 : 1, fontFamily: "inherit", fontSize: "0.9rem" }}
        >
          Send
        </button>
      </div>

      <style>{`
        @keyframes bounce { 0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)} }
        @keyframes voiceBar { from{height:4px}to{height:18px} }
      `}</style>
    </div>
  );
}
