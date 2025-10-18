export interface TarotCard {
  name: string
  mantra: string // "The miracles are endless"
  essence: string // "Abundance, gratitude, and grounded blessings"
  meaning: string // Full paragraph description
  upright: string // "Prosperity, comfort, generosity, gratitude"
  affirmation: string // "I am supported by endless miracles"
  image: string // path to static JPG
  animation: string // path to animated MP4
  number?: string // optional card number
}


export const TAROT_CARDS: TarotCard[] = [
  {
    name: "Cow Spirit",
    mantra: "The miracles are endless.",
    essence: "Abundance, gratitude, and grounded blessings.",
    meaning: "Cow Spirit reminds you that the universe is generous beyond measure. What you nourish with love and patience will multiply — in work, relationships, or creative pursuits. Abundance isn't a sudden windfall but a steady flow when you trust life's rhythm.",
    upright: "Prosperity, comfort, generosity, gratitude",
    affirmation: "I am supported by endless miracles.",
    image: "/tarot/cards/cow-spirit-static.jpg",
    animation: "/tarot/cards/cow-spirit-animated.mp4"
  },
  {
    name: "Emperor Spirit",
    mantra: "Authority and strength.",
    essence: "Leadership, structure, and mastery of one's domain.",
    meaning: "Emperor Spirit calls you to step into your authority. Build the systems, make the tough calls, and lead with clarity. True strength is calm, not forceful — it creates order out of chaos and stability for others to grow.",
    upright: "Leadership, boundaries, control, responsibility",
    affirmation: "I lead with wisdom and unwavering purpose.",
    image: "/tarot/cards/emperor-spirit-static.jpg",
    animation: "/tarot/cards/emperor-spirit-animated.mp4"
  },
  {
    name: "Empress Spirit",
    mantra: "Abundance & creation flourish.",
    essence: "Fertility, creativity, sensual joy, and growth.",
    meaning: "The Empress Spirit invites you to create — not just things, but experiences, beauty, and love. Nurture your ideas like a garden and watch them bloom. This is the card of embodiment and flow: a reminder to receive as much as you give.",
    upright: "Creativity, nurturing, pleasure, abundance",
    affirmation: "I bloom effortlessly in the rhythm of life.",
    image: "/tarot/cards/empress-spirit-static.jpg",
    animation: "/tarot/cards/empress-spirit-animated.mp4"
  },
  {
    name: "Hierophant Spirit",
    mantra: "Tradition guides wisdom.",
    essence: "Teaching, mentorship, sacred systems, spiritual discipline.",
    meaning: "Hierophant Spirit reminds you that wisdom often lives in structure — in rituals, mentors, or traditions that stand the test of time. Learn before you innovate. Respect lineage while shaping your own truth.",
    upright: "Guidance, learning, spiritual order, community",
    affirmation: "I honor the wisdom that came before me.",
    image: "/tarot/cards/hierophant-spirit-static.jpg",
    animation: "/tarot/cards/hierophant-spirit-animated.mp4"
  },
  {
    name: "High Priestess Spirit",
    mantra: "Intuition holds the cosmic keys.",
    essence: "Mystery, intuition, inner knowing, unseen realms.",
    meaning: "The High Priestess Spirit invites you to trust your intuition, even when logic resists. The answers are within — quiet your mind and listen. This card asks you to be still before acting, to move from deep awareness.",
    upright: "Intuition, mystery, divine timing, hidden truths",
    affirmation: "I trust the wisdom of my inner voice.",
    image: "/tarot/cards/high-priestess-spirit-static.jpg",
    animation: "/tarot/cards/high-priestess-spirit-animated.mp4"
  },
  {
    name: "Horse Spirit",
    mantra: "Freedom is yours.",
    essence: "Movement, independence, power in motion.",
    meaning: "Horse Spirit gallops in to remind you that freedom is both a choice and a responsibility. Break free from self-imposed limits — the open field is yours to run. Trust your direction, and don't let fear tether your wild heart.",
    upright: "Freedom, confidence, travel, progress",
    affirmation: "I move boldly toward my own horizon.",
    image: "/tarot/cards/horse-spirit-static.jpg",
    animation: "/tarot/cards/horse-spirit-animated.mp4"
  },
  {
    name: "Strength Spirit",
    mantra: "Inner power transforms all.",
    essence: "Courage, compassion, resilience, and quiet power.",
    meaning: "Strength Spirit teaches that true power comes from grace under pressure. When you meet challenges with patience and love — toward yourself and others — you transform them into growth.",
    upright: "Inner strength, compassion, courage, calm resilience",
    affirmation: "My calm heart is stronger than any storm.",
    image: "/tarot/cards/strength-spirit-static.jpg",
    animation: "/tarot/cards/strength-spirit-animated.mp4"
  },
  // Placeholder cards
  {
    name: "Moon Spirit",
    mantra: "Trust the cycles of change.",
    essence: "Intuition, mystery, and transformation.",
    meaning: "Moon Spirit guides you through transitions and uncertainty. Trust the natural cycles of growth and release. Embrace the unknown with faith in your inner wisdom.",
    upright: "Intuition, cycles, mystery, reflection",
    affirmation: "I trust the wisdom of natural rhythms.",
    image: "/tarot/cards/moon-spirit-static.jpg",
    animation: "/tarot/cards/moon-spirit-animated.mp4"
  },
  {
    name: "Sun Spirit",
    mantra: "Radiance illuminates your path.",
    essence: "Joy, vitality, and enlightenment.",
    meaning: "Sun Spirit brings light to all corners of your life. Embrace optimism and let your authentic self shine. This is a time of clarity and positive energy.",
    upright: "Joy, vitality, clarity, optimism",
    affirmation: "I radiate light and warmth wherever I go.",
    image: "/tarot/cards/sun-spirit-static.jpg",
    animation: "/tarot/cards/sun-spirit-animated.mp4"
  },
  {
    name: "Star Spirit",
    mantra: "Hope guides through darkness.",
    essence: "Hope, inspiration, and divine guidance.",
    meaning: "Star Spirit appears when you need hope most. Trust that guidance is available even in the darkest times. Your dreams are within reach.",
    upright: "Hope, inspiration, guidance, dreams",
    affirmation: "I am guided by the light of possibility.",
    image: "/tarot/cards/star-spirit-static.jpg",
    animation: "/tarot/cards/star-spirit-animated.mp4"
  },
  {
    name: "Phoenix Spirit",
    mantra: "Rise from transformation.",
    essence: "Rebirth, renewal, and transformation.",
    meaning: "Phoenix Spirit signals a time of profound change and renewal. What once was must end for something new to begin. Trust the process of transformation.",
    upright: "Transformation, rebirth, renewal, rising",
    affirmation: "I rise stronger from every challenge.",
    image: "/tarot/cards/phoenix-spirit-static.jpg",
    animation: "/tarot/cards/phoenix-spirit-animated.mp4"
  },
  {
    name: "Wolf Spirit",
    mantra: "Pack wisdom strengthens you.",
    essence: "Loyalty, instinct, and community.",
    meaning: "Wolf Spirit reminds you of the power of community and intuition. Trust your instincts while valuing the support of your pack. Balance independence with connection.",
    upright: "Loyalty, instinct, community, independence",
    affirmation: "I trust my instincts and cooperate with my pack.",
    image: "/tarot/cards/wolf-spirit-static.jpg",
    animation: "/tarot/cards/wolf-spirit-animated.mp4"
  }
]
