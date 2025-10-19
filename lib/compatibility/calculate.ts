"use server"

import { createClient } from "@/lib/supabase/server"
import { calculateBaZi } from "@/lib/bazi/calculator"

interface BirthData {
  name: string
  dob: string
  birth_time: string
  birth_city: string
  timezone: string
}

interface CompatibilityResult {
  score: number
  analysis: {
    overall_compatibility: string
    strengths: string[]
    challenges: string[]
    categories: {
      communication: number
      decision_style: number
      teamwork: number
      leadership_harmony: number
    }
    summary: string
    recommendations: {
      communication_style: {
        do: string[]
        dont: string[]
      }
      effective_work_approach: string[]
      motivators: string[]
      demotivators: string[]
      interview_focus: {
        areas: string[]
        suggested_questions: string[]
      }
    }
    yin_yang_balance: {
      manager: string
      candidate: string
      compatibility_note: string
    }
    five_elements: {
      manager_primary: string
      candidate_primary: string
      interaction: string
    }
    // New structured data for charts
    bazi_data: {
      manager: {
        yin_yang: {
          yin: number
          yang: number
          dominance: string
        }
        elements: {
          wood: number
          fire: number
          earth: number
          metal: number
          water: number
        }
        day_master: {
          element: string
          yin_yang: string
        }
      }
      candidate: {
        yin_yang: {
          yin: number
          yang: number
          dominance: string
        }
        elements: {
          wood: number
          fire: number
          earth: number
          metal: number
          water: number
        }
        day_master: {
          element: string
          yin_yang: string
        }
      }
    }
  }
}

