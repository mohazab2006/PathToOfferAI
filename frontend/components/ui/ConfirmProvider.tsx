'use client'

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'

export type ConfirmOptions = {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  tone?: 'danger' | 'default'
}

type ConfirmContextValue = {
  confirm: (opts: ConfirmOptions) => Promise<boolean>
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null)

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [opts, setOpts] = useState<ConfirmOptions | null>(null)
  const [resolver, setResolver] = useState<((v: boolean) => void) | null>(null)

  const confirm = useCallback((next: ConfirmOptions) => {
    setOpts(next)
    setOpen(true)
    return new Promise<boolean>((resolve) => setResolver(() => resolve))
  }, [])

  const close = useCallback((value: boolean) => {
    setOpen(false)
    resolver?.(value)
    setResolver(null)
    // small delay to prevent flash when reopening quickly
    window.setTimeout(() => setOpts(null), 50)
  }, [resolver])

  const value = useMemo(() => ({ confirm }), [confirm])

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      {open && opts && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 px-4" onClick={() => close(false)}>
          <div
            className="w-full max-w-md rounded-xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h3 className="font-display text-xl font-semibold text-gray-900 mb-2">
                {opts.title || 'Confirm'}
              </h3>
              <p className="text-gray-600 mb-6">{opts.message}</p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => close(false)}
                  className="px-4 py-2 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {opts.cancelText || 'Cancel'}
                </button>
                <button
                  onClick={() => close(true)}
                  className={
                    opts.tone === 'danger'
                      ? 'px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors'
                      : 'px-4 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-black transition-colors'
                  }
                >
                  {opts.confirmText || 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider')
  return ctx
}



