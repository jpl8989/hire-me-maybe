"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { saveCandidate } from "@/app/birth-data/candidate-actions"
// createMatchAndAnalyzeInBackground is now called on the prepare page for instant navigation
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LocationAutocomplete } from "@/components/location-autocomplete"
import Link from "next/link"

export function AddCandidateForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [candidateTimezone, setCandidateTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone)

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    setError(null)

    const result = await saveCandidate(formData)

    if (result?.error) {
      setError(result.error)
      setIsSubmitting(false)
      return
    }

    if (result?.success && result?.candidateId) {
      const name = formData.get("candidate_name") as string
      // Include a source flag so downstream pages can adjust back navigation
      router.push(`/tarot/prepare?candidateId=${result.candidateId}&candidateName=${encodeURIComponent(name)}&from=add`)
    }
  }

  return (
    <div className="min-h-screen oa-gradient starfield vignette flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white text-black edge-glow">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-serif">Add New Candidate</CardTitle>
          <CardDescription>Enter candidate birth details for compatibility analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="ghost" size="sm" className="mb-4">
            <Link href="/dashboard">
              <span className="mr-2">←</span>
              Back to Dashboard
            </Link>
          </Button>

          <form action={handleSubmit} className="space-y-6">
            <div className="space-y-4">

              <div className="space-y-2">
                <Label htmlFor="candidate_name">Candidate Name *</Label>
                <Input
                  id="candidate_name"
                  name="candidate_name"
                  type="text"
                  required
                  placeholder="Enter candidate's full name"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="candidate_dob">Date of Birth *</Label>
                  <Input id="candidate_dob" name="candidate_dob" type="date" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="candidate_birth_time">Birth Time *</Label>
                  <Input
                    id="candidate_birth_time"
                    name="candidate_birth_time"
                    type="time"
                    required
                    placeholder="HH:MM"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <LocationAutocomplete
                  id="candidate_birth_city"
                  name="candidate_birth_city"
                  label="Birth City"
                  required
                  placeholder="Start typing a city..."
                  onTimezoneDetected={(tz) => setCandidateTimezone(tz)}
                />

                <div className="space-y-2">
                  <Label htmlFor="candidate_timezone">Timezone *</Label>
                  <Input
                    id="candidate_timezone"
                    name="candidate_timezone"
                    type="text"
                    required
                    placeholder="e.g., America/New_York"
                    value={candidateTimezone}
                    onChange={(e) => setCandidateTimezone(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Starting Tarot..." : "Continue to Tarot"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
