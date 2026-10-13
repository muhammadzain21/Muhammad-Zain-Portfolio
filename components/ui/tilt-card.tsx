"use client"

import { useRef, type ReactNode, type MouseEvent } from "react"

interface TiltCardProps {
  children: ReactNode
  className?: string
  maxTilt?: number
  scale?: number
  glare?: boolean
}

export default function TiltCard({
  children,
  className = "",
  maxTilt = 12,
  scale = 1.03,
  glare = true,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const glareRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width  - 0.5
    const y = (e.clientY - rect.top)  / rect.height - 0.5

    const rotateX = -y * maxTilt
    const rotateY =  x * maxTilt

    el.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale},${scale},${scale})`

    if (glare && glareRef.current) {
      const angle = Math.atan2(y, x) * (180 / Math.PI)
      glareRef.current.style.opacity = "1"
      glareRef.current.style.transform = `rotate(${angle}deg)`
      glareRef.current.style.background = `linear-gradient(${angle}deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 60%)`
    }
  }

  const handleMouseLeave = () => {
    const el = ref.current
    if (!el) return
    el.style.transform = `perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)`
    if (glare && glareRef.current) {
      glareRef.current.style.opacity = "0"
    }
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative ${className}`}
      style={{ transformStyle: "preserve-3d", transition: "transform 0.12s ease-out, box-shadow 0.12s ease-out", willChange: "transform" }}
    >
      {children}
      {glare && (
        <div
          ref={glareRef}
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 z-10"
          style={{ mixBlendMode: "overlay" }}
        />
      )}
    </div>
  )
}
