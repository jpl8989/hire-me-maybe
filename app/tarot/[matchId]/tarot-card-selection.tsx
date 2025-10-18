"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TAROT_CARDS } from "@/lib/tarot/cards"
import { generateTarotReading } from "./actions"
import { generateIntroAudio } from "./voice-actions"
import { AudioPlayer } from "@/components/audio-player"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface TarotCardSelectionProps {
  matchId: string
  candidateName: string
  candidateId: string
}

export function TarotCardSelection({ matchId, candidateName, candidateId }: TarotCardSelectionProps) {
  const [selectedCard, setSelectedCard] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [introAudio, setIntroAudio] = useState<{ audioData: string; mimeType: string } | null>(null)
  const router = useRouter()

  // Generate intro audio on component mount
  useEffect(() => {
    const loadIntroAudio = async () => {
      try {
        const result = await generateIntroAudio(candidateName)
        if (result.success && result.audioData && result.audioData.length > 1000) {
          setIntroAudio({
            audioData: result.audioData,
            mimeType: result.mimeType || 'audio/mpeg'
          })
        }
      } catch (error) {
        console.error('Failed to load intro audio:', error)
      }
    }

    // Add a small delay to ensure the page is fully loaded before generating audio
    const timer = setTimeout(() => {
      loadIntroAudio()
    }, 500)

    return () => clearTimeout(timer)
  }, [candidateName])

  const handleCardSelect = async (cardName: string) => {
    setSelectedCard(cardName)
    setIsGenerating(true)
    setError(null)

    const result = await generateTarotReading(matchId, cardName)

    if (result.success && result.reading) {
      // Navigate to the reading result page
      router.push(`/tarot/${matchId}/reading/${result.reading.id}`)
    } else {
      setError(result.error || "Failed to generate reading")
      setIsGenerating(false)
      setSelectedCard(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#a8b88f] to-[#d4d4a8] p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <Button asChild variant="ghost" size="sm" className="text-slate-700">
          <Link href={`/compatibility/${candidateId}`}>
            <span className="mr-2">←</span>
            Back to Report
          </Link>
        </Button>

        <Card className="border-2 bg-white/90 backdrop-blur">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-3xl font-serif">Tarot Reading</CardTitle>
            <CardDescription className="text-base">
              Draw a card to receive mystical guidance about {candidateName}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Audio Player */}
            {introAudio && (
              <div className="flex justify-center">
                <AudioPlayer
                  audioData={introAudio.audioData}
                  mimeType={introAudio.mimeType}
                  autoPlay={true}
                  className="max-w-md"
                />
              </div>
            )}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
            )}

            <div className="text-center text-slate-600 mb-8">
              <p>Choose a card that calls to you. Trust your intuition.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {TAROT_CARDS.map((card) => (
                <button
                  key={card.name}
                  onClick={() => handleCardSelect(card.name)}
                  disabled={isGenerating}
                  className={`
                    relative aspect-[2/3] rounded-lg border-2 transition-all
                    ${
                      selectedCard === card.name
                        ? "border-purple-500 bg-purple-50 scale-95"
                        : "border-slate-300 bg-white hover:border-purple-300 hover:shadow-lg hover:scale-105"
                    }
                    ${isGenerating ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                    flex flex-col items-center justify-center p-4
                  `}
                >
                  <div className="text-4xl mb-2">{card.image}</div>
                  <div className="text-xs text-center font-medium text-slate-700">{card.name}</div>
                </button>
              ))}
            </div>

            {isGenerating && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <p className="mt-4 text-slate-600">Channeling cosmic wisdom...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
