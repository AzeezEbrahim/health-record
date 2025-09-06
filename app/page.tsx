"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MedicalDashboardNew } from "@/components/medical-dashboard"
import { HydrationBoundary } from "@/components/hydration-boundary"
import { ImageIcon, Loader2, ExternalLink } from "lucide-react"
import type { MedicalData, Study } from "@/lib/types"
import { loadMedicalData } from "@/lib/data-parser"

export default function MedicalViewer() {
  const [medicalData, setMedicalData] = useState<MedicalData | null>(null)
  const [selectedStudy, setSelectedStudy] = useState<Study | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("Starting medical data loading...")
        // Use performance.now() for client-side timing to avoid hydration mismatches
        const startTime = typeof window !== 'undefined' ? performance.now() : 0
        
        const data = await loadMedicalData()
        
        if (typeof window !== 'undefined') {
          const loadTime = performance.now() - startTime
          console.log(`Medical data loaded in ${loadTime.toFixed(2)}ms`)
        }
        
        setMedicalData(data)
        setSelectedStudy(data.studies[0] || null)
      } catch (error) {
        console.error("Failed to load medical data:", error)
        setMedicalData(null)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Loading Medical Records</h2>
          <p className="text-muted-foreground text-sm mb-4">
            Initializing AGFA medical data viewer...
          </p>
          <div className="text-xs text-muted-foreground">
            This may take a few seconds for large datasets
          </div>
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
    <div className="min-h-screen bg-background" suppressHydrationWarning={true}>
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <ImageIcon className="h-4 w-4 text-primary-foreground" />
              </div>
              <h1 className="text-lg sm:text-xl font-semibold text-balance">
                <span className="hidden sm:inline">Hamid's Health Records</span>
                <span className="sm:hidden">Hamid's Health Records</span>
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="flex items-center gap-2 text-xs"
              >
                <a
                  href="https://drive.google.com/file/d/1H7NIJfq5tXrtwuIo9693ZT4KmxY5DW0X/view?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span className="hidden sm:inline">Download Advanced AGFA viewer</span>
                  <span className="sm:hidden">Download AGFA</span>
                </a>
              </Button>

            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-2 sm:p-4">
        <HydrationBoundary fallback={
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Loading medical dashboard...</p>
            </div>
          </div>
        }>
          <MedicalDashboardNew
            patient={medicalData.patient}
            studies={medicalData.studies}
            selectedStudy={selectedStudy}
            onStudySelect={setSelectedStudy}
          />
        </HydrationBoundary>
      </div>
    </div>
  )
}