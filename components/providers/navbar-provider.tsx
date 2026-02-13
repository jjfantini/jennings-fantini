'use client'

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'

export type NavbarCorner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

const STORAGE_KEYS = {
  collapsed: 'navbar-collapsed',
  corner: 'navbar-corner'
} as const

type NavbarContextValue = {
  collapsed: boolean
  setCollapsed: (value: boolean) => void
  corner: NavbarCorner
  setCorner: (value: NavbarCorner) => void
}

const NavbarContext = createContext<NavbarContextValue | null>(null)

function readStoredCollapsed(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.collapsed)
    return stored === 'true'
  } catch {
    return false
  }
}

function readStoredCorner(): NavbarCorner {
  if (typeof window === 'undefined') return 'bottom-right'
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.corner)
    if (
      stored === 'top-left' ||
      stored === 'top-right' ||
      stored === 'bottom-left' ||
      stored === 'bottom-right'
    ) {
      return stored
    }
  } catch {
    // ignore
  }
  return 'bottom-right'
}

export function NavbarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsedState] = useState(false)
  const [corner, setCornerState] = useState<NavbarCorner>('bottom-right')

  useEffect(() => {
    setCollapsedState(readStoredCollapsed())
    setCornerState(readStoredCorner())
  }, [])

  const setCollapsed = useCallback((value: boolean) => {
    setCollapsedState(value)
    try {
      localStorage.setItem(STORAGE_KEYS.collapsed, String(value))
    } catch {
      // ignore
    }
  }, [])

  const setCorner = useCallback((value: NavbarCorner) => {
    setCornerState(value)
    try {
      localStorage.setItem(STORAGE_KEYS.corner, value)
    } catch {
      // ignore
    }
  }, [])

  const value: NavbarContextValue = {
    collapsed,
    setCollapsed,
    corner,
    setCorner
  }

  return <NavbarContext.Provider value={value}>{children}</NavbarContext.Provider>
}

export function useNavbar() {
  const ctx = useContext(NavbarContext)
  if (!ctx) {
    throw new Error('useNavbar must be used within NavbarProvider')
  }
  return ctx
}

