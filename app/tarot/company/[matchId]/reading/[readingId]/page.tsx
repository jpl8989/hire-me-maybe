import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { TarotReadingResult } from "../../../../[matchId]/reading/[readingId]/tarot-reading-result"

export default async function CompanyTarotReadingPage({
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

  const { data: reading } = await supabase
    .from("company_tarot_readings")
    .select("*, company_compatibility_matches(*, companies(*))")
    .eq("id", params.readingId)
    .eq("match_id", params.matchId)
    .maybeSingle()

  if (!reading || reading.company_compatibility_matches.manager_id !== user.id) {
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
      candidateName={reading.company_compatibility_matches.companies.name}
      matchId={params.matchId}
      candidateId={reading.company_compatibility_matches.companies.id}
      isCompany={true}
    />
  )
}


