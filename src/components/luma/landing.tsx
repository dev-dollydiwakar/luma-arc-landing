"use client";

import { AnimatePresence, MotionConfig, motion, type Variants } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import { Confetti } from "./confetti";
import { FlexLamp } from "./flex-lamp";
import { PALETTES, paletteStyle, type Palette } from "./palettes";

const ease = [0.2, 0.8, 0.2, 1] as const;

const rise: Variants = {
  hidden: { opacity: 0, y: 28, filter: "blur(8px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease } },
};

/* ------------------------------------------------------------------ pieces */

function Glass({ id, className = "", children }: { id?: string; className?: string; children: ReactNode }) {
  return (
    <motion.div
      id={id}
      variants={rise}
      className={`relative rounded-3xl border backdrop-blur-xl transition-colors duration-700 ${className}`}
      style={{ background: "var(--glass)", borderColor: "var(--border)", boxShadow: "0 30px 60px -35px var(--shadow)" }}
    >
      {children}
    </motion.div>
  );
}

/** One 60/30/10 card of the deck. */
function SwatchCard({ s, i }: { s: Palette["c60"]; i: number }) {
  const dark = parseInt(s.hex.slice(1, 3), 16) * 0.299 + parseInt(s.hex.slice(3, 5), 16) * 0.587 + parseInt(s.hex.slice(5, 7), 16) * 0.114 < 140;
  const fg = dark ? "#F5F2EA" : "#17130C";
  return (
    <motion.div
      variants={rise}
      className="relative overflow-hidden rounded-2xl p-4 shadow-[0_18px_40px_-20px_rgba(0,0,0,.45)] transition-colors duration-700"
      style={{ background: s.hex, color: fg, zIndex: 3 - i, rotate: `${(i - 1) * 0.8}deg` }}
    >
      <div className="flex items-baseline justify-between">
        <b className="text-[17px] font-extrabold tracking-tight">{s.name}</b>
        <span className="font-mono text-[18px] font-bold">
          {s.pct}
          <small className="text-[11px] opacity-70">%</small>
        </span>
      </div>
      <div className="mt-3 flex items-center justify-between font-mono text-[11px] opacity-80">
        <span>{s.hex.toUpperCase()}</span>
        <span>{s.role}</span>
      </div>
    </motion.div>
  );
}

/** Floating glass spec chip around the hero lamp. */
function SpecChip({ className, delay, children }: { className: string; delay: number; children: ReactNode }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ delay, duration: 0.7, ease }}
      className={`absolute z-10 ${className}`}
    >
      <motion.span
        animate={{ y: [0, -7, 0] }}
        transition={{ duration: 4.5 + delay, repeat: Infinity, ease: "easeInOut" }}
        className="flex items-center gap-2 rounded-xl border px-3 py-2 font-mono text-[11.5px] font-bold whitespace-nowrap backdrop-blur-xl transition-colors duration-700"
        style={{ background: "color-mix(in oklab, var(--bg) 55%, transparent)", borderColor: "var(--border)", boxShadow: "0 16px 32px -18px var(--shadow)" }}
      >
        {children}
      </motion.span>
    </motion.span>
  );
}

const PHOTOS: Record<string, string> = { aurora: "/luma/aurora.jpg", daybreak: "/luma/daybreak.jpg", espresso: "/luma/espresso.jpg" };

const MARQUEE = "ONE LAMP · ANY MOOD · 60 / 30 / 10 · DESIGNED IN A SINGLE ARC · ";

const REVIEWS = [
  { name: "Studio North", role: "Architecture studio", text: "The only lamp clients ask about. The terracotta light at dusk is unreasonably good." },
  { name: "Jae · setup.diary", role: "Desk setup creator", text: "Swapped two softboxes for one Arc. The pool of light covers the whole desk." },
  { name: "Humane Type Co.", role: "Type foundry", text: "We bought three. The gold scene makes proofs look printed on butter." },
  { name: "Mara K.", role: "Colorist", text: "First lamp whose app palette matches the physical light. My grade room stays calibrated." },
  { name: "Atelier 9", role: "Interior practice", text: "Clients think it's custom. It ships in a box the size of a poster tube." },
];

