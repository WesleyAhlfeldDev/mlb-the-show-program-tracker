'use client'
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
  const taPC = pct(ta, shared)
  const f1PC = f1 ? pct(f1, shared) : null
  const handlers = { onToggle, onTally, onCompleteTally, onToggleShared, onAutoComplete, onTogglePin, onDelete }

  return (
    <div
      className="rounded-xl mb-3 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0d1424 0%, #141d30 100%)',
        border: '1px solid rgba(240,180,41,0.08)',
      }}
    >
      {/* Team header */}
      <div
        className="flex items-center gap-2.5 px-4 py-2.5"
        style={{
          borderLeft: `3px solid ${ta.color}`,
          background: 'rgba(0,0,0,0.2)',
          borderBottom: '1px solid rgba(240,180,41,0.06)',
        }}
      >
        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: ta.color, boxShadow: `0 0 6px ${ta.color}60` }} />
        <div className="font-display font-bold text-[14px] uppercase tracking-[0.05em] flex-1 text-white">
          {ta.name}
          {f1 && (
            <span
              className="inline-flex items-center text-[9px] font-bold uppercase tracking-[0.06em] rounded-[4px] px-1.5 py-0.5 ml-2 align-middle"
              style={{ background: 'rgba(240,180,41,0.1)', color: '#f0b429', border: '1px solid rgba(240,180,41,0.25)' }}
            >
              ⭐ #1 Fan
            </span>
          )}
        </div>
        <div className="text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
          TA:{' '}
          <span style={{ color: taPC === 100 ? '#22c55e' : '#f0b429' }}>
            {taPC === 100 ? '✓' : `${taPC}%`}
          </span>
          {f1 && f1PC !== null && (
            <>
              {' · '}#1 Fan:{' '}
              <span style={{ color: f1PC === 100 ? '#22c55e' : '#f0b429' }}>
                {f1PC === 100 ? '✓' : `${f1PC}%`}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="p-2 flex flex-col gap-1.5">
        <ProgramCard program={ta} shared={shared} {...handlers} />
        {f1 && <ProgramCard program={f1} shared={shared} {...handlers} />}
      </div>
    </div>
  )
}
