"use server"

import { createClient } from "@/lib/supabase/server"

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

  // Ensure manager has a profile; we don't block on compatibility generation here
  const { data: managerBirthData } = await supabase.from("birth_data").select("id").eq("user_id", user.id).maybeSingle()
  if (!managerBirthData) {
    return { error: "Please complete your profile first before adding candidates." }
  }

  // Instant path: return the new candidate ID; the prepare page will create the match
  // and kick off compatibility analysis in the background for fast navigation.
  return { success: true, candidateId: candidate.id }
}
