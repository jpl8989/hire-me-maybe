"use client"

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"

interface YinYangChartProps {
  managerYin: number
  managerYang: number
  candidateYin: number
  candidateYang: number
  managerName: string
  candidateName: string
  compatibilityNote?: string
}

export function YinYangChart({
  managerYin,
  managerYang,
  candidateYin,
  candidateYang,
  managerName,
  candidateName,
  compatibilityNote,
}: YinYangChartProps) {
  const managerData = [
    { name: "Yin", value: managerYin, fill: "hsl(160, 84%, 39%)" },
    { name: "Yang", value: managerYang, fill: "hsl(45, 93%, 47%)" },
  ]

  const candidateData = [
    { name: "Yin", value: candidateYin, fill: "hsl(160, 84%, 39%)" },
    { name: "Yang", value: candidateYang, fill: "hsl(45, 93%, 47%)" },
  ]

  const chartConfig = {
    Yin: { label: "Yin", color: "hsl(160, 84%, 39%)" },
    Yang: { label: "Yang", color: "hsl(45, 93%, 47%)" },
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Manager Chart */}
        <div className="space-y-3">
          <div className="text-center">
            <h4 className="font-medium text-slate-900">{managerName}</h4>
            <p className="text-sm text-slate-600">Manager</p>
          </div>
          <div className="w-full h-40 flex items-center justify-center">
            <ChartContainer
              id="manager-yin-yang"
              config={chartConfig}
              className="w-full h-full max-w-[160px] max-h-[160px]"
            >
              <PieChart width={160} height={160}>
                <Pie
                  data={managerData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={60}
                  startAngle={90}
                  endAngle={450}
                >
                  {managerData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </div>
          <div className="flex justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(160, 84%, 39%)" }}></div>
              <span>Yin: {managerYin}%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(45, 93%, 47%)" }}></div>
              <span>Yang: {managerYang}%</span>
            </div>
          </div>
        </div>

        {/* Candidate Chart */}
        <div className="space-y-3">
          <div className="text-center">
            <h4 className="font-medium text-slate-900">{candidateName}</h4>
            <p className="text-sm text-slate-600">Candidate</p>
          </div>
          <div className="w-full h-40 flex items-center justify-center">
            <ChartContainer
              id="candidate-yin-yang"
              config={chartConfig}
              className="w-full h-full max-w-[160px] max-h-[160px]"
            >
              <PieChart width={160} height={160}>
                <Pie
                  data={candidateData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={60}
                  startAngle={90}
                  endAngle={450}
                >
                  {candidateData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </div>
          <div className="flex justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(160, 84%, 39%)" }}></div>
              <span>Yin: {candidateYin}%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(45, 93%, 47%)" }}></div>
              <span>Yang: {candidateYang}%</span>
            </div>
          </div>
        </div>
      </div>
      
      {compatibilityNote && (
        <div className="mt-4 p-4 bg-amber-50/30 rounded-lg">
          <p className="text-sm text-slate-700 leading-relaxed">{compatibilityNote}</p>
        </div>
      )}
    </div>
  )
}
