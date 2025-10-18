"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TAROT_CARDS } from "@/lib/tarot/cards"

interface PendingReadingDisplayProps {
  matchId: string
  candidateName: string
  candidateId: string
  cardName: string
  readingPromise: Promise<{ success: boolean; reading?: any; error?: string; audioGenerating?: boolean }>
}

export function PendingReadingDisplay({ 
  matchId, 
  candidateName, 
  candidateId, 
  cardName, 
  readingPromise 
}: PendingReadingDisplayProps) {
  const [reading, setReading] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showCard, setShowCard] = useState(false)
  const [showText, setShowText] = useState(false)
  const router = useRouter()

  // Find the selected card for display
  const selectedCard = TAROT_CARDS.find(card => card.name === cardName)

  useEffect(() => {
    const handleReadingGeneration = async () => {
      try {
        const result = await readingPromise
        
        if (result.success && result.reading) {
          setReading(result.reading)
          
          // Progressive reveal: show card flip first
          setTimeout(() => {
            setShowCard(true)
            setIsLoading(false)
            
            // Then show text after card animation
            setTimeout(() => {
              setShowText(true)
            }, 800)
          }, 500)
          
        } else {
          setError(result.error || "Failed to generate reading")
          setIsLoading(false)
        }
      } catch (err) {
        setError("Failed to generate reading")
        setIsLoading(false)
      }
    }

    handleReadingGeneration()
  }, [readingPromise])

  const handleViewFullReading = () => {
    if (reading) {
      router.push(`/tarot/${matchId}/reading/${reading.id}`)
    }
  }

  if (error) {
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
                Error generating reading for {candidateName}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
              <div className="text-center">
                <Button asChild>
                  <Link href={`/tarot/${matchId}`}>
                    Try Again
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
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
              {isLoading ? `Channeling cosmic wisdom for ${candidateName}...` : `Your reading for ${candidateName}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center space-y-8">
              {/* Card Display - Progressive Reveal */}
              <div className="relative">
                <div className={`relative aspect-[2/3] w-48 md:w-56 rounded-xl`}>
                  {/* Card Back (loading state) */}
                  <div className={`absolute inset-0 rounded-xl overflow-hidden shadow-lg border-2 border-purple-400/30 transition-opacity duration-500 ${
                    showCard ? 'opacity-0' : 'opacity-100'
                  }`}>
                    <Image
                      src="/tarot-card-back.jpg"
                      alt="Tarot card back"
                      width={200}
                      height={300}
                      className="w-full h-full object-cover rounded-xl"
                    />
                    {/* Pulse glow effect */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent animate-pulse-glow" />
                    
                    {/* Floating sparkles */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute top-4 left-4 w-2 h-2 bg-white rounded-full animate-float-sparkle" />
                      <div className="absolute top-8 right-6 w-1 h-1 bg-purple-200 rounded-full animate-float-sparkle delay-100" />
                      <div className="absolute bottom-6 left-8 w-1.5 h-1.5 bg-white rounded-full animate-float-sparkle delay-200" />
                      <div className="absolute bottom-4 right-4 w-1 h-1 bg-purple-200 rounded-full animate-float-sparkle delay-300" />
                    </div>
                  </div>

                  {/* Card Front (revealed) */}
                  {selectedCard && (
                    <div className={`absolute inset-0 rounded-xl overflow-hidden shadow-lg border-2 border-gold-400/50 transition-opacity duration-500 ${
                      showCard ? 'opacity-100' : 'opacity-0'
                    }`}>
                      <Image
                        src={(reading?.image as string) || selectedCard.image}
                        alt={selectedCard.name}
                        width={200}
                        height={300}
                        className="w-full h-full object-cover rounded-xl"
                      />
                      {/* Card name overlay */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                        <p className="text-white font-medium text-sm text-center">{selectedCard.name}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Text and Content */}
              {isLoading ? (
                <div className="text-center space-y-2">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                  <p className="text-slate-600">Channeling cosmic wisdom...</p>
                </div>
              ) : (
                <div className="space-y-4 max-w-2xl mx-auto">
                  {/* Interpretation Preview */}
                  {reading && showText && (
                    <div className="space-y-4">
                      <div className="text-center">
                        <h3 className="text-xl font-serif text-slate-800 mb-3">Your Reading</h3>
                        <div className="bg-white/70 backdrop-blur p-4 rounded-lg border border-slate-200">
                          <p className="text-slate-700 leading-relaxed text-sm">
                            {reading.interpretation.length > 200 
                              ? `${reading.interpretation.substring(0, 200)}...`
                              : reading.interpretation
                            }
                          </p>
                        </div>
                      </div>
                      
                      {/* Audio Status */}
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-2 text-slate-600">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          <span className="text-sm">Generating audio reading...</span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="text-center pt-4">
                        <Button onClick={handleViewFullReading} size="lg" className="bg-purple-600 hover:bg-purple-700">
                          View Full Reading
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
