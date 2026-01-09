'use client'

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'

type ToastType = 'success' | 'error' | 'info'

export type Toast = {
  id: string
  type: ToastType
  title?: string
  message: string
  durationMs?: number
}

type ToastContextValue = {
  pushToast: (toast: Omit<Toast, 'id'>) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

function classNames(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(' ')
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const pushToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `${Date.now()}_${Math.random().toString(16).slice(2)}`
    const durationMs = toast.durationMs ?? 3500
    const next: Toast = { id, ...toast, durationMs }
    setToasts((prev) => [next, ...prev].slice(0, 4))
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, durationMs)
  }, [])

  const value = useMemo(() => ({ pushToast }), [pushToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-20 z-[100] flex w-[360px] max-w-[calc(100vw-2rem)] flex-col gap-2">
        {toasts.map((t) => {
          const tone =
            t.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-900'
              : t.type === 'error'
                ? 'border-red-200 bg-red-50 text-red-900'
                : 'border-gray-200 bg-white text-gray-900'
          return (
            <div
              key={t.id}
              className={classNames(
                'rounded-xl border shadow-sm px-4 py-3',
                'animate-[toastIn_180ms_ease-out]',
                tone
              )}
            >
              {t.title && <div className="text-sm font-semibold mb-0.5">{t.title}</div>}
              <div className="text-sm opacity-90">{t.message}</div>
            </div>
          )
        })}
      </div>
      <style jsx global>{`
        @keyframes toastIn {
          from {
            opacity: 0;
            transform: translateY(-6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}



