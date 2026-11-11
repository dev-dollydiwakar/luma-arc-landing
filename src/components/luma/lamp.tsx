"use client";

import { motion } from "motion/react";

const ease = [0.2, 0.8, 0.2, 1] as const;

type LampProps = {
  /** Draws the arc + fades the light in on mount. */
  animate?: boolean;
  /** Dust particles floating in the light cone. */
  particles?: boolean;
  /** 0..1 — how warm/cool and how bright the pool renders (the light lab drives this). */
  className?: string;
};

const DUST = [
  { left: "22%", top: "52%", size: 3, dur: 6.5, delay: 0, dx: "10px" },
  { left: "27%", top: "66%", size: 2, dur: 7.5, delay: 1.2, dx: "-8px" },
  { left: "31%", top: "58%", size: 2.5, dur: 5.8, delay: 2.1, dx: "6px" },
  { left: "24%", top: "74%", size: 2, dur: 8, delay: 0.6, dx: "-12px" },
  { left: "35%", top: "70%", size: 1.8, dur: 6.8, delay: 3, dx: "9px" },
  { left: "28%", top: "80%", size: 2.2, dur: 7.2, delay: 1.8, dx: "-6px" },
];

/**
 * The LUMA Arc lamp, drawn in SVG. Every colored part reads the palette vars,
 * so the lamp (and its light) re-themes with the page.
 */
export function Lamp({ animate = true, particles = false, className = "" }: LampProps) {
  const initial = animate ? undefined : false;
  return (
    <div className={`relative ${className}`}>
      {/* ambient glow behind everything */}
      <motion.div
        aria-hidden
        className="absolute left-1/2 top-[34%] size-[48%] -translate-x-[84%] -translate-y-1/2 rounded-full blur-[70px] transition-colors duration-700 [animation:luma-breathe_5s_ease-in-out_infinite]"
        style={{ background: "var(--accent)" }}
        initial={initial && { opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 1.6, duration: 1.2 }}
      />

      {/* dust in the light cone */}
      {particles && (
        <div aria-hidden className="absolute inset-0">
          {DUST.map((d, i) => (
            <span
              key={i}
              className="absolute rounded-full transition-colors duration-700"
              style={{
                left: d.left,
                top: d.top,
                width: d.size,
                height: d.size,
                background: "var(--accent)",
                boxShadow: "0 0 8px var(--accent)",
                opacity: 0,
                animation: `luma-dust ${d.dur}s linear ${d.delay}s infinite`,
                ["--dx" as string]: d.dx,
              }}
            />
          ))}
        </div>
      )}

      <svg viewBox="0 0 520 560" fill="none" className="relative w-full">
        <defs>
          <linearGradient id="luma-cone" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--accent)" stopOpacity="0.6" />
            <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="luma-pool" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="var(--accent)" stopOpacity="0.55" />
            <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* light cone + floor pool */}
        <motion.path d="M163 172 L112 466 L214 466 Z" fill="url(#luma-cone)" initial={initial && { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 0.9 }} />
        <motion.ellipse cx="163" cy="470" rx="104" ry="17" fill="url(#luma-pool)" initial={initial && { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.7, duration: 0.9 }} />

        {/* arc arm */}
        <motion.path
          d="M402 470 C 402 220 330 120 163 132"
          stroke="var(--fg)"
          strokeWidth="10"
          strokeLinecap="round"
          className="transition-[stroke] duration-700"
          initial={initial && { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.3, ease, delay: 0.2 }}
        />
        {/* head */}
        <motion.g initial={initial && { opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2, duration: 0.5, ease }}>
          <rect x="128" y="124" width="72" height="34" rx="17" fill="var(--fg)" className="transition-[fill] duration-700" />
          <motion.rect x="136" y="150" width="56" height="10" rx="5" fill="var(--accent)" className="transition-[fill] duration-700" initial={initial && { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 0.4 }} />
        </motion.g>
        {/* base */}
        <motion.g initial={initial && { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease }}>
          <rect x="352" y="462" width="100" height="16" rx="8" fill="var(--fg)" className="transition-[fill] duration-700" />
          <rect x="392" y="400" width="20" height="66" rx="8" fill="var(--fg)" className="transition-[fill] duration-700" />
        </motion.g>
      </svg>
    </div>
  );
}
