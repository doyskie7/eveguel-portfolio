const groups = [
  {
    label: "Frontend",
    color: "#6366f1",
    skills: ["React", "Redux", "Zustand", "TypeScript", "VueJs", "MeteorJs", "HTML/CSS"],
  },
  {
    label: "Backend",
    color: "#22c55e",
    skills: ["Node.js", "Express", "Python", "C#", "PHP"],
  },
  {
    label: "Databases",
    color: "#f59e0b",
    skills: ["PostgreSQL", "MongoDB", "MySQL"],
  },
  {
    label: "Automation",
    color: "#ec4899",
    skills: ["Make.com", "Prismatic", "Zapier", "Airtable", "HubSpot API", "Gmail API", "SendGrid"],
  },
  {
    label: "AI & Integrations",
    color: "#8b5cf6",
    skills: ["Claude (Anthropic)", "OpenAI", "Socket.io", "Ionic"],
  },
  {
    label: "Cloud & DevOps",
    color: "#06b6d4",
    skills: ["Google Cloud", "AWS", "Azure", "GitHub", "GitLab"],
  },
];

export default function Skills() {
  return (
    <section id="skills">
      <h2 className="section-title">
        My <span>Skills</span>
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
        {groups.map((g) => (
          <div
            key={g.label}
            style={{
              background: "var(--bg2)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: 24,
            }}
          >
            <h3 style={{ fontSize: "0.85rem", fontWeight: 600, letterSpacing: "0.08em", color: g.color, marginBottom: 16, textTransform: "uppercase" }}>
              {g.label}
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {g.skills.map((s) => (
                <span
                  key={s}
                  style={{
                    background: "var(--bg3)",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    padding: "4px 12px",
                    fontSize: "0.85rem",
                    color: "var(--text)",
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
