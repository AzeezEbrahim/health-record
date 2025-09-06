"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Heart, 
  TrendingUp, 
  TrendingDown,
  Minus,
  AlertTriangle,
  Plus,
  Download,
  Activity,
  Stethoscope,
  FileText
} from "lucide-react"
import type { EchoReport, EchoMeasurement } from "@/lib/types"

interface EchoReportViewerProps {
  echoReports: EchoReport[]
  className?: string
  onAddReport?: () => void
}

export function EchoReportViewer({ 
  echoReports, 
  className, 
  onAddReport 
}: EchoReportViewerProps) {
  const [activeTab, setActiveTab] = useState("measurements")

  const getStatusIcon = (status: EchoMeasurement["status"]) => {
    switch (status) {
      case "abnormal": return <TrendingUp className="h-3 w-3 text-orange-500" />
      case "normal": return <Minus className="h-3 w-3 text-green-600" />
      default: return <Minus className="h-3 w-3 text-gray-400" />
    }
  }

  const getStatusColor = (status: EchoMeasurement["status"]) => {
    switch (status) {
      case "abnormal": return "text-orange-500"
      case "normal": return "text-green-600"
      default: return "text-gray-400"
    }
  }

  // Sample echo report data based on the provided report
  const sampleEchoReport: EchoReport = {
    id: "echo_001",
    date: "30/08/2025",
    patientId: "623276",
    hospital: "DR.BAKHSH HOSPITAL",
    cardiologist: "Dr. AGAMAL",
    ejectionFraction: 64,
    lvFunction: "Good global LV systolic function",
    measurements: [
      {
        parameter: "Aortic Root Diameter",
        normalRange: "2.0-3.6",
        patientValue: "2.2",
        unit: "cm",
        status: "normal"
      },
      {
        parameter: "Left Atrium",
        normalRange: "1.9-4.0",
        patientValue: "3.1",
        unit: "cm",
        status: "normal"
      },
      {
        parameter: "Left Ventricle E-D",
        normalRange: "3.5-5.7",
        patientValue: "5.7",
        unit: "cm",
        status: "normal"
      },
      {
        parameter: "Left Ventricle E-S",
        normalRange: "2.6-3.4",
        patientValue: "3.6",
        unit: "cm",
        status: "abnormal"
      },
      {
        parameter: "Septum E-D",
        normalRange: "0.6-1.1",
        patientValue: "1.1",
        unit: "cm",
        status: "normal"
      },
      {
        parameter: "LV Post, Wall E-D",
        normalRange: "0.6-1.1",
        patientValue: "1.0",
        unit: "cm",
        status: "normal"
      },
      {
        parameter: "L.V Function Ej. Fraction",
        normalRange: "53-77",
        patientValue: "64",
        unit: "%",
        status: "normal"
      },
      {
        parameter: "Fr. Shortening",
        normalRange: "25-42",
        patientValue: "35",
        unit: "%",
        status: "normal"
      }
    ],
    remarks: [
      "Mild Concentric LVH with Normal LV dimensions with good global LV systolic function EF = 64%",
      "No RWMA could be detected at rest (Not exclude CAD)",
      "LV diastolic dysfunction Grade I",
      "Normal LA and Aortic root diameters. Pt is in sinus rhythm",
      "Sclerotic Mitral valve leaflets with mild mitral regurge (Grade I/IV)",
      "Sclerotic Aortic valve without significant gradient across it",
      "Mild Tricuspid regurge (Grade I/IV) with PASP = 40 mmHG",
      "Normal RT side of heart with good RV systolic function",
      "No intra cardiac masses nor thrombi - Intact cardiac septae - Normal pericardium"
    ],
    conclusion: [
      "Mild LVH, Normal LV dimensions, function EF = 66%",
      "LV diastolic dysfunction Grade I",
      "Mild Tricuspid regurge (Grade I/IV) with PASP = 40 mmHG",
      "Mild MR."
    ]
  }

  const displayReports = echoReports.length > 0 ? echoReports : [sampleEchoReport]

  const renderMeasurements = (report: EchoReport) => (
    <div className="h-full overflow-hidden">
      <div className="h-full overflow-y-auto space-y-4 pr-2 pb-4">
        {/* Summary Card */}
        <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-full bg-blue-100">
              <Heart className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-blue-900">Cardiac Function Summary</h4>
              <p className="text-sm text-blue-700">Echocardiography Report - {report.date}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-800">{report.ejectionFraction}%</div>
              <div className="text-xs text-blue-600">Ejection Fraction</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-blue-800">Normal</div>
              <div className="text-xs text-blue-600">LV Function</div>
            </div>
          </div>
        </div>

        {/* Measurements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {report.measurements.map((measurement, index) => (
            <div key={index} className="p-4 rounded-lg bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getStatusIcon(measurement.status)}
                  <span className="text-sm font-semibold text-gray-800">{measurement.parameter}</span>
                </div>
                <Badge 
                  variant={measurement.status === "normal" ? "outline" : "secondary"} 
                  className={`text-xs font-medium ${getStatusColor(measurement.status)}`}
                >
                  {measurement.status === "normal" ? "✓ Normal" : measurement.status === "abnormal" ? "⚠ Abnormal" : "— Not Measured"}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-xs font-medium text-gray-600">Patient Value</span>
                  <span className="font-bold text-gray-900">
                    {measurement.patientValue} {measurement.unit}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                  <span className="text-xs font-medium text-blue-600">Normal Range</span>
                  <span className="text-sm font-medium text-blue-800">
                    {measurement.normalRange} {measurement.unit}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderClinicalFindings = (report: EchoReport) => (
    <div className="h-full overflow-hidden">
      <div className="h-full overflow-y-auto space-y-6 pr-2 pb-4">
        {/* Key Findings */}
        <div className="p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
          <h4 className="text-lg font-semibold mb-3 flex items-center gap-2 text-green-800">
            <Activity className="h-5 w-5" />
            Key Findings
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-white border border-green-200 shadow-sm">
              <div className="text-sm font-medium text-green-700 mb-1">Ejection Fraction</div>
              <div className="text-3xl font-bold text-green-800">{report.ejectionFraction}%</div>
              <div className="text-xs text-green-600 mt-1">{report.lvFunction}</div>
            </div>
            <div className="p-4 rounded-lg bg-white border border-green-200 shadow-sm">
              <div className="text-sm font-medium text-green-700 mb-1">Overall Assessment</div>
              <div className="text-lg font-semibold text-green-800">Mild LVH</div>
              <div className="text-xs text-green-600 mt-1">Normal LV dimensions</div>
            </div>
          </div>
        </div>

        {/* Clinical Remarks */}
        <div>
          <h4 className="text-lg font-semibold mb-3 flex items-center gap-2 text-blue-800">
            <Stethoscope className="h-5 w-5" />
            Clinical Remarks
          </h4>
          <div className="space-y-3">
            {report.remarks.map((remark, index) => (
              <div key={index} className="p-4 rounded-lg bg-white border border-gray-200 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700 leading-relaxed">{remark}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Conclusion */}
        <div>
          <h4 className="text-lg font-semibold mb-3 flex items-center gap-2 text-orange-800">
            <FileText className="h-5 w-5" />
            Conclusion
          </h4>
          <div className="space-y-3">
            {report.conclusion.map((conclusion, index) => (
              <div key={index} className="p-4 rounded-lg bg-orange-50 border border-orange-200 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-orange-800 font-medium leading-relaxed">{conclusion}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendation */}
        {report.recommendation && (
          <div>
            <h4 className="text-lg font-semibold mb-3 text-green-800">Recommendation</h4>
            <div className="p-4 rounded-lg bg-green-50 border border-green-200 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                <p className="text-sm text-green-800 leading-relaxed">{report.recommendation}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <Card className={`p-4 flex flex-col overflow-hidden ${className}`}>
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Heart className="h-4 w-4" />
          <h3 className="font-medium">Echocardiography Reports</h3>
        </div>
        
        <div className="flex items-center gap-1">
          {onAddReport && (
            <Button variant="outline" size="sm" onClick={onAddReport} className="h-7 px-2 bg-transparent">
              <Plus className="h-3 w-3 mr-1" />
              Add
            </Button>
          )}

        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <TabsList className="grid grid-cols-2 w-full mb-3 flex-shrink-0">
          <TabsTrigger value="measurements" className="flex items-center gap-1">
            <Activity className="h-3 w-3" />
            Measurements
            <Badge variant="secondary" className="text-xs ml-1">
              {displayReports[0]?.measurements.length || 0}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="findings" className="flex items-center gap-1">
            <Stethoscope className="h-3 w-3" />
            Clinical Findings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="measurements" className="flex-1 min-h-0 overflow-hidden">
          {displayReports.map((report) => (
            <div key={report.id} className="h-full flex flex-col">
              <div className="flex items-center gap-2 mb-3 flex-shrink-0">
                <Badge variant="outline" className="text-xs">{report.date}</Badge>
                <span className="text-xs text-muted-foreground">
                  {report.hospital} • {report.cardiologist}
                </span>
              </div>
              <div className="flex-1 min-h-0">
                {renderMeasurements(report)}
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="findings" className="flex-1 min-h-0 overflow-hidden">
          {displayReports.map((report) => (
            <div key={report.id} className="h-full flex flex-col">
              <div className="flex items-center gap-2 mb-3 flex-shrink-0">
                <Badge variant="outline" className="text-xs">{report.date}</Badge>
                <span className="text-xs text-muted-foreground">
                  {report.hospital} • {report.cardiologist}
                </span>
              </div>
              <div className="flex-1 min-h-0">
                {renderClinicalFindings(report)}
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </Card>
  )
}
