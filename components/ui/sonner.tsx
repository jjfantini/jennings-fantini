"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

import { cn } from "@/lib/utils"

const Toaster = ({ className, ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="top-center"
      className={cn("toaster group", className)}
      toastOptions={{
        classNames: {
          toast: cn(
            "group toast group-[.toaster]:border-border group-[.toaster]:bg-background",
            "group-[.toaster]:text-foreground group-[.toaster]:shadow-lg"
          ),
          title: "group-[.toast]:text-sm group-[.toast]:font-medium",
          description: "group-[.toast]:text-xs group-[.toast]:text-muted-foreground",
          success: "[&[data-type=success]]:!border-emerald-500/40",
          error: "[&[data-type=error]]:!border-red-500/40",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
