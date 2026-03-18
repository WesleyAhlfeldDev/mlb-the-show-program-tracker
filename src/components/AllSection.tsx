'use client'
import type { Program, SharedMission } from '@/types'
import { sortByCompletion } from '@/hooks/useTracker'
import { ProgramCard } from './ProgramCard'
import { TeamGroup } from './TeamGroup'
import { AL_IDS, NL_IDS } from '@/data'

interface Props {
  wbc: Program[]
  ta: Program[]
  f1: Program[]
  player: Program[]
  other: Program[]
  shared: SharedMission[]
  searchQ: string
  onToggle: (pid: string, mid: string) => void
  onTally: (pid: string, mid: string, delta: number) => void
  onToggleShared: (mid: string) => void
  onAutoComplete: (pid: string) => void
  onCompleteTally: (pid: string, mid: string) => void
  onTogglePin: (pid: string) => void
  onDelete: (pid: string) => void
}

function matches(p: Program, q: string) {
  if (!q) return true
  const hay = `${p.name} ${p.category ?? ''} ${p.boss ?? ''}`.toLowerCase()
  return hay.includes(q)
}

export function AllSection({
  wbc, ta, f1, player, other, shared, searchQ,
  onToggle, onTally, onToggleShared, onAutoComplete, onCompleteTally, onTogglePin, onDelete,
}: Props) {
  const q = searchQ.toLowerCase().trim()
  const handlers = { onToggle, onTally, onToggleShared, onAutoComplete, onCompleteTally, onTogglePin, onDelete }

  const wbcShow = sortByCompletion(wbc.filter(p => matches(p, q)), shared)
  const allTA = [
    ...ta.filter(p => AL_IDS.includes(p.id)),
    ...ta.filter(p => NL_IDS.includes(p.id)),
    ...ta.filter(p => !AL_IDS.includes(p.id) && !NL_IDS.includes(p.id)),
  ]
  const taShow = sortByCompletion(
    allTA.filter(p => {
      if (!q) return true
      const f1p = f1.find(f => f.teamId === p.id)
      return matches(p, q) || (f1p && matches(f1p, q))
    }),
    shared
  )
  const playerShow = sortByCompletion(player.filter(p => matches(p, q)), shared)
  const otherShow = sortByCompletion(other.filter(p => matches(p, q)), shared)

  const totalHits = wbcShow.length + taShow.length + playerShow.length + otherShow.length
  const hasAny = totalHits > 0

  return (
    <div>
      {/* ── Pinned programs (always at top) ── */}
      {!q && (() => {
        const allProgs = [...wbc, ...ta, ...f1, ...player, ...other]
        const pinnedProgs = allProgs.filter(p => p.pinned)
        if (!pinnedProgs.length) return null
        return (
          <>
            <SectionLabel pinned>📌 Pinned</SectionLabel>
            <div className="flex flex-col gap-2 mb-4">
              {pinnedProgs.map(p => {
                const isWbc = wbc.some(w => w.id === p.id)
                const isTa = ta.some(t => t.id === p.id)
                const f1p = f1.find(f => f.teamId === p.id)
                if (isTa) {
                  return (
                    <TeamGroup
                      key={p.id}
                      ta={p}
                      f1={f1.find(f => f.teamId === p.id)}
                      shared={shared}
                      {...handlers}
                    />
                  )
                }
                // f1 program — show as standalone card
                return (
                  <ProgramCard
                    key={p.id}
                    program={p}
                    shared={shared}
                    isWbc={isWbc}
                    {...handlers}
                  />
                )
              })}
            </div>
          </>
        )
      })()}

            {q && (
        <div className="text-[11px] text-white/40 mb-3 px-0.5">
          {hasAny
            ? <>Found <strong className="text-blue-400">{totalHits}</strong> result{totalHits !== 1 ? 's' : ''} for &ldquo;<strong className="text-white/70">{q}</strong>&rdquo;</>
            : <span className="text-amber-400">No results for &ldquo;<strong>{q}</strong>&rdquo;</span>
          }
        </div>
      )}

      {wbcShow.length > 0 && (
        <>
          <SectionLabel>WBC Programs</SectionLabel>
          <div className="flex flex-col gap-2 mb-4">
            {wbcShow.map(p => (
              <ProgramCard key={p.id} program={p} shared={shared} isWbc {...handlers} />
            ))}
          </div>
        </>
      )}

      {taShow.length > 0 && (
        <>
          <SectionLabel>Team Affinity</SectionLabel>
          <div className="mb-4">
            {taShow.map(team => (
              <TeamGroup
                key={team.id}
                ta={team}
                f1={f1.find(f => f.teamId === team.id)}
                shared={shared}
                {...handlers}
              />
            ))}
          </div>
        </>
      )}

      {playerShow.length > 0 && (
        <>
          <SectionLabel>Player Programs</SectionLabel>
          <div className="flex flex-col gap-2 mb-4">
            {playerShow.map(p => (
              <ProgramCard key={p.id} program={p} shared={shared} {...handlers} />
            ))}
          </div>
        </>
      )}

      {otherShow.length > 0 && (
        <>
          <SectionLabel>Other Programs</SectionLabel>
          <div className="flex flex-col gap-2 mb-4">
            {otherShow.map(p => (
              <ProgramCard key={p.id} program={p} shared={shared} {...handlers} />
            ))}
          </div>
        </>
      )}

      {!hasAny && (
        <div className="text-center py-16 text-white/25">
          <div className="text-4xl mb-3 opacity-40">{q ? '🔍' : '📋'}</div>
          <div className="font-display font-bold text-[18px] uppercase tracking-[0.04em] text-white/30 mb-2">
            {q ? 'No results found' : 'All Programs'}
          </div>
          <div className="text-[13px]">
            {q ? 'Try a different search term' : 'Your programs will appear here'}
          </div>
        </div>
      )}
    </div>
  )
}

function SectionLabel({ children, pinned }: { children: React.ReactNode; pinned?: boolean }) {
  return (
    <div className="flex items-center gap-3 my-3">
      <span
        className="font-display font-bold text-[11px] uppercase tracking-[0.1em]"
        style={{ color: pinned ? "#f0b429" : "rgba(240,180,41,0.45)" }}
      >
        {children}
      </span>
      <div className="flex-1 h-px" style={{ background: pinned ? "rgba(240,180,41,0.3)" : "rgba(240,180,41,0.1)" }} />
    </div>
  )
}
