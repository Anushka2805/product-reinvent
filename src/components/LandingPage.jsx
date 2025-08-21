import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

/* -------------------------
  Hover spark overlay (keeps behaviour)
   - Unchanged: per-card hover spark visual
------------------------- */
function HoverSparks() {
  return (
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
      <svg
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        stroke="rgba(34,211,238,0.95)"
        strokeWidth="1.6"
      >
        <circle cx="12%" cy="18%" r="2" />
        <circle cx="35%" cy="70%" r="1.6" />
        <circle cx="58%" cy="22%" r="2" />
        <circle cx="80%" cy="62%" r="1.6" />
        <circle cx="90%" cy="18%" r="2" />
      </svg>
    </div>
  );
}

/* -------------------------
  SquareCard - keeps grid aligned
------------------------- */
function SquareCard({ src, alt, ring = "ring-cyan-400/60", glow = "shadow-[0_0_22px_rgba(34,211,238,0.65)]" }) {
  return (
    <div className={`relative w-full rounded-2xl overflow-hidden bg-white/5 backdrop-blur-md ring-2 ${ring} transition-all group`}>
      <div className="pb-[100%]" />
      <img src={src} alt={alt} className="absolute inset-0 w-full h-full object-cover" draggable="false" />
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300 ${glow}`} />
      <HoverSparks />
    </div>
  );
}

/* -------------------------
  Particle-based smoke system (canvas)
  - Spawns on mousemove and on scroll
  - Soft, glowing, subtle
  - Particle pooling and cap for performance
------------------------- */
function SmokeCanvas({ enabled = true }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);
  const poolRef = useRef([]);
  const lastTimeRef = useRef(performance.now());
  const [size, setSize] = useState({ w: 0, h: 0 });

  // configuration
  const MAX_PARTICLES = 120;
  const SPAWN_PER_EVENT = 2; // per mouse move / scroll event
  const SMOKE_COLORS = [
    "rgba(40,200,255,0.06)",
    "rgba(200,120,255,0.05)",
    "rgba(80,230,220,0.045)"
  ];

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      setSize({ w, h });
    };
    resize();
    window.addEventListener("resize", resize);

    // particle factory (recycles from pool)
    function spawnSmoke(x, y) {
      if (particlesRef.current.length >= MAX_PARTICLES) return;
      const p = poolRef.current.pop() || {};
      p.x = x + (Math.random() - 0.5) * 30;
      p.y = y + (Math.random() - 0.5) * 20;
      p.vx = (Math.random() - 0.5) * 0.15;
      p.vy = -0.2 - Math.random() * 0.6; // upward
      p.size = 18 + Math.random() * 40;
      p.life = 0;
      p.lifeMax = 1400 + Math.random() * 900; // ms
      p.rotation = (Math.random() - 0.5) * 0.6;
      p.color = SMOKE_COLORS[Math.floor(Math.random() * SMOKE_COLORS.length)];
      p.alpha = 0.7 + Math.random() * 0.08;
      particlesRef.current.push(p);
    }

    // create on movement or scroll
    let lastSpawn = 0;
    function onMove(e) {
      const now = performance.now();
      if (now - lastSpawn > 12) {
        for (let i = 0; i < SPAWN_PER_EVENT; i++) spawnSmoke(e.clientX, e.clientY);
        lastSpawn = now;
      }
    }
    function onScroll() {
      // spawn near center-bottom to emulate smokey scroll trail
      const x = window.innerWidth * (0.4 + Math.random() * 0.2);
      const y = window.innerHeight * (0.8 + Math.random() * 0.15);
      for (let i = 0; i < 4; i++) spawnSmoke(x + (Math.random() - 0.5) * 100, y + Math.random() * 30);
    }
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    // animation loop
    function frame(now) {
      const dt = now - lastTimeRef.current;
      lastTimeRef.current = now;

      // clear very softly for trailing smoky look
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // render particles
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life += dt;
        const t = p.life / p.lifeMax;

        // update
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= 0.995;
        p.vy -= 0.00005 * dt; // gently accelerate upward
        p.rotation += (Math.random() - 0.5) * 0.01;

        // size and alpha curve (ease-out)
        const size = p.size * (1 + t * 1.4);
        const alpha = Math.max(0, p.alpha * (1 - t));

        // draw soft radial gradient
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size);
        const color = p.color.replace(/[\d.]+\)$/g, `${alpha})`); // replace alpha
        grd.addColorStop(0, color);
        grd.addColorStop(0.6, p.color.replace(/[\d.]+\)$/g, `${alpha * 0.45})`));
        grd.addColorStop(1, p.color.replace(/[\d.]+\)$/g, `0)`));

        ctx.globalCompositeOperation = "lighter";
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, size, size * 0.7, p.rotation, 0, Math.PI * 2);
        ctx.fill();

        // recycle
        if (p.life >= p.lifeMax || p.y < -100 || p.x < -200 || p.x > size.w + 200) {
          particles.splice(i, 1);
          poolRef.current.push(p);
        }
      }

      animationRef.current = requestAnimationFrame(frame);
    }
    animationRef.current = requestAnimationFrame(frame);

    // cleanup
    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, [enabled]);

  // canvas is full viewport fixed, pointer-events none so it doesn't interfere
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[60]" />;
}

/* -------------------------
  Motion variants used for structured animation
------------------------- */
const fadeUp = {
  hidden: { opacity: 0, y: 36 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: "easeOut" },
  }),
};

/* -------------------------
  Main component (LandingPage)
  - Keeps structure aligned and everything else untouched
  - Only: video moved into Explore section
  - Added SmokeCanvas overlay (global)
------------------------- */
export default function LandingPage() {
  const firstRow = [
    { src: "/prod2.jpg", label: "ThreadFury" },
    { src: "/prod3.jpg", label: "DripNest" },
    { src: "/prod4.jpg", label: "VibeStitch" },
    { src: "/prod5.jpg", label: "NoChill Tees" },
    { src: "/prod11.jpg", label: "CoolCruck" },
  ];

  const secondRow = [
    { src: "/prod6.jpg", label: "NeonNude" },
    { src: "/prod7.jpg", label: "Savage Cotton" },
    { src: "/prod8.jpg", label: "INK'D" },
    { src: "/prod9.jpg", label: "DripNest" },
    { src: "/prod10.jpg", label: "VibeStitch" },
  ];

  return (
    <div className="relative min-h-screen bg-black text-white overflow-x-hidden font-sans">
      {/* Smoke canvas active globally on hover & scroll */}
      <SmokeCanvas enabled={true} />

      {/* HERO (unchanged) */}
      <section className="w-full min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
        <motion.h1
          initial={{ opacity: 0, y: -46 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          className="text-6xl font-extrabold mb-5 bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-purple-500 bg-clip-text text-transparent drop-shadow-[0_0_26px_rgba(34,211,238,0.85)]"
        >
          Welcome to XOLO
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.9 }}
          className="text-lg max-w-xl text-cyan-100/95 drop-shadow-[0_0_14px_rgba(34,211,238,0.65)]"
        >
          Explore categories like T-shirts, Shoes, Fashion & more with us.
        </motion.p>
      </section>

      {/* EXPLORE SECTION: VIDEO ONLY HERE, with dark overlay + glowy cards */}
      <section className="relative w-full py-16">
        {/* Video background for Explore only */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
          src="/main-vid.mp4"
        />
        {/* Strong dark overlay so white video doesn't wash out the UI */}
        <div className="absolute inset-0 bg-black/72 z-10" />

        {/* Content above overlay */}
        <div className="relative z-20 max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-cyan-200 drop-shadow-[0_0_18px_rgba(34,211,238,0.75)] mb-10">
            Explore Our Collections
          </h2>

          {/* Row 1: exact 5 columns to ensure alignment */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="grid grid-cols-5 gap-6"
          >
            {firstRow.map((item, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={fadeUp}
                whileHover={{ scale: 1.035 }}
                className="cursor-pointer"
              >
                <SquareCard src={item.src} alt={item.label} />
                <p className="mt-3 text-sm text-center font-semibold text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.7)]">
                  {item.label}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Middle contained logo video */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="w-full h-[300px] my-12 rounded-2xl overflow-hidden shadow-[0_0_34px_rgba(34,211,238,0.6)] ring-2 ring-cyan-400/60 bg-white/5 backdrop-blur-md"
          >
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-contain"
              src="/logo2.mp4"
            />
          </motion.div>

          {/* Row 2: same 5-column grid (perfect alignment) */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="grid grid-cols-5 gap-6 pb-6"
          >
            {secondRow.map((item, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={fadeUp}
                whileHover={{ scale: 1.05 }}
                className="cursor-pointer"
              >
                <SquareCard
                  src={item.src}
                  alt={item.label}
                  ring="ring-fuchsia-400/60"
                  glow="shadow-[0_0_24px_rgba(217,70,239,0.6)]"
                />
                <p className="mt-3 text-sm text-center font-semibold text-fuchsia-300 drop-shadow-[0_0_8px_rgba(217,70,239,0.7)]">
                  {item.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FOOTER (unchanged) */}
      <footer className="border-t border-white/15">
        <div className="flex flex-col items-center py-6">
          <img
            src="/logo.jpg"
            alt="XOLO Logo"
            className="w-20 h-20 mb-4 rounded-full shadow-[0_0_22px_rgba(34,211,238,0.7)]"
          />
          <div className="w-full overflow-hidden whitespace-nowrap border-t border-white/10 py-2">
            <motion.div
              animate={{ x: ["100%", "-100%"] }}
              transition={{ repeat: Infinity, duration: 24, ease: "linear" }}
              className="inline-block px-10 text-sm text-cyan-300 font-mono drop-shadow-[0_0_10px_rgba(34,211,238,0.65)]"
            >
              📞 Mobile: XXXXOLOOOO &nbsp;&nbsp;&nbsp; 📍 Address: Saturn XOOL &nbsp;&nbsp;&nbsp; 📞 Mobile: XXXXOLOOOO &nbsp;&nbsp;&nbsp; 📍 Address: Saturn XOOL
            </motion.div>
          </div>
        </div>
      </footer>

      {/* Hide horizontal scrollbar if any */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
