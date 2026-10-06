"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Search, Home, User, Code, Briefcase, Mail, Github, Linkedin } from 'lucide-react'

export default function CommandPalette() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const commands = useMemo(() => [
    { icon: <Home className="h-4 w-4" />, label: "Home", action: () => document.getElementById("home")?.scrollIntoView({ behavior: "smooth" }) },
    { icon: <User className="h-4 w-4" />, label: "About", action: () => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" }) },
    { icon: <Code className="h-4 w-4" />, label: "Skills", action: () => document.getElementById("skills")?.scrollIntoView({ behavior: "smooth" }) },
    { icon: <Code className="h-4 w-4" />, label: "Projects", action: () => document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" }) },
    { icon: <Briefcase className="h-4 w-4" />, label: "Experience", action: () => document.getElementById("experience")?.scrollIntoView({ behavior: "smooth" }) },
    { icon: <Mail className="h-4 w-4" />, label: "Contact", action: () => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" }) },
    { icon: <Github className="h-4 w-4" />, label: "GitHub", action: () => window.open("https://github.com/HafizMuhammadMateen", "_blank", "noopener,noreferrer") },
    { icon: <Linkedin className="h-4 w-4" />, label: "LinkedIn", action: () => window.open("https://www.linkedin.com/in/hafizmuhammadmateen", "_blank", "noopener,noreferrer") },
  ], [])

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="fixed top-4 right-4 z-40 hidden md:block"
      >
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-background/80 backdrop-blur-sm border border-border/50 rounded-lg hover:bg-muted/50 transition-colors"
        >
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Search</span>
          <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>
      </motion.div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 max-w-[640px]">
          <Command className="rounded-lg border shadow-md">
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Navigation">
                {commands.map((command) => (
                  <CommandItem
                    key={command.label}
                    onSelect={() => {
                      command.action()
                      setOpen(false)
                    }}
                    className="flex items-center gap-2"
                  >
                    {command.icon}
                    <span>{command.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  )
}
