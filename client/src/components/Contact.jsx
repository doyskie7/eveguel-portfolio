export default function Contact() {
  return (
    <section id="contact" style={{ textAlign: "center" }}>
      <h2 className="section-title" style={{ textAlign: "center" }}>
        Get in <span>Touch</span>
      </h2>
      <p style={{ color: "var(--muted)", maxWidth: 480, margin: "0 auto 32px", fontSize: "1rem" }}>
        Available for freelance projects, full-time roles, and consulting on automation & AI integrations.
      </p>
      <a
        href="mailto:eveguelfreelancer@gmail.com"
        style={{
          display: "inline-block",
          background: "var(--accent)",
          color: "#fff",
          padding: "14px 36px",
          borderRadius: "var(--radius)",
          fontWeight: 600,
          fontSize: "1rem",
          textDecoration: "none",
        }}
      >
        eveguelfreelancer@gmail.com
      </a>
      <div style={{ marginTop: 32, display: "flex", justifyContent: "center", gap: 24, color: "var(--muted)", fontSize: "0.9rem" }}>
        <a href="https://eveguelfreelancer.com" target="_blank" rel="noreferrer">Website</a>
        <a href="https://www.linkedin.com" target="_blank" rel="noreferrer">LinkedIn</a>
        <a href="https://github.com/doyskie7" target="_blank" rel="noreferrer">GitHub</a>
      </div>
      <p style={{ marginTop: 60, color: "var(--border)", fontSize: "0.8rem" }}>
        © {new Date().getFullYear()} Eveguel Arocha. Built with React & Claude AI.
      </p>
    </section>
  );
}
