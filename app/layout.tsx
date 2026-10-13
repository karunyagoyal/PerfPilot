import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PerfPilot — Web Performance Audits",
  description: "Instant Lighthouse + CrUX + AI performance reports for any URL",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-gray-100 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
