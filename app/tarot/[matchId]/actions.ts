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
          }
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
    const hasAnalysis = !!(
      typeof match.score === "number" &&
      (match as any).analysis &&
      (match as any).analysis.summary &&
      Array.isArray((match as any).analysis.strengths) &&
      Array.isArray((match as any).analysis.challenges)
    )

    if (process.env.OPENAI_API_KEY) {
      try {
        const messages = [
          {
            role: "system",
            content:
              "You are a mystical spirit guide focused on workplace compatibility and hiring decisions. Always speak directly to the manager using 'you'. Refer to the candidate by their first name. Keep it concise (4–6 sentences, ~120 words). No headings or bullet points. Blend spiritual wisdom with practical, actionable guidance.",
          },
          {
            role: "user",
            content: (
              hasAnalysis
                ? `I've drawn the spirit oracle card "${card.name}" in the context of a hiring decision.\n\nContext:\n- Manager: you\n- Candidate: ${match.candidates.name}\n\nCard Details:\n- Mantra: "${card.mantra}"\n- Essence: ${card.essence}\n- Full Meaning: ${card.meaning}\n- Keywords: ${card.upright}\n- Affirmation: "${card.affirmation}"\n\nCompatibility Analysis:\n- Overall score: ${match.score}%\n- Summary: ${(match as any).analysis.summary}\n- Strengths: ${(match as any).analysis.strengths.join(", ")}\n- Challenges: ${(match as any).analysis.challenges.join(", ")}\n\nInstructions for the reading:\n- Speak directly to the manager using "you" (not third-person).\n- Refer to the candidate as "${match.candidates.name}".\n- Be concise: 4–6 sentences (~120 words), no bullets or headings.\n- Connect the card's energy to this specific hiring decision and the compatibility dynamics.\n- Offer actionable guidance grounded in the card's message.`
                : `I've drawn the spirit oracle card "${card.name}" in the context of a hiring decision.\n\nContext:\n- Manager: you\n- Candidate: ${match.candidates.name}\n\nCard Details:\n- Mantra: "${card.mantra}"\n- Essence: ${card.essence}\n- Full Meaning: ${card.meaning}\n- Keywords: ${card.upright}\n- Affirmation: "${card.affirmation}"\n\nInstructions for the reading:\n- Speak directly to the manager using "you" (not third-person).\n- Refer to the candidate as "${match.candidates.name}".\n- Be concise: 4–6 sentences (~120 words), no bullets or headings.\n- Connect the card's energy to this specific hiring decision.\n- Offer actionable guidance grounded in the card's message.`
            ),
          },
        ]

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages,
            temperature: 0.8,
            max_tokens: 220,
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
      const strengths = hasAnalysis ? ` your strengths (${(match as any).analysis.strengths.join(", ")})` : " your best instincts"
      const challenges = hasAnalysis ? ` and watch for ${(match as any).analysis.challenges.join(", ")}` : " and watch for potential blind spots"
      interpretation = `${card.name} invites you to lean into ${card.essence.toLowerCase()}. ${card.meaning} With ${match.candidates.name}, make the most of${strengths}${challenges}. Focus on the keywords: ${card.upright}. Move forward in a way that honors the mantra: "${card.mantra}".`
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
