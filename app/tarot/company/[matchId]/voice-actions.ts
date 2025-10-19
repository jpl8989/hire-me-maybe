"use server"

import { createElevenLabsClient, MEDITATIVE_VOICE_SETTINGS } from "@/lib/elevenlabs/client"

// Company-specific ElevenLabs voice (provided by user)
const COMPANY_VOICE_ID = "UvFmc37lQcxsSts1KwSb"

export async function generateIntroAudio(companyName: string) {
  try {
    const client = createElevenLabsClient()

    const introText = `Keep ${companyName} in mind and trust your first instinct. Select a card to learn what growth is possible.`

    const result = await client.generateSpeech(
      introText,
      COMPANY_VOICE_ID,
      MEDITATIVE_VOICE_SETTINGS
    )

    if (result.error) {
      return { success: false, error: result.error }
    }

    const base64Audio = client.arrayBufferToBase64(result.audioData)

    return {
      success: true,
      audioData: base64Audio,
      mimeType: "audio/mpeg",
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate audio",
    }
  }
}

export async function generateReadingAudio(
  cardName: string,
  meaning: string,
  interpretation: string,
  companyName: string
) {
  try {
    const client = createElevenLabsClient()

    const sanitize = (text: string) =>
      text
        .replace(/\s+/g, " ")
        .replace(/[\u0000-\u001F\u007F]/g, "")
        .slice(0, 1400)

    const readingText = `The card drawn is ${sanitize(cardName)}. ${sanitize(meaning)}. Your reading for ${sanitize(companyName)}: ${sanitize(interpretation)}. May this guidance support clear decisions.`

    const result = await client.generateSpeech(
      readingText,
      COMPANY_VOICE_ID,
      MEDITATIVE_VOICE_SETTINGS
    )

    if (result.error) {
      return { success: false, error: result.error }
    }

    const base64Audio = client.arrayBufferToBase64(result.audioData)

    return {
      success: true,
      audioData: base64Audio,
      mimeType: "audio/mpeg",
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate audio",
    }
  }
}


