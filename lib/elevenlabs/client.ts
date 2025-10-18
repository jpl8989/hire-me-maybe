/**
 * ElevenLabs API Client
 * Handles voice generation using the ElevenLabs API directly
 */

export interface VoiceSettings {
  stability: number
  clarity: number
  style: number
}

export interface AudioResponse {
  audioData: ArrayBuffer
  error?: string
}

export class ElevenLabsClient {
  private apiKey: string
  private baseUrl = 'https://api.elevenlabs.io/v1'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  /**
   * Generate audio from text using ElevenLabs API
   */
  async generateSpeech(
    text: string,
    voiceId: string = 'XrExE9yKIg1WjnnlVkGX', // Matilda voice (warm, calming female)
    voiceSettings: VoiceSettings = {
      stability: 0.5,
      clarity: 0.75,
      style: 0.3
    }
  ): Promise<AudioResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: voiceSettings,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('ElevenLabs API error:', response.status, errorText)
        return {
          audioData: new ArrayBuffer(0),
          error: `API Error: ${response.status} - ${errorText}`
        }
      }

      const audioData = await response.arrayBuffer()
      return { audioData }
    } catch (error) {
      console.error('ElevenLabs client error:', error)
      return {
        audioData: new ArrayBuffer(0),
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Convert ArrayBuffer to base64 string for client-side audio playback
   */
  arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }
}

/**
 * Create a new ElevenLabs client instance
 */
export function createElevenLabsClient(): ElevenLabsClient {
  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) {
    throw new Error('ELEVENLABS_API_KEY environment variable is required')
  }
  return new ElevenLabsClient(apiKey)
}

/**
 * Recommended voice IDs for tarot readings
 */
export const VOICE_IDS = {
  NATASHA: 'Atp5cNFg1Wj5gyKD7HWV', // Natasha - Gentle Meditation voice (ideal for tarot readings)
  MATILDA: 'XrExE9yKIg1WjnnlVkGX', // Warm, calming female voice
  RACHEL: '21m00Tcm4TlvDq8ikWAM', // Warm, clear female voice
  BELLA: 'EXAVITQu4vr4xnSDxMaL', // Soft, contemplative female voice
  SARAH: '9BWzwMEQadMvhOKlpMx9', // Calm, meditative female voice
} as const

/**
 * Default voice settings for meditative tarot narration
 * Optimized for Natasha - Gentle Meditation voice
 */
export const MEDITATIVE_VOICE_SETTINGS: VoiceSettings = {
  stability: 0.7, // Higher stability for consistent, soothing delivery
  clarity: 0.8,  // High clarity for clear meditation guidance
  style: 0.2     // Lower style for gentle, meditative tone
}
