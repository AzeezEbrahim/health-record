"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { PatientInfo } from "@/components/patient-info"
import { StudyBrowser } from "@/components/study-browser"
import { Menu, User, Calendar } from "lucide-react"
import type { MedicalData, Study } from "@/lib/types"

interface MobileNavigationProps {
  medicalData: MedicalData
  selectedStudy: Study | null
  onStudySelect: (study: Study) => void
}

export function MobileNavigation({ medicalData, selectedStudy, onStudySelect }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleStudySelect = (study: Study) => {
    onStudySelect(study)
    setIsOpen(false) // Close sheet after selection
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="md:hidden bg-transparent">
          <Menu className="h-4 w-4" />
          <span className="sr-only">Open navigation</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full sm:w-[400px] p-0">
        <SheetHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg">Medical Data</SheetTitle>
            <Badge variant="secondary" className="text-xs">
              {medicalData.studies.length} Studies
            </Badge>
          </div>
        </SheetHeader>

        <Tabs defaultValue="patient" className="h-full">
          <TabsList className="grid w-full grid-cols-2 m-4 mb-0">
            <TabsTrigger value="patient" className="flex items-center gap-1">
              <User className="h-3 w-3" />
              Patient
            </TabsTrigger>
            <TabsTrigger value="studies" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Studies
            </TabsTrigger>
          </TabsList>

          <TabsContent value="patient" className="p-4 pt-2">
            <PatientInfo patient={medicalData.patient} studies={medicalData.studies} />
          </TabsContent>

          <TabsContent value="studies" className="p-4 pt-2 h-full">
            <StudyBrowser
              studies={medicalData.studies}
              selectedStudy={selectedStudy}
              onStudySelect={handleStudySelect}
            />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}
