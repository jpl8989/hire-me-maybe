import { createClient } from "@/lib/supabase/server"
import { generateReadingAudio } from "../../../voice-actions"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: { matchId: string; readingId: string } }
) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Get the company reading with match and company details
    const { data: reading, error: readingError } = await supabase
      .from("company_tarot_readings")
      .select(`
        *,
        company_compatibility_matches!inner (
          *,
          companies (*),
          manager_id
        )
      `)
      .eq("id", params.readingId)
      .eq("company_compatibility_matches.manager_id", user.id)
      .single()

    if (readingError || !reading) {
      return NextResponse.json({ error: "Reading not found" }, { status: 404 })
    }

    // Return cached audio if already generated
    if (reading.audio_data && reading.audio_mime_type) {
      return NextResponse.json({
        success: true,
        audioData: reading.audio_data,
        mimeType: reading.audio_mime_type,
        cached: true,
      })
    }

    // Generate audio if not exists
    const audioResult = await generateReadingAudio(
      reading.card_name,
      reading.meaning,
      reading.interpretation,
      reading.company_compatibility_matches.companies.name
    )

    if (audioResult.success && audioResult.audioData) {
      // Store audio in database
      try {
        await supabase
          .from("company_tarot_readings")
          .update({
            audio_data: audioResult.audioData,
            audio_mime_type: audioResult.mimeType || "audio/mpeg",
          })
          .eq("id", params.readingId)
      } catch (updateError) {
        console.error("[v0] Failed to persist company audio:", updateError)
      }

      return NextResponse.json({
        success: true,
        audioData: audioResult.audioData,
        mimeType: audioResult.mimeType,
        cached: false,
      })
    }

    console.error("[v0] Company audio generation failed:", audioResult.error)

    return NextResponse.json(
      {
        success: false,
        error: audioResult.error || "Failed to generate audio",
      },
      { status: 500 }
    )
  } catch (error) {
    console.error("[v0] Error fetching company audio:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    )
  }
}


