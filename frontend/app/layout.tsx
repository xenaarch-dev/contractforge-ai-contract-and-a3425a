import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ContractForge — AI contracts for Indian freelancers",
  description: "Generate GST-compliant, PDF-ready freelance contracts in 30 seconds. Built for Indian freelancers.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
