"use client"

import { useState, useEffect } from "react"
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

export function AGFAImageViewer({ study, className, onFullscreen }: AGFAImageViewerProps) {
  const [series, setSeries] = useState<AGFASeries[]>([])
  const [currentSeries, setCurrentSeries] = useState(0)
  const [currentImage, setCurrentImage] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playSpeed, setPlaySpeed] = useState(500) // ms between frames
  const [error, setError] = useState<string | null>(null)

  // Generate series data based on study
  useEffect(() => {
    if (!study) {
      setSeries([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Generate series based on study accession
      const seriesData: AGFASeries[] = []
      
      // Map study accession to series ranges (based on the INDEX.HTM structure)
      const studySeriesMap: Record<string, { start: number, count: number, seriesInfo: Array<{title: string, imageCount: number}> }> = {
        "209691018": {
          start: 11,
          count: 32,
          seriesInfo: [
            { title: "dADC", imageCount: 25 },
            { title: "sB0", imageCount: 25 },
            { title: "sB1000", imageCount: 25 },
            { title: "AX-T2W_TSE_ComforTone", imageCount: 25 },
            { title: "s3D_PCA_SINUS SENSE", imageCount: 320 },
            { title: "MRV", imageCount: 35 },
            { title: "MRA", imageCount: 20 },
            { title: "SWI", imageCount: 100 },
            { title: "3D FLAIR", imageCount: 300 },
            { title: "T2W_3D_DRIVE", imageCount: 48 },
          ]
        },
        "209707743": {
          start: 52,
          count: 32,
          seriesInfo: [
            { title: "sB0", imageCount: 35 },
            { title: "sB1000", imageCount: 35 },
            { title: "dADC map", imageCount: 35 },
            { title: "T2W_TSE PSS", imageCount: 25 },
            { title: "SWI", imageCount: 100 },
            { title: "T2W_FFE", imageCount: 25 },
            { title: "FLAIR_longTR_SPIR", imageCount: 25 },
            { title: "sAX-3D_T1W", imageCount: 107 },
          ]
        },
        "213636532": {
          start: 86,
          count: 25,
          seriesInfo: [
            { title: "sB0", imageCount: 35 },
            { title: "sB1000", imageCount: 35 },
            { title: "dADC map", imageCount: 35 },
            { title: "T2W_TSE PSS", imageCount: 25 },
            { title: "T2W_FFE", imageCount: 25 },
            { title: "FLAIR_longTR_SPIR", imageCount: 25 },
            { title: "3D_Brain_VIEW_FLAIR_1nsa", imageCount: 250 },
          ]
        },
        "213637042": {
          start: 109,
          count: 3,
          seriesInfo: [
            { title: "ULTRASOUND DOPPLER OF CAROTID & VERTEBRAL ARTERIES", imageCount: 11 },
          ]
        },
        "215512035": {
          start: 116,
          count: 27,
          seriesInfo: [
            { title: "sB0", imageCount: 35 },
            { title: "sB1000", imageCount: 35 },
            { title: "dADC map", imageCount: 35 },
            { title: "T2W_TSE PSS", imageCount: 25 },
            { title: "3D_Brain_VIEW_FLAIR_1nsa", imageCount: 250 },
          ]
        },
        "215516692": {
          start: 139,
          count: 9,
          seriesInfo: [
            { title: "Surview", imageCount: 2 },
            { title: "STD 2mm", imageCount: 87 },
            { title: "NECK C-", imageCount: 143 },
            { title: "Brain Perfusion", imageCount: 544 },
            { title: "CTA 2mm", imageCount: 188 },
            { title: "AX MIP", imageCount: 188 },
            { title: "COR MIP", imageCount: 45 },
            { title: "SAG MIP", imageCount: 37 },
            { title: "CTV 2mm", imageCount: 185 },
          ]
        }
      }

      const studyInfo = studySeriesMap[study.accession]
      if (!studyInfo) {
        setError("No image data available for this study")
        setIsLoading(false)
        return
      }

      // Generate series for the first few available series (limit for performance)
      const maxSeries = Math.min(studyInfo.seriesInfo.length, 5) // Limit to 5 series for performance
      
      for (let i = 0; i < maxSeries; i++) {
        const seriesInfo = studyInfo.seriesInfo[i]
        const seriesId = (studyInfo.start + i).toString().padStart(8, '0')
        
        const images: string[] = []
        const thumbnails: string[] = []
        
        // Generate image paths (limit to first 20 images per series for performance)
        const imageLimit = Math.min(seriesInfo.imageCount, 20)
        
        for (let j = 1; j <= imageLimit; j++) {
          const imageId = (parseInt(seriesId) + j - 1).toString().padStart(8, '0')
          images.push(`/data/IHE_PDI/IMAGES/${imageId}.00001.jpg`)
          thumbnails.push(`/data/IHE_PDI/THUMBS/${imageId}.00001.jpg`)
        }

        seriesData.push({
          id: seriesId,
          title: seriesInfo.title,
          images,
          thumbnails,
          imageCount: seriesInfo.imageCount
        })
      }

      setSeries(seriesData)
      setCurrentSeries(0)
      setCurrentImage(0)
    } catch (err) {
      console.error("Error loading series data:", err)
      setError("Failed to load image series")
    } finally {
      setIsLoading(false)
    }
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
          <Badge variant="default" className="text-xs bg-green-600">
            AGFA Native
          </Badge>
          {currentSeriesData && (
            <Badge variant="secondary" className="text-xs">
              Series {currentSeries + 1}/{series.length}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Badge variant="secondary" className="text-xs">
            {series.reduce((total, s) => total + s.images.length, 0)} images
          </Badge>
          {onFullscreen && (
            <Button variant="outline" size="sm" onClick={onFullscreen} className="h-7 px-2 bg-transparent">
              <Maximize2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="mb-2 sm:mb-4 space-y-2">
        <div className="flex items-center gap-1 flex-wrap">
          {/* Series Navigation */}
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

          {/* Image Navigation */}
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousImage}
            disabled={!currentSeriesData || currentSeriesData.images.length <= 1}
            className="h-7 px-2"
          >
            <ChevronLeft className="h-3 w-3" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={goToNextImage}
            disabled={!currentSeriesData || currentSeriesData.images.length <= 1}
            className="h-7 px-2"
          >
            <ChevronRight className="h-3 w-3" />
          </Button>

          {/* Playback Controls */}
          <Button
            variant="outline"
            size="sm"
            onClick={togglePlayback}
            disabled={!currentSeriesData || currentSeriesData.images.length <= 1}
            className="h-7 px-2"
          >
            {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          </Button>

          {/* Zoom Controls */}
          <Button variant="outline" size="sm" onClick={handleZoomIn} className="h-7 px-2">
            <ZoomIn className="h-3 w-3" />
          </Button>

          <Button variant="outline" size="sm" onClick={handleZoomOut} className="h-7 px-2">
            <ZoomOut className="h-3 w-3" />
          </Button>

          <Button variant="outline" size="sm" onClick={resetZoom} className="h-7 px-2">
            {Math.round(zoom * 100)}%
          </Button>
        </div>

        {/* Series Selector */}
        {series.length > 1 && (
          <div className="flex gap-1 flex-wrap">
            {series.map((s, index) => (
              <Button
                key={s.id}
                variant={index === currentSeries ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setCurrentSeries(index)
                  setCurrentImage(0)
                }}
                className="h-7 px-2 text-xs"
              >
                {s.title}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Image Viewer */}
      <div className="relative bg-black rounded-lg flex-1 overflow-hidden min-h-[400px]">
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
          <div className="w-full h-full flex items-center justify-center overflow-hidden">
            <img
              src={currentImageSrc}
              alt={`${currentSeriesData?.title} - Image ${currentImage + 1}`}
              className="max-w-full max-h-full object-contain transition-transform duration-200"
              style={{ 
                transform: `scale(${zoom})`,
                imageRendering: 'pixelated'
              }}
              onError={(e) => {
                // Fallback to thumbnail if main image fails
                const target = e.target as HTMLImageElement
                if (currentThumbnail && target.src !== currentThumbnail) {
                  target.src = currentThumbnail
                }
              }}
            />
          </div>
        )}

        {/* Image Info Overlay */}
        {currentSeriesData && !isLoading && (
          <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-2 rounded text-sm">
            <div>{currentSeriesData.title}</div>
            <div>Image {currentImage + 1} of {currentSeriesData.images.length}</div>
            {zoom !== 1 && <div>Zoom: {Math.round(zoom * 100)}%</div>}
          </div>
        )}

        {/* Play Speed Control */}
        {isPlaying && (
          <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-2 rounded text-sm">
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
        <p>Study: {study.accession} • Date: {study.date} • {series.length} series available</p>
      </div>
    </Card>
  )
}
