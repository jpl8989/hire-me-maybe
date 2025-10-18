"use server"

import { createClient } from "@/lib/supabase/server"
import { TAROT_CARDS } from "@/lib/tarot/cards"
import { generateReadingAudio } from "./voice-actions"
import * as fal from "@fal-ai/serverless-client"
import { getPromptForCard } from "@/lib/tarot/prompts"

export async function generateTarotReading(matchId: string, cardName: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Not authenticated" }
  }

  // Verify the match belongs to this manager
  const { data: match, error: matchError } = await supabase
    .from("compatibility_matches")
    .select("*, candidates(*)")
    .eq("id", matchId)
    .eq("manager_id", user.id)
    .single()

  if (matchError || !match) {
    return { success: false, error: "Match not found" }
  }

  // Find the selected card
  const card = TAROT_CARDS.find((c) => c.name === cardName)
  if (!card) {
    return { success: false, error: "Invalid card" }
  }

  // Generate AI interpretation and card image (in parallel); use deterministic text fallback and image fallback
  try {
    // Kick off image generation immediately (may be unavailable; we will fallback)
    const imagePromise: Promise<string | null> = (async () => {
      if (!process.env.FAL_API_KEY) return null
      try {
        fal.config({ credentials: process.env.FAL_API_KEY })
        const { prompt } = getPromptForCard(card.name)
        const model = process.env.FAL_MODEL_SLUG || "fal-ai/flux/schnell"
        const result = (await fal.run(model, {
          input: {
            prompt,
            width: 512,
            height: 768,
          },
          logs: true,
          timeout: 15000,
        })) as any
        if (result?.images?.[0]?.url) return result.images[0].url
        if (result?.image?.url) return result.image.url
        if (typeof result === "string") return result
        return null
      } catch {
        return null
      }
    })()

    // Generate AI interpretation if possible; otherwise fall back to a deterministic template
    let interpretation: string | undefined
    if (process.env.OPENAI_API_KEY) {
      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content:
                  "You are a mystical spirit guide who specializes in workplace compatibility and hiring decisions. You work with spirit oracle cards that offer wisdom and guidance. Provide insightful, practical interpretations that blend spiritual wisdom with professional guidance.",
              },
              {
                role: "user",
                content: `I've drawn the spirit oracle card "${card.name}" in the context of a hiring decision.\n\nCard Details:\n- Mantra: "${card.mantra}"\n- Essence: ${card.essence}\n- Full Meaning: ${card.meaning}\n- Keywords: ${card.upright}\n- Affirmation: "${card.affirmation}"\n\nCompatibility Analysis:\n- Overall score: ${match.score}%\n- Summary: ${match.analysis.summary}\n- Strengths: ${match.analysis.strengths.join(", " )}\n- Challenges: ${match.analysis.challenges.join(", " )}\n\nPlease provide a spirit oracle reading that:\n1. Interprets this card's energy for this specific hiring decision\n2. References the card's essence and keywords\n3. Connects the spiritual wisdom to the compatibility dynamics\n4. Offers practical guidance based on the card's message\n5. Maintains a mystical yet actionable tone (2-3 paragraphs)`,
              },
            ],
            temperature: 0.8,
          }),
        })
        if (response.ok) {
          const data = await response.json()
          interpretation = data.choices?.[0]?.message?.content
        }
      } catch {}
    }

    // Fallback interpretation if OpenAI is unavailable
    if (!interpretation) {
      interpretation = `${card.name} speaks of ${card.essence.toLowerCase()} in this decision. ${card.meaning} In practice, lean into the keywords: ${card.upright}. Consider both the strengths (${match.analysis.strengths.join(", ")}) and challenges (${match.analysis.challenges.join(", ")}) shown in your compatibility. Choose actions that honor the mantra: "${card.mantra}".`
    }

    // Save to database
    const { data: reading, error: saveError } = await supabase
      .from("tarot_readings")
      .insert({
        match_id: matchId,
        card_name: card.name,
        meaning: card.meaning,
        interpretation,
      })
      .select()
      .single()

    if (saveError) {
      console.error("[v0] Error saving tarot reading:", saveError)
      return { success: false, error: "Failed to save reading" }
    }

    // Start audio generation best-effort (does not block navigation)
    generateReadingAudio(
      card.name,
      card.meaning,
      interpretation,
      match.candidates.name
    ).then(async (audioResult) => {
      if (audioResult.success && audioResult.audioData) {
        await supabase
          .from("tarot_readings")
          .update({
            audio_data: audioResult.audioData,
            audio_mime_type: audioResult.mimeType || "audio/mpeg",
          })
          .eq("id", reading.id)
      }
    }).catch(() => {})

    // Resolve image (or fallback to curated static asset)
    const generatedImageUrl = await imagePromise
    const imageUrl = generatedImageUrl || card.image

    return {
      success: true,
      reading: {
        id: reading.id,
        cardName: card.name,
        meaning: card.meaning,
        interpretation,
        image: imageUrl,
      },
      imageUrl,
      audioGenerating: true,
    }
  } catch (error) {
    console.error("[v0] Error generating tarot reading:", error)
    return { success: false, error: "Failed to generate reading" }
  }
}
