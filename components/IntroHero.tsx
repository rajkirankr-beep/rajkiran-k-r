"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import localFont from "next/font/local";

/* Load Rubik at module level — canvas needs the font-family string */
const rubik = localFont({
  src: "../public/fonts/Rubik.ttf",
  weight: "300 900",
  display: "swap",
});
/* ══ EDIT THESE ════════════════════════════════════════════════════════ */

/** One string per line. Each line expands to fill the window width. */
const HERO_LINES: string[] = ["RAJKIRAN.K", "RAJENDRAN"];

/* Theme colors — from tailwind.config.ts & globals.css */
const BG_COLOR = "#14120f"; // 60% warm-charcoal background
const INK_COLOR = "#eae4da"; // 30% warm off-white — letters at rest
const ACCENT_COLOR = "#c9884a"; // 10% copper — dragged/focused letter + accent labels

/**
 * After this many ms of no interaction letters drift home automatically.
 * Default 0 = disabled.
 */
const RETURN_HOME_AFTER_MS = 0;

/**
 * JELLY CONTROL (developer-set): 0 = very soft and wobbly, 1 = rigid.
 * Try 0.1 (super jelly), 0.3 (default), 0.6 (firm), 1 (solid).
 */
const JELLY_HARDNESS = 0.3;

/* ══ PHYSICS CONSTANTS ═══════════════════════════════════════════════ */
const SIDE_MARGIN_FRAC = 0.03;      // left/right margin as fraction of canvas width
const TOP_GUARD_FRAC = 0.13;        // height reserved for top label row
const BOT_GUARD_FRAC = 0.14;        // height reserved for bottom label row
const LETTER_GAP_FRAC = 0.09;       // gap between letters (fraction of avg letter width)
const LINE_GAP_PX = 20;             // gap between lines (CSS px)
const FREE_AIR_FRIC = 0.085;        // strong air friction (heavy, viscous deceleration)
const ANGLE_SPRING = 0.06;          // gentle upright spring
const ANGLE_DAMP = 0.72;            // heavy damping to eliminate tilt wobble
const MAX_TILT_RAD = Math.PI / 10;  // max tilt (~18°)
const SUBSTEPS = 4;                 // physics sub-steps per frame (anti-tunneling)
const MAX_DT = 1 / 60;              // max seconds per frame fed to physics
const RESTITUTION = 0.15;           // low bounce for heavy, dampened collisions
const WALL_T = 40;                  // invisible wall thickness (CSS px)
const KB_NUDGE = 10;                // px per arrow key press
const KB_NUDGE_SHIFT = 50;          // px per arrow key + Shift
const RESET_TIMEOUT_MS = 1200;      // force-snap stragglers home after this long
const MAX_DRAG_SPEED = 40;          // px/frame cap on drag velocity (anti-tunneling)

/* ── Jelly (soft-body look) ───────────────────────────────────────────
 * Each letter is drawn as N horizontal slices. Every slice is a tiny
 * spring that gets shoved by the letter's acceleration and pulled back
 * to rest by neighbours, so the glyph wobbles like jelly.
 * "hardness" (0..1) scales stiffness, damping and how much it wobbles.   */
const N_STRIPS = 16;                // slices per glyph (more = smoother, slightly costlier)
const MAX_ACCEL = 14;               // clamp on acceleration fed into the jelly
const STRIP_LIMIT_FRAC = 0.6;       // max slice offset as fraction of half-width
const STRIP_PAD = 6;                // extra clip width so shifted slices aren't cut off

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

/* ══════════════════════════════════════════════════════════════════════ */

/** One measured glyph from the trial font size (scale-independent shapes). */
type Glyph = { char: string; advance: number; asc: number; des: number };

/** A single letter's home layout: where it rests and how big it is (CSS px). */
type LayoutItem = {
  char: string;
  fontSize: number;
  homeX: number;
  homeY: number;
  hw: number; // half-width of the collider
  hh: number; // half-height of the collider
  yOffset: number; // alphabetic-baseline offset from the body center
};

