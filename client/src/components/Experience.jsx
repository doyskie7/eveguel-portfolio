const jobs = [
  {
    title: "Full Stack Developer",
    company: "Boolean — Review Software & Automation Consulting",
    period: "Oct 2023 – Present",
    type: "Remote",
    bullets: [
      "Builds and maintains PERN stack web applications for scalable business solutions",
      "Designs automation workflows using Make.com, Prismatic, and HubSpot/Airtable APIs",
      "Manages Google Cloud deployments, CI/CD pipelines, and production infrastructure",
      "Integrates AI solutions using OpenAI and Claude APIs",
    ],
    tags: ["React", "Node.js", "TypeScript", "PostgreSQL", "Make.com", "Prismatic", "Google Cloud", "OpenAI"],
    accent: "#6366f1",
  },
  {
    title: "Senior Software Engineer",
    company: "MDI Novare",
    period: "May 2023 – Dec 2024",
    type: "Remote",
    bullets: [
      "Led development on Bayad Center, Komo App, and MDI HR Management System",
      "Delivered full-stack features using React, Node.js, Python, MySQL, and MongoDB",
      "Managed GitHub workflows and provided weekly progress updates to stakeholders",
    ],
    tags: ["React", "Node.js", "Python", "MySQL", "MongoDB", "AWS"],
    accent: "#22c55e",
  },
  {
    title: "Full Stack Developer",
    company: "Noforgeti Ltd.",
    period: "Nov 2022 – May 2023",
    type: "Remote",
    bullets: [
      "Built web and mobile applications using React, Node.js, Express, Socket.io, and Ionic",
      "Implemented real-time features and ensured continuous integration via GitHub",
    ],
    tags: ["React", "Node.js", "Socket.io", "Ionic", "Express"],
    accent: "#f59e0b",
  },
  {
    title: "Full Stack Developer",
    company: "Hiraya",
    period: "Apr 2022 – May 2023",
    type: "Remote",
    bullets: [
      "Built internal web applications using React, Node.js, and MeteorJs",
      "Handled deployment to testing environments and participated in strategy meetings",
    ],
    tags: ["React", "Node.js", "MeteorJs", "Express"],
    accent: "#ec4899",
  },
  {
    title: "Web Developer / Programmer",
    company: "A2BHQ",
    period: "Nov 2019 – Jun 2022",
    type: "Remote",
    bullets: [
      "Delivered automation solutions connecting Podio CRM to web apps",
      "Built web crawler, Skype bot notification system, and automated image extraction",
      "Worked across React, MeteorJs, VueJs, Python, C#, and Azure",
    ],
    tags: ["React", "VueJs", "MeteorJs", "Python", "C#", "Azure"],
    accent: "#06b6d4",
  },
];

export default function Experience() {
  return (
    <section id="experience">
      <h2 className="section-title">
        Work <span>Experience</span>
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {jobs.map((job) => (
          <div
            key={job.company}
            style={{
              background: "var(--bg2)",
              border: "1px solid var(--border)",
              borderLeft: `3px solid ${job.accent}`,
              borderRadius: "var(--radius)",
              padding: 28,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 6 }}>
              <div>
                <h3 style={{ fontWeight: 700, fontSize: "1.05rem" }}>{job.title}</h3>
                <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>{job.company}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "0.85rem", color: job.accent, fontWeight: 600 }}>{job.period}</span>
                <p style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{job.type}</p>
              </div>
            </div>
            <ul style={{ marginTop: 12, paddingLeft: 18, color: "var(--muted)", fontSize: "0.9rem", display: "flex", flexDirection: "column", gap: 4 }}>
              {job.bullets.map((b) => <li key={b}>{b}</li>)}
            </ul>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 16 }}>
              {job.tags.map((t) => (
                <span
                  key={t}
                  style={{
                    background: "var(--bg3)",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    padding: "2px 10px",
                    fontSize: "0.78rem",
                    color: "var(--muted)",
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
