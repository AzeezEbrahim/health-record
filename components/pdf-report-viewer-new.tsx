"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, ExternalLink, AlertCircle, Loader2 } from "lucide-react"
import type { Study } from "@/lib/types"

interface PDFReportViewerProps {
  study: Study | null
  className?: string
}

export function PDFReportViewer({ study, className }: PDFReportViewerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (study?.reportFile) {
      setIsLoading(true)
      setError(null)
      setRefreshKey(prev => prev + 1)
      
      // Force reload iframe after a short delay to handle hidden tab issues
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 1500)
      
      return () => clearTimeout(timer)
    } else {
      setIsLoading(false)
    }
  }, [study])

  // Add intersection observer to refresh when component becomes visible
  useEffect(() => {
    if (!containerRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && study?.reportFile) {
            // Refresh the iframe when it becomes visible
            setRefreshKey(prev => prev + 1)
            setIsLoading(true)
            setTimeout(() => setIsLoading(false), 1000)
          }
        })
      },
      { threshold: 0.1 }
    )

    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [study?.reportFile])

  const handleDownload = () => {
    if (study?.reportFile) {
      const link = document.createElement("a")
      link.href = study.reportFile
      link.download = `Report_${study.accession}.pdf`
      link.click()
    }
  }

  const handleOpenExternal = () => {
    if (study?.reportFile) {
      window.open(study.reportFile, '_blank')
    }
  }

  const pdfUrl = study?.reportFile || null

  if (!study) {
    return (
      <Card className={`p-2 sm:p-4 flex flex-col ${className}`}>
        <div className="flex items-center justify-between mb-2 sm:mb-4">
          <h3 className="font-medium text-sm sm:text-base">Report</h3>
          <Badge variant="outline" className="text-xs">
            <FileText className="h-3 w-3 mr-1" />
            PDF
          </Badge>
        </div>
        <div className="bg-muted rounded-lg flex-1 min-h-[300px] flex items-center justify-center">
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
      <Card className={`p-2 sm:p-4 flex flex-col ${className}`}>
        <div className="flex items-center justify-between mb-2 sm:mb-4">
          <h3 className="font-medium text-sm sm:text-base">Report</h3>
          <Badge variant="outline" className="text-xs">
            <FileText className="h-3 w-3 mr-1" />
            PDF
          </Badge>
        </div>
        <div className="bg-muted rounded-lg flex-1 min-h-[300px] flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No report available for this study</p>
            <p className="text-xs mt-1">Study: {study.accession}</p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className={`p-2 sm:p-4 flex flex-col ${className}`}>
      <div className="flex items-center justify-between mb-2 sm:mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-sm sm:text-base">Report</h3>
          <Badge variant="outline" className="text-xs">
            <FileText className="h-3 w-3 mr-1" />
            PDF
          </Badge>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="h-7 sm:h-8 px-2 bg-transparent"
          >
            <Download className="h-3 w-3" />
            <span className="hidden sm:inline ml-1">Download</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenExternal}
            className="h-7 sm:h-8 px-2 bg-transparent"
          >
            <ExternalLink className="h-3 w-3" />
            <span className="hidden sm:inline ml-1">Open</span>
          </Button>
        </div>
      </div>

      {/* PDF Embedded Viewer */}
      <div ref={containerRef} className="relative bg-gray-100 rounded-lg overflow-hidden flex-1" style={{minHeight: '500px'}}>
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Loading PDF report...</p>
            </div>
          </div>
        )}

        <iframe
          key={`pdf-${study.accession}-${refreshKey}`}
          src={`${pdfUrl}#view=FitH&zoom=page-width`}
          className="w-full h-full border-0 rounded"
          title={`PDF Report for Study ${study.accession}`}
          loading="eager"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false)
            setError("Failed to load PDF report")
          }}
          style={{ minHeight: '300px' }}
        />

        {error && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="text-center text-destructive">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">{error}</p>
              <div className="flex gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-transparent"
                  onClick={handleOpenExternal}
                >
                  Open in New Tab
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-transparent"
                  onClick={handleDownload}
                >
                  Download
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Report Info */}
      <div className="mt-3 text-xs text-muted-foreground">
        <p className="text-pretty">{study.description}</p>
      </div>
    </Card>
  )
}