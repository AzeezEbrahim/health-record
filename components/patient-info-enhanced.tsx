"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { 
  User, 
  Pill, 
  Edit,
  Phone
} from "lucide-react"
import type { Patient, Study } from "@/lib/types"

interface PatientInfoProps {
  patient: Patient
  studies: Study[]
  onEditPatient?: () => void
}

export function PatientInfoEnhanced({ patient, studies, onEditPatient, className }: PatientInfoProps & { className?: string }) {
  
  // Calculate patient age from DOB
  const calculateAge = (dob: string) => {
    try {
      const birthDate = new Date(dob.split('/').reverse().join('-'))
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        return age - 1
      }
      return age
    } catch {
      return 'Unknown'
    }
  }

  const patientAge = calculateAge(patient.dob)

  // Current medications (updated with patient's actual medications)
  const currentMedications = [
    { name: "Pantozol", dose: "40mg", frequency: "Once daily", indication: "Acid reflux/GERD" },
    { name: "Azera", dose: "100mg", frequency: "Once daily", indication: "Blood pressure" },
    { name: "Betaserc", dose: "24mg", frequency: "Twice daily", indication: "Vertigo/Dizziness" },
    { name: "Ravixa", dose: "75mg", frequency: "Once daily", indication: "Antiplatelet therapy" },
    { name: "Exforge", dose: "170mg", frequency: "Once daily", indication: "Blood pressure combination" },
    { name: "Astatix", dose: "80mg", frequency: "Once daily", indication: "Cholesterol" }
  ]

  // Emergency contacts
  const emergencyContacts = [
    {
      name: "Safwan Hamid Ahmed Ibrahim",
      number: "+966549246579"
    }
  ]

  // Medical conditions removed as requested

  const patientDescription = `${patientAge}-year-old patient with a history of four cerebrovascular accidents (strokes). The first event occurred in 2018 and involved both an infarct and hemorrhage in the left hemisphere, requiring neurosurgical intervention at King Abdulaziz Hospital. The second stroke occurred in April 2025, also affecting the left side of the brain, after which the patient was started on apixaban. The third stroke took place in July 2025, involving the cerebellum and brainstem, and at that time aspirin was added to apixaban. One month later, following a physician's recommendation, apixaban was discontinued; however, within five days, the patient suffered a fourth stroke. Consequently, the patient was switched to dual antiplatelet therapy with Ravixa and aspirin, and apixaban was not resumed.`

  return (
    <Card className={`p-3 h-full flex flex-col ${className || ''}`}>
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-medium">Patient Information</h2>
        </div>
        {onEditPatient && (
          <Button variant="ghost" size="sm" onClick={onEditPatient} className="h-7 px-2">
            <Edit className="h-3 w-3" />
          </Button>
        )}
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto">
        {/* Basic Patient Details */}
        <div className="space-y-2">
          <div>
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Name</span>
            <p className="font-medium text-sm text-pretty">Hamid Ahmed Ibrahim</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Age</span>
              <p className="font-medium text-sm">{patientAge} years</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Weight</span>
              <p className="font-medium text-sm">78 kg</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Height</span>
              <p className="font-medium text-sm">164 cm</p>
            </div>
            {patient.mrn && (
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wide">MRN</span>
                <p className="font-medium text-sm">{patient.mrn}</p>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Emergency Contact */}
        <div>
          <span className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">Emergency Contact</span>
          <div className="space-y-2">
            {emergencyContacts.map((contact, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-muted/50 rounded p-1.5">
                <Phone className="h-3 w-3 text-muted-foreground" />
                <div className="flex flex-col flex-1">
                  <span className="text-xs font-medium">{contact.name}</span>
                  <a 
                    href={`tel:${contact.number}`}
                    className="text-xs text-blue-600 hover:text-blue-800 hover:underline transition-colors cursor-pointer"
                    title="Click to dial"
                  >
                    {contact.number}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Patient Description */}
        <div>
          <span className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">Clinical Summary</span>
          <div className="text-xs text-muted-foreground leading-relaxed space-y-1">
            <p className="font-medium">66-year-old patient with history of four cerebrovascular accidents (strokes):</p>
            <ul className="space-y-1 ml-2">
              <li className="flex items-start">
                <span className="text-muted-foreground mr-2">•</span>
                <span><strong>2018:</strong> First stroke - infarct and hemorrhage in left hemisphere, required neurosurgical intervention at King Abdulaziz Hospital</span>
              </li>
              <li className="flex items-start">
                <span className="text-muted-foreground mr-2">•</span>
                <span><strong>April 2025:</strong> Second stroke - left side of brain, started on apixaban</span>
              </li>
              <li className="flex items-start">
                <span className="text-muted-foreground mr-2">•</span>
                <span><strong>July 2025:</strong> Third stroke - cerebellum and brainstem, aspirin added to apixaban</span>
              </li>
              <li className="flex items-start">
                <span className="text-muted-foreground mr-2">•</span>
                <span><strong>August 2025:</strong> Fourth stroke - occurred 5 days after apixaban discontinuation</span>
              </li>
            </ul>
            <p className="font-medium mt-2">Current treatment: Dual antiplatelet therapy with Ravixa and aspirin (apixaban discontinued)</p>
          </div>
        </div>

        <Separator />

        {/* Current Medications */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Pill className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Current Medications</span>
          </div>
          <div className="space-y-2">
            {currentMedications.map((med, index) => (
              <div key={index} className="bg-muted/50 rounded p-1.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium">{med.name}</span>
                  <Badge variant="outline" className="text-xs">{med.dose}</Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  {med.frequency} • {med.indication}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Edit Instructions */}

    </Card>
  )
}