import type React from "react"
import type { Metadata } from "next"
import { Inter, Playfair_Display, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _inter = Inter({ subsets: ["latin"], variable: "--font-sans" })
const _playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "HireMeMaybe - BaZi Compatibility Analysis",
  description: "Discover workplace compatibility through BaZi astrology",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Enable audio context immediately on page load
              (function() {
                try {
                  // Create and resume audio context to enable autoplay
                  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                  if (audioContext.state === 'suspended') {
                    audioContext.resume();
                  }
                  
                  // Also try to enable autoplay by creating a silent audio element
                  const silentAudio = document.createElement('audio');
                  silentAudio.muted = true;
                  silentAudio.loop = true;
                  silentAudio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
                  silentAudio.play().catch(() => {});
                  
                  // Remove after a short delay
                  setTimeout(() => {
                    if (silentAudio.parentNode) {
                      silentAudio.parentNode.removeChild(silentAudio);
                    }
                  }, 1000);
                } catch (e) {
                  // Ignore errors
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
