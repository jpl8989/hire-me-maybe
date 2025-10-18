import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { CompatibilityResults } from "./compatibility-results"

export default async function CompatibilityPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get candidate data
  const { data: candidate } = await supabase
    .from("candidates")
    .select("*")
    .eq("id", params.id)
    .eq("manager_id", user.id)
    .maybeSingle()

  if (!candidate) {
    notFound()
  }

  // Get compatibility match
  const { data: match } = await supabase
    .from("compatibility_matches")
    .select("*")
    .eq("candidate_id", params.id)
    .eq("manager_id", user.id)
    .maybeSingle()

  if (!match) {
    notFound()
  }

  // Get manager data
  const { data: managerData } = await supabase.from("birth_data").select("*").eq("user_id", user.id).maybeSingle()

  return (
    <CompatibilityResults
      candidate={{ ...candidate, id: candidate.id }}
      match={{ ...match, id: match.id }}
      managerName={managerData?.name || "Manager"}
    />
  )
}
