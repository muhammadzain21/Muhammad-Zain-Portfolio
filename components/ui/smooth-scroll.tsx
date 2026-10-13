"use client"

import { useEffect } from "react"
import Lenis from "lenis"

// Expose lenis globally so nav clicks can use lenis.scrollTo
declare global {
  interface Window { __lenis?: Lenis }
}

export default function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.6,
    })

    window.__lenis = lenis

    lenis.on("scroll", () => {
      window.dispatchEvent(new Event("scroll", { bubbles: true }))
    })

    let rafId: number
    function raf(time: number) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    const handleAnchor = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a[href^='#']") as HTMLAnchorElement | null
      if (!target) return
      const id = target.getAttribute("href")?.slice(1)
      if (!id) return
      const el = document.getElementById(id)
      if (!el) return
      e.preventDefault()
      lenis.scrollTo(el, { offset: -80, duration: 1.6 })
    }
    document.addEventListener("click", handleAnchor)

    return () => {
      cancelAnimationFrame(rafId)
      document.removeEventListener("click", handleAnchor)
      delete window.__lenis
      lenis.destroy()
    }
  }, [])

  return null
}
