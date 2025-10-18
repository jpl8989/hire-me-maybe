"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AudioPlayer } from "@/components/audio-player"
import { generateReadingAudio } from "../../voice-actions"
import Link from "next/link"
import { TAROT_CARDS } from "@/lib/tarot/cards"

interface TarotReadingResultProps {
  reading: {
    cardName: string
    meaning: string
    interpretation: string
  }
  candidateName: string
  matchId: string
  candidateId: string
}

export function TarotReadingResult({ reading, candidateName, matchId, candidateId }: TarotReadingResultProps) {
  const [readingAudio, setReadingAudio] = useState<{ audioData: string; mimeType: string } | null>(null)
  const card = TAROT_CARDS.find((c) => c.name === reading.cardName)

  // Generate reading audio on component mount
  useEffect(() => {
    const loadReadingAudio = async () => {
      try {
        const result = await generateReadingAudio(
          reading.cardName,
          reading.meaning,
          reading.interpretation,
          candidateName
        )
        if (result.success && result.audioData && result.audioData.length > 1000) {
          setReadingAudio({
            audioData: result.audioData,
            mimeType: result.mimeType || 'audio/mpeg'
          })
        }
      } catch (error) {
        console.error('Failed to load reading audio:', error)
      }
    }

    // Add a small delay to ensure the page is fully loaded before generating audio
    const timer = setTimeout(() => {
      loadReadingAudio()
    }, 500)

    return () => clearTimeout(timer)
  }, [reading.cardName, reading.meaning, reading.interpretation, candidateName])

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
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="text-6xl">{card?.image}</div>
            <CardTitle className="text-3xl font-serif">{reading.cardName}</CardTitle>
            <CardDescription className="text-base italic">{reading.meaning}</CardDescription>
            
            {/* Audio Player */}
            {readingAudio && (
              <div className="flex justify-center mt-4">
                <AudioPlayer
                  audioData={readingAudio.audioData}
                  mimeType={readingAudio.mimeType}
                  autoPlay={true}
                  className="max-w-md"
                />
              </div>
            )}
          </CardHeader>
        </Card>

        <Card className="bg-white/90 backdrop-blur">
          <CardHeader>
            <CardTitle className="font-serif">Your Reading for {candidateName}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-700 leading-relaxed whitespace-pre-line">{reading.interpretation}</p>
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
