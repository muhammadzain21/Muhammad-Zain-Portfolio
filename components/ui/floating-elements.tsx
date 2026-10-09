"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"

interface FloatingOrb {
  id: number
  size: number
  x: number
  y: number
  lightColor: string
  darkColor: string
  blur: number
  duration: number
  delay: number
}

export default function FloatingElements() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [orbs, setOrbs] = useState<FloatingOrb[]>([])

  useEffect(() => {
    const generatedOrbs: FloatingOrb[] = [
      // Teal orbs
      {
        id: 1,
        size: 300,
        x: 10,
        y: 20,
        lightColor: "var(--orb-teal-light)",
        darkColor: "var(--orb-teal-dark)",
        blur: 80,
        duration: 25,
        delay: 0,
      },
      {
        id: 2,
        size: 200,
        x: 80,
        y: 60,
        lightColor: "var(--orb-teal-light-sm)",
        darkColor: "var(--orb-teal-dark-sm)",
        blur: 60,
        duration: 30,
        delay: 5,
      },
      // Magenta orbs
      {
        id: 3,
        size: 350,
        x: 70,
        y: 10,
        lightColor: "var(--orb-magenta-light)",
        darkColor: "var(--orb-magenta-dark)",
        blur: 100,
        duration: 28,
        delay: 2,
      },
      {
        id: 4,
        size: 180,
        x: 20,
        y: 70,
        lightColor: "var(--orb-magenta-light-sm)",
        darkColor: "var(--orb-magenta-dark-sm)",
        blur: 50,
        duration: 22,
        delay: 8,
      },
      // Amber orbs
      {
        id: 5,
        size: 250,
        x: 50,
        y: 80,
        lightColor: "var(--orb-amber-light)",
        darkColor: "var(--orb-amber-dark)",
        blur: 70,
        duration: 32,
        delay: 4,
      },
      {
        id: 6,
        size: 150,
        x: 90,
        y: 30,
        lightColor: "var(--orb-amber-light-sm)",
        darkColor: "var(--orb-amber-dark-sm)",
        blur: 40,
        duration: 20,
        delay: 10,
      },
    ]
    setOrbs(generatedOrbs)
  }, [])

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Gradient mesh background */}
      <div className="absolute inset-0 opacity-50 dark:opacity-30">
        <div className="absolute inset-0 dark:hidden mesh-gradient-light" />
        <div className="absolute inset-0 hidden dark:block mesh-gradient-dark" />
      </div>

      {/* Floating aurora orbs — light mode */}
      <div className="dark:hidden">
        {orbs.map((orb) => (
          <motion.div
            key={`light-${orb.id}`}
            className="absolute rounded-full"
            style={{
              width: orb.size,
              height: orb.size,
              left: `${orb.x}%`,
              top: `${orb.y}%`,
              background: orb.lightColor,
              filter: `blur(${orb.blur}px)`,
            }}
            animate={{
              x: [0, 50, -30, 20, 0],
              y: [0, -40, 30, -20, 0],
              scale: [1, 1.1, 0.95, 1.05, 1],
            }}
            transition={{
              duration: orb.duration,
              repeat: Infinity,
              delay: orb.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Floating aurora orbs — dark mode */}
      <div className="hidden dark:block">
        {orbs.map((orb) => (
          <motion.div
            key={`dark-${orb.id}`}
            className="absolute rounded-full"
            style={{
              width: orb.size,
              height: orb.size,
              left: `${orb.x}%`,
              top: `${orb.y}%`,
              background: orb.darkColor,
              filter: `blur(${orb.blur}px)`,
            }}
            animate={{
              x: [0, 50, -30, 20, 0],
              y: [0, -40, 30, -20, 0],
              scale: [1, 1.1, 0.95, 1.05, 1],
            }}
            transition={{
              duration: orb.duration,
              repeat: Infinity,
              delay: orb.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.02] grid-overlay-light dark:hidden" />
      <div className="absolute inset-0 opacity-[0.02] hidden dark:block grid-overlay-dark" />

      {/* Animated gradient line accents — light mode */}
      <motion.div
        className="absolute top-0 left-0 w-full h-px dark:hidden gradient-line-tpa"
        animate={{ opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 left-0 w-full h-px dark:hidden gradient-line-apt"
        animate={{ opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      {/* Animated gradient line accents — dark mode */}
      <motion.div
        className="absolute top-0 left-0 w-full h-px hidden dark:block gradient-line-tpa-dark"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 left-0 w-full h-px hidden dark:block gradient-line-apt-dark"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
    </div>
  )
}
