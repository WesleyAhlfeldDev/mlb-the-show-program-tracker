'use client'
import { useState } from 'react'
import type { Program, SharedMission } from '@/types'
import { pct, sortByCompletion } from '@/hooks/useTracker'
import { ProgramCard } from './ProgramCard'

interface Props {
  programs: Program[]
  shared: SharedMission[]
  onToggle: (pid: string, mid: string) => void
  onTally: (pid: string, mid: string, delta: number) => void
  onToggleShared: (mid: string) => void
  onAutoComplete: (pid: string) => void
  onDelete: (pid: string) => void
}

export function WBCSection({ programs, shared, onToggle, onTally, onToggleShared, onAutoComplete, onDelete }: Props) {
  const [filter, setFilter] = useState<string>('all')
  const sorted = sortByCompletion(programs, shared)
  const shown = filter === 'all' ? sorted : sorted.filter(p => p.id === filter)
  const handlers = { onToggle, onTally, onToggleShared, onAutoComplete, onDelete }

  return (
    <div>
      <div className="bg-blue-500/10 border border-blue-500/25 rounded-[6px] px-3.5 py-2.5 text-[12px] text-blue-300 mb-4 leading-relaxed">
        ⚡ <strong>Series Missions</strong> (IP, Ks, Hits, XBH, HR with any WBC cards) count toward{' '}
        <strong>all four pools simultaneously</strong>. Tap <strong>+</strong> to tally in real time.
      </div>

      {/* Sub-filter tabs */}
      <div className="flex gap-1.5 flex-wrap mb-4">
        <button
          onClick={() => setFilter('all')}
          className={`text-[11px] font-medium px-3 py-1.5 rounded-full border transition-colors ${filter === 'all' ? 'bg-white text-bg border-white' : 'border-white/[0.13] text-white/50 hover:text-white hover:bg-bg3'}`}
        >
          All
        </button>
        {programs.map(p => {
          const pc = pct(p, shared)
          return (
            <button
              key={p.id}
              onClick={() => setFilter(p.id)}
              className={`text-[11px] font-medium px-3 py-1.5 rounded-full border transition-colors ${filter === p.id ? 'bg-white text-bg border-white' : 'border-white/[0.13] text-white/50 hover:text-white hover:bg-bg3'}`}
            >
              {p.name} {pc === 100 ? '✓' : `${pc}%`}
            </button>
          )
        })}
      </div>

      <div className="flex flex-col gap-2">
        {shown.map(p => (
          <ProgramCard key={p.id} program={p} shared={shared} isWbc {...handlers} />
        ))}
      </div>
    </div>
  )
}
