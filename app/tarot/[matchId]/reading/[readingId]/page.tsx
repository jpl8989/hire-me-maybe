import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { TarotReadingResult } from "./tarot-reading-result"

export default async function TarotReadingPage({
  params,
  searchParams,
}: {
  params: { matchId: string; readingId: string }
  searchParams?: { img?: string }
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get the tarot reading
  const { data: reading } = await supabase
    .from("tarot_readings")
    .select("*, compatibility_matches(*, candidates(*))")
    .eq("id", params.readingId)
    .eq("match_id", params.matchId)
    .maybeSingle()

  if (!reading || reading.compatibility_matches.manager_id !== user.id) {
    notFound()
  }

  return (
    <TarotReadingResult
      reading={{
        id: reading.id,
        cardName: reading.card_name,
        meaning: reading.meaning,
        interpretation: reading.interpretation,
        image: searchParams?.img ? decodeURIComponent(searchParams.img) : undefined,
      }}
      candidateName={reading.compatibility_matches.candidates.name}
      matchId={params.matchId}
      candidateId={reading.compatibility_matches.candidates.id}
    />
  )
}
