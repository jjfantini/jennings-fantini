'use client'

import * as React from 'react';

type DeviceType = 'iPhone' | 'iPad' | 'NavBar';

const BREAKPOINTS = {
  iPhone: 640,
  iPad: 1024,
  NavBar: 430
} as const;

// Helper function to check if we're on mobile
const checkIsMobile = (device: DeviceType): boolean => {
  if (typeof window === 'undefined') return false;
  const breakpoint = BREAKPOINTS[device];
  return window.innerWidth < breakpoint;
};

export function useIsMobile(device: DeviceType = 'iPhone') {
  // Initialize with actual value if window is available (client-side)
  const [isMobile, setIsMobile] = React.useState<boolean>(() => checkIsMobile(device));

  React.useEffect(() => {
    const breakpoint = BREAKPOINTS[device];
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    
    const onChange = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };
    
    mql.addEventListener('change', onChange);
    // Update on mount to ensure correct value after hydration
    setIsMobile(window.innerWidth < breakpoint);
    
    return () => mql.removeEventListener('change', onChange);
  }, [device]);

  return isMobile;
}
