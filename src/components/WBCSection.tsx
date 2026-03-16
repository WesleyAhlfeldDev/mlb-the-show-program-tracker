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
  onCompleteTally: (pid: string, mid: string) => void
  onToggleShared: (mid: string) => void
  onAutoComplete: (pid: string) => void
  onTogglePin: (pid: string) => void
  onDelete: (pid: string) => void
}

const goldBtn = { background: 'linear-gradient(135deg,#ffd166,#f0b429)', color: '#080c14', border: '1px solid transparent', fontWeight: 700 }
const dimBtn  = { borderColor: 'rgba(255,255,255,0.13)', color: 'rgba(255,255,255,0.4)' }

export function WBCSection({ programs, shared, onToggle, onTally, onCompleteTally, onToggleShared, onAutoComplete, onTogglePin, onDelete }: Props) {
  const [filter, setFilter] = useState<string>('all')
  const sorted = sortByCompletion(programs, shared)
  const shown = filter === 'all' ? sorted : sorted.filter(p => p.id === filter)
  const handlers = { onToggle, onTally, onCompleteTally, onToggleShared, onAutoComplete, onTogglePin, onDelete }

  return (
    <div>
      <div
        className="rounded-[6px] px-3.5 py-2.5 text-[12px] mb-4 leading-relaxed"
        style={{ background: 'rgba(240,180,41,0.06)', border: '1px solid rgba(240,180,41,0.15)', color: 'rgba(240,180,41,0.85)' }}
      >
        ⚡ <strong>Series Missions</strong> (IP, Ks, Hits, XBH, HR with any WBC cards) count toward{' '}
        <strong>all four pools simultaneously</strong>. Tap <strong>+</strong> to tally in real time.
      </div>

      <div className="flex gap-1.5 flex-wrap mb-4">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className="text-[11px] font-medium px-3 py-1.5 rounded-full border transition-all"
          style={filter === 'all' ? goldBtn : dimBtn}
        >
          All
        </button>
        {programs.map(p => {
          const pc = pct(p, shared)
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setFilter(p.id)}
              className="text-[11px] font-medium px-3 py-1.5 rounded-full border transition-all"
              style={filter === p.id ? goldBtn : dimBtn}
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
