import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const inter = localFont({
  src: "../public/fonts/Inter.ttf",
  variable: "--font-inter",
  display: "swap",
  weight: "100 900",
});

const jbMono = localFont({
  src: "../public/fonts/JetBrainsMono.ttf",
  variable: "--font-jbmono",
  display: "swap",
  weight: "100 800",
});

const rubik = localFont({
  src: "../public/fonts/Rubik.ttf",
  variable: "--font-rubik",
  display: "swap",
  weight: "300 900",
});

export const metadata: Metadata = {
  title: "Rajkiran K R — Software Engineer",
  description:
    "Portfolio and resume of Rajkiran K R, a software engineer building systems in C, Java, PHP, and the web.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jbMono.variable} ${rubik.variable}`}
    >
      <body className="relative min-h-screen bg-base font-display antialiased">
        <div className="grain-overlay bg-grain" aria-hidden="true" />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}