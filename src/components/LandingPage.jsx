// src/components/LandingPage.jsx

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Lenis from '@studio-freight/lenis';

/* -------------------------
  Add to Cart Button (+)
------------------------- */
function AddToCartButton({ onClick }) {
  return (
    <motion.button
      onClick={onClick}
      className="absolute top-3 right-3 z-30 w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white cursor-pointer"
      whileHover={{ scale: 1.1, rotate: 90 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-4 h-4"
      >
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
    </motion.button>
  );
}

/* -------------------------
  Hover Sparks
------------------------- */
function HoverSparks() {
  return (
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
      <svg
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        stroke="rgba(167, 139, 250, 0.9)"
        strokeWidth="1.5"
      >
        <circle cx="12%" cy="18%" r="1.5" />
        <circle cx="35%" cy="70%" r="1" />
        <circle cx="58%" cy="22%" r="1.5" />
        <circle cx="80%" cy="62%" r="1" />
        <circle cx="90%" cy="18%" r="1.5" />
      </svg>
    </div>
  );
}

/* -------------------------
  Square Card Component
------------------------- */
function SquareCard({ src, alt, onAddToCart, ring = "ring-purple-400/50", glow = "shadow-[0_0_20px_rgba(167,139,250,0.5)]" }) {
  return (
    <div className={`relative w-full rounded-2xl overflow-hidden bg-black/30 backdrop-blur-sm ring-1 ${ring} transition-all group`}>
      <div className="absolute top-0 right-0 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <AddToCartButton onClick={onAddToCart} />
      </div>
      <div className="pb-[100%]" />
      <img src={src} alt={alt} className="absolute inset-0 w-full h-full object-cover" draggable="false" />
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${glow}`} />
      <HoverSparks />
    </div>
  );
}

/* -------------------------
  Smoke Canvas (Refined Effect)
------------------------- */
function SmokeCanvas({ enabled = true }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);
  const poolRef = useRef([]);
  const lastTimeRef = useRef(performance.now());
  const [size, setSize] = useState({ w: 0, h: 0 });

  const MAX_PARTICLES = 80;
  const SPAWN_PER_EVENT = 2;
  const SMOKE_COLORS = [
    "rgba(200, 200, 200, 0.02)",
    "rgba(150, 150, 150, 0.03)",
    "rgba(120, 120, 120, 0.025)",
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
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      setSize({ w, h });
    };
    resize();
    window.addEventListener("resize", resize);

    function spawnSmoke(x, y) {
      if (particlesRef.current.length >= MAX_PARTICLES) return;
      const p = poolRef.current.pop() || {};
      p.x = x + (Math.random() - 0.5) * 40;
      p.y = y + (Math.random() - 0.5) * 30;
      p.vx = (Math.random() - 0.5) * 0.1;
      p.vy = -0.1 - Math.random() * 0.3;
      p.size = 25 + Math.random() * 50;
      p.life = 0;
      p.lifeMax = 2000 + Math.random() * 1500;
      p.rotation = Math.random() * Math.PI * 2;
      p.color = SMOKE_COLORS[Math.floor(Math.random() * SMOKE_COLORS.length)];
      p.alpha = 0.6 + Math.random() * 0.1;
      particlesRef.current.push(p);
    }

    let lastSpawn = 0;
    function onMove(e) {
      const now = performance.now();
      if (now - lastSpawn > 16) {
        for (let i = 0; i < SPAWN_PER_EVENT; i++) spawnSmoke(e.clientX, e.clientY);
        lastSpawn = now;
      }
    }

    const lenis = new Lenis();
    const onScroll = () => {
      const x = window.innerWidth * (0.1 + Math.random() * 0.8);
      const y = window.innerHeight * 0.95;
      for (let i = 0; i < 4; i++) spawnSmoke(x, y);
    };
    lenis.on('scroll', onScroll);

    window.addEventListener("mousemove", onMove, { passive: true });

    function frame(now) {
      const dt = now - lastTimeRef.current;
      lastTimeRef.current = now;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life += dt;
        const t = p.life / p.lifeMax;

        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= 0.99;
        p.vy *= 0.998;

        const size = p.size * (1 + t * 1.5);
        const alpha = Math.max(0, p.alpha * (1 - t) * (1 - t));

        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size);
        const color = p.color.replace(/[\d.]+\)$/g, alpha + ")");
        grd.addColorStop(0, color);
        grd.addColorStop(1, p.color.replace(/[\d.]+\)$/g, "0)"));

        ctx.globalCompositeOperation = "lighter";
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, size, size, p.rotation, 0, Math.PI * 2);
        ctx.fill();

        if (p.life >= p.lifeMax || p.y < -100 || p.x < -200 || p.x > size.w + 200) {
          particles.splice(i, 1);
          poolRef.current.push(p);
        }
      }

      animationRef.current = requestAnimationFrame(frame);
    }
    animationRef.current = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      lenis.off('scroll', onScroll);
    };
  }, [enabled]);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50" />;
}

/* -------------------------
  Framer Motion Variants
------------------------- */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.65, ease: [0.25, 1, 0.5, 1] },
  }),
};

/* -------------------------
  Main Landing Page Component
------------------------- */
export default function LandingPage({ onAddToCart, onShowCheckout }) {
  const firstRow = [
    { id: 1, src: "/prod2.jpg", label: "ThreadFury" },
    { id: 2, src: "/prod3.jpg", label: "DripNest" },
    { id: 3, src: "/prod4.jpg", label: "VibeStitch" },
    { id: 4, src: "/prod5.jpg", label: "NoChill Tees" },
    { id: 5, src: "/prod11.jpg", label: "CoolCruck" },
  ];

  const secondRow = [
    { id: 6, src: "/prod6.jpg", label: "NeonNude" },
    { id: 7, src: "/prod7.jpg", label: "Savage Cotton" },
    { id: 8, src: "/prod8.jpg", label: "INK'D" },
    { id: 9, src: "/prod9.jpg", label: "DripNest" },
    { id: 10, src: "/prod10.jpg", label: "VibeStitch" },
  ];

  return (
    <div className="relative min-h-screen bg-black text-white overflow-x-hidden font-sans">
      <SmokeCanvas enabled={true} />

      <section className="relative w-full h-screen flex flex-col items-center justify-center text-center px-6">
        <video
          autoPlay loop muted playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
          src="/top-vid.mp4"
        />
        <div className="absolute inset-0 bg-black/60 z-10" />
        <div className="relative z-20">
          <motion.h1
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-5xl md:text-7xl font-black mb-4 tracking-tighter bg-gradient-to-br from-white via-neutral-300 to-white bg-clip-text text-transparent"
            style={{ textShadow: "0 4px 30px rgba(0, 0, 0, 0.4)" }}
          >
            Welcome to XOLO
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-base md:text-lg max-w-xl text-neutral-300"
            style={{ textShadow: "0 2px 15px rgba(0, 0, 0, 0.5)" }}
          >
            Explore categories like T-shirts, Shoes, Fashion & more with us.
          </motion.p>
        </div>
      </section>

      <section className="relative w-full py-20 md:py-32 bg-black">
        <div className="relative z-20 max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-neutral-100 mb-12 md:mb-16">
            Explore Our Collections
          </h2>

          <motion.div
            initial="hidden" whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6"
          >
            {firstRow.map((item, i) => (
              <motion.div
                key={item.id} custom={i} variants={fadeUp}
                whileHover={{ scale: 1.04, y: -5 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                <SquareCard src={item.src} alt={item.label} onAddToCart={() => onAddToCart(item)} />
                <p className="mt-3 text-sm text-center font-semibold text-black bg-white/90 rounded-full px-3 py-1 w-fit mx-auto shadow-md">
                  {item.label}
                </p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="w-full max-w-4xl h-auto aspect-video my-16 md:my-24 mx-auto rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(167,139,250,0.4)] ring-1 ring-purple-400/50 bg-black/30 backdrop-blur-sm"
          >
            <video
              autoPlay loop muted playsInline
              className="w-full h-full object-cover"
              src="/main-vid.mp4"
            />
          </motion.div>

          <motion.div
            initial="hidden" whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6"
          >
            {secondRow.map((item, i) => (
              <motion.div
                key={item.id} custom={i} variants={fadeUp}
                whileHover={{ scale: 1.04, y: -5 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                <SquareCard
                  src={item.src} alt={item.label} onAddToCart={() => onAddToCart(item)}
                  ring="ring-pink-400/50"
                  glow="shadow-[0_0_20px_rgba(236,72,153,0.5)]"
                />
                <p className="mt-3 text-sm text-center font-semibold text-black bg-white/90 rounded-full px-3 py-1 w-fit mx-auto shadow-md">
                  {item.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-black">
        <div className="flex flex-col items-center py-12 md:py-16">
          <img
            src="/logo.jpg" alt="XOLO Logo"
            className="w-20 h-20 mb-6 rounded-full shadow-[0_0_25px_rgba(167,139,250,0.5)]"
          />
          <p className="mb-8 text-sm text-neutral-400 font-mono tracking-wider">
            Built by "Byte Builders"
          </p>
          <motion.button
            onClick={onShowCheckout}
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg shadow-lg"
            whileHover={{ scale: 1.05, boxShadow: "0px 0px 20px rgba(236, 72, 153, 0.6)" }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          >
            Order Now
          </motion.button>
        </div>
      </footer>
    </div>
  );
}
