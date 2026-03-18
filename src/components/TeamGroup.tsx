'use client'
import { useState } from 'react'
import type { Program, SharedMission } from '@/types'
import { pct } from '@/hooks/useTracker'
import { ProgramCard } from './ProgramCard'

interface Props {
  ta: Program
  f1?: Program
  shared: SharedMission[]
  onToggle: (pid: string, mid: string) => void
  onTally: (pid: string, mid: string, delta: number) => void
  onCompleteTally: (pid: string, mid: string) => void
  onToggleShared: (mid: string) => void
  onAutoComplete: (pid: string) => void
  onTogglePin: (pid: string) => void
  onDelete: (pid: string) => void
}

export function TeamGroup({ ta, f1, shared, onToggle, onTally, onCompleteTally, onToggleShared, onAutoComplete, onTogglePin, onDelete }: Props) {
  const [open, setOpen] = useState(false)
  const taPC = pct(ta, shared)
  const f1PC = f1 ? pct(f1, shared) : null
  const handlers = { onToggle, onTally, onCompleteTally, onToggleShared, onAutoComplete, onTogglePin, onDelete }
  const allDone = taPC === 100 && (f1PC === null || f1PC === 100)
  const programCount = f1 ? 2 : 1

  return (
    <div
      className="rounded-xl mb-2 overflow-hidden transition-all"
      style={{
        background: 'linear-gradient(135deg, #0c1520 0%, #111d2e 100%)',
        border: allDone
          ? '1px solid rgba(34,197,94,0.25)'
          : open
            ? '1px solid rgba(240,180,41,0.3)'
            : '1px solid rgba(255,255,255,0.1)',
        boxShadow: open
          ? '0 4px 24px rgba(0,0,0,0.5)'
          : '0 2px 8px rgba(0,0,0,0.3)',
        opacity: allDone && !ta.pinned ? 0.75 : 1,
      }}
    >
      {/* Completed stripe */}
      {allDone && (
        <div className="h-[2px] w-full completed-stripe-gold" />
      )}

      {/* Accordion header — clicking expands/collapses */}
      <div
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none transition-colors"
        style={{
          borderLeft: `4px solid ${ta.color}`,
          background: open ? 'rgba(240,180,41,0.04)' : 'rgba(0,0,0,0.2)',
          borderBottom: open ? `1px solid rgba(255,255,255,0.07)` : 'none',
        }}
      >
        {/* Color dot */}
        <div
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ background: ta.color, boxShadow: `0 0 8px ${ta.color}80` }}
        />

        {/* Team name + progress */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-display font-bold text-[15px] uppercase tracking-[0.05em] ${allDone ? 'text-white/50' : 'text-white'}`}>
              {ta.name}
            </span>
            {f1 && (
              <span
                className="text-[10px] font-bold uppercase tracking-[0.06em] rounded-[4px] px-2 py-0.5"
                style={{ background: 'rgba(240,180,41,0.12)', color: '#ffd166', border: '1px solid rgba(240,180,41,0.25)' }}
              >
                ⭐ #1 Fan
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            <span className="text-[12px]" style={{ color: 'rgba(200,215,235,0.55)' }}>
              TA: <span className="font-semibold" style={{ color: taPC === 100 ? '#4ade80' : '#ffd166' }}>{taPC === 100 ? '✓' : `${taPC}%`}</span>
            </span>
            {f1 && f1PC !== null && (
              <span className="text-[12px]" style={{ color: 'rgba(200,215,235,0.55)' }}>
                #1 Fan: <span className="font-semibold" style={{ color: f1PC === 100 ? '#4ade80' : '#ffd166' }}>{f1PC === 100 ? '✓' : `${f1PC}%`}</span>
              </span>
            )}
          </div>
        </div>

        {/* Right side badges + chevron */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {allDone ? (
            <span
              className="text-[11px] font-bold px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(34,197,94,0.15)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.3)' }}
            >
              ✓ Done
            </span>
          ) : (
            <span
              className="text-[11px] font-medium px-2 py-0.5 rounded-[6px]"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(200,215,235,0.45)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {programCount} program{programCount > 1 ? 's' : ''}
            </span>
          )}
          <span
            className="text-[11px] transition-transform duration-300"
            style={{
              color: 'rgba(200,215,235,0.4)',
              transform: open ? 'rotate(180deg)' : 'none',
              display: 'inline-block',
            }}
          >
            ▼
          </span>
        </div>
      </div>

      {/* Expandable content */}
      {open && (
        <div
          className="p-3 flex flex-col gap-2"
          style={{ background: 'rgba(0,0,0,0.15)' }}
        >
          {/* Nested cards get a distinct inset background */}
          <div
            className="rounded-[10px] p-2 flex flex-col gap-2"
            style={{
              background: 'linear-gradient(135deg, #0a1220 0%, #0e1a2c 100%)',
              border: '1px solid rgba(255,255,255,0.07)',
              boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.3)',
            }}
          >
            <ProgramCard program={ta} shared={shared} {...handlers} />
            {f1 && <ProgramCard program={f1} shared={shared} {...handlers} />}
          </div>
        </div>
      )}
    </div>
  )
}
