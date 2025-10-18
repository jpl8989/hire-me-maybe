"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BaZiResult } from "@/lib/bazi/calculator"
import { 
  getDayMasterPersonality, 
  getElementCharacteristics,
  getElementColor,
  getYinYangColor
} from "@/lib/bazi/interpretation"
import Link from "next/link"

interface BaziSummaryCardProps {
  baziData: BaZiResult
  personName: string
  birthInfo?: {
    dob: string
    birth_time: string
    birth_city: string
  }
}

export function BaziSummaryCard({ baziData, personName, birthInfo }: BaziSummaryCardProps) {
  const personality = getDayMasterPersonality(baziData.dayMaster.element, baziData.dayMaster.yinYang)
  const elementInfo = getElementCharacteristics(baziData.dayMaster.element)

  // Get top 3 personality traits
  const topTraits = personality.strengths.slice(0, 3)
  
  // Get dominant element
  const dominantElement = Object.entries(baziData.elements).reduce((a, b) => 
    baziData.elements[a[0]] > baziData.elements[b[0]] ? a : b
  )[0]

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-2 hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-serif">{personName}'s Bazi</CardTitle>
            <CardDescription className="text-sm">
              {birthInfo && `${new Date(birthInfo.dob).toLocaleDateString('en-US')} • ${birthInfo.birth_city}`}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge className={`${getElementColor(baziData.dayMaster.element)} text-sm`}>
              {baziData.dayMaster.element}
            </Badge>
            <Badge className={`${getYinYangColor(baziData.dayMaster.yinYang)} text-sm`}>
              {baziData.dayMaster.yinYang}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Day Master Summary */}
        <div className="text-center">
          <p className="text-sm font-medium text-slate-700 mb-2">
            {elementInfo.name} {baziData.dayMaster.yinYang} Personality
          </p>
          <p className="text-xs text-slate-600">{elementInfo.personality.slice(0, 2).join(', ')}</p>
        </div>

        {/* Key Traits */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-slate-700">Key Traits</h4>
          <div className="flex flex-wrap gap-1">
            {topTraits.map((trait, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {trait}
              </Badge>
            ))}
          </div>
        </div>

        {/* Element Balance */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-slate-700">Element Balance</h4>
          <div className="flex justify-between items-center text-xs">
            <span>Dominant: {dominantElement}</span>
            <span>Yin: {Math.round(baziData.yinYang.yinPercent)}% | Yang: {Math.round(baziData.yinYang.yangPercent)}%</span>
          </div>
        </div>

        {/* View Full Reading Button */}
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link href={`/bazi/${personName.toLowerCase().replace(/\s+/g, '-')}`}>
            View Full Reading
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
