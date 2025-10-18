"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { saveCompany, startCompanyTarotFlow } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LocationAutocomplete } from "@/components/location-autocomplete"

type Company = {
  name: string
  domain: string | null
  founding_date: string | null
  founding_time: string | null
  founding_city: string | null
  timezone: string | null
}

export function CompanyForm({ company }: { company: Company | null }) {
  const router = useRouter()
  const [timezone, setTimezone] = useState(company?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComputing, setIsComputing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(formData: FormData) {
    setIsSubmitting(true)
    setError(null)
    const res = await saveCompany(formData)
    if (res?.error) {
      setError(res.error)
      setIsSubmitting(false)
    }
  }

  async function onCompute() {
    setIsComputing(true)
    setError(null)
    try {
      // Auto-save first using current form values without redirect
      const formEl = document.querySelector('form') as HTMLFormElement | null
      if (formEl) {
        const fd = new FormData(formEl)
        fd.set('prevent_redirect', '1')
        const saveRes = await saveCompany(fd)
        if (saveRes?.error) {
          setError(saveRes.error)
          setIsComputing(false)
          return
        }
      }

      const res = await startCompanyTarotFlow()
      if (res?.success) {
        if (res.matchId) {
          router.push(`/tarot/company/${res.matchId}`)
        }
      } else if (res?.error) {
        setError(res.error)
      }
    } finally {
      setIsComputing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <div className="p-3 bg-emerald-100 rounded-full text-3xl">🏢</div>
          </div>
          <CardTitle className="text-2xl">Your Company</CardTitle>
          <CardDescription>Set up or update your company information</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={onSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Company Name *</Label>
                <Input id="name" name="name" type="text" required defaultValue={company?.name || ""} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="domain">Company Domain</Label>
                <Input id="domain" name="domain" type="text" placeholder="acme.com" defaultValue={company?.domain || ""} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="founding_date">Founding Date</Label>
                  <Input id="founding_date" name="founding_date" type="date" defaultValue={company?.founding_date || ""} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="founding_time">Founding Time</Label>
                  <Input id="founding_time" name="founding_time" type="time" placeholder="HH:MM" defaultValue={company?.founding_time || ""} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <LocationAutocomplete
                  id="founding_city"
                  name="founding_city"
                  label="Founding City"
                  placeholder="Start typing a city..."
                  defaultValue={company?.founding_city || ""}
                  onTimezoneDetected={(tz) => setTimezone(tz)}
                />

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input
                    id="timezone"
                    name="timezone"
                    type="text"
                    placeholder="e.g., America/New_York"
                    value={timezone || ""}
                    onChange={(e) => setTimezone(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
            )}

            <div className="flex gap-3">
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
              <Button type="button" variant="outline" className="flex-1 bg-transparent" onClick={onCompute} disabled={isComputing}>
                {isComputing ? "Computing..." : "Compute Compatibility"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}


