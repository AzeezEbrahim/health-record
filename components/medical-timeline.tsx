"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Calendar, 
  Activity, 
  Stethoscope, 
  TestTube, 
  FileText,
  TrendingUp,
  AlertTriangle
} from "lucide-react"
import type { Study, LabResult, VitalSigns, MedicalRecord } from "@/lib/types"

interface MedicalTimelineProps {
  studies: Study[]
  labResults?: LabResult[]
  vitalSigns?: VitalSigns[]
  className?: string
}

export function MedicalTimeline({ 
  studies, 
  labResults = [], 
  vitalSigns = [], 
  className 
}: MedicalTimelineProps) {
  // Combine all medical records into timeline
  const timelineItems: MedicalRecord[] = [
    ...studies.map(study => ({
      id: study.accession,
      patientId: "current",
      date: study.date,
      type: "imaging" as const,
      title: study.description,
      description: `${study.type} Study`,
      data: study,
      attachments: study.reportFile ? [study.reportFile] : undefined
    })),
    ...labResults.map(lab => ({
      id: lab.id,
      patientId: "current",
      date: lab.date,
      type: "lab" as const,
      title: lab.testName,
      description: `${lab.value} ${lab.unit} (${lab.status})`,
      data: lab
    })),
    ...vitalSigns.map(vital => ({
      id: vital.id,
      patientId: "current", 
      date: vital.date,
      type: "vital" as const,
      title: "Vital Signs",
      description: vital.bloodPressure ? 
        `BP: ${vital.bloodPressure.systolic}/${vital.bloodPressure.diastolic}` : 
        "Routine vitals",
      data: vital
    }))
  ]

  // Sort by date (newest first)
  timelineItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const getIcon = (type: MedicalRecord["type"]) => {
    switch (type) {
      case "imaging": return <Activity className="h-4 w-4" />
      case "lab": return <TestTube className="h-4 w-4" />
      case "vital": return <Stethoscope className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getBadgeVariant = (type: MedicalRecord["type"]) => {
    switch (type) {
      case "imaging": return "default"
      case "lab": return "secondary"
      case "vital": return "outline"
      default: return "outline"
    }
  }

  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-4 w-4" />
        <h3 className="font-medium">Medical Timeline</h3>
        <Badge variant="secondary" className="text-xs">
          {timelineItems.length} Records
        </Badge>
      </div>

      <div className="space-y-4 max-h-[500px] overflow-y-auto">
        {timelineItems.map((item, index) => (
          <div key={item.id} className="relative">
            {/* Timeline connector */}
            {index < timelineItems.length - 1 && (
              <div className="absolute left-5 top-8 w-px h-4 bg-border" />
            )}
            
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="flex-shrink-0 w-10 h-10 rounded-full border bg-background flex items-center justify-center">
                {getIcon(item.type)}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={getBadgeVariant(item.type)} className="text-xs">
                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{item.date}</span>
                </div>
                
                <h4 className="text-sm font-medium text-foreground line-clamp-1">
                  {item.title}
                </h4>
                
                {item.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {item.description}
                  </p>
                )}

                {/* Special handling for lab results */}
                {item.type === "lab" && item.data && (
                  <div className="flex items-center gap-1 mt-1">
                    {(item.data as LabResult).status === "critical" && (
                      <AlertTriangle className="h-3 w-3 text-destructive" />
                    )}
                    {(item.data as LabResult).status === "abnormal" && (
                      <TrendingUp className="h-3 w-3 text-orange-500" />
                    )}
                    <span className={`text-xs ${
                      (item.data as LabResult).status === "critical" ? "text-destructive" :
                      (item.data as LabResult).status === "abnormal" ? "text-orange-500" :
                      "text-green-600"
                    }`}>
                      {(item.data as LabResult).status.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {index < timelineItems.length - 1 && <Separator className="mt-4" />}
          </div>
        ))}

        {timelineItems.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No medical records found</p>
          </div>
        )}
      </div>
    </Card>
  )
}