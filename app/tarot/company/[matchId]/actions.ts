"use server"

import { createClient } from "@/lib/supabase/server"
import * as fal from "@fal-ai/serverless-client"
import { TAROT_CARDS } from "@/lib/tarot/cards"
import { getPromptForCard } from "@/lib/tarot/prompts"

export async function generateCompanyTarotReading(matchId: string, cardName: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Not authenticated" }
  }

  // Verify the company match belongs to this manager
  const { data: match, error: matchError } = await supabase
    .from("company_compatibility_matches")
    .select("*, companies(*)")
    .eq("id", matchId)
    .eq("manager_id", user.id)
    .single()

  if (matchError || !match) {
    return { success: false, error: "Match not found" }
  }

  const card = TAROT_CARDS.find((c) => c.name === cardName)
  if (!card) {
    return { success: false, error: "Invalid card" }
  }

  try {
    const imagePromise: Promise<string | null> = (async () => {
      if (!process.env.FAL_API_KEY) return null
      try {
        fal.config({ credentials: process.env.FAL_API_KEY })
        const { prompt } = getPromptForCard(card.name)
        const model = process.env.FAL_MODEL_SLUG || "fal-ai/flux/schnell"
        const result = (await fal.run(model, {
          input: { prompt, width: 512, height: 768 },
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

    // Determine whether we have structured analysis available on the match
    const hasAnalysis = !!(
      typeof match.score === "number" &&
      (match as any).analysis &&
      (match as any).analysis.summary &&
      Array.isArray((match as any).analysis.strengths) &&
      Array.isArray((match as any).analysis.challenges)
    )

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
                  "You are a concise spirit guide addressing the hiring manager. Write 4–6 sentences total. Be direct, practical, and mystical but actionable. Tie advice to manager–company fit and organizational dynamics. No headings or lists.",
              },
              {
                role: "user",
                content: (
                  hasAnalysis
                    ? `For the company "${match.companies.name}", the card drawn is "${card.name}".\nMantra: "${card.mantra}". Essence: ${card.essence}. Keywords: ${card.upright}.\nCompatibility snapshot: score ${match.score}%. Summary: ${(match as any).analysis.summary}. Top strengths: ${(match as any).analysis.strengths.join(", ")}. Key challenges: ${(match as any).analysis.challenges.join(", ")}.\nSpeak directly to me as the manager. Give a 4–6 sentence oracle reading that connects this card to our culture, pace, and expectations, and ends with one clear next step.`
                    : `For the company "${match.companies.name}", the card drawn is "${card.name}".\nMantra: "${card.mantra}". Essence: ${card.essence}. Keywords: ${card.upright}.\nNo analysis data is available. Speak directly to me as the manager. Give a 4–6 sentence oracle reading that connects this card to our culture, pace, and expectations, and ends with one clear next step.`
                ),
              },
            ],
            temperature: 0.7,
          }),
        })
        if (response.ok) {
          const data = await response.json()
          interpretation = data.choices?.[0]?.message?.content
        }
      } catch {}
    }

    if (!interpretation) {
      const strengths = hasAnalysis ? ` strengths (${(match as any).analysis.strengths.join(", ")})` : " your best instincts"
      const challenges = hasAnalysis ? ` and watch for ${(match as any).analysis.challenges.join(", ")}` : " and watch for potential misalignments"
      interpretation = `${card.name} highlights ${card.essence.toLowerCase()} in how you and ${match.companies.name} operate. ${card.meaning} Make the most of${strengths}${challenges}. Honor the mantra: "${card.mantra}" as you align expectations and pace.`
    }

    // Save tarot reading (reusing table)
    const { data: reading, error: saveError } = await supabase
      .from("company_tarot_readings")
      .insert({
        match_id: matchId,
        card_name: card.name,
        meaning: card.meaning,
        interpretation,
      })
      .select()
      .single()

    if (saveError) {
      return { success: false, error: "Failed to save reading" }
    }

    // Skip server-side background audio generation for companies; the reading page will handle it on demand.

    const generatedImageUrl = await imagePromise
    const imageUrl = generatedImageUrl || TAROT_CARDS.find(c => c.name === card.name)?.image

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
  } catch (e) {
    return { success: false, error: "Failed to generate reading" }
  }
}


