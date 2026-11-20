"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface SonarGridProps extends React.ComponentProps<"div"> {
  /** Distance between dots in CSS pixels. */
  spacing?: number
  /** Dot radius at rest, in CSS pixels. */
  dotRadius?: number
  /** Resting dot opacity (0–1). Dots on a wavefront go to 1. */
  baseOpacity?: number
  /** Any CSS color. Defaults to the theme's primary color, so it adapts to light/dark and brand themes. */
  color?: string
  /** Seconds between ambient pings. Set 0 to disable them. */
  pingEvery?: number
  /** Wavefront speed in CSS pixels per second. */
  speed?: number
  /** Thickness of the wave in CSS pixels (the trailing tail; the leading edge is sharper). */
  ringWidth?: number
  /** How much a dot grows at the wave peak (0 = no growth, 2 = triple size). */
  amplitude?: number
  /** How far (px) dots get pushed outward by the wave peak. 0 disables. */
  displace?: number
  /** Emit a ping where the user taps or clicks. */
  interactive?: boolean
  /** Radius (px) of the soft glow that follows a mouse/pen cursor. 0 disables. */
  hoverRadius?: number
  /** Peak intensity of the cursor glow (0–1). */
  hoverStrength?: number
  /** Drop small, short-lived ripples behind a moving cursor. */
  trail?: boolean
  /** Maximum simultaneous rings. Older rings are dropped first. */
  maxRings?: number
  /** Start with one ring already mid-expansion so the very first frame shows the idea. */
  seedPing?: boolean
  /** Where ambient pings (and the seed ping) may spawn, as fractions of width/height: [x0, y0, x1, y1]. */
  pingArea?: [number, number, number, number]
}

interface Ring {
  x: number
  y: number
  born: number
  /** 0–1 multiplier on the ring's intensity. */
  strength: number
  /** Trailing width of the wave in px. */
  width: number
  /** Distance at which the ring is finished. */
  maxR: number
}

interface LiveRing {
  x: number
  y: number
  radius: number
  front: number
  back: number
  outer2: number
  inner2: number
  outerR: number
  fade: number
}

interface Hover {
  active: boolean
  x: number
  y: number
  tx: number
  ty: number
  amt: number
  lastTrailX: number
  lastTrailY: number
  lastTrailAt: number
}

const MAX_DPR = 2
const TAU = Math.PI * 2
const INTERACTIVE_SELECTOR = "a,button,input,textarea,select,label,[data-sonar-ignore]"

