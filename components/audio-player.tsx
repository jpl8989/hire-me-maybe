"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Play, Pause, Volume2, VolumeX, RotateCcw, Loader2 } from "lucide-react"

interface AudioPlayerProps {
  audioData?: string // Base64 encoded audio data
  mimeType?: string
  autoPlay?: boolean
  className?: string
}

export function AudioPlayer({ 
  audioData, 
  mimeType = 'audio/mpeg', 
  autoPlay = true,
  className = "" 
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const hasAutoPlayedRef = useRef(false)

  // Create audio URL from base64 data
  const audioUrl = audioData ? `data:${mimeType};base64,${audioData}` : null

  // Reset auto-play flag when audio data changes
  useEffect(() => {
    hasAutoPlayedRef.current = false
    setIsPlaying(false)
    setIsLoading(false)
    setHasError(false)
  }, [audioData])

  useEffect(() => {
    if (audioUrl && autoPlay && !isPlaying && !isLoading && !hasAutoPlayedRef.current) {
      // Only auto-play if we have complete audio data
      if (audioData && audioData.length > 1000) { // Ensure we have substantial audio data
        hasAutoPlayedRef.current = true
        // Add a small delay to allow the page to fully load
        setTimeout(() => {
          playAudio()
        }, 1000)
      }
    }
  }, [audioUrl, autoPlay, isPlaying, isLoading, audioData])

  const playAudio = async () => {
    if (!audioRef.current || !audioUrl) return

    setIsLoading(true)
    setHasError(false)

    try {
      // Set the audio source
      audioRef.current.src = audioUrl
      audioRef.current.volume = isMuted ? 0 : 1
      
      // Add autoplay attribute to help with browser compatibility
      audioRef.current.setAttribute('autoplay', 'true')
      
      // Wait for the audio to be ready to play
      await new Promise((resolve, reject) => {
        if (!audioRef.current) return reject(new Error('Audio ref not available'))
        
        const audio = audioRef.current
        
        const handleCanPlay = () => {
          audio.removeEventListener('canplaythrough', handleCanPlay)
          audio.removeEventListener('error', handleError)
          resolve(undefined)
        }
        
        const handleError = (e: Event) => {
          audio.removeEventListener('canplaythrough', handleCanPlay)
          audio.removeEventListener('error', handleError)
          reject(e)
        }
        
        // Check if audio is already ready
        if (audio.readyState >= 3) { // HAVE_FUTURE_DATA or higher
          resolve(undefined)
        } else {
          audio.addEventListener('canplaythrough', handleCanPlay)
          audio.addEventListener('error', handleError)
        }
      })
      
      // Multiple attempts to play with different strategies
      let playSuccess = false
      
      // Strategy 1: Direct play
      try {
        await audioRef.current.play()
        playSuccess = true
      } catch (error) {
        console.log('Direct play failed, trying alternative methods...')
      }
      
      // Strategy 2: Try with muted first, then unmute
      if (!playSuccess) {
        try {
          audioRef.current.muted = true
          await audioRef.current.play()
          audioRef.current.muted = false
          playSuccess = true
        } catch (error) {
          console.log('Muted play failed, trying click simulation...')
        }
      }
      
      // Strategy 3: Simulate user interaction programmatically
      if (!playSuccess) {
        try {
          // Create a temporary button and click it to enable audio context
          const tempButton = document.createElement('button')
          tempButton.style.display = 'none'
          document.body.appendChild(tempButton)
          tempButton.click()
          document.body.removeChild(tempButton)
          
          // Now try to play again
          await audioRef.current.play()
          playSuccess = true
        } catch (error) {
          console.log('Simulated click failed')
        }
      }
      
      if (playSuccess) {
        setIsPlaying(true)
      } else {
        console.warn('All play strategies failed - user interaction may be required')
        setHasError(true)
        return
      }
      
    } catch (error) {
      console.error('Audio play failed:', error)
      setHasError(true)
    } finally {
      setIsLoading(false)
    }
  }

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const replayAudio = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      if (!isPlaying) {
        playAudio()
      }
    }
  }

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 1 : 0
      setIsMuted(!isMuted)
    }
  }

  const handleAudioEnd = () => {
    setIsPlaying(false)
  }

  const handleAudioError = () => {
    setHasError(true)
    setIsLoading(false)
    setIsPlaying(false)
  }

  // Don't render if no audio data
  if (!audioData) {
    return null
  }

  return (
    <div className={`relative flex items-center gap-3 h-12 px-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_8px_24px_-8px_rgba(0,0,0,0.6)] ring-1 ring-white/5 ${className}`}>
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-white/10 to-transparent" />
      <audio
        ref={audioRef}
        onEnded={handleAudioEnd}
        onError={handleAudioError}
        preload="auto"
        crossOrigin="anonymous"
        playsInline
        autoPlay
        muted={false}
      />
      
      {/* Play/Pause Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={isPlaying ? pauseAudio : playAudio}
        disabled={isLoading}
        className="h-8 w-8 p-0 text-white/80 hover:text-white hover:bg-white/10 focus-visible:ring-white/20 focus-visible:border-white/20 disabled:text-white/40"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>

      {/* Replay Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={replayAudio}
        disabled={isLoading}
        className="h-8 w-8 p-0 text-white/80 hover:text-white hover:bg-white/10 focus-visible:ring-white/20 focus-visible:border-white/20 disabled:text-white/40"
      >
        <RotateCcw className="h-4 w-4" />
      </Button>

      {/* Mute/Unmute Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleMute}
        disabled={isLoading}
        className="h-8 w-8 p-0 text-white/80 hover:text-white hover:bg-white/10 focus-visible:ring-white/20 focus-visible:border-white/20 disabled:text-white/40"
      >
        {isMuted ? (
          <VolumeX className="h-4 w-4" />
        ) : (
          <Volume2 className="h-4 w-4" />
        )}
      </Button>

      {/* Status Text */}
      <div className="text-xs ml-2 text-white/80">
        {hasError ? (
          <span className="text-red-400">Click play to start audio</span>
        ) : isLoading ? (
          <span>Loading...</span>
        ) : isPlaying ? (
          <span>Playing</span>
        ) : (
          <span>Ready</span>
        )}
      </div>
    </div>
  )
}
