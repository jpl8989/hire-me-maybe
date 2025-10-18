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
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
