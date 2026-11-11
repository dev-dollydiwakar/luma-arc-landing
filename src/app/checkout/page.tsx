import type { Metadata } from "next";
import { LumaCheckout } from "@/components/luma/checkout";

export const metadata: Metadata = {
  title: "Checkout · LUMA Arc",
  description: "An auth-gated checkout: sign in or register, shipping, a live card preview with real validation — all themed by one 60-30-10 palette.",
};

export default function CheckoutPage() {
  return <LumaCheckout />;
}
