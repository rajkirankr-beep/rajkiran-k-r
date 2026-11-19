"use client";

import React, { useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import type { Project } from "@/lib/data";

type ProjectAccordionProps = {
  projects: Project[];
  initialActiveIndex?: number;
};

const QUIET_EASE = [0.25, 0.1, 0.25, 1] as const;

export function LandingAccordionItem({
  projects,
  initialActiveIndex = 0,
}: ProjectAccordionProps) {
  const safeInitial =
    projects.length > 0
      ? Math.min(Math.max(initialActiveIndex, 0), projects.length - 1)
      : 0;
  const [activeIndex, setActiveIndex] = useState<number>(safeInitial);

  if (!projects.length) return null;

  const activeProject = projects[activeIndex] ?? projects[0];

  return (
    <MotionConfig reducedMotion="user">
      <div className="w-full">
        {/* Mobile Layout */}
        <div className="flex flex-col gap-3 lg:hidden">
          {projects.map((project, index) => {
            const isActive = index === activeIndex;

            return (
              <div
                key={project.index}
                className={`overflow-hidden rounded-xl border transition-colors duration-200 ${
                  isActive
                    ? "border-accent/50 bg-surface"
                    : "border-line bg-surface/80"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-expanded={isActive}
                  className="flex w-full items-center justify-between gap-3 p-5 text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-semibold text-muted">
                      {project.index}
                    </span>
                    <span className="font-display text-lg font-extrabold text-ink">
                      {project.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-muted">
                      {project.year}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`text-muted transition-transform duration-200 ${
                        isActive ? "rotate-180 text-accent" : ""
                      }`}
                    />
                  </div>
                </button>

                {isActive && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, ease: QUIET_EASE }}
                    className="border-t border-line/70 px-5 pb-5 pt-4"
                  >
                    <p className="text-sm leading-relaxed text-muted">
                      {project.description}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {project.stack.map((tech) => (
                        <span
                          key={tech}
                          className="rounded border border-line bg-base/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-ink/75"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4">
                      <a
                        href={project.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-mono text-xs text-accent transition-opacity hover:opacity-80"
                      >
                        <span>Inspect Repository</span>
                        <ArrowUpRight size={14} strokeWidth={2.25} />
                      </a>
                    </div>
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>

        {/* Desktop Layout: 50/50 Split */}
        <div className="hidden lg:grid lg:grid-cols-12 lg:items-center lg:gap-10">
          {/* Left 50%: Minimal opacity-only cross-fade */}
          <div className="min-h-[320px] lg:col-span-6 flex flex-col justify-center">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeProject.index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18, ease: QUIET_EASE }}
              >
                <div className="mb-3 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-muted">
                  <span>{activeProject.year}</span>
                </div>

                <h3 className="font-display text-4xl font-extrabold leading-[1.06] tracking-tight text-ink xl:text-5xl">
                  {activeProject.title}
                </h3>

                <p className="mt-5 max-w-xl text-base leading-relaxed text-muted">
                  {activeProject.description}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {activeProject.stack.map((tech) => (
                    <span
                      key={tech}
                      className="rounded border border-line bg-surface px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-ink/75"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="mt-7 flex flex-wrap items-center gap-4">
                  <a
                    href={activeProject.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-ink px-5 py-3 font-mono text-xs font-semibold uppercase tracking-wider text-base transition-colors duration-200 hover:bg-accent hover:text-ink"
                  >
                    <span>Open Project</span>
                    <ArrowUpRight size={15} strokeWidth={2.25} />
                  </a>

                  <span className="font-mono text-xs text-muted">
                    Hover or click panels to switch
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right 50%: Expanding Cards */}
          <div className="lg:col-span-6">
            <div className="flex h-[420px] w-full flex-row items-stretch gap-3">
              {projects.map((project, index) => {
                const isActive = index === activeIndex;

                return (
                  <div
                    key={project.index}
                    role="button"
                    tabIndex={0}
                    onMouseEnter={() => setActiveIndex(index)}
                    onFocus={() => setActiveIndex(index)}
                    onClick={() => setActiveIndex(index)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setActiveIndex(index);
                      }
                    }}
                    className={`group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-xl border transition-[flex-grow,background-color,border-color] duration-300 ease-out ${
                      isActive
                        ? "flex-[4.2] border-line bg-surface p-6"
                        : "flex-[0.85] items-center border-line bg-surface/60 p-3 hover:bg-surface"
                    }`}
                  >
                    {!isActive && (
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 opacity-20 transition-opacity duration-200 group-hover:opacity-35"
                        style={{
                          backgroundImage:
                            "repeating-linear-gradient(-45deg, transparent, transparent 7px, rgba(255,255,255,0.04) 7px, rgba(255,255,255,0.04) 8px)",
                        }}
                      />
                    )}

                    {isActive ? (
                      <motion.div
                        key={`card-${project.index}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2, delay: 0.06, ease: QUIET_EASE }}
                        className="relative z-10 flex h-full w-full min-w-[240px] flex-col justify-between"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-muted">
                            {project.index}
                          </span>
                          <a
                            href={project.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 rounded-full border border-line bg-base/75 px-3 py-1 font-mono text-[11px] text-ink transition-colors hover:border-accent hover:text-accent"
                          >
                            <span>Source</span>
                            <ArrowUpRight size={13} strokeWidth={2.25} />
                          </a>
                        </div>

                        <div className="my-auto py-3">
                          <span className="font-mono text-[11px] uppercase tracking-widest text-muted">
                            {project.year}
                          </span>
                          <h4 className="mt-1 font-display text-2xl font-extrabold leading-tight text-ink">
                            {project.title}
                          </h4>
                          <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-muted">
                            {project.description}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {project.stack.map((tech) => (
                            <span
                              key={tech}
                              className="rounded border border-line bg-base/60 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-ink/75"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    ) : (
                      <div className="relative z-10 flex h-full w-full flex-col items-center justify-between py-1">
                        <span className="rounded border border-line/60 bg-base/80 px-1.5 py-0.5 font-mono text-[10px] font-bold text-muted transition-colors group-hover:border-line group-hover:text-ink/60">
                          {project.index}
                        </span>

                        <div className="flex flex-1 items-center justify-center">
                          <span className="whitespace-nowrap font-display text-sm font-black uppercase tracking-widest text-ink/50 -rotate-90 transition-colors duration-200 group-hover:text-ink/80">
                            {project.title}
                          </span>
                        </div>

                        <span className="font-mono text-[10px] text-muted/50 transition-colors group-hover:text-muted">
                          +
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}

export default LandingAccordionItem;
