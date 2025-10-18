import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { TarotCardSelection } from "./tarot-card-selection"

export default async function TarotPage({ params }: { params: { matchId: string } }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Verify the match belongs to this manager
  const { data: match } = await supabase
    .from("compatibility_matches")
    .select("*, candidates(*)")
    .eq("id", params.matchId)
    .eq("manager_id", user.id)
    .maybeSingle()

  if (!match) {
    notFound()
  }

  return (
    <TarotCardSelection
      matchId={params.matchId}
      candidateName={match.candidates.name}
      candidateId={match.candidates.id}
    />
  )
}
