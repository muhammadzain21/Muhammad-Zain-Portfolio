"use client"

import { useEffect } from 'react'

export function useHashScroll() {
  useEffect(() => {
    const scrollToHash = () => {
      const hash = window.location.hash
      if (!hash) return

      const id = hash.replace('#', '')
      const element = document.getElementById(id)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return true
      }
      return false
    }

    if (scrollToHash()) return

    const observer = new MutationObserver((_, obs) => {
      if (scrollToHash()) obs.disconnect()
    })

    observer.observe(document.body, { childList: true, subtree: true })

    const timeout = setTimeout(() => observer.disconnect(), 5000)

    const handleHashChange = () => scrollToHash()
    window.addEventListener('hashchange', handleHashChange)

    return () => {
      observer.disconnect()
      clearTimeout(timeout)
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [])
}
