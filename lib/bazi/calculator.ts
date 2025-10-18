/**
 * Simplified BaZi (Four Pillars of Destiny) Calculator
 * This provides basic BaZi calculations for compatibility analysis
 */

export interface BaZiResult {
  pillars: {
    year: Pillar
    month: Pillar
    day: Pillar
    hour: Pillar
  }
  dayMaster: {
    element: string
    yinYang: 'Yin' | 'Yang'
  }
  yinYang: {
    yinPercent: number
    yangPercent: number
    dominance: 'Yin' | 'Yang' | 'Balanced'
  }
  elements: {
    wood: number
    fire: number
    earth: number
    metal: number
    water: number
  }
  favorableElements: string[]
  unfavorableElements: string[]
}

export interface Pillar {
  stem: string
  branch: string
  stemElement: string
  stemYinYang: 'Yin' | 'Yang'
  branchElement: string
  branchYinYang: 'Yin' | 'Yang'
  hiddenStems: HiddenStem[]
}

export interface HiddenStem {
  stem: string
  element: string
  yinYang: 'Yin' | 'Yang'
}

// Heavenly Stems mapping
const HEAVENLY_STEMS = [
  { stem: 'Jia', element: 'Wood', yinYang: 'Yang' as const },
  { stem: 'Yi', element: 'Wood', yinYang: 'Yin' as const },
  { stem: 'Bing', element: 'Fire', yinYang: 'Yang' as const },
  { stem: 'Ding', element: 'Fire', yinYang: 'Yin' as const },
  { stem: 'Wu', element: 'Earth', yinYang: 'Yang' as const },
  { stem: 'Ji', element: 'Earth', yinYang: 'Yin' as const },
  { stem: 'Geng', element: 'Metal', yinYang: 'Yang' as const },
  { stem: 'Xin', element: 'Metal', yinYang: 'Yin' as const },
  { stem: 'Ren', element: 'Water', yinYang: 'Yang' as const },
  { stem: 'Gui', element: 'Water', yinYang: 'Yin' as const },
]

// Earthly Branches mapping
const EARTHLY_BRANCHES = [
  { branch: 'Zi', element: 'Water', yinYang: 'Yang' as const, hiddenStems: ['Gui'] },
  { branch: 'Chou', element: 'Earth', yinYang: 'Yin' as const, hiddenStems: ['Ji', 'Xin', 'Gui'] },
  { branch: 'Yin', element: 'Wood', yinYang: 'Yang' as const, hiddenStems: ['Jia', 'Bing', 'Wu'] },
  { branch: 'Mao', element: 'Wood', yinYang: 'Yin' as const, hiddenStems: ['Yi'] },
  { branch: 'Chen', element: 'Earth', yinYang: 'Yang' as const, hiddenStems: ['Wu', 'Yi', 'Gui'] },
  { branch: 'Si', element: 'Fire', yinYang: 'Yin' as const, hiddenStems: ['Bing', 'Wu', 'Geng'] },
  { branch: 'Wu', element: 'Fire', yinYang: 'Yang' as const, hiddenStems: ['Ding', 'Ji'] },
  { branch: 'Wei', element: 'Earth', yinYang: 'Yin' as const, hiddenStems: ['Ji', 'Ding', 'Yi'] },
  { branch: 'Shen', element: 'Metal', yinYang: 'Yang' as const, hiddenStems: ['Geng', 'Ren', 'Wu'] },
  { branch: 'You', element: 'Metal', yinYang: 'Yin' as const, hiddenStems: ['Xin'] },
  { branch: 'Xu', element: 'Earth', yinYang: 'Yang' as const, hiddenStems: ['Wu', 'Xin', 'Ding'] },
  { branch: 'Hai', element: 'Water', yinYang: 'Yin' as const, hiddenStems: ['Ren', 'Jia'] },
]

