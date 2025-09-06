"use client"

import { useEffect, useState } from "react"

interface HydrationBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function HydrationBoundary({ children, fallback = null }: HydrationBoundaryProps) {
  const [isHydrated, setIsHydrated] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Handle hydration errors gracefully
  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      if (error.message.includes('hydration') || error.message.includes('Hydration')) {
        console.warn('Hydration mismatch detected, suppressing error for better UX')
        setHasError(true)
      }
    }

    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

  if (!isHydrated || hasError) {
    return <>{fallback}</>
  }

  return <>{children}</>
}