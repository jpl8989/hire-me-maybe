import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Cormorant_Garamond, Inter } from "next/font/google"

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-display",
})
const ui = Inter({ subsets: ["latin"], variable: "--font-ui" })

export default function HomePage() {
  return (
    <div className={`theme-obsidian-aurum oa-gradient min-h-screen ${display.variable} ${ui.variable}`}>
      {/* Hero Section */}
      <section className="starfield vignette">
        <div className="container mx-auto px-4 py-20 md:py-28">
          <div className="flex flex-col items-center text-center gap-8 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card backdrop-blur-sm text-foreground text-sm font-medium border border-border/50">
            <span>✨</span>
            <span>AI-Powered Compatibility Analysis</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-display font-bold leading-[1.1] tracking-[0.01em] text-balance text-foreground">
            HireMe<span className="italic">Maybe</span>
          </h1>

          <h2 className="text-2xl md:text-3xl font-normal text-muted-foreground text-balance">
            Let the Universe Guide Your Hiring Decisions
          </h2>

          <p className="text-lg md:text-xl text-muted-foreground text-balance max-w-2xl">
            Discover workplace compatibility through cosmic readings powered by Tarot, BaZi astrology, and a little magic.
          </p>

          <div className="hr-star mx-auto mt-8 w-40" />

          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <Button asChild size="lg" className="text-lg px-8">
              <Link href="/auth/sign-up">Get Started</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="text-lg px-8 border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)]"
            >
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </div>
          </div>
        </div>
      </section>

      {/* Proof Strip */}
      <section className="border-t border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <span>7k+ compatibility matches</span>
            <span className="hidden sm:inline">•</span>
            <span>Backed by BaZi principles</span>
            <span className="hidden sm:inline">•</span>
            <span>Actionable AI insights</span>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section>
        <div className="grid md:grid-cols-3 gap-6 py-16 md:py-24 max-w-5xl mx-auto px-4">
          <Card className="border bg-card">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-2xl">✨</div>
                <h3 className="text-xl font-semibold">BaZi Analysis</h3>
                <p className="text-muted-foreground">
                  Ancient Chinese astrology meets modern AI to reveal deep compatibility insights based on birth data.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border bg-card">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-2xl">👥</div>
                <h3 className="text-xl font-semibold">Team Matching</h3>
                <p className="text-muted-foreground">
                  Match managers with candidates to build teams that naturally work well together.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border bg-card">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-2xl">📈</div>
                <h3 className="text-xl font-semibold">AI Insights</h3>
                <p className="text-muted-foreground">
                  Get detailed compatibility scores, narrative insights, and actionable recommendations.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Band */}
      <section className="border-t border-border">
        <div className="container mx-auto px-4 py-16 md:py-20 text-center">
          <h3 className="text-2xl md:text-3xl mb-6 text-foreground">Ready to explore your team’s cosmic fit?</h3>
          <Button asChild size="lg" className="text-lg px-8">
            <Link href="/auth/sign-up">Create your free account</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
