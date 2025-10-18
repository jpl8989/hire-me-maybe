// Prompt templates for each tarot archetype. Keep these concise for fast generation.

export type PromptSpec = {
  prompt: string
  negative: string
}

const BASE_STYLE = [
  "tarot card, mystical, ethereal lighting, intricate linework, golden accents",
  "high detail, volumetric light, cinematic, soft bokeh",
  "hand-painted look, textured paper, rich color grading",
].join(", ")

const BASE_NEGATIVE = [
  "lowres, blurry, noisy, pixelated, jpeg artifacts, watermark, signature",
  "extra limbs, deformed anatomy, text, logo, frame, border",
  "nsfw, gore, violence, disfigured, mutated, duplicate subject",
].join(", ")

const CARD_TO_CONCEPT: Record<string, string> = {
  "Cow Spirit": "benevolent sacred cow in a meadow at golden hour, symbols of abundance and flow",
  "Emperor Spirit": "regal figure embodying structure and leadership, throne, geometric motifs, steady gaze",
  "Empress Spirit": "nurturing sovereign in a blooming garden, fertility, creation, flowing fabrics",
  "Hierophant Spirit": "wise mentor in sacred temple, candles, ritual objects, tradition and guidance",
  "High Priestess Spirit": "mystic oracle, crescent moon, veils, hidden knowledge, serene expression",
  "Horse Spirit": "majestic horse in motion, wind-swept mane, open plains, freedom and momentum",
  "Strength Spirit": "gentle strength, calm figure with guardian animal, compassion and courage",
  "Moon Spirit": "luminous moonlit scene, tides and cycles, dreamy atmosphere, intuition",
  "Sun Spirit": "radiant sun, warmth and clarity, joyful motifs, illumination and vitality",
  "Star Spirit": "cosmic starlight, guidance and hope, celestial symbols, tranquil night sky",
  "Phoenix Spirit": "phoenix rebirth in luminous embers, transformation, rising energy",
  "Wolf Spirit": "wise wolf, night forest, pack and community, instinct and balance",
}

export function getPromptForCard(cardName: string): PromptSpec {
  const concept = CARD_TO_CONCEPT[cardName] ?? "mystical archetype in tarot card composition"
  return {
    prompt: `${concept}, ${BASE_STYLE}`,
    negative: BASE_NEGATIVE,
  }
}


