"use server"

import { createElevenLabsClient, VOICE_IDS, MEDITATIVE_VOICE_SETTINGS } from "@/lib/elevenlabs/client"

/**
 * Generate intro audio for tarot card selection page
 */
export async function generateIntroAudio(candidateName: string) {
  try {
    const client = createElevenLabsClient()

    const introText = `Let's do a card reading. Think about ${candidateName} and pick a card that speaks to you. Trust your intuition as you choose.`
    
    const result = await client.generateSpeech(
      introText,
      VOICE_IDS.NATASHA,
      MEDITATIVE_VOICE_SETTINGS
    )

    if (result.error) {
      return { success: false, error: result.error }
    }

    // Convert audio to base64 for AJAX transfer
    const base64Audio = client.arrayBufferToBase64(result.audioData)
    
    return {
      success: true,
      audioData: base64Audio,
      mimeType: 'audio/mpeg'
    }
  } catch (error) {
    console.error('Error generating intro audio:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to generate audio' 
    }
  }
}

/**
 * Generate full reading audio for tarot results page
 */
export async function generateReadingAudio(
  cardName: string,
  meaning: string,
  interpretation: string,
  candidateName: string
) {
  try {
    const client = createElevenLabsClient()

    // ElevenLabs can error on extremely long inputs or unsupported characters.
    const sanitize = (text: string) =>
      text
        .replace(/\s+/g, ' ')
        .replace(/[\u0000-\u001F\u007F]/g, '')
        .slice(0, 1400) // keep prompt concise for reliability

    const readingText = `The card you have drawn is ${sanitize(cardName)}. ${sanitize(meaning)}. ` +
      `Your reading for ${sanitize(candidateName)}: ${sanitize(interpretation)}. ` +
      `May this guidance illuminate your path.`

    const result = await client.generateSpeech(
      readingText,
      VOICE_IDS.NATASHA,
      MEDITATIVE_VOICE_SETTINGS
    )

    if (result.error) {
      return { success: false, error: result.error }
    }

    // Convert audio to base64 for AJAX transfer
    const base64Audio = client.arrayBufferToBase64(result.audioData)
    
    return {
      success: true,
      audioData: base64Audio,
      mimeType: 'audio/mpeg'
    }
  } catch (error) {
    console.error('Error generating reading audio:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to generate audio' 
    }
  }
}
