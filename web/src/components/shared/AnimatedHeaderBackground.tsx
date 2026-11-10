"use client";

import { useEffect, useRef } from "react";
import {
  PAGE_HEADER_THEMES,
  type PageHeaderTheme,
  type ParticleTone,
} from "@/components/shared/page-header-themes";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseAlpha: number;
  pulseSpeed: number;
  pulsePhase: number;
  color: ParticleTone;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
}

interface AnimatedHeaderBackgroundProps {
  theme?: PageHeaderTheme;
}

export function AnimatedHeaderBackground({
  theme = "signals",
}: AnimatedHeaderBackgroundProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const themeConfig = PAGE_HEADER_THEMES[theme];

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
    const { particlePrimary, particleSecondary, ripple, line } = themeConfig;

    const initParticles = () => {
      particles.length = 0;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const rand = Math.random();
        const color: ParticleTone =
          rand > 0.78 ? "primary" : rand > 0.58 ? "secondary" : "white";
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

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (particles.length === 0) {
        initParticles();
      }
    };

    handleResize();

    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(container);

    let isRunning = false;
    let lastTime = performance.now();

    const startLoop = () => {
      if (!isRunning && isVisible) {
        isRunning = true;
        lastTime = performance.now();
        animId = requestAnimationFrame(render);
      }
    };

    const stopLoop = () => {
      isRunning = false;
      cancelAnimationFrame(animId);
    };

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          startLoop();
        } else {
          stopLoop();
        }
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

    const render = (time: number) => {
      if (!isVisible) {
        isRunning = false;
        return;
      }

      const delta = Math.min((time - lastTime) / 16.67, 2);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      if (mouse.active) {
        mouse.x += (mouse.targetX - mouse.x) * 0.15;
        mouse.y += (mouse.targetY - mouse.y) * 0.15;
      } else {
        mouse.x = -1000;
        mouse.y = -1000;
      }

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
        ctx.strokeStyle = `rgba(${ripple}, ${Math.max(0, r.alpha * 0.25)})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (!prefersReducedMotion) {
          p.x += p.vx * delta;
          p.y += p.vy * delta;
          p.pulsePhase += p.pulseSpeed * delta;

          if (p.x < -10) p.x = width + 10;
          if (p.x > width + 10) p.x = -10;
          if (p.y < -10) p.y = height + 10;
          if (p.y > height + 10) p.y = -10;

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
        if (p.color === "primary") {
          fillStyle = `rgba(${particlePrimary}, ${finalAlpha * 1.2})`;
          glowStyle = `rgba(${particlePrimary}, ${finalAlpha * 0.55})`;
        } else if (p.color === "secondary") {
          fillStyle = `rgba(${particleSecondary}, ${finalAlpha * 1.1})`;
          glowStyle = `rgba(${particleSecondary}, ${finalAlpha * 0.45})`;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = glowStyle;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = fillStyle;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONNECT_DIST) {
            const lineAlpha = (1 - dist / CONNECT_DIST) * 0.14;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(${line}, ${lineAlpha})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    startLoop();

    return () => {
      stopLoop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerleave", onPointerLeave);
      container.removeEventListener("pointerdown", onPointerDown);
    };
  }, [themeConfig]);

  return (
    <div
      ref={containerRef}
      className="pointer-events-auto absolute inset-0 overflow-hidden touch-pan-y"
      aria-hidden
    >
      <div
        className={`header-orb-a pointer-events-none absolute -top-24 left-[12%] h-80 w-80 rounded-full ${themeConfig.orbA} blur-[100px]`}
      />
      <div
        className={`header-orb-b pointer-events-none absolute top-[5%] right-[10%] h-96 w-96 rounded-full ${themeConfig.orbB} blur-[120px]`}
      />
      <div
        className={`header-orb-c pointer-events-none absolute -bottom-20 left-[45%] h-72 w-72 rounded-full ${themeConfig.orbC} blur-[90px]`}
      />

      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255, 255, 255, 0.22) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full opacity-80"
      />
    </div>
  );
}
