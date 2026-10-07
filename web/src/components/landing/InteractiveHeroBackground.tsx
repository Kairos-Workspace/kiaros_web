"use client";

import { useEffect, useRef, useState } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseAlpha: number;
  pulsePhase: number;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
}

export function InteractiveHeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [coords, setCoords] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current?.parentElement;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let isVisible = true;

    // Mouse tracking with smooth lerp
    const mouse = {
      x: -1000,
      y: -1000,
      targetX: -1000,
      targetY: -1000,
      active: false,
    };

    const ripples: Ripple[] = [];
    const particles: Particle[] = [];
    const PARTICLE_COUNT = 55;
    const GRID_SPACING = 48;

    const initParticles = () => {
      particles.length = 0;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.45,
          vy: (Math.random() - 0.5) * 0.45,
          radius: Math.random() * 1.5 + 1.2,
          baseAlpha: Math.random() * 0.35 + 0.2,
          pulsePhase: Math.random() * Math.PI * 2,
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

    // Pointer events on hero section container
    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      mouse.targetX = x;
      mouse.targetY = y;
      mouse.active = true;
      setCoords({ x: Math.round(x), y: Math.round(y) });
    };

    const onPointerLeave = () => {
      mouse.active = false;
      mouse.targetX = -1000;
      mouse.targetY = -1000;
      setCoords(null);
    };

    const onPointerDown = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      ripples.push({
        x,
        y,
        radius: 0,
        maxRadius: 180,
        alpha: 0.4,
      });

      // Scatter nearby particles slightly on click
      for (const p of particles) {
        const dx = p.x - x;
        const dy = p.y - y;
        const dist = Math.hypot(dx, dy);
        if (dist < 180 && dist > 0) {
          const force = (180 - dist) / 180;
          p.vx += (dx / dist) * force * 1.8;
          p.vy += (dy / dist) * force * 1.8;
        }
      }
    };

    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerleave", onPointerLeave);
    container.addEventListener("pointerdown", onPointerDown);

    // Visibility observer to pause animation when tab/section offscreen
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    intersectionObserver.observe(container);

    let tick = 0;

    // Render loop
    const render = () => {
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      tick += 0.015;

      // Smooth mouse lerp
      if (mouse.active) {
        mouse.x += (mouse.targetX - mouse.x) * 0.12;
        mouse.y += (mouse.targetY - mouse.y) * 0.12;
      } else {
        mouse.x += (mouse.targetX - mouse.x) * 0.05;
        mouse.y += (mouse.targetY - mouse.y) * 0.05;
      }

      ctx.clearRect(0, 0, width, height);

      // 1. Draw Subtle Institutional Coordinate Dot Grid
      const cols = Math.ceil(width / GRID_SPACING);
      const rows = Math.ceil(height / GRID_SPACING);

      for (let i = 0; i <= cols; i++) {
        for (let j = 0; j <= rows; j++) {
          const gx = i * GRID_SPACING;
          const gy = j * GRID_SPACING;

          // Determine distance to mouse cursor for proximity highlight
          let alpha = 0.035;
          if (mouse.active) {
            const dist = Math.hypot(gx - mouse.x, gy - mouse.y);
            if (dist < 220) {
              const boost = (1 - dist / 220) * 0.14;
              alpha += boost;
            }
          }

          ctx.fillStyle = `rgba(16, 16, 20, ${alpha})`;
          ctx.beginPath();
          ctx.arc(gx, gy, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 2. Interactive Crosshair Lines (Trading Terminal HUD)
      if (mouse.active && mouse.x > 0 && mouse.y > 0) {
        // Vertical crosshair
        ctx.strokeStyle = "rgba(24, 24, 27, 0.08)";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        ctx.moveTo(mouse.x, 0);
        ctx.lineTo(mouse.x, height);
        ctx.stroke();

        // Horizontal crosshair
        ctx.beginPath();
        ctx.moveTo(0, mouse.y);
        ctx.lineTo(width, mouse.y);
        ctx.stroke();
        ctx.setLineDash([]); // Reset line dash

        // Radial flashlight glow around cursor
        const radialGlow = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          260
        );
        radialGlow.addColorStop(0, "rgba(24, 24, 27, 0.05)");
        radialGlow.addColorStop(0.5, "rgba(24, 24, 27, 0.015)");
        radialGlow.addColorStop(1, "rgba(24, 24, 27, 0)");
        ctx.fillStyle = radialGlow;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 260, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Process & Draw Expanding Click Ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += 2.5;
        r.alpha -= 0.01;

        if (r.alpha <= 0 || r.radius >= r.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.strokeStyle = `rgba(24, 24, 27, ${Math.max(0, r.alpha * 0.5)})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 4. Update & Draw Particles (Quantitative Nodes)
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Natural movement
        p.x += p.vx;
        p.y += p.vy;

        // Friction for click scatter
        p.vx *= 0.985;
        p.vy *= 0.985;
        if (Math.abs(p.vx) < 0.15) p.vx = (Math.random() - 0.5) * 0.45;
        if (Math.abs(p.vy) < 0.15) p.vy = (Math.random() - 0.5) * 0.45;

        // Boundary wrapping
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Mouse attraction/deflection physics
        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.hypot(dx, dy);
          const maxDist = 150;

          if (dist < maxDist && dist > 5) {
            // Subtle magnetic orbital drift
            const factor = (1 - dist / maxDist) * 0.025;
            p.vx += dx * factor;
            p.vy += dy * factor;

            // Connect line from mouse to particle
            const lineAlpha = (1 - dist / maxDist) * 0.28;
            ctx.strokeStyle = `rgba(15, 23, 42, ${lineAlpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(mouse.x, mouse.y);
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
          }
        }

        // Pulse alpha
        const currentAlpha =
          p.baseAlpha + Math.sin(tick * 2 + p.pulsePhase) * 0.12;

        // Draw particle node
        ctx.fillStyle = `rgba(24, 24, 27, ${Math.max(0.1, currentAlpha)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        // Connect nearby particles (Orderflow mesh)
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.hypot(dx, dy);

          if (dist < 90) {
            const edgeAlpha = (1 - dist / 90) * 0.08;
            ctx.strokeStyle = `rgba(24, 24, 27, ${edgeAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
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
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="block h-full w-full"
      />

      {/* Subtle live coordinate telemetry badge in bottom corner */}
      {coords && (
        <div className="pointer-events-none absolute bottom-4 right-4 hidden font-mono text-[10px] tracking-widest text-zinc-400 sm:block">
          <span className="opacity-60">GRID.LOC </span>
          <span className="font-semibold text-zinc-600">
            [{coords.x.toString().padStart(4, "0")}, {coords.y.toString().padStart(4, "0")}]
          </span>
          <span className="ml-2.5 opacity-60">STP.LATENCY </span>
          <span className="font-semibold text-emerald-600">4.2ms</span>
        </div>
      )}
    </div>
  );
}
