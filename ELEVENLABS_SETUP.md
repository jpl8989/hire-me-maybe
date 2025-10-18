# ElevenLabs Voice Integration Setup Guide

This guide will help you set up ElevenLabs voice narration for your tarot card readings using the direct API approach.

## Prerequisites

- ElevenLabs API key
- No additional dependencies required (uses built-in fetch API)

## Step 1: Get Your ElevenLabs API Key

1. Go to [ElevenLabs Settings](https://elevenlabs.io/app/settings/api-keys)
2. Sign up or log in to your ElevenLabs account
3. Create a new API key

**Required permissions:**
- Text-to-speech access
- Voice library read access
- Standard API access (no workspace or admin permissions needed)

## Step 2: Set Up Environment Variables

Create a `.env.local` file in your project root with your API key:

```bash
ELEVENLABS_API_KEY=your_api_key_here
```

Replace `your_api_key_here` with your actual ElevenLabs API key.

## Step 3: Test the Integration

1. Start your Next.js development server:
   ```bash
   pnpm dev
   ```

2. Navigate to a tarot reading page
3. You should hear the meditative female voice narrating the intro and reading

## How It Works

The integration uses the ElevenLabs API directly without requiring any additional servers or dependencies:

- **Direct API calls**: Uses fetch to communicate with ElevenLabs API
- **Server-side generation**: Audio is generated on your server to keep API keys secure
- **Base64 transfer**: Audio data is encoded and sent to the client for playback
- **Graceful fallback**: If the API is unavailable, the app continues to work without audio

## Troubleshooting

### Audio Not Playing
- Verify your ElevenLabs API key is correct and has the required permissions
- Check the browser console for any error messages
- Ensure your browser allows autoplay audio
- Check that you have sufficient ElevenLabs credits

### API Errors
- Verify your API key is valid and active
- Check your ElevenLabs account for usage limits
- Ensure you have sufficient credits for text-to-speech generation

### Voice Quality Issues
- The application uses the "Rachel" voice by default for a calm, meditative tone
- Voice settings are optimized for mystical narration (stability: 0.5, clarity: 0.75, style: 0.3)

## Voice Customization

You can modify the voice settings in `lib/elevenlabs/client.ts`:

```typescript
export const MEDITATIVE_VOICE_SETTINGS: VoiceSettings = {
  stability: 0.5,    // Lower = more variable, Higher = more consistent
  clarity: 0.75,     // Lower = more artistic, Higher = clearer
  style: 0.3         // Lower = more neutral, Higher = more expressive
}
```

Available voice IDs are defined in the same file:
- `RACHEL`: '21m00Tcm4TlvDq8ikWAM' - Warm, clear female voice (default)
- `BELLA`: 'EXAVITQu4vr4xnSDxMaL' - Soft, contemplative female voice
- `SARAH`: '9BWzwMEQadMvhOKlpMx9' - Calm, meditative female voice

## Production Deployment

For production:
- Keep your API key secure in environment variables
- Monitor your ElevenLabs usage and costs
- Consider implementing audio caching for better performance
- Set up proper error logging and monitoring

## Cost Considerations

ElevenLabs charges per character of text converted to speech. For tarot readings:
- Intro narration: ~50-100 characters
- Full reading: ~200-500 characters depending on interpretation length
- Monitor your usage in the ElevenLabs dashboard
