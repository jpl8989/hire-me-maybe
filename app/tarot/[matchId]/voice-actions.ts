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
      VOICE_IDS.RACHEL,
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

    const readingText = `The card you have drawn is ${cardName}. ${meaning}. 

Your reading for ${candidateName}: ${interpretation}

May this guidance illuminate your path.`

    const result = await client.generateSpeech(
      readingText,
      VOICE_IDS.RACHEL,
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
