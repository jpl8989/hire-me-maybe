"use server"

import { createClient } from "@/lib/supabase/server"
import { calculateCompatibility } from "@/lib/compatibility/calculate"
import { calculateCompanyCompatibility } from "@/lib/compatibility/calculate-company"

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

export async function createMatchAndAnalyzeInBackground(candidateId: string) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    // Check if a match already exists
    const { data: existingMatch } = await supabase
      .from("compatibility_matches")
      .select("id")
      .eq("manager_id", user.id)
      .eq("candidate_id", candidateId)
      .maybeSingle()

    let matchId = existingMatch?.id as string | undefined

    if (!matchId) {
      // Create a pending match row with placeholder fields for strict schemas
      const { data: match, error: insertErr } = await supabase
        .from("compatibility_matches")
        .insert({
          manager_id: user.id,
          candidate_id: candidateId,
          score: 0,
          analysis: { status: "pending" },
        })
        .select("id")
        .single()

      if (insertErr || !match) {
        console.error("[v0] Error creating pending match:", insertErr)
        // Surface useful diagnostics to the client for faster debugging
        const reason = insertErr?.message || insertErr?.details || insertErr?.hint
        return { success: false, error: reason ? `Failed to create match: ${reason}` : "Failed to create match" }
      }

      matchId = match.id
    }

    // Fire and forget compatibility analysis; it will update or insert result
    calculateCompatibility(user.id, candidateId).catch((err) => {
      console.error("[v0] Background compatibility analysis failed:", err)
    })

    return { success: true, matchId }
  } catch (error) {
    console.error("[v0] Error creating match and analyzing in background:", error)
    return { success: false, error: "Failed to initialize tarot flow" }
  }
}

export async function startCompanyTarotFromDashboard() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Not authenticated" }
  }

  // Ensure a company exists for this manager
  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("manager_id", user.id)
    .maybeSingle()

  if (!company?.id) {
    return { success: true, redirectTo: "/company/setup" }
  }

  // Get or create a match row
  const { data: existing } = await supabase
    .from("company_compatibility_matches")
    .select("id")
    .eq("manager_id", user.id)
    .eq("company_id", company.id)
    .maybeSingle()

  let matchId = existing?.id as string | undefined
  if (!matchId) {
    const { data: inserted } = await supabase
      .from("company_compatibility_matches")
      .insert({ manager_id: user.id, company_id: company.id })
      .select("id")
      .single()
    matchId = inserted?.id
  }

  if (!matchId) {
    return { success: false, error: "Failed to initialize company tarot flow" }
  }

  // Background compute
  calculateCompanyCompatibility(user.id).catch(() => {})

  return { success: true, redirectTo: `/tarot/company/${matchId}` }
}
