"use client";

import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

const ease = [0.2, 0.8, 0.2, 1] as const;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

// where the head is allowed to go (svg units)
const HEAD = { minX: 96, maxX: 332, minY: 118, maxY: 356 };
const BASE = { x: 402, floor: 468 };
// the arc is one fixed-length rod out of the base post: the head can never
// leave its reach — pull too far and it slides along the taut-rod circle
const PIVOT = { x: 402, y: 400 };
const ROD = { max: 395, min: 150 };

const clampHead = (x: number, y: number) => {
  x = clamp(x, HEAD.minX, HEAD.maxX);
  y = clamp(y, HEAD.minY, HEAD.maxY);
  const dx = x - PIVOT.x;
  const dy = y - PIVOT.y;
  const d = Math.hypot(dx, dy) || 1;
  const r = clamp(d, ROD.min, ROD.max);
  if (r !== d) {
    x = clamp(PIVOT.x + (dx / d) * r, HEAD.minX, HEAD.maxX);
    y = clamp(PIVOT.y + (dy / d) * r, HEAD.minY, HEAD.maxY);
  }
  return { x, y };
};

const toPolar = (p: { x: number; y: number }) => ({ r: Math.hypot(p.x - PIVOT.x, p.y - PIVOT.y), a: Math.atan2(p.y - PIVOT.y, p.x - PIVOT.x) });

type FlexLampProps = {
  /** Starting head position in svg units. */
  defaultHead?: { x: number; y: number };
};

/**
 * The fully flexible Arc: grab the head and move it anywhere — up, down, left,
 * right. The sprung-steel arc bends to follow, and the light cone + floor pool
 * track the head. Every colored part reads the palette vars.
 */
// the guided intro: lift up-left, sweep right across, up-right, down low, settle
const TOUR: [number, number, number][] = [
  [112, 126, 950],
  [322, 196, 1250],
  [298, 130, 850],
  [142, 332, 1050],
  [160, 148, 900],
];

