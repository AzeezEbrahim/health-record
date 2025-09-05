"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar, ArrowLeft, ArrowRight } from "lucide-react"
import type { Study } from "@/lib/types"

interface StudyBrowserProps {
  studies: Study[]
  selectedStudy: Study | null
  onStudySelect: (study: Study) => void
  className?: string
}

export function StudyBrowser({ studies, selectedStudy, onStudySelect, className }: StudyBrowserProps) {
  // Sort studies by date (newest first)
  const sortedStudies = [...studies].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  // Find current study index for navigation
  const currentIndex = selectedStudy ? sortedStudies.findIndex((s) => s.accession === selectedStudy.accession) : -1
  const progress = currentIndex >= 0 ? ((currentIndex + 1) / sortedStudies.length) * 100 : 0

  // Navigation functions
  const navigateToNext = () => {
    if (currentIndex < sortedStudies.length - 1) {
      onStudySelect(sortedStudies[currentIndex + 1])
    }
  }

  const navigateToPrevious = () => {
    if (currentIndex > 0) {
      onStudySelect(sortedStudies[currentIndex - 1])
    }
  }

  return (
    <div className={`h-full flex flex-col space-y-3 ${className || ''}`}>
      {/* Navigation Controls */}
      <Card className="p-3 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-medium">Studies</h2>
            <Badge variant="secondary" className="text-xs">
              {sortedStudies.length}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={navigateToPrevious}
              disabled={currentIndex <= 0}
              className="h-7 w-7 p-0"
            >
              <ArrowLeft className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={navigateToNext}
              disabled={currentIndex >= sortedStudies.length - 1}
              className="h-7 w-7 p-0"
            >
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Progress Indicator */}
        {selectedStudy && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Study {currentIndex + 1} of {sortedStudies.length}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1" />
          </div>
        )}
      </Card>

      {/* Study List */}
      <Card className="p-2 flex-1 overflow-y-auto">
        <div className="space-y-1">
          {sortedStudies.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No studies found</p>
            </div>
          ) : (
            sortedStudies.map((study) => (
              <Button
                key={study.accession}
                variant={selectedStudy?.accession === study.accession ? "default" : "ghost"}
                className="w-full justify-start h-auto p-3"
                onClick={() => onStudySelect(study)}
              >
                <div className="text-left w-full">
                  <div className="flex items-center justify-between mb-1">
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        study.type === "MRI"
                          ? "border-blue-200 text-blue-700"
                          : study.type === "CT"
                            ? "border-green-200 text-green-700"
                            : study.type === "Ultrasound"
                              ? "border-purple-200 text-purple-700"
                              : "border-gray-200 text-gray-700"
                      }`}
                    >
                      {study.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{study.date}</span>
                  </div>

                  <p className="text-sm font-medium text-pretty mb-1 leading-tight">{study.description}</p>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>#{study.accession}</span>
                    <div className="flex items-center gap-2">
                      {study.seriesCount && <span>{study.seriesCount} series</span>}
                      <span>{study.imageCount || 0} images</span>
                    </div>
                  </div>
                </div>
              </Button>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}