"use client";

import { AnimatePresence, MotionConfig, motion, type Variants } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Confetti } from "./confetti";
import { DEFAULT_PALETTE, PALETTES, paletteStyle } from "./palettes";

const ease = [0.2, 0.8, 0.2, 1] as const;
const DANGER = "#E5484D";

const rise: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease } },
};

const PHOTOS: Record<string, string> = { aurora: "/luma/aurora.jpg", daybreak: "/luma/daybreak.jpg", espresso: "/luma/espresso.jpg" };
const PRICE = 249;

/* ------------------------------------------------------------- validation */

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
const fmtCard = (v: string) => v.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");
const fmtExp = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};
const luhn = (v: string) => {
  const d = v.replace(/\D/g, "");
  if (d.length !== 16) return false;
  let sum = 0;
  for (let i = 0; i < 16; i++) {
    let n = +d[15 - i];
    if (i % 2 === 1) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
  }
  return sum % 10 === 0;
};
const expOk = (v: string) => {
  const m = v.match(/^(\d{2})\/(\d{2})$/);
  if (!m) return false;
  const mm = +m[1];
  return mm >= 1 && mm <= 12 && +m[2] >= 26;
};
const strength = (v: string) => {
  let s = 0;
  if (v.length >= 8) s++;
  if (/[A-Z]/.test(v)) s++;
  if (/\d/.test(v)) s++;
  if (/[^A-Za-z0-9]/.test(v)) s++;
  return v.length === 0 ? 0 : Math.max(1, s);
};
const STRENGTH_LABEL = ["", "Weak", "Okay", "Good", "Strong"];

/* ----------------------------------------------------------------- pieces */

function Panel({ id, className = "", children }: { id?: string; className?: string; children: ReactNode }) {
  return (
    <motion.section
      id={id}
      variants={rise}
      initial="hidden"
      animate="show"
      className={`relative rounded-3xl border p-6 backdrop-blur-xl transition-colors duration-700 sm:p-7 ${className}`}
      style={{ background: "var(--glass)", borderColor: "var(--border)", boxShadow: "0 30px 60px -35px var(--shadow)" }}
    >
      {children}
    </motion.section>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  autoComplete,
  error,
  mono = false,
  maxLength,
  inputMode,
  className = "",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  error?: string | null;
  mono?: boolean;
  maxLength?: number;
  inputMode?: "numeric" | "email" | "tel" | "text";
  className?: string;
}) {
  return (
    <label htmlFor={id} className={`block ${className}`}>
      <span className="mb-1.5 flex items-baseline justify-between text-[12px] font-bold tracking-wide transition-colors duration-700" style={{ color: "var(--muted)" }}>
        {label.toUpperCase()}
        {error && (
          <motion.em initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="font-sans text-[11.5px] font-semibold not-italic" style={{ color: DANGER }}>
            {error}
          </motion.em>
        )}
      </span>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        spellCheck={false}
        maxLength={maxLength}
        inputMode={inputMode}
        className={`h-12 w-full rounded-xl border px-3.5 text-[14.5px] font-medium outline-none transition-[border-color,background,box-shadow] duration-300 focus:ring-2 ${mono ? "font-mono tracking-wide" : ""}`}
        style={{
          background: "color-mix(in oklab, var(--bg) 55%, transparent)",
          borderColor: error ? DANGER : "var(--border)",
          color: "var(--fg)",
          ["--tw-ring-color" as string]: "color-mix(in oklab, var(--accent) 55%, transparent)",
        }}
      />
    </label>
  );
}

function AccentButton({ id, onClick, disabled, children }: { id?: string; onClick?: () => void; disabled?: boolean; children: ReactNode }) {
  return (
    <motion.button
      id={id}
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      className="shimmer relative flex h-12.5 w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl text-[14.5px] font-bold transition-[background,color,opacity] duration-500 disabled:cursor-not-allowed disabled:opacity-45"
      style={{ background: "var(--accent)", color: "var(--on-accent)", boxShadow: "0 18px 40px -16px var(--shadow)" }}
    >
      {children}
    </motion.button>
  );
}

function Spinner() {
  return <span className="size-4 animate-[ob-spin_.7s_linear_infinite] rounded-full border-2 border-current border-t-transparent" />;
}

