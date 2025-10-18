"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BaZiResult } from "@/lib/bazi/calculator"
import { 
  getDayMasterPersonality, 
  getElementCharacteristics,
  getElementColor,
  getYinYangColor
} from "@/lib/bazi/interpretation"
import Link from "next/link"

interface BaziSummaryModalProps {
  isOpen: boolean
  onClose: () => void
  baziData: BaZiResult
  personName: string
  birthInfo?: {
    dob: string
    birth_time: string
    birth_city: string
  }
}

export function BaziSummaryModal({ 
  isOpen, 
  onClose, 
  baziData, 
  personName, 
  birthInfo 
}: BaziSummaryModalProps) {
  const personality = getDayMasterPersonality(baziData.dayMaster.element, baziData.dayMaster.yinYang)
  const elementInfo = getElementCharacteristics(baziData.dayMaster.element)

  // Get top 3 personality traits
  const topTraits = personality.strengths.slice(0, 3)
  
  // Get dominant element
  const dominantElement = Object.entries(baziData.elements).reduce((a, b) => 
    baziData.elements[a[0]] > baziData.elements[b[0]] ? a : b
  )[0]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white/90 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">
            {personName}'s Bazi Reading
          </DialogTitle>
          {birthInfo && (
            <p className="text-sm text-slate-600">
              Born {new Date(birthInfo.dob).toLocaleDateString('en-US')} at {birthInfo.birth_time} in {birthInfo.birth_city}
            </p>
          )}
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Day Master Summary */}
          <div className="text-center space-y-3">
            <div className="flex justify-center gap-2">
              <Badge className={`${getElementColor(baziData.dayMaster.element)} text-sm`}>
                {baziData.dayMaster.element}
              </Badge>
              <Badge className={`${getYinYangColor(baziData.dayMaster.yinYang)} text-sm`}>
                {baziData.dayMaster.yinYang}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">
                {elementInfo.name} {baziData.dayMaster.yinYang} Personality
              </p>
              <p className="text-xs text-slate-600 mt-1">
                {elementInfo.personality.slice(0, 2).join(', ')}
              </p>
            </div>
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
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-600">Dominant:</span>
                <span className="ml-1 font-medium">{dominantElement}</span>
              </div>
              <div>
                <span className="text-slate-600">Yin-Yang:</span>
                <span className="ml-1 font-medium">
                  {Math.round(baziData.yinYang.yinPercent)}% / {Math.round(baziData.yinYang.yangPercent)}%
                </span>
              </div>
            </div>
          </div>

          {/* Work Style */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-slate-700">Work Style</h4>
            <div className="flex flex-wrap gap-1">
              {personality.workStyle.slice(0, 4).map((style, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {style}
                </Badge>
              ))}
            </div>
          </div>

          {/* Communication Style */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-slate-700">Communication</h4>
            <div className="flex flex-wrap gap-1">
              {personality.communicationStyle.slice(0, 3).map((style, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {style}
                </Badge>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center pt-4 border-t">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
