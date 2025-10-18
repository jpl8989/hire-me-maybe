import type { ReactNode } from "react"

export default function TarotMatchLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen theme-obsidian-aurum oa-gradient starfield vignette">
      {children}
    </div>
  )
}


