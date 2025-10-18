"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"

interface FadedCollapsibleProps {
  title: string
  subtitle?: string
  body: string
  initialOpen?: boolean
}

export function FadedCollapsible({ title, subtitle, body, initialOpen = false }: FadedCollapsibleProps) {
  const [open, setOpen] = useState(initialOpen)
  const startYRef = useRef<number | null>(null)

  // Lock body scroll when open
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = open ? "hidden" : prev || ""
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  const onTouchStart = (e: React.TouchEvent) => {
    startYRef.current = e.touches[0]?.clientY ?? null
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (startYRef.current == null) return
    const delta = (e.changedTouches[0]?.clientY ?? startYRef.current) - startYRef.current
    if (delta > 60) setOpen(false)
    startYRef.current = null
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-30">
      {/* Scrim */}
      <div
        className={`fixed inset-0 -z-10 bg-black/60 transition-opacity ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={() => setOpen(false)}
        aria-hidden
      />

      <div className="mx-auto w-full max-w-4xl px-4 pb-[env(safe-area-inset-bottom)]">
        <div
          className={[
            "rounded-t-2xl border border-white/10 bg-white/5 backdrop-blur",
            "transition-[max-height] duration-300 overflow-hidden",
            open ? "max-h-[70vh]" : "max-h-28 md:max-h-32"
          ].join(" ")}
          aria-expanded={open}
          role="region"
        >
          <button
            className="w-full text-left p-4"
            onClick={() => setOpen(v => !v)}
            aria-controls="reading-panel"
            aria-label={open ? "Hide reading" : "Show reading"}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <div className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-white/50" />
            <div className="text-lg font-serif text-white">{title}</div>
            {subtitle ? <div className="text-sm text-white/70 mt-1 line-clamp-1">{subtitle}</div> : null}
          </button>

          <div id="reading-panel" className="relative px-4 pb-4">
            {!open && (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black via-black/60 to-transparent" />
            )}
            <div className={open ? "prose prose-invert max-w-none overflow-y-auto max-h-[48vh] pr-1" : "prose prose-invert max-w-none line-clamp-4"}>
              <p>{body}</p>
            </div>
            <div className="mt-3">
              <Button variant="secondary" size="sm" onClick={() => setOpen(v => !v)}>
                {open ? "Hide reading" : "Read more"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


