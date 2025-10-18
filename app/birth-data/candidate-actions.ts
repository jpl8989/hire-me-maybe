"use server"

import { createClient } from "@/lib/supabase/server"
import { calculateCompatibility } from "@/lib/compatibility/calculate"

export async function saveCandidate(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  const candidateData = {
    manager_id: user.id,
    name: formData.get("candidate_name") as string,
    dob: formData.get("candidate_dob") as string,
    birth_time: formData.get("candidate_birth_time") as string,
    birth_city: formData.get("candidate_birth_city") as string,
    timezone: formData.get("candidate_timezone") as string,
  }

  const { data: candidate, error: candidateError } = await supabase
    .from("candidates")
    .insert(candidateData)
    .select()
    .single()

  if (candidateError) {
    console.error("Error saving candidate:", candidateError)
    return { error: "Failed to save candidate data. Please try again." }
  }

  const { data: managerBirthData } = await supabase.from("birth_data").select("*").eq("user_id", user.id).maybeSingle()

  if (!managerBirthData) {
    return { error: "Please complete your profile first before adding candidates." }
  }

  const compatibilityResult = await calculateCompatibility(user.id, candidate.id)

  if (!compatibilityResult.success) {
    console.error("Error calculating compatibility:", compatibilityResult.error)
    return { error: compatibilityResult.error || "Failed to calculate compatibility" }
  }

  return { success: true, candidateId: candidate.id }
}
