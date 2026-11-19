"use client";

import { motion, useReducedMotion } from "framer-motion";
import { projects } from "@/lib/data";
import { LandingAccordionItem } from "@/components/ui/interactive-image-accordion";

export default function ProjectShowcase() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="border-b border-line px-6 py-20 md:px-12 md:py-28 lg:px-16">
      <h2 className="mb-10 font-mono text-xs uppercase tracking-[0.25em] text-muted">
        Selected Work
      </h2>

      <motion.div
        initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
        whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{
          duration: 0.55,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        <LandingAccordionItem projects={projects} />
      </motion.div>
    </section>
  );
}