function DoneRow({ title, value, onEdit, editId }: { title: string; value: string; onEdit: () => void; editId: string }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
      <span className="grid size-7 shrink-0 place-items-center rounded-full text-[13px] font-black transition-colors duration-700" style={{ background: "var(--accent)", color: "var(--on-accent)" }}>
        ✓
      </span>
      <div className="min-w-0">
        <b className="block text-[14px]">{title}</b>
        <span className="block truncate text-[12.5px] transition-colors duration-700" style={{ color: "var(--muted)" }}>
          {value}
        </span>
      </div>
      <button id={editId} type="button" onClick={onEdit} className="ml-auto cursor-pointer rounded-lg border px-3 py-1.5 text-[12px] font-bold transition-colors duration-700" style={{ borderColor: "var(--border)", color: "var(--muted)" }}>
        Edit
      </button>
    </motion.div>
  );
}

function Lock() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="4" y="11" width="16" height="10" rx="2.5" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

/* ------------------------------------------------------------------- page */

type Tab = "signin" | "register";
type Step = 1 | 2 | 3;

export function LumaCheckout() {
  const [pi, setPi] = useState(DEFAULT_PALETTE);
  const p = PALETTES[pi];

  const [tab, setTab] = useState<Tab>("signin");
  const [authed, setAuthed] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [step, setStep] = useState<Step>(1);
  const [shipDone, setShipDone] = useState(false);
  const [paid, setPaid] = useState<"idle" | "busy" | "done">("idle");
  const [orderId, setOrderId] = useState("");

  // account
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [tried, setTried] = useState(false);

  // shipping
  const [addr, setAddr] = useState("");
  const [city, setCity] = useState("");
  const [pin, setPin] = useState("");
  const [phone, setPhone] = useState("");
  const [shipTried, setShipTried] = useState(false);

  // payment
  const [card, setCard] = useState("");
  const [exp, setExp] = useState("");
  const [cvc, setCvc] = useState("");
  const [payTried, setPayTried] = useState(false);

  // summary
  const [qty, setQty] = useState(1);
  const [promo, setPromo] = useState("");
  const [promoState, setPromoState] = useState<"idle" | "ok" | "bad">("idle");

  useEffect(() => {
    const w = window as unknown as Record<string, unknown>;
    w.__setPalette = (i: number) => setPi(((i % PALETTES.length) + PALETTES.length) % PALETTES.length);
  }, []);

  const pwScore = strength(pass);
  const nameErr = tried && tab === "register" && name.trim().length < 2 ? "Add your name" : null;
  const emailErr = tried && !emailOk(email) ? "Check the email" : null;
  const passErr = tried && pwScore < 2 ? "Too weak" : null;
  const canAuth = tab === "register" ? name.trim().length >= 2 && emailOk(email) && pwScore >= 2 : emailOk(email) && pass.length >= 6;

  const shipOk = addr.trim().length > 5 && city.trim().length >= 2 && /^\d{6}$/.test(pin) && phone.replace(/\D/g, "").length >= 10;
  const cardOk = luhn(card);
  const payOk = cardOk && expOk(exp) && /^\d{3}$/.test(cvc);

  const subtotal = PRICE * qty;
  const discount = promoState === "ok" ? subtotal * 0.1 : 0;
  const tax = (subtotal - discount) * 0.08;
  const total = subtotal - discount + tax;
  const fmt = (n: number) => `$${n.toFixed(2)}`;

  function signIn() {
    setTried(true);
    if (!canAuth || authBusy) return;
    setAuthBusy(true);
    setTimeout(() => {
      setAuthBusy(false);
      setAuthed(true);
      setStep(2);
      setTried(false);
    }, 1100);
  }

  function toPayment() {
    setShipTried(true);
    if (!shipOk) return;
    setShipDone(true);
    setStep(3);
  }

  function pay() {
    setPayTried(true);
    if (!payOk || paid !== "idle") return;
    setPaid("busy");
    setTimeout(() => {
      setOrderId(`LUMA-${Math.floor(10000 + Math.random() * 89999)}`);
      setPaid("done");
    }, 1500);
  }

  function signOut() {
    setAuthed(false);
    setStep(1);
    setShipDone(false);
    setPaid("idle");
    setTried(false);
    setShipTried(false);
    setPayTried(false);
  }

  function applyPromo() {
    if (promo.trim().toUpperCase() === "LUMA10") setPromoState("ok");
    else setPromoState("bad");
  }

  const steps = [
    { n: 1, t: "Account", done: authed, locked: false },
    { n: 2, t: "Shipping", done: shipDone, locked: !authed },
    { n: 3, t: "Payment", done: paid === "done", locked: !shipDone && !(authed && step === 3) },
  ];

  const cardDigits = card;

  return (
    <MotionConfig reducedMotion="user">
      <div id="luma-checkout" className="min-h-screen overflow-x-clip font-sans transition-colors duration-700" style={{ ...paletteStyle(p), background: "var(--bg)", color: "var(--fg)" }}>
        {/* ambient wash + grain + vignette (same stage as the landing) */}
        <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div className="absolute -top-48 left-1/2 size-[760px] -translate-x-1/2 rounded-full opacity-[.13] blur-[140px] transition-colors duration-700" style={{ background: "var(--accent)" }} />
          <div className="absolute inset-0 opacity-[.05] mix-blend-overlay" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 120% 90% at 50% 20%, transparent 60%, var(--shadow))", opacity: 0.5 }} />
        </div>

        {/* nav */}
        <motion.nav
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
          className="sticky top-4 z-40 mx-auto flex h-16 w-[min(1180px,calc(100%-48px))] items-center gap-5 rounded-2xl border px-5 backdrop-blur-2xl transition-colors duration-700"
          style={{ background: "color-mix(in oklab, var(--bg) 72%, transparent)", borderColor: "var(--border)", boxShadow: "0 20px 40px -28px var(--shadow)" }}
        >
          <Link href="/" id="back-to-luma" className="flex items-center gap-2.5 text-[17px] font-extrabold tracking-tight">
            <span className="grid size-8 place-items-center rounded-lg font-black transition-colors duration-700" style={{ background: "var(--accent)", color: "var(--on-accent)" }}>
              L
            </span>
            LUMA
          </Link>
          <span className="hidden items-center gap-2 text-[13px] font-semibold sm:flex" style={{ color: "var(--muted)" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <rect x="4" y="11" width="16" height="10" rx="2.5" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
            Secure checkout
          </span>
          <div className="ml-auto flex items-center gap-2.5 rounded-full border px-3 py-2 transition-colors duration-700" style={{ borderColor: "var(--border)", background: "var(--glass)" }} role="radiogroup" aria-label="Palette">
            {PALETTES.map((pal, i) => (
              <button key={pal.id} id={`nav-p${i}`} type="button" role="radio" aria-checked={i === pi} aria-label={pal.name} onClick={() => setPi(i)} className="relative grid size-6 cursor-pointer place-items-center rounded-full">
                {i === pi && <motion.span layoutId="nav-dot" className="absolute inset-0 rounded-full border-2" style={{ borderColor: pal.c10.hex }} transition={{ type: "spring", stiffness: 500, damping: 30 }} />}
                <span className="size-3.5 rounded-full" style={{ background: pal.c10.hex }} />
              </button>
            ))}
          </div>
          <AnimatePresence>
            {authed && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="hidden items-center gap-2.5 rounded-full border py-1.5 pr-3 pl-1.5 sm:flex" style={{ borderColor: "var(--border)", background: "var(--glass)" }}>
                <span className="grid size-7 place-items-center rounded-full text-[12px] font-black transition-colors duration-700" style={{ background: "var(--accent)", color: "var(--on-accent)" }}>
                  {(name.trim()[0] || "L").toUpperCase()}
                </span>
                <span className="max-w-36 truncate text-[12.5px] font-bold">{name.trim() || email}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.nav>

        {/* ghost word */}
        <span aria-hidden className="pointer-events-none absolute top-20 right-6 z-0 select-none text-[150px] leading-none font-black tracking-[-0.06em] transition-colors duration-700" style={{ color: "color-mix(in oklab, var(--fg) 4%, transparent)" }}>
          LUMA
        </span>

        <main className="relative z-10 mx-auto w-[min(1180px,calc(100%-48px))] pt-10 pb-20">
          {/* heading + steps */}
          <motion.div variants={rise} initial="hidden" animate="show" className="mb-7">
            <h1 className="text-[40px] leading-tight font-black tracking-[-0.03em]">Checkout</h1>
            <div id="steps" className="mt-4 flex items-center gap-2.5">
              {steps.map((s, i) => {
                const active = step === s.n && paid !== "done";
                return (
                  <div key={s.n} className="flex items-center gap-2.5">
                    {i > 0 && (
                      <span className="h-0.5 w-8 overflow-hidden rounded-full transition-colors duration-700 sm:w-14" style={{ background: "var(--border)" }}>
                        <motion.i className="block h-full" style={{ background: "var(--accent)" }} initial={false} animate={{ scaleX: steps[i - 1].done ? 1 : 0 }} transition={{ duration: 0.5, ease }} />
                      </span>
                    )}
                    <span
                      className="flex items-center gap-2 rounded-full border py-1.5 pr-3.5 pl-1.5 text-[12.5px] font-bold transition-colors duration-700"
                      style={{
                        borderColor: active ? "var(--accent)" : "var(--border)",
                        background: active ? "color-mix(in oklab, var(--accent) 12%, transparent)" : "var(--glass)",
                        color: s.locked ? "var(--muted)" : "var(--fg)",
                        opacity: s.locked ? 0.65 : 1,
                      }}
                    >
                      <i
                        className="grid size-6 place-items-center rounded-full font-mono text-[11px] font-black not-italic transition-colors duration-700"
                        style={s.done ? { background: "var(--accent)", color: "var(--on-accent)" } : { background: "color-mix(in oklab, var(--fg) 8%, transparent)", color: "var(--muted)" }}
                      >
                        {s.done ? "✓" : s.locked ? <Lock /> : s.n}
                      </i>
                      {s.t}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          <div className="grid items-start gap-6 lg:grid-cols-[1fr_400px]">
            {/* ------------------------------------------------ left: the flow */}
            <div className="grid gap-5">
              <AnimatePresence mode="wait">
                {paid === "done" ? (
                  /* -------------------------------------------------- success */
                  <motion.div key="success" initial={{ opacity: 0, y: 26, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.6, ease }}>
                    <Panel id="success" className="relative overflow-hidden text-center">
                      <span className="pointer-events-none absolute top-24 left-1/2">
                        <Confetti fire={1} />
                      </span>
                      <motion.svg width="84" height="84" viewBox="0 0 84 84" fill="none" className="mx-auto mt-2" aria-hidden>
                        <motion.circle cx="42" cy="42" r="38" stroke="var(--accent)" strokeWidth="4" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, ease }} />
                        <motion.path d="M26 43.5 L37 54.5 L58 32" stroke="var(--accent)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.55, ease }} />
                      </motion.svg>
                      <h2 className="mt-5 text-[30px] font-black tracking-[-0.02em]">Order confirmed</h2>
                      <p className="mx-auto mt-2 max-w-md text-[14.5px] leading-relaxed transition-colors duration-700" style={{ color: "var(--muted)" }}>
                        The {p.name} edition is yours. A receipt is on its way to <b style={{ color: "var(--fg)" }}>{email}</b> — no charge until it ships in March.
                      </p>
                      <div className="mx-auto mt-6 flex w-fit items-center gap-3 rounded-2xl border px-5 py-3 font-mono text-[14px] font-bold tracking-wider transition-colors duration-700" style={{ borderColor: "var(--border)", background: "color-mix(in oklab, var(--bg) 55%, transparent)" }}>
                        <span style={{ color: "var(--muted)" }}>ORDER</span>
                        {orderId}
                      </div>
                      <div className="mx-auto mt-7 flex max-w-sm gap-3">
                        <Link href="/" className="flex h-12 flex-1 items-center justify-center rounded-2xl text-[14px] font-bold transition-colors duration-700" style={{ background: "var(--accent)", color: "var(--on-accent)" }}>
                          Back to the lamp
                        </Link>
                        <button type="button" onClick={signOut} className="h-12 cursor-pointer rounded-2xl border px-5 text-[14px] font-bold transition-colors duration-700" style={{ borderColor: "var(--border)", color: "var(--muted)" }}>
                          New order
                        </button>
                      </div>
                    </Panel>
                  </motion.div>
                ) : (
                  <motion.div key="flow" className="grid gap-5" exit={{ opacity: 0, y: -18, transition: { duration: 0.3 } }}>
                    {/* -------------------------------------------- 1 · account */}
                    <Panel id="account">
                      {!authed ? (
                        <>
                          <div className="flex items-center justify-between">
                            <h2 className="text-[19px] font-extrabold tracking-tight">Sign in to continue</h2>
                            <span className="rounded-full border px-3 py-1 font-mono text-[10.5px] font-bold tracking-[2px] transition-colors duration-700" style={{ borderColor: "var(--border)", color: "var(--accent)" }}>
                              STEP 1 / 3
                            </span>
                          </div>
                          <p className="mt-1 text-[13px] transition-colors duration-700" style={{ color: "var(--muted)" }}>
                            Orders are tied to an account — warranty, tracking and the app live there.
                          </p>

                          {/* tabs */}
                          <div className="mt-5 flex w-fit rounded-xl border p-1 transition-colors duration-700" style={{ borderColor: "var(--border)", background: "color-mix(in oklab, var(--bg) 55%, transparent)" }} role="tablist" aria-label="Account">
                            {(
                              [
                                ["signin", "Sign in"],
                                ["register", "Create account"],
                              ] as [Tab, string][]
                            ).map(([k, label]) => (
                              <button key={k} id={`tab-${k}`} type="button" role="tab" aria-selected={tab === k} onClick={() => { setTab(k); setTried(false); }} className="relative cursor-pointer rounded-lg px-4 py-2 text-[13px] font-bold">
                                {tab === k && <motion.span layoutId="auth-tab" className="absolute inset-0 rounded-lg transition-colors duration-700" style={{ background: "var(--accent)" }} transition={{ type: "spring", stiffness: 480, damping: 34 }} />}
                                <span className="relative transition-colors duration-500" style={{ color: tab === k ? "var(--on-accent)" : "var(--muted)" }}>
                                  {label}
                                </span>
                              </button>
                            ))}
                          </div>

                          <AnimatePresence mode="wait" initial={false}>
                            <motion.div key={tab} initial={{ opacity: 0, x: tab === "register" ? 24 : -24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: tab === "register" ? -24 : 24 }} transition={{ duration: 0.3, ease }} className="mt-5 grid gap-4">
                              {tab === "register" && <Field id="reg-name" label="Full name" value={name} onChange={setName} placeholder="Your name" autoComplete="name" error={nameErr} />}
                              <Field id={tab === "register" ? "reg-email" : "in-email"} label="Email" value={email} onChange={setEmail} type="email" inputMode="email" placeholder="you@studio.com" autoComplete="email" error={emailErr} />
                              <div>
                                <Field id={tab === "register" ? "reg-pass" : "in-pass"} label="Password" value={pass} onChange={setPass} type="password" placeholder={tab === "register" ? "8+ characters" : "Your password"} autoComplete={tab === "register" ? "new-password" : "current-password"} error={passErr} />
                                {tab === "register" && (
                                  <div className="mt-2.5 flex items-center gap-2">
                                    <div className="flex flex-1 gap-1.5">
                                      {[1, 2, 3, 4].map((i) => (
                                        <motion.i key={i} className="h-1 flex-1 rounded-full" initial={false} animate={{ background: pwScore >= i ? (pwScore <= 1 ? DANGER : pwScore === 2 ? "color-mix(in oklab, var(--accent) 55%, var(--muted))" : "var(--accent)") : "color-mix(in oklab, var(--fg) 12%, transparent)" }} transition={{ duration: 0.3 }} />
                                      ))}
                                    </div>
                                    <span className="w-14 text-right font-mono text-[10.5px] font-bold tracking-wide transition-colors duration-700" style={{ color: pwScore >= 3 ? "var(--accent)" : "var(--muted)" }}>
                                      {STRENGTH_LABEL[pwScore].toUpperCase()}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <AccentButton id={tab === "register" ? "btn-create" : "btn-signin"} onClick={signIn} disabled={authBusy}>
                                <AnimatePresence mode="wait" initial={false}>
                                  {authBusy ? (
                                    <motion.span key="b" className="flex items-center gap-2.5" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
                                      <Spinner />
                                      {tab === "register" ? "Creating your account…" : "Signing in…"}
                                    </motion.span>
                                  ) : (
                                    <motion.span key="i" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
                                      {tab === "register" ? "Create account & continue" : "Sign in & continue"}
                                    </motion.span>
                                  )}
                                </AnimatePresence>
                              </AccentButton>
                              <p className="text-center text-[11.5px] transition-colors duration-700" style={{ color: "var(--muted)" }}>
                                {tab === "register" ? "By continuing you accept the demo terms — nothing is stored." : "Demo sign-in — any valid email works."}
                              </p>
                            </motion.div>
                          </AnimatePresence>
                        </>
                      ) : (
                        <DoneRow title="Account" value={`${name.trim() || "Signed in"} · ${email}`} onEdit={signOut} editId="edit-account" />
                      )}
                    </Panel>

                    {/* ------------------------------------------- 2 · shipping */}
                    <AnimatePresence>
                      {authed && (
                        <motion.div key="ship" initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease }}>
                          <Panel id="shipping">
                            {!shipDone || step === 2 ? (
                              <>
                                <div className="flex items-center justify-between">
                                  <h2 className="text-[19px] font-extrabold tracking-tight">Where should it land?</h2>
                                  <span className="rounded-full border px-3 py-1 font-mono text-[10.5px] font-bold tracking-[2px] transition-colors duration-700" style={{ borderColor: "var(--border)", color: "var(--accent)" }}>
                                    STEP 2 / 3
                                  </span>
                                </div>
                                <div className="mt-5 grid gap-4">
                                  <Field id="ship-addr" label="Address" value={addr} onChange={setAddr} placeholder="Street, building, flat" autoComplete="street-address" error={shipTried && addr.trim().length <= 5 ? "Too short" : null} />
                                  <div className="grid gap-4 sm:grid-cols-[1.2fr_0.8fr]">
                                    <Field id="ship-city" label="City" value={city} onChange={setCity} placeholder="City" autoComplete="address-level2" error={shipTried && city.trim().length < 2 ? "Required" : null} />
                                    <Field id="ship-pin" label="PIN code" value={pin} onChange={(v) => setPin(v.replace(/\D/g, "").slice(0, 6))} placeholder="560001" inputMode="numeric" mono autoComplete="postal-code" error={shipTried && !/^\d{6}$/.test(pin) ? "6 digits" : null} />
                                  </div>
                                  <Field id="ship-phone" label="Phone" value={phone} onChange={setPhone} placeholder="+91 98765 43210" inputMode="tel" mono autoComplete="tel" error={shipTried && phone.replace(/\D/g, "").length < 10 ? "Check the number" : null} />
                                  <AccentButton id="btn-to-payment" onClick={toPayment}>
                                    Continue to payment
                                  </AccentButton>
                                </div>
                              </>
                            ) : (
                              <DoneRow title="Shipping" value={`${addr.trim()}, ${city.trim()} ${pin}`} onEdit={() => { setShipDone(false); setStep(2); }} editId="edit-shipping" />
                            )}
                          </Panel>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* -------------------------------------------- 3 · payment */}
                    <AnimatePresence>
                      {shipDone && step === 3 && (
                        <motion.div key="pay" initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease }}>
                          <Panel id="payment">
                            <div className="flex items-center justify-between">
                              <h2 className="text-[19px] font-extrabold tracking-tight">Payment</h2>
                              <span className="rounded-full border px-3 py-1 font-mono text-[10.5px] font-bold tracking-[2px] transition-colors duration-700" style={{ borderColor: "var(--border)", color: "var(--accent)" }}>
                                STEP 3 / 3
                              </span>
                            </div>

                            <div className="mt-5 grid items-start gap-5 md:grid-cols-[1fr_250px]">
                              <div className="grid gap-4">
                                <Field id="card-number" label="Card number" value={cardDigits} onChange={(v) => setCard(fmtCard(v))} placeholder="4242 4242 4242 4242" inputMode="numeric" mono maxLength={19} autoComplete="cc-number" error={payTried && !cardOk ? "Card check failed" : null} />
                                <div className="grid grid-cols-2 gap-4">
                                  <Field id="card-exp" label="Expiry" value={exp} onChange={(v) => setExp(fmtExp(v))} placeholder="MM/YY" inputMode="numeric" mono maxLength={5} autoComplete="cc-exp" error={payTried && !expOk(exp) ? "MM/YY" : null} />
                                  <Field id="card-cvc" label="CVC" value={cvc} onChange={(v) => setCvc(v.replace(/\D/g, "").slice(0, 3))} placeholder="•••" type="password" inputMode="numeric" mono maxLength={3} autoComplete="cc-csc" error={payTried && !/^\d{3}$/.test(cvc) ? "3 digits" : null} />
                                </div>
                                <AccentButton id="btn-pay" onClick={pay} disabled={paid === "busy"}>
                                  <AnimatePresence mode="wait" initial={false}>
                                    {paid === "busy" ? (
                                      <motion.span key="b" className="flex items-center gap-2.5" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
                                        <Spinner />
                                        Talking to the bank…
                                      </motion.span>
                                    ) : (
                                      <motion.span key="i" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
                                        Pay {fmt(total)}
                                      </motion.span>
                                    )}
                                  </AnimatePresence>
                                </AccentButton>
                                <p className="flex items-center justify-center gap-1.5 text-[11.5px] transition-colors duration-700" style={{ color: "var(--muted)" }}>
                                  <Lock /> Demo payment — the card never leaves this page.
                                </p>
                              </div>

                              {/* live card preview */}
                              <motion.div
                                initial={{ opacity: 0, rotate: 2, y: 10 }}
                                animate={{ opacity: 1, rotate: 0, y: 0 }}
                                transition={{ duration: 0.6, ease, delay: 0.15 }}
                                className="relative aspect-[1.586] overflow-hidden rounded-2xl border p-4 transition-colors duration-700"
                                style={{ background: `linear-gradient(135deg, ${p.c60.hex}, color-mix(in oklab, ${p.c60.hex} 62%, ${p.c10.hex}))`, borderColor: "var(--border)", boxShadow: "0 24px 48px -24px var(--shadow)" }}
                                aria-hidden
                              >
                                <div className="flex items-center justify-between">
                                  <span className="grid size-7 place-items-center rounded-md text-[12px] font-black" style={{ background: p.c10.hex, color: p.c60.hex }}>
                                    L
                                  </span>
                                  <span className="font-mono text-[10px] font-bold tracking-[2px]" style={{ color: `color-mix(in oklab, ${p.c30.hex} 80%, transparent)` }}>
                                    {card.replace(/\D/g, "").startsWith("4") ? "VISA" : card.replace(/\D/g, "").startsWith("5") ? "MASTERCARD" : "DEMO"}
                                  </span>
                                </div>
                                <p className="mt-6 font-mono text-[14.5px] font-bold tracking-[2px]" style={{ color: p.c30.hex }}>
                                  {cardDigits || "•••• •••• •••• ••••"}
                                </p>
                                <div className="mt-4 flex items-end justify-between font-mono text-[10.5px] font-bold tracking-widest" style={{ color: `color-mix(in oklab, ${p.c30.hex} 75%, transparent)` }}>
                                  <span className="max-w-32 truncate">{(name.trim() || "LUMA MEMBER").toUpperCase()}</span>
                                  <span>{exp || "MM/YY"}</span>
                                </div>
                              </motion.div>
                            </div>
                          </Panel>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ------------------------------------------- right: order summary */}
            <Panel id="summary" className="lg:sticky lg:top-24">
              <div className="flex items-center justify-between">
                <h2 className="text-[16px] font-extrabold tracking-tight">Order summary</h2>
                <span className="font-mono text-[10.5px] font-bold tracking-[2px] transition-colors duration-700" style={{ color: "var(--muted)" }}>
                  PRE-ORDER
                </span>
              </div>

              {/* the product = the palette */}
              <div className="mt-4 flex gap-4">
                <div className="relative aspect-[4/5] w-24 shrink-0 overflow-hidden rounded-xl border transition-colors duration-700" style={{ borderColor: "var(--border)" }}>
                  <AnimatePresence initial={false}>
                    <motion.span key={p.id} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6, ease }}>
                      <Image src={PHOTOS[p.id]} alt={`LUMA Arc · ${p.name}`} fill sizes="96px" className="object-cover" />
                    </motion.span>
                  </AnimatePresence>
                </div>
                <div className="min-w-0 flex-1">
                  <b className="block text-[15px] leading-snug">
                    LUMA Arc ·{" "}
                    <span className="transition-colors duration-700" style={{ color: "var(--accent)" }}>
                      {p.name}
                    </span>{" "}
                    edition
                  </b>
                  <span className="mt-1 block text-[12px] transition-colors duration-700" style={{ color: "var(--muted)" }}>
                    2700–6500K · flexible arc
                  </span>
                  <div className="mt-2 flex h-2 w-24 overflow-hidden rounded-full" aria-hidden>
                    <i style={{ background: p.c60.hex, width: "60%" }} />
                    <i style={{ background: p.c30.hex, width: "30%" }} />
                    <i style={{ background: p.c10.hex, width: "10%" }} />
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex items-center rounded-lg border transition-colors duration-700" style={{ borderColor: "var(--border)" }}>
                      <button id="qty-minus" type="button" aria-label="One less" onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid size-7 cursor-pointer place-items-center text-[14px] font-black transition-colors duration-700" style={{ color: "var(--muted)" }}>
                        −
                      </button>
                      <span className="w-6 text-center font-mono text-[13px] font-bold">{qty}</span>
                      <button id="qty-plus" type="button" aria-label="One more" onClick={() => setQty((q) => Math.min(3, q + 1))} className="grid size-7 cursor-pointer place-items-center text-[14px] font-black transition-colors duration-700" style={{ color: "var(--muted)" }}>
                        +
                      </button>
                    </div>
                    <span className="ml-auto font-mono text-[14.5px] font-bold">{fmt(PRICE * qty)}</span>
                  </div>
                </div>
              </div>

              {/* promo */}
              <div className="mt-5">
                <div className="flex gap-2">
                  <input
                    id="promo-input"
                    value={promo}
                    onChange={(e) => {
                      setPromo(e.target.value);
                      if (promoState === "bad") setPromoState("idle");
                    }}
                    placeholder="Promo code"
                    spellCheck={false}
                    className="h-10.5 min-w-0 flex-1 rounded-xl border px-3.5 font-mono text-[13px] font-bold tracking-wider uppercase outline-none transition-colors duration-700 focus:ring-2"
                    style={{ background: "color-mix(in oklab, var(--bg) 55%, transparent)", borderColor: promoState === "bad" ? DANGER : "var(--border)", color: "var(--fg)", ["--tw-ring-color" as string]: "color-mix(in oklab, var(--accent) 55%, transparent)" }}
                    disabled={promoState === "ok"}
                  />
                  <motion.button
                    id="promo-apply"
                    type="button"
                    onClick={applyPromo}
                    disabled={promoState === "ok" || !promo.trim()}
                    animate={promoState === "bad" ? { x: [0, -7, 7, -4, 4, 0] } : { x: 0 }}
                    transition={{ duration: 0.4 }}
                    className="h-10.5 cursor-pointer rounded-xl border px-4 text-[12.5px] font-bold transition-colors duration-700 disabled:cursor-not-allowed disabled:opacity-50"
                    style={{ borderColor: "var(--border)", color: "var(--fg)" }}
                  >
                    {promoState === "ok" ? "Applied ✓" : "Apply"}
                  </motion.button>
                </div>
                <AnimatePresence>
                  {promoState === "bad" && (
                    <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-1.5 overflow-hidden text-[11.5px] font-semibold" style={{ color: DANGER }}>
                      That code didn&apos;t match — try LUMA10.
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* totals */}
              <div className="mt-5 grid gap-2.5 border-t pt-4 text-[13.5px] transition-colors duration-700" style={{ borderColor: "var(--border)" }}>
                <div className="flex justify-between">
                  <span style={{ color: "var(--muted)" }}>Subtotal</span>
                  <span className="font-mono font-bold">{fmt(subtotal)}</span>
                </div>
                <AnimatePresence>
                  {promoState === "ok" && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="flex justify-between overflow-hidden">
                      <span className="transition-colors duration-700" style={{ color: "var(--accent)" }}>
                        LUMA10 · −10%
                      </span>
                      <span className="font-mono font-bold transition-colors duration-700" style={{ color: "var(--accent)" }}>
                        −{fmt(discount)}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="flex justify-between">
                  <span style={{ color: "var(--muted)" }}>Shipping</span>
                  <span className="font-mono font-bold">
                    <s className="mr-1.5 opacity-50">$19</s>Free
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "var(--muted)" }}>Tax (8%)</span>
                  <span className="font-mono font-bold">{fmt(tax)}</span>
                </div>
                <div className="mt-1 flex items-baseline justify-between border-t pt-3 transition-colors duration-700" style={{ borderColor: "var(--border)" }}>
                  <b className="text-[14.5px]">Total</b>
                  <motion.b key={total.toFixed(2)} initial={{ opacity: 0.4, y: 4 }} animate={{ opacity: 1, y: 0 }} className="font-mono text-[22px] tracking-tight transition-colors duration-700" style={{ color: "var(--accent)" }}>
                    {fmt(total)}
                  </motion.b>
                </div>
              </div>

              {/* trust */}
              <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                {[
                  ["Ships March", "M5 12h14M13 6l6 6-6 6"],
                  ["5-yr warranty", "M12 3l7 4v5c0 4.6-3 8-7 9-4-1-7-4.4-7-9V7z"],
                  ["Free returns", "M9 14 4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3"],
                ].map(([t, d]) => (
                  <span key={t} className="grid justify-items-center gap-1.5 rounded-xl border px-2 py-2.5 text-[10.5px] font-bold transition-colors duration-700" style={{ borderColor: "var(--border)", color: "var(--muted)" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d={d} />
                    </svg>
                    {t}
                  </span>
                ))}
              </div>
            </Panel>
          </div>

          <p className="mt-10 text-center font-mono text-[11px] tracking-wide transition-colors duration-700" style={{ color: "var(--muted)" }}>
            LUMA · demo checkout — no real charge, nothing stored
          </p>
        </main>
      </div>
    </MotionConfig>
  );
}
