"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { 
  ZoomIn, 
  ZoomOut, 
  Move, 
  Settings, 
  RefreshCw, 
  Contrast, 
  Loader2, 
  AlertCircle, 
  Maximize2,
  Ruler,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import type { DicomViewerProps } from "@/lib/types"
import { DWVLoader } from "@/lib/dwv-loader"
import { DicomFallbackViewer } from "@/components/dicom-fallback-viewer"
import { AGFAImageViewer } from "@/components/agfa-image-viewer"

export function DicomViewer({ study, className, onFullscreen }: DicomViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerId, setContainerId] = useState('')
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
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [useFallback, setUseFallback] = useState(false)
  const [useAGFAViewer, setUseAGFAViewer] = useState(true) // Prefer AGFA viewer by default

  // Generate container ID only on client side to avoid hydration mismatches
  useEffect(() => {
    setContainerId(`dwv-container-${Math.random().toString(36).substr(2, 9)}`)
  }, [])

  // Load DWV library using robust loader
  useEffect(() => {
    const loadDWV = async () => {
      try {
        console.log("Loading DWV library...")
        setIsLoading(true)
        setError(null)
        
        const dwvLoader = DWVLoader.getInstance()
        const success = await dwvLoader.loadDWV()
        
        if (success) {
          console.log("DWV loaded successfully")
          setIsDwvLoaded(true)
        } else {
          console.warn("DWV loading failed, using fallback mode")
          setUseFallback(true)
          setIsDwvLoaded(true) // Set as loaded to show fallback UI
        }
      } catch (err) {
        console.error("DWV initialization error:", err)
        setError("Failed to initialize DICOM viewer. Using fallback mode.")
        setIsDwvLoaded(true) // Set as loaded to show fallback UI
      } finally {
        setIsLoading(false)
      }
    }

    loadDWV()
  }, [])

  // Initialize DWV app
  const initializeDWV = useCallback(() => {
    if (!isDwvLoaded || !containerRef.current || !window.dwv || dwvAppRef.current || !containerId) return

    try {
      console.log("Initializing DWV app...")
      
      // Clear container
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
      
      // Set the container ID
      if (containerRef.current) {
        containerRef.current.id = containerId
      }
      
      // DWV configuration
      const config = {
        containerDivId: containerId,
        tools: {
          Scroll: {},
          ZoomAndPan: {},
          WindowLevel: {},
          Draw: {
            options: ["Ruler"],
          },
        },
        defaultCharacterSet: "iso-ir 100",
        overlays: {
          position: false,
        },
      }

      // Create DWV app
      const app = new window.dwv.App()
      
      // Initialize the app
      app.init(config)

      // Event listeners
      app.addEventListener("loadstart", (event: any) => {
        console.log("DWV load started")
        setIsLoading(true)
        setError(null)
        setIsImageLoaded(false)
        setLoadingProgress(0)
      })

      app.addEventListener("loadprogress", (event: any) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100)
          setLoadingProgress(progress)
        }
      })

      app.addEventListener("loadend", (event: any) => {
        console.log("DWV load completed")
        setIsLoading(false)
        setIsImageLoaded(true)
        setLoadingProgress(100)
        
        // Get image info
        try {
          const image = app.getImage()
          if (image) {
            const geometry = image.getGeometry()
            const size = geometry.getSize()
            const numberOfSlices = size.getNumberOfSlices ? size.getNumberOfSlices() : 1
            setTotalImages(numberOfSlices)
            setCurrentImage(0)
            
            // Set initial window level and width
            const range = image.getDataRange()
            const center = Math.round((range.max + range.min) / 2)
            const width = Math.round(range.max - range.min)
            setWindowLevel([center])
            setWindowWidth([width])
            
            // Set initial tool
            app.setTool("Scroll")
          }
        } catch (err) {
          console.warn("Could not get image info:", err)
        }
      })

      app.addEventListener("error", (event: any) => {
        console.error("DWV error:", event)
        setIsLoading(false)
        setError(event.error?.message || "Failed to load DICOM file")
      })

      app.addEventListener("positionchange", (event: any) => {
        if (event.value && event.value.length > 2) {
          setCurrentImage(event.value[2] || 0)
        }
      })

      dwvAppRef.current = app
      console.log("DWV app initialized successfully")
    } catch (err) {
      console.error("Failed to initialize DWV app:", err)
      setError("Failed to initialize DICOM viewer")
    }
  }, [isDwvLoaded, containerId])

  // Initialize DWV when ready
  useEffect(() => {
    if (isDwvLoaded && containerRef.current && containerId) {
      initializeDWV()
    }

    return () => {
      // Cleanup
      if (dwvAppRef.current) {
        try {
          dwvAppRef.current.reset()
          dwvAppRef.current = null
        } catch (err) {
          console.warn("Error cleaning up DWV:", err)
        }
      }
    }
  }, [isDwvLoaded, initializeDWV, containerId])

  // Load DICOM files when study changes
  useEffect(() => {
    if (!study || !dwvAppRef.current || !isDwvLoaded || !window.dwv) return

    const loadDicomFiles = async () => {
      try {
        setIsLoading(true)
        setError(null)
        setIsImageLoaded(false)
        setLoadingProgress(0)

        // Generate minimal DICOM file URLs for fast loading
        const dicomFiles: string[] = []
        
        if (study.dicomFiles && study.dicomFiles.length > 0) {
          // Use only the first 2 files for initial loading
          dicomFiles.push(...study.dicomFiles.slice(0, 2))
        } else {
          // Fallback: generate just 2 file paths for testing
          for (let i = 1; i <= 2; i++) {
            const fileNum = i.toString().padStart(8, '0')
            dicomFiles.push(`/data/DICOM/${fileNum}/`)
          }
        }

        console.log(`Loading DICOM files for study ${study.accession}:`, dicomFiles)
        
        try {
          // Reset the app first
          dwvAppRef.current.reset()
          
          // Re-initialize after reset
          const containerId = containerRef.current?.id
          if (containerId) {
            const config = {
              containerDivId: containerId,
              tools: {
                Scroll: {},
                ZoomAndPan: {},
                WindowLevel: {},
                Draw: { options: ["Ruler"] },
              },
              defaultCharacterSet: "iso-ir 100",
            }
            dwvAppRef.current.init(config)
          }
          
          // Load DICOM files using DWV
          await dwvAppRef.current.loadURLs(dicomFiles)
          
          console.log("Successfully loaded DICOM files")
        } catch (dwvError: any) {
          console.error("DWV loading failed:", dwvError)
          
          // Show fallback placeholder
          setIsLoading(false)
          setError(null) // Don't show error, show placeholder instead
          setIsImageLoaded(false)
          
          // Create a visual placeholder when DWV fails
          if (containerRef.current) {
            containerRef.current.innerHTML = `
              <div class="flex items-center justify-center h-full bg-gray-900 rounded">
                <div class="text-center text-white p-8">
                  <div class="w-64 h-64 bg-gray-700 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <div class="text-center">
                      <div class="w-32 h-32 bg-gray-600 rounded mb-4 mx-auto flex items-center justify-center">
                        <svg class="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"></path>
                        </svg>
                      </div>
                      <p class="text-sm text-gray-300 mb-1">DICOM Image Preview</p>
                      <p class="text-xs text-gray-400">${study.description}</p>
                    </div>
                  </div>
                  <div class="space-y-2">
                    <p class="text-sm text-gray-300">Study: ${study.accession}</p>
                    <p class="text-xs text-gray-400">DICOM files available</p>
                    <div class="text-xs text-yellow-400 bg-yellow-900/20 px-3 py-2 rounded">
                      ⚠️ Advanced DICOM viewer unavailable<br/>
                      Using preview mode
                    </div>
                  </div>
                </div>
              </div>
            `
          }
        }
      } catch (err) {
        console.error("Failed to load DICOM files:", err)
        setError("Failed to load DICOM files")
        setIsLoading(false)
      }
    }

    loadDicomFiles()
  }, [study, isDwvLoaded])

  // Navigation functions
  const goToPreviousImage = () => {
    if (dwvAppRef.current && isImageLoaded && currentImage > 0) {
      try {
        const viewController = dwvAppRef.current.getActiveLayerGroup().getActiveViewLayer().getViewController()
        const currentPos = viewController.getCurrentPosition()
        const newPos = { ...currentPos, k: currentImage - 1 }
        viewController.setCurrentPosition(newPos)
      } catch (err) {
        console.warn("Failed to navigate to previous image:", err)
      }
    }
  }

  const goToNextImage = () => {
    if (dwvAppRef.current && isImageLoaded && currentImage < totalImages - 1) {
      try {
        const viewController = dwvAppRef.current.getActiveLayerGroup().getActiveViewLayer().getViewController()
        const currentPos = viewController.getCurrentPosition()
        const newPos = { ...currentPos, k: currentImage + 1 }
        viewController.setCurrentPosition(newPos)
      } catch (err) {
        console.warn("Failed to navigate to next image:", err)
      }
    }
  }

  // Tool handlers
  const handleToolChange = (tool: string) => {
    if (dwvAppRef.current && isImageLoaded) {
      try {
        dwvAppRef.current.setTool(tool)
        setCurrentTool(tool)
      } catch (err) {
        console.warn("Failed to set tool:", err)
      }
    }
  }

  const handleZoomIn = () => {
    if (dwvAppRef.current && isImageLoaded) {
      try {
        const layerGroup = dwvAppRef.current.getActiveLayerGroup()
        const viewLayer = layerGroup.getActiveViewLayer()
        const viewController = viewLayer.getViewController()
        const newZoom = zoom * 1.2
        viewController.setCurrentScale(newZoom)
        setZoom(newZoom)
      } catch (err) {
        console.warn("Failed to zoom in:", err)
      }
    }
  }

  const handleZoomOut = () => {
    if (dwvAppRef.current && isImageLoaded) {
      try {
        const layerGroup = dwvAppRef.current.getActiveLayerGroup()
        const viewLayer = layerGroup.getActiveViewLayer()
        const viewController = viewLayer.getViewController()
        const newZoom = zoom / 1.2
        viewController.setCurrentScale(newZoom)
        setZoom(newZoom)
      } catch (err) {
        console.warn("Failed to zoom out:", err)
      }
    }
  }

  const handleReset = () => {
    if (dwvAppRef.current && isImageLoaded) {
      try {
        const layerGroup = dwvAppRef.current.getActiveLayerGroup()
        const viewLayer = layerGroup.getActiveViewLayer()
        const viewController = viewLayer.getViewController()
        
        // Reset zoom
        viewController.setCurrentScale(1)
        setZoom(1)
        
        // Reset position
        viewController.setCurrentOffset({ x: 0, y: 0 })
        
        // Reset window level/width
        const image = dwvAppRef.current.getImage()
        if (image) {
          const range = image.getDataRange()
          const center = Math.round((range.max + range.min) / 2)
          const width = Math.round(range.max - range.min)
          viewController.setWindowLevel(center, width)
          setWindowLevel([center])
          setWindowWidth([width])
        }
      } catch (err) {
        console.warn("Failed to reset view:", err)
      }
    }
  }

  const handleWindowLevelChange = (values: number[]) => {
    setWindowLevel(values)
    if (dwvAppRef.current && isImageLoaded) {
      try {
        const layerGroup = dwvAppRef.current.getActiveLayerGroup()
        const viewLayer = layerGroup.getActiveViewLayer()
        const viewController = viewLayer.getViewController()
        viewController.setWindowLevel(values[0], windowWidth[0])
      } catch (err) {
        console.warn("Failed to set window level:", err)
      }
    }
  }

  const handleWindowWidthChange = (values: number[]) => {
    setWindowWidth(values)
    if (dwvAppRef.current && isImageLoaded) {
      try {
        const layerGroup = dwvAppRef.current.getActiveLayerGroup()
        const viewLayer = layerGroup.getActiveViewLayer()
        const viewController = viewLayer.getViewController()
        viewController.setWindowLevel(windowLevel[0], values[0])
      } catch (err) {
        console.warn("Failed to set window width:", err)
      }
    }
  }

  // Use AGFA image viewer by default (most reliable)
  if (useAGFAViewer) {
    return <AGFAImageViewer study={study} className={className} onFullscreen={onFullscreen} />
  }

  // Use fallback viewer if DWV is not available
  if (useFallback) {
    return <DicomFallbackViewer study={study} className={className} />
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

      {/* Toolbar */}
      <div className="mb-2 sm:mb-4 space-y-2 sm:space-y-3">
        <TooltipProvider>
          <div className="flex items-center gap-1 flex-wrap">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={currentTool === "Scroll" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleToolChange("Scroll")}
                  className="h-7 sm:h-8 px-2 sm:px-3"
                  disabled={!isImageLoaded}
                >
                  <Move className="h-3 w-3" />
                  <span className="hidden sm:inline ml-1">Pan</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Pan/Scroll through images</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={currentTool === "ZoomAndPan" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleToolChange("ZoomAndPan")}
                  className="h-7 sm:h-8 px-2 sm:px-3"
                  disabled={!isImageLoaded}
                >
                  <ZoomIn className="h-3 w-3" />
                  <span className="hidden sm:inline ml-1">Zoom</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom and Pan</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={currentTool === "WindowLevel" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleToolChange("WindowLevel")}
                  className="h-7 sm:h-8 px-2 sm:px-3"
                  disabled={!isImageLoaded}
                >
                  <Contrast className="h-3 w-3" />
                  <span className="hidden sm:inline ml-1">W/L</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Window Level</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={currentTool === "Draw" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleToolChange("Draw")}
                  className="h-7 sm:h-8 px-2 sm:px-3"
                  disabled={!isImageLoaded}
                >
                  <Ruler className="h-3 w-3" />
                  <span className="hidden sm:inline ml-1">Measure</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Draw and Measure</TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="h-6" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleZoomIn} 
                  className="h-7 sm:h-8 px-2 bg-transparent"
                  disabled={!isImageLoaded}
                >
                  <ZoomIn className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom In</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleZoomOut} 
                  className="h-7 sm:h-8 px-2 bg-transparent"
                  disabled={!isImageLoaded}
                >
                  <ZoomOut className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom Out</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleReset} 
                  className="h-7 sm:h-8 px-2 bg-transparent"
                  disabled={!isImageLoaded}
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reset View</TooltipContent>
            </Tooltip>

            {totalImages > 1 && (
              <>
                <Separator orientation="vertical" className="h-6" />
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={goToPreviousImage} 
                      className="h-7 sm:h-8 px-2 bg-transparent"
                      disabled={!isImageLoaded || currentImage <= 0}
                    >
                      <ChevronLeft className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Previous Image</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={goToNextImage} 
                      className="h-7 sm:h-8 px-2 bg-transparent"
                      disabled={!isImageLoaded || currentImage >= totalImages - 1}
                    >
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Next Image</TooltipContent>
                </Tooltip>
              </>
            )}
          </div>
        </TooltipProvider>

        {/* Window Level Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs">
          <div className="space-y-1">
            <label className="text-muted-foreground">Level: {Math.round(windowLevel[0])}</label>
            <Slider
              value={windowLevel}
              onValueChange={handleWindowLevelChange}
              max={4096}
              min={-1024}
              step={1}
              className="w-full"
              disabled={!isImageLoaded}
            />
          </div>
          <div className="space-y-1">
            <label className="text-muted-foreground">Width: {Math.round(windowWidth[0])}</label>
            <Slider
              value={windowWidth}
              onValueChange={handleWindowWidthChange}
              max={4096}
              min={1}
              step={1}
              className="w-full"
              disabled={!isImageLoaded}
            />
          </div>
        </div>
      </div>

      {/* DICOM Viewer Container */}
      <div className="relative bg-black rounded-lg flex-1 overflow-hidden" style={{minHeight: '400px'}}>
        {isLoading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
            <div className="text-center text-white">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p className="text-sm">Loading DICOM images...</p>
              {loadingProgress > 0 && (
                <div className="w-48 bg-gray-700 rounded-full h-2 mx-auto mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${loadingProgress}%` }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="text-center text-destructive bg-background/90 p-4 rounded-lg max-w-md">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm mb-2">{error}</p>
              <div className="flex gap-2 justify-center">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={async () => {
                    setError(null)
                    setIsLoading(true)
                    
                    // Retry DWV loading
                    try {
                      const dwvLoader = DWVLoader.getInstance()
                      const success = await dwvLoader.loadDWV()
                      if (success) {
                        setIsDwvLoaded(true)
                        // Trigger re-initialization
                        if (study) {
                          // Reload DICOM files
                          const event = new CustomEvent('retryDicom')
                          window.dispatchEvent(event)
                        }
                      } else {
                        setError("DICOM viewer library still not available")
                      }
                    } catch (err) {
                      setError("Retry failed. Please refresh the page.")
                    } finally {
                      setIsLoading(false)
                    }
                  }}
                >
                  Retry DWV
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    window.location.reload()
                  }}
                >
                  Refresh Page
                </Button>
              </div>
            </div>
          </div>
        )}

        {!isDwvLoaded && !error && (
          <div className="flex items-center justify-center h-full text-white">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p className="text-sm">Initializing DICOM viewer...</p>
            </div>
          </div>
        )}

        {/* DWV Container */}
        <div ref={containerRef} className="w-full h-full" />

        {/* Image Navigation Overlay */}
        {totalImages > 1 && isImageLoaded && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="bg-black/70 text-white px-3 py-1 rounded-full text-xs flex items-center gap-2">
              <span>Image {currentImage + 1} of {totalImages}</span>
            </div>
          </div>
        )}

        {/* Zoom indicator */}
        {isImageLoaded && zoom !== 1 && (
          <div className="absolute top-4 left-4">
            <div className="bg-black/70 text-white px-2 py-1 rounded text-xs">
              {Math.round(zoom * 100)}%
            </div>
          </div>
        )}
      </div>

      {/* Study Info */}
      <div className="mt-3 text-xs text-muted-foreground">
        <p className="text-pretty">{study.description}</p>
        {study.date && <p className="mt-1">Study Date: {study.date}</p>}
        {study.modality && <p className="mt-1">Modality: {study.modality}</p>}
      </div>
    </Card>
  )
}