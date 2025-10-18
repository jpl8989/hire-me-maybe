# Tarot Assets Setup Instructions

## Directory Structure Created
The following directory has been created for your tarot card assets:
```
/public/tarot/cards/
```

## File Upload Requirements

Upload your 24 files (12 JPG + 12 MP4) with the following naming convention:

### Your 7 Detailed Cards:
- `cow-spirit-static.jpg` + `cow-spirit-animated.mp4`
- `emperor-spirit-static.jpg` + `emperor-spirit-animated.mp4`
- `empress-spirit-static.jpg` + `empress-spirit-animated.mp4`
- `hierophant-spirit-static.jpg` + `hierophant-spirit-animated.mp4`
- `high-priestess-spirit-static.jpg` + `high-priestess-spirit-animated.mp4`
- `horse-spirit-static.jpg` + `horse-spirit-animated.mp4`
- `strength-spirit-static.jpg` + `strength-spirit-animated.mp4`

### 5 Placeholder Cards (can use generic images):
- `moon-spirit-static.jpg` + `moon-spirit-animated.mp4`
- `sun-spirit-static.jpg` + `sun-spirit-animated.mp4`
- `star-spirit-static.jpg` + `star-spirit-animated.mp4`
- `phoenix-spirit-static.jpg` + `phoenix-spirit-animated.mp4`
- `wolf-spirit-static.jpg` + `wolf-spirit-animated.mp4`

## Naming Convention
- Use lowercase, kebab-case names
- Static images: `{card-name}-static.jpg`
- Animations: `{card-name}-animated.mp4`
- Names should match the card names defined in `/lib/tarot/cards.ts`

## Implementation Complete
The following has been implemented:

1. ✅ **Updated TarotCard interface** to include mantra, essence, meaning, upright, and affirmation fields
2. ✅ **Replaced TAROT_CARDS array** with 7 detailed spirit cards plus 5 placeholder cards
3. ✅ **Modified card selection** to display all 12 cards directly
4. ✅ **Updated animated card reveal** to play MP4 animation and transition to static JPG
5. ✅ **Enhanced AI prompts** to reference all card fields (mantra, essence, meaning, upright, affirmation)
6. ✅ **Updated card display** to show mantras instead of simple meanings

## Next Steps
1. Upload your 24 files to `/public/tarot/cards/`
2. Update the card names and meanings in `/lib/tarot/cards.ts` to match your actual cards
3. Test the tarot reading functionality

## File Format Requirements
- **Static Images**: JPG format, optimized for web
- **Animations**: MP4 format, optimized for web playback
- **Recommended dimensions**: 192x288 pixels (2:3 aspect ratio) to match the card display
