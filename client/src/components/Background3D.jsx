import { useEffect, useRef } from "react";
import * as THREE from "three";

const PARTICLE_COUNT = 120;
const MAX_LINES = 600;
const CONNECT_DIST = 3.8;

export default function Background3D() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    let W = window.innerWidth;
    let H = window.innerHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 100);
    camera.position.z = 16;

    // Particles
    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: (Math.random() - 0.5) * 22,
      y: (Math.random() - 0.5) * 22,
      z: (Math.random() - 0.5) * 12,
      vx: (Math.random() - 0.5) * 0.007,
      vy: (Math.random() - 0.5) * 0.007,
      vz: (Math.random() - 0.5) * 0.004,
    }));

    const pPositions = new Float32Array(PARTICLE_COUNT * 3);
    const pGeometry = new THREE.BufferGeometry();
    pGeometry.setAttribute("position", new THREE.BufferAttribute(pPositions, 3));

    const pMaterial = new THREE.PointsMaterial({
      color: 0x818cf8,
      size: 0.1,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true,
    });
    scene.add(new THREE.Points(pGeometry, pMaterial));

    // Lines
    const lPositions = new Float32Array(MAX_LINES * 6);
    const lGeometry = new THREE.BufferGeometry();
    lGeometry.setAttribute("position", new THREE.BufferAttribute(lPositions, 3));
    const lMaterial = new THREE.LineBasicMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.25,
    });
    const lineSegments = new THREE.LineSegments(lGeometry, lMaterial);
    scene.add(lineSegments);

    // Mouse parallax
    let mouseX = 0;
    let mouseY = 0;
    const onMouseMove = (e) => {
      mouseX = (e.clientX / W - 0.5) * 2;
      mouseY = -(e.clientY / H - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMouseMove);

    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      let lineIdx = 0;

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        if (Math.abs(p.x) > 11) p.vx *= -1;
        if (Math.abs(p.y) > 11) p.vy *= -1;
        if (Math.abs(p.z) > 6) p.vz *= -1;

        pPositions[i * 3] = p.x;
        pPositions[i * 3 + 1] = p.y;
        pPositions[i * 3 + 2] = p.z;

        for (let j = i + 1; j < PARTICLE_COUNT && lineIdx < MAX_LINES; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dz = p.z - q.z;
          const dist2 = dx * dx + dy * dy + dz * dz;
          if (dist2 < CONNECT_DIST * CONNECT_DIST) {
            const base = lineIdx * 6;
            lPositions[base] = p.x;
            lPositions[base + 1] = p.y;
            lPositions[base + 2] = p.z;
            lPositions[base + 3] = q.x;
            lPositions[base + 4] = q.y;
            lPositions[base + 5] = q.z;
            lineIdx++;
          }
        }
      }

      pGeometry.attributes.position.needsUpdate = true;
      lGeometry.attributes.position.needsUpdate = true;
      lGeometry.setDrawRange(0, lineIdx * 2);

      // Slow auto-rotation + subtle mouse parallax
      scene.rotation.y += 0.0004 + mouseX * 0.00015;
      scene.rotation.x += 0.0002 + mouseY * 0.00015;

      renderer.render(scene, camera);
    };

    animate();

    const onResize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      renderer.setSize(W, H);
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      container.removeChild(renderer.domElement);
      renderer.dispose();
      pGeometry.dispose();
      lGeometry.dispose();
      pMaterial.dispose();
      lMaterial.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}
