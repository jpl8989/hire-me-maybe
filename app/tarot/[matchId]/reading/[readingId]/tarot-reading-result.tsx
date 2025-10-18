"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AudioPlayer } from "@/components/audio-player"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { AnimatedCardReveal } from "./animated-card-reveal"
import { generateReadingAudio } from "../../voice-actions"
import { generateReadingAudio as generateCompanyReadingAudio } from "../../../company/[matchId]/voice-actions"
import { FadedCollapsible } from "./faded-collapsible"

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
  isCompany?: boolean
}

export function TarotReadingResult({ reading, candidateName, matchId, candidateId, isCompany = false }: TarotReadingResultProps) {
  const [readingAudio, setReadingAudio] = useState<{ audioData: string; mimeType: string } | null>(null)
  const [audioLoading, setAudioLoading] = useState(false)
  const searchParams = useSearchParams()
  const from = searchParams.get('from') || ''

  // Enable audio context after first user interaction (helps autoplay reliability)
  useEffect(() => {
    const enableAudioContext = async () => {
      try {
        const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext
        if (!AudioCtx) return
        const audioContext = new AudioCtx()
        if (audioContext.state === 'suspended') {
          await audioContext.resume()
        }
      } catch {
        // Ignore if not available
      }
    }

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

  // Load reading audio on component mount - non-blocking
  useEffect(() => {
    const loadReadingAudio = async () => {
      try {
        // Start loading indicator
        setAudioLoading(true)

      // Fetch audio from the appropriate API endpoint (candidate or company)
      const basePath = isCompany ? '/tarot/company' : '/tarot'
      const response = await fetch(`${basePath}/${matchId}/reading/${reading.id}/audio`)

        if (response.ok) {
          const result = await response.json()
          if (result.success && result.audioData) {
            setReadingAudio({ audioData: result.audioData, mimeType: result.mimeType || 'audio/mpeg' })
            return
          }
      } else {
        try {
          const errorPayload = await response.json()
          console.error('Audio route error:', errorPayload)
        } catch (jsonError) {
          console.error('Audio route returned non-JSON error:', jsonError)
        }
        }

        // Fallback: call server action directly (bypasses route errors)
        const fallback = await (isCompany ? generateCompanyReadingAudio : generateReadingAudio)(
          reading.cardName,
          reading.meaning,
          reading.interpretation,
          candidateName
        ) as any

        if (fallback?.success && fallback.audioData) {
          setReadingAudio({ audioData: fallback.audioData, mimeType: fallback.mimeType || 'audio/mpeg' })
        } else {
        console.error('Failed to fetch audio:', response.status, fallback?.error)
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
    }, 50)

    return () => clearTimeout(timer)
  }, [reading.id, matchId, isCompany])

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="relative flex min-h-screen flex-col">
        {/* Back button */}
        <div className="absolute left-4 top-4 z-20">
          <Button asChild variant="ghost" size="sm" className="text-white/80 hover:text-white">
            {from === 'add' || isCompany ? (
              <Link href={`/dashboard`}>
                <span className="mr-2">←</span>
                Back to Dashboard
              </Link>
            ) : (
              <Link href={`/compatibility/${candidateId}`}>
                <span className="mr-2">←</span>
                Back to Report
              </Link>
            )}
          </Button>
        </div>

        {/* Centered reveal zone */}
        <div className="flex flex-1 items-center justify-center px-4 pt-16 pb-40">
          <div className="flex flex-col items-center gap-6">
            <AnimatedCardReveal 
              cardName={reading.cardName}
              candidateName={candidateName}
              isLoading={false}
              imageUrl={reading.image}
            />

            {/* Audio below the card */}
            <div className="w-full max-w-md">
              {audioLoading && (
                <div className="flex items-center justify-center space-x-2 text-white/80">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white/80"></div>
                  <span className="text-sm">Generating audio...</span>
                </div>
              )}
              {readingAudio && !audioLoading && (
                <AudioPlayer
                  audioData={readingAudio.audioData}
                  mimeType={readingAudio.mimeType}
                  autoPlay={true}
                  className="max-w-full"
                />
              )}
            </div>
          </div>
        </div>

        {/* Bottom collapsible drawer */}
        <FadedCollapsible
          title={`Your reading for ${candidateName}`}
          subtitle={reading.meaning}
          body={reading.interpretation}
        />
      </div>
    </div>
  )
}
