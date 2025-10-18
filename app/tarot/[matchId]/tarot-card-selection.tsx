"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TAROT_CARDS, TarotCard } from "@/lib/tarot/cards"
import { generateIntroAudio } from "./voice-actions"
import { AudioPlayer } from "@/components/audio-player"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { generateTarotReading } from "./actions"

interface TarotCardSelectionProps {
  matchId: string
  candidateName: string
  candidateId: string
}

export function TarotCardSelection({ matchId, candidateName, candidateId }: TarotCardSelectionProps) {
  const [selectedCard, setSelectedCard] = useState<TarotCard | null>(null)
  const [introAudio, setIntroAudio] = useState<{ audioData: string; mimeType: string } | null>(null)
  const [randomCards] = useState<TarotCard[]>(() => {
    // Shuffle all 12 cards for randomization
    const shuffled = [...TAROT_CARDS]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    
    console.log('Shuffled cards:', shuffled.map(c => c.name))
    return shuffled
  })
  const [imageLoaded, setImageLoaded] = useState<boolean>(false)
  const [imageError, setImageError] = useState<boolean>(false)
  const router = useRouter()

  // Enable audio context after first user interaction
  useEffect(() => {
    const enableAudioContext = async () => {
      try {
        // Try to enable audio context on first user interaction
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        if (audioContext.state === 'suspended') {
          await audioContext.resume()
        }
      } catch (error) {
        // Audio context not available or already enabled
      }
    }

    // Listen for any user interaction to enable audio
    const handleUserInteraction = () => {
      enableAudioContext()
      document.removeEventListener('click', handleUserInteraction)
      document.removeEventListener('keydown', handleUserInteraction)
      document.removeEventListener('touchstart', handleUserInteraction)
    }

    document.addEventListener('click', handleUserInteraction)
    document.addEventListener('keydown', handleUserInteraction)
    document.addEventListener('touchstart', handleUserInteraction)

    return () => {
      document.removeEventListener('click', handleUserInteraction)
      document.removeEventListener('keydown', handleUserInteraction)
      document.removeEventListener('touchstart', handleUserInteraction)
    }
  }, [])

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

  const handleCardSelect = async (card: TarotCard) => {
    try {
      setSelectedCard(card)
      const res = await generateTarotReading(matchId, card.name)
      if (res?.success && res.reading?.id) {
        const img = encodeURIComponent(res.imageUrl || res.reading.image || "")
        router.push(`/tarot/${matchId}/reading/${res.reading.id}?img=${img}`)
      } else {
        console.error('Failed to create reading:', res?.error)
      }
    } catch (e) {
      console.error('Error starting reading:', e)
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

            <div className="text-center text-slate-600 mb-8">
              <p>Choose a card that calls to you. Trust your intuition.</p>
            </div>

            {/* 4x3 grid layout - 4 columns on desktop, responsive on mobile */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {randomCards.length > 0 ? randomCards.map((card, index) => (
                <button
                  key={`${card.name}-${index}`}
                  onClick={() => handleCardSelect(card)}
                  className={`
                    relative aspect-[2/3] rounded-xl transition-all duration-300
                    ${
                      selectedCard?.name === card.name
                        ? "scale-95 shadow-xl"
                        : "hover:scale-105 hover:shadow-2xl"
                    }
                    cursor-pointer
                    group
                  `}
                >
                  {/* Card back - all cards look identical */}
                  <div className="w-full h-full rounded-xl overflow-hidden shadow-lg border-2 border-purple-400/30 relative">
                    {/* Your uploaded card back image */}
                    {!imageError ? (
                      <Image
                        src="/tarot-card-back.jpg"
                        alt="Tarot card back"
                        width={200}
                        height={300}
                        className="w-full h-full object-cover rounded-xl"
                        onLoad={() => setImageLoaded(true)}
                        onError={() => setImageError(true)}
                        priority={index < 4} // Prioritize loading first 4 images
                      />
                    ) : (
                      /* Fallback CSS design */
                      <div className="w-full h-full bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 flex flex-col items-center justify-center">
                        {/* Mystical symbol in center */}
                        <div className="flex flex-col items-center justify-center space-y-2">
                          {/* Outer circle */}
                          <div className="w-12 h-12 rounded-full border-2 border-white/40 flex items-center justify-center">
                            {/* Inner mystical symbol */}
                            <div className="w-8 h-8 flex items-center justify-center">
                              <div className="text-white text-xl opacity-70">✦</div>
                            </div>
                          </div>
                          {/* Corner decorations */}
                          <div className="absolute top-3 left-3 w-3 h-3 border border-white/30 rounded-sm" />
                          <div className="absolute top-3 right-3 w-3 h-3 border border-white/30 rounded-sm" />
                          <div className="absolute bottom-3 left-3 w-3 h-3 border border-white/30 rounded-sm" />
                          <div className="absolute bottom-3 right-3 w-3 h-3 border border-white/30 rounded-sm" />
                        </div>
                      </div>
                    )}
                    
                    {/* Subtle hover glow effect */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Mystical sparkle on hover */}
                    <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute top-4 left-4 w-2 h-2 bg-white rounded-full animate-pulse" />
                      <div className="absolute top-8 right-6 w-1 h-1 bg-purple-200 rounded-full animate-pulse delay-100" />
                      <div className="absolute bottom-6 left-8 w-1.5 h-1.5 bg-white rounded-full animate-pulse delay-200" />
                      <div className="absolute bottom-4 right-4 w-1 h-1 bg-purple-200 rounded-full animate-pulse delay-300" />
                    </div>
                  </div>
                </button>
              )) : (
                <div className="col-span-full text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  <p className="mt-4 text-slate-600">Shuffling the cards...</p>
                </div>
              )}
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  )
}
