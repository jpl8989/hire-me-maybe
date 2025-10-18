"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AudioPlayer } from "@/components/audio-player"
import Link from "next/link"
import { AnimatedCardReveal } from "./animated-card-reveal"
import { AnimatedTextReveal } from "./animated-text-reveal"

interface TarotReadingResultProps {
  reading: {
    id: string
    cardName: string
    meaning: string
    interpretation: string
    image?: string
  }
  candidateName: string
  matchId: string
  candidateId: string
}

export function TarotReadingResult({ reading, candidateName, matchId, candidateId }: TarotReadingResultProps) {
  const [readingAudio, setReadingAudio] = useState<{ audioData: string; mimeType: string } | null>(null)
  const [audioLoading, setAudioLoading] = useState(false)

  // Load reading audio on component mount - non-blocking
  useEffect(() => {
    const loadReadingAudio = async () => {
      try {
        // Start loading indicator
        setAudioLoading(true)

        // Fetch audio from the API endpoint
        const response = await fetch(`/tarot/${matchId}/reading/${reading.id}/audio`)
        
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.audioData) {
            const audioData = {
              audioData: result.audioData,
              mimeType: result.mimeType
            }
            setReadingAudio(audioData)
          }
        } else {
          console.error('Failed to fetch audio:', response.status)
        }
      } catch (error) {
        console.error('Failed to load reading audio:', error)
      } finally {
        setAudioLoading(false)
      }
    }

    // Start audio loading in background after a short delay to let page render first
    const timer = setTimeout(() => {
      loadReadingAudio()
    }, 100)

    return () => clearTimeout(timer)
  }, [reading.id, matchId])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#a8b88f] to-[#d4d4a8] p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button asChild variant="ghost" size="sm" className="text-slate-700">
          <Link href={`/compatibility/${candidateId}`}>
            <span className="mr-2">←</span>
            Back to Report
          </Link>
        </Button>

        <Card className="border-2 bg-white/90 backdrop-blur">
          <CardHeader className="text-center space-y-6 pb-8">
            {/* Animated Card Reveal */}
            <AnimatedCardReveal 
              cardName={reading.cardName}
              candidateName={candidateName}
              isLoading={false}
              imageUrl={reading.image}
            />
            
            {/* Audio Player */}
            <div className="flex justify-center mt-4">
              {audioLoading && (
                <div className="flex items-center space-x-2 text-slate-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-600"></div>
                  <span className="text-sm">Generating audio...</span>
                </div>
              )}
              {readingAudio && !audioLoading && (
                <AudioPlayer
                  audioData={readingAudio.audioData}
                  mimeType={readingAudio.mimeType}
                  autoPlay={true}
                  className="max-w-md"
                />
              )}
            </div>
          </CardHeader>
        </Card>

        <Card className="bg-white/90 backdrop-blur">
          <CardHeader>
            <CardTitle className="font-serif">Your Reading for {candidateName}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-slate max-w-none">
              <AnimatedTextReveal text={reading.interpretation} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center gap-4 pb-8">
          <Button asChild variant="outline" size="lg">
            <Link href={`/tarot/${matchId}`}>Draw Another Card</Link>
          </Button>
          <Button asChild size="lg">
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
