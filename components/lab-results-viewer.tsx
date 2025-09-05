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

  // Actual lab results from patient data - Multiple dates
  const sampleResults: LabResult[] = [
    // Results from 30/04/2025 (April 30, 2025) - WORST cholesterol results
    {
      id: "lab_001_april",
      date: "30/04/2025",
      testName: "CHOLESTEROL-TOTAL",
      value: "4.62",
      unit: "mmol/L",
      referenceRange: "2.7 - 5.2",
      status: "normal"
    },
    {
      id: "lab_002_april", 
      date: "30/04/2025",
      testName: "TRIGLYCERIDES",
      value: "1.35",
      unit: "mmol/L",
      referenceRange: "1 - 1.69",
      status: "normal"
    },
    {
      id: "lab_003_april",
      date: "30/04/2025", 
      testName: "HDL-CHOLESTEROL",
      value: "1.00",
      unit: "mmol/L",
      referenceRange: "1.55 - 2",
      status: "abnormal",
      notes: "Below normal range"
    },
    {
      id: "lab_004_april",
      date: "30/04/2025",
      testName: "LDL-CHOLESTEROL",
      value: "3.00",
      unit: "mmol/L",
      referenceRange: "1 - 2.6",
      status: "abnormal",
      notes: "Above normal range - WORST"
    },
    // Results from 18/07/2025 (July 18, 2025) - Better results
    {
      id: "lab_005_july",
      date: "18/07/2025",
      testName: "CHOLESTEROL-TOTAL",
      value: "3.96",
      unit: "mmol/L",
      referenceRange: "2.7 - 5.2",
      status: "normal"
    },
    {
      id: "lab_006_july", 
      date: "18/07/2025",
      testName: "TRIGLYCERIDES",
      value: "0.77",
      unit: "mmol/L",
      referenceRange: "1 - 1.69",
      status: "abnormal",
      notes: "Below normal range"
    },
    {
      id: "lab_007_july",
      date: "18/07/2025", 
      testName: "HDL-CHOLESTEROL",
      value: "1.34",
      unit: "mmol/L",
      referenceRange: "1.55 - 2",
      status: "abnormal",
      notes: "Below normal range"
    },
    {
      id: "lab_008_july",
      date: "18/07/2025",
      testName: "LDL-CHOLESTEROL",
      value: "2.27",
      unit: "mmol/L",
      referenceRange: "1 - 2.6",
      status: "normal"
    },
    // Results from 29/08/2025 (August 29, 2025)
    // Lipid Panel
    {
      id: "lab_001",
      date: "29/08/2025",
      testName: "CHOLESTEROL-TOTAL",
      value: "2.61",
      unit: "mmol/L",
      referenceRange: "2.7 - 5.2",
      status: "abnormal",
      notes: "Below normal range"
    },
    {
      id: "lab_002", 
      date: "29/08/2025",
      testName: "TRIGLYCERIDES",
      value: "1.17",
      unit: "mmol/L",
      referenceRange: "1 - 1.69",
      status: "normal"
    },
    {
      id: "lab_003",
      date: "29/08/2025", 
      testName: "HDL-CHOLESTEROL",
      value: "0.88",
      unit: "mmol/L",
      referenceRange: "1.55 - 2",
      status: "abnormal",
      notes: "Below normal range"
    },
    {
      id: "lab_004",
      date: "29/08/2025",
      testName: "LDL-CHOLESTEROL",
      value: "1.20",
      unit: "mmol/L",
      referenceRange: "1 - 2.6",
      status: "normal"
    },
    {
      id: "lab_005",
      date: "29/08/2025",
      testName: "GLYCATED HB1",
      value: "5.7",
      unit: "%",
      referenceRange: "4 - 5.7",
      status: "normal"
    },
    // Kidney Function
    {
      id: "lab_006",
      date: "29/08/2025",
      testName: "CREATININE",
      value: "68.7",
      unit: "µmol/L",
      referenceRange: "50 - 110",
      status: "normal"
    },
    {
      id: "lab_007",
      date: "29/08/2025",
      testName: "BUN",
      value: "4.2",
      unit: "mmol/L",
      referenceRange: "3.14 - 7.14",
      status: "normal"
    },
    // Thyroid Function
    {
      id: "lab_008",
      date: "29/08/2025",
      testName: "TSH ARCHI 4",
      value: "1.25",
      unit: "mIU/L",
      referenceRange: "3 - 4.5",
      status: "abnormal",
      notes: "Below normal range"
    },
    // Cardiac Enzymes
    {
      id: "lab_009",
      date: "29/08/2025",
      testName: "CK VITROS1",
      value: "83",
      unit: "U/L",
      referenceRange: "55 - 170",
      status: "normal"
    },
    // Electrolytes
    {
      id: "lab_010",
      date: "29/08/2025",
      testName: "SODIUM1",
      value: "143",
      unit: "mmol/L",
      referenceRange: "136 - 145",
      status: "normal"
    },
    {
      id: "lab_011",
      date: "29/08/2025",
      testName: "POTASSIUM1",
      value: "3.8",
      unit: "mmol/L",
      referenceRange: "3.5 - 5.1",
      status: "normal"
    },
    // Complete Blood Count
    {
      id: "lab_012",
      date: "29/08/2025",
      testName: "WBC CBC2",
      value: "6.60",
      unit: "×10³/µL",
      referenceRange: "4.5 - 11",
      status: "normal"
    },
    {
      id: "lab_013",
      date: "29/08/2025",
      testName: "RBC CBC2",
      value: "4.42",
      unit: "×10⁶/µL",
      referenceRange: "4.5 - 5.9",
      status: "abnormal",
      notes: "Slightly below normal"
    },
    {
      id: "lab_014",
      date: "29/08/2025",
      testName: "HB CBC2",
      value: "13.4",
      unit: "g/dL",
      referenceRange: "13.5 - 17.5",
      status: "abnormal",
      notes: "Slightly below normal"
    },
    {
      id: "lab_015",
      date: "29/08/2025",
      testName: "PCV CBC2",
      value: "37.1",
      unit: "%",
      referenceRange: "41 - 53",
      status: "abnormal",
      notes: "Below normal range"
    },
    {
      id: "lab_016",
      date: "29/08/2025",
      testName: "MCV CBC2",
      value: "83.9",
      unit: "fL",
      referenceRange: "80 - 100",
      status: "normal"
    },
    {
      id: "lab_017",
      date: "29/08/2025",
      testName: "MCH CBC2",
      value: "30.3",
      unit: "pg",
      referenceRange: "26 - 34",
      status: "normal"
    },
    {
      id: "lab_018",
      date: "29/08/2025",
      testName: "MCHC CBC2",
      value: "36.1",
      unit: "g/dL",
      referenceRange: "31 - 37",
      status: "normal"
    },
    {
      id: "lab_019",
      date: "29/08/2025",
      testName: "PLATELET CBC2",
      value: "335",
      unit: "×10³/µL",
      referenceRange: "130 - 400",
      status: "normal"
    },
    {
      id: "lab_020",
      date: "29/08/2025",
      testName: "NEUTROPHIL SEGMENTED CBCD",
      value: "49.4",
      unit: "%",
      referenceRange: "35 - 65",
      status: "normal"
    },
    {
      id: "lab_021",
      date: "29/08/2025",
      testName: "LYMPHOCYTES",
      value: "39.7",
      unit: "%",
      referenceRange: "20 - 45",
      status: "normal"
    },
    {
      id: "lab_022",
      date: "29/08/2025",
      testName: "MONOCYTES CBCD2",
      value: "8.3",
      unit: "%",
      referenceRange: "3 - 10",
      status: "normal"
    },
    {
      id: "lab_023",
      date: "29/08/2025",
      testName: "EOSINOPHILS CBCD2",
      value: "2.0",
      unit: "%",
      referenceRange: "0 - 6",
      status: "normal"
    },
    {
      id: "lab_024",
      date: "29/08/2025",
      testName: "BASOPHILS CBCD2",
      value: "0.6",
      unit: "%",
      referenceRange: "0 - 2",
      status: "normal"
    },
    {
      id: "lab_025",
      date: "29/08/2025",
      testName: "RDW",
      value: "12.6",
      unit: "%",
      referenceRange: "12.2 - 16.1",
      status: "normal"
    },
    // Coagulation Studies
    {
      id: "lab_026",
      date: "29/08/2025",
      testName: "PT2",
      value: "13.0",
      unit: "sec",
      referenceRange: "10 - 14",
      status: "normal"
    },
    {
      id: "lab_027",
      date: "29/08/2025",
      testName: "INR2",
      value: "1.14",
      unit: "ratio",
      referenceRange: "1.2 - 8",
      status: "abnormal",
      notes: "Slightly below normal"
    },
    {
      id: "lab_028",
      date: "29/08/2025",
      testName: "PTT2",
      value: "30.8",
      unit: "sec",
      referenceRange: "26 - 42",
      status: "normal"
    },
    {
      id: "lab_029",
      date: "29/08/2025",
      testName: "D-DIMER2",
      value: "0.414",
      unit: "mg/L",
      referenceRange: "0 - 0.5",
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