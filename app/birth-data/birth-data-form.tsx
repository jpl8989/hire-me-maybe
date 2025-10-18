"use client"

import { useState } from "react"
import { saveBirthData } from "./actions"
import { saveCandidate } from "./candidate-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LocationAutocomplete } from "@/components/location-autocomplete"
import { useRouter } from "next/navigation"

interface BirthDataFormProps {
  role: string
}

export function BirthDataForm({ role }: BirthDataFormProps) {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [birthTimezone, setBirthTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone)
  const [candidateTimezone, setCandidateTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone)
  const router = useRouter()

  const isManager = role === "manager"
  const totalSteps = isManager ? 2 : 1

  async function handleManagerDataSubmit(formData: FormData) {
    setIsSubmitting(true)
    setError(null)

    const result = await saveBirthData(formData)

    if (result?.error) {
      setError(result.error)
      setIsSubmitting(false)
    } else {
      setStep(2)
      setIsSubmitting(false)
    }
  }

  async function handleCandidateDataSubmit(formData: FormData) {
    setIsSubmitting(true)
    setError(null)

    const result = await saveCandidate(formData)

    if (result?.error) {
      setError(result.error)
      setIsSubmitting(false)
    }
    // If successful, the server action will redirect to dashboard
  }

  function handleSkipCandidate() {
    router.push("/dashboard")
  }

  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-center mb-2">
              <div className="p-3 bg-indigo-100 rounded-full text-3xl">✨</div>
            </div>
            <CardTitle className="text-2xl">Your Cosmic Profile</CardTitle>
            <CardDescription>
              {isManager ? `Step ${step} of ${totalSteps}: ` : ""}Enter your birth details to unlock personalized
              compatibility insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleManagerDataSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Personal Information</h3>

                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input id="name" name="name" type="text" required placeholder="Enter your full name" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth *</Label>
                    <Input id="dob" name="dob" type="date" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="birth_time">Birth Time *</Label>
                    <Input id="birth_time" name="birth_time" type="time" required placeholder="HH:MM" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <LocationAutocomplete
                    id="birth_city"
                    name="birth_city"
                    label="Birth City"
                    required
                    placeholder="Start typing a city..."
                    onTimezoneDetected={(tz) => setBirthTimezone(tz)}
                  />

                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone *</Label>
                    <Input
                      id="timezone"
                      name="timezone"
                      type="text"
                      required
                      placeholder="e.g., America/New_York"
                      value={birthTimezone}
                      onChange={(e) => setBirthTimezone(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Company Information (only for managers) */}
              {isManager && (
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-semibold text-lg">Company Information (Optional)</h3>

                  <div className="space-y-2">
                    <Label htmlFor="company_name">Company Name</Label>
                    <Input id="company_name" name="company_name" type="text" placeholder="Enter company name" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company_founding_date">Founding Date</Label>
                      <Input id="company_founding_date" name="company_founding_date" type="date" />
                    </div>

                    <LocationAutocomplete
                      id="company_city"
                      name="company_city"
                      label="Office Location"
                      placeholder="Start typing an address..."
                      addressType="address"
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
              )}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Next"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <div className="p-3 bg-purple-100 rounded-full text-3xl">👤</div>
          </div>
          <CardTitle className="text-2xl">Add Your First Candidate</CardTitle>
          <CardDescription>
            Step {step} of {totalSteps}: Enter candidate birth details for compatibility analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleCandidateDataSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Candidate Information</h3>

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

            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1 bg-transparent" onClick={handleSkipCandidate}>
                Skip for Now
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Complete"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
