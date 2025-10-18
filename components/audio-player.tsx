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
        playAudio()
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
      
      // Now try to play
      await audioRef.current.play()
      setIsPlaying(true)
    } catch (error) {
      console.error('Error playing audio:', error)
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
    <div className={`flex items-center gap-2 p-3 bg-white/80 backdrop-blur-sm rounded-lg border border-purple-200 shadow-sm ${className}`}>
      <audio
        ref={audioRef}
        onEnded={handleAudioEnd}
        onError={handleAudioError}
        preload="metadata"
        crossOrigin="anonymous"
      />
      
      {/* Play/Pause Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={isPlaying ? pauseAudio : playAudio}
        disabled={isLoading || hasError}
        className="h-8 w-8 p-0 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
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
        disabled={isLoading || hasError}
        className="h-8 w-8 p-0 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
      >
        <RotateCcw className="h-4 w-4" />
      </Button>

      {/* Mute/Unmute Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleMute}
        disabled={isLoading || hasError}
        className="h-8 w-8 p-0 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
      >
        {isMuted ? (
          <VolumeX className="h-4 w-4" />
        ) : (
          <Volume2 className="h-4 w-4" />
        )}
      </Button>

      {/* Status Text */}
      <div className="text-xs text-slate-600 ml-2">
        {hasError ? (
          <span className="text-red-600">Audio unavailable</span>
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
