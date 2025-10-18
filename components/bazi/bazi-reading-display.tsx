"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { YinYangChart } from "@/components/charts/yin-yang-chart"
import { FiveElementsChart } from "@/components/charts/five-elements-chart"
import { BaZiResult } from "@/lib/bazi/calculator"
import { 
  getDayMasterPersonality, 
  getElementCharacteristics, 
  getYinYangDescription,
  getPillarInsights,
  getFavorableElementsDescription,
  getUnfavorableElementsDescription,
  getElementColor,
  getYinYangColor
} from "@/lib/bazi/interpretation"

interface BaziReadingDisplayProps {
  baziData: BaZiResult
  personName: string
  birthInfo?: {
    dob: string
    birth_time: string
    birth_city: string
  }
  isLoading?: boolean
}

export function BaziReadingDisplay({ baziData, personName, birthInfo, isLoading = false }: BaziReadingDisplayProps) {
  const personality = getDayMasterPersonality(baziData.dayMaster.element, baziData.dayMaster.yinYang)
  const elementInfo = getElementCharacteristics(baziData.dayMaster.element)
  const yinYangDescription = getYinYangDescription(baziData.yinYang.dominance)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-[#a8b88f] to-[#d4d4a8] p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <Spinner className="h-8 w-8 mx-auto" />
                <p className="text-slate-600">Calculating Bazi reading for {personName}...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-serif">Bazi Reading for {personName}</CardTitle>
          {birthInfo && (
            <CardDescription className="text-sm">
              Born {new Date(birthInfo.dob).toLocaleDateString('en-US')} at {birthInfo.birth_time} in {birthInfo.birth_city}
            </CardDescription>
          )}
        </CardHeader>
      </Card>

      {/* Four Pillars */}
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="font-serif text-xl">Four Pillars of Destiny</CardTitle>
          <CardDescription>The fundamental structure of your Bazi chart</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(baziData.pillars).map(([position, pillar]) => (
              <div key={position} className="text-center space-y-2">
                <div className="text-sm font-medium capitalize text-slate-600">{position} Pillar</div>
                <div className="space-y-1">
                  <div className="p-2 bg-slate-50 rounded border">
                    <div className="text-lg font-semibold">{pillar.stem}</div>
                    <div className="text-xs text-slate-500">{pillar.stemElement} {pillar.stemYinYang}</div>
                  </div>
                  <div className="p-2 bg-slate-50 rounded border">
                    <div className="text-lg font-semibold">{pillar.branch}</div>
                    <div className="text-xs text-slate-500">{pillar.branchElement} {pillar.branchYinYang}</div>
                  </div>
                </div>
                {pillar.hiddenStems.length > 0 && (
                  <div className="text-xs text-slate-500">
                    Hidden: {pillar.hiddenStems.map(h => h.stem).join(', ')}
                  </div>
                )}
                <div className="text-xs text-slate-400 italic hidden sm:block">
                  {getPillarInsights(position as 'year' | 'month' | 'day' | 'hour')}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Day Master */}
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="font-serif text-xl">Day Master</CardTitle>
          <CardDescription>Your core personality and decision-making style</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center gap-4">
            <Badge className={`text-lg px-4 py-2 ${getElementColor(baziData.dayMaster.element)}`}>
              {baziData.dayMaster.element}
            </Badge>
            <Badge className={`text-lg px-4 py-2 ${getYinYangColor(baziData.dayMaster.yinYang)}`}>
              {baziData.dayMaster.yinYang}
            </Badge>
          </div>
          
          <div className="text-center text-slate-600">
            <p className="font-medium">{elementInfo.name} {baziData.dayMaster.yinYang} Personality</p>
            <p className="text-sm mt-1">{elementInfo.personality.join(', ')}</p>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="font-serif text-xl">Yin-Yang Balance</CardTitle>
            <CardDescription>Your energy distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <YinYangChart
              managerYin={baziData.yinYang.yinPercent}
              managerYang={baziData.yinYang.yangPercent}
              managerName={personName}
              candidateName=""
              compatibilityNote={yinYangDescription}
            />
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="font-serif text-xl">Five Elements Distribution</CardTitle>
            <CardDescription>Elemental composition of your chart</CardDescription>
          </CardHeader>
          <CardContent>
            <FiveElementsChart
              managerElements={baziData.elements}
              candidateElements={{}}
              managerName={personName}
              candidateName=""
              interactionNote="Your elemental balance influences your natural strengths and working style."
            />
          </CardContent>
        </Card>
      </div>

      {/* Personality Analysis */}
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="font-serif text-xl">Personality Analysis</CardTitle>
          <CardDescription>Based on your Day Master and elemental balance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-green-700">Key Strengths</h4>
              <ul className="space-y-1">
                {personality.strengths.map((strength, index) => (
                  <li key={index} className="text-sm text-slate-700 flex gap-2">
                    <span className="text-green-600">✓</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-amber-700">Areas for Growth</h4>
              <ul className="space-y-1">
                {personality.challenges.map((challenge, index) => (
                  <li key={index} className="text-sm text-slate-700 flex gap-2">
                    <span className="text-amber-600">!</span>
                    <span>{challenge}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-slate-800 mb-2">Work Style</h4>
              <div className="flex flex-wrap gap-2">
                {personality.workStyle.map((style, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {style}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-slate-800 mb-2">Communication Style</h4>
              <div className="flex flex-wrap gap-2">
                {personality.communicationStyle.map((style, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {style}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Favorable and Unfavorable Elements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white/80 backdrop-blur-sm border-green-200">
          <CardHeader>
            <CardTitle className="font-serif text-green-700">Favorable Elements</CardTitle>
            <CardDescription>Elements that support your natural strengths</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {baziData.favorableElements.map((element, index) => (
                <Badge key={index} className={`${getElementColor(element)} text-sm`}>
                  {element}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-slate-600 mt-3">
              {getFavorableElementsDescription(baziData.favorableElements)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-amber-200">
          <CardHeader>
            <CardTitle className="font-serif text-amber-700">Elements to Mind</CardTitle>
            <CardDescription>Elements that may require more attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {baziData.unfavorableElements.map((element, index) => (
                <Badge key={index} className={`${getElementColor(element)} text-sm`}>
                  {element}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-slate-600 mt-3">
              {getUnfavorableElementsDescription(baziData.unfavorableElements)}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
