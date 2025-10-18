"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface TarotModalProps {
  matchId: string
  candidateName?: string
}

export function TarotModal({ matchId, candidateName }: TarotModalProps) {
  const [showModal, setShowModal] = useState(false)
  const [modalShown, setModalShown] = useState(false)

  useEffect(() => {
    // Check if modal was already shown in this session
    const modalShownThisSession = sessionStorage.getItem(`tarot-modal-${matchId}`)
    if (modalShownThisSession) {
      setModalShown(true)
    }

    const handleScroll = () => {
      const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      
      // Show modal after 80% scroll (only once per session)
      if (scrollPercentage > 80 && !modalShown && !modalShownThisSession) {
        setShowModal(true)
        setModalShown(true)
        sessionStorage.setItem(`tarot-modal-${matchId}`, 'true')
      }
    }

    // Check initial scroll position
    handleScroll()

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [matchId, modalShown])

  const handleCloseModal = () => {
    setShowModal(false)
  }

  return (
    <Dialog open={showModal} onOpenChange={handleCloseModal}>
      <DialogContent className="max-w-sm md:max-w-md mx-auto bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800 border-purple-400/50 text-white m-4">
        <DialogHeader>
          <DialogTitle className="sr-only">Tarot Card Reading</DialogTitle>
        </DialogHeader>
        
        {/* Close button */}
        <button
          onClick={handleCloseModal}
          className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-10"
          aria-label="Close modal"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center space-y-6 py-4">
          {/* Mystical Header */}
          <div className="space-y-2">
            <h2 className="text-2xl font-serif font-bold bg-gradient-to-r from-purple-200 to-indigo-200 bg-clip-text text-transparent">
              ✨ The Cards Are Calling ✨
            </h2>
            <p className="text-purple-100/80 text-sm">
              You've seen the cosmic compatibility... but what do the cards reveal about your journey together?
            </p>
          </div>

          {/* Tarot Card Preview */}
          <div className="relative mx-auto w-28 h-40 md:w-32 md:h-48 rounded-xl overflow-hidden shadow-2xl">
            <div className="w-full h-full bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 flex flex-col items-center justify-center relative">
              {/* Mystical symbol in center */}
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-white/40 flex items-center justify-center">
                  <div className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center">
                    <div className="text-white text-lg md:text-xl opacity-70">🔮</div>
                  </div>
                </div>
                {/* Corner decorations */}
                <div className="absolute top-3 left-3 w-3 h-3 border border-white/30 rounded-sm" />
                <div className="absolute top-3 right-3 w-3 h-3 border border-white/30 rounded-sm" />
                <div className="absolute bottom-3 left-3 w-3 h-3 border border-white/30 rounded-sm" />
                <div className="absolute bottom-3 right-3 w-3 h-3 border border-white/30 rounded-sm" />
              </div>
            </div>
            
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 to-transparent" />
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <Button asChild size="lg" className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-semibold shadow-lg">
              <Link href={`/tarot/${matchId}`} onClick={handleCloseModal}>
                <span className="mr-2">🔮</span>
                Draw Your Card Now
              </Link>
            </Button>
            
            <button
              onClick={handleCloseModal}
              className="text-purple-200/70 hover:text-purple-100 text-sm transition-colors"
            >
              Maybe later
            </button>
          </div>

          {/* Mystical sparkles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
            <div className="absolute top-8 left-8 w-1 h-1 bg-purple-300 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
            <div className="absolute top-16 right-12 w-0.5 h-0.5 bg-indigo-300 rounded-full animate-ping" style={{ animationDuration: '2.5s', animationDelay: '1s' }} />
            <div className="absolute bottom-12 left-12 w-0.5 h-0.5 bg-purple-200 rounded-full animate-ping" style={{ animationDuration: '4s', animationDelay: '2s' }} />
            <div className="absolute bottom-8 right-8 w-1 h-1 bg-indigo-200 rounded-full animate-ping" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
