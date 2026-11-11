"use client";

import { motion } from "motion/react";

const COLORS = ["#c6f432", "#f2f0e9", "#ff6b4a", "#e9ff9e", "#ffb547"];
const COUNT = 38;

/** Deterministic 0–1 noise, so the burst is the same on every render. */
const noise = (n: number) => {
  const x = Math.sin(n * 91.7 + 13.1) * 43758.5453;
  return x - Math.floor(x);
};

const PIECES = Array.from({ length: COUNT }, (_, i) => {
  const angle = (i / COUNT) * Math.PI * 2 + noise(i) * 0.6;
  const dist = 110 + noise(i + 40) * 130;
  return {
    x: Math.cos(angle) * dist * 1.5,
    y: Math.sin(angle) * dist - 40,
    rotate: (noise(i + 80) - 0.5) * 720,
    w: 7 + noise(i + 120) * 6,
    h: 10 + noise(i + 160) * 9,
    color: COLORS[i % COLORS.length],
    delay: noise(i + 200) * 0.08,
  };
});

/** A one-shot confetti burst. Change `fire` (1, 2, 3…) to play it again. */
export function Confetti({ fire }: { fire: number }) {
  if (!fire) return null;
  return (
    <span key={fire} aria-hidden className="pointer-events-none absolute top-1/2 left-1/2 z-20">
      {PIECES.map((p, i) => (
        <motion.i
          key={i}
          className="absolute rounded-[2px]"
          style={{ width: p.w, height: p.h, background: p.color, left: -p.w / 2, top: -p.h / 2 }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 0.4 }}
          animate={{ x: p.x, y: [0, p.y, p.y + 90], opacity: [1, 1, 0], rotate: p.rotate, scale: 1 }}
          transition={{
            duration: 1.6,
            delay: p.delay,
            ease: [0.15, 0.8, 0.3, 1],
            y: { duration: 1.6, delay: p.delay, times: [0, 0.4, 1], ease: ["easeOut", "easeIn"] },
            opacity: { duration: 1.6, delay: p.delay, times: [0, 0.75, 1], ease: "linear" },
          }}
        />
      ))}
    </span>
  );
}
