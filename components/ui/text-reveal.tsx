"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { cn } from "@/lib/utils"

interface TextRevealProps {
  children: string
  className?: string
  delay?: number
  once?: boolean
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span"
}

export default function TextReveal({
  children,
  className,
  delay = 0,
  once = true,
  as: Component = "p"
}: TextRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once, margin: "-50px" })

  const words = children.split(" ")

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: delay
      }
    })
  }

  const child = {
    hidden: {
      opacity: 0,
      y: 20,
      filter: "blur(10px)"
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        type: "spring" as const,
        damping: 12,
        stiffness: 100
      }
    }
  }

  return (
    <motion.div
      ref={ref}
      className={cn("overflow-hidden", className)}
      variants={container}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      <Component className={className}>
        {words.map((word, index) => (
          <motion.span
            key={index}
            variants={child}
            className="inline-block mr-[0.25em]"
          >
            {word}
          </motion.span>
        ))}
      </Component>
    </motion.div>
  )
}

// Line by line reveal variant
interface LineRevealProps {
  children: React.ReactNode
  className?: string
  delay?: number
  once?: boolean
}

export function LineReveal({
  children,
  className,
  delay = 0,
  once = true
}: LineRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once, margin: "-50px" })

  return (
    <div ref={ref} className="overflow-hidden">
      <motion.div
        className={className}
        initial={{ y: "100%", opacity: 0 }}
        animate={isInView ? { y: 0, opacity: 1 } : { y: "100%", opacity: 0 }}
        transition={{
          duration: 0.5,
          delay,
          ease: [0.25, 0.4, 0.25, 1]
        }}
      >
        {children}
      </motion.div>
    </div>
  )
}

// Character by character reveal
interface CharRevealProps {
  children: string
  className?: string
  delay?: number
  once?: boolean
}

export function CharReveal({
  children,
  className,
  delay = 0,
  once = true
}: CharRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once, margin: "-50px" })

  const chars = children.split("")

  return (
    <motion.span
      ref={ref}
      className={cn("inline-block", className)}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      {chars.map((char, index) => (
        <motion.span
          key={index}
          className="inline-block"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                duration: 0.3,
                delay: delay + index * 0.02
              }
            }
          }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.span>
  )
}
