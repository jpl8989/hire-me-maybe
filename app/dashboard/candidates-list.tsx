"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { generateCompatibilityReport } from "./actions"
import { useRouter } from "next/navigation"

interface Candidate {
  id: string
  name: string
  dob: string
  birth_time: string
  birth_city: string
  timezone: string
  created_at: string
  compatibility_matches: Array<{
    id: string
    score: number
    created_at: string
  }>
}

interface CandidatesListProps {
  candidates: Candidate[]
  managerId: string
}

export function CandidatesList({ candidates, managerId }: CandidatesListProps) {
  const router = useRouter()
  const [generatingReportFor, setGeneratingReportFor] = useState<string | null>(null)

  const handleGenerateReport = async (candidateId: string) => {
    setGeneratingReportFor(candidateId)
    try {
      const result = await generateCompatibilityReport(managerId, candidateId)
      if (result.success && result.matchId) {
        router.push(`/compatibility/${candidateId}`)
      } else {
        alert(result.error || "Failed to generate report")
      }
    } catch (error) {
      alert("Failed to generate report. Please try again.")
    } finally {
      setGeneratingReportFor(null)
    }
  }

  return (
    <div className="space-y-4">
      {candidates.map((candidate) => {
        const hasReport = candidate.compatibility_matches && candidate.compatibility_matches.length > 0
        const latestReport = hasReport ? candidate.compatibility_matches[0] : null

        return (
          <div
            key={candidate.id}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-semibold text-lg">{candidate.name}</h3>
                {hasReport && latestReport && (
                  <Badge
                    variant={latestReport.score >= 70 ? "default" : latestReport.score >= 50 ? "secondary" : "outline"}
                  >
                    📈 {latestReport.score}% Match
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <span>📅</span>
                  <span>{new Date(candidate.dob).toLocaleDateString('en-US')}</span>
                  <span className="ml-1">at {candidate.birth_time}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>📍</span>
                  <span>{candidate.birth_city}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {hasReport && latestReport ? (
                <Button asChild variant="default">
                  <Link href={`/compatibility/${candidate.id}`}>✨ View Report</Link>
                </Button>
              ) : (
                <Button
                  onClick={() => handleGenerateReport(candidate.id)}
                  disabled={generatingReportFor === candidate.id}
                  variant="outline"
                >
                  ✨ {generatingReportFor === candidate.id ? "Generating..." : "Generate Report"}
                </Button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
