"use client"

import * as React from "react"
import { ThemeProvider } from "./theme-provider"
import { TooltipProvider } from "./tooltip-provider"
import { ChasingLogoProvider } from "./chasing-logo-provider"
import { NavbarProvider } from "./navbar-provider"
import { SonnerProvider } from "./sonner-provider"
import { Analytics } from "@vercel/analytics/react"

export function RootProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <NavbarProvider>
          <ChasingLogoProvider>
            {children}
            <Analytics />
            <SonnerProvider />
          </ChasingLogoProvider>
        </NavbarProvider>
      </TooltipProvider>
    </ThemeProvider>
  )
}
