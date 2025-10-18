"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createMatchAndAnalyzeInBackground } from "@/app/dashboard/actions"

export default function PrepareTarotPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const candidateId = searchParams.get("candidateId") || ""
  const candidateName = searchParams.get("candidateName") || "your candidate"
  const from = searchParams.get("from") || ""

  const [imageError, setImageError] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const placeholders = useMemo(() => Array.from({ length: 12 }, (_, i) => i), [])

  useEffect(() => {
    if (!candidateId) return

    let cancelled = false

    ;(async () => {
      try {
        const res = await createMatchAndAnalyzeInBackground(candidateId)
        if (!cancelled) {
          if (res?.success && res.matchId) {
            // Preserve the source flag if present
            const suffix = from ? `?from=${encodeURIComponent(from)}` : ""
            router.replace(`/tarot/${res.matchId}${suffix}`)
          } else {
            // Stay on this page and let the user retry instead of bouncing to a 404
            setError(res?.error || "Failed to initialize tarot flow. Please retry.")
          }
        }
      } catch {
        if (!cancelled) setError("Something went wrong starting your tarot flow. Please retry.")
      }
    })()

    return () => {
      cancelled = true
    }
  }, [candidateId, router])

  return (
    <div className="min-h-screen theme-obsidian-aurum oa-gradient starfield vignette p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card className="border border-white/10 bg-black/40 backdrop-blur edge-glow text-white">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-3xl font-serif text-white">Tarot Reading</CardTitle>
            <CardDescription className="text-base text-slate-300">
              Trust your intuition — pick a card for {candidateName} when you feel called
            </CardDescription>
            <div className="text-sm text-slate-300">Close your eyes, breathe in, and let the universe guide your hand.</div>
            {error && (
              <div className="mt-3 text-sm text-red-400">
                {error}
                <button
                  className="ml-2 underline"
                  onClick={() => {
                    setError(null)
                    // Retry by re-running effect logic with a soft navigation
                    router.refresh()
                  }}
                >
                  Retry
                </button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {placeholders.map((i) => (
                <div
                  key={i}
                  className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-lg border-2 border-yellow-500/30"
                >
                  {!imageError ? (
                    <Image
                      src="/tarot-card-back.jpg"
                      alt="Tarot card back"
                      width={200}
                      height={300}
                      className="w-full h-full object-cover rounded-xl"
                      onError={() => setImageError(true)}
                      priority={i < 4}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-amber-600 via-amber-700 to-zinc-900 flex items-center justify-center rounded-xl">
                      <div className="text-white text-2xl opacity-80">✦</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