export function SonarGrid({
  spacing = 26,
  dotRadius = 1.4,
  baseOpacity = 0.28,
  color = "#e0a868",
  pingEvery = 0,
  speed = 260,
  ringWidth = 90,
  amplitude = 2.2,
  displace = 3,
  interactive = true,
  hoverRadius = 120,
  hoverStrength = 0.55,
  trail = true,
  maxRings = 10,
  seedPing = false,
  pingArea = [0.15, 0.2, 0.85, 0.8],
  className,
  children,
  ref,
  ...rest
}: SonarGridProps) {
  const hostRef = React.useRef<HTMLDivElement | null>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const ringsRef = React.useRef<Ring[]>([])
  const refreshRef = React.useRef<() => void>(() => {})

  const opts = React.useRef({
    spacing, dotRadius, baseOpacity, pingEvery, speed, ringWidth, amplitude, displace,
    interactive, hoverRadius, hoverStrength, trail, maxRings, seedPing, pingArea,
  })
  opts.current = {
    spacing, dotRadius, baseOpacity, pingEvery, speed, ringWidth, amplitude, displace,
    interactive, hoverRadius, hoverStrength, trail, maxRings, seedPing, pingArea,
  }

  const setHost = React.useCallback(
    (node: HTMLDivElement | null) => {
      hostRef.current = node
      if (typeof ref === "function") ref(node)
      else if (ref && typeof ref === "object") (ref as React.MutableRefObject<HTMLDivElement | null>).current = node
    },
    [ref]
  )

  React.useEffect(() => {
    const host = hostRef.current
    const canvas = canvasRef.current
    if (!host || !canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    const colorScheme = window.matchMedia("(prefers-color-scheme: dark)")
    let width = 0
    let height = 0
    let raf = 0
    let timer = 0
    let visible = true
    let seeded = false
    let stroke = ""
    let last = performance.now()
    let nextPing = performance.now() + opts.current.pingEvery * 1000

    const hover: Hover = {
      active: false, x: 0, y: 0, tx: 0, ty: 0, amt: 0,
      lastTrailX: -1e9, lastTrailY: -1e9, lastTrailAt: 0,
    }

    const readColor = () => {
      stroke = getComputedStyle(canvas).color
    }

    const addRing = (
      x: number,
      y: number,
      born: number,
      extra: { strength?: number; width?: number; maxR?: number } = {}
    ) => {
      const farthest = Math.max(
        Math.hypot(x, y),
        Math.hypot(width - x, y),
        Math.hypot(x, height - y),
        Math.hypot(width - x, height - y)
      )
      const rings = ringsRef.current
      rings.push({
        x,
        y,
        born,
        strength: extra.strength ?? 1,
        width: extra.width ?? opts.current.ringWidth,
        maxR: extra.maxR ? Math.min(extra.maxR, farthest) : farthest,
      })
      while (rings.length > opts.current.maxRings) rings.shift()
    }

    const draw = (now: number) => {
      const o = opts.current
      const spacing = Math.max(4, o.spacing)

      // Drop finished rings, build per-frame geometry for the rest.
      const live: LiveRing[] = []
      ringsRef.current = ringsRef.current.filter((r) => {
        const life = (r.maxR + r.width) / o.speed
        const age = (now - r.born) / 1000
        if (age >= life) return false
        if (age < 0) return true // scheduled (echo) ring, not started yet
        const radius = age * o.speed
        const front = Math.max(1, r.width * 0.3) // sharp leading edge
        const back = Math.max(1, r.width) // long trailing tail
        const outerR = radius + front
        const innerR = Math.max(0, radius - back)
        live.push({
          x: r.x, y: r.y, radius, front, back,
          outerR, outer2: outerR * outerR, inner2: innerR * innerR,
          fade: (1 - age / life) * r.strength,
        })
        return true
      })

      const hoverOn = o.hoverRadius > 0 && hover.amt > 0.003
      const hr = o.hoverRadius
      const hr2 = hr * hr
      const hAmt = hover.amt * o.hoverStrength

      ctx.clearRect(0, 0, width, height)
      ctx.fillStyle = stroke

      const cols = Math.ceil(width / spacing) + 1
      const rows = Math.ceil(height / spacing) + 1
      const offsetX = (width - (cols - 1) * spacing) / 2
      const offsetY = (height - (rows - 1) * spacing) / 2

      const hot: number[] = []
      ctx.globalAlpha = o.baseOpacity
      ctx.beginPath()
      for (let i = 0; i < cols; i++) {
        const cx = offsetX + i * spacing
        for (let j = 0; j < rows; j++) {
          const cy = offsetY + j * spacing
          let energy = 0
          let ux = 0
          let uy = 0

          for (let n = 0; n < live.length; n++) {
            const r = live[n]!
            const dx = cx - r.x
            const dy = cy - r.y
            if (Math.abs(dx) > r.outerR || Math.abs(dy) > r.outerR) continue
            const d2 = dx * dx + dy * dy
            if (d2 > r.outer2 || d2 < r.inner2) continue
            const d = Math.sqrt(d2)
            const s = d - r.radius
            const t = s >= 0 ? 1 - s / r.front : 1 + s / r.back
            if (t <= 0) continue
            const k = t * t * (3 - 2 * t) * r.fade
            if (k > energy) {
              energy = k
              ux = d > 0.001 ? dx / d : 0
              uy = d > 0.001 ? dy / d : 0
            }
          }

          if (hoverOn) {
            const dx = cx - hover.x
            const dy = cy - hover.y
            const d2 = dx * dx + dy * dy
            if (d2 < hr2) {
              const d = Math.sqrt(d2)
              const t = 1 - d / hr
              const k = t * t * (3 - 2 * t) * hAmt
              if (k > energy) {
                energy = k
                ux = d > 0.001 ? dx / d : 0
                uy = d > 0.001 ? dy / d : 0
              }
            }
          }

          if (energy < 0.01) {
            ctx.moveTo(cx + o.dotRadius, cy)
            ctx.arc(cx, cy, o.dotRadius, 0, TAU)
          } else {
            const push = energy * o.displace
            hot.push(cx + ux * push, cy + uy * push, energy)
          }
        }
      }
      ctx.fill()

      for (let k = 0; k < hot.length; k += 3) {
        const energy = hot[k + 2] ?? 0
        ctx.globalAlpha = o.baseOpacity + (1 - o.baseOpacity) * energy
        ctx.beginPath()
        ctx.arc(hot[k] ?? 0, hot[k + 1] ?? 0, o.dotRadius * (1 + o.amplitude * energy), 0, TAU)
        ctx.fill()
      }
      ctx.globalAlpha = 1
    }

    const resize = () => {
      const rect = host.getBoundingClientRect()
      width = Math.max(1, Math.round(rect.width))
      height = Math.max(1, Math.round(rect.height))
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      if (!seeded) {
        seeded = true
        const [x0, y0, x1, y1] = opts.current.pingArea
        if (opts.current.seedPing && !reduceMotion.matches)
          addRing(width * (x0 + (x1 - x0) * 0.68), height * (y0 + (y1 - y0) * 0.34), performance.now() - 500)
      }
      draw(performance.now())
    }

    const isAnimating = () =>
      ringsRef.current.length > 0 ||
      hover.amt !== (hover.active ? 1 : 0) ||
      hover.x !== hover.tx ||
      hover.y !== hover.ty

    const scheduleIdle = (delay: number) => {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => tick(performance.now()), Math.max(16, delay))
    }

    const tick = (now: number) => {
      raf = 0
      if (!visible || document.hidden) return
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000))
      last = now

      if (reduceMotion.matches) {
        ringsRef.current = []
        hover.amt = 0
        draw(now)
        return
      }

      const o = opts.current
      if (o.pingEvery > 0 && now >= nextPing) {
        const [x0, y0, x1, y1] = o.pingArea
        addRing(width * (x0 + Math.random() * (x1 - x0)), height * (y0 + Math.random() * (y1 - y0)), now, {
          strength: 0.9,
        })
        nextPing = now + o.pingEvery * 1000
      }

      // Frame-rate independent smoothing of the cursor glow.
      const targetAmt = hover.active ? 1 : 0
      hover.amt += (targetAmt - hover.amt) * (1 - Math.exp(-dt * 10))
      if (Math.abs(targetAmt - hover.amt) < 0.003) hover.amt = targetAmt
      const follow = 1 - Math.exp(-dt * 22)
      hover.x += (hover.tx - hover.x) * follow
      hover.y += (hover.ty - hover.y) * follow
      if (Math.hypot(hover.tx - hover.x, hover.ty - hover.y) < 0.3) {
        hover.x = hover.tx
        hover.y = hover.ty
      }

      draw(now)
      if (isAnimating()) raf = requestAnimationFrame(tick)
      else if (o.pingEvery > 0) scheduleIdle(nextPing - now)
    }

    const wake = () => {
      if (!raf) {
        window.clearTimeout(timer)
        raf = requestAnimationFrame(tick)
      }
    }

    refreshRef.current = () => {
      readColor()
      nextPing = Math.min(nextPing, performance.now() + opts.current.pingEvery * 1000)
      wake()
    }

    const local = (e: PointerEvent) => {
      const rect = host.getBoundingClientRect()
      return { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }

    const onDown = (e: PointerEvent) => {
      const o = opts.current
      if (!o.interactive || reduceMotion.matches) return
      if (e.pointerType === "mouse" && e.button !== 0) return
      if ((e.target as Element | null)?.closest?.(INTERACTIVE_SELECTOR)) return
      const { x, y } = local(e)
      const now = performance.now()
      addRing(x, y, now)
      // A fainter echo a beat later makes a tap feel like a real pulse.
      addRing(x, y, now + 140, { strength: 0.45, width: o.ringWidth * 0.8 })
      wake()
    }

    const onMove = (e: PointerEvent) => {
      const o = opts.current
      if (!o.interactive || reduceMotion.matches || e.pointerType === "touch") return
      const { x, y } = local(e)
      hover.tx = x
      hover.ty = y
      if (!hover.active) {
        hover.active = true
        hover.x = x // snap, so the glow doesn't sweep in from the corner
        hover.y = y
      }
      if (o.trail) {
        const now = performance.now()
        const moved = Math.hypot(x - hover.lastTrailX, y - hover.lastTrailY)
        if (moved > Math.max(48, o.spacing * 2) && now - hover.lastTrailAt > 90) {
          hover.lastTrailX = x
          hover.lastTrailY = y
          hover.lastTrailAt = now
          addRing(x, y, now, { strength: 0.4, width: o.ringWidth * 0.5, maxR: 180 })
        }
      }
      wake()
    }

    const onLeave = () => {
      hover.active = false
      hover.lastTrailX = -1e9
      hover.lastTrailY = -1e9
      wake()
    }

    const onVisibility = () => {
      if (!document.hidden) {
        last = performance.now()
        wake()
      }
    }
    const onMotionChange = () => {
      if (reduceMotion.matches) hover.active = false
      wake()
    }

    const ro = new ResizeObserver(resize)
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry?.isIntersecting ?? true
        if (visible) {
          last = performance.now()
          wake()
        }
      },
      { threshold: 0 }
    )
    const mo = new MutationObserver(() => refreshRef.current())

    readColor()
    resize()
    ro.observe(host)
    io.observe(host)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style", "data-theme"] })
    host.addEventListener("pointerdown", onDown)
    host.addEventListener("pointermove", onMove)
    host.addEventListener("pointerleave", onLeave)
    host.addEventListener("pointercancel", onLeave)
    document.addEventListener("visibilitychange", onVisibility)
    reduceMotion.addEventListener("change", onMotionChange)
    colorScheme.addEventListener("change", refreshRef.current)
    wake()

    return () => {
      ro.disconnect()
      io.disconnect()
      mo.disconnect()
      host.removeEventListener("pointerdown", onDown)
      host.removeEventListener("pointermove", onMove)
      host.removeEventListener("pointerleave", onLeave)
      host.removeEventListener("pointercancel", onLeave)
      document.removeEventListener("visibilitychange", onVisibility)
      reduceMotion.removeEventListener("change", onMotionChange)
      colorScheme.removeEventListener("change", refreshRef.current)
      cancelAnimationFrame(raf)
      window.clearTimeout(timer)
      refreshRef.current = () => {}
    }
  }, [])

  React.useEffect(() => {
    refreshRef.current()
  }, [
    spacing, dotRadius, baseOpacity, color, pingEvery, speed, ringWidth, amplitude, displace,
    interactive, hoverRadius, hoverStrength, trail, maxRings, pingArea,
  ])

  return (
    <div
      ref={setHost}
      data-slot="sonar-grid"
      className={cn("relative isolate overflow-hidden", interactive && "cursor-crosshair", className)}
      {...rest}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="text-primary pointer-events-none absolute inset-0 -z-10 size-full"
        style={color ? { color } : undefined}
      />
      {children}
    </div>
  )
}

export default SonarGrid
