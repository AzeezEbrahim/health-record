"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { DicomViewer } from "@/components/dicom-viewer"
import { PDFReportViewer } from "@/components/pdf-report-viewer-new"
import { PatientInfoEnhanced } from "@/components/patient-info-enhanced"
import { LabResultsViewer } from "@/components/lab-results-viewer"
import { 
  ImageIcon, 
  FileText, 
  User, 
  TestTube, 
  ChevronLeft,
  ChevronRight,
  Calendar,
  Hash
} from "lucide-react"
import type { Study, Patient } from "@/lib/types"

interface MedicalDashboardProps {
  patient: Patient
  studies: Study[]
  selectedStudy: Study | null
  onStudySelect: (study: Study) => void
}

export function MedicalDashboardNew({ patient, studies, selectedStudy, onStudySelect }: MedicalDashboardProps) {
  const [activeDesktopTab, setActiveDesktopTab] = useState("viewer")
  const [activeMobileTab, setActiveMobileTab] = useState("viewer")
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  const currentStudyIndex = selectedStudy ? studies.findIndex(s => s.accession === selectedStudy.accession) : 0
  
  const toggleDicomFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }
  
  const goToPreviousStudy = () => {
    if (currentStudyIndex > 0) {
      onStudySelect(studies[currentStudyIndex - 1])
    }
  }
  
  const goToNextStudy = () => {
    if (currentStudyIndex < studies.length - 1) {
      onStudySelect(studies[currentStudyIndex + 1])
    }
  }

  // Study Navigation Component
  const StudyNavigation = ({ className = "" }: { className?: string }) => (
    <div className={`flex items-center justify-center gap-4 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={goToPreviousStudy}
        disabled={currentStudyIndex <= 0}
        className="h-8 px-3"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <div className="text-center min-w-[120px]">
        <div className="text-sm font-medium">
          Study {currentStudyIndex + 1} of {studies.length}
        </div>
        {selectedStudy && (
          <div className="text-xs text-muted-foreground">
            {selectedStudy.type} • {selectedStudy.date}
          </div>
        )}
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={goToNextStudy}
        disabled={currentStudyIndex >= studies.length - 1}
        className="h-8 px-3"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )

  // Desktop Layout
  const DesktopLayout = () => (
    <div className="hidden lg:block h-[calc(100vh-120px)]">
      <div className="h-full flex flex-col">
        {/* Top Tabs */}
        <Tabs value={activeDesktopTab} onValueChange={setActiveDesktopTab} className="h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="viewer" className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Medical Viewer
              </TabsTrigger>
              <TabsTrigger value="patient" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Patient Details
              </TabsTrigger>
            </TabsList>
            
            <StudyNavigation />
          </div>

          {/* Medical Viewer Tab */}
          <TabsContent value="viewer" className="flex-1 mt-0">
            <div className="h-full flex flex-col gap-3">
              {/* Main Viewer Area - DICOM (60%) and Report (40%) Side by Side */}
              <div className="flex-1 grid grid-cols-5 gap-3" style={{minHeight: '65vh'}}>
                <div className="col-span-3">
                  <DicomViewer 
                    study={selectedStudy} 
                    className="h-full" 
                    onFullscreen={toggleDicomFullscreen}
                  />
                </div>
                <div className="col-span-2">
                  <PDFReportViewer study={selectedStudy} className="h-full" />
                </div>
              </div>
              
              {/* Lab Results Below */}
              <div className="h-[78rem] flex-shrink-0">
                <LabResultsViewer labResults={[]} className="h-full" />
              </div>
            </div>
          </TabsContent>

          {/* Patient Details Tab */}
          <TabsContent value="patient" className="flex-1 mt-0">
            <div className="max-w-4xl mx-auto h-full">
              <PatientInfoEnhanced 
                patient={patient} 
                studies={studies}
                className="h-full"
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )

  // Mobile Layout
  const MobileLayout = () => (
    <div className="lg:hidden h-[calc(100vh-120px)]">
      <Tabs value={activeMobileTab} onValueChange={setActiveMobileTab} className="h-full flex flex-col">
        {/* Mobile Tabs */}
        <div className="flex flex-col gap-3 mb-4">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="viewer" className="flex items-center gap-1">
              <ImageIcon className="h-3 w-3" />
              <span className="hidden sm:inline">Viewer</span>
            </TabsTrigger>
            <TabsTrigger value="patient" className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span className="hidden sm:inline">Patient</span>
            </TabsTrigger>
            <TabsTrigger value="labs" className="flex items-center gap-1">
              <TestTube className="h-3 w-3" />
              <span className="hidden sm:inline">Labs</span>
            </TabsTrigger>
          </TabsList>
          
          {activeMobileTab === "viewer" && (
            <StudyNavigation />
          )}
        </div>

        {/* Viewer Tab - DICOM and Report together */}
        <TabsContent value="viewer" className="flex-1 mt-0">
          <div className="h-full">
            <Tabs defaultValue="dicom" className="h-full flex flex-col">
              <TabsList className="grid grid-cols-2 w-full mb-3">
                <TabsTrigger value="dicom" className="flex items-center gap-1">
                  <ImageIcon className="h-3 w-3" />
                  DICOM
                </TabsTrigger>
                <TabsTrigger value="report" className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  Report
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="dicom" className="flex-1 mt-0">
                <DicomViewer 
                  study={selectedStudy} 
                  className="h-full" 
                  onFullscreen={toggleDicomFullscreen}
                />
              </TabsContent>
              
              <TabsContent value="report" className="flex-1 mt-0">
                <PDFReportViewer study={selectedStudy} className="h-full" />
              </TabsContent>
            </Tabs>
          </div>
        </TabsContent>

        {/* Patient Tab */}
        <TabsContent value="patient" className="flex-1 mt-0">
          <PatientInfoEnhanced 
            patient={patient} 
            studies={studies}
            className="h-full"
          />
        </TabsContent>

        {/* Labs Tab */}
        <TabsContent value="labs" className="flex-1 mt-0">
          <LabResultsViewer labResults={[]} className="h-full" />
        </TabsContent>
      </Tabs>
    </div>
  )

  // Fullscreen DICOM viewer overlay
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        <div className="absolute top-4 right-4 z-10">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleDicomFullscreen}
            className="flex items-center gap-2"
          >
            <span className="text-xs">Exit Fullscreen</span>
          </Button>
        </div>
        
        <div className="w-full h-full p-4">
          <DicomViewer 
            study={selectedStudy} 
            className="w-full h-full"
          />
        </div>
      </div>
    )
  }

  return (
    <>
      <DesktopLayout />
      <MobileLayout />
    </>
  )
}