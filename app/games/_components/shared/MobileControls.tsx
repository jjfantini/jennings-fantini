'use client'

import { motion } from 'motion/react'
import { ArrowDownIcon, ArrowLeftIcon, ArrowRightIcon, ArrowUpIcon } from '@radix-ui/react-icons'

type MobileControlsProps = {
  onUp?: () => void
  onDown?: () => void
  onLeft?: () => void
  onRight?: () => void
  onPrimary?: () => void
  primaryLabel?: string
}

export const MobileControls = ({
  onUp,
  onDown,
  onLeft,
  onRight,
  onPrimary,
  primaryLabel
}: MobileControlsProps) => {
  const dpadButton =
    'flex items-center justify-center w-14 h-14 bg-neutral-800/90 backdrop-blur-sm border border-neutral-700/50 rounded-2xl shadow-lg active:scale-95 active:bg-neutral-700 transition-all duration-150'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mt-6 w-full flex flex-col items-center gap-4"
    >
      <div className="relative">
        <div className="absolute inset-[-20px] bg-gradient-to-br from-violet-600/10 to-indigo-600/10 rounded-full blur-xl" />

        <div className="relative flex flex-col items-center gap-1">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onUp}
            className={dpadButton}
            type="button"
          >
            <ArrowUpIcon className="w-6 h-6 text-white" />
          </motion.button>

          <div className="flex gap-1">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onLeft}
              className={dpadButton}
              type="button"
            >
              <ArrowLeftIcon className="w-6 h-6 text-white" />
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onDown}
              className={dpadButton}
              type="button"
            >
              <ArrowDownIcon className="w-6 h-6 text-white" />
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onRight}
              className={dpadButton}
              type="button"
            >
              <ArrowRightIcon className="w-6 h-6 text-white" />
            </motion.button>
          </div>
        </div>
      </div>

      {onPrimary && primaryLabel && (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onPrimary}
          className="relative w-36 h-12 bg-gradient-to-r from-rose-600 to-red-600 rounded-xl shadow-lg shadow-rose-500/25 overflow-hidden group"
          type="button"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          <span className="relative text-white font-bold text-sm">{primaryLabel}</span>
        </motion.button>
      )}
    </motion.div>
  )
}
