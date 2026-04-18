import { useState } from "react";
import Background3D from "./components/Background3D";
import Hero from "./components/Hero";
import Skills from "./components/Skills";
import Experience from "./components/Experience";
import Contact from "./components/Contact";
import RobotButton from "./components/RobotButton";
import AIChatPage from "./components/AIChatPage";

export default function App() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      <Background3D />
      <div style={{ position: "relative", zIndex: 1 }}>
        <Hero />
        <Skills />
        <Experience />
        <Contact />
      </div>
      {!chatOpen && <RobotButton onClick={() => setChatOpen(true)} />}
      {chatOpen && <AIChatPage onClose={() => setChatOpen(false)} />}
    </>
  );
}
