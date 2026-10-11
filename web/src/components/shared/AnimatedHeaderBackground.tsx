"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseAlpha: number;
  pulseSpeed: number;
  pulsePhase: number;
  color: "white" | "emerald" | "cyan";
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
}

export function AnimatedHeaderBackground() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = 0;
    let height = 0;
    let isVisible = true;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Mouse tracking
    const mouse = {
      x: -1000,
      y: -1000,
      targetX: -1000,
      targetY: -1000,
      active: false,
    };

    const particles: Particle[] = [];
    const ripples: Ripple[] = [];
    const PARTICLE_COUNT = 45;
    const CONNECT_DIST = 95;

    const initParticles = () => {
      particles.length = 0;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const rand = Math.random();
        const color = rand > 0.8 ? "emerald" : rand > 0.65 ? "cyan" : "white";
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          radius: Math.random() * 1.4 + 1.0,
          baseAlpha: Math.random() * 0.35 + 0.25,
          pulseSpeed: Math.random() * 0.02 + 0.01,
          pulsePhase: Math.random() * Math.PI * 2,
          color,
        });
      }
    };

    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);

      if (particles.length === 0) {
        initParticles();
      }
    };

    handleResize();

    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(container);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    intersectionObserver.observe(container);

    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
      mouse.active = true;
    };

    const onPointerLeave = () => {
      mouse.active = false;
      mouse.targetX = -1000;
      mouse.targetY = -1000;
    };

    const onPointerDown = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      ripples.push({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        radius: 0,
        maxRadius: Math.max(width, height) * 0.45,
        alpha: 0.5,
      });
    };

    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerleave", onPointerLeave);
    container.addEventListener("pointerdown", onPointerDown);

    let lastTime = performance.now();

    const render = (time: number) => {
      if (!isVisible) {
        animId = requestAnimationFrame(render);
        return;
      }

      const delta = Math.min((time - lastTime) / 16.67, 2);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      // Smooth mouse lerp
      if (mouse.active) {
        mouse.x += (mouse.targetX - mouse.x) * 0.15;
        mouse.y += (mouse.targetY - mouse.y) * 0.15;
      } else {
        mouse.x = -1000;
        mouse.y = -1000;
      }

      // Draw and update ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += 3.5 * delta;
        r.alpha -= 0.012 * delta;

        if (r.alpha <= 0 || r.radius >= r.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(52, 211, 153, ${Math.max(0, r.alpha * 0.25)})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      }

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (!prefersReducedMotion) {
          p.x += p.vx * delta;
          p.y += p.vy * delta;
          p.pulsePhase += p.pulseSpeed * delta;

          // Wrap edges smoothly
          if (p.x < -10) p.x = width + 10;
          if (p.x > width + 10) p.x = -10;
          if (p.y < -10) p.y = height + 10;
          if (p.y > height + 10) p.y = -10;

          // Interactive mouse repulsion/drift
          if (mouse.active) {
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const maxDist = 120;
            if (dist < maxDist && dist > 0) {
              const force = (1 - dist / maxDist) * 1.2;
              p.x += (dx / dist) * force * delta;
              p.y += (dy / dist) * force * delta;
            }
          }
        }

        const alphaMod = Math.sin(p.pulsePhase) * 0.2;
        const finalAlpha = Math.max(0.1, Math.min(0.85, p.baseAlpha + alphaMod));

        let fillStyle = `rgba(244, 244, 245, ${finalAlpha})`;
        let glowStyle = `rgba(244, 244, 245, ${finalAlpha * 0.4})`;
        if (p.color === "emerald") {
          fillStyle = `rgba(52, 211, 153, ${finalAlpha * 1.2})`;
          glowStyle = `rgba(16, 185, 129, ${finalAlpha * 0.6})`;
        } else if (p.color === "cyan") {
          fillStyle = `rgba(56, 189, 248, ${finalAlpha * 1.1})`;
          glowStyle = `rgba(6, 182, 212, ${finalAlpha * 0.5})`;
        }

        // Draw soft glow aura
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = glowStyle;
        ctx.fill();

        // Draw particle node
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = fillStyle;
        ctx.fill();

        // Constellation lines between nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONNECT_DIST) {
            const lineAlpha = (1 - dist / CONNECT_DIST) * 0.12;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${lineAlpha})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerleave", onPointerLeave);
      container.removeEventListener("pointerdown", onPointerDown);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="pointer-events-auto absolute inset-0 overflow-hidden"
      aria-hidden
    >
      {/* Floating Animated Ambient Glow Orbs */}
      <div
        className="pointer-events-none absolute -top-24 left-[12%] h-80 w-80 rounded-full bg-emerald-500/12 blur-[100px]"
        style={{
          animation: "orbFloat1 18s ease-in-out infinite alternate",
        }}
      />
      <div
        className="pointer-events-none absolute top-[5%] right-[10%] h-96 w-96 rounded-full bg-indigo-500/15 blur-[120px]"
        style={{
          animation: "orbFloat2 24s ease-in-out infinite alternate",
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-20 left-[45%] h-72 w-72 rounded-full bg-cyan-500/10 blur-[90px]"
        style={{
          animation: "orbFloat3 20s ease-in-out infinite alternate",
        }}
      />

      {/* Subtle Micro-Grid Technical Layer */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255, 255, 255, 0.22) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Interactive Floating Quant Particles Canvas */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full opacity-80"
      />

      {/* CSS Keyframes for the Floating Orbs */}
      <style jsx>{`
        @keyframes orbFloat1 {
          0% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          50% {
            transform: translate3d(50px, 35px, 0) scale(1.15);
          }
          100% {
            transform: translate3d(-35px, 20px, 0) scale(0.95);
          }
        }
        @keyframes orbFloat2 {
          0% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          50% {
            transform: translate3d(-60px, 40px, 0) scale(1.1);
          }
          100% {
            transform: translate3d(40px, -25px, 0) scale(0.92);
          }
        }
        @keyframes orbFloat3 {
          0% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          50% {
            transform: translate3d(-30px, -40px, 0) scale(1.2);
          }
          100% {
            transform: translate3d(35px, -15px, 0) scale(0.9);
          }
        }
      `}</style>
    </div>
  );
}
