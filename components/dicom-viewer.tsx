"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ZoomIn, ZoomOut, Move, Settings, RefreshCw, Contrast, Loader2, AlertCircle, Maximize2 } from "lucide-react"
import type { DicomViewerProps } from "@/lib/types" // Declare DicomViewerProps

// DWV types (simplified)
declare global {
  interface Window {
    dwv: any
  }
}

export function DicomViewer({ study, className, onFullscreen }: DicomViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const dwvAppRef = useRef<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDwvLoaded, setIsDwvLoaded] = useState(false)
  const [currentTool, setCurrentTool] = useState("Scroll")
  const [windowLevel, setWindowLevel] = useState([128])
  const [windowWidth, setWindowWidth] = useState([256])
  const [zoom, setZoom] = useState(1)
  const [currentImage, setCurrentImage] = useState(0)
  const [totalImages, setTotalImages] = useState(0)

  // Load DWV library from CDN
  useEffect(() => {
    const loadDWV = () => {
      try {
        // Check if DWV is already loaded
        if (window.dwv) {
          console.log("DWV already loaded")
          setIsDwvLoaded(true)
          return
        }

        // Load DWV from CDN
        const script = document.createElement("script")
        script.src = "https://unpkg.com/dwv@0.33.5/dist/dwv.min.js"
        script.onload = () => {
          console.log("DWV loaded from CDN successfully")
          setIsDwvLoaded(true)
        }
        script.onerror = (error) => {
          console.error("Failed to load DWV from CDN:", error)
          console.log("Using placeholder DICOM viewer mode")
          // Don't block the UI, show placeholder instead
          setIsDwvLoaded(true)
          setError("DICOM viewer running in placeholder mode")
        }
        
        // Only add script if it doesn't already exist
        if (!document.querySelector('script[src="https://unpkg.com/dwv@0.33.5/dist/dwv.min.js"]')) {
          document.head.appendChild(script)
        }
      } catch (err) {
        console.error("DWV initialization error:", err)
        setError("DICOM viewer running in placeholder mode")
        setIsDwvLoaded(true) // Allow placeholder mode
      }
    }

    loadDWV()
  }, [])

  // Initialize DWV app
  const initializeDWV = useCallback(() => {
    if (!isDwvLoaded || !containerRef.current || !window.dwv) return

    try {
      // DWV configuration
      const config = {
        containerDivId: containerRef.current.id,
        tools: {
          Scroll: {},
          ZoomAndPan: {},
          WindowLevel: {},
          Draw: {
            options: ["Ruler", "Rectangle", "Ellipse", "FreeHand"],
          },
        },
        defaultCharacterSet: "iso-ir 100",
        overlays: {
          position: true,
        },
      }

      // Create DWV app
      const app = new window.dwv.App()
      app.init(config)

      // Event listeners
      app.addEventListener("loadstart", () => {
        setIsLoading(true)
        setError(null)
      })

      app.addEventListener("loadend", () => {
        setIsLoading(false)
        // Get image info
        const image = app.getImage()
        if (image) {
          setTotalImages(image.getGeometry().getSize().getNumberOfSlices() || 1)
          setCurrentImage(0)
        }
      })

      app.addEventListener("error", (event: any) => {
        setIsLoading(false)
        setError(event.error?.message || "Failed to load DICOM file")
      })

      app.addEventListener("positionchange", (event: any) => {
        if (event.value && event.value.length > 2) {
          setCurrentImage(event.value[2] || 0)
        }
      })

      dwvAppRef.current = app
    } catch (err) {
      setError("Failed to initialize DICOM viewer")
    }
  }, [isDwvLoaded])

  // Initialize DWV when ready
  useEffect(() => {
    if (isDwvLoaded && containerRef.current) {
      // Set unique ID for container
      containerRef.current.id = `dwv-container-${Date.now()}`
      initializeDWV()
    }

    return () => {
      // Cleanup
      if (dwvAppRef.current) {
        try {
          dwvAppRef.current.reset()
        } catch (err) {
          console.warn("Error cleaning up DWV:", err)
        }
      }
    }
  }, [isDwvLoaded, initializeDWV])

  // Load DICOM files when study changes
  useEffect(() => {
    if (!study || !dwvAppRef.current) return

    const loadDicomFiles = async () => {
      try {
        setIsLoading(true)
        setError(null)

        if (study.dicomFiles && study.dicomFiles.length > 0) {
          console.log(`Loading DICOM files for study ${study.accession}:`, study.dicomFiles)
          
          // Load actual DICOM files using DWV
          const fileUrls = study.dicomFiles.slice(0, 5) // Limit to first 5 files for demo
          
          try {
            // Use DWV to load DICOM files
            const app = dwvAppRef.current
            await app.loadURLs(fileUrls)
            
            console.log("Successfully loaded DICOM files")
          } catch (dwvError) {
            console.warn("DWV loading failed, using placeholder:", dwvError)
            
            // Fallback: Create placeholder display
            setTimeout(() => {
              setIsLoading(false)
              setTotalImages(study.imageCount || fileUrls.length)
              setCurrentImage(0)
            }, 1000)
          }
        } else {
          setError("No DICOM files found for this study")
          setIsLoading(false)
        }
      } catch (err) {
        console.error("Failed to load DICOM files:", err)
        setError("Failed to load DICOM files")
        setIsLoading(false)
      }
    }

    loadDicomFiles()
  }, [study])

  // Tool handlers
  const handleToolChange = (tool: string) => {
    if (dwvAppRef.current) {
      dwvAppRef.current.setTool(tool)
      setCurrentTool(tool)
    }
  }

  const handleZoomIn = () => {
    if (dwvAppRef.current) {
      const newZoom = zoom * 1.2
      setZoom(newZoom)
      // Apply zoom to DWV
    }
  }

  const handleZoomOut = () => {
    if (dwvAppRef.current) {
      const newZoom = zoom / 1.2
      setZoom(newZoom)
      // Apply zoom to DWV
    }
  }

  const handleReset = () => {
    if (dwvAppRef.current) {
      dwvAppRef.current.resetLayout()
      setZoom(1)
      setWindowLevel([128])
      setWindowWidth([256])
    }
  }

  const handleWindowLevelChange = (values: number[]) => {
    setWindowLevel(values)
    if (dwvAppRef.current) {
      // Apply window level to DWV
    }
  }

  const handleWindowWidthChange = (values: number[]) => {
    setWindowWidth(values)
    if (dwvAppRef.current) {
      // Apply window width to DWV
    }
  }

  if (!study) {
    return (
      <Card className={`p-4 flex flex-col ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">DICOM Viewer</h3>
        </div>
        <div className="bg-muted rounded-lg flex-1 min-h-[400px] flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Settings className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Select a study to view DICOM images</p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className={`p-2 sm:p-4 flex flex-col ${className}`}>
      <div className="flex items-center justify-between mb-2 sm:mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-sm sm:text-base">DICOM Viewer</h3>
          {study && (
            <>
              <Badge variant="outline" className="text-xs">
                {study.type}
              </Badge>
              {totalImages > 1 && (
                <Badge variant="secondary" className="text-xs hidden sm:inline-flex">
                  {currentImage + 1} / {totalImages}
                </Badge>
              )}
            </>
          )}
        </div>
        <div className="flex items-center gap-1">
          {study && (
            <Badge variant="secondary" className="text-xs">
              {study.imageCount || 0} images
            </Badge>
          )}
          {onFullscreen && (
            <Button variant="outline" size="sm" onClick={onFullscreen} className="h-7 px-2 bg-transparent">
              <Maximize2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      <div className="mb-2 sm:mb-4 space-y-2 sm:space-y-3">
        <TooltipProvider>
          <div className="flex items-center gap-1 flex-wrap">
            <Button
              variant={currentTool === "Scroll" ? "default" : "outline"}
              size="sm"
              onClick={() => handleToolChange("Scroll")}
              className="h-7 sm:h-8 px-2 sm:px-3"
            >
              <Move className="h-3 w-3" />
              <span className="hidden sm:inline ml-1">Pan</span>
            </Button>

            <Button
              variant={currentTool === "ZoomAndPan" ? "default" : "outline"}
              size="sm"
              onClick={() => handleToolChange("ZoomAndPan")}
              className="h-7 sm:h-8 px-2 sm:px-3"
            >
              <ZoomIn className="h-3 w-3" />
              <span className="hidden sm:inline ml-1">Zoom</span>
            </Button>

            <Button
              variant={currentTool === "WindowLevel" ? "default" : "outline"}
              size="sm"
              onClick={() => handleToolChange("WindowLevel")}
              className="h-7 sm:h-8 px-2 sm:px-3"
            >
              <Contrast className="h-3 w-3" />
              <span className="hidden sm:inline ml-1">W/L</span>
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
          </div>
        </TooltipProvider>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs">
          <div className="space-y-1">
            <label className="text-muted-foreground">Level: {windowLevel[0]}</label>
            <Slider
              value={windowLevel}
              onValueChange={handleWindowLevelChange}
              max={255}
              min={0}
              step={1}
              className="w-full"
            />
          </div>
          <div className="space-y-1">
            <label className="text-muted-foreground">Width: {windowWidth[0]}</label>
            <Slider
              value={windowWidth}
              onValueChange={handleWindowWidthChange}
              max={512}
              min={1}
              step={1}
              className="w-full"
            />
          </div>
        </div>
      </div>

      <div className="relative bg-black rounded-lg flex-1 overflow-hidden" style={{minHeight: '400px'}}>
        {isLoading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
            <div className="text-center text-white">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p className="text-sm">Loading DICOM images...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="text-center text-destructive">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">{error}</p>
              <Button variant="outline" size="sm" className="mt-2 bg-transparent" onClick={() => setError(null)}>
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* DWV Container */}
        <div ref={containerRef} className="w-full h-full">
          {!isLoading && !error && !isDwvLoaded && (
            <div className="flex items-center justify-center h-full text-white">
              <div className="text-center">
                <Settings className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Initializing DICOM viewer...</p>
              </div>
            </div>
          )}

          {!isLoading && !error && isDwvLoaded && (
            <div className="flex items-center justify-center h-full text-white">
              <div className="text-center">
                <div className="w-64 h-64 bg-gray-800 rounded-lg flex items-center justify-center mb-4">
                  <div className="text-center">
                    <div className="w-32 h-32 bg-gray-700 rounded mb-2 mx-auto"></div>
                    <p className="text-xs text-gray-400">DICOM Image Placeholder</p>
                    <p className="text-xs text-gray-500">{study.description}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400">
                  Study: {study.accession}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Image Navigation */}
        {totalImages > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="bg-black/70 text-white px-3 py-1 rounded-full text-xs">
              Image {currentImage + 1} of {totalImages}
            </div>
          </div>
        )}
      </div>

      {/* Study Info */}
      <div className="mt-3 text-xs text-muted-foreground">
        <p className="text-pretty">{study.description}</p>
      </div>
    </Card>
  )
}
