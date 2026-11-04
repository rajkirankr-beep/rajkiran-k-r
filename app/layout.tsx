import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Rubik } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
});

const jbMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jbmono",
  display: "swap",
});

const rubik = Rubik({
  subsets: ["latin"],
  weight: ["800", "900"],
  variable: "--font-rubik",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Rajkiran K R — Software Engineer",
  description:
    "Portfolio and resume of Rajkiran K R, a software engineer building systems in C, Java, PHP, and the web.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jbMono.variable} ${rubik.variable}`}>
      <body className="relative min-h-screen bg-base font-display antialiased">
        <div className="grain-overlay bg-grain" aria-hidden="true" />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
