"use client";

import { motion, useReducedMotion } from "framer-motion";
import { profile, heroMetrics } from "@/lib/data";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const rise = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

export default function Hero() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative border-b border-line px-6 pt-28 pb-16 md:px-12 md:pt-36 md:pb-24 lg:px-16">
      <motion.div
        variants={reduceMotion ? undefined : container}
        initial={reduceMotion ? undefined : "hidden"}
        animate={reduceMotion ? undefined : "show"}
        className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8"
      >
        {/* LEFT — floating bio card */}
        <motion.div variants={reduceMotion ? undefined : rise} className="lg:col-span-4">
          <div className="sticky top-24 rounded-2xl border border-line bg-surface/80 p-5 shadow-card backdrop-blur-sm">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-surface2">
              {/* Placeholder graphic — replace src with /portrait.jpg once you add a real photo to /public */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/profile.png"
                alt={profile.portraitAlt}
                className="absolute inset-0 h-full w-full object-cover grayscale contrast-125"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-base/80 via-transparent to-transparent" />
            </div>

            <div className="mt-5 flex items-center justify-between">
              <div>
                <p className="font-display text-lg font-bold leading-tight text-ink">{profile.name}</p>
                <p className="font-mono text-xs uppercase tracking-wider text-muted">{profile.location}</p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-full border border-line bg-base/60 px-3 py-2">
              <span className="relative flex h-2 w-2">
                {profile.isAvailable && (
                  <span className="absolute inline-flex h-full w-full animate-blink rounded-full bg-accent" />
                )}
                <span
                  className={`relative inline-flex h-2 w-2 rounded-full ${profile.isAvailable ? "bg-accent" : "bg-muted"
                    }`}
                />
              </span>
              <span className="font-mono text-[11px] uppercase tracking-wider text-ink/90">
                {profile.availability}
              </span>
            </div>
          </div>
        </motion.div>

        {/* RIGHT — massive headline + metrics */}
        <div className="lg:col-span-8">
          <motion.p
            variants={reduceMotion ? undefined : rise}
            className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-accent-soft"
          >
            [ 01 ] — {profile.role}
          </motion.p>

          <motion.h1
            variants={reduceMotion ? undefined : rise}
            className="text-balance font-display text-hero font-black uppercase text-ink"
          >
            Software
            <br />
            <span className="text-transparent [-webkit-text-stroke:2px_#eae4da]">Engineer</span>
          </motion.h1>

          <motion.p
            variants={reduceMotion ? undefined : rise}
            className="mt-6 max-w-xl text-balance font-mono text-sm uppercase tracking-[0.2em] text-accent"
          >
            Code as Art
          </motion.p>

          <motion.div
            variants={reduceMotion ? undefined : rise}
            className="mt-12 grid grid-cols-3 divide-x divide-line border-t border-line pt-6"
          >
            {heroMetrics.map((m) => (
              <div key={m.label} className="pl-4 first:pl-0 sm:pl-6">
                <p className="font-display text-2xl font-extrabold text-ink sm:text-3xl">{m.value}</p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted sm:text-xs">
                  {m.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
