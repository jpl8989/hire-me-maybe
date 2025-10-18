"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function saveBirthData(formData: FormData) {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: "Not authenticated" }
  }

  // Get user's role from profiles
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (!profile) {
    return { error: "Profile not found" }
  }

  const birthData = {
    user_id: user.id,
    name: formData.get("name") as string,
    role: profile.role,
    dob: formData.get("dob") as string,
    birth_time: formData.get("birth_time") as string,
    birth_city: formData.get("birth_city") as string,
    timezone: formData.get("timezone") as string,
    company_name: (formData.get("company_name") as string) || null,
    company_founding_date: (formData.get("company_founding_date") as string) || null,
    company_city: (formData.get("company_city") as string) || null,
  }

  const { data: existingData } = await supabase.from("birth_data").select("id").eq("user_id", user.id).maybeSingle()

  if (existingData) {
    // Update existing record
    const { error } = await supabase.from("birth_data").update(birthData).eq("user_id", user.id)

    if (error) {
      console.error("[v0] Error updating birth data:", error)
      return { error: error.message }
    }
  } else {
    // Insert new record
    const { error } = await supabase.from("birth_data").insert(birthData)

    if (error) {
      console.error("[v0] Error saving birth data:", error)
      return { error: error.message }
    }
  }

  redirect("/dashboard")
}
