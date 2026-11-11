import type { CSSProperties } from "react";

export interface Swatch {
  hex: string;
  name: string;
  pct: 60 | 30 | 10;
  role: string;
}

export interface Palette {
  id: string;
  name: string;
  tag: string;
  /** 60% base · 30% surface/text · 10% accent */
  c60: Swatch;
  c30: Swatch;
  c10: Swatch;
  vars: {
    bg: string;
    bg2: string;
    fg: string;
    muted: string;
    border: string;
    glass: string;
    accent: string;
    onAccent: string;
    shadow: string;
  };
}

export const PALETTES: Palette[] = [
  {
    id: "aurora",
    name: "Aurora",
    tag: "Midnight · Mint",
    c60: { hex: "#0D1117", name: "Midnight", pct: 60, role: "background" },
    c30: { hex: "#E6EDF3", name: "Frost", pct: 30, role: "text & surfaces" },
    c10: { hex: "#3DDC97", name: "Mint", pct: 10, role: "accent & light" },
    vars: {
      bg: "#0D1117",
      bg2: "#131A23",
      fg: "#E6EDF3",
      muted: "#8B97A5",
      border: "rgba(230,237,243,.14)",
      glass: "rgba(230,237,243,.055)",
      accent: "#3DDC97",
      onAccent: "#07130D",
      shadow: "rgba(2,6,12,.6)",
    },
  },
  {
    id: "daybreak",
    name: "Daybreak",
    tag: "Porcelain · Terracotta",
    c60: { hex: "#F3EFE7", name: "Porcelain", pct: 60, role: "background" },
    c30: { hex: "#1B1710", name: "Ink", pct: 30, role: "text & surfaces" },
    c10: { hex: "#C75B12", name: "Terracotta", pct: 10, role: "accent & light" },
    vars: {
      bg: "#F3EFE7",
      bg2: "#ECE6DA",
      fg: "#1B1710",
      muted: "#6E675B",
      border: "rgba(27,23,16,.14)",
      glass: "rgba(27,23,16,.045)",
      accent: "#C75B12",
      onAccent: "#FFF4EA",
      shadow: "rgba(27,23,16,.18)",
    },
  },
  {
    id: "espresso",
    name: "Espresso",
    tag: "Roast · Gold",
    c60: { hex: "#181210", name: "Roast", pct: 60, role: "background" },
    c30: { hex: "#F5EDE2", name: "Cream", pct: 30, role: "text & surfaces" },
    c10: { hex: "#E3B341", name: "Gold", pct: 10, role: "accent & light" },
    vars: {
      bg: "#181210",
      bg2: "#201814",
      fg: "#F5EDE2",
      muted: "#A3978A",
      border: "rgba(245,237,226,.14)",
      glass: "rgba(245,237,226,.055)",
      accent: "#E3B341",
      onAccent: "#1D1504",
      shadow: "rgba(8,4,2,.65)",
    },
  },
];

/** The palette as CSS custom properties (components read var(--bg) etc.). */
export function paletteStyle(p: Palette): CSSProperties {
  const v = p.vars;
  return {
    "--bg": v.bg,
    "--bg2": v.bg2,
    "--fg": v.fg,
    "--muted": v.muted,
    "--border": v.border,
    "--glass": v.glass,
    "--accent": v.accent,
    "--on-accent": v.onAccent,
    "--shadow": v.shadow,
  } as CSSProperties;
}
