"use client"

import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Calendar, Search, ChevronUp, ChevronDown, Filter, ArrowLeft, ArrowRight } from "lucide-react"
import type { Study } from "@/lib/types"

interface StudyBrowserProps {
  studies: Study[]
  selectedStudy: Study | null
  onStudySelect: (study: Study) => void
}

type SortOption = "date-desc" | "date-asc" | "type" | "accession"

export function StudyBrowser({ studies, selectedStudy, onStudySelect }: StudyBrowserProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>("date-desc")
  const [filterType, setFilterType] = useState<string>("all")
  const [focusedIndex, setFocusedIndex] = useState(0)

  // Get unique study types for filtering
  const studyTypes = Array.from(new Set(studies.map((study) => study.type)))

  // Filter and sort studies
  const filteredStudies = studies
    .filter((study) => {
      const matchesSearch =
        study.description.toLowerCase().includes(searchTerm.toLowerCase()) || study.accession.includes(searchTerm)
      const matchesType = filterType === "all" || study.type === filterType
      return matchesSearch && matchesType
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        case "date-asc":
          return new Date(a.date).getTime() - new Date(b.date).getTime()
        case "type":
          return a.type.localeCompare(b.type)
        case "accession":
          return a.accession.localeCompare(b.accession)
        default:
          return 0
      }
    })

  // Find current study index for navigation
  const currentIndex = selectedStudy ? filteredStudies.findIndex((s) => s.accession === selectedStudy.accession) : -1
  const progress = currentIndex >= 0 ? ((currentIndex + 1) / filteredStudies.length) * 100 : 0

  // Navigation functions
  const navigateToNext = useCallback(() => {
    if (currentIndex < filteredStudies.length - 1) {
      onStudySelect(filteredStudies[currentIndex + 1])
    }
  }, [currentIndex, filteredStudies, onStudySelect])

  const navigateToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      onStudySelect(filteredStudies[currentIndex - 1])
    }
  }, [currentIndex, filteredStudies, onStudySelect])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement) return // Don't interfere with input fields

      switch (event.key) {
        case "ArrowUp":
          event.preventDefault()
          if (focusedIndex > 0) {
            setFocusedIndex(focusedIndex - 1)
          }
          break
        case "ArrowDown":
          event.preventDefault()
          if (focusedIndex < filteredStudies.length - 1) {
            setFocusedIndex(focusedIndex + 1)
          }
          break
        case "Enter":
          event.preventDefault()
          if (filteredStudies[focusedIndex]) {
            onStudySelect(filteredStudies[focusedIndex])
          }
          break
        case "ArrowLeft":
          event.preventDefault()
          navigateToPrevious()
          break
        case "ArrowRight":
          event.preventDefault()
          navigateToNext()
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [focusedIndex, filteredStudies, onStudySelect, navigateToNext, navigateToPrevious])

  // Update focused index when selected study changes
  useEffect(() => {
    if (selectedStudy) {
      const index = filteredStudies.findIndex((s) => s.accession === selectedStudy.accession)
      if (index >= 0) {
        setFocusedIndex(index)
      }
    }
  }, [selectedStudy, filteredStudies])

  return (
    <div className="space-y-4">
      {/* Navigation Controls */}
      <Card className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-medium">Studies</h2>
            <Badge variant="secondary" className="text-xs">
              {filteredStudies.length}
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
              disabled={currentIndex >= filteredStudies.length - 1}
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
                Study {currentIndex + 1} of {filteredStudies.length}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1" />
          </div>
        )}
      </Card>

      {/* Search and Filter Controls */}
      <Card className="p-3">
        <div className="space-y-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-3 w-3 text-muted-foreground" />
            <Input
              placeholder="Search studies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-7 h-8 text-sm"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="h-8 text-xs">
                <div className="flex items-center gap-1">
                  <Filter className="h-3 w-3" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {studyTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">
                  <div className="flex items-center gap-1">
                    <ChevronDown className="h-3 w-3" />
                    Newest First
                  </div>
                </SelectItem>
                <SelectItem value="date-asc">
                  <div className="flex items-center gap-1">
                    <ChevronUp className="h-3 w-3" />
                    Oldest First
                  </div>
                </SelectItem>
                <SelectItem value="type">By Type</SelectItem>
                <SelectItem value="accession">By Accession</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Study List */}
      <Card className="p-2 flex-1 max-h-[400px] overflow-y-auto">
        <div className="space-y-1">
          {filteredStudies.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No studies found</p>
              <p className="text-xs">Try adjusting your search or filters</p>
            </div>
          ) : (
            filteredStudies.map((study, index) => (
              <Button
                key={study.accession}
                variant={selectedStudy?.accession === study.accession ? "default" : "ghost"}
                className={`w-full justify-start h-auto p-3 ${
                  focusedIndex === index ? "ring-2 ring-ring ring-offset-2" : ""
                }`}
                onClick={() => onStudySelect(study)}
                onMouseEnter={() => setFocusedIndex(index)}
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

      {/* Keyboard Shortcuts Help */}
      <Card className="p-2">
        <div className="text-xs text-muted-foreground space-y-1">
          <p className="font-medium">Keyboard Shortcuts:</p>
          <div className="grid grid-cols-2 gap-1 text-xs">
            <span>↑↓ Navigate</span>
            <span>Enter Select</span>
            <span>←→ Prev/Next</span>
            <span>/ Search</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
