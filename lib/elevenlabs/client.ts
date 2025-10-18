/**
 * ElevenLabs API Client
 * Handles voice generation using the ElevenLabs API directly
 */

export interface VoiceSettings {
  stability: number
  similarity_boost: number
  style: number
  use_speaker_boost?: boolean
}

export interface AudioResponse {
  audioData: ArrayBuffer
  error?: string
  status?: number
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
      similarity_boost: 0.75,
      style: 0.3,
      use_speaker_boost: true
    }
  ): Promise<AudioResponse> {
    const primaryModel = 'eleven_turbo_v2_5'
    const fallbackModel = 'eleven_monolingual_v1'

    const primaryAttempt = await this.requestSpeech({ text, voiceId, modelId: primaryModel, voiceSettings })
    if (!primaryAttempt.error) {
      return primaryAttempt
    }

    const shouldFallback =
      !primaryAttempt.status ||
      /model/i.test(primaryAttempt.error ?? '') ||
      (typeof primaryAttempt.status === 'number' && primaryAttempt.status >= 500)

    if (!shouldFallback) {
      return primaryAttempt
    }

    console.warn(
      `ElevenLabs primary model "${primaryModel}" failed (${primaryAttempt.status}). Trying fallback model "${fallbackModel}"...`
    )

    const fallbackAttempt = await this.requestSpeech({
      text,
      voiceId,
      modelId: fallbackModel,
      voiceSettings,
    })

    if (!fallbackAttempt.error) {
      return fallbackAttempt
    }

    return {
      audioData: new ArrayBuffer(0),
      error: [primaryAttempt.error, fallbackAttempt.error].filter(Boolean).join('\nFallback: '),
      status: fallbackAttempt.status,
    }
  }

  private async requestSpeech({
    text,
    voiceId,
    modelId,
    voiceSettings,
  }: {
    text: string
    voiceId: string
    modelId: string
    voiceSettings: VoiceSettings
  }): Promise<AudioResponse> {
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
          model_id: modelId,
          voice_settings: voiceSettings,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('ElevenLabs API error:', response.status, errorText)
        return {
          audioData: new ArrayBuffer(0),
          error: `API Error (${modelId}): ${response.status} - ${errorText}`,
          status: response.status,
        }
      }

      const audioData = await response.arrayBuffer()
      return { audioData, status: response.status }
    } catch (error) {
      console.error('ElevenLabs client error:', error)
      return {
        audioData: new ArrayBuffer(0),
        error: error instanceof Error ? error.message : 'Unknown error occurred',
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
  similarity_boost: 0.8, // High similarity for clear meditation guidance
  style: 0.2,            // Lower style for gentle, meditative tone
  use_speaker_boost: true
}
