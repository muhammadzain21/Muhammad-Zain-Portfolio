"use client"

import { useRef, type ReactNode } from "react"
import { motion, useScroll, useTransform, type Variants } from "framer-motion"

export type SectionVariant = "about" | "skills" | "projects" | "experience" | "contact"

/* ── Per-section entrance config ─────────────────────────────────────── */
const entry: Record<SectionVariant, { variants: Variants; transition: object }> = {
  about: {
    variants:   { hidden: { opacity: 0, rotateX: -12, y: 60, scale: 0.96 }, visible: { opacity: 1, rotateX: 0, y: 0, scale: 1 } },
    transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] },
  },
  skills: {
    variants:   { hidden: { opacity: 0, scale: 0.86 }, visible: { opacity: 1, scale: 1 } },
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
  },
  projects: {
    variants:   { hidden: { opacity: 0, rotateX: -16, y: 80 }, visible: { opacity: 1, rotateX: 0, y: 0 } },
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
  },
  experience: {
    variants:   { hidden: { opacity: 0, rotateY: -14, x: -60 }, visible: { opacity: 1, rotateY: 0, x: 0 } },
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
  },
  contact: {
    variants:   { hidden: { opacity: 0, y: 90, scale: 0.93 }, visible: { opacity: 1, y: 0, scale: 1 } },
    transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] },
  },
}

/* ── Top connector gradient bleeding from previous section ───────────── */
const connector: Record<SectionVariant, { from: string; to: string }> = {
  about:      { from: "rgba(139,92,246,0.18)",  to: "transparent" },
  skills:     { from: "rgba(0,255,255,0.12)",   to: "transparent" },
  projects:   { from: "rgba(139,92,246,0.15)",  to: "transparent" },
  experience: { from: "rgba(251,146,60,0.13)",  to: "transparent" },
  contact:    { from: "rgba(52,211,153,0.13)",  to: "transparent" },
}

/* ── Ambient glow color while section is in view ─────────────────────── */
const glow: Record<SectionVariant, string> = {
  about:      "radial-gradient(ellipse 70% 40% at 50% 0%, rgba(139,92,246,0.08) 0%, transparent 70%)",
  skills:     "radial-gradient(ellipse 70% 40% at 50% 0%, rgba(0,255,255,0.07) 0%, transparent 70%)",
  projects:   "radial-gradient(ellipse 70% 40% at 50% 0%, rgba(139,92,246,0.09) 0%, transparent 70%)",
  experience: "radial-gradient(ellipse 70% 40% at 50% 0%, rgba(251,146,60,0.08) 0%, transparent 70%)",
  contact:    "radial-gradient(ellipse 70% 40% at 50% 0%, rgba(52,211,153,0.08) 0%, transparent 70%)",
}

interface Section3DProps {
  variant: SectionVariant
  children: ReactNode
}

export default function Section3D({ variant, children }: Section3DProps) {
  const ref = useRef<HTMLDivElement>(null)

  /* Scroll-linked parallax exit: as section leaves viewport upward, push it back in Z */
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })

  const exitZ     = useTransform(scrollYProgress, [0.6, 1], [0, -60])
  const exitScale = useTransform(scrollYProgress, [0.65, 1], [1, 0.97])
  const exitOpacity = useTransform(scrollYProgress, [0.9, 1], [1, 0.6])

  const { variants: cfg, transition: cfgTransition } = entry[variant]
  const con = connector[variant]
  const glowBg = glow[variant]

  return (
    <div ref={ref} className="relative" style={{ perspective: "1200px" }}>
      {/* Top connector gradient — bleeds from previous section's color */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 right-0 h-32 z-10"
        style={{ background: `linear-gradient(to bottom, ${con.from}, ${con.to})` }}
      />

      {/* Ambient section glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{ background: glowBg }}
      />

      {/* Scroll-exit wrapper */}
      <motion.div style={{ z: exitZ, scale: exitScale, opacity: exitOpacity, transformStyle: "preserve-3d" }}>
        {/* Entrance animation */}
        <motion.div
          variants={cfg}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.08 }}
          transition={cfgTransition}
          style={{ transformStyle: "preserve-3d" }}
        >
          {children}
        </motion.div>
      </motion.div>

      {/* Bottom fade-out connector */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 z-10"
        style={{ background: `linear-gradient(to top, ${con.from}, ${con.to})` }}
      />
    </div>
  )
}
