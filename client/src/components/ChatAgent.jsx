import { useState, useRef, useEffect } from "react";

const SUGGESTIONS = [
  "What's your tech stack?",
  "Tell me about your automation experience",
  "Are you available for freelance work?",
  "What AI tools have you worked with?",
];

export default function ChatAgent() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm Eveguel's AI assistant. Ask me anything about his skills, experience, or availability." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  async function send(text) {
    const userMsg = text || input.trim();
    if (!userMsg || loading) return;
    setInput("");
    const updated = [...messages, { role: "user", content: userMsg }];
    setMessages(updated);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated.filter((m) => m.role !== "assistant" || updated.indexOf(m) > 0) }),
      });
      const data = await res.json();
      setMessages([...updated, { role: "assistant", content: data.reply || "Sorry, something went wrong." }]);
    } catch {
      setMessages([...updated, { role: "assistant", content: "Connection error. Please try again." }]);
    }
    setLoading(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        title="Chat with Eveguel's AI"
        style={{
          position: "fixed",
          bottom: 28,
          right: 28,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "var(--accent)",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 24px rgba(99,102,241,0.4)",
          zIndex: 1000,
          fontSize: "1.4rem",
          transition: "transform .2s",
        }}
        onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
        onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        {open ? "✕" : "💬"}
      </button>

      {open && (
        <div
          style={{
            position: "fixed",
            bottom: 96,
            right: 28,
            width: "min(400px, calc(100vw - 48px))",
            height: 520,
            background: "var(--bg2)",
            border: "1px solid var(--border)",
            borderRadius: 16,
            display: "flex",
            flexDirection: "column",
            zIndex: 999,
            boxShadow: "0 8px 48px rgba(0,0,0,0.5)",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem" }}>
              🤖
            </div>
            <div>
              <p style={{ fontWeight: 600, fontSize: "0.95rem" }}>Eveguel's AI Assistant</p>
              <p style={{ fontSize: "0.75rem", color: "var(--green)" }}>● Online</p>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 8px", display: "flex", flexDirection: "column", gap: 12 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                <div
                  style={{
                    maxWidth: "80%",
                    background: m.role === "user" ? "var(--accent)" : "var(--bg3)",
                    color: "var(--text)",
                    padding: "10px 14px",
                    borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    fontSize: "0.88rem",
                    lineHeight: 1.5,
                    border: m.role === "assistant" ? "1px solid var(--border)" : "none",
                  }}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", gap: 4, padding: "8px 14px", background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: "16px 16px 16px 4px", width: "fit-content" }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--muted)", animation: `bounce 1s ease-in-out ${i * 0.2}s infinite` }} />
                ))}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {messages.length <= 2 && (
            <div style={{ padding: "0 12px 8px", display: "flex", flexWrap: "wrap", gap: 6 }}>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  style={{
                    background: "var(--bg3)",
                    border: "1px solid var(--border)",
                    borderRadius: 20,
                    padding: "4px 12px",
                    fontSize: "0.78rem",
                    color: "var(--muted)",
                    cursor: "pointer",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div style={{ padding: 12, borderTop: "1px solid var(--border)", display: "flex", gap: 8 }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask about Eveguel..."
              style={{
                flex: 1,
                background: "var(--bg3)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: "10px 14px",
                color: "var(--text)",
                fontSize: "0.88rem",
                outline: "none",
              }}
            />
            <button
              onClick={() => send()}
              disabled={loading || !input.trim()}
              style={{
                background: "var(--accent)",
                border: "none",
                borderRadius: 8,
                padding: "10px 16px",
                color: "#fff",
                cursor: "pointer",
                fontWeight: 600,
                opacity: loading || !input.trim() ? 0.5 : 1,
              }}
            >
              ↑
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </>
  );
}
