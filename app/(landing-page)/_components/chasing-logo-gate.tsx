'use client'

import { useChasingLogo } from '@/components/providers/chasing-logo-provider'
import { ChasingLogo } from './chasing-logo'

export function ChasingLogoGate() {
  const { chasingLogoEnabled } = useChasingLogo()
  if (!chasingLogoEnabled) return null
  return <ChasingLogo />
}
