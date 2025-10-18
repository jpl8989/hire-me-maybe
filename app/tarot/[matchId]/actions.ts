"use server"

import { createClient } from "@/lib/supabase/server"
import { TAROT_CARDS } from "@/lib/tarot/cards"

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

  // Generate AI interpretation using OpenAI
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
              "You are a mystical tarot reader who specializes in workplace compatibility and hiring decisions. Provide insightful, practical interpretations that blend tarot wisdom with professional guidance.",
          },
          {
            role: "user",
            content: `I've drawn the tarot card "${card.name}" (meaning: ${card.meaning}) in the context of a hiring decision. 

Here is the compatibility analysis between the manager and candidate:
- Overall compatibility score: ${match.score}%
- Summary: ${match.analysis.summary}
- Strengths: ${match.analysis.strengths.join(", ")}
- Challenges: ${match.analysis.challenges.join(", ")}

Please provide a tarot reading that:
1. Interprets what this card means for this specific hiring decision
2. Connects the card's energy to the compatibility dynamics
3. Offers guidance on how to proceed with this candidate
4. Keeps a mystical yet practical tone (3-4 paragraphs)`,
          },
        ],
        temperature: 0.8,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to generate interpretation")
    }

    const data = await response.json()
    const interpretation = data.choices[0].message.content

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

    return {
      success: true,
      reading: {
        id: reading.id,
        cardName: card.name,
        meaning: card.meaning,
        interpretation,
        image: card.image,
      },
    }
  } catch (error) {
    console.error("[v0] Error generating tarot reading:", error)
    return { success: false, error: "Failed to generate reading" }
  }
}
