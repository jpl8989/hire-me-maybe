import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CandidatesList } from "./candidates-list"

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
    <div className="min-h-screen bg-gradient-to-r from-[#a8b88f] to-[#d4d4a8]">
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
            <h1 className="text-3xl font-bold mb-2">Welcome to Your Dashboard</h1>
            <p className="text-muted-foreground">
              You&apos;re signed in as a <span className="font-semibold capitalize">{profile.role}</span>
            </p>
          </div>

          {!hasCompletedProfile && (
            <Card className="mb-6 border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
              <CardContent className="pt-6">
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">Complete Your Profile</h3>
                  <p className="text-sm text-amber-800 dark:text-amber-200 mb-4">
                    Add your birth data to unlock cosmic compatibility analysis and personalized insights.
                  </p>
                  <Button asChild>
                    <Link href="/birth-data">Complete Profile Now</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {profile.role === "manager" && hasCompletedProfile && (
            <Card className="mb-6">
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
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
                    {profile.role === "manager" ? "💼" : "👥"}
                  </div>
                  <div>
                    <CardTitle>Your Role</CardTitle>
                    <CardDescription className="capitalize">{profile.role}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {profile.role === "manager"
                    ? "As a manager, you can evaluate candidates and build compatible teams based on cosmic insights."
                    : "As a candidate, you can discover your compatibility with potential managers and teams."}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Details</CardTitle>
                <CardDescription>Your profile information</CardDescription>
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
                          <span className="text-sm text-green-600">Complete</span>
                        </>
                      ) : (
                        <>
                          <span>⚠️</span>
                          <span className="text-sm text-amber-600">Incomplete</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                {hasCompletedProfile && (
                  <div className="flex gap-2 mt-4">
                    <Button asChild variant="outline" className="flex-1 bg-transparent">
                      <Link href="/birth-data">Edit Profile</Link>
                    </Button>
                    <Button asChild variant="outline" className="flex-1 bg-transparent">
                      <Link href="/bazi/me">🔮 View My Bazi</Link>
                    </Button>
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
