'use client'
import { useState } from 'react'
import type { Program, SharedMission } from '@/types'
import { pct, missionCounts } from '@/hooks/useTracker'
import { MissionRow, SharedMissionRow } from './MissionRow'

interface Props {
  program: Program
  shared: SharedMission[]
  isWbc?: boolean
  onToggle: (pid: string, mid: string) => void
  onTally: (pid: string, mid: string, delta: number) => void
  onToggleShared: (mid: string) => void
  onAutoComplete: (pid: string) => void
  onDelete: (pid: string) => void
}

export function ProgramCard({
  program: p, shared, isWbc = false,
  onToggle, onTally, onToggleShared, onAutoComplete, onDelete,
}: Props) {
  const [expanded, setExpanded] = useState(false)
  const pc = pct(p, shared)
  const done = pc === 100
  const { done: dn, total: tot } = missionCounts(p, shared)
  const bc = done ? '#22c55e' : p.color

  return (
    <div className={[
      'rounded-xl overflow-hidden transition-all border',
      done
        ? 'border-green-500/20 opacity-70'
        : expanded ? 'border-white/[0.13]' : 'border-white/[0.07]',
    ].join(' ')}>

      {/* Completed stripe */}
      {done && (
        <div className="h-[2px] w-full" style={{ background: 'linear-gradient(90deg,#22c55e,#15803d)' }} />
      )}

      {/* Header row */}
      <div
        onClick={() => setExpanded(e => !e)}
        className={[
          'flex items-center gap-3 px-4 py-3.5 cursor-pointer select-none bg-bg2',
          'hover:bg-white/[0.02] transition-colors',
          done ? 'bg-green-500/[0.03]' : '',
        ].join(' ')}
      >
        {/* Color dot */}
        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: p.color }} />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className={`font-display font-bold text-[15px] uppercase tracking-[0.04em] ${done ? 'text-white/50' : 'text-white'}`}>
            {p.name}
          </div>
          <div className="text-[11px] text-white/40 mt-0.5">
            {p.category} · {dn}/{tot} complete
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {!done && (
            <button
              onClick={e => { e.stopPropagation(); onAutoComplete(p.id) }}
              className="text-[11px] font-bold px-2.5 py-1 rounded-[6px] bg-amber-500/12 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 hover:border-amber-400/50 transition-colors"
            >
              Complete
            </button>
          )}
          <span className={[
            'font-display text-[12px] font-bold px-2.5 py-1 rounded-full border',
            done
              ? 'bg-green-500/12 text-green-400 border-green-500/25'
              : 'bg-blue-500/15 text-blue-300 border-blue-500/25',
          ].join(' ')}>
            {done ? '✓ COMPLETED' : `${pc}%`}
          </span>
          <span className={`text-[10px] text-white/30 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </div>
      </div>

      {/* Progress bar (always visible) */}
      <div className="h-[2px] bg-bg4">
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${pc}%`, background: bc }}
        />
      </div>

      {/* Body — expanded */}
      {expanded && (
        <div className="bg-bg2 px-4 pb-4">
          {p.sections.map((sec, si) => (
            <div key={si}>
              <div className={[
                'text-[10px] font-semibold text-white/30 uppercase tracking-[0.1em] py-3',
                si > 0 ? 'border-t border-white/[0.04] mt-1' : 'pt-3',
              ].join(' ')}>
                {sec.label}
              </div>
              {sec.missions.map(m => (
                <MissionRow
                  key={m.id}
                  pid={p.id}
                  mission={m}
                  onToggle={onToggle}
                  onTally={onTally}
                />
              ))}
            </div>
          ))}

          {/* Shared WBC missions */}
          {isWbc && p.id !== 'wbc-moonshot' && (
            <div>
              <div className="text-[10px] font-semibold text-white/30 uppercase tracking-[0.1em] py-3 border-t border-white/[0.04] mt-1">
                Series missions — shared across all 4 pools
              </div>
              {shared.map(m => (
                <SharedMissionRow key={m.id} mission={m} onToggle={onToggleShared} />
              ))}
            </div>
          )}

          {/* Reward */}
          {p.boss && (
            <div className="flex items-center gap-2.5 bg-bg3 border border-white/[0.07] rounded-[6px] px-3.5 py-2.5 mt-4">
              <div
                className="w-3.5 h-3.5 rotate-45 rounded-sm flex-shrink-0"
                style={{ background: p.color }}
              />
              <div>
                <div className="text-[10px] text-white/30 uppercase tracking-[0.06em]">Reward cards</div>
                <div className="text-[13px] font-semibold text-white mt-0.5">{p.boss}</div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 mt-4 pt-3 border-t border-white/[0.07]">
            <button
              onClick={() => onDelete(p.id)}
              className="text-[11px] font-medium px-3 py-1.5 rounded-[6px] border border-white/[0.13] text-white/40 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/30 transition-colors"
            >
              ✕ Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