/* ------------------------------------------------------------------ page */

type BuyState = "idle" | "loading" | "done";

/** LUMA Arc landing page. One 60-30-10 palette runs the page; the lamp's light is the 10%. */
export function LumaLanding() {
  const [pi, setPi] = useState(0);
  const [buy, setBuy] = useState<BuyState>("idle");
  const [kelvin, setKelvin] = useState(3200);
  const p = PALETTES[pi];
  const warmth = (kelvin - 2700) / (6500 - 2700); // 0 warm → 1 cool

  useEffect(() => {
    const w = window as unknown as Record<string, unknown>;
    w.__setPalette = (i: number) => setPi(((i % PALETTES.length) + PALETTES.length) % PALETTES.length);
  }, []);

  function order() {
    if (buy !== "idle") return;
    setBuy("loading");
    setTimeout(() => setBuy("done"), 1300);
  }

  return (
    <MotionConfig reducedMotion="user">
      <div id="luma" className="min-h-screen overflow-x-clip font-sans transition-colors duration-700" style={{ ...paletteStyle(p), background: "var(--bg)", color: "var(--fg)" }}>
        {/* ambient wash + film grain + vignette */}
        <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div className="absolute -top-48 left-1/2 size-[760px] -translate-x-1/2 rounded-full opacity-[.15] blur-[140px] transition-colors duration-700" style={{ background: "var(--accent)" }} />
          <div className="absolute inset-0 opacity-[.05] mix-blend-overlay" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 120% 90% at 50% 20%, transparent 60%, var(--shadow))", opacity: 0.5 }} />
        </div>

        {/* nav */}
        <motion.nav
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
          className="sticky top-4 z-40 mx-auto flex h-16 w-[min(1180px,calc(100%-48px))] items-center gap-7 rounded-2xl border px-5 backdrop-blur-2xl transition-colors duration-700"
          style={{ background: "color-mix(in oklab, var(--bg) 72%, transparent)", borderColor: "var(--border)", boxShadow: "0 20px 40px -28px var(--shadow)" }}
        >
          <b className="flex items-center gap-2.5 text-[17px] font-extrabold tracking-tight">
            <span className="grid size-8 place-items-center rounded-lg font-black transition-colors duration-700" style={{ background: "var(--accent)", color: "var(--on-accent)" }}>
              L
            </span>
            LUMA
          </b>
          <span className="hidden gap-6 text-[13.5px] font-medium sm:flex" style={{ color: "var(--muted)" }}>
            <span>Overview</span>
            <span>Light lab</span>
            <span>Reviews</span>
          </span>
          <div className="ml-auto flex items-center gap-2.5 rounded-full border px-3 py-2 transition-colors duration-700" style={{ borderColor: "var(--border)", background: "var(--glass)" }} role="radiogroup" aria-label="Palette">
            {PALETTES.map((pal, i) => (
              <button key={pal.id} id={`nav-p${i}`} type="button" role="radio" aria-checked={i === pi} aria-label={pal.name} onClick={() => setPi(i)} className="relative grid size-6 cursor-pointer place-items-center rounded-full">
                {i === pi && <motion.span layoutId="nav-dot" className="absolute inset-0 rounded-full border-2" style={{ borderColor: pal.c10.hex }} transition={{ type: "spring", stiffness: 500, damping: 30 }} />}
                <span className="size-3.5 rounded-full" style={{ background: pal.c10.hex }} />
              </button>
            ))}
          </div>
          <button type="button" className="hidden h-10 cursor-pointer items-center rounded-xl px-4 text-[13.5px] font-bold transition-colors duration-700 sm:flex" style={{ background: "var(--accent)", color: "var(--on-accent)" }}>
            Pre-order
          </button>
        </motion.nav>

        {/* hero */}
        <header id="hero" className="relative z-10 mx-auto grid w-[min(1180px,calc(100%-48px))] items-center gap-8 pt-14 pb-10 lg:grid-cols-[1.02fr_1fr]">
          {/* ghost word behind */}
          <span aria-hidden className="pointer-events-none absolute -top-2 right-0 select-none text-[190px] leading-none font-black tracking-[-0.06em] transition-colors duration-700" style={{ color: "color-mix(in oklab, var(--fg) 4.5%, transparent)" }}>
            LUMA
          </span>

          <div className="relative">
            <motion.p variants={rise} initial="hidden" animate="show" className="inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 font-mono text-[11.5px] font-bold tracking-[3px] transition-colors duration-700" style={{ borderColor: "var(--border)", color: "var(--accent)" }}>
              <i className="size-1.5 rounded-full transition-colors duration-700 [animation:luma-breathe_2.4s_ease-in-out_infinite]" style={{ background: "var(--accent)" }} />
              LUMA ARC · SMART LIGHT
            </motion.p>
            <motion.h1 initial="hidden" animate="show" transition={{ staggerChildren: 0.09, delayChildren: 0.15 }} className="mt-5 text-[68px] leading-[0.98] font-black tracking-[-0.038em]">
              {["One", "lamp."].map((w) => (
                <motion.span key={w} variants={rise} className="mr-[0.22em] inline-block">
                  {w}
                </motion.span>
              ))}
              <br />
              {["Any", "mood."].map((w) => (
                <motion.span key={w} variants={rise} className="mr-[0.22em] inline-block transition-colors duration-700" style={{ color: "var(--accent)" }}>
                  {w}
                </motion.span>
              ))}
            </motion.h1>
            <motion.p variants={rise} initial="hidden" animate="show" transition={{ delay: 0.4 }} className="mt-5 max-w-[440px] text-[17px] leading-relaxed transition-colors duration-700" style={{ color: "var(--muted)" }}>
              A single steel arc, a 2700–6500K light engine, and a palette system that re-themes the room — and this page — in one tap.
            </motion.p>
            <motion.div variants={rise} initial="hidden" animate="show" transition={{ delay: 0.55 }} className="mt-7 flex items-center gap-3">
              <button type="button" className="shimmer relative h-13 cursor-pointer overflow-hidden rounded-2xl px-6 text-[15px] font-bold shadow-[0_18px_36px_-16px_var(--shadow)] transition-colors duration-700" style={{ background: "var(--accent)", color: "var(--on-accent)" }}>
                Pre-order · $249
              </button>
              <span className="text-[13px] transition-colors duration-700" style={{ color: "var(--muted)" }}>
                Ships March · free returns
              </span>
            </motion.div>

            {/* stats */}
            <motion.div variants={rise} initial="hidden" animate="show" transition={{ delay: 0.65 }} className="mt-8 grid max-w-[430px] grid-cols-4 overflow-hidden rounded-2xl border transition-colors duration-700" style={{ borderColor: "var(--border)" }}>
              {[
                ["1800", "lumens"],
                ["2700–6500", "kelvin"],
                ["14W", "peak draw"],
                ["5 yr", "warranty"],
              ].map(([v, l], i) => (
                <div key={l} className={`px-3 py-3 text-center transition-colors duration-700 ${i ? "border-l" : ""}`} style={{ borderColor: "var(--border)", background: "var(--glass)" }}>
                  <b className="block font-mono text-[14.5px] font-bold tracking-tight">{v}</b>
                  <span className="text-[10.5px] tracking-wide uppercase transition-colors duration-700" style={{ color: "var(--muted)" }}>
                    {l}
                  </span>
                </div>
              ))}
            </motion.div>

            {/* palette deck */}
            <motion.div id="deck" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.12, delayChildren: 0.75 } } }} className="mt-8 grid max-w-[380px] gap-2.5">
              <SwatchCard s={p.c60} i={0} />
              <SwatchCard s={p.c30} i={1} />
              <SwatchCard s={p.c10} i={2} />
              <motion.p variants={rise} className="mt-1 font-mono text-[11.5px] tracking-wide transition-colors duration-700" style={{ color: "var(--muted)" }}>
                THE 60-30-10 RULE · <b style={{ color: "var(--fg)" }}>{p.name}</b> — {p.tag}
              </motion.p>
            </motion.div>
          </div>

          {/* lamp scene */}
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, ease }} className="relative">
            <div className="relative aspect-[4/5] max-h-[640px] w-full overflow-hidden rounded-[32px] border transition-colors duration-700" style={{ borderColor: "var(--border)", boxShadow: "inset 0 1px 0 var(--border), 0 40px 80px -40px var(--shadow)" }}>
              <AnimatePresence initial={false}>
                <motion.div key={p.id} className="absolute inset-0" initial={{ opacity: 0, scale: 1.045 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8, ease }}>
                  <Image src={PHOTOS[p.id]} alt={`The LUMA Arc in the ${p.name} palette`} fill sizes="(min-width:1024px) 560px, 100vw" className="object-cover" priority />
                </motion.div>
              </AnimatePresence>
              <div aria-hidden className="absolute inset-x-0 bottom-0 h-28" style={{ background: "linear-gradient(180deg, transparent, var(--shadow))", opacity: 0.45 }} />
              <span className="absolute bottom-4 left-4 rounded-full border px-3 py-1.5 font-mono text-[10.5px] font-bold tracking-[2px] backdrop-blur-xl transition-colors duration-700" style={{ background: "color-mix(in oklab, var(--bg) 55%, transparent)", borderColor: "var(--border)" }}>
                SHOT IN · <span style={{ color: "var(--accent)" }}>{p.name.toUpperCase()}</span>
              </span>
              {/* floating spec chips */}
              <SpecChip className="top-[14%] left-[7%]" delay={1.9}>
                <span style={{ color: "var(--accent)" }}>●</span> 2700–6500K
              </SpecChip>
              <SpecChip className="top-[38%] right-[6%]" delay={2.15}>
                1800 lm · CRI 97
              </SpecChip>
              <SpecChip className="bottom-[16%] left-[10%]" delay={2.4}>
                Matter · HomeKit · Alexa
              </SpecChip>
            </div>
          </motion.div>
        </header>

        {/* marquee */}
        <div aria-hidden className="relative z-10 overflow-hidden border-y py-3 transition-colors duration-700" style={{ borderColor: "var(--border)", background: "var(--glass)" }}>
          <div className="flex w-max [animation:luma-marquee_22s_linear_infinite] font-mono text-[12px] font-bold tracking-[4px] whitespace-nowrap" style={{ color: "var(--muted)" }}>
            <span>{MARQUEE.repeat(4)}</span>
            <span>{MARQUEE.repeat(4)}</span>
          </div>
        </div>

        {/* features: bento */}
        <section id="features" className="relative z-10 mx-auto w-[min(1180px,calc(100%-48px))] pt-16 pb-20">
          <motion.h2 initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.6 }} variants={rise} className="text-[36px] font-extrabold tracking-tight">
            Built like furniture.
            <span className="transition-colors duration-700" style={{ color: "var(--accent)" }}>
              {" "}
              Lit like a studio.
            </span>
          </motion.h2>

          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.25 }} variants={{ show: { transition: { staggerChildren: 0.1 } } }} className="mt-7 grid gap-4 lg:grid-cols-3">
            {/* light lab: the big interactive card */}
            <Glass id="lab" className="p-6 lg:col-span-2">
              <div className="flex items-center justify-between">
                <b className="text-[18px] font-bold">Light lab · pick your white</b>
                <span className="rounded-full px-2.5 py-1 font-mono text-[11px] font-bold transition-colors duration-700" style={{ background: "color-mix(in oklab, var(--accent) 16%, transparent)", color: "var(--accent)" }}>
                  LIVE
                </span>
              </div>
              <div className="mt-6 flex items-end gap-6">
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <b className="font-mono text-[44px] leading-none font-bold tracking-tight tabular-nums">{kelvin}</b>
                    <span className="font-mono text-[14px]" style={{ color: "var(--muted)" }}>
                      K · {kelvin < 3400 ? "candle warm" : kelvin < 4600 ? "studio neutral" : "daylight cool"}
                    </span>
                  </div>
                  <input
                    id="ktrack"
                    type="range"
                    min={2700}
                    max={6500}
                    step={50}
                    value={kelvin}
                    onChange={(e) => setKelvin(Number(e.target.value))}
                    aria-label="Color temperature"
                    aria-valuetext={`${kelvin} kelvin`}
                    className="mt-5 h-2.5 w-full cursor-pointer appearance-none rounded-full outline-none [&::-moz-range-thumb]:size-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-webkit-slider-thumb]:size-6 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_0_4px_rgba(0,0,0,.25),0_0_18px_var(--accent)]"
                    style={{ background: "linear-gradient(90deg, #FFB46B, #FFE3C1 45%, #EAF2FF 75%, #BFD9FF)", ["--thumb" as string]: "var(--fg)" }}
                  />
                  <style>{`#ktrack::-webkit-slider-thumb{background:var(--fg)} #ktrack::-moz-range-thumb{background:var(--fg)}`}</style>
                  <div className="mt-2 flex justify-between font-mono text-[10.5px]" style={{ color: "var(--muted)" }}>
                    <span>2700K</span>
                    <span>4200K</span>
                    <span>6500K</span>
                  </div>
                </div>
                {/* live bulb preview */}
                <div className="relative hidden w-[150px] flex-none sm:block">
                  <div className="h-[110px] rounded-2xl border transition-colors duration-700" style={{ borderColor: "var(--border)", background: "var(--bg2)" }} />
                  <div
                    className="absolute left-1/2 top-1/2 size-20 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[22px]"
                    style={{ background: `color-mix(in oklab, #FFB46B ${Math.round((1 - warmth) * 100)}%, #BFD9FF)`, opacity: 0.9 }}
                  />
                  <span className="absolute left-1/2 top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_16px_6px_rgba(255,255,255,.65)]" />
                </div>
              </div>
            </Glass>

            {/* scene memory */}
            <Glass className="p-6">
              <b className="text-[16px] font-bold">Scene memory</b>
              <p className="mt-1.5 text-[13px] leading-relaxed transition-colors duration-700" style={{ color: "var(--muted)" }}>
                Three scenes on the head. Long-press saves the room exactly as it is.
              </p>
              <div className="mt-5 grid grid-cols-3 gap-2">
                {[
                  ["Focus", "5200K"],
                  ["Dusk", "3000K"],
                  ["Read", "4000K"],
                ].map(([n, k], i) => (
                  <div key={n} className={`rounded-xl border px-2 py-3 text-center transition-colors duration-700 ${i === 1 ? "" : "opacity-60"}`} style={{ borderColor: i === 1 ? "var(--accent)" : "var(--border)", background: "var(--glass)" }}>
                    <b className="block text-[12.5px] font-bold">{n}</b>
                    <span className="font-mono text-[10.5px]" style={{ color: "var(--muted)" }}>
                      {k}
                    </span>
                  </div>
                ))}
              </div>
            </Glass>

            {/* circadian */}
            <Glass className="p-6">
              <b className="text-[16px] font-bold">Follows the sun</b>
              <p className="mt-1.5 text-[13px] leading-relaxed transition-colors duration-700" style={{ color: "var(--muted)" }}>
                Circadian mode drifts from candle-warm to daylight and back.
              </p>
              <svg viewBox="0 0 260 84" className="mt-4 w-full overflow-visible" aria-hidden>
                <path d="M6 70 C 60 70 70 14 130 14 S 200 70 254 70" fill="none" stroke="var(--border)" strokeWidth="2" />
                <motion.path d="M6 70 C 60 70 70 14 130 14 S 200 70 254 70" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" className="transition-[stroke] duration-700" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.4, ease }} />
                {[
                  [6, 70, "7a"],
                  [130, 14, "1p"],
                  [254, 70, "9p"],
                ].map(([x, y, l]) => (
                  <g key={l as string}>
                    <circle cx={x as number} cy={y as number} r="4" fill="var(--accent)" className="transition-[fill] duration-700" />
                    <text x={x as number} y={(y as number) + 18} textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="var(--muted)">
                      {l}
                    </text>
                  </g>
                ))}
              </svg>
            </Glass>

            {/* the head, up close */}
            <Glass className="overflow-hidden p-0">
              <div className="relative aspect-[3/2]">
                <Image src="/luma/head.jpg" alt="The machined head of the LUMA Arc" fill sizes="380px" className="object-cover" />
              </div>
              <div className="p-5 pt-4">
                <b className="text-[16px] font-bold">One-arc build</b>
                <p className="mt-1 text-[13px] leading-relaxed transition-colors duration-700" style={{ color: "var(--muted)" }}>
                  Machined aluminum head on a single bent-steel arc. One touch dimple, zero visible screws.
                </p>
              </div>
            </Glass>

            {/* flex the arc: drag the head, the light follows */}
            <Glass id="flex" className="p-6 lg:col-span-3">
              <div className="grid items-center gap-6 lg:grid-cols-[1fr_1.15fr]">
                <div>
                  <span className="rounded-full px-2.5 py-1 font-mono text-[11px] font-bold transition-colors duration-700" style={{ background: "color-mix(in oklab, var(--accent) 16%, transparent)", color: "var(--accent)" }}>
                    TRY IT · DRAG THE HEAD
                  </span>
                  <h3 className="mt-4 text-[26px] leading-tight font-extrabold tracking-tight">
                    Bend it where you{" "}
                    <span className="transition-colors duration-700" style={{ color: "var(--accent)" }}>
                      need it.
                    </span>
                  </h3>
                  <p className="mt-3 max-w-[380px] text-[14px] leading-relaxed transition-colors duration-700" style={{ color: "var(--muted)" }}>
                    The arc is sprung steel: drag the head anywhere — down over the keyboard, out across the desk, up for soft room light. It holds any position, and the optics refocus so the pool stays even.
                  </p>
                  <ul className="mt-5 grid max-w-[360px] gap-2 text-[13px]">
                    {["Moves on both axes, holds any angle", "Optics refocus automatically", "58–148 cm reach · 52–128 cm height"].map((t) => (
                      <li key={t} className="flex items-center gap-2.5">
                        <svg viewBox="0 0 24 24" className="size-4 flex-none transition-colors duration-700" style={{ color: "var(--accent)" }} fill="none" stroke="currentColor" strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                          <path d="M5 12.5l4.5 4.5L19 7.5" />
                        </svg>
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
                <FlexLamp />
              </div>
            </Glass>

            {/* matter */}
            <Glass className="p-6 lg:col-span-2">
              <div className="flex flex-wrap items-center gap-3">
                <div className="min-w-0 flex-1">
                  <b className="text-[16px] font-bold">Matter built in</b>
                  <p className="mt-1.5 text-[13px] leading-relaxed transition-colors duration-700" style={{ color: "var(--muted)" }}>
                    Pairs once, works everywhere. Schedules keep running offline.
                  </p>
                </div>
                {["HomeKit", "Alexa", "Google Home", "Home Assistant"].map((l) => (
                  <span key={l} className="rounded-xl border px-3.5 py-2 font-mono text-[12px] font-bold transition-colors duration-700" style={{ borderColor: "var(--border)", background: "var(--glass)" }}>
                    {l}
                  </span>
                ))}
              </div>
            </Glass>
          </motion.div>
        </section>

        {/* variants */}
        <section id="variants" className="relative z-10 mx-auto w-[min(1180px,calc(100%-48px))] pb-20">
          <motion.h2 initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.6 }} variants={rise} className="text-[36px] font-extrabold tracking-tight">
            Pick a palette.{" "}
            <span className="transition-colors duration-700" style={{ color: "var(--accent)" }}>
              The room follows.
            </span>
          </motion.h2>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={{ show: { transition: { staggerChildren: 0.12 } } }} className="mt-7 grid gap-4 lg:grid-cols-3">
            {PALETTES.map((pal, i) => {
              const active = i === pi;
              return (
                <Glass key={pal.id} id={`variant-${i}`} className="cursor-pointer p-4">
                  <button type="button" onClick={() => setPi(i)} aria-pressed={active} className="absolute inset-0 z-10 cursor-pointer rounded-3xl" aria-label={`Use the ${pal.name} palette`} />
                  {active && <motion.span layoutId="variant-ring" className="pointer-events-none absolute -inset-px rounded-3xl border-2 transition-colors duration-700" style={{ borderColor: "var(--accent)" }} transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                  <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border transition-colors duration-700" style={{ borderColor: pal.vars.border }}>
                    <Image src={PHOTOS[pal.id]} alt={`LUMA Arc · ${pal.name}`} fill sizes="380px" className="object-cover" />
                  </div>
                  <div className="mt-4 flex items-center justify-between px-1">
                    <b className="text-[17px] font-extrabold tracking-tight">{pal.name}</b>
                    <span className="font-mono text-[11px] transition-colors duration-700" style={{ color: "var(--muted)" }}>
                      {pal.tag}
                    </span>
                  </div>
                  <div className="mt-2.5 flex h-2 overflow-hidden rounded-full">
                    <span style={{ background: pal.c60.hex, flex: 6 }} />
                    <span style={{ background: pal.c30.hex, flex: 3 }} />
                    <span style={{ background: pal.c10.hex, flex: 1 }} />
                  </div>
                  <div className="mt-3 flex h-7 items-center px-1">
                    <AnimatePresence>
                      {active && (
                        <motion.span initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10.5px] font-bold transition-colors duration-700" style={{ background: "color-mix(in oklab, var(--accent) 16%, transparent)", color: "var(--accent)" }}>
                          ● LIVE ON THIS PAGE
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </Glass>
              );
            })}
          </motion.div>
        </section>

        {/* reviews marquee + buy */}
        <section id="reviews" className="relative z-10 mx-auto w-[min(1180px,calc(100%-48px))] pb-24">
          <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
            <div className="min-w-0">
              <motion.h2 initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.6 }} variants={rise} className="text-[36px] font-extrabold tracking-tight">
                Loved in{" "}
                <span className="transition-colors duration-700" style={{ color: "var(--accent)" }}>
                  bright
                </span>{" "}
                places.
              </motion.h2>
              {/* marquee of review cards */}
              <div className="mt-7 space-y-4 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]">
                {[0, 1].map((row) => (
                  <div key={row} className="flex w-max gap-4" style={{ animation: `luma-marquee ${row ? 46 : 38}s linear infinite`, animationDirection: row ? "reverse" : "normal" }}>
                    {[...REVIEWS, ...REVIEWS].map((r, i) => (
                      <div key={`${r.name}-${i}`} className="w-[330px] flex-none rounded-2xl border p-4 backdrop-blur-xl transition-colors duration-700" style={{ background: "var(--glass)", borderColor: "var(--border)" }}>
                        <div className="flex items-center gap-2.5">
                          <span className="grid size-8 flex-none place-items-center rounded-full text-[11px] font-black transition-colors duration-700" style={{ background: "color-mix(in oklab, var(--accent) 22%, transparent)", color: "var(--accent)" }}>
                            {r.name.slice(0, 2).toUpperCase()}
                          </span>
                          <div className="min-w-0 leading-tight">
                            <b className="block truncate text-[13.5px] font-bold">{r.name}</b>
                            <span className="text-[11px]" style={{ color: "var(--muted)" }}>
                              {r.role}
                            </span>
                          </div>
                          <span className="ml-auto font-mono text-[11px] tracking-[1.5px] transition-colors duration-700" style={{ color: "var(--accent)" }}>
                            ★★★★★
                          </span>
                        </div>
                        <p className="mt-2.5 text-[13.5px] leading-relaxed">“{r.text}”</p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* buy card */}
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={rise}>
              <Glass id="buy-card" className="sticky top-28 p-6">
                <div className="flex items-baseline justify-between">
                  <b className="text-[20px] font-extrabold tracking-tight">LUMA Arc</b>
                  <span className="font-mono text-[26px] font-bold">$249</span>
                </div>
                <p className="mt-1 flex items-center gap-2 text-[13px] transition-colors duration-700" style={{ color: "var(--muted)" }}>
                  <span className="relative flex size-2">
                    <span className="absolute inset-0 rounded-full opacity-60 [animation:luma-breathe_2s_ease-in-out_infinite]" style={{ background: "var(--accent)" }} />
                    <span className="size-2 rounded-full" style={{ background: "var(--accent)" }} />
                  </span>
                  {p.name} edition · 263 pre-orders this week
                </p>
                <ul className="mt-5 grid gap-2.5 text-[13.5px]">
                  {["2700–6500K light engine · CRI 97", "Matter · HomeKit · Alexa", "3 scenes on the head", "5-year warranty"].map((f) => (
                    <li key={f} className="flex items-center gap-2.5">
                      <svg viewBox="0 0 24 24" className="size-4 flex-none transition-colors duration-700" style={{ color: "var(--accent)" }} fill="none" stroke="currentColor" strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M5 12.5l4.5 4.5L19 7.5" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <motion.button
                  id="buy"
                  type="button"
                  onClick={order}
                  whileTap={{ scale: 0.97 }}
                  className="shimmer relative mt-6 flex h-13 w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl text-[15px] font-bold transition-colors duration-700"
                  style={{ background: "var(--accent)", color: "var(--on-accent)", boxShadow: "0 18px 40px -16px var(--shadow)" }}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {buy === "idle" && (
                      <motion.span key="i" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.16 }}>
                        Pre-order the {p.name} edition
                      </motion.span>
                    )}
                    {buy === "loading" && (
                      <motion.span key="l" className="flex items-center gap-2.5" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.16 }}>
                        <span className="size-4 animate-[ob-spin_.7s_linear_infinite] rounded-full border-2 border-current border-t-transparent" />
                        Securing checkout…
                      </motion.span>
                    )}
                    {buy === "done" && (
                      <motion.span key="d" className="flex items-center gap-2" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 480, damping: 20 }}>
                        Order confirmed ✓
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
                <span className="pointer-events-none absolute bottom-10 left-1/2">
                  <Confetti fire={buy === "done" ? 1 : 0} />
                </span>
                <p className="mt-3 text-center text-[12px] transition-colors duration-700" style={{ color: "var(--muted)" }}>
                  No charge until it ships · cancel anytime
                </p>
              </Glass>
            </motion.div>
          </div>
        </section>

        {/* footer */}
        <footer className="relative z-10 overflow-hidden border-t pt-10 transition-colors duration-700" style={{ borderColor: "var(--border)" }}>
          <p className="text-center font-mono text-[12px] tracking-wide transition-colors duration-700" style={{ color: "var(--muted)" }}>
            LUMA is a concept product designed for this demo · Built with Next.js + Tailwind + Motion · @codewithdolly_
          </p>
          <div aria-hidden className="pointer-events-none mx-auto -mb-10 select-none text-center text-[21vw] leading-[0.72] font-black tracking-[-0.05em] transition-colors duration-700" style={{ color: "color-mix(in oklab, var(--fg) 5%, transparent)" }}>
            LUMA
          </div>
        </footer>
      </div>
    </MotionConfig>
  );
}
