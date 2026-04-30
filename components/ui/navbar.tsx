'use client'

import Link from 'next/link'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Menu, Settings2 } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

import { ModeToggle } from '@/components/ui/mode-toggle'
import { buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { WebsiteSettings } from '@/components/ui/website-settings'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { Dock, DockIcon } from '@/components/magicui/dock'
import { DATA } from '@/data/personal-details'
import { useIsMobile } from '@/lib/hooks/use-mobile-device'
import { useNavbar, type NavbarCorner } from '@/components/providers/navbar-provider'

const iconSizeClass = (compact: boolean) =>
  compact ? 'size-8 rounded-full' : 'size-12 rounded-full'

function getSettingsPanelClasses(corner: NavbarCorner, compact: boolean): string {
  const base = 'absolute z-[60] w-[min(calc(100vw-2rem),22rem)]'

  if (!compact) {
    return cn(base, 'bottom-full right-0 mb-3')
  }

  switch (corner) {
    case 'top-left':
      return cn(base, 'left-0 top-full mt-3')
    case 'top-right':
      return cn(base, 'right-0 top-full mt-3')
    case 'bottom-left':
      return cn(base, 'left-0 bottom-full mb-3')
    case 'bottom-right':
    default:
      return cn(base, 'right-0 bottom-full mb-3')
  }
}

function getSettingsPanelOrigin(corner: NavbarCorner, compact: boolean): string {
  if (!compact) return 'bottom right'

  switch (corner) {
    case 'top-left':
      return 'top left'
    case 'top-right':
      return 'top right'
    case 'bottom-left':
      return 'bottom left'
    case 'bottom-right':
    default:
      return 'bottom right'
  }
}

function SettingsDockIcon({ compact }: { compact: boolean }) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const { corner } = useNavbar()

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <DockIcon className="relative overflow-visible">
      <div ref={wrapperRef} className="relative">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label="Website settings"
              aria-haspopup="dialog"
              aria-expanded={open}
              onClick={() => setOpen((value) => !value)}
              className={cn(
                buttonVariants({ variant: 'ghost', size: 'icon' }),
                iconSizeClass(compact)
              )}
            >
              <Settings2 className={compact ? 'size-3.5' : 'size-4'} />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Settings</p>
          </TooltipContent>
        </Tooltip>

        <AnimatePresence>
          {open && (
            <motion.div
              role="dialog"
              aria-label="Website settings"
              initial={{ opacity: 0, scale: 0.95, y: compact && corner.startsWith('top') ? -4 : 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: compact && corner.startsWith('top') ? -4 : 4 }}
              transition={{ duration: 0.16 }}
              style={{ transformOrigin: getSettingsPanelOrigin(corner, compact) }}
              className={getSettingsPanelClasses(corner, compact)}
            >
              <WebsiteSettings />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DockIcon>
  )
}

const dockContent = (compact?: boolean) => (
  <>
    {DATA.navbar.map((item) => (
      <DockIcon key={item.label}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href={item.href}
              aria-label={item.label}
              className={cn(
                buttonVariants({ variant: 'ghost', size: 'icon' }),
                iconSizeClass(!!compact)
              )}
            >
              <item.icon className={compact ? 'size-3.5' : 'size-4'} />
            </Link>
          </TooltipTrigger>
          <TooltipContent>
            <p>{item.label}</p>
          </TooltipContent>
        </Tooltip>
      </DockIcon>
    ))}
    <Separator orientation="vertical" className="h-full" />
    {Object.entries(DATA.contact.social)
      .filter(([, social]) => social.navbar)
      .map(([name, social]) => (
        <DockIcon key={name}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href={social.url}
                aria-label={social.name}
                className={cn(
                  buttonVariants({ variant: 'ghost', size: 'icon' }),
                  iconSizeClass(!!compact)
                )}
              >
                <social.icon className={compact ? 'size-3.5' : 'size-4'} />
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>{name}</p>
            </TooltipContent>
          </Tooltip>
        </DockIcon>
      ))}
    <Separator orientation="vertical" className={compact ? 'h-6' : 'h-full py-2'} />
    <DockIcon>
      <Tooltip>
        <TooltipTrigger asChild>
          <ModeToggle className={cn('rounded-full', compact && 'size-8')} />
        </TooltipTrigger>
        <TooltipContent>
          <p>Theme</p>
        </TooltipContent>
      </Tooltip>
    </DockIcon>
    <SettingsDockIcon compact={!!compact} />
  </>
)

const CORNER_PADDING = 16
const BUTTON_SIZE = 48

function getCornerStyles(corner: NavbarCorner): React.CSSProperties {
  switch (corner) {
    case 'top-left':
      return { top: CORNER_PADDING, left: CORNER_PADDING }
    case 'top-right':
      return { top: CORNER_PADDING, right: CORNER_PADDING }
    case 'bottom-left':
      return { bottom: CORNER_PADDING, left: CORNER_PADDING }
    case 'bottom-right':
    default:
      return { bottom: CORNER_PADDING, right: CORNER_PADDING }
  }
}

function getNearestCorner(x: number, y: number): NavbarCorner {
  const midX = window.innerWidth / 2
  const midY = window.innerHeight / 2
  if (y < midY) {
    return x < midX ? 'top-left' : 'top-right'
  }
  return x < midX ? 'bottom-left' : 'bottom-right'
}

function getDockTransformOrigin(corner: NavbarCorner): string {
  switch (corner) {
    case 'top-left':
      return 'left top'
    case 'top-right':
      return 'right top'
    case 'bottom-left':
      return 'left center'
    case 'bottom-right':
    default:
      return 'right center'
  }
}

function getDockContainerClasses(corner: NavbarCorner): string {
  const base = 'fixed z-50 pointer-events-none flex overflow-visible'
  switch (corner) {
    case 'top-left':
      return cn(base, 'top-4 left-4 right-4 justify-start')
    case 'top-right':
      return cn(base, 'top-4 left-4 right-4 justify-end')
    case 'bottom-left':
      return cn(base, 'bottom-4 left-4 right-4 justify-start')
    case 'bottom-right':
    default:
      return cn(base, 'bottom-4 left-4 right-4 justify-end')
  }
}

const DRAG_THRESHOLD = 5

function HamburgerWithDock() {
  const { corner, setCorner } = useNavbar()
  const [expanded, setExpanded] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null)
  const dragStartRef = useRef<{ x: number; y: number; elX: number; elY: number } | null>(null)
  const hasMovedRef = useRef(false)
  const lastPositionRef = useRef<{ x: number; y: number } | null>(null)
  const wasDragRef = useRef(false)
  const isMobile = useIsMobile('NavBar')

  useEffect(() => {
    if (!isMobile) setExpanded(false)
  }, [isMobile])

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return
      e.preventDefault()
      const rect = (e.target as HTMLElement).closest('button')?.getBoundingClientRect()
      if (rect) {
        dragStartRef.current = {
          x: e.clientX,
          y: e.clientY,
          elX: rect.left + rect.width / 2,
          elY: rect.top + rect.height / 2
        }
        hasMovedRef.current = false
        wasDragRef.current = false
        setIsDragging(true)
        ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
      }
    },
    []
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragStartRef.current) return
      const dx = e.clientX - dragStartRef.current.x
      const dy = e.clientY - dragStartRef.current.y
      if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
        hasMovedRef.current = true
      }
      const { elX, elY } = dragStartRef.current
      const pos = {
        x: elX + dx,
        y: elY + dy
      }
      lastPositionRef.current = pos
      setDragPosition(pos)
    },
    []
  )

  const handlePointerUp = useCallback(() => {
    wasDragRef.current = hasMovedRef.current
    const pos = lastPositionRef.current
    if (hasMovedRef.current && pos) {
      const newCorner = getNearestCorner(pos.x, pos.y)
      setCorner(newCorner)
    }
    setIsDragging(false)
    setDragPosition(null)
    lastPositionRef.current = null
    dragStartRef.current = null
  }, [setCorner])

  useEffect(() => {
    if (!isDragging) return
    const onPointerUp = () => handlePointerUp()
    window.addEventListener('pointerup', onPointerUp)
    return () => window.removeEventListener('pointerup', onPointerUp)
  }, [isDragging, handlePointerUp])

  const springTransition = {
    type: 'spring' as const,
    stiffness: 400,
    damping: 30
  }

  const cornerStyles = getCornerStyles(corner)
  const buttonStyle: React.CSSProperties = isDragging && dragPosition
    ? {
        position: 'fixed',
        left: dragPosition.x - BUTTON_SIZE / 2,
        top: dragPosition.y - BUTTON_SIZE / 2,
        zIndex: 50
      }
    : { ...cornerStyles, position: 'fixed', zIndex: 50 }

  return (
    <>
      <AnimatePresence>
        {!expanded && (
          <motion.button
            key="hamburger"
            type="button"
            onClick={() => {
              if (!wasDragRef.current) setExpanded(true)
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            aria-label="Open navigation"
            aria-expanded={false}
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
              transition: { type: 'spring', stiffness: 400, damping: 16 }
            }}
            exit={{
              scale: 0.3,
              opacity: 0,
              transition: { duration: 0.15 }
            }}
            style={{
              ...buttonStyle,
              transformOrigin: getDockTransformOrigin(corner)
            }}
            className={cn(
              'flex size-12 cursor-grab active:cursor-grabbing items-center justify-center rounded-full bg-background/80 backdrop-blur-md border shadow-lg pointer-events-auto touch-none'
            )}
            whileTap={{ scale: isDragging ? 1 : 0.95 }}
          >
            <Menu className="size-6 pointer-events-none" />
          </motion.button>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {expanded && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setExpanded(false)}
              className="fixed inset-0 z-40 bg-black/20"
              aria-hidden
            />
            <motion.div
              key="dock"
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              exit={{ opacity: 0, scaleX: 0 }}
              transition={springTransition}
              style={{ transformOrigin: getDockTransformOrigin(corner) }}
              className={getDockContainerClasses(corner)}
              onTouchMove={(e) => e.preventDefault()}
            >
              <TooltipProvider>
                <div
                  className={cn(
                    'pointer-events-auto w-full max-w-full overflow-visible flex h-12',
                    corner.includes('left') ? 'justify-start' : 'justify-end ml-auto'
                  )}
                >
                  <Dock
                    direction="middle"
                    iconSize={24}
                    iconMagnification={36}
                    iconDistance={100}
                    className="bg-background/80 backdrop-blur-md border rounded-full p-1 gap-1 w-max max-w-full min-w-0 justify-end mt-0 h-12"
                  >
                    {dockContent(true)}
                  </Dock>
                </div>
              </TooltipProvider>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default function Navbar() {
  const isMobile = useIsMobile('NavBar')
  const { collapsed } = useNavbar()

  const showHamburger = isMobile || collapsed

  if (!showHamburger) {
    return (
      <div
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
        onTouchMove={(e) => e.preventDefault()}
      >
        <TooltipProvider>
          <Dock
            direction="middle"
            className="pointer-events-auto bg-background/80 backdrop-blur-md border rounded-full p-1 sm:p-2 shadow-lg"
          >
            {dockContent(false)}
          </Dock>
        </TooltipProvider>
      </div>
    )
  }

  return <HamburgerWithDock />
}
