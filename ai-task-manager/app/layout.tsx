import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Task Manager",
  description: "Router-based multi-agent chat",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
