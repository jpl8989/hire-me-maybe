import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { calculateBaZi } from "@/lib/bazi/calculator"
import { BaziReadingDisplay } from "@/components/bazi/bazi-reading-display"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function MyBaziPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get manager's birth data
  const { data: birthData } = await supabase
    .from("birth_data")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle()

  if (!birthData) {
    redirect("/birth-data")
  }

  // Calculate Bazi
  const baziData = calculateBaZi(
    birthData.name,
    birthData.dob,
    birthData.birth_time,
    birthData.birth_city,
    birthData.timezone
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
          personName={birthData.name}
          birthInfo={{
            dob: birthData.dob,
            birth_time: birthData.birth_time,
            birth_city: birthData.birth_city
          }}
        />
      </div>
    </div>
  )
}