export default function IntroHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [canvasOk, setCanvasOk] = useState(true);
  const reduceMotion = useReducedMotion();

  /* Scroll-linked scale + fade (drives portfolio slide-up on scroll) */
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 0.75], reduceMotion ? [1, 1] : [1, 0.88]);
  const opacity = useTransform(scrollYProgress, [0.3, 0.8], [1, 0]);
  const scrollHintOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  /* Ensure the page always opens at the top unless a URL hash is present */
  useEffect(() => {
    if (!window.location.hash) window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  /* ── MAIN PHYSICS EFFECT ──────────────────────────────────────────── */
  useEffect(() => {
    const canvas = canvasRef.current;
    const overlay = overlayRef.current;
    if (!canvas || !overlay) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) { setCanvasOk(false); return; }

    let cancelled = false;
    let rafId = 0;
    const destroyFns: Array<() => void> = [];

    (async () => {
      const Matter = await import("matter-js");
      if (cancelled) return;

      await document.fonts.load(`900 100px ${rubik.style.fontFamily}`).catch(() => { });
      if (cancelled) return;

      const DPR = Math.min(window.devicePixelRatio || 1, 2);
      let cssW = canvas.clientWidth;
      let cssH = canvas.clientHeight;

      const resizeCanvas = () => {
        cssW = canvas.clientWidth;
        cssH = canvas.clientHeight;
        canvas.width = Math.round(cssW * DPR);
        canvas.height = Math.round(cssH * DPR);
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      };
      resizeCanvas();

      /* ── MEASURE GLYPHS (once, at a large trial size) ───────────── */

      const TRIAL = 300;
      ctx.font = `900 ${TRIAL}px ${rubik.style.fontFamily}`;
      ctx.textBaseline = "alphabetic";
      ctx.textAlign = "left";

      const lines = HERO_LINES.map(l => l.trim()).filter(Boolean);

      const glyphLines: Glyph[][] = lines.map(line =>
        line.split("").map(char => {
          const m = ctx.measureText(char);
          return {
            char,
            advance: m.width,
            asc: m.actualBoundingBoxAscent || 0,
            des: m.actualBoundingBoxDescent || 0,
          };
        })
      );

      const computeLayout = (w: number, h: number): LayoutItem[] => {
        const availL = w * SIDE_MARGIN_FRAC;
        const availW = w * (1 - 2 * SIDE_MARGIN_FRAC);
        const topY = h * TOP_GUARD_FRAC;
        const botY = h * (1 - BOT_GUARD_FRAC);
        const availH = botY - topY;

        const lineScales = glyphLines.map(chars => {
          const avg = chars.reduce((s, c) => s + c.advance, 0) / (chars.length || 1);
          const totW = chars.reduce((s, c) => s + c.advance, 0) + (chars.length - 1) * avg * LETTER_GAP_FRAC;
          return availW / (totW || 1);
        });

        const lineHeights = glyphLines.map((chars, li) => {
          const s = lineScales[li];
          return (chars.reduce((mx, c) => Math.max(mx, c.asc), 0) + chars.reduce((mx, c) => Math.max(mx, c.des), 0)) * s;
        });

        const totalBlockH = lineHeights.reduce((s, x) => s + x, 0) + Math.max(0, lines.length - 1) * LINE_GAP_PX;
        let curY = topY + (availH - totalBlockH) / 2;

        const items: LayoutItem[] = [];

        glyphLines.forEach((chars, li) => {
          const scale = lineScales[li];
          const fontSize = TRIAL * scale;
          const avgAdv = chars.reduce((s, c) => s + c.advance, 0) / (chars.length || 1);
          const gap = avgAdv * scale * LETTER_GAP_FRAC;
          const maxAsc = chars.reduce((mx, c) => Math.max(mx, c.asc), 0) * scale;

          const baselineY = curY + maxAsc;
          let curX = availL;

          chars.forEach(ch => {
            const gw = ch.advance * scale;
            const gh = (ch.asc + ch.des) * scale;
            const cx = curX + gw / 2;
            const cy = baselineY - ch.asc * scale + gh / 2;
            const yOffset = ch.asc * scale - gh / 2;
            items.push({
              char: ch.char, fontSize,
              homeX: cx, homeY: cy,
              hw: gw / 2 + 1, hh: gh / 2 + 1,
              yOffset,
            });
            curX += gw + gap;
          });
          curY += lineHeights[li] + LINE_GAP_PX;
        });

        return items;
      };

      /* ── PER-LETTER STATE ───────────────────────────────────────── */

      type LS = LayoutItem & {
        
        body: any;                    // matter-js Body
        returning: boolean;           // true while spring-returning to home
        strip: number[];              // jelly: x-offset of each horizontal slice
        stripV: number[];             // jelly: velocity of each slice
        sy: number; syV: number;      // jelly: vertical squash/stretch spring
        pvx: number; pvy: number;     // previous body velocity (to derive acceleration)
      };

      const letterStates: LS[] = computeLayout(cssW, cssH).map(item => ({
        ...item,
        body: null,
        returning: false,
        strip: new Array(N_STRIPS).fill(0),
        stripV: new Array(N_STRIPS).fill(0),
        sy: 1, syV: 0, pvx: 0, pvy: 0,
      }));

      /* ── MATTER-JS WORLD ────────────────────────────────────────── */

      const engine = Matter.Engine.create();
      engine.gravity.x = 0; engine.gravity.y = 0; engine.gravity.scale = 0;
      const world = engine.world;

      const makeWall = (x: number, y: number, w: number, h: number) =>
        Matter.Bodies.rectangle(x, y, w, h, { isStatic: true, friction: 0, restitution: RESTITUTION, label: "wall" });

      const buildWalls = () => [
        makeWall(cssW / 2, cssH * TOP_GUARD_FRAC - WALL_T / 2, cssW * 3, WALL_T),
        makeWall(cssW / 2, cssH * (1 - BOT_GUARD_FRAC) + WALL_T / 2, cssW * 3, WALL_T),
        makeWall(-WALL_T / 2, cssH / 2, WALL_T, cssH * 3),
        makeWall(cssW + WALL_T / 2, cssH / 2, WALL_T, cssH * 3),
      ];

      let walls = buildWalls();
      Matter.Composite.add(world, walls);

      letterStates.forEach((ls, i) => {
        const r = Math.min(ls.hw, ls.hh) * 0.2;
        const body = Matter.Bodies.rectangle(ls.homeX, ls.homeY, ls.hw * 2, ls.hh * 2, {
          chamfer: { radius: r }, frictionAir: FREE_AIR_FRIC, friction: 0.05,
          restitution: RESTITUTION, density: 0.002, label: `letter-${i}`,
        });
        ls.body = body;
        Matter.Composite.add(world, body);
      });

      /* ── DRAG + KEYBOARD STATE ──────────────────────────────────── */

      let dragIdx = -1, pointerX = 0, pointerY = 0, focusedIdx = -1;
      let lastInteraction = performance.now();
      let resetStartedAt = 0;

      const hitTest = (px: number, py: number) => {
        for (let i = letterStates.length - 1; i >= 0; i--) {
          const { x, y } = letterStates[i].body.position;
          const { hw, hh } = letterStates[i];
          if (px >= x - hw && px <= x + hw && py >= y - hh && py <= y + hh) return i;
        }
        return -1;
      };

      const beginDrag = (i: number, px: number, py: number) => {
        dragIdx = i; pointerX = px; pointerY = py;
        letterStates[i].body.frictionAir = 0;
        letterStates[i].returning = false;
        letterStates[i].body.isSensor = false;
        lastInteraction = performance.now();
      };

      const endDrag = () => {
        if (dragIdx >= 0) { letterStates[dragIdx].body.frictionAir = FREE_AIR_FRIC; dragIdx = -1; }
      };

      const resetAll = () => {
        endDrag();
        letterStates.forEach(ls => { ls.returning = true; });
        resetStartedAt = performance.now();
        lastInteraction = performance.now();
      };

      /* ── POINTER EVENTS ─────────────────────────────────────────── */

      const onPointerDown = (e: PointerEvent) => {
        const r = canvas.getBoundingClientRect();
        const i = hitTest(e.clientX - r.left, e.clientY - r.top);
        if (i >= 0) {
          beginDrag(i, e.clientX - r.left, e.clientY - r.top);
          canvas.setPointerCapture(e.pointerId);
          e.preventDefault();
        }
      };

      const onPointerMove = (e: PointerEvent) => {
        if (dragIdx < 0) return;
        const r = canvas.getBoundingClientRect();
        pointerX = clamp(e.clientX - r.left, 0, cssW);
        pointerY = clamp(e.clientY - r.top, cssH * TOP_GUARD_FRAC, cssH * (1 - BOT_GUARD_FRAC));
      };

      const onPointerUp = () => endDrag();
      const onPointerCancel = () => endDrag();

      const onDblClick = (e: MouseEvent) => {
        const r = canvas.getBoundingClientRect();
        if (hitTest(e.clientX - r.left, e.clientY - r.top) < 0) resetAll();
      };

      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") { resetAll(); return; }
        if (focusedIdx < 0) return;
        const d = e.shiftKey ? KB_NUDGE_SHIFT : KB_NUDGE;
        const vx = e.key === "ArrowLeft" ? -d : e.key === "ArrowRight" ? d : 0;
        const vy = e.key === "ArrowUp" ? -d : e.key === "ArrowDown" ? d : 0;
        if (!vx && !vy) return;
        e.preventDefault();
        Matter.Body.setVelocity(letterStates[focusedIdx].body, { x: vx * 0.5, y: vy * 0.5 });
        letterStates[focusedIdx].returning = false;
        letterStates[focusedIdx].body.isSensor = false;
        lastInteraction = performance.now();
      };

      canvas.addEventListener("pointerdown", onPointerDown, { passive: false });
      canvas.addEventListener("pointermove", onPointerMove);
      canvas.addEventListener("pointerup", onPointerUp);
      canvas.addEventListener("pointercancel", onPointerCancel);
      canvas.addEventListener("dblclick", onDblClick);
      window.addEventListener("keydown", onKeyDown);

      /* ── ACCESSIBLE BUTTON OVERLAY ──────────────────────────────── */
      const buttons: HTMLButtonElement[] = letterStates.map((ls, i) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.setAttribute("aria-label", `Letter ${ls.char}. Use arrow keys to move, Escape to reset.`);
        btn.style.cssText = "position:absolute;opacity:0;pointer-events:none;border:none;background:transparent;padding:0;outline:none;";
        btn.addEventListener("focus", () => { focusedIdx = i; });
        btn.addEventListener("blur", () => { if (focusedIdx === i) focusedIdx = -1; });
        overlay.appendChild(btn);
        return btn;
      });

      /* ── RESIZE (relayout, keeping positions proportional) ──────── */

      let resizeTimer = 0;
      const onResize = () => {
        clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(() => {
          const oldW = cssW, oldH = cssH;
          resizeCanvas();
          const sx = cssW / oldW, sy = cssH / oldH;

          const next = computeLayout(cssW, cssH);
          letterStates.forEach((ls, i) => {
            const it = next[i];
            if (!it) return;
            const rx = it.hw / ls.hw, ry = it.hh / ls.hh;
            const pos = ls.body.position;

            ls.fontSize = it.fontSize; ls.hw = it.hw; ls.hh = it.hh; ls.yOffset = it.yOffset;
            ls.homeX = it.homeX; ls.homeY = it.homeY;

            Matter.Body.scale(ls.body, rx, ry);
            Matter.Body.setPosition(ls.body, { x: pos.x * sx, y: pos.y * sy });
          });

          walls.forEach(w => Matter.Composite.remove(world, w));
          walls = buildWalls();
          Matter.Composite.add(world, walls);
        }, 50);
      };
      window.addEventListener("resize", onResize);

      /* ── RENDER LOOP ─────────────────────────────────────────────── */

      let lastTime = performance.now();

      /* Draw the glyph as horizontal slices, each shifted by its own jelly offset */
      const drawGlyph = (ls: LS) => {
        if (reduceMotion) {
          ctx.fillText(ls.char, 0, ls.yOffset);
          return;
        }
        const n = ls.strip.length;
        const sh = (ls.hh * 2) / n;
        for (let i = 0; i < n; i++) {
          ctx.save();
          ctx.translate(ls.strip[i], 0);
          ctx.beginPath();
          ctx.rect(-ls.hw - STRIP_PAD, -ls.hh + i * sh, ls.hw * 2 + STRIP_PAD * 2, sh + 1);
          ctx.clip();
          ctx.fillText(ls.char, 0, ls.yOffset);
          ctx.restore();
        }
      };

      const drawLetter = (ls: LS, isActive: boolean, isFocused: boolean) => {
        const { x, y } = ls.body.position;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(ls.body.angle);

        /* Whole-body squash & stretch from the vertical jelly spring (volume-ish preserving) */
        if (!reduceMotion) ctx.scale(1 / ls.sy, ls.sy);

        ctx.font = `900 ${ls.fontSize}px ${rubik.style.fontFamily}`;
        ctx.textBaseline = "alphabetic";
        ctx.textAlign = "center";
        ctx.fillStyle = isActive ? ACCENT_COLOR : INK_COLOR;
        drawGlyph(ls);

        if (isFocused) {
          ctx.strokeStyle = ACCENT_COLOR;
          ctx.lineWidth = 2.5;
          ctx.strokeRect(-(ls.hw + 5), -(ls.hh + 5), (ls.hw + 5) * 2, (ls.hh + 5) * 2);
        }
        ctx.restore();
      };

      /* Advance the jelly springs for every letter (hardness 0..1) */
      const stepJelly = (h: number) => {
        const k = lerp(0.03, 0.4, h);                    // spring stiffness back to rest
        const damp = lerp(0.05, 0.25, h);                // energy loss per frame
        const c = lerp(0.15, 0.3, h);                    // neighbour coupling (wave travel)
        const gain = 0.03 + 1.5 * Math.pow(1 - h, 1.5);  // how strongly motion deforms the glyph
        const gainY = gain * 0.012;

        letterStates.forEach(ls => {
          const { x: vx, y: vy } = ls.body.velocity;
          const ax = clamp(vx - ls.pvx, -MAX_ACCEL, MAX_ACCEL);
          const ay = clamp(vy - ls.pvy, -MAX_ACCEL, MAX_ACCEL);
          ls.pvx = vx; ls.pvy = vy;

          const n = ls.strip.length;
          const lim = ls.hw * STRIP_LIMIT_FRAC;

          for (let i = 0; i < n; i++) {
            const p = ls.strip[i];
            const left = i > 0 ? ls.strip[i - 1] : p;
            const right = i < n - 1 ? ls.strip[i + 1] : p;
            const w = 0.25 + 0.75 * (1 - i / (n - 1)); // top slices lag more than bottom ones
            let q = ls.stripV[i] + (-k * p + c * (left + right - 2 * p) - ax * gain * w);
            q *= 1 - damp;
            ls.stripV[i] = q;
          }
          for (let i = 0; i < n; i++) {
            ls.strip[i] = clamp(ls.strip[i] + ls.stripV[i], -lim, lim);
          }

          /* vertical squash/stretch spring */
          ls.syV = (ls.syV + (-k * 1.2 * (ls.sy - 1) - ay * gainY)) * (1 - (damp + 0.04));
          ls.sy = clamp(ls.sy + ls.syV, 0.75, 1.3);
        });
      };

      const tick = () => {
        if (cancelled) return;
        const now = performance.now();
        const rawDt = Math.min((now - lastTime) / 1000, MAX_DT);
        lastTime = now;
        const h = clamp(JELLY_HARDNESS, 0, 1);

        /* 1. Drag spring: softer = lazier, more fluid follow */
        if (dragIdx >= 0) {
          const ls = letterStates[dragIdx];
          const dragSpring = lerp(0.18, 0.35, h);
          let vx = (pointerX - ls.body.position.x) * dragSpring;
          let vy = (pointerY - ls.body.position.y) * dragSpring;
          const sp = Math.hypot(vx, vy);
          if (sp > MAX_DRAG_SPEED) { vx *= MAX_DRAG_SPEED / sp; vy *= MAX_DRAG_SPEED / sp; }
          Matter.Body.setVelocity(ls.body, { x: vx, y: vy });
        }

        /* 2. Home-return spring (Escape / double-click / idle) — deterministic */
        letterStates.forEach(ls => {
          if (!ls.returning) return;
          const dx = ls.homeX - ls.body.position.x, dy = ls.homeY - ls.body.position.y;
          const timedOut = now - resetStartedAt > RESET_TIMEOUT_MS;
          if (timedOut || Math.hypot(dx, dy) < 0.8) {
            Matter.Body.setPosition(ls.body, { x: ls.homeX, y: ls.homeY });
            Matter.Body.setVelocity(ls.body, { x: 0, y: 0 });
            Matter.Body.setAngle(ls.body, 0);
            Matter.Body.setAngularVelocity(ls.body, 0);
            ls.body.isSensor = false;
            ls.body.frictionAir = FREE_AIR_FRIC;
            ls.returning = false;
          } else {
            ls.body.isSensor = true; // glide through others, no jams
            Matter.Body.setVelocity(ls.body, { x: dx * 0.14, y: dy * 0.14 });
          }
        });

        /* 3. Auto-return after idle (disabled while RETURN_HOME_AFTER_MS = 0) */
        if (RETURN_HOME_AFTER_MS > 0 && dragIdx < 0) {
          const anyMoved = letterStates.some(ls =>
            Math.hypot(ls.homeX - ls.body.position.x, ls.homeY - ls.body.position.y) > 4
          );
          if (anyMoved && now - lastInteraction > RETURN_HOME_AFTER_MS) {
            letterStates.forEach(ls => { ls.returning = true; });
            resetStartedAt = now;
          }
        }

        /* 4. Step physics */
        const msPerStep = (rawDt * 1000) / SUBSTEPS;
        for (let s = 0; s < SUBSTEPS; s++) Matter.Engine.update(engine, msPerStep);

        /* 5. Angle spring + hard tilt clamp */
        letterStates.forEach(ls => {
          if (reduceMotion) {
            Matter.Body.setAngle(ls.body, 0);
            Matter.Body.setAngularVelocity(ls.body, 0);
            return;
          }
          const av = (ls.body.angularVelocity - ls.body.angle * ANGLE_SPRING) * ANGLE_DAMP;
          Matter.Body.setAngularVelocity(ls.body, av);
          if (Math.abs(ls.body.angle) > MAX_TILT_RAD) {
            Matter.Body.setAngle(ls.body, Math.sign(ls.body.angle) * MAX_TILT_RAD);
            Matter.Body.setAngularVelocity(ls.body, 0);
          }
        });

        /* 6. Jelly soft-body springs (skipped under reduced motion) */
        if (!reduceMotion) stepJelly(h);

        /* 7. Keep the accessible buttons sitting on their glyphs */
        letterStates.forEach((ls, i) => {
          const b = buttons[i];
          b.style.left = `${ls.body.position.x - ls.hw}px`;
          b.style.top = `${ls.body.position.y - ls.hh}px`;
          b.style.width = `${ls.hw * 2}px`;
          b.style.height = `${ls.hh * 2}px`;
        });

        /* 8. Draw */
        ctx.clearRect(0, 0, cssW, cssH);
        letterStates.forEach((ls, i) => drawLetter(ls, i === dragIdx, i === focusedIdx));

        rafId = requestAnimationFrame(tick);
      };

      destroyFns.push(() => {
        canvas.removeEventListener("pointerdown", onPointerDown);
        canvas.removeEventListener("pointermove", onPointerMove);
        canvas.removeEventListener("pointerup", onPointerUp);
        canvas.removeEventListener("pointercancel", onPointerCancel);
        canvas.removeEventListener("dblclick", onDblClick);
        window.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("resize", onResize);
        clearTimeout(resizeTimer);
        buttons.forEach(b => b.remove());
        Matter.Composite.clear(world, false);
        Matter.Engine.clear(engine);
      });

      rafId = requestAnimationFrame(tick);
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      destroyFns.forEach(fn => fn());
      destroyFns.length = 0;
    };
  }, [reduceMotion]);

  return (
    <section
      ref={containerRef}
      className={`relative h-screen w-full overflow-hidden ${rubik.className}`}
      style={{ backgroundColor: BG_COLOR }}
    >
      <motion.div style={{ scale, opacity }} className="absolute inset-0">
        {/* Fallback: plain large text when the canvas is unavailable */}
        {!canvasOk && (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-4" aria-hidden="true">
            {HERO_LINES.map(line => (
              <span
                key={line}
                className="font-black leading-none tracking-tight"
                style={{ color: INK_COLOR, fontSize: "min(22vw, 30vh)" }}
              >
                {line}
              </span>
            ))}
          </div>
        )}

        {/* 2D canvas — per-letter physics, DPR-capped backing store */}
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 h-full w-full cursor-grab active:cursor-grabbing ${canvasOk ? "" : "hidden"}`}
          aria-hidden="true"
        />

        {/* Accessible per-letter <button>s are injected here at runtime */}
        <div ref={overlayRef} className="pointer-events-none absolute inset-0" />

        {/* Top label row */}
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between px-6 py-6 font-mono text-[11px] uppercase tracking-[0.25em]">
          <span style={{ color: ACCENT_COLOR }}>[ 00 ] — Portfolio 2026</span>
        </div>

        {/* Bottom label row */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between gap-4 px-6 py-6 font-mono text-[11px] uppercase tracking-[0.25em]">
          <span style={{ color: ACCENT_COLOR }}>Code as Art</span>
          <span style={{ color: INK_COLOR }}>Drag · Esc to reset</span>
        </div>

        {/* Scroll hint (fades out as the page scrolls) */}
        <motion.div
          style={{ opacity: scrollHintOpacity }}
          className="pointer-events-none absolute inset-x-0 bottom-20 flex flex-col items-center gap-1"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.3em]" style={{ color: INK_COLOR }}>Scroll</span>
          <span aria-hidden="true" className="text-lg leading-none" style={{ color: ACCENT_COLOR }}>↓</span>
        </motion.div>
      </motion.div>
    </section>
  );
}