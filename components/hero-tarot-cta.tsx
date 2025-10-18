"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface HeroTarotCtaProps {
  matchId: string
  candidateName?: string
}

export function HeroTarotCta({ matchId, candidateName }: HeroTarotCtaProps) {
  return (
    <div className="mt-8 space-y-4">
      {/* Main Hero Card */}
      <Card className="bg-gradient-to-br from-[#8a9a6f] to-[#a8b88f] border-2 border-[#d4af37]/30 shadow-2xl relative overflow-hidden">
        {/* Mystical sparkles overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-6 left-8 w-2 h-2 bg-[#d4af37] rounded-full animate-pulse opacity-60" />
          <div className="absolute top-12 right-12 w-1 h-1 bg-[#d4af37] rounded-full animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
          <div className="absolute bottom-8 left-12 w-1.5 h-1.5 bg-[#d4af37] rounded-full animate-pulse opacity-50" style={{ animationDuration: '3s', animationDelay: '1s' }} />
          <div className="absolute bottom-12 right-8 w-1 h-1 bg-[#d4af37] rounded-full animate-ping" style={{ animationDuration: '2.5s', animationDelay: '1.5s' }} />
        </div>

        <CardContent className="px-8 pt-6 pb-4 text-center space-y-4 relative z-10">
          {/* Header */}
          <div className="space-y-3">
            <h2 className="text-xl font-serif font-bold text-[#2c3e1a]">
              Unlock Deeper Mystical Insights
            </h2>
            <p className="text-[#4a5a2a] text-sm leading-relaxed max-w-2xl mx-auto">
              You've discovered your cosmic compatibility... but the tarot cards hold secrets about your journey together. 
              Draw a card to reveal what the universe wants you to know.
            </p>
          </div>

          {/* CTA Button */}
          <div className="flex justify-center">
            <Button 
              asChild 
              size="default" 
              className="bg-gradient-to-r from-[#8a9a6f] to-[#a89f6f] hover:from-[#7a8a5f] hover:to-[#9a8f5f] text-white font-semibold px-6 py-3 shadow-lg border-2 border-[#d4af37]/50 hover:border-[#d4af37]/70 transition-all duration-300 hover:scale-105"
              style={{
                boxShadow: '0 4px 20px rgba(212, 175, 55, 0.3), 0 0 30px rgba(212, 175, 55, 0.2)'
              }}
            >
              <Link href={`/tarot/${matchId}`}>
                Draw Your Tarot Card
              </Link>
            </Button>
          </div>

        </CardContent>
      </Card>

      {/* Back to Dashboard - Outside the card */}
      <div className="text-center">
        <Link 
          href="/dashboard"
          className="text-[#6b7a5a] hover:text-[#5a6a4a] text-sm font-medium transition-colors underline decoration-[#d4af37]/30 hover:decoration-[#d4af37]/50"
        >
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
