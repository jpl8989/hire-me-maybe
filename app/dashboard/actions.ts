"use server"

import { createClient } from "@/lib/supabase/server"
import { calculateCompatibility } from "@/lib/compatibility/calculate"

export async function generateCompatibilityReport(managerId: string, candidateId: string) {
  try {
    const supabase = await createClient()

    // Check if report already exists
    const { data: existingMatch } = await supabase
      .from("compatibility_matches")
      .select("id")
      .eq("manager_id", managerId)
      .eq("candidate_id", candidateId)
      .maybeSingle()

    if (existingMatch) {
      return { success: true, matchId: existingMatch.id }
    }

    // Generate new compatibility report
    const result = await calculateCompatibility(managerId, candidateId)

    if (!result.success) {
      return { success: false, error: result.error }
    }

    return { success: true, matchId: result.matchId }
  } catch (error) {
    console.error("[v0] Error generating compatibility report:", error)
    return { success: false, error: "Failed to generate compatibility report" }
  }
}
