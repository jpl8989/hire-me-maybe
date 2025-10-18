"use server"

import { createClient } from "@/lib/supabase/server"
import { calculateBaZi } from "@/lib/bazi/calculator"

type Company = {
  id: string
  name: string
  founding_date: string | null
  founding_time: string | null
  founding_city: string | null
  timezone: string | null
}

type BirthData = {
  name: string
  dob: string
  birth_time: string
  birth_city: string
  timezone: string
}

export async function calculateCompanyCompatibility(
  managerId: string,
): Promise<{ success: boolean; matchId?: string; error?: string }> {
  try {
    const supabase = await createClient()

    // Load manager birth data
    const { data: managerBirthData, error: managerBirthError } = await supabase
      .from("birth_data")
      .select("*")
      .eq("user_id", managerId)
      .single()

    if (managerBirthError || !managerBirthData) {
      return { success: false, error: "Manager profile not found" }
    }

    // Load the manager's single company
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("*")
      .eq("manager_id", managerId)
      .single()

    if (companyError || !company) {
      return { success: false, error: "Company not found" }
    }

    const managerData: BirthData = {
      name: managerBirthData.name,
      dob: managerBirthData.dob,
      birth_time: managerBirthData.birth_time,
      birth_city: managerBirthData.birth_city,
      timezone: managerBirthData.timezone,
    }

    // For company, use founding date/time/city/timezone; if time is missing, use 12:00
    const companyData: BirthData = {
      name: company.name,
      dob: (company.founding_date as unknown as string) || managerBirthData.dob,
      birth_time: company.founding_time || "12:00",
      birth_city: company.founding_city || managerBirthData.birth_city,
      timezone: company.timezone || managerBirthData.timezone,
    }

    const result = await performManagerCompanyAnalysis(managerData, companyData)

    // Upsert into company_compatibility_matches
    const { data: existing } = await supabase
      .from("company_compatibility_matches")
      .select("id")
      .eq("manager_id", managerId)
      .eq("company_id", company.id)
      .maybeSingle()

    if (existing?.id) {
      const { data: updated, error: updateError } = await supabase
        .from("company_compatibility_matches")
        .update({
          score: result.score,
          analysis: result.analysis,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select("id")
        .single()

      if (updateError) {
        return { success: false, error: "Failed to save company compatibility" }
      }
      return { success: true, matchId: updated.id }
    } else {
      const { data: inserted, error: insertError } = await supabase
        .from("company_compatibility_matches")
        .insert({
          manager_id: managerId,
          company_id: company.id,
          score: result.score,
          analysis: result.analysis,
        })
        .select("id")
        .single()

      if (insertError) {
        return { success: false, error: "Failed to save company compatibility" }
      }
      return { success: true, matchId: inserted.id }
    }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Unknown error" }
  }
}

async function performManagerCompanyAnalysis(
  managerData: BirthData,
  companyData: BirthData,
) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error("OpenAI API key not configured")

  // Calculate BaZi for manager and company
  const managerBaZi = calculateBaZi(
    managerData.name,
    managerData.dob,
    managerData.birth_time,
    managerData.birth_city,
    managerData.timezone,
  )
  const companyBaZi = calculateBaZi(
    companyData.name,
    companyData.dob,
    companyData.birth_time,
    companyData.birth_city,
    companyData.timezone,
  )

  const prompt = `You are an expert in BaZi astrology and organizational alignment.

Assess alignment between a manager and a company using their BaZi:

Manager:
- Name: ${managerData.name}
- DOB: ${managerData.dob}
- Time: ${managerData.birth_time}
- City: ${managerData.birth_city}
- TZ: ${managerData.timezone}
- BaZi: Yin ${managerBaZi.yinYang.yinPercent}%, Yang ${managerBaZi.yinYang.yangPercent}% (${managerBaZi.yinYang.dominance}); Day Master ${managerBaZi.dayMaster.element} ${managerBaZi.dayMaster.yinYang}; Elements ${JSON.stringify(managerBaZi.elements)}

Company:
- Name: ${companyData.name}
- Founding: ${companyData.dob} ${companyData.birth_time}
- City: ${companyData.birth_city}
- TZ: ${companyData.timezone}
- BaZi: Yin ${companyBaZi.yinYang.yinPercent}%, Yang ${companyBaZi.yinYang.yangPercent}% (${companyBaZi.yinYang.dominance}); Day Master ${companyBaZi.dayMaster.element} ${companyBaZi.dayMaster.yinYang}; Elements ${JSON.stringify(companyBaZi.elements)}

Return JSON with the same schema used for candidate compatibility (score, categories, strengths, challenges, summary, recommendations, yin_yang_balance, five_elements).`

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an expert in BaZi and organizational fit. Always reply with JSON." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`OpenAI API error: ${response.status} ${errorText}`)
  }

  const data = await response.json()
  const analysis = JSON.parse(data.choices[0].message.content)

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
          day_master: managerBaZi.dayMaster,
        },
        company: {
          yin_yang: {
            yin: companyBaZi.yinYang.yinPercent,
            yang: companyBaZi.yinYang.yangPercent,
            dominance: companyBaZi.yinYang.dominance,
          },
          elements: companyBaZi.elements,
          day_master: companyBaZi.dayMaster,
        },
      },
    },
  }
}


