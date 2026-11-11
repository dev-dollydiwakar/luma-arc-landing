import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export: every demo is plain files, deployable anywhere (Vercel, GitHub Pages, Netlify).
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
