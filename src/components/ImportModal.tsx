'use client'
import { useState } from 'react'

interface Props {
  onClose: () => void
  onImport: (json: string) => { ok: boolean; error?: string }
}

export function ImportModal({ onClose, onImport }: Props) {
  const [text, setText] = useState('')
  const [error, setError] = useState('')

  const handle = () => {
    const result = onImport(text.trim())
    if (result.ok) {
      onClose()
    } else {
      setError(result.error ?? 'Invalid JSON')
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-bg2 border border-white/[0.13] rounded-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-[18px] uppercase tracking-[0.04em]">
            Restore Backup
          </h2>
          <button onClick={onClose} className="text-white/30 hover:text-white text-lg leading-none">
            ✕
          </button>
        </div>

        <label className="block text-[11px] font-semibold text-white/50 uppercase tracking-[0.07em] mb-1.5">
          Paste full backup JSON
        </label>
        <textarea
          value={text}
          onChange={e => { setText(e.target.value); setError('') }}
          placeholder='Paste the JSON from "Export All"…'
          className="w-full bg-bg3 border border-white/[0.13] rounded-[6px] text-white font-body text-[13px] px-3 py-2.5 outline-none focus:border-blue-500 min-h-[140px] resize-y leading-relaxed"
        />

        {error && (
          <p className="text-red-400 text-[12px] mt-2">{error}</p>
        )}

        <div className="flex gap-2 justify-end mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-[6px] border border-white/[0.13] text-white/50 hover:text-white hover:bg-bg3 text-[12px] font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handle}
            disabled={!text}
            className="px-4 py-2 rounded-[6px] bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white text-[12px] font-medium transition-colors"
          >
            Restore
          </button>
        </div>
      </div>
    </div>
  )
}
