# AGENTS.md — Portfolio Codebase Guide

## Project Overview
This is a Next.js portfolio web application styled with Tailwind CSS, TypeScript, Framer Motion, and `lucide-react`, deployed to Vercel (`https://rajkiran-k-r.vercel.app/`).

## Repository Structure
- `app/` — Next.js App Router entry points (`layout.tsx`, `page.tsx`, `globals.css`).
- `components/` — Page sections and feature components:
  - `IntroHero.tsx`, `Hero.tsx`, `Manifesto.tsx`, `ProjectShowcase.tsx`, `TechStackMatrix.tsx`, `CopyEmail.tsx`, `Footer.tsx`
- `components/ui/` — Reusable UI primitives and interactive widgets (e.g., `interactive-image-accordion.tsx`).
- `lib/data.ts` — Single source of truth for portfolio copy, profile metadata, metrics, tech stack, projects, and social links.
- `public/` — Static assets.

## Core Architecture & Editing Rules
1. **Data-Driven Content (`lib/data.ts`):**
   - Keep copy, project entries, stack tags, links, and profile details in `lib/data.ts` whenever possible.
   - Do not hardcode project lists or personal copy inside section/UI components if they belong in `lib/data.ts`.
   - Maintain backward compatibility when extending TypeScript types (such as `Project`) with optional fields.

2. **Component & UI Boundaries:**
   - Place generic, reusable interactive UI building blocks in `components/ui/`.
   - Keep section components (`components/*.tsx`) focused on layout, motion, and passing `lib/data.ts` data into UI components.
   - Mark files using React hooks (`useState`, `useEffect`, Framer Motion hooks, or browser event handlers) with `"use client"` at line 1.

3. **Styling, Motion & Accessibility:**
   - Reuse existing Tailwind utility conventions and semantic design tokens (`bg-base`, `bg-surface`, `border-line`, `text-ink`, `text-muted`, `text-accent`, `text-accent-soft`, `font-display`, `font-mono`, `shadow-card`, `shadow-glow`).
   - Respect reduced motion preferences (`useReducedMotion` or `<MotionConfig reducedMotion="user">`) for all animations.
   - Keep text motion restrained and legible; avoid jarring layout shifts or text clipping inside narrow expanding panels.
   - Ensure interactive cards/buttons remain keyboard-accessible (`tabIndex`, button/link semantics, clear focus/hover states) and responsive across mobile and desktop viewports.

4. **Site-Wide Background Integration:**
   - When adding a background across all pages, mount the background container in `app/layout.tsx` with `pointer-events-none` so it spans all routes without blocking clicks or text selection, and keep foreground content layered cleanly above it.
   - Define shared background styles or theme variables in `app/globals.css`.

## Verification Checklist Before Finishing Changes
- Confirm all imports resolve cleanly under `tsconfig.json` path aliases (`@/...`).
- Check that TypeScript types compile without errors (`npx tsc --noEmit`) and production builds succeed (`npm run build`).
- Verify both mobile and desktop layouts render cleanly without horizontal overflow.