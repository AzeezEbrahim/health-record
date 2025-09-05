"use client"

import { useState, useCallback } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import {
  FileText,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Download,
  Printer as Print,
  Search,
  RefreshCw,
  Loader2,
  AlertCircle,
  FileX,
} from "lucide-react"
import type { Study } from "@/lib/types"

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`

interface PDFReportViewerProps {
  study: Study | null
  className?: string
}

export function PDFReportViewer({ study, className }: PDFReportViewerProps) {
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [scale, setScale] = useState<number>(1.0)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [pageInput, setPageInput] = useState<string>("1")

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    setPageNumber(1)
    setPageInput("1")
    setIsLoading(false)
    setError(null)
  }, [])

  const onDocumentLoadError = useCallback((error: Error) => {
    setIsLoading(false)
    setError(error.message || "Failed to load PDF report")
  }, [])

  const onPageLoadSuccess = useCallback(() => {
    setIsLoading(false)
  }, [])

  const onPageLoadError = useCallback((error: Error) => {
    setError(error.message || "Failed to load PDF page")
  }, [])

  const goToPreviousPage = () => {
    if (pageNumber > 1) {
      const newPage = pageNumber - 1
      setPageNumber(newPage)
      setPageInput(newPage.toString())
    }
  }

  const goToNextPage = () => {
    if (pageNumber < numPages) {
      const newPage = pageNumber + 1
      setPageNumber(newPage)
      setPageInput(newPage.toString())
    }
  }

  const goToPage = (page: number) => {
    if (page >= 1 && page <= numPages) {
      setPageNumber(page)
      setPageInput(page.toString())
    }
  }

  const handlePageInputChange = (value: string) => {
    setPageInput(value)
    const pageNum = Number.parseInt(value, 10)
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= numPages) {
      setPageNumber(pageNum)
    }
  }

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev * 1.2, 3.0))
  }

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev / 1.2, 0.5))
  }

  const handleZoomChange = (values: number[]) => {
    setScale(values[0])
  }

  const handleReset = () => {
    setScale(1.0)
    setPageNumber(1)
    setPageInput("1")
  }

  const handleDownload = () => {
    if (study?.reportFile) {
      // In a real implementation, this would download the actual PDF
      const link = document.createElement("a")
      link.href = study.reportFile
      link.download = `Report_${study.accession}.pdf`
      link.click()
    }
  }

  const handlePrint = () => {
    window.print()
  }

  // Mock PDF URL for demonstration
  const pdfUrl = study?.reportFile || null

  if (!study) {
    return (
      <Card className={`p-2 sm:p-4 ${className}`}>
        <div className="flex items-center justify-between mb-2 sm:mb-4">
          <h3 className="font-medium text-sm sm:text-base">Report</h3>
          <Badge variant="outline" className="text-xs">
            <FileText className="h-3 w-3 mr-1" />
            PDF
          </Badge>
        </div>
        <div className="bg-muted rounded-lg h-[300px] sm:h-[400px] lg:h-[500px] flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Select a study to view the report</p>
          </div>
        </div>
      </Card>
    )
  }

  if (!pdfUrl) {
    return (
      <Card className={`p-2 sm:p-4 ${className}`}>
        <div className="flex items-center justify-between mb-2 sm:mb-4">
          <h3 className="font-medium text-sm sm:text-base">Report</h3>
          <Badge variant="outline" className="text-xs">
            <FileText className="h-3 w-3 mr-1" />
            PDF
          </Badge>
        </div>
        <div className="bg-muted rounded-lg h-[300px] sm:h-[400px] lg:h-[500px] flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <FileX className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No report available for this study</p>
            <p className="text-xs mt-1">Study: {study.accession}</p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className={`p-2 sm:p-4 ${className}`}>
      <div className="flex items-center justify-between mb-2 sm:mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-sm sm:text-base">Report</h3>
          <Badge variant="outline" className="text-xs">
            <FileText className="h-3 w-3 mr-1" />
            PDF
          </Badge>
          {numPages > 0 && (
            <Badge variant="secondary" className="text-xs hidden sm:inline-flex">
              {numPages} pages
            </Badge>
          )}
        </div>
      </div>

      <div className="mb-2 sm:mb-4 space-y-2 sm:space-y-3">
        <TooltipProvider>
          <div className="flex items-center gap-1 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousPage}
              disabled={pageNumber <= 1}
              className="h-7 sm:h-8 px-2 bg-transparent"
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>

            <div className="flex items-center gap-1 text-xs sm:text-sm">
              <Input
                type="text"
                value={pageInput}
                onChange={(e) => handlePageInputChange(e.target.value)}
                className="w-8 sm:w-12 h-6 sm:h-7 text-center text-xs"
              />
              <span className="text-muted-foreground">/ {numPages}</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={pageNumber >= numPages}
              className="h-7 sm:h-8 px-2"
            >
              <ChevronRight className="h-3 w-3" />
            </Button>

            <Separator orientation="vertical" className="h-6" />

            <Button variant="outline" size="sm" onClick={handleZoomIn} className="h-7 sm:h-8 px-2 bg-transparent">
              <ZoomIn className="h-3 w-3" />
            </Button>

            <Button variant="outline" size="sm" onClick={handleZoomOut} className="h-7 sm:h-8 px-2 bg-transparent">
              <ZoomOut className="h-3 w-3" />
            </Button>

            <Button variant="outline" size="sm" onClick={handleReset} className="h-7 sm:h-8 px-2 bg-transparent">
              <RefreshCw className="h-3 w-3" />
            </Button>

            <div className="hidden sm:flex items-center gap-1">
              <Separator orientation="vertical" className="h-6" />
              <Button variant="outline" size="sm" onClick={handleDownload} className="h-7 sm:h-8 px-2 bg-transparent">
                <Download className="h-3 w-3" />
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint} className="h-7 sm:h-8 px-2 bg-transparent">
                <Print className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </TooltipProvider>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground w-8 sm:w-12">Zoom:</span>
          <Slider value={[scale]} onValueChange={handleZoomChange} max={3.0} min={0.5} step={0.1} className="flex-1" />
          <span className="text-muted-foreground w-8 sm:w-12">{Math.round(scale * 100)}%</span>
        </div>

        <div className="relative sm:block hidden">
          <Search className="absolute left-2 top-2 h-3 w-3 text-muted-foreground" />
          <Input
            placeholder="Search in report..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-7 h-7 text-xs"
          />
        </div>
      </div>

      <div className="relative bg-gray-100 rounded-lg h-[300px] sm:h-[400px] lg:h-[500px] overflow-auto">
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Loading PDF report...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="text-center text-destructive">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 bg-transparent"
                onClick={() => {
                  setError(null)
                  setIsLoading(true)
                }}
              >
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* PDF Document */}
        <div className="flex justify-center p-4">
          {/* Mock PDF Display - In production, use actual react-pdf */}
          <div className="bg-white shadow-lg rounded border">
            <div
              className="bg-white p-8 min-h-[600px] w-[500px] border rounded"
              style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}
            >
              <div className="space-y-4">
                <div className="text-center border-b pb-4">
                  <h2 className="text-lg font-bold">RADIOLOGY REPORT</h2>
                  <p className="text-sm text-gray-600">Study: {study.accession}</p>
                  <p className="text-sm text-gray-600">Date: {study.date}</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-sm">CLINICAL HISTORY:</h3>
                    <p className="text-sm text-gray-700">
                      Patient presents with neurological symptoms requiring imaging evaluation.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-sm">TECHNIQUE:</h3>
                    <p className="text-sm text-gray-700">{study.description}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-sm">FINDINGS:</h3>
                    <p className="text-sm text-gray-700">
                      The examination demonstrates normal anatomical structures. No acute abnormalities are identified.
                      Brain parenchyma appears normal with no evidence of mass effect, hemorrhage, or infarction.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-sm">IMPRESSION:</h3>
                    <p className="text-sm text-gray-700">
                      Normal {study.type} examination of the brain. No acute findings.
                    </p>
                  </div>

                  <div className="pt-4 border-t text-xs text-gray-500">
                    <p>Electronically signed by: Dr. Radiologist</p>
                    <p>Date: {study.date}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page indicator for mock display */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-black/70 text-white px-3 py-1 rounded-full text-xs">
            Page {pageNumber} of {numPages || 1}
          </div>
        </div>
      </div>

      {/* Report Info */}
      <div className="mt-3 text-xs text-muted-foreground">
        <div className="flex items-center justify-between">
          <span>Report: {study.accession}</span>
          <span>{study.date}</span>
        </div>
        <p className="text-pretty mt-1">{study.description}</p>
      </div>
    </Card>
  )
}
