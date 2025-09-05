"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DicomViewer } from "@/components/dicom-viewer"
import { PDFReportViewer } from "@/components/pdf-report-viewer-new"
import { PatientInfoEnhanced } from "@/components/patient-info-enhanced"
import { LabResultsViewer } from "@/components/lab-results-viewer"
import { StudyBrowser } from "@/components/study-browser-simple"
import { 
  ImageIcon, 
  FileText, 
  User, 
  TestTube, 
  Calendar,
  Maximize2, 
  Minimize2,
  X
} from "lucide-react"
import type { Study, Patient } from "@/lib/types"

interface MedicalDashboardProps {
  patient: Patient
  studies: Study[]
  selectedStudy: Study | null
  onStudySelect: (study: Study) => void
}

export function MedicalDashboard({ patient, studies, selectedStudy, onStudySelect }: MedicalDashboardProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [fullscreenComponent, setFullscreenComponent] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("dicom")

  const toggleFullscreen = (componentId?: string) => {
    if (isFullscreen) {
      setIsFullscreen(false)
      setFullscreenComponent(null)
    } else {
      setIsFullscreen(true)
      setFullscreenComponent(componentId || null)
    }
  }

  const exitFullscreen = () => {
    setIsFullscreen(false)
    setFullscreenComponent(null)
  }

  // Desktop Layout (5 components)
  const DesktopLayout = () => (
    <div className="hidden lg:grid lg:grid-cols-12 gap-3 h-[calc(100vh-140px)]">
      {/* Left Column: Patient Info + Studies */}
      <div className="col-span-3 flex flex-col gap-3 h-full">
        <div className="flex-1 max-h-[55%] overflow-hidden">
          <PatientInfoEnhanced 
            patient={patient} 
            studies={studies}
          />
        </div>
        <div className="flex-1 max-h-[45%] overflow-hidden">
          <StudyBrowser
            studies={studies}
            selectedStudy={selectedStudy}
            onStudySelect={onStudySelect}
          />
        </div>
      </div>

      {/* Center Column: DICOM Viewer */}
      <div className="col-span-4 relative h-full">
        <div className="absolute top-2 right-2 z-10">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleFullscreen('dicom')}
            className="h-7 px-2 bg-background/80 backdrop-blur-sm"
          >
            <Maximize2 className="h-3 w-3" />
          </Button>
        </div>
        <DicomViewer study={selectedStudy} className="h-full" />
      </div>

      {/* Right Column: Reports + Lab Results */}
      <div className="col-span-5 flex flex-col gap-3 h-full">
        <div className="flex-1 max-h-[70%] relative overflow-hidden">
          <div className="absolute top-2 right-2 z-10">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleFullscreen('report')}
              className="h-7 px-2 bg-background/80 backdrop-blur-sm"
            >
              <Maximize2 className="h-3 w-3" />
            </Button>
          </div>
          <PDFReportViewer study={selectedStudy} className="h-full" />
        </div>
        <div className="flex-1 max-h-[30%] overflow-hidden">
          <LabResultsViewer labResults={[]} className="h-full" />
        </div>
      </div>
    </div>
  )

  // Mobile/Tablet Layout (Tabbed)
  const MobileLayout = () => (
    <div className="lg:hidden h-[calc(100vh-140px)]">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <TabsList className="grid w-full max-w-[400px] grid-cols-4">
            <TabsTrigger value="patient" className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span className="hidden sm:inline">Patient</span>
            </TabsTrigger>
            <TabsTrigger value="studies" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span className="hidden sm:inline">Studies</span>
            </TabsTrigger>
            <TabsTrigger value="dicom" className="flex items-center gap-1">
              <ImageIcon className="h-3 w-3" />
              <span className="hidden sm:inline">DICOM</span>
            </TabsTrigger>
            <TabsTrigger value="report" className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              <span className="hidden sm:inline">Report</span>
            </TabsTrigger>
          </TabsList>

          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleFullscreen(activeTab)}
            className="flex items-center gap-1 bg-transparent"
          >
            {isFullscreen ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
            <span className="hidden sm:inline">{isFullscreen ? "Exit" : "Full"}</span>
          </Button>
        </div>

        <TabsContent value="patient" className="flex-1 mt-0">
          <PatientInfoEnhanced 
            patient={patient} 
            studies={studies}
            className={isFullscreen ? "fixed inset-0 z-50 m-4" : ""}
          />
        </TabsContent>

        <TabsContent value="studies" className="flex-1 mt-0">
          <StudyBrowser
            studies={studies}
            selectedStudy={selectedStudy}
            onStudySelect={onStudySelect}
            className={isFullscreen ? "fixed inset-0 z-50 m-4" : ""}
          />
        </TabsContent>

        <TabsContent value="dicom" className="flex-1 mt-0">
          <DicomViewer 
            study={selectedStudy} 
            className={isFullscreen ? "fixed inset-0 z-50 m-4" : ""} 
          />
        </TabsContent>

        <TabsContent value="report" className="flex-1 mt-0">
          <PDFReportViewer 
            study={selectedStudy} 
            className={isFullscreen ? "fixed inset-0 z-50 m-4" : ""} 
          />
        </TabsContent>

        {/* Lab Results accessible via separate section or modal */}
        <div className="mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveTab('labs')}
            className="w-full"
          >
            <TestTube className="h-3 w-3 mr-2" />
            View Lab Results
          </Button>
        </div>

        <TabsContent value="labs" className="flex-1 mt-0">
          <LabResultsViewer 
            labResults={[]} 
            className={isFullscreen ? "fixed inset-0 z-50 m-4" : ""} 
          />
        </TabsContent>
      </Tabs>
    </div>
  )

  // Fullscreen overlay
  if (isFullscreen && fullscreenComponent) {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        <div className="absolute top-4 right-4 z-10">
          <Button
            variant="outline"
            size="sm"
            onClick={exitFullscreen}
            className="flex items-center gap-2"
          >
            <X className="h-3 w-3" />
            Exit Fullscreen
          </Button>
        </div>
        
        <div className="h-full p-4">
          {fullscreenComponent === 'dicom' && (
            <DicomViewer study={selectedStudy} className="h-full" />
          )}
          {fullscreenComponent === 'report' && (
            <PDFReportViewer study={selectedStudy} className="h-full" />
          )}
          {fullscreenComponent === 'patient' && (
            <PatientInfoEnhanced patient={patient} studies={studies} />
          )}
          {fullscreenComponent === 'studies' && (
            <StudyBrowser
              studies={studies}
              selectedStudy={selectedStudy}
              onStudySelect={onStudySelect}
            />
          )}
          {fullscreenComponent === 'labs' && (
            <LabResultsViewer labResults={[]} />
          )}
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