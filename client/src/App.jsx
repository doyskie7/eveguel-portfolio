import Background3D from "./components/Background3D";
import Hero from "./components/Hero";
import Skills from "./components/Skills";
import Experience from "./components/Experience";
import Contact from "./components/Contact";
import ChatAgent from "./components/ChatAgent";

export default function App() {
  return (
    <>
      <Background3D />
      <div style={{ position: "relative", zIndex: 1 }}>
        <Hero />
        <Skills />
        <Experience />
        <Contact />
      </div>
      <ChatAgent />
    </>
  );
}