export async function calculateCompatibility(
  managerId: string,
  candidateId: string,
): Promise<{ success: boolean; matchId?: string; error?: string }> {
  try {
    const supabase = await createClient()

    console.log("[v0] Fetching manager birth data for ID:", managerId)

    const { data: managerBirthData, error: managerBirthError } = await supabase
      .from("birth_data")
      .select("*")
      .eq("user_id", managerId)
      .single()

    if (managerBirthError || !managerBirthData) {
      console.error("[v0] Error fetching manager birth data:", managerBirthError)
      return { success: false, error: "Manager profile not found" }
    }

    console.log("[v0] Manager birth data found:", managerBirthData.name)

    const { data: candidateData, error: candidateError } = await supabase
      .from("candidates")
      .select("*")
      .eq("id", candidateId)
      .single()

    if (candidateError || !candidateData) {
      console.error("[v0] Error fetching candidate data:", candidateError)
      return { success: false, error: "Candidate data not found" }
    }

    console.log("[v0] Candidate data found:", candidateData.name)

    const managerData: BirthData = {
      name: managerBirthData.name,
      dob: managerBirthData.dob,
      birth_time: managerBirthData.birth_time,
      birth_city: managerBirthData.birth_city,
      timezone: managerBirthData.timezone,
    }

    const candidateBirthData: BirthData = {
      name: candidateData.name,
      dob: candidateData.dob,
      birth_time: candidateData.birth_time,
      birth_city: candidateData.birth_city,
      timezone: candidateData.timezone,
    }

    console.log("[v0] Calculating compatibility for:", managerData.name, "and", candidateBirthData.name)

    const result = await performCompatibilityAnalysis(managerData, candidateBirthData)

    console.log("[v0] Compatibility calculated, score:", result.score)

    // If a match already exists for this manager/candidate, update it; otherwise insert a new one
    const { data: existingMatch } = await supabase
      .from("compatibility_matches")
      .select("id")
      .eq("manager_id", managerId)
      .eq("candidate_id", candidateId)
      .maybeSingle()

    if (existingMatch?.id) {
      const { data: updated, error: updateError } = await supabase
        .from("compatibility_matches")
        .update({
          score: result.score,
          analysis: result.analysis,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingMatch.id)
        .select("id")
        .single()

      if (updateError) {
        console.error("[v0] Error updating compatibility match:", updateError)
        return { success: false, error: "Failed to save compatibility report" }
      }

      console.log("[v0] Compatibility match updated with ID:", updated.id)
      return { success: true, matchId: updated.id }
    } else {
      const { data: matchData, error: insertError } = await supabase
        .from("compatibility_matches")
        .insert({
          manager_id: managerId,
          candidate_id: candidateId,
          score: result.score,
          analysis: result.analysis,
        })
        .select("id")
        .single()

      if (insertError) {
        console.error("[v0] Error saving compatibility match:", insertError)
        return { success: false, error: "Failed to save compatibility report" }
      }

      console.log("[v0] Compatibility match saved with ID:", matchData.id)
      return { success: true, matchId: matchData.id }
    }
  } catch (error) {
    console.error("[v0] Error in calculateCompatibility:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

async function performCompatibilityAnalysis(
  managerData: BirthData,
  candidateData: BirthData,
): Promise<CompatibilityResult> {
  const geminiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
  const openaiKey = process.env.OPENAI_API_KEY

  // Calculate BaZi for both manager and candidate
  console.log("[v0] Calculating BaZi for manager:", managerData.name)
  const managerBaZi = calculateBaZi(
    managerData.name,
    managerData.dob,
    managerData.birth_time,
    managerData.birth_city,
    managerData.timezone
  )

  console.log("[v0] Calculating BaZi for candidate:", candidateData.name)
  const candidateBaZi = calculateBaZi(
    candidateData.name,
    candidateData.dob,
    candidateData.birth_time,
    candidateData.birth_city,
    candidateData.timezone
  )

  const prompt = `You are an expert in BaZi (Chinese astrology) and workplace compatibility analysis. 

Analyze the compatibility between a manager and a candidate based on their birth data and BaZi calculations:

Manager:
- Name: ${managerData.name}
- Date of Birth: ${managerData.dob}
- Birth Time: ${managerData.birth_time}
- Birth City: ${managerData.birth_city}
- Timezone: ${managerData.timezone}
- BaZi Analysis:
  - Yin-Yang: ${managerBaZi.yinYang.yinPercent}% Yin, ${managerBaZi.yinYang.yangPercent}% Yang (${managerBaZi.yinYang.dominance} dominant)
  - Day Master: ${managerBaZi.dayMaster.element} ${managerBaZi.dayMaster.yinYang}
  - Five Elements: Wood ${managerBaZi.elements.wood}%, Fire ${managerBaZi.elements.fire}%, Earth ${managerBaZi.elements.earth}%, Metal ${managerBaZi.elements.metal}%, Water ${managerBaZi.elements.water}%

Candidate:
- Name: ${candidateData.name}
- Date of Birth: ${candidateData.dob}
- Birth Time: ${candidateData.birth_time}
- Birth City: ${candidateData.birth_city}
- Timezone: ${candidateData.timezone}
- BaZi Analysis:
  - Yin-Yang: ${candidateBaZi.yinYang.yinPercent}% Yin, ${candidateBaZi.yinYang.yangPercent}% Yang (${candidateBaZi.yinYang.dominance} dominant)
  - Day Master: ${candidateBaZi.dayMaster.element} ${candidateBaZi.dayMaster.yinYang}
  - Five Elements: Wood ${candidateBaZi.elements.wood}%, Fire ${candidateBaZi.elements.fire}%, Earth ${candidateBaZi.elements.earth}%, Metal ${candidateBaZi.elements.metal}%, Water ${candidateBaZi.elements.water}%

Provide a comprehensive compatibility analysis including:

1. Overall compatibility score (0-100)
2. Four category ratings (0-100 each): Communication, Decision Style, Teamwork, Leadership Harmony
3. Key strengths in their working relationship (3-5 points)
4. Potential challenges to be aware of (3-5 points)
5. A narrative summary (2-3 paragraphs)
6. Yin-Yang balance analysis for both individuals
7. Five Elements analysis (Wood, Fire, Earth, Metal, Water)
8. Detailed recommendations for the manager including:
   - Best communication style (do's and don'ts)
   - Most effective ways to work with this person
   - Motivators and demotivators
   - Interview focus areas and suggested questions

Return your analysis in JSON format with this exact structure:
{
  "score": <overall score 0-100>,
  "overall_compatibility": "<detailed 2-3 paragraph description>",
  "categories": {
    "communication": <score 0-100>,
    "decision_style": <score 0-100>,
    "teamwork": <score 0-100>,
    "leadership_harmony": <score 0-100>
  },
  "strengths": ["<strength 1>", "<strength 2>", ...],
  "challenges": ["<challenge 1>", "<challenge 2>", ...],
  "summary": "<2-3 sentence executive summary>",
  "recommendations": {
    "communication_style": {
      "do": ["<do 1>", "<do 2>", "<do 3>"],
      "dont": ["<dont 1>", "<dont 2>", "<dont 3>"]
    },
    "effective_work_approach": ["<approach 1>", "<approach 2>", "<approach 3>"],
    "motivators": ["<motivator 1>", "<motivator 2>", "<motivator 3>"],
    "demotivators": ["<demotivator 1>", "<demotivator 2>", "<demotivator 3>"],
    "interview_focus": {
      "areas": ["<area 1>", "<area 2>", "<area 3>"],
      "suggested_questions": ["<question 1>", "<question 2>", "<question 3>"]
    }
  },
  "yin_yang_balance": {
    "manager": "<Yin or Yang dominant>",
    "candidate": "<Yin or Yang dominant>",
    "compatibility_note": "<brief note on how their energies interact>"
  },
  "five_elements": {
    "manager_primary": "<primary element>",
    "candidate_primary": "<primary element>",
    "interaction": "<how these elements interact in a work context>"
  }
}`

  try {
    let lastError: unknown

    if (geminiKey) {
      try {
        console.log("[v0] Calling Gemini Flash for compatibility analysis...")
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`
        const response = await fetch(geminiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: `${prompt}\n\nOnly output valid JSON with the exact fields and types specified.` }],
              },
            ],
            generationConfig: {
              temperature: 0.7,
            },
          }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error("[v0] Gemini API error:", response.status, errorText)
          throw new Error(`Gemini API error: ${response.statusText}`)
        }

        const data = await response.json()
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
        if (!text) {
          throw new Error("Gemini response missing text content")
        }
        const analysis = JSON.parse(text)

        console.log("[v0] Gemini analysis received successfully")

        return {
          score: analysis.score,
          analysis: {
            ...analysis,
            bazi_data: {
              manager: {
                yin_yang: {
                  yin: managerBaZi.yinYang.yinPercent,
                  yang: managerBaZi.yinYang.yangPercent,
                  dominance: managerBaZi.yinYang.dominance,
                },
                elements: managerBaZi.elements,
                day_master: {
                  element: managerBaZi.dayMaster.element,
                  yin_yang: managerBaZi.dayMaster.yinYang,
                },
              },
              candidate: {
                yin_yang: {
                  yin: candidateBaZi.yinYang.yinPercent,
                  yang: candidateBaZi.yinYang.yangPercent,
                  dominance: candidateBaZi.yinYang.dominance,
                },
                elements: candidateBaZi.elements,
                day_master: {
                  element: candidateBaZi.dayMaster.element,
                  yin_yang: candidateBaZi.dayMaster.yinYang,
                },
              },
            },
          },
        }
      } catch (e) {
        lastError = e
        console.warn("[v0] Gemini failed; attempting OpenAI fallback...", e instanceof Error ? e.message : e)
      }
    }

    if (openaiKey) {
      try {
        console.log("[v0] Calling OpenAI API for compatibility analysis (fallback)...")
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openaiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content:
                  "You are an expert in BaZi astrology and workplace compatibility analysis. Always respond with valid JSON.",
              },
              {
                role: "user",
                content: prompt,
              },
            ],
            temperature: 0.7,
            response_format: { type: "json_object" },
          }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error("[v0] OpenAI API error:", response.status, errorText)
          throw new Error(`OpenAI API error: ${response.statusText}`)
        }

        const data = await response.json()
        const analysis = JSON.parse(data.choices[0].message.content)

        console.log("[v0] OpenAI analysis received successfully (fallback)")

        return {
          score: analysis.score,
          analysis: {
            ...analysis,
            bazi_data: {
              manager: {
                yin_yang: {
                  yin: managerBaZi.yinYang.yinPercent,
                  yang: managerBaZi.yinYang.yangPercent,
                  dominance: managerBaZi.yinYang.dominance,
                },
                elements: managerBaZi.elements,
                day_master: {
                  element: managerBaZi.dayMaster.element,
                  yin_yang: managerBaZi.dayMaster.yinYang,
                },
              },
              candidate: {
                yin_yang: {
                  yin: candidateBaZi.yinYang.yinPercent,
                  yang: candidateBaZi.yinYang.yangPercent,
                  dominance: candidateBaZi.yinYang.dominance,
                },
                elements: candidateBaZi.elements,
                day_master: {
                  element: candidateBaZi.dayMaster.element,
                  yin_yang: candidateBaZi.dayMaster.yinYang,
                },
              },
            },
          },
        }
      } catch (e) {
        lastError = e
      }
    }

    if (!geminiKey && !openaiKey) {
      throw new Error("No AI provider configured")
    }

    throw lastError instanceof Error ? lastError : new Error("Both AI providers failed")
  } catch (error) {
    console.error("[v0] Error in performCompatibilityAnalysis:", error)
    throw new Error("Failed to calculate compatibility")
  }
}
