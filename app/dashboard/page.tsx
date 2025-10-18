import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CandidatesList } from "./candidates-list"
import { startCompanyTarotFromDashboard } from "./actions"
import { Cormorant_Garamond, Inter } from "next/font/google"

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-display",
})
const ui = Inter({ subsets: ["latin"], variable: "--font-ui" })

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Fetch user profile with role
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (!profile?.role) {
    redirect("/auth/select-role")
  }

  const { data: birthData } = await supabase.from("birth_data").select("*").eq("user_id", user.id).maybeSingle()

  const hasCompletedProfile = !!birthData

  let candidates: any[] = []
  if (profile.role === "manager") {
    const { data: candidatesData } = await supabase
      .from("candidates")
      .select(`
        *,
        compatibility_matches (
          id,
          score,
          created_at
        )
      `)
      .eq("manager_id", user.id)
      .order("created_at", { ascending: false })

    candidates = candidatesData || []
  }

  // Track completion of all onboarding steps
  const hasCandidates = candidates.length > 0
  const hasGeneratedReports = candidates.some(
    candidate => candidate.compatibility_matches && candidate.compatibility_matches.length > 0
  )

  // Determine if Next Steps should be shown
  const showNextSteps = !hasCompletedProfile || 
                      (profile.role === "manager" && (!hasCandidates || !hasGeneratedReports))

  return (
    <div className={`min-h-screen bg-background ${display.variable} ${ui.variable}`}>
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary">
            <span className="text-xl font-semibold">HireMeMaybe</span>
          </div>
          <form action="/auth/sign-out" method="post">
            <Button variant="ghost" size="sm" type="submit">
              Sign Out
            </Button>
          </form>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome to your Cosmic Board</h1>
          </div>

          {profile.role === "manager" && hasCompletedProfile && (
            <section className="starfield vignette border border-border rounded-xl p-6 md:p-10 mb-8">
              <div className="grid md:grid-cols-2 gap-10 items-center min-h-[50vh] md:min-h-[60vh]">
                <div>
                  <h2 className="text-4xl md:text-5xl font-display leading-[1.15]">Draw Your Tarot Card</h2>
                  <p className="mt-3 text-muted-foreground">
                    Let the cards choose your next hire — or reveal whether your soul and your company’s chart are cosmically aligned.
                  </p>
                  <div className="hr-star mt-8 w-40" />
                  <div className="flex gap-3 mt-6 flex-wrap">
                    <Button asChild size="lg">
                      <Link href="/candidates/add">Candidate Reading</Link>
                    </Button>
                    <form
                      action={async () => {
                        "use server"
                        const res = await startCompanyTarotFromDashboard()
                        if (res?.redirectTo) {
                          return redirect(res.redirectTo)
                        }
                      }}
                    >
                      <Button type="submit" size="lg" variant="outline" className="border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)]">Company Reading</Button>
                    </form>
                  </div>
                </div>
                <div className="relative halo-white sparkles">
                  <div className="relative z-10 edge-glow rounded-xl overflow-hidden transform-gpu will-change-transform mx-auto w-72 md:w-80 lg:w-96 aspect-[3/4] bg-[url('/tarot-card-back.jpg')] bg-cover bg-center" />
                  <div className="absolute -left-6 top-6 opacity-30 edge-glow rounded-xl w-40 md:w-48 aspect-[3/4] bg-card -z-10" />
                  <div className="absolute -right-6 -bottom-6 opacity-20 edge-glow rounded-xl w-36 md:w-44 aspect-[3/4] bg-card -z-10" />
                </div>
              </div>
            </section>
          )}

          {!hasCompletedProfile && (
            <Card className="mb-6 border bg-card">
              <CardContent className="pt-6">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">Complete Your Profile</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add your birth data to unlock cosmic compatibility analysis and personalized insights.
                  </p>
                  <Button asChild variant="outline">
                    <Link href="/birth-data">Complete Profile Now</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {profile.role === "manager" && hasCompletedProfile && (
            <Card className="mb-6" id="candidates">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>
                      {candidates.length === 0 ? "Add Your First Candidate" : "Your Candidates"}
                    </CardTitle>
                    <CardDescription>
                      {candidates.length === 0
                        ? "Start building your team by adding candidate birth data for compatibility analysis"
                        : "View and manage compatibility reports for your candidates"}
                    </CardDescription>
                  </div>
                  <Button asChild>
                    <Link href="/candidates/add">Add Candidate</Link>
                  </Button>
                </div>
              </CardHeader>
              {candidates.length > 0 && (
                <CardContent>
                  <CandidatesList candidates={candidates} managerId={user.id} />
                </CardContent>
              )}
            </Card>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle>Account Details</CardTitle>
                    <CardDescription>Your profile information</CardDescription>
                  </div>
                  <span className="inline-flex items-center gap-2 text-sm px-2 py-1 rounded-md bg-muted capitalize">
                    {profile.role === "manager" ? "💼" : "👥"} {profile.role}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">User ID</p>
                    <p className="text-sm text-muted-foreground font-mono text-xs">{user.id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Profile Status</p>
                    <div className="flex items-center gap-2 mt-1">
                      {hasCompletedProfile ? (
                        <>
                          <span>✅</span>
                          <span className="text-sm text-foreground">Complete</span>
                        </>
                      ) : (
                        <>
                          <span>⚠️</span>
                          <span className="text-sm text-muted-foreground">Incomplete</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                {hasCompletedProfile && (
                  <div className="flex gap-2 mt-4 flex-wrap">
                    <Button asChild variant="outline" className="flex-1 bg-transparent min-w-[140px]">
                      <Link href="/birth-data">Edit Profile</Link>
                    </Button>
                    {profile.role === "manager" && (
                      <Button asChild variant="outline" className="flex-1 bg-transparent min-w-[160px]">
                        <Link href="/company/setup">🏢 Company Profile</Link>
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {showNextSteps && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
                <CardDescription>Complete your profile to start using cosmic compatibility analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      {hasCompletedProfile ? (
                        <span className="text-sm">✅</span>
                      ) : (
                        <span className="text-xs font-semibold text-primary">1</span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">Add Your Birth Data</p>
                      <p className="text-sm text-muted-foreground">
                        Enter your birth date, time, and location for accurate BaZi analysis
                      </p>
                    </div>
                  </div>
                  {profile.role === "manager" && (
                    <div className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        {hasCandidates ? (
                          <span className="text-sm">✅</span>
                        ) : (
                          <span className="text-xs font-semibold text-primary">2</span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">Add Candidate Information</p>
                        <p className="text-sm text-muted-foreground">
                          Input candidate birth data to generate compatibility scores
                        </p>
                      </div>
                    </div>
                  )}
                  {profile.role === "manager" && (
                    <div className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        {hasGeneratedReports ? (
                          <span className="text-sm">✅</span>
                        ) : (
                          <span className="text-xs font-semibold text-primary">3</span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">View Compatibility Insights</p>
                        <p className="text-sm text-muted-foreground">
                          Get AI-powered compatibility scores, charts, and recommendations
                        </p>
                      </div>
                    </div>
                  )}
                  {profile.role === "candidate" && (
                    <div className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-semibold text-primary">2</span>
                      </div>
                      <div>
                        <p className="font-medium">Connect with Managers</p>
                        <p className="text-sm text-muted-foreground">
                          Share your profile with potential managers for compatibility analysis
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
