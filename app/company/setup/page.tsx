import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getMyCompany } from "../actions"
import { CompanyForm } from "../company-form"

export default async function CompanySetupPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Ensure manager role
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "manager") {
    redirect("/dashboard")
  }

  const { company } = await getMyCompany()

  // If no company exists yet, prefill from the original birth_data form (manager-only fields)
  let prefilledCompany = company || null

  if (!prefilledCompany) {
    const { data: birthData } = await supabase
      .from("birth_data")
      .select("company_name, company_founding_date, company_city, company_timezone")
      .eq("user_id", user.id)
      .maybeSingle()

    if (birthData?.company_name || birthData?.company_founding_date || birthData?.company_city) {
      prefilledCompany = {
        name: birthData.company_name || "",
        domain: null,
        founding_date: (birthData.company_founding_date as unknown as string) || "",
        founding_time: "",
        founding_city: birthData.company_city || "",
        timezone: (birthData.company_timezone as unknown as string) || "",
      }
    }
  }

  return <CompanyForm company={prefilledCompany} />
}


