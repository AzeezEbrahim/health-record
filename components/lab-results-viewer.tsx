"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  TestTube, 
  TrendingUp, 
  TrendingDown,
  Minus,
  AlertTriangle,
  Plus,
  Download,
  Heart
} from "lucide-react"
import type { LabResult } from "@/lib/types"

interface LabResultsViewerProps {
  labResults: LabResult[]
  className?: string
  onAddResult?: () => void
}

export function LabResultsViewer({ 
  labResults, 
  className, 
  onAddResult 
}: LabResultsViewerProps) {
  const [activeTab, setActiveTab] = useState("all")
  const getStatusIcon = (status: LabResult["status"]) => {
    switch (status) {
      case "critical": return <AlertTriangle className="h-3 w-3 text-destructive" />
      case "abnormal": return <TrendingUp className="h-3 w-3 text-orange-500" />
      default: return <Minus className="h-3 w-3 text-green-600" />
    }
  }

  const getStatusColor = (status: LabResult["status"]) => {
    switch (status) {
      case "critical": return "text-destructive"
      case "abnormal": return "text-orange-500"
      default: return "text-green-600"
    }
  }

  // Group by date
  const groupedResults = labResults.reduce((groups, result) => {
    const date = result.date
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(result)
    return groups
  }, {} as Record<string, LabResult[]>)

  const sortedDates = Object.keys(groupedResults).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  )

  // Sample lab results for demonstration
  const sampleResults: LabResult[] = [
    {
      id: "lab_001",
      date: "15/08/2025",
      testName: "Total Cholesterol (Lipid Panel)",
      value: "220",
      unit: "mg/dL",
      referenceRange: "< 200",
      status: "abnormal",
      notes: "Slightly elevated, recommend dietary changes"
    },
    {
      id: "lab_002", 
      date: "14/08/2025",
      testName: "HDL Cholesterol (Good Cholesterol)",
      value: "45",
      unit: "mg/dL",
      referenceRange: "> 40",
      status: "normal"
    },
    {
      id: "lab_003",
      date: "14/08/2025", 
      testName: "LDL Cholesterol (Bad Cholesterol)",
      value: "150",
      unit: "mg/dL",
      referenceRange: "< 100",
      status: "abnormal",
      notes: "Elevated, consider medication"
    },
    {
      id: "lab_004",
      date: "13/08/2025",
      testName: "Triglycerides (Blood Fats)",
      value: "180",
      unit: "mg/dL",
      referenceRange: "< 150",
      status: "abnormal",
      notes: "Mildly elevated"
    },
    {
      id: "lab_005",
      date: "13/08/2025",
      testName: "Fasting Blood Glucose",
      value: "95",
      unit: "mg/dL",
      referenceRange: "70-100",
      status: "normal"
    },
    {
      id: "lab_006",
      date: "12/08/2025",
      testName: "Serum Creatinine (Kidney Function)",
      value: "1.1",
      unit: "mg/dL",
      referenceRange: "0.8-1.3",
      status: "normal"
    },
    {
      id: "lab_007",
      date: "12/08/2025",
      testName: "Blood Urea Nitrogen (BUN)",
      value: "18",
      unit: "mg/dL",
      referenceRange: "7-25",
      status: "normal"
    },
    {
      id: "lab_008",
      date: "11/08/2025",
      testName: "Hemoglobin (Oxygen Carrier)",
      value: "14.5",
      unit: "g/dL",
      referenceRange: "13.5-16.5",
      status: "normal"
    },
    {
      id: "lab_009",
      date: "11/08/2025",
      testName: "White Blood Cell Count (Immune System)",
      value: "7500",
      unit: "/µL",
      referenceRange: "4500-11000",
      status: "normal"
    },
    {
      id: "lab_010",
      date: "10/08/2025",
      testName: "Platelet Count (Blood Clotting)",
      value: "250000",
      unit: "/µL",
      referenceRange: "150000-450000",
      status: "normal"
    }
  ]

  // Sample BP results for BP tab
  const sampleBPResults: LabResult[] = [
    {
      id: "bp_001",
      date: "15/08/2025",
      testName: "Blood Pressure",
      value: "140/90",
      unit: "mmHg",
      referenceRange: "< 120/80",
      status: "abnormal",
      notes: "Stage 1 hypertension"
    },
    {
      id: "bp_002",
      date: "10/08/2025",
      testName: "Blood Pressure",
      value: "138/88",
      unit: "mmHg",
      referenceRange: "< 120/80",
      status: "abnormal",
      notes: "Stage 1 hypertension"
    },
    {
      id: "bp_003",
      date: "05/08/2025",
      testName: "Blood Pressure",
      value: "142/92",
      unit: "mmHg",
      referenceRange: "< 120/80",
      status: "abnormal",
      notes: "Stage 1 hypertension"
    },
    {
      id: "bp_004",
      date: "01/08/2025",
      testName: "Blood Pressure",
      value: "135/85",
      unit: "mmHg",
      referenceRange: "< 120/80",
      status: "abnormal",
      notes: "Stage 1 hypertension"
    }
  ]

  const displayResults = labResults.length > 0 ? groupedResults : 
    sampleResults.reduce((groups, result) => {
      if (!groups[result.date]) groups[result.date] = []
      groups[result.date].push(result)
      return groups
    }, {} as Record<string, LabResult[]>)

  const displayDates = labResults.length > 0 ? sortedDates :
    Object.keys(displayResults).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  const bpResults = sampleBPResults.reduce((groups, result) => {
    if (!groups[result.date]) groups[result.date] = []
    groups[result.date].push(result)
    return groups
  }, {} as Record<string, LabResult[]>)

  const bpDates = Object.keys(bpResults).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  const renderResults = (results: Record<string, LabResult[]>, dates: string[], isDemo = false) => (
    <div className="h-full overflow-hidden">
      <div className="h-full overflow-y-auto space-y-3 pr-2">
        {dates.map((date, dateIndex) => (
          <div key={date}>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">{date}</Badge>
            </div>
            
            <div className="space-y-2 ml-2">
              {results[date].map((result) => (
                <div key={result.id} className="p-2 rounded-md bg-muted/50 border">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(result.status)}
                      <span className="text-sm font-medium">{result.testName}</span>
                      <span className="text-xs text-muted-foreground">({result.date})</span>
                    </div>
                    <Badge 
                      variant={result.status === "normal" ? "outline" : "secondary"} 
                      className={`text-xs ${getStatusColor(result.status)}`}
                    >
                      {result.status.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {result.value} {result.unit}
                    </span>
                    <span>Range: {result.referenceRange}</span>
                  </div>
                  
                  {result.notes && (
                    <p className="text-xs text-muted-foreground mt-1 italic">
                      {result.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
            
            {dateIndex < dates.length - 1 && <Separator className="mt-3" />}
          </div>
        ))}

        {isDemo && (
          <div className="text-center text-muted-foreground py-4">
            <p className="text-xs">Showing sample lab results for demonstration</p>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <Card className={`p-4 flex flex-col overflow-hidden ${className}`}>
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <TestTube className="h-4 w-4" />
          <h3 className="font-medium">Lab Results</h3>
        </div>
        
        <div className="flex items-center gap-1">
          {onAddResult && (
            <Button variant="outline" size="sm" onClick={onAddResult} className="h-7 px-2 bg-transparent">
              <Plus className="h-3 w-3 mr-1" />
              Add
            </Button>
          )}
          <Button variant="outline" size="sm" className="h-7 px-2 bg-transparent">
            <Download className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <TabsList className="grid grid-cols-2 w-full mb-3 flex-shrink-0">
          <TabsTrigger value="all" className="flex items-center gap-1">
            <TestTube className="h-3 w-3" />
            All Labs
            <Badge variant="secondary" className="text-xs ml-1">
              {labResults.length || sampleResults.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="bp" className="flex items-center gap-1">
            <Heart className="h-3 w-3" />
            BP Results
            <Badge variant="secondary" className="text-xs ml-1">
              {sampleBPResults.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="flex-1 min-h-0 overflow-hidden">
          {renderResults(displayResults, displayDates, labResults.length === 0)}
        </TabsContent>

        <TabsContent value="bp" className="flex-1 min-h-0 overflow-hidden">
          {renderResults(bpResults, bpDates, true)}
        </TabsContent>
      </Tabs>
    </Card>
  )
}