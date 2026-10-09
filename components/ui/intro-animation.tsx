"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { motion } from "framer-motion"

interface Particle {
  x: number; y: number
  vx: number; vy: number
  life: number; maxLife: number
  size: number
  r: number; g: number; b: number
  trail: Array<{ x: number; y: number }>
}

interface Ring {
  radius: number
  angle: number
  speed: number
  opacity: number
  width: number
  color: [number, number, number]
}

export default function IntroAnimation({ onComplete }: { onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [overlayOpacity, setOverlayOpacity] = useState(1)
  const [visible, setVisible] = useState(true)
  const phaseRef = useRef<"running" | "fading" | "done">("running")

  const startFade = useCallback(() => {
    if (phaseRef.current !== "running") return
    phaseRef.current = "fading"
    setOverlayOpacity(0)
    setTimeout(() => {
      phaseRef.current = "done"
      setVisible(false)
      onComplete()
    }, 1200)
  }, [onComplete])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")!
    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener("resize", resize)

    const cx = () => canvas!.width  / 2
    const cy = () => canvas!.height / 2

    const startTime = Date.now()
    const t = () => (Date.now() - startTime) / 1000

    // ── Rings ──────────────────────────────────────────────────────────────
    const rings: Ring[] = [
      { radius: 0, angle: 0,             speed: 0.8,  opacity: 0, width: 1.5, color: [0, 255, 255] },
      { radius: 0, angle: Math.PI / 2,   speed: -0.5, opacity: 0, width: 1.2, color: [139, 92, 246] },
      { radius: 0, angle: Math.PI / 3,   speed: 0.35, opacity: 0, width: 1.0, color: [0, 200, 255] },
    ]

    // ── Burst particles ────────────────────────────────────────────────────
    const particles: Particle[] = []
    let hasBurst = false

    function spawnBurst(x: number, y: number) {
      // 1800 thin fast particles — speed high enough to reach every screen edge
      const count = 1800
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.35
        const speed = 18 + Math.random() * 55  // at ~0.972 friction these travel 600–2000px
        const life  = 220 + Math.random() * 140
        const size  = 0.3 + Math.random() * 1.5  // thin — hacker streaks

        // Hacker palette: cyan-dominant, some violet, rare near-white
        const roll = Math.random()
        let r: number, g: number, b: number
        if      (roll < 0.45) { r = 0;   g = 240; b = 255 }  // #00f0ff cyan
        else if (roll < 0.70) { r = 0;   g = 200; b = 230 }  // mid cyan
        else if (roll < 0.85) { r = 139; g = 92;  b = 246 }  // violet
        else if (roll < 0.93) { r = 0;   g = 255; b = 160 }  // cyan-green
        else                  { r = 210; g = 240; b = 255 }  // near-white spark

        particles.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life, maxLife: life, size,
          r, g, b,
          trail: [],
        })
      }
    }

    // ── Draw helpers ───────────────────────────────────────────────────────
    function drawSphere(x: number, y: number, radius: number, intensity: number) {
      const glowColors: Array<[string, string]> = [
        [`rgba(0,255,255,${(intensity * 0.25).toFixed(2)})`,  `rgba(0,0,0,0)`],
        [`rgba(139,92,246,${(intensity * 0.2).toFixed(2)})`,  `rgba(0,0,0,0)`],
        [`rgba(0,200,255,${(intensity * 0.12).toFixed(2)})`,  `rgba(0,0,0,0)`],
      ]
      const glowSizes = [3.5, 2.5, 2.0]

      glowColors.forEach(([inner, outer], i) => {
        const g = ctx.createRadialGradient(x, y, 0, x, y, radius * glowSizes[i])
        g.addColorStop(0,   inner)
        g.addColorStop(0.5, `rgba(0,0,0,0)`)
        g.addColorStop(1,   outer)
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(x, y, radius * glowSizes[i], 0, Math.PI * 2)
        ctx.fill()
      })

      const core = ctx.createRadialGradient(x - radius * 0.28, y - radius * 0.28, 0, x, y, radius)
      core.addColorStop(0,    `rgba(255,255,255,${intensity.toFixed(2)})`)
      core.addColorStop(0.25, `rgba(0,255,255,${(intensity * 0.95).toFixed(2)})`)
      core.addColorStop(0.6,  `rgba(139,92,246,${(intensity * 0.7).toFixed(2)})`)
      core.addColorStop(1,    `rgba(0,0,20,0)`)
      ctx.fillStyle = core
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fill()
    }

    function drawRings(x: number, y: number, sphereR: number, progress: number) {
      rings.forEach((ring, idx) => {
        ring.radius  = sphereR * (1.6 + idx * 0.5)
        ring.opacity = Math.min(1, progress * 1.5) * 0.55
        ring.angle  += ring.speed * 0.016

        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(idx * 0.6)
        ctx.scale(1, 0.38 + idx * 0.12)
        ctx.beginPath()
        ctx.arc(0, 0, ring.radius, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(${ring.color[0]},${ring.color[1]},${ring.color[2]},${ring.opacity})`
        ctx.lineWidth = ring.width
        ctx.shadowColor = `rgba(${ring.color[0]},${ring.color[1]},${ring.color[2]},0.8)`
        ctx.shadowBlur = 12
        ctx.stroke()
        ctx.restore()

        const dotX = x + Math.cos(ring.angle * 2) * ring.radius
        const dotY = y + Math.sin(ring.angle * 2) * ring.radius * (0.38 + idx * 0.12)
        ctx.beginPath()
        ctx.arc(dotX, dotY, 2.5, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${ring.color[0]},${ring.color[1]},${ring.color[2]},0.9)`
        ctx.shadowColor = `rgba(${ring.color[0]},${ring.color[1]},${ring.color[2]},1)`
        ctx.shadowBlur = 10
        ctx.fill()
        ctx.shadowBlur = 0
      })
    }

    function drawParticles() {
      particles.forEach((p) => {
        p.trail.push({ x: p.x, y: p.y })
        if (p.trail.length > 16) p.trail.shift()  // long trails = streaks

        p.vx *= 0.972   // decelerate quickly so they settle into gentle drift
        p.vy *= 0.972
        p.vy += 0.003   // almost no gravity — particles float like hero scene
        p.x  += p.vx
        p.y  += p.vy
        p.life -= 1

        const alpha = p.life / p.maxLife
        const size  = p.size * alpha

        // Streak trail
        if (p.trail.length > 1) {
          for (let i = 1; i < p.trail.length; i++) {
            const ta = (i / p.trail.length) * alpha * 0.55
            ctx.beginPath()
            ctx.moveTo(p.trail[i - 1].x, p.trail[i - 1].y)
            ctx.lineTo(p.trail[i].x, p.trail[i].y)
            ctx.strokeStyle = `rgba(${p.r},${p.g},${p.b},${ta.toFixed(2)})`
            ctx.lineWidth = Math.max(0.3, size * 0.45)
            ctx.stroke()
          }
        }

        // Particle dot — subtle glow only (not a firework)
        ctx.shadowColor = `rgba(${p.r},${p.g},${p.b},${(alpha * 0.6).toFixed(2)})`
        ctx.shadowBlur  = size * 2.5
        ctx.beginPath()
        ctx.arc(p.x, p.y, Math.max(0.1, size), 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${Math.min(1, alpha * 1.3).toFixed(2)})`
        ctx.fill()
        ctx.shadowBlur = 0
      })

      for (let i = particles.length - 1; i >= 0; i--) {
        if (particles[i].life <= 0) particles.splice(i, 1)
      }
    }

    // ── Monogram ──────────────────────────────────────────────────────────
    function drawMonogram(x: number, y: number, alpha: number, scale: number) {
      ctx.save()
      ctx.globalAlpha = alpha
      ctx.font = `${Math.round(28 * scale)}px monospace`
      ctx.textAlign    = "center"
      ctx.textBaseline = "middle"
      ctx.fillStyle = `rgba(0,255,255,${alpha})`
      ctx.shadowColor = `rgba(0,255,255,${alpha * 0.8})`
      ctx.shadowBlur  = 20
      ctx.fillText("< Hafiz Muhammad Mateen />", x, y)
      ctx.shadowBlur = 0
      ctx.restore()
    }

    // ── Main loop ─────────────────────────────────────────────────────────
    let rafId: number

    const BURST_T       = 3.6
    const DISSOLVE_START = BURST_T + 0.08   // start dissolve almost immediately after burst
    const DISSOLVE_DUR  = 1.6               // 1.6s dissolve — hero bleeds through while particles still fly

    function draw() {
      if (phaseRef.current === "done") return
      rafId = requestAnimationFrame(draw)
      const now = t()
      const W = canvas!.width, H = canvas!.height
      const X = cx(), Y = cy()

      // ── Background: solid black before burst, then dissolves so hero bleeds through ──
      if (now < DISSOLVE_START) {
        ctx.fillStyle = "rgb(5,5,14)"
        ctx.fillRect(0, 0, W, H)
      } else {
        const dissolveP = Math.min(1, (now - DISSOLVE_START) / DISSOLVE_DUR)
        const bgAlpha   = Math.max(0, 1 - dissolveP)
        if (bgAlpha > 0) {
          ctx.fillStyle = `rgba(5,5,14,${bgAlpha.toFixed(3)})`
          ctx.fillRect(0, 0, W, H)
        }
        // Trigger site fade-in once background is ~40% dissolved and particles are spreading
        if (dissolveP > 0.38 && phaseRef.current === "running") {
          startFade()
        }
      }

      // ── Phase 1: 0–0.6s — monogram fades in ────────────────────────────
      if (now < 0.6) {
        drawMonogram(X, Y, now / 0.6, 1)
      }
      // ── Phase 2: 0.6–1.8s — sphere forms ───────────────────────────────
      else if (now < 1.8) {
        const p    = (now - 0.6) / 1.2
        const ease = 1 - Math.pow(1 - p, 3)
        drawSphere(X, Y, ease * 55, ease * 0.85)
        drawMonogram(X, Y, 1 - p * 0.4, 1 + p * 0.2)
      }
      // ── Phase 3: 1.8–3.2s — glowing, rings appear ──────────────────────
      else if (now < 3.2) {
        const p     = (now - 1.8) / 1.4
        const pulse = 1 + Math.sin(now * 4) * 0.04
        drawSphere(X, Y, 55 * pulse, 0.9 + Math.sin(now * 3) * 0.08)
        drawRings(X, Y, 55, p)
        if (p > 0.3) drawMonogram(X, Y, Math.max(0, 0.6 - (p - 0.3) * 2), 1.2)
      }
      // ── Phase 4: 3.2–3.6s — pre-burst shake ────────────────────────────
      else if (now < BURST_T) {
        const p    = (now - 3.2) / 0.4
        const freq = 40 + p * 60
        const amp  = p * 12
        const shX  = Math.sin(now * freq) * amp
        const shY  = Math.cos(now * freq * 0.7) * amp * 0.6
        const r    = 55 + p * 15
        drawSphere(X + shX, Y + shY, r, 1.0)
        drawRings(X + shX, Y + shY, r, 1.0)
      }
      // ── Phase 5+: BURST → thin particle streams across entire screen ────
      else {
        if (!hasBurst) { hasBurst = true; spawnBurst(X, Y) }

        // Sharp single expanding ring + brief center flash — no confetti effects
        if (now < BURST_T + 0.14) {
          const fp = (now - BURST_T) / 0.14
          // Single sharp cyan ring expanding to screen diagonal
          const ringR = fp * Math.max(W, H) * 1.15
          ctx.beginPath()
          ctx.arc(X, Y, ringR, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(0,240,255,${((1 - fp) * 0.9).toFixed(2)})`
          ctx.lineWidth   = (1 - fp) * 5
          ctx.stroke()
          // Tight center flash fades in 0.07s
          const fa = Math.max(0, 1 - fp / 0.5)
          if (fa > 0) {
            ctx.fillStyle = `rgba(200,255,255,${(fa * 0.4).toFixed(2)})`
            ctx.fillRect(0, 0, W, H)
          }
        }

        drawParticles()
      }
    }

    rafId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener("resize", resize)
    }
  }, [startFade])

  if (!visible) return null

  return (
    <motion.div
      className="fixed inset-0 z-[99999] overflow-hidden"
      animate={{ opacity: overlayOpacity }}
      transition={{ duration: 1.2, ease: "easeInOut" }}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </motion.div>
  )
}
