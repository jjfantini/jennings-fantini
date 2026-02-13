'use client'

import React from 'react'
import { motion } from 'motion/react'
import { ChevronDown, Settings2 } from 'lucide-react'
import { useNavbar } from '@/components/providers/navbar-provider'
import { cn } from '@/lib/utils'

function Toggle({
  checked,
  onChange,
  disabled
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center justify-start rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50',
        checked ? 'bg-violet-500' : 'bg-neutral-700'
      )}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={cn(
          'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0',
          checked ? 'translate-x-5' : 'translate-x-0.5'
        )}
      />
    </button>
  )
}

export function WebsiteSettings() {
  const { collapsed, setCollapsed } = useNavbar()
  const [isExpanded, setIsExpanded] = React.useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="w-full max-w-md"
    >
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white/80 shadow-lg shadow-neutral-900/5 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-950/80 dark:shadow-neutral-950/50">
        <button
          type="button"
          onClick={() => setIsExpanded((e) => !e)}
          className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-neutral-100/80 dark:hover:bg-neutral-800/50"
          aria-expanded={isExpanded}
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/20 to-indigo-500/20">
            <Settings2 className="size-4 text-violet-600 dark:text-violet-400" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
              Website Settings
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Customize how the site works for you
            </p>
          </div>
          <ChevronDown
            className={cn(
              'size-5 shrink-0 text-neutral-500 transition-transform duration-200',
              isExpanded && 'rotate-180'
            )}
          />
        </button>

        <div
          className="grid transition-[grid-template-rows] duration-200 ease-out"
          style={{ gridTemplateRows: isExpanded ? '1fr' : '0fr' }}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="space-y-1 border-t border-neutral-200 p-4 dark:border-neutral-800">
              <div className="flex items-stretch justify-between gap-4 rounded-lg px-3 py-2.5 transition-colors hover:bg-neutral-100/80 dark:hover:bg-neutral-800/50">
                <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
                  <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    Collapsed Menu
                  </span>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
                    Show navigation as a compact menu you can drag to any corner
                  </span>
                </div>
                <div className="flex shrink-0 items-center">
                  <Toggle checked={collapsed} onChange={setCollapsed} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
