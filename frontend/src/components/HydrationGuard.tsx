'use client'

import { useEffect, useState } from 'react'

interface HydrationGuardProps {
  children: React.ReactNode
}

/**
 * HydrationGuard prevents hydration mismatches by only rendering children after hydration is complete
 * This is necessary when using Zustand persist with Next.js App Router
 */
export default function HydrationGuard({ children }: HydrationGuardProps) {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    // This effect only runs on the client after hydration
    setIsHydrated(true)
  }, [])

  // During SSR and initial hydration, render a loading state
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎮</div>
          <div className="text-xl font-semibold text-gray-700">Loading...</div>
        </div>
      </div>
    )
  }

  // After hydration, render the actual content
  return <>{children}</>
}
