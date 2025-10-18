import { createClient } from "@/lib/supabase/server"
import { generateReadingAudio } from "../../../voice-actions"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: { readingId: string } }
) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Get the reading with match details
    const { data: reading, error: readingError } = await supabase
      .from("tarot_readings")
      .select(`
        *,
        compatibility_matches!inner (
          *,
          candidates (*),
          manager_id
        )
      `)
      .eq("id", params.readingId)
      .eq("compatibility_matches.manager_id", user.id)
      .single()

    if (readingError || !reading) {
      return NextResponse.json({ error: "Reading not found" }, { status: 404 })
    }

    // Check if audio already exists
    if (reading.audio_data && reading.audio_mime_type) {
      return NextResponse.json({
        success: true,
        audioData: reading.audio_data,
        mimeType: reading.audio_mime_type,
        cached: true
      })
    }

    // Generate audio if not exists
    const audioResult = await generateReadingAudio(
      reading.card_name,
      reading.meaning,
      reading.interpretation,
      reading.compatibility_matches.candidates.name
    )

    if (audioResult.success && audioResult.audioData) {
      // Store audio in database
      await supabase
        .from("tarot_readings")
        .update({
          audio_data: audioResult.audioData,
          audio_mime_type: audioResult.mimeType || 'audio/mpeg'
        })
        .eq("id", params.readingId)

      return NextResponse.json({
        success: true,
        audioData: audioResult.audioData,
        mimeType: audioResult.mimeType,
        cached: false
      })
    }

    return NextResponse.json({
      success: false,
      error: audioResult.error || "Failed to generate audio"
    }, { status: 500 })

  } catch (error) {
    console.error("[v0] Error fetching audio:", error)
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 })
  }
}
