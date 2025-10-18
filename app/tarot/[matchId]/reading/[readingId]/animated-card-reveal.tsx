"use client"

import { useState, useEffect } from "react"
import { TAROT_CARDS } from "@/lib/tarot/cards"
import { useMemo } from "react"
import Image from "next/image"

interface AnimatedCardRevealProps {
  cardName: string
  candidateName: string
  isLoading: boolean
  imageUrl?: string
}

export function AnimatedCardReveal({ 
  cardName, 
  candidateName, 
  isLoading,
  imageUrl
}: AnimatedCardRevealProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [generationFailed, setGenerationFailed] = useState(false)

  // Find the selected card
  const selectedCard = TAROT_CARDS.find(card => card.name === cardName)

  // No client-side generation; rely on server-provided imageUrl or static fallback

  // Trigger flip animation after component mounts - reduced delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFlipped(true)
    }, 300) // Reduced from 800ms to 300ms
    return () => clearTimeout(timer)
  }, [])

  // No initial static/video display: show loader until generated or failure

  if (!selectedCard) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-600">Card not found</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center space-y-8">
      {/* Card with animation and static image */}
      <div className="relative">
        <div className="relative w-48 h-72 mx-auto">
          {/* Card back */}
          <div 
            className={`absolute w-full h-full rounded-xl overflow-hidden shadow-xl border-2 border-purple-400/30 transition-opacity duration-1000 ${
              isFlipped ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <div className="w-full h-full bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 flex flex-col items-center justify-center">
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="w-16 h-16 rounded-full border-2 border-white/40 flex items-center justify-center">
                  <div className="w-12 h-12 flex items-center justify-center">
                    <div className="text-white text-2xl opacity-70">✦</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Card front: prefer generated; show loader while generating; fallback to static on failure */}
          <div 
            className={`absolute w-full h-full rounded-xl overflow-hidden shadow-xl border-2 border-amber-200 transition-opacity duration-1000 ${
              isFlipped ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={selectedCard.name}
                width={192}
                height={288}
                className="w-full h-full object-cover rounded-xl"
                onError={() => setGenerationFailed(true)}
              />
            ) : generationFailed ? (
              <Image
                src={selectedCard.image}
                alt={selectedCard.name}
                width={192}
                height={288}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <div className="w-full h-full rounded-xl bg-gradient-to-br from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-700 animate-pulse" />
            )}
          </div>
        </div>
      </div>

      {/* Card details */}
      <div className={`transition-opacity duration-700 delay-500 ${isFlipped ? 'opacity-100' : 'opacity-0'}`}>
        <h3 className="text-3xl font-serif text-center">{selectedCard.name}</h3>
        <p className="text-base italic text-center text-slate-600 mt-2">{selectedCard.mantra}</p>
      </div>
    </div>
  )
}
