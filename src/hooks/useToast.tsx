'use client'
import { useState, useCallback, useRef } from 'react'

interface Toast {
  id: number
  msg: string
  type: 'default' | 'green' | 'blue'
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])
  const counter = useRef(0)

  const toast = useCallback((msg: string, type: Toast['type'] = 'default') => {
    const id = ++counter.current
    setToasts(t => [...t, { id, msg, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2800)
  }, [])

  return { toasts, toast }
}

export function ToastContainer({ toasts }: { toasts: ReturnType<typeof useToast>['toasts'] }) {
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={[
            'bg-bg3 border rounded-xl px-4 py-3 text-[13px] text-white shadow-xl',
            'animate-[slideup_0.3s_ease] pointer-events-auto max-w-xs',
            t.type === 'green' ? 'border-green-500/30 text-green-300' :
            t.type === 'blue' ? 'border-blue-500/30 text-blue-300' :
            'border-white/[0.13]',
          ].join(' ')}
        >
          {t.msg}
        </div>
      ))}
    </div>
  )
}
