"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ImageIcon, 
  ExternalLink, 
  Download,
  AlertTriangle
} from "lucide-react"
import type { Study } from "@/lib/types"

interface DicomFallbackViewerProps {
  study: Study | null
  className?: string
}

export function DicomFallbackViewer({ study, className }: DicomFallbackViewerProps) {
  const [showDetails, setShowDetails] = useState(false)

  if (!study) {
    return (
      <Card className={`p-4 flex flex-col ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">DICOM Viewer</h3>
        </div>
        <div className="bg-muted rounded-lg flex-1 min-h-[400px] flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Select a study to view DICOM images</p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className={`p-4 flex flex-col ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">DICOM Viewer</h3>
          <Badge variant="outline" className="text-xs">
            {study.type}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            Fallback Mode
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Badge variant="secondary" className="text-xs">
            {study.imageCount || 0} images
          </Badge>
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg flex-1 min-h-[400px] flex items-center justify-center">
        <div className="text-center text-white p-8 max-w-md">
          {/* Medical Image Icon */}
          <div className="w-32 h-32 bg-gray-700 rounded-lg mx-auto mb-6 flex items-center justify-center">
            <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"></path>
            </svg>
          </div>

          {/* Study Information */}
          <div className="space-y-3 mb-6">
            <h4 className="text-lg font-semibold text-white">
              {study.description}
            </h4>
            <div className="text-sm text-gray-300 space-y-1">
              <p>Study: {study.accession}</p>
              <p>Date: {study.date}</p>
              <p>Modality: {study.modality}</p>
              <p>Images: {study.imageCount} • Series: {study.seriesCount}</p>
            </div>
          </div>

          {/* Warning Notice */}
          <div className="bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-yellow-400 mb-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Limited Functionality</span>
            </div>
            <p className="text-xs text-yellow-200">
              Advanced DICOM viewer library (DWV) is not available. 
              Basic study information is displayed instead.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              variant="outline"
              size="sm"
              className="w-full bg-transparent text-white border-gray-600 hover:bg-gray-700"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Hide' : 'Show'} Technical Details
            </Button>

            <div className="grid grid-cols-1 gap-2">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="bg-blue-600/20 text-blue-300 border-blue-500/50 hover:bg-blue-600/30"
              >
                <a
                  href="https://drive.google.com/file/d/1H7NIJfq5tXrtwuIo9693ZT4KmxY5DW0X/view?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-3 w-3" />
                  Open Advanced DICOM Viewer
                </a>
              </Button>

              {study.reportFile && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="bg-green-600/20 text-green-300 border-green-500/50 hover:bg-green-600/30"
                >
                  <a
                    href={study.reportFile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <Download className="h-3 w-3" />
                    Download PDF Report
                  </a>
                </Button>
              )}
            </div>
          </div>

          {/* Technical Details */}
          {showDetails && (
            <div className="mt-6 p-4 bg-gray-800/50 rounded-lg text-left">
              <h5 className="text-sm font-medium text-gray-300 mb-3">Technical Details</h5>
              <div className="text-xs text-gray-400 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <span>DICOM Enabled:</span>
                  <span className={study.dicomEnabled ? "text-green-400" : "text-red-400"}>
                    {study.dicomEnabled ? "✓ Yes" : "✗ No"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span>PDF Report:</span>
                  <span className={study.pdfEnabled ? "text-green-400" : "text-red-400"}>
                    {study.pdfEnabled ? "✓ Available" : "✗ Not Available"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span>Files Available:</span>
                  <span className="text-blue-400">
                    {study.dicomFiles?.length || 0} DICOM files
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span>Study Type:</span>
                  <span className="text-purple-400">{study.type}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span>Series Count:</span>
                  <span className="text-cyan-400">{study.seriesCount || 1}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span>Accession:</span>
                  <span className="text-yellow-400 font-mono">{study.accession}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 text-xs text-muted-foreground">
        <p>For full DICOM viewing capabilities, please use the advanced viewer or ensure DWV library loads properly.</p>
      </div>
    </Card>
  )
}
