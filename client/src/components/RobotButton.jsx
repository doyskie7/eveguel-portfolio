export default function RobotButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      title="Talk to Eveguel's AI"
      style={{
        position: "fixed",
        bottom: 32,
        right: 32,
        width: 68,
        height: 68,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #6366f1, #4f46e5)",
        border: "2px solid #818cf8",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 0 24px rgba(99,102,241,0.5), 0 4px 16px rgba(0,0,0,0.4)",
        zIndex: 1000,
        padding: 0,
        animation: "robotPulse 3s ease-in-out infinite",
      }}
    >
      <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Antenna */}
        <line x1="19" y1="2" x2="19" y2="7" stroke="#c7d2fe" strokeWidth="2" strokeLinecap="round" />
        <circle cx="19" cy="2" r="2" fill="#a5b4fc" />
        {/* Head */}
        <rect x="7" y="8" width="24" height="20" rx="4" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1.5" />
        {/* Eyes */}
        <rect x="11" y="13" width="6" height="5" rx="1.5" fill="#6366f1" />
        <rect x="21" y="13" width="6" height="5" rx="1.5" fill="#6366f1" />
        <circle cx="14" cy="15.5" r="1.5" fill="#c7d2fe" />
        <circle cx="24" cy="15.5" r="1.5" fill="#c7d2fe" />
        {/* Mouth */}
        <rect x="12" y="22" width="14" height="3" rx="1.5" fill="#4f46e5" />
        <rect x="14" y="22" width="2" height="3" rx="0.5" fill="#818cf8" />
        <rect x="18" y="22" width="2" height="3" rx="0.5" fill="#818cf8" />
        <rect x="22" y="22" width="2" height="3" rx="0.5" fill="#818cf8" />
        {/* Body */}
        <rect x="12" y="30" width="14" height="6" rx="2" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1.2" />
        {/* Ears */}
        <rect x="4" y="14" width="3" height="6" rx="1.5" fill="#4f46e5" />
        <rect x="31" y="14" width="3" height="6" rx="1.5" fill="#4f46e5" />
      </svg>
      <style>{`
        @keyframes robotPulse {
          0%, 100% { box-shadow: 0 0 24px rgba(99,102,241,0.5), 0 4px 16px rgba(0,0,0,0.4); }
          50% { box-shadow: 0 0 40px rgba(99,102,241,0.8), 0 4px 24px rgba(0,0,0,0.5); }
        }
      `}</style>
    </button>
  );
}
