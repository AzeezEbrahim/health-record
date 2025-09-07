"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  RotateCw,
  Download,
  Play,
  Pause,
  SkipBack,
  SkipForward
} from "lucide-react"
import type { Study } from "@/lib/types"
import { AGFAParser, type AGFASeries as ParsedAGFASeries } from "@/lib/agfa-parser"

interface AGFAImageViewerProps {
  study: Study | null
  className?: string
  onFullscreen?: () => void
}

interface AGFASeries {
  id: string
  title: string
  images: string[]
  thumbnails: string[]
  imageCount: number
}

// Define the default FPS and calculate the default play speed in ms
const DEFAULT_FPS = 8
const DEFAULT_PLAY_SPEED = 1000 / DEFAULT_FPS

export function AGFAImageViewer({ study, className, onFullscreen }: AGFAImageViewerProps) {
  const [series, setSeries] = useState<AGFASeries[]>([])
  const [currentSeries, setCurrentSeries] = useState(0)
  const [currentImage, setCurrentImage] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playSpeed, setPlaySpeed] = useState(DEFAULT_PLAY_SPEED) // ms between frames, default for 8 fps
  const [error, setError] = useState<string | null>(null)
  const lastScrollTime = useRef<number>(0)
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null)

  // Load series data from AGFA parser
  useEffect(() => {
    if (!study) {
      setSeries([])
      return
    }

    const loadSeriesData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        console.log(`Loading AGFA series data for study: ${study.accession}`)
        
        // Use the AGFA parser to get correct series data
        const agfaSeries = await AGFAParser.getStudySeriesData(study.accession)
        
        if (agfaSeries.length === 0) {
          setError("No image series found for this study")
          setIsLoading(false)
          return
        }

        console.log(`Found ${agfaSeries.length} series for study ${study.accession}`)

        // Convert to our format and generate image URLs
        const seriesData: AGFASeries[] = []
        
        // Load all series (remove artificial limit)
        const seriesToLoad = agfaSeries
        
        for (const agfaSeriesItem of seriesToLoad) {
          const { images, thumbnails } = AGFAParser.generateImageURLsForSeries(agfaSeriesItem)
          
          // Load ALL images for the series (no artificial limit)
          const limitedImages = images
          const limitedThumbnails = thumbnails
          
          seriesData.push({
            id: agfaSeriesItem.seriesId,
            title: agfaSeriesItem.title,
            images: limitedImages,
            thumbnails: limitedThumbnails,
            imageCount: agfaSeriesItem.imageCount
          })
        }

        console.log(`Successfully loaded ${seriesData.length} series for study ${study.accession}:`)
        seriesData.forEach((s, i) => {
          console.log(`  ${i + 1}. SerNr: ${s.id} - ${s.title} (${s.imageCount} total, showing ${s.images.length})`)
        })
        
        // Debug: Log first few image URLs to verify they're correct
        if (seriesData.length > 0) {
          console.log("First series sample images:", seriesData[0].images.slice(0, 3))
          console.log("First series sample thumbnails:", seriesData[0].thumbnails.slice(0, 3))
        }
        
        setSeries(seriesData)
        setCurrentSeries(0)
        setCurrentImage(0)
      } catch (err) {
        console.error("Error loading AGFA series data:", err)
        setError("Failed to load image series from AGFA data")
      } finally {
        setIsLoading(false)
      }
    }

    loadSeriesData()
  }, [study])

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying || series.length === 0) return

    const interval = setInterval(() => {
      setCurrentImage(prev => {
        const maxImages = series[currentSeries]?.images.length || 0
        return prev < maxImages - 1 ? prev + 1 : 0
      })
    }, playSpeed)

    return () => clearInterval(interval)
  }, [isPlaying, playSpeed, currentSeries, series])

  const currentSeriesData = series[currentSeries]
  const currentImageSrc = currentSeriesData?.images[currentImage]
  const currentThumbnail = currentSeriesData?.thumbnails[currentImage]
  const viewerRef = useRef<HTMLDivElement>(null)

  // Handle wheel events with native event listener to prevent page scroll
  // Implements one-image-per-scroll throttling for smooth navigation
  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer) return

    const handleWheelEvent = (e: WheelEvent) => {
      e.preventDefault()
      e.stopPropagation()

      if (e.ctrlKey || e.metaKey) {
        // Ctrl + scroll = zoom
        const delta = e.deltaY > 0 ? 0.9 : 1.1
        setZoom(prev => Math.max(0.1, Math.min(5, prev * delta)))
        console.log('🔍 SCROLL: Zoom event detected')
      } else {
        // Regular scroll = navigate images (one image per scroll event)
        if (currentSeriesData && currentSeriesData.images.length > 1) {
          const currentTime = Date.now()
          const timeSinceLastScroll = currentTime - lastScrollTime.current

          console.log(`🔍 SCROLL: DeltaY=${e.deltaY}, TimeSinceLast=${timeSinceLastScroll}ms, Throttled=${timeSinceLastScroll <= 100}`)

          // Throttle to ensure one image change per scroll event (minimum 100ms between changes)
          if (timeSinceLastScroll > 100) {
            lastScrollTime.current = currentTime
            console.log('✅ SCROLL: Processing image change')

            // Clear any existing timeout
            if (scrollTimeout.current) {
              clearTimeout(scrollTimeout.current)
            }

            // Determine scroll direction and navigate
            const isScrollDown = e.deltaY > 0
            const direction = isScrollDown ? 'DOWN' : 'UP'

            const newImageIndex = isScrollDown
              ? (currentImage < currentSeriesData.images.length - 1 ? currentImage + 1 : 0)
              : (currentImage > 0 ? currentImage - 1 : currentSeriesData.images.length - 1)

            console.log(`🎯 SCROLL: ${direction} - Image ${currentImage} → ${newImageIndex}`)

            setCurrentImage(newImageIndex)

            // Set a timeout to reset scroll tracking after a short delay
            scrollTimeout.current = setTimeout(() => {
              lastScrollTime.current = 0
              console.log('🔄 SCROLL: Reset scroll tracking')
            }, 200)
          } else {
            console.log('⏱️ SCROLL: Throttled - too soon after last scroll')
          }
        } else {
          console.log('❌ SCROLL: No series data or insufficient images')
        }
      }
    }

    viewer.addEventListener('wheel', handleWheelEvent, { passive: false })
    console.log('🎧 SCROLL: Event listener attached to viewer')

    return () => {
      viewer.removeEventListener('wheel', handleWheelEvent)
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current)
      }
      console.log('🧹 SCROLL: Event listener removed')
    }
  }, [currentSeriesData, currentImage])

  const goToPreviousImage = () => {
    if (currentSeriesData) {
      setCurrentImage(prev => prev > 0 ? prev - 1 : currentSeriesData.images.length - 1)
    }
  }

  const goToNextImage = () => {
    if (currentSeriesData) {
      setCurrentImage(prev => prev < currentSeriesData.images.length - 1 ? prev + 1 : 0)
    }
  }

  const goToPreviousSeries = () => {
    if (series.length > 0) {
      setCurrentSeries(prev => prev > 0 ? prev - 1 : series.length - 1)
      setCurrentImage(0)
    }
  }

  const goToNextSeries = () => {
    if (series.length > 0) {
      setCurrentSeries(prev => prev < series.length - 1 ? prev + 1 : 0)
      setCurrentImage(0)
    }
  }

  const togglePlayback = () => {
    setIsPlaying(!isPlaying)
  }

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 5))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.1))
  }

  const resetZoom = () => {
    setZoom(1)
  }


  if (!study) {
    return (
      <Card className={`p-4 flex flex-col ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">Medical Image Viewer</h3>
        </div>
        <div className="bg-muted rounded-lg flex-1 min-h-[400px] flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Maximize2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Select a study to view medical images</p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className={`p-2 sm:p-4 flex flex-col ${className}`}>
      <div className="flex items-center justify-between mb-2 sm:mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-sm sm:text-base">Medical Image Viewer</h3>
          <Badge variant="outline" className="text-xs">
            {study.type}
          </Badge>

        </div>
        <div className="flex items-center gap-1">
          {onFullscreen && (
            <Button variant="outline" size="sm" onClick={onFullscreen} className="h-7 px-2 bg-transparent">
              <Maximize2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="mb-2 sm:mb-4 space-y-2">
        {/* Primary Controls - Always Visible */}
        <div className="flex items-center justify-between">
          {/* Navigation Controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousImage}
              disabled={!currentSeriesData || currentSeriesData.images.length <= 1}
              className="h-8 px-3"
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={togglePlayback}
              disabled={!currentSeriesData || currentSeriesData.images.length <= 1}
              className="h-8 px-3"
            >
              {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={goToNextImage}
              disabled={!currentSeriesData || currentSeriesData.images.length <= 1}
              className="h-8 px-3"
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={handleZoomOut} className="h-8 px-2">
              <ZoomOut className="h-3 w-3" />
            </Button>
            <Button variant="outline" size="sm" onClick={resetZoom} className="h-8 px-3 min-w-[60px]">
              {Math.round(zoom * 100)}%
            </Button>
            <Button variant="outline" size="sm" onClick={handleZoomIn} className="h-8 px-2">
              <ZoomIn className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Secondary Controls - Desktop Only */}
        <div className="hidden sm:flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousSeries}
            disabled={series.length <= 1}
            className="h-7 px-2"
          >
            <SkipBack className="h-3 w-3" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={goToNextSeries}
            disabled={series.length <= 1}
            className="h-7 px-2"
          >
            <SkipForward className="h-3 w-3" />
          </Button>
        </div>

        {/* Series Selector */}
        {series.length > 1 && (
          <div className="space-y-2">

            <div className="flex gap-1 flex-wrap max-h-24 overflow-y-auto">
              {series.map((s, index) => (
                <Button
                  key={s.id}
                  variant={index === currentSeries ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setCurrentSeries(index)
                    setCurrentImage(0)
                  }}
                  className="h-8 px-2 text-xs whitespace-nowrap"
                  title={`SerNr: ${s.id} - ${s.title} (${s.imageCount} images)`}
                >
                  {s.title}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Image Viewer */}
      <div ref={viewerRef} className="relative bg-black rounded-lg flex-1 overflow-hidden min-h-[400px]">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
              <p className="text-sm">Loading medical images...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="text-center text-red-400 bg-black/80 p-4 rounded">
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {currentImageSrc && !isLoading && !error && (
          <div className="w-full h-full flex items-center justify-center overflow-hidden relative">
            <img
              src={currentImageSrc}
              alt={`${currentSeriesData?.title} - Image ${currentImage + 1}`}
              className="max-w-full max-h-full object-contain transition-transform duration-200"
              style={{ 
                transform: `scale(${zoom})`,
                imageRendering: zoom > 2 ? 'pixelated' : 'auto'
              }}
              onError={(e) => {
                // Fallback to thumbnail if main image fails
                const target = e.target as HTMLImageElement
                if (currentThumbnail && target.src !== currentThumbnail) {
                  target.src = currentThumbnail
                }
              }}
              draggable={false}
            />
            
            {/* Left/Right Side Indicators */}
            <div className="absolute top-4 left-4 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
              R
            </div>
            <div className="absolute top-4 right-4 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
              L
            </div>
          </div>
        )}

        {/* Image Info Overlay */}
        {currentSeriesData && !isLoading && (
          <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-2 rounded text-sm">
            <div>{currentSeriesData.title}</div>
            <div>Image {currentImage + 1} of {currentSeriesData.images.length}</div>
            <div className="text-xs text-gray-300">Total: {currentSeriesData.imageCount} images</div>
            {zoom !== 1 && <div className="text-xs mt-1">Zoom: {Math.round(zoom * 100)}%</div>}
          </div>
        )}

        {/* Play Speed Control */}
        {isPlaying && (
          <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-2 rounded text-sm">
            <div className="flex items-center gap-2">
              <span>Speed:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPlaySpeed(Math.min(playSpeed + 100, 2000))}
                className="h-6 px-2 bg-transparent text-white border-gray-600"
              >
                -
              </Button>
              <span>{(1000/playSpeed).toFixed(1)} fps</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPlaySpeed(Math.max(playSpeed - 100, 100))}
                className="h-6 px-2 bg-transparent text-white border-gray-600"
              >
                +
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Study Info */}
      <div className="mt-3 text-xs text-muted-foreground">
        <p>{study.description}</p>
        <p>{study.date} </p>
      </div>
    </Card>
  )
}
