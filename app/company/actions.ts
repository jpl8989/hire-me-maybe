"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { calculateCompanyCompatibility } from "@/lib/compatibility/calculate-company"

export async function getMyCompany() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  const { data: company, error } = await supabase
    .from("companies")
    .select("*")
    .eq("manager_id", user.id)
    .maybeSingle()

  if (error) {
    return { error: error.message }
  }

  return { company }
}

export async function saveCompany(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  // Read fields from form
  const name = (formData.get("name") as string) || ""
  const domain = ((formData.get("domain") as string) || null) as string | null
  const founding_date = ((formData.get("founding_date") as string) || null) as string | null
  const founding_time = ((formData.get("founding_time") as string) || null) as string | null
  const founding_city = ((formData.get("founding_city") as string) || null) as string | null
  const timezone = ((formData.get("timezone") as string) || null) as string | null

  if (!name) {
    return { error: "Company name is required" }
  }

  const { data: existing } = await supabase
    .from("companies")
    .select("id")
    .eq("manager_id", user.id)
    .maybeSingle()

  if (existing?.id) {
    const { error } = await supabase
      .from("companies")
      .update({
        name,
        domain,
        founding_date,
        founding_time,
        founding_city,
        timezone,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)

    if (error) {
      return { error: error.message }
    }
  } else {
    const { error } = await supabase.from("companies").insert({
      manager_id: user.id,
      name,
      domain,
      founding_date,
      founding_time,
      founding_city,
      timezone,
    })

    if (error) {
      return { error: error.message }
    }
  }

  const preventRedirect = (formData.get("prevent_redirect") as string) === "1"
  if (!preventRedirect) {
    redirect("/company/setup")
  }
  return { success: true }
}

export async function computeCompanyCompatibility() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Not authenticated" }
  }

  const result = await calculateCompanyCompatibility(user.id)
  return result
}

// Fast path: ensure a match row exists, kick off compute in the background, and return matchId immediately
export async function startCompanyTarotFlow() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Not authenticated" }
  }

  // Ensure company exists
  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("id")
    .eq("manager_id", user.id)
    .single()

  if (companyError || !company) {
    return { success: false, error: "Company not found" }
  }

  // Get or create a placeholder match row
  const { data: existing } = await supabase
    .from("company_compatibility_matches")
    .select("id")
    .eq("manager_id", user.id)
    .eq("company_id", company.id)
    .maybeSingle()

  let matchId = existing?.id as string | undefined

  if (!matchId) {
    const { data: inserted, error: insertError } = await supabase
      .from("company_compatibility_matches")
      .insert({ manager_id: user.id, company_id: company.id })
      .select("id")
      .single()

    if (insertError || !inserted) {
      return { success: false, error: "Failed to start tarot flow" }
    }
    matchId = inserted.id
  }

  // Fire-and-forget compute to update the row
  calculateCompanyCompatibility(user.id).catch(() => {})

  return { success: true, matchId }
}


