'use client'
import { useState } from 'react'
import type { Program, SharedMission } from '@/types'
import { pct, sortByCompletion } from '@/hooks/useTracker'
import { TeamGroup } from './TeamGroup'
import { AL_IDS, NL_IDS, TEAM_SHORT } from '@/data'

interface Props {
  ta: Program[]
  f1: Program[]
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

export function TASection({ ta, f1, shared, onToggle, onTally, onCompleteTally, onToggleShared, onAutoComplete, onTogglePin, onDelete }: Props) {
  const [filter, setFilter] = useState<string>('all')
  const handlers = { onToggle, onTally, onCompleteTally, onToggleShared, onAutoComplete, onTogglePin, onDelete }

  const alTeams = sortByCompletion(ta.filter(p => AL_IDS.includes(p.id)), shared)
  const nlTeams = sortByCompletion(ta.filter(p => NL_IDS.includes(p.id)), shared)
  const customTeams = sortByCompletion(ta.filter(p => !AL_IDS.includes(p.id) && !NL_IDS.includes(p.id)), shared)

  const filtered = (arr: Program[]) =>
    filter === 'all' ? arr : arr.filter(p => p.id === filter)

  const renderGroup = (teams: Program[]) =>
    filtered(teams).map(team => (
      <TeamGroup
        key={team.id}
        ta={team}
        f1={f1.find(f => f.teamId === team.id)}
        shared={shared}
        {...handlers}
      />
    ))

  return (
    <div>
      <div
        className="rounded-[6px] px-3.5 py-2.5 text-[12px] mb-4 leading-relaxed"
        style={{ background: 'rgba(240,180,41,0.06)', border: '1px solid rgba(240,180,41,0.15)', color: 'rgba(240,180,41,0.85)' }}
      >
        🏆 Complete <strong>2 Moments</strong> + <strong>8 Stat Missions</strong> per team to earn 4 player cards including two{' '}
        <strong>Jolt Series Captains (88 OVR)</strong>.
      </div>

      {/* Sub-filter pills */}
      <div className="flex gap-1.5 flex-wrap mb-4 text-[11px]">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className="font-medium px-3 py-1.5 rounded-full border transition-all"
          style={filter === 'all' ? goldBtn : dimBtn}
        >
          All 30
        </button>

        <span className="self-center px-1" style={{ color: 'rgba(240,180,41,0.35)' }}>AL:</span>
        {ta.filter(p => AL_IDS.includes(p.id)).map(p => {
          const pc = pct(p, shared)
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setFilter(p.id)}
              className="font-medium px-3 py-1.5 rounded-full border transition-all"
              style={filter === p.id ? goldBtn : dimBtn}
            >
              {TEAM_SHORT[p.name] ?? p.name} {pc === 100 ? '✓' : `${pc}%`}
            </button>
          )
        })}

        <span className="self-center px-1" style={{ color: 'rgba(240,180,41,0.35)' }}>NL:</span>
        {ta.filter(p => NL_IDS.includes(p.id)).map(p => {
          const pc = pct(p, shared)
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setFilter(p.id)}
              className="font-medium px-3 py-1.5 rounded-full border transition-all"
              style={filter === p.id ? goldBtn : dimBtn}
            >
              {TEAM_SHORT[p.name] ?? p.name} {pc === 100 ? '✓' : `${pc}%`}
            </button>
          )
        })}
      </div>

      {alTeams.length > 0 && filter === 'all' && <SectionLabel>American League</SectionLabel>}
      {renderGroup(alTeams)}

      {nlTeams.length > 0 && filter === 'all' && <SectionLabel>National League</SectionLabel>}
      {renderGroup(nlTeams)}
      {renderGroup(customTeams)}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 my-3">
      <span
        className="font-display font-bold text-[11px] uppercase tracking-[0.1em]"
        style={{ color: 'rgba(240,180,41,0.45)' }}
      >
        {children}
      </span>
      <div className="flex-1 h-px" style={{ background: 'rgba(240,180,41,0.1)' }} />
    </div>
  )
}
