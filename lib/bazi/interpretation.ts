/**
 * Bazi interpretation helper functions for personality insights and element descriptions
 */

export interface PersonalityInsight {
  traits: string[]
  strengths: string[]
  challenges: string[]
  workStyle: string[]
  communicationStyle: string[]
}

export interface ElementDescription {
  name: string
  color: string
  characteristics: string[]
  personality: string[]
  workStyle: string[]
}

export function getDayMasterPersonality(element: string, yinYang: 'Yin' | 'Yang'): PersonalityInsight {
  const baseInsights = getElementCharacteristics(element)
  
  // Adjust based on Yin/Yang nature
  const yinYangModifier = yinYang === 'Yin' ? {
    traits: ['introspective', 'reflective', 'intuitive', 'adaptable'],
    workStyle: ['collaborative', 'supportive', 'patient', 'methodical']
  } : {
    traits: ['assertive', 'direct', 'action-oriented', 'decisive'],
    workStyle: ['leadership-focused', 'results-driven', 'energetic', 'pioneering']
  }

  return {
    traits: [...baseInsights.personality, ...yinYangModifier.traits],
    strengths: baseInsights.characteristics,
    challenges: getChallengesForElement(element, yinYang),
    workStyle: [...baseInsights.workStyle, ...yinYangModifier.workStyle],
    communicationStyle: getCommunicationStyle(element, yinYang)
  }
}

export function getElementCharacteristics(element: string): ElementDescription {
  const elementMap: Record<string, ElementDescription> = {
    'Wood': {
      name: 'Wood',
      color: 'green',
      characteristics: ['growth-oriented', 'creative', 'flexible', 'visionary'],
      personality: ['innovative', 'idealistic', 'compassionate', 'determined'],
      workStyle: ['collaborative', 'mentoring', 'long-term planning', 'team building']
    },
    'Fire': {
      name: 'Fire',
      color: 'red',
      characteristics: ['energetic', 'passionate', 'inspiring', 'dynamic'],
      personality: ['enthusiastic', 'charismatic', 'spontaneous', 'optimistic'],
      workStyle: ['motivating', 'presentation-focused', 'quick decisions', 'inspiring others']
    },
    'Earth': {
      name: 'Earth',
      color: 'yellow',
      characteristics: ['stable', 'practical', 'reliable', 'grounded'],
      personality: ['patient', 'methodical', 'loyal', 'consistent'],
      workStyle: ['systematic', 'detail-oriented', 'process improvement', 'steady progress']
    },
    'Metal': {
      name: 'Metal',
      color: 'gray',
      characteristics: ['precise', 'analytical', 'structured', 'efficient'],
      personality: ['disciplined', 'focused', 'perfectionist', 'logical'],
      workStyle: ['quality-focused', 'systematic', 'efficiency-driven', 'standards-oriented']
    },
    'Water': {
      name: 'Water',
      color: 'blue',
      characteristics: ['adaptable', 'intuitive', 'flowing', 'resourceful'],
      personality: ['flexible', 'empathetic', 'strategic', 'persistent'],
      workStyle: ['adaptive', 'research-focused', 'strategic thinking', 'relationship building']
    }
  }

  return elementMap[element] || elementMap['Earth']
}

export function getYinYangDescription(dominance: 'Yin' | 'Yang' | 'Balanced'): string {
  const descriptions = {
    'Yin': 'You have a Yin-dominant energy, which brings introspection, intuition, and a collaborative approach to work. You excel in supportive roles and prefer to work behind the scenes.',
    'Yang': 'You have a Yang-dominant energy, which brings assertiveness, leadership qualities, and a results-driven approach. You excel in leadership positions and direct action.',
    'Balanced': 'You have a well-balanced Yin-Yang energy, allowing you to adapt between supportive and leadership roles as needed. You can work effectively in various team dynamics.'
  }

  return descriptions[dominance]
}

export function getPillarInsights(pillar: 'year' | 'month' | 'day' | 'hour'): string {
  const insights = {
    'year': 'The Year Pillar represents your public image, reputation, and how others perceive you in professional settings. It influences your career trajectory and social standing.',
    'month': 'The Month Pillar represents your parents, authority figures, and your relationship with management. It influences how you interact with supervisors and handle hierarchical structures.',
    'day': 'The Day Pillar represents your core self, personality, and how you approach work. It is the most important pillar for understanding your work style and decision-making process.',
    'hour': 'The Hour Pillar represents your children, creativity, and how you express yourself. It influences your communication style and how you present ideas to others.'
  }

  return insights[pillar]
}

export function getFavorableElementsDescription(favorable: string[]): string {
  if (favorable.length === 0) return 'No specific favorable elements identified.'
  
  return `Your favorable elements are ${favorable.join(' and ')}. These elements support your natural strengths and help you thrive in your work environment.`
}

export function getUnfavorableElementsDescription(unfavorable: string[]): string {
  if (unfavorable.length === 0) return 'No specific unfavorable elements identified.'
  
  return `Elements to be mindful of include ${unfavorable.join(' and ')}. While not necessarily negative, these elements may require more effort to work with effectively.`
}

function getChallengesForElement(element: string, yinYang: 'Yin' | 'Yang'): string[] {
  const challenges: Record<string, string[]> = {
    'Wood': ['Can be overly idealistic', 'May struggle with rigid structures', 'Tends to take on too much'],
    'Fire': ['Can be impulsive', 'May lack patience for details', 'Can burn out quickly'],
    'Earth': ['Can be resistant to change', 'May move too slowly', 'Tends to overthink decisions'],
    'Metal': ['Can be overly critical', 'May lack flexibility', 'Tends to be perfectionist'],
    'Water': ['Can be indecisive', 'May avoid confrontation', 'Tends to overthink']
  }

  return challenges[element] || []
}

function getCommunicationStyle(element: string, yinYang: 'Yin' | 'Yang'): string[] {
  const baseStyles: Record<string, string[]> = {
    'Wood': ['Visual and creative', 'Storytelling approach', 'Inspirational language'],
    'Fire': ['Enthusiastic and energetic', 'Direct and passionate', 'Motivational speaking'],
    'Earth': ['Practical and methodical', 'Step-by-step explanations', 'Supportive and patient'],
    'Metal': ['Precise and analytical', 'Data-driven presentations', 'Structured and logical'],
    'Water': ['Adaptive and flexible', 'Intuitive understanding', 'Diplomatic and tactful']
  }

  const yinYangModifiers = {
    'Yin': ['Collaborative', 'Listening-focused', 'Consensus-building'],
    'Yang': ['Direct', 'Action-oriented', 'Results-focused']
  }

  return [...(baseStyles[element] || []), ...yinYangModifiers[yinYang]]
}

export function getElementColor(element: string): string {
  const colors: Record<string, string> = {
    'Wood': 'text-emerald-700 bg-emerald-50/80 border-emerald-200/60',
    'Fire': 'text-amber-700 bg-amber-50/80 border-amber-200/60',
    'Earth': 'text-yellow-700 bg-yellow-50/80 border-yellow-200/60',
    'Metal': 'text-stone-600 bg-stone-50/80 border-stone-200/60',
    'Water': 'text-slate-600 bg-slate-50/80 border-slate-200/60'
  }

  return colors[element] || colors['Earth']
}

export function getYinYangColor(yinYang: 'Yin' | 'Yang'): string {
  return yinYang === 'Yin' 
    ? 'text-emerald-700 bg-emerald-50/80 border-emerald-200/60'
    : 'text-amber-700 bg-amber-50/80 border-amber-200/60'
}
