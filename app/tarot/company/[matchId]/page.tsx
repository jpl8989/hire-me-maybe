import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { TarotCardSelection } from "./tarot-card-selection"

export default async function CompanyTarotPage({ params }: { params: { matchId: string } }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: match } = await supabase
    .from("company_compatibility_matches")
    .select("*, companies(*)")
    .eq("id", params.matchId)
    .eq("manager_id", user.id)
    .maybeSingle()

  if (!match) {
    notFound()
  }

  return (
    <TarotCardSelection
      matchId={params.matchId}
      candidateName={match.companies.name}
      candidateId={match.companies.id}
    />
  )
}


