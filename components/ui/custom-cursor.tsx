"use client"

import { useEffect, useRef, useState, useCallback } from "react"

interface Trail {
  id: number
  x: number
  y: number
  opacity: number
}

export default function CustomCursor() {
  const dotRef   = useRef<HTMLDivElement>(null)
  const ringRef  = useRef<HTMLDivElement>(null)
  const trailRef = useRef<Trail[]>([])
  const trailIdRef = useRef(0)
  const [trails, setTrails] = useState<Trail[]>([])

  const pos = useRef({ x: -100, y: -100 })
  const ring = useRef({ x: -100, y: -100 })
  const raf  = useRef<number | null>(null)

  const [cursor, setCursor] = useState<"default" | "hover" | "scrolling">("default")
  const [showScrollHint, setShowScrollHint] = useState(false)
  const [scrollDir, setScrollDir] = useState<"down" | "up">("down")
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastScrollY = useRef(0)
  const isMobile = useRef(false)

  // Animate ring with lag
  const animate = useCallback(() => {
    ring.current.x += (pos.current.x - ring.current.x) * 0.12
    ring.current.y += (pos.current.y - ring.current.y) * 0.12

    if (dotRef.current) {
      dotRef.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px) translate(-50%,-50%)`
    }
    if (ringRef.current) {
      ringRef.current.style.transform = `translate(${ring.current.x}px, ${ring.current.y}px) translate(-50%,-50%)`
    }
    raf.current = requestAnimationFrame(animate)
  }, [])

  useEffect(() => {
    isMobile.current = "ontouchstart" in window || navigator.maxTouchPoints > 0
    if (isMobile.current) return

    // Hide native cursor globally
    document.documentElement.style.cursor = "none"
    raf.current = requestAnimationFrame(animate)

    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY }

      // Trail
      const id = trailIdRef.current++
      const newTrail: Trail = { id, x: e.clientX, y: e.clientY, opacity: 1 }
      trailRef.current = [...trailRef.current.slice(-10), newTrail]
      setTrails([...trailRef.current])

      // Fade out trail entries
      setTimeout(() => {
        trailRef.current = trailRef.current.filter(t => t.id !== id)
        setTrails([...trailRef.current])
      }, 300)

      // Idle timer → show scroll hint
      if (idleTimer.current) clearTimeout(idleTimer.current)
      setShowScrollHint(false)
      idleTimer.current = setTimeout(() => setShowScrollHint(true), 2500)
    }

    const onScroll = () => {
      const y = window.scrollY
      setScrollDir(y > lastScrollY.current ? "down" : "up")
      lastScrollY.current = y
      setCursor("scrolling")
      setShowScrollHint(false)
      setTimeout(() => setCursor("default"), 400)
    }

    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      if (t.closest("a,button,[role=button],[tabindex]")) {
        setCursor("hover")
        document.documentElement.style.cursor = "none"
      }
    }
    const onOut = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      if (t.closest("a,button,[role=button],[tabindex]")) setCursor("default")
    }

    window.addEventListener("mousemove", onMove)
    window.addEventListener("scroll",    onScroll, { passive: true })
    document.addEventListener("mouseover",  onOver)
    document.addEventListener("mouseout",   onOut)

    return () => {
      document.documentElement.style.cursor = ""
      if (raf.current) cancelAnimationFrame(raf.current)
      if (idleTimer.current) clearTimeout(idleTimer.current)
      window.removeEventListener("mousemove",  onMove)
      window.removeEventListener("scroll",     onScroll)
      document.removeEventListener("mouseover", onOver)
      document.removeEventListener("mouseout",  onOut)
    }
  }, [animate])

  if (typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0)) {
    return null
  }

  const isHover     = cursor === "hover"
  const isScrolling = cursor === "scrolling"

  return (
    <>
      {/* Trail dots */}
      {trails.map((t, i) => (
        <div
          key={t.id}
          className="pointer-events-none fixed z-[9997] rounded-full"
          style={{
            left: 0,
            top: 0,
            width: 4 + i * 0.5,
            height: 4 + i * 0.5,
            transform: `translate(${t.x}px, ${t.y}px) translate(-50%,-50%)`,
            background: i % 2 === 0 ? "rgba(0,240,255,0.65)" : "rgba(255,26,170,0.55)",
            opacity: (i / trails.length) * 0.5,
            filter: "blur(0.5px)",
            transition: "opacity 0.3s",
          }}
        />
      ))}

      {/* Outer ring */}
      <div
        ref={ringRef}
        className="pointer-events-none fixed z-[9998] rounded-full"
        style={{
          left: 0,
          top: 0,
          width:  isHover ? 52 : isScrolling ? 44 : 36,
          height: isHover ? 52 : isScrolling ? 44 : 36,
          border: isHover
            ? "2px solid rgba(255,26,170,0.9)"
            : isScrolling
              ? "2px solid rgba(190,0,255,0.9)"
              : "1.5px solid rgba(0,240,255,0.7)",
          boxShadow: isHover
            ? "0 0 16px rgba(255,26,170,0.6), 0 0 32px rgba(255,26,170,0.22)"
            : isScrolling
              ? "0 0 16px rgba(190,0,255,0.6)"
              : "0 0 14px rgba(0,240,255,0.45)",
          transition: "width 0.2s ease, height 0.2s ease, border-color 0.2s, box-shadow 0.2s",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Scroll direction arrow inside ring when scrolling */}
        {isScrolling && (
          <span
            style={{
              color: "rgba(139,92,246,0.9)",
              fontSize: 12,
              lineHeight: 1,
              transform: scrollDir === "up" ? "rotate(180deg)" : "none",
              transition: "transform 0.2s",
            }}
          >
            ↓
          </span>
        )}
      </div>

      {/* Core dot */}
      <div
        ref={dotRef}
        className="pointer-events-none fixed z-[9999] rounded-full"
        style={{
          left: 0,
          top: 0,
          width:  isHover ? 6 : 5,
          height: isHover ? 6 : 5,
          background: isHover
            ? "rgba(255,26,170,1)"
            : isScrolling
              ? "rgba(190,0,255,1)"
              : "rgba(0,240,255,1)",
          boxShadow: isHover
            ? "0 0 10px rgba(255,26,170,1)"
            : isScrolling
              ? "0 0 10px rgba(190,0,255,1)"
              : "0 0 10px rgba(0,240,255,0.9)",
          transition: "width 0.15s, height 0.15s, background 0.2s, box-shadow 0.2s",
        }}
      />

      {/* Idle scroll hint */}
      {showScrollHint && (
        <div
          className="pointer-events-none fixed z-[9996]"
          style={{
            left: pos.current.x + 20,
            top:  pos.current.y + 20,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            animation: "fadeIn 0.4s ease",
          }}
        >
          <span style={{ color: "rgba(0,255,255,0.7)", fontSize: 10, fontFamily: "monospace", letterSpacing: 2, textTransform: "uppercase" }}>
            scroll
          </span>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            {[0, 1, 2].map(i => (
              <div
                key={i}
                style={{
                  width: 6,
                  height: 6,
                  borderRight: "1.5px solid rgba(0,255,255,0.8)",
                  borderBottom: "1.5px solid rgba(0,255,255,0.8)",
                  transform: "rotate(45deg)",
                  animation: `scrollChevron 1s ease ${i * 0.2}s infinite`,
                  opacity: 0,
                }}
              />
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes scrollChevron {
          0%   { opacity: 0; transform: rotate(45deg) translate(-2px, -2px); }
          50%  { opacity: 1; }
          100% { opacity: 0; transform: rotate(45deg) translate(3px, 3px); }
        }
        * { cursor: none !important; }
      `}</style>
    </>
  )
}
