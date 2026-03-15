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
  onToggleShared: (mid: string) => void
  onAutoComplete: (pid: string) => void
  onDelete: (pid: string) => void
}

export function TeamGroup({ ta, f1, shared, onToggle, onTally, onToggleShared, onAutoComplete, onDelete }: Props) {
  const taPC = pct(ta, shared)
  const f1PC = f1 ? pct(f1, shared) : null

  const handlers = { onToggle, onTally, onToggleShared, onAutoComplete, onDelete }

  return (
    <div className="bg-bg2 border border-white/[0.07] rounded-xl mb-3.5 overflow-hidden">
      {/* Team header */}
      <div
        className="flex items-center gap-2.5 px-4 py-2.5 bg-bg3"
        style={{ borderLeft: `3px solid ${ta.color}` }}
      >
        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: ta.color }} />
        <div className="font-display font-bold text-[14px] uppercase tracking-[0.05em] flex-1">
          {ta.name}
          {f1 && (
            <span className="inline-flex items-center text-[9px] font-bold uppercase tracking-[0.06em] bg-amber-500/12 text-amber-300 border border-amber-500/25 rounded-[4px] px-1.5 py-0.5 ml-2 align-middle">
              ⭐ #1 Fan
            </span>
          )}
        </div>
        <div className="text-[11px] text-white/40">
          TA:{' '}
          <span className={taPC === 100 ? 'text-green-400' : 'text-white/60'}>
            {taPC === 100 ? '✓' : `${taPC}%`}
          </span>
          {f1 && f1PC !== null && (
            <>
              {' '}·{' '}#1 Fan:{' '}
              <span className={f1PC === 100 ? 'text-green-400' : 'text-white/60'}>
                {f1PC === 100 ? '✓' : `${f1PC}%`}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Cards inside */}
      <div className="p-2 flex flex-col gap-1.5">
        <ProgramCard program={ta} shared={shared} {...handlers} />
        {f1 && <ProgramCard program={f1} shared={shared} {...handlers} />}
      </div>
    </div>
  )
}
