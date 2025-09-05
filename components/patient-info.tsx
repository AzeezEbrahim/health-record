import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Calendar, Hash, FileText } from "lucide-react"
import type { Patient, Study } from "@/lib/types"

interface PatientInfoProps {
  patient: Patient
  studies: Study[]
}

export function PatientInfo({ patient, studies }: PatientInfoProps) {
  const totalImages = studies.reduce((sum, study) => sum + (study.imageCount || 0), 0)
  const modalityCount = new Set(studies.map((study) => study.type)).size

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <User className="h-4 w-4 text-muted-foreground" />
        <h2 className="font-medium">Patient Information</h2>
      </div>

      <div className="space-y-3">
        {/* Patient Details */}
        <div className="space-y-2">
          <div>
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Name</span>
            <p className="font-medium text-sm text-pretty">{patient.name}</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wide">DOB</span>
              <p className="font-medium text-sm">{patient.dob}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wide">ID</span>
              <p className="font-medium text-sm">{patient.id}</p>
            </div>
          </div>

          {patient.mrn && (
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wide">MRN</span>
              <p className="font-medium text-sm">{patient.mrn}</p>
            </div>
          )}
        </div>

        {/* Study Statistics */}
        <div className="pt-3 border-t">
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1">
                <FileText className="h-3 w-3 text-muted-foreground" />
                <span className="text-lg font-semibold">{studies.length}</span>
              </div>
              <p className="text-xs text-muted-foreground">Studies</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1">
                <Hash className="h-3 w-3 text-muted-foreground" />
                <span className="text-lg font-semibold">{totalImages}</span>
              </div>
              <p className="text-xs text-muted-foreground">Images</p>
            </div>
          </div>
        </div>

        {/* Modality Badges */}
        <div className="pt-3 border-t">
          <span className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">Modalities</span>
          <div className="flex flex-wrap gap-1">
            {Array.from(new Set(studies.map((study) => study.type))).map((modality) => (
              <Badge key={modality} variant="secondary" className="text-xs">
                {modality}
              </Badge>
            ))}
          </div>
        </div>

        {/* Date Range */}
        <div className="pt-3 border-t">
          <div className="flex items-center gap-1 mb-1">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Study Period</span>
          </div>
          {studies.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {studies[studies.length - 1].date} - {studies[0].date}
            </p>
          )}
        </div>
      </div>
    </Card>
  )
}
