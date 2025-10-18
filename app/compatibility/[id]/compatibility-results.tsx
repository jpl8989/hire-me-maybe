"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { YinYangChart } from "@/components/charts/yin-yang-chart"
import { FiveElementsChart } from "@/components/charts/five-elements-chart"
import Link from "next/link"

interface CompatibilityResultsProps {
  candidate: {
    id: string
    name: string
    dob: string
    birth_time: string
    birth_city: string
  }
  match: {
    id: string
    score: number
    analysis: {
      overall_compatibility: string
      categories: {
        communication: number
        decision_style: number
        teamwork: number
        leadership_harmony: number
      }
      strengths: string[]
      challenges: string[]
      summary: string
      recommendations: {
        communication_style: {
          do: string[]
          dont: string[]
        }
        effective_work_approach: string[]
        motivators: string[]
        demotivators: string[]
        interview_focus: {
          areas: string[]
          suggested_questions: string[]
        }
      }
      yin_yang_balance: {
        manager: string
        candidate: string
        compatibility_note: string
      }
      five_elements: {
        manager_primary: string
        candidate_primary: string
        interaction: string
      }
      bazi_data?: {
        manager: {
          yin_yang: {
            yin: number
            yang: number
            dominance: string
          }
          elements: {
            wood: number
            fire: number
            earth: number
            metal: number
            water: number
          }
          day_master: {
            element: string
            yin_yang: string
          }
        }
        candidate: {
          yin_yang: {
            yin: number
            yang: number
            dominance: string
          }
          elements: {
            wood: number
            fire: number
            earth: number
            metal: number
            water: number
          }
          day_master: {
            element: string
            yin_yang: string
          }
        }
      }
    }
  }
  managerName: string
}

