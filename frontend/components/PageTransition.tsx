'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => setIsLoading(false), 120)
    return () => clearTimeout(timer)
  }, [pathname])

  return (
    <>
      {isLoading && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-50/85"
          aria-busy="true"
          aria-live="polite"
        >
          <div className="h-9 w-9 rounded-full border-2 border-zinc-200 border-t-primary-600 animate-spin" />
        </div>
      )}
      <div className={isLoading ? 'opacity-0' : 'opacity-100 transition-opacity duration-150'}>{children}</div>
    </>
  )
}
