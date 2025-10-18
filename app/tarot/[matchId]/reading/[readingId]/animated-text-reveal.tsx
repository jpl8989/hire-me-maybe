"use client"

import { useState, useEffect } from "react"

interface AnimatedTextRevealProps {
  text: string
  className?: string
}

export function AnimatedTextReveal({ text, className = "" }: AnimatedTextRevealProps) {
  const [visibleParagraphs, setVisibleParagraphs] = useState<number[]>([])

  // Split text into paragraphs
  const paragraphs = text.split('\n\n').filter(p => p.trim().length > 0)

  useEffect(() => {
    // Reveal paragraphs one by one with staggered timing - faster
    paragraphs.forEach((_, index) => {
      setTimeout(() => {
        setVisibleParagraphs(prev => [...prev, index])
      }, index * 400) // Reduced from 800ms to 400ms delay between paragraphs
    })
  }, [paragraphs.length])

  return (
    <div className={`space-y-4 ${className}`}>
      {paragraphs.map((paragraph, index) => (
        <p 
          key={index}
          className={`
            text-slate-700 leading-relaxed whitespace-pre-line
            transition-all duration-600 ease-out
            ${visibleParagraphs.includes(index) 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-4'
            }
          `}
        >
          {paragraph}
        </p>
      ))}
    </div>
  )
}
