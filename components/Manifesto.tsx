"use client";

import { motion, useReducedMotion } from "framer-motion";
import { manifesto } from "@/lib/data";

export default function Manifesto() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="border-b border-line px-6 py-20 md:px-12 md:py-28 lg:px-16">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-muted">
            {manifesto.eyebrow}
          </span>
        </div>
        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-9"
        >
          <p className="text-balance font-display text-3xl font-extrabold leading-[1.15] text-ink sm:text-4xl md:text-5xl">
            {manifesto.statement}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
