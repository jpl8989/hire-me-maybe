"use client"

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"

interface FiveElementsChartProps {
  managerElements: {
    wood: number
    fire: number
    earth: number
    metal: number
    water: number
  }
  candidateElements: {
    wood: number
    fire: number
    earth: number
    metal: number
    water: number
  }
  managerName: string
  candidateName: string
  interactionNote?: string
}

export function FiveElementsChart({
  managerElements,
  candidateElements,
  managerName,
  candidateName,
  interactionNote,
}: FiveElementsChartProps) {
  const data = [
    {
      element: "Wood",
      Manager: managerElements.wood,
      Candidate: candidateElements.wood,
      fullMark: 100,
    },
    {
      element: "Fire",
      Manager: managerElements.fire,
      Candidate: candidateElements.fire,
      fullMark: 100,
    },
    {
      element: "Earth",
      Manager: managerElements.earth,
      Candidate: candidateElements.earth,
      fullMark: 100,
    },
    {
      element: "Metal",
      Manager: managerElements.metal,
      Candidate: candidateElements.metal,
      fullMark: 100,
    },
    {
      element: "Water",
      Manager: managerElements.water,
      Candidate: candidateElements.water,
      fullMark: 100,
    },
  ]

  const chartConfig = {
    Manager: { label: managerName, color: "hsl(160, 84%, 39%)" },
    Candidate: { label: candidateName, color: "hsl(45, 93%, 47%)" },
  }

  return (
    <div className="space-y-4">
      <div className="w-full h-64 overflow-hidden">
        <ChartContainer
          id="five-elements"
          config={chartConfig}
          className="w-full h-full"
        >
          <BarChart 
            data={data} 
            width={400} 
            height={250}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="element" 
              tick={{ fontSize: 11 }}
              tickLine={{ stroke: "hsl(var(--muted-foreground))" }}
            />
            <YAxis 
              tick={{ fontSize: 11 }}
              tickLine={{ stroke: "hsl(var(--muted-foreground))" }}
              domain={[0, 100]}
            />
            <ChartTooltip 
              content={<ChartTooltipContent 
                formatter={(value, name) => [`${value}%`, name]}
              />} 
            />
            <Bar 
              dataKey="Manager" 
              fill="var(--color-Manager)" 
              radius={[4, 4, 0, 0]}
              name={managerName}
            />
            <Bar 
              dataKey="Candidate" 
              fill="var(--color-Candidate)" 
              radius={[4, 4, 0, 0]}
              name={candidateName}
            />
          </BarChart>
        </ChartContainer>
      </div>
      
      <div className="flex justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: "hsl(160, 84%, 39%)" }}></div>
          <span>{managerName}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: "hsl(45, 93%, 47%)" }}></div>
          <span>{candidateName}</span>
        </div>
      </div>
      
      {interactionNote && (
        <div className="mt-4 p-4 bg-amber-50/30 rounded-lg">
          <p className="text-sm text-slate-700 leading-relaxed">{interactionNote}</p>
        </div>
      )}
    </div>
  )
}
