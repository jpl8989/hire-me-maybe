import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-[#a8b88f] to-[#d4d4a8]">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="flex flex-col items-center text-center gap-8 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm text-foreground text-sm font-medium border border-border/50">
            <span>✨</span>
            <span>AI-Powered Compatibility Analysis</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tight text-balance">HireMeMaybe</h1>

          <h2 className="text-2xl md:text-3xl font-normal text-muted-foreground text-balance">
            Discover Workplace Compatibility Through BaZi Astrology
          </h2>

          <p className="text-lg md:text-xl text-muted-foreground text-balance max-w-2xl">
            Harness the power of BaZi astrology and AI to understand team dynamics, optimize hiring decisions, and build
            harmonious work relationships.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Button asChild size="lg" className="text-lg px-8">
              <Link href="/auth/sign-up">Get Started</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="text-lg px-8 bg-white/80 backdrop-blur-sm hover:bg-white/90"
            >
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mt-24 max-w-5xl mx-auto">
          <Card className="border-2 bg-white/80 backdrop-blur-sm">
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

          <Card className="border-2 bg-white/80 backdrop-blur-sm">
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

          <Card className="border-2 bg-white/80 backdrop-blur-sm">
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
      </div>
    </div>
  )
}
