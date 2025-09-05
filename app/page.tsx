"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { MedicalDashboardNew } from "@/components/medical-dashboard-new"
import { ImageIcon, Loader2 } from "lucide-react"
import type { MedicalData, Study } from "@/lib/types"
import { loadMedicalData } from "@/lib/data-parser"

export default function MedicalViewer() {
  const [medicalData, setMedicalData] = useState<MedicalData | null>(null)
  const [selectedStudy, setSelectedStudy] = useState<Study | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await loadMedicalData()
        setMedicalData(data)
        setSelectedStudy(data.studies[0] || null)
      } catch (error) {
        console.error("Failed to load medical data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Loading medical data...</p>
        </div>
      </div>
    )
  }

  if (!medicalData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">Failed to load medical data</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <ImageIcon className="h-4 w-4 text-primary-foreground" />
              </div>
              <h1 className="text-lg sm:text-xl font-semibold text-balance">
                <span className="hidden sm:inline">{medicalData.patient.name} - Health Records</span>
                <span className="sm:hidden">{medicalData.patient.name}</span>
              </h1>
            </div>

            <div className="flex items-center gap-2">
              {selectedStudy && (
                <Badge variant="outline" className="text-xs">
                  {selectedStudy.type}
                </Badge>
              )}
            </div>
          </div>

        </div>
      </header>

      <div className="container mx-auto p-2 sm:p-4">
        <MedicalDashboardNew
          patient={medicalData.patient}
          studies={medicalData.studies}
          selectedStudy={selectedStudy}
          onStudySelect={setSelectedStudy}
        />
      </div>
    </div>
  )
}
