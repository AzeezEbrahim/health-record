"use client"

import { useMemo, useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, BarChart3, Calendar } from "lucide-react"
import type { LabResult } from "@/lib/types"

interface LabTrendsChartProps {
  labResults: LabResult[]
  className?: string
}

interface ChartDataPoint {
  date: string
  dateSort: number
  [testName: string]: string | number
}

export function LabTrendsChart({ labResults, className }: LabTrendsChartProps) {
  const [selectedTestGroup, setSelectedTestGroup] = useState<string>("lipid")
  
  // Group tests by medical categories
  const testGroups = {
    lipid: {
      name: "Lipid Panel",
      tests: ["CHOLESTEROL-TOTAL", "TRIGLYCERIDES", "HDL-CHOLESTEROL", "LDL-CHOLESTEROL"],
      colors: ["#8884d8", "#82ca9d", "#ffc658", "#ff7c7c"]
    },
    blood: {
      name: "Blood Count",
      tests: ["WBC CBC2", "RBC CBC2", "HB CBC2", "PCV CBC2", "PLATELET CBC2"],
      colors: ["#8884d8", "#82ca9d", "#ffc658", "#ff7c7c", "#8dd1e1"]
    },
    kidney: {
      name: "Kidney Function",
      tests: ["CREATININE", "BUN"],
      colors: ["#8884d8", "#82ca9d"]
    },
    electrolytes: {
      name: "Electrolytes",
      tests: ["SODIUM1", "POTASSIUM1"],
      colors: ["#8884d8", "#82ca9d"]
    },
    coagulation: {
      name: "Coagulation",
      tests: ["PT2", "INR2", "PTT2", "D-DIMER2"],
      colors: ["#8884d8", "#82ca9d", "#ffc658", "#ff7c7c"]
    },
    thyroid: {
      name: "Thyroid Function",
      tests: ["TSH ARCHI 4"],
      colors: ["#8884d8"]
    }
  }

  // Process data for charts
  const chartData = useMemo(() => {
    const selectedGroup = testGroups[selectedTestGroup as keyof typeof testGroups]
    if (!selectedGroup) return []

    // Filter results for selected test group
    const relevantResults = labResults.filter(result => 
      selectedGroup.tests.includes(result.testName)
    )

    // Group by date
    const dateGroups = relevantResults.reduce((groups, result) => {
      if (!groups[result.date]) {
        groups[result.date] = []
      }
      groups[result.date].push(result)
      return groups
    }, {} as Record<string, LabResult[]>)

    // Convert to chart format
    const data: ChartDataPoint[] = Object.entries(dateGroups).map(([date, results]) => {
      const dataPoint: ChartDataPoint = {
        date,
        dateSort: new Date(date.split('/').reverse().join('-')).getTime()
      }
      
      results.forEach(result => {
        // Convert value to number (remove non-numeric characters except decimal point)
        const numericValue = parseFloat(result.value.replace(/[^\d.-]/g, ''))
        if (!isNaN(numericValue)) {
          dataPoint[result.testName] = numericValue
        }
      })
      
      return dataPoint
    })

    // Sort by date
    return data.sort((a, b) => a.dateSort - b.dateSort)
  }, [labResults, selectedTestGroup])

  // Custom tooltip to show reference ranges
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null

    return (
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
        <p className="font-medium mb-2">{label}</p>
        {payload.map((entry: any, index: number) => {
          const testResult = labResults.find(r => 
            r.date === label && r.testName === entry.dataKey
          )
          
          return (
            <div key={index} className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm font-medium">{entry.dataKey}</span>
              </div>
              <div className="text-sm text-muted-foreground ml-5">
                <div>Value: {entry.value} {testResult?.unit}</div>
                <div>Range: {testResult?.referenceRange}</div>
                <div>
                  Status: 
                  <Badge 
                    variant={testResult?.status === "normal" ? "outline" : "secondary"}
                    className="ml-1 text-xs"
                  >
                    {testResult?.status?.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const selectedGroup = testGroups[selectedTestGroup as keyof typeof testGroups]

  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          <h3 className="font-medium">Lab Test Trends</h3>
        </div>
        
        <Select value={selectedTestGroup} onValueChange={setSelectedTestGroup}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(testGroups).map(([key, group]) => (
              <SelectItem key={key} value={key}>
                {group.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {chartData.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No trend data available for {selectedGroup.name}</p>
            <p className="text-sm">Need multiple test dates to show trends</p>
          </div>
        </div>
      ) : (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              {selectedGroup.tests.map((testName, index) => (
                <Line 
                  key={testName}
                  type="monotone" 
                  dataKey={testName} 
                  stroke={selectedGroup.colors[index]} 
                  strokeWidth={2}
                  dot={{ fill: selectedGroup.colors[index], strokeWidth: 2, r: 4 }}
                  connectNulls={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      
      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
        <div className="flex items-start gap-2">
          <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium">Chart Information:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Shows trends over time for {selectedGroup.name} tests</li>
              <li>Hover over data points to see detailed values and reference ranges</li>
              <li>Colors indicate different test parameters within the group</li>
            </ul>
          </div>
        </div>
      </div>
    </Card>
  )
}