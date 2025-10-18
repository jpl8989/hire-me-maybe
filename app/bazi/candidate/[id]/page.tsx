import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { calculateBaZi } from "@/lib/bazi/calculator"
import { BaziReadingDisplay } from "@/components/bazi/bazi-reading-display"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function CandidateBaziPage({ params }: { params: { id: string } }) {
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

  // Calculate Bazi
  const baziData = calculateBaZi(
    candidate.name,
    candidate.dob,
    candidate.birth_time,
    candidate.birth_city,
    candidate.timezone
  )

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#a8b88f] to-[#d4d4a8] p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard">
            <span className="mr-2">←</span>
            Back to Dashboard
          </Link>
        </Button>

        <BaziReadingDisplay
          baziData={baziData}
          personName={candidate.name}
          birthInfo={{
            dob: candidate.dob,
            birth_time: candidate.birth_time,
            birth_city: candidate.birth_city
          }}
        />
      </div>
    </div>
  )
}