export function FlexLamp({ defaultHead = { x: 160, y: 148 } }: FlexLampProps) {
  const [head, setHead] = useState(defaultHead);
  const [dragging, setDragging] = useState(false);
  const [touring, setTouring] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const headLive = useRef(head);
  const tourRef = useRef<{ raf: number; cancelled: boolean } | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    headLive.current = head;
  }, [head]);

  const cancelTour = useCallback(() => {
    if (tourRef.current) {
      tourRef.current.cancelled = true;
      cancelAnimationFrame(tourRef.current.raf);
      tourRef.current = null;
    }
    setTouring(false);
  }, []);

  const runTour = useCallback(() => {
    if (tourRef.current) return;
    const run = { raf: 0, cancelled: false };
    tourRef.current = run;
    setTouring(true);
    const easeIO = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    let i = 0;
    let from = { ...headLive.current };
    let t0 = performance.now() + 150;
    const step = (now: number) => {
      if (run.cancelled) return;
      const [tx, ty, dur] = TOUR[i];
      const p = clamp((now - t0) / dur, 0, 1);
      const e = easeIO(p);
      // interpolate around the base, not through the air: the head swings
      // and the rod pays out, like actually bending the arc
      const A = toPolar(from);
      const B = toPolar({ x: tx, y: ty });
      const r = A.r + (B.r - A.r) * e;
      const a = A.a + (B.a - A.a) * e;
      setHead(clampHead(PIVOT.x + Math.cos(a) * r, PIVOT.y + Math.sin(a) * r));
      if (p >= 1) {
        i++;
        if (i >= TOUR.length) {
          tourRef.current = null;
          setTouring(false);
          return;
        }
        from = { x: tx, y: ty };
        t0 = now + 170;
      }
      run.raf = requestAnimationFrame(step);
    };
    run.raf = requestAnimationFrame(step);
  }, []);

  // play the guided demo once, when the lamp scrolls into view
  useEffect(() => {
    const el = svgRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !startedRef.current) {
          startedRef.current = true;
          runTour();
          io.disconnect();
        }
      },
      { threshold: 0.55 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [runTour]);

  // reels + replays can trigger it by hand
  useEffect(() => {
    const w = window as unknown as Record<string, unknown>;
    w.__lampTour = () => {
      cancelTour();
      runTour();
    };
  }, [cancelTour, runTour]);

  const { x: hx, y: hy } = head;
  const drop = BASE.floor - hy;
  const spread = drop * 0.34 + 16;
  const glow = lerp(0.75, 0.42, drop / 350); // lower head → tighter, brighter pool

  // sprung steel: near full reach the rod pulls taut (almost straight),
  // close to the base it folds into a deep bend
  const rodLen = Math.hypot(hx - PIVOT.x, hy - PIVOT.y);
  const bend = 0.25 + 0.75 * clamp((ROD.max - rodLen) / (ROD.max - ROD.min), 0, 1);
  const sx = (k: number) => BASE.x + (hx - BASE.x) * k;
  const sy = (k: number) => BASE.floor + (hy - BASE.floor) * k;
  const c1 = { x: sx(0.34) + (BASE.x - sx(0.34)) * bend, y: sy(0.34) + (hy + (BASE.floor - hy) * 0.3 - sy(0.34)) * bend };
  const c2 = { x: sx(0.68) + (hx + (BASE.x - hx) * 0.32 - sx(0.68)) * bend, y: sy(0.68) + (hy - 14 - sy(0.68)) * bend };
  const arc = `M${BASE.x} ${BASE.floor} C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${hx + 34} ${hy + 4}`;

  const fromEvent = useCallback((e: PointerEvent | React.PointerEvent) => {
    const box = svgRef.current?.getBoundingClientRect();
    if (!box) return;
    const x = ((e.clientX - box.left) / box.width) * 520;
    const y = ((e.clientY - box.top) / box.height) * 560;
    setHead(clampHead(x, y));
  }, []);

  useEffect(() => {
    if (!dragging) return;
    const move = (e: PointerEvent) => fromEvent(e);
    const up = () => setDragging(false);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [dragging, fromEvent]);

  return (
    <div className="relative select-none">
      <svg ref={svgRef} viewBox="0 0 520 560" fill="none" className="w-full touch-none">
        <defs>
          <linearGradient id="flex-cone" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--accent)" stopOpacity="0.6" />
            <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="flex-pool" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="var(--accent)" stopOpacity={glow} />
            <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* floor */}
        <line x1="24" y1={BASE.floor + 14} x2="496" y2={BASE.floor + 14} stroke="var(--border)" strokeWidth="2" />

        {/* light follows the head, horizontally too */}
        <path d={`M${hx} ${hy + 14} L${hx - spread} ${BASE.floor} L${hx + spread} ${BASE.floor} Z`} fill="url(#flex-cone)" />
        <ellipse cx={hx} cy={BASE.floor + 2} rx={spread + 12} ry={14 + drop * 0.015} fill="url(#flex-pool)" />

        {/* arc + base */}
        <path d={arc} stroke="var(--fg)" strokeWidth="10" strokeLinecap="round" className="transition-[stroke] duration-700" />
        <rect x={BASE.x - 50} y={BASE.floor - 6} width="100" height="16" rx="8" fill="var(--fg)" className="transition-[fill] duration-700" />
        <rect x={BASE.x - 10} y={BASE.floor - 68} width="20" height="66" rx="8" fill="var(--fg)" className="transition-[fill] duration-700" />

        {/* head (drag me, any direction) */}
        <g
          id="lamp-head"
          role="application"
          aria-label={`Lamp head position: ${Math.round(((hx - HEAD.minX) / (HEAD.maxX - HEAD.minX)) * 100)}% across, ${Math.round(((HEAD.maxY - hy) / (HEAD.maxY - HEAD.minY)) * 100)}% up. Drag or use the arrow keys.`}
          tabIndex={0}
          onPointerDown={(e) => {
            e.preventDefault();
            cancelTour();
            setDragging(true);
            fromEvent(e);
          }}
          onKeyDown={(e) => {
            const step = 14;
            if (e.key.startsWith("Arrow")) {
              e.preventDefault();
              cancelTour();
            }
            if (e.key === "ArrowUp") setHead((h) => clampHead(h.x, h.y - step));
            if (e.key === "ArrowDown") setHead((h) => clampHead(h.x, h.y + step));
            if (e.key === "ArrowLeft") setHead((h) => clampHead(h.x - step, h.y));
            if (e.key === "ArrowRight") setHead((h) => clampHead(h.x + step, h.y));
          }}
          style={{ cursor: dragging ? "grabbing" : "grab" }}
        >
          <circle cx={hx} cy={hy} r="40" fill="transparent" />
          <rect x={hx - 36} y={hy - 17} width="72" height="34" rx="17" fill="var(--fg)" className="transition-[fill] duration-700" />
          <rect x={hx - 28} y={hy + 9} width="56" height="10" rx="5" fill="var(--accent)" className="transition-[fill] duration-700" />
          <motion.circle
            cx={hx}
            cy={hy}
            r="31"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="1.5"
            strokeDasharray="4 6"
            animate={{ opacity: dragging || touring ? 0.95 : [0.55, 0.2, 0.55], scale: dragging || touring ? 1.1 : 1 }}
            transition={dragging || touring ? { duration: 0.2 } : { duration: 2.2, repeat: Infinity, ease }}
            style={{ transformOrigin: `${hx}px ${hy}px` }}
          />
          {/* 4-way hint while idle */}
          {!dragging && (
            <g opacity="0.65">
              {[
                [hx, hy - 52, "M0 6 L5 0 L10 6", 0],
                [hx, hy + 52, "M0 0 L5 6 L10 0", 0],
                [hx - 54, hy, "M6 0 L0 5 L6 10", 0],
                [hx + 54, hy, "M0 0 L6 5 L0 10", 0],
              ].map(([x, y, d], i) => (
                <path key={i} d={d as string} transform={`translate(${(x as number) - 5} ${(y as number) - 5})`} stroke="var(--accent)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              ))}
            </g>
          )}
        </g>
      </svg>

      {/* readouts */}
      <div className="pointer-events-none absolute top-2 left-2 grid gap-1.5 font-mono text-[11.5px] font-bold">
        <span className="rounded-lg border px-2.5 py-1.5 backdrop-blur-xl transition-colors duration-700" style={{ background: "color-mix(in oklab, var(--bg) 60%, transparent)", borderColor: "var(--border)" }}>
          REACH <span style={{ color: "var(--accent)" }}>{Math.round(lerp(58, 148, (BASE.x - hx - 70) / (BASE.x - HEAD.minX - 70)))} cm</span>
        </span>
        <span className="rounded-lg border px-2.5 py-1.5 backdrop-blur-xl transition-colors duration-700" style={{ background: "color-mix(in oklab, var(--bg) 60%, transparent)", borderColor: "var(--border)" }}>
          HEIGHT <span style={{ color: "var(--accent)" }}>{Math.round(lerp(52, 128, (BASE.floor - hy - 112) / (BASE.floor - HEAD.minY - 112)))} cm</span>
        </span>
        <span className="rounded-lg border px-2.5 py-1.5 backdrop-blur-xl transition-colors duration-700" style={{ background: "color-mix(in oklab, var(--bg) 60%, transparent)", borderColor: "var(--border)" }}>
          POOL <span style={{ color: "var(--accent)" }}>Ø {Math.round(lerp(42, 116, drop / 350))} cm</span>
        </span>
      </div>
    </div>
  );
}
