import { useState, useEffect } from "react";

const roles = [
  "Full Stack Developer",
  "Automation Engineer",
  "AI Integration Specialist",
];

export default function Hero() {
  const [roleIndex, setRoleIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    const target = roles[roleIndex];
    if (typing) {
      if (displayed.length < target.length) {
        const t = setTimeout(() => setDisplayed(target.slice(0, displayed.length + 1)), 60);
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => setTyping(false), 2000);
        return () => clearTimeout(t);
      }
    } else {
      if (displayed.length > 0) {
        const t = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 30);
        return () => clearTimeout(t);
      } else {
        setRoleIndex((i) => (i + 1) % roles.length);
        setTyping(true);
      }
    }
  }, [displayed, typing, roleIndex]);

  return (
    <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", paddingTop: 0 }}>
      <div>
        <p style={{ color: "var(--accent2)", fontWeight: 500, marginBottom: 12, fontSize: "0.95rem" }}>
          Hi, I'm
        </p>
        <h1 style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", fontWeight: 700, lineHeight: 1.1, marginBottom: 16 }}>
          Eveguel Arocha
        </h1>
        <div style={{ fontSize: "clamp(1.2rem, 3vw, 1.8rem)", color: "var(--muted)", marginBottom: 28, minHeight: "2.4rem" }}>
          <span style={{ color: "var(--accent2)" }}>{displayed}</span>
          <span style={{ animation: "blink 1s step-end infinite", color: "var(--accent2)" }}>|</span>
        </div>
        <p style={{ maxWidth: 560, color: "var(--muted)", marginBottom: 36, fontSize: "1.05rem" }}>
          6+ years building scalable web apps, automation workflows, and AI-powered solutions.
          I turn complex business problems into clean, working software.
        </p>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <a
            href="mailto:eveguelfreelancer@gmail.com"
            style={{
              background: "var(--accent)",
              color: "#fff",
              padding: "12px 28px",
              borderRadius: "var(--radius)",
              fontWeight: 600,
              textDecoration: "none",
              transition: "opacity .2s",
            }}
            onMouseOver={(e) => (e.target.style.opacity = 0.85)}
            onMouseOut={(e) => (e.target.style.opacity = 1)}
          >
            Hire Me
          </a>
          <a
            href="#experience"
            style={{
              border: "1px solid var(--border)",
              color: "var(--text)",
              padding: "12px 28px",
              borderRadius: "var(--radius)",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            View Work
          </a>
        </div>

        <style>{`@keyframes blink { 50% { opacity: 0; } }`}</style>
      </div>
    </section>
  );
}
