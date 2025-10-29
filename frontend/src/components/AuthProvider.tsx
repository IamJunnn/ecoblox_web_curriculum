'use client'

import { useEffect } from 'react'
import useAuthStore from '@/store/authStore'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const checkAuth = useAuthStore((state) => state.checkAuth)

  useEffect(() => {
    // Restore authentication state from localStorage on app load
    checkAuth()
  }, [checkAuth])

  return <>{children}</>
}
