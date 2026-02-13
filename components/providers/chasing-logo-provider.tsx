'use client'

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'

const STORAGE_KEY = 'navbar-chasing-logo' as const

type ChasingLogoContextValue = {
  chasingLogoEnabled: boolean
  setChasingLogoEnabled: (value: boolean) => void
}

const ChasingLogoContext = createContext<ChasingLogoContextValue | null>(null)

function readStoredChasingLogo(): boolean {
  if (typeof window === 'undefined') return true
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored !== 'false'
  } catch {
    return true
  }
}

export function ChasingLogoProvider({ children }: { children: React.ReactNode }) {
  const [chasingLogoEnabled, setChasingLogoEnabledState] = useState(true)

  useEffect(() => {
    setChasingLogoEnabledState(readStoredChasingLogo())
  }, [])

  const setChasingLogoEnabled = useCallback((value: boolean) => {
    setChasingLogoEnabledState(value)
    try {
      localStorage.setItem(STORAGE_KEY, String(value))
    } catch {
      // ignore
    }
  }, [])

  const value: ChasingLogoContextValue = {
    chasingLogoEnabled,
    setChasingLogoEnabled
  }

  return (
    <ChasingLogoContext.Provider value={value}>{children}</ChasingLogoContext.Provider>
  )
}

export function useChasingLogo() {
  const ctx = useContext(ChasingLogoContext)
  if (!ctx) {
    throw new Error('useChasingLogo must be used within ChasingLogoProvider')
  }
  return ctx
}
