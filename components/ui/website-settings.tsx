'use client'

import React from 'react'
import { motion } from 'motion/react'
import { Settings2 } from 'lucide-react'
import { useChasingLogo } from '@/components/providers/chasing-logo-provider'
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

type WebsiteSettingsProps = {
  className?: string
}

function SettingRow({
  title,
  description,
  checked,
  onChange
}: {
  title: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-stretch justify-between gap-4 rounded-lg px-3 py-2.5 transition-colors hover:bg-neutral-100/80 dark:hover:bg-neutral-800/50">
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
        <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
          {title}
        </span>
        <span className="text-xs text-neutral-500 dark:text-neutral-400">
          {description}
        </span>
      </div>
      <div className="flex shrink-0 items-center">
        <Toggle checked={checked} onChange={onChange} />
      </div>
    </div>
  )
}

export function WebsiteSettings({ className }: WebsiteSettingsProps) {
  const { collapsed, setCollapsed } = useNavbar()
  const { chasingLogoEnabled, setChasingLogoEnabled } = useChasingLogo()

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      transition={{ duration: 0.18 }}
      className={cn('w-full', className)}
    >
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white/80 shadow-lg shadow-neutral-900/5 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-950/80 dark:shadow-neutral-950/50">
        <div className="flex w-full items-center gap-3 px-4 py-3 text-left">
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
        </div>

        <div className="space-y-1 border-t border-neutral-200 p-4 dark:border-neutral-800">
          <SettingRow
            title="Chasing Logo"
            description="Show the profile image that follows your pointer"
            checked={chasingLogoEnabled}
            onChange={setChasingLogoEnabled}
          />
          <SettingRow
            title="Collapsed Menu"
            description="Show navigation as a compact menu you can drag to any corner"
            checked={collapsed}
            onChange={setCollapsed}
          />
        </div>
      </div>
    </motion.div>
  )
}