export function CompatibilityResults({ candidate, match, managerName }: CompatibilityResultsProps) {

  const getScoreLabel = (score: number) => {
    if (score >= 75) return "High"
    if (score >= 50) return "Medium"
    return "Low"
  }

  const getScoreColor = (score: number) => {
    if (score >= 75) return "bg-emerald-400"
    if (score >= 50) return "bg-amber-400"
    return "bg-orange-300"
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#a8b88f] to-[#d4d4a8] p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard">
            <span className="mr-2">←</span>
            Back to Dashboard
          </Link>
        </Button>

        <Card className="border-2 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-3 pb-3">
            <CardTitle className="text-3xl font-serif font-bold">Compatibility Score</CardTitle>
            <div className="flex items-center justify-center gap-4">
              <div className="text-4xl font-serif font-bold text-slate-900">{match.score}%</div>
              <Badge className={`${getScoreColor(match.score)} text-white text-lg px-4 py-2`}>
                {getScoreLabel(match.score)}
              </Badge>
            </div>
            <CardDescription className="text-sm">
              {managerName} & {candidate.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary Section Header */}
            <div className="border-t pt-6">
              <h3 className="font-serif text-xl font-semibold mb-4">Summary Narrative</h3>
            </div>
            
            {/* Summary Text */}
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-700 leading-relaxed whitespace-pre-line text-base">{match.analysis.summary}</p>
            </div>
            
            {/* Detailed Analysis */}
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-700 leading-relaxed whitespace-pre-line text-base">
                {match.analysis.overall_compatibility}
              </p>
            </div>

            {/* Strengths and Challenges */}
            <div className="grid md:grid-cols-2 gap-6 pt-6 border-t">
              <Card className="border-green-200 bg-green-50/50">
                <CardHeader>
                  <CardTitle className="font-serif text-green-700 text-lg">Strengths</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {match.analysis.strengths.map((strength, index) => (
                      <li key={index} className="text-sm text-slate-700 flex gap-2">
                        <span className="text-green-600">✓</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-amber-200 bg-amber-50/50">
                <CardHeader>
                  <CardTitle className="font-serif text-amber-700 text-lg">Challenges</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {match.analysis.challenges.map((challenge, index) => (
                      <li key={index} className="text-sm text-slate-700 flex gap-2">
                        <span className="text-amber-600">!</span>
                        <span>{challenge}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="font-serif text-xl">Yin Yang Balance</CardTitle>
            </CardHeader>
            <CardContent>
              {match.analysis.bazi_data ? (
                <YinYangChart
                  managerYin={match.analysis.bazi_data.manager.yin_yang.yin}
                  managerYang={match.analysis.bazi_data.manager.yin_yang.yang}
                  candidateYin={match.analysis.bazi_data.candidate.yin_yang.yin}
                  candidateYang={match.analysis.bazi_data.candidate.yin_yang.yang}
                  managerName={managerName}
                  candidateName={candidate.name}
                  compatibilityNote={match.analysis.yin_yang_balance.compatibility_note}
                />
              ) : (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="font-medium">Manager:</span>
                      <Badge variant="outline">{match.analysis.yin_yang_balance.manager}</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="font-medium">Candidate:</span>
                      <Badge variant="outline">{match.analysis.yin_yang_balance.candidate}</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mt-4">{match.analysis.yin_yang_balance.compatibility_note}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="font-serif text-xl">Five Elements Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {match.analysis.bazi_data ? (
                <FiveElementsChart
                  managerElements={match.analysis.bazi_data.manager.elements}
                  candidateElements={match.analysis.bazi_data.candidate.elements}
                  managerName={managerName}
                  candidateName={candidate.name}
                  interactionNote={match.analysis.five_elements.interaction}
                />
              ) : (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="font-medium">Manager:</span>
                      <Badge variant="outline">{match.analysis.five_elements.manager_primary}</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="font-medium">Candidate:</span>
                      <Badge variant="outline">{match.analysis.five_elements.candidate_primary}</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mt-4">{match.analysis.five_elements.interaction}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="font-serif text-xl">Compatibility Breakdown</CardTitle>
            <CardDescription className="text-sm">Key areas of workplace interaction</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            {Object.entries(match.analysis.categories).map(([category, score]) => (
              <div key={category} className="p-4 bg-amber-50/30 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium capitalize">{category.replace("_", " ")}</span>
                  <span className="text-2xl font-bold text-slate-900">{score}%</span>
                </div>
                <div className="w-full bg-stone-200 rounded-full h-2">
                  <div className={`h-2 rounded-full ${getScoreColor(score)}`} style={{ width: `${score}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="font-serif text-xl">Recommendations</CardTitle>
            <CardDescription className="text-sm">Actionable insights for working effectively together</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Communication Style */}
            <div className="space-y-3">
              <h3 className="font-serif font-semibold text-lg">Best Communication Style</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-green-700">✓ Do:</p>
                  <ul className="space-y-1">
                    {match.analysis.recommendations.communication_style.do.map((item, i) => (
                      <li key={i} className="text-sm text-slate-700 flex gap-2">
                        <span className="text-green-600">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-amber-700">✗ Don't:</p>
                  <ul className="space-y-1">
                    {match.analysis.recommendations.communication_style.dont.map((item, i) => (
                      <li key={i} className="text-sm text-slate-700 flex gap-2">
                        <span className="text-amber-600">!</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Effective Work Approach */}
            <div className="space-y-3 pt-4 border-t">
              <h3 className="font-serif font-semibold text-lg">How to Work with This Person Effectively</h3>
              <ul className="space-y-2">
                {match.analysis.recommendations.effective_work_approach.map((item, i) => (
                  <li key={i} className="text-sm text-slate-700 flex gap-2">
                    <span className="text-slate-600">→</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Motivators and Demotivators */}
            <div className="grid md:grid-cols-2 gap-6 pt-4 border-t">
              <div className="space-y-3">
                <h3 className="font-serif font-semibold text-lg">Motivators</h3>
                <ul className="space-y-2">
                  {match.analysis.recommendations.motivators.map((item, i) => (
                    <li key={i} className="text-sm text-slate-700 flex gap-2">
                      <span className="text-green-600">+</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-3">
                <h3 className="font-serif font-semibold text-lg">Demotivators</h3>
                <ul className="space-y-2">
                  {match.analysis.recommendations.demotivators.map((item, i) => (
                    <li key={i} className="text-sm text-slate-700 flex gap-2">
                      <span className="text-amber-600">−</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Interview Focus */}
            <div className="space-y-3 pt-4 border-t">
              <h3 className="font-serif font-semibold text-lg">Interview Focus</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-2">Key Areas to Explore:</p>
                  <ul className="space-y-1">
                    {match.analysis.recommendations.interview_focus.areas.map((item, i) => (
                      <li key={i} className="text-sm text-slate-700 pl-4">
                        • {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-2">Suggested Questions:</p>
                  <ul className="space-y-2">
                    {match.analysis.recommendations.interview_focus.suggested_questions.map((item, i) => (
                      <li key={i} className="text-sm text-slate-700 pl-4">
                        {i + 1}. {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>


        <div className="flex flex-col sm:flex-row justify-center gap-4 pb-8">
          <Button asChild variant="outline" size="lg">
            <Link href={`/tarot/${match.id}`}>
              <span className="mr-2">🔮</span>
              Draw a Tarot Card
            </Link>
          </Button>
          <Button asChild size="lg">
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
