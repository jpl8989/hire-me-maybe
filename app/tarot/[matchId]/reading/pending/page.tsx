import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { generateTarotReading } from "../../actions"
import { PendingReadingDisplay } from "./pending-reading-display"

export default async function PendingReadingPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ matchId: string }>
  searchParams: Promise<{ cardName: string }>
}) {
  const supabase = await createClient()
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams

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
    .eq("id", resolvedParams.matchId)
    .eq("manager_id", user.id)
    .maybeSingle()

  if (!match) {
    notFound()
  }

  if (!resolvedSearchParams.cardName) {
    redirect(`/tarot/${resolvedParams.matchId}`)
  }

  // Start the reading generation in the background
  const readingPromise = generateTarotReading(resolvedParams.matchId, resolvedSearchParams.cardName)

  return (
    <PendingReadingDisplay
      matchId={resolvedParams.matchId}
      candidateName={match.candidates.name}
      candidateId={match.candidates.id}
      cardName={resolvedSearchParams.cardName}
      readingPromise={readingPromise}
    />
  )
}
