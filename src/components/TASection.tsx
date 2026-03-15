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
  onToggleShared: (mid: string) => void
  onAutoComplete: (pid: string) => void
  onDelete: (pid: string) => void
}

export function TASection({ ta, f1, shared, onToggle, onTally, onToggleShared, onAutoComplete, onDelete }: Props) {
  const [filter, setFilter] = useState<string>('all')
  const handlers = { onToggle, onTally, onToggleShared, onAutoComplete, onDelete }

  // Sort teams within their group by completion
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
      <div className="bg-blue-500/10 border border-blue-500/25 rounded-[6px] px-3.5 py-2.5 text-[12px] text-blue-300 mb-4 leading-relaxed">
        🏆 Complete <strong>2 Moments</strong> + <strong>8 Stat Missions</strong> per team to earn 4 player cards including two{' '}
        <strong>Jolt Series Captains (88 OVR)</strong>.
      </div>

      {/* Sub-filter */}
      <div className="flex gap-1.5 flex-wrap mb-4 text-[11px]">
        <button
          onClick={() => setFilter('all')}
          className={`font-medium px-3 py-1.5 rounded-full border transition-colors ${filter === 'all' ? 'bg-white text-bg border-white' : 'border-white/[0.13] text-white/50 hover:text-white hover:bg-bg3'}`}
        >
          All 30
        </button>
        <span className="text-white/30 self-center px-1">AL:</span>
        {ta.filter(p => AL_IDS.includes(p.id)).map(p => {
          const pc = pct(p, shared)
          const short = TEAM_SHORT[p.name] ?? p.name
          return (
            <button
              key={p.id}
              onClick={() => setFilter(p.id)}
              className={`font-medium px-3 py-1.5 rounded-full border transition-colors ${filter === p.id ? 'bg-white text-bg border-white' : 'border-white/[0.13] text-white/50 hover:text-white hover:bg-bg3'}`}
            >
              {short} {pc === 100 ? '✓' : `${pc}%`}
            </button>
          )
        })}
        <span className="text-white/30 self-center px-1">NL:</span>
        {ta.filter(p => NL_IDS.includes(p.id)).map(p => {
          const pc = pct(p, shared)
          const short = TEAM_SHORT[p.name] ?? p.name
          return (
            <button
              key={p.id}
              onClick={() => setFilter(p.id)}
              className={`font-medium px-3 py-1.5 rounded-full border transition-colors ${filter === p.id ? 'bg-white text-bg border-white' : 'border-white/[0.13] text-white/50 hover:text-white hover:bg-bg3'}`}
            >
              {short} {pc === 100 ? '✓' : `${pc}%`}
            </button>
          )
        })}
      </div>

      {alTeams.length > 0 && filter === 'all' && (
        <SectionLabel>American League</SectionLabel>
      )}
      {renderGroup(alTeams)}

      {nlTeams.length > 0 && filter === 'all' && (
        <SectionLabel>National League</SectionLabel>
      )}
      {renderGroup(nlTeams)}
      {renderGroup(customTeams)}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 my-3">
      <span className="font-display font-bold text-[11px] uppercase tracking-[0.1em] text-white/30">
        {children}
      </span>
      <div className="flex-1 h-px bg-white/[0.07]" />
    </div>
  )
}
