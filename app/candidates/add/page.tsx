import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AddCandidateForm } from "./add-candidate-form"

export default async function AddCandidatePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()

  if (!profile?.role) {
    redirect("/auth/select-role")
  }

  if (profile.role !== "manager") {
    redirect("/dashboard")
  }

  return <AddCandidateForm />
}
