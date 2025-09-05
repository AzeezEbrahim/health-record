"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DicomViewer } from "@/components/dicom-viewer"
import { PDFReportViewer } from "@/components/pdf-report-viewer-new"
import { ImageIcon, FileText, Maximize2, Minimize2 } from "lucide-react"
import type { Study } from "@/lib/types"

interface ResponsiveViewerLayoutProps {
  selectedStudy: Study | null
}

export function ResponsiveViewerLayout({ selectedStudy }: ResponsiveViewerLayoutProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [activeTab, setActiveTab] = useState("dicom")

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  return (
    <>
      {/* Desktop Layout - Side by Side */}
      <div className="hidden lg:grid lg:grid-cols-2 gap-4 h-full">
        <DicomViewer study={selectedStudy} />
        <PDFReportViewer study={selectedStudy} />
      </div>

      {/* Mobile/Tablet Layout - Tabbed Interface */}
      <div className="lg:hidden h-full">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <TabsList className="grid w-full max-w-[300px] grid-cols-2">
              <TabsTrigger value="dicom" className="flex items-center gap-1">
                <ImageIcon className="h-3 w-3" />
                <span className="hidden sm:inline">DICOM</span>
                <span className="sm:hidden">Images</span>
              </TabsTrigger>
              <TabsTrigger value="report" className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                <span className="hidden sm:inline">Report</span>
                <span className="sm:hidden">PDF</span>
              </TabsTrigger>
            </TabsList>

            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
              className="flex items-center gap-1 bg-transparent"
            >
              {isFullscreen ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
              <span className="hidden sm:inline">{isFullscreen ? "Exit" : "Fullscreen"}</span>
            </Button>
          </div>

          <TabsContent value="dicom" className="flex-1 mt-0">
            <DicomViewer study={selectedStudy} className={isFullscreen ? "fixed inset-0 z-50 m-4" : ""} />
          </TabsContent>

          <TabsContent value="report" className="flex-1 mt-0">
            <PDFReportViewer study={selectedStudy} className={isFullscreen ? "fixed inset-0 z-50 m-4" : ""} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