export function calculateBaZi(
  name: string,
  dob: string,
  birthTime: string,
  birthCity: string,
  timezone: string
): BaZiResult {
  // Parse birth date and time
  const birthDate = new Date(`${dob}T${birthTime}`)
  
  // For this simplified version, we'll use a basic calculation
  // In a real implementation, you'd need proper Chinese calendar conversion
  const year = birthDate.getFullYear()
  const month = birthDate.getMonth() + 1
  const day = birthDate.getDate()
  const hour = birthDate.getHours()
  
  // Calculate Heavenly Stems and Earthly Branches
  // This is a simplified version - real BaZi requires complex calendar calculations
  const yearStem = HEAVENLY_STEMS[year % 10]
  const yearBranch = EARTHLY_BRANCHES[year % 12]
  const monthStem = HEAVENLY_STEMS[month % 10]
  const monthBranch = EARTHLY_BRANCHES[month % 12]
  const dayStem = HEAVENLY_STEMS[day % 10]
  const dayBranch = EARTHLY_BRANCHES[day % 12]
  const hourStem = HEAVENLY_STEMS[hour % 10]
  const hourBranch = EARTHLY_BRANCHES[hour % 12]
  
  // Create pillars
  const pillars = {
    year: createPillar(yearStem, yearBranch),
    month: createPillar(monthStem, monthBranch),
    day: createPillar(dayStem, dayBranch),
    hour: createPillar(hourStem, hourBranch),
  }
  
  // Calculate Yin-Yang balance
  const yinYang = calculateYinYangBalance(pillars)
  
  // Calculate Five Elements
  const elements = calculateFiveElements(pillars)
  
  // Determine favorable and unfavorable elements based on day master
  const dayMaster = pillars.day.stemElement
  const favorableElements = getFavorableElements(dayMaster)
  const unfavorableElements = getUnfavorableElements(dayMaster)
  
  return {
    pillars,
    dayMaster: {
      element: dayMaster,
      yinYang: pillars.day.stemYinYang,
    },
    yinYang,
    elements,
    favorableElements,
    unfavorableElements,
  }
}

function createPillar(stem: any, branch: any): Pillar {
  const hiddenStems = branch.hiddenStems.map((stemName: string) => {
    const stemData = HEAVENLY_STEMS.find(s => s.stem === stemName)
    return {
      stem: stemName,
      element: stemData?.element || '',
      yinYang: stemData?.yinYang || 'Yang' as const,
    }
  })
  
  return {
    stem: stem.stem,
    branch: branch.branch,
    stemElement: stem.element,
    stemYinYang: stem.yinYang,
    branchElement: branch.element,
    branchYinYang: branch.yinYang,
    hiddenStems,
  }
}

function calculateYinYangBalance(pillars: any): { yinPercent: number; yangPercent: number; dominance: 'Yin' | 'Yang' | 'Balanced' } {
  let yinCount = 0
  let yangCount = 0
  
  // Count stems
  Object.values(pillars).forEach((pillar: any) => {
    if (pillar.stemYinYang === 'Yin') yinCount++
    else yangCount++
    
    // Count hidden stems with 0.5 weight
    pillar.hiddenStems.forEach((hidden: any) => {
      if (hidden.yinYang === 'Yin') yinCount += 0.5
      else yangCount += 0.5
    })
  })
  
  const total = yinCount + yangCount
  const yinPercent = Math.round((yinCount / total) * 100)
  const yangPercent = Math.round((yangCount / total) * 100)
  
  let dominance: 'Yin' | 'Yang' | 'Balanced' = 'Balanced'
  if (Math.abs(yinPercent - yangPercent) > 10) {
    dominance = yinPercent > yangPercent ? 'Yin' : 'Yang'
  }
  
  return { yinPercent, yangPercent, dominance }
}

function calculateFiveElements(pillars: any): { wood: number; fire: number; earth: number; metal: number; water: number } {
  const elementCounts = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 }
  
  // Count stems
  Object.values(pillars).forEach((pillar: any) => {
    const element = pillar.stemElement.toLowerCase()
    if (element in elementCounts) {
      elementCounts[element as keyof typeof elementCounts]++
    }
    
    // Count hidden stems with 0.5 weight
    pillar.hiddenStems.forEach((hidden: any) => {
      const hiddenElement = hidden.element.toLowerCase()
      if (hiddenElement in elementCounts) {
        elementCounts[hiddenElement as keyof typeof elementCounts] += 0.5
      }
    })
  })
  
  // Normalize to percentages
  const total = Object.values(elementCounts).reduce((sum, count) => sum + count, 0)
  const normalized = Object.fromEntries(
    Object.entries(elementCounts).map(([element, count]) => [
      element,
      Math.round((count / total) * 100)
    ])
  ) as { wood: number; fire: number; earth: number; metal: number; water: number }
  
  return normalized
}

function getFavorableElements(dayMaster: string): string[] {
  // Simplified favorable elements based on day master
  const favorableMap: Record<string, string[]> = {
    'Wood': ['Water', 'Wood'],
    'Fire': ['Wood', 'Fire'],
    'Earth': ['Fire', 'Earth'],
    'Metal': ['Earth', 'Metal'],
    'Water': ['Metal', 'Water'],
  }
  
  return favorableMap[dayMaster] || []
}

function getUnfavorableElements(dayMaster: string): string[] {
  // Simplified unfavorable elements based on day master
  const unfavorableMap: Record<string, string[]> = {
    'Wood': ['Metal', 'Fire'],
    'Fire': ['Water', 'Metal'],
    'Earth': ['Wood', 'Water'],
    'Metal': ['Fire', 'Wood'],
    'Water': ['Earth', 'Fire'],
  }
  
  return unfavorableMap[dayMaster] || []
}
