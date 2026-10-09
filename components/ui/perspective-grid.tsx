"use client"

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface Particle {
  x: number
  y: number
  size: number
  speedY: number
  opacity: number
  color: string
}

export default function PerspectiveGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const colors = ['#2dd4bf', '#ec4899', '#f59e0b']

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const initParticles = () => {
      particlesRef.current = []
      const particleCount = Math.floor((canvas.width * canvas.height) / 15000)

      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 1,
          speedY: Math.random() * 0.5 + 0.2,
          opacity: Math.random() * 0.5 + 0.2,
          color: colors[Math.floor(Math.random() * colors.length)]
        })
      }
    }

    const drawGrid = () => {
      const gridSize = 60
      const perspective = 0.002
      const centerX = canvas.width / 2
      const centerY = canvas.height * 0.4

      ctx.strokeStyle = 'rgba(45, 212, 191, 0.08)'
      ctx.lineWidth = 1

      // Draw horizontal lines with perspective
      for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath()
        const distFromCenter = Math.abs(y - centerY)
        const scale = 1 + distFromCenter * perspective

        for (let x = 0; x <= canvas.width; x += 10) {
          const offsetY = (y - centerY) * (1 + (x - centerX) * perspective * 0.5)
          const finalY = centerY + offsetY

          if (x === 0) {
            ctx.moveTo(x, finalY)
          } else {
            ctx.lineTo(x, finalY)
          }
        }
        ctx.stroke()
      }

      // Draw vertical lines with perspective
      for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath()
        const distFromCenter = Math.abs(x - centerX)
        const lineOpacity = Math.max(0.03, 0.08 - distFromCenter * 0.0001)
        ctx.strokeStyle = `rgba(45, 212, 191, ${lineOpacity})`

        for (let y = 0; y <= canvas.height; y += 10) {
          const offsetX = (x - centerX) * (1 + (y - centerY) * perspective * 0.3)
          const finalX = centerX + offsetX

          if (y === 0) {
            ctx.moveTo(finalX, y)
          } else {
            ctx.lineTo(finalX, y)
          }
        }
        ctx.stroke()
      }
    }

    const drawParticles = () => {
      particlesRef.current.forEach((particle, index) => {
        // Update position
        particle.y -= particle.speedY
        particle.opacity = Math.sin((particle.y / canvas.height) * Math.PI) * 0.5 + 0.2

        // Reset if out of bounds
        if (particle.y < -10) {
          particle.y = canvas.height + 10
          particle.x = Math.random() * canvas.width
        }

        // Draw particle
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = particle.color.replace(')', `, ${particle.opacity})`).replace('rgb', 'rgba').replace('#', '')

        // Convert hex to rgba
        const hex = particle.color
        const r = parseInt(hex.slice(1, 3), 16)
        const g = parseInt(hex.slice(3, 5), 16)
        const b = parseInt(hex.slice(5, 7), 16)
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${particle.opacity})`

        ctx.fill()
      })
    }

    const drawGlow = () => {
      // Center glow
      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height * 0.4,
        0,
        canvas.width / 2,
        canvas.height * 0.4,
        canvas.width * 0.5
      )
      gradient.addColorStop(0, 'rgba(45, 212, 191, 0.05)')
      gradient.addColorStop(0.3, 'rgba(236, 72, 153, 0.03)')
      gradient.addColorStop(0.6, 'rgba(245, 158, 11, 0.02)')
      gradient.addColorStop(1, 'transparent')

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      drawGlow()
      drawGrid()
      drawParticles()

      animationRef.current = requestAnimationFrame(animate)
    }

    resizeCanvas()
    initParticles()
    animate()

    window.addEventListener('resize', () => {
      resizeCanvas()
      initParticles()
    })

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Canvas for animated grid and particles */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0.8 }}
      />

      {/* Gradient orbs */}
      <motion.div
        key="grid-orb-teal"
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(45, 212, 191, 0.3) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
        animate={{
          x: [0, 50, 0],
          y: [0, -30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        key="grid-orb-magenta"
        className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full opacity-15"
        style={{
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.3) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
        animate={{
          x: [0, -40, 0],
          y: [0, 40, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
      />

      <motion.div
        key="grid-orb-amber"
        className="absolute bottom-1/4 left-1/3 w-72 h-72 rounded-full opacity-15"
        style={{
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.3) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
        animate={{
          x: [0, 30, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
      />

      {/* Vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, hsl(var(--background)) 100%)',
        }}
      />
    </div>
  )
}
