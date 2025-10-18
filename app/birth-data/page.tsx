import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { BirthDataForm } from "./birth-data-form"

export default async function BirthDataPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user's profile to check role
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()

  if (!profile?.role) {
    redirect("/auth/select-role")
  }

  const { data: existingBirthData } = await supabase
    .from("birth_data")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle()

  if (existingBirthData) {
    redirect("/dashboard")
  }

  return <BirthDataForm role={profile.role} />
}
