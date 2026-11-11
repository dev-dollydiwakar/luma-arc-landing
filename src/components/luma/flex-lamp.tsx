"use client";

import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

const ease = [0.2, 0.8, 0.2, 1] as const;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

// where the head is allowed to go (svg units)
const HEAD = { minX: 96, maxX: 332, minY: 118, maxY: 356 };
const BASE = { x: 402, floor: 468 };

type FlexLampProps = {
  /** Starting head position in svg units. */
  defaultHead?: { x: number; y: number };
};

/**
 * The fully flexible Arc: grab the head and move it anywhere — up, down, left,
 * right. The sprung-steel arc bends to follow, and the light cone + floor pool
 * track the head. Every colored part reads the palette vars.
 */
export function FlexLamp({ defaultHead = { x: 160, y: 148 } }: FlexLampProps) {
  const [head, setHead] = useState(defaultHead);
  const [dragging, setDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const { x: hx, y: hy } = head;
  const drop = BASE.floor - hy;
  const spread = drop * 0.34 + 16;
  const glow = lerp(0.75, 0.42, drop / 350); // lower head → tighter, brighter pool

  // sprung-steel bend: control points between the base post and wherever the head is
  const arc = `M${BASE.x} ${BASE.floor} C ${BASE.x} ${hy + (BASE.floor - hy) * 0.3} ${hx + (BASE.x - hx) * 0.32} ${hy - 14} ${hx + 34} ${hy + 4}`;

  const fromEvent = useCallback((e: PointerEvent | React.PointerEvent) => {
    const box = svgRef.current?.getBoundingClientRect();
    if (!box) return;
    const x = ((e.clientX - box.left) / box.width) * 520;
    const y = ((e.clientY - box.top) / box.height) * 560;
    setHead({ x: clamp(x, HEAD.minX, HEAD.maxX), y: clamp(y, HEAD.minY, HEAD.maxY) });
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
            setDragging(true);
            fromEvent(e);
          }}
          onKeyDown={(e) => {
            const step = 14;
            if (e.key.startsWith("Arrow")) e.preventDefault();
            if (e.key === "ArrowUp") setHead((h) => ({ ...h, y: clamp(h.y - step, HEAD.minY, HEAD.maxY) }));
            if (e.key === "ArrowDown") setHead((h) => ({ ...h, y: clamp(h.y + step, HEAD.minY, HEAD.maxY) }));
            if (e.key === "ArrowLeft") setHead((h) => ({ ...h, x: clamp(h.x - step, HEAD.minX, HEAD.maxX) }));
            if (e.key === "ArrowRight") setHead((h) => ({ ...h, x: clamp(h.x + step, HEAD.minX, HEAD.maxX) }));
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
            animate={{ opacity: dragging ? 0.95 : [0.55, 0.2, 0.55], scale: dragging ? 1.1 : 1 }}
            transition={dragging ? { duration: 0.2 } : { duration: 2.2, repeat: Infinity, ease }}
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
