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
  onCompleteTally: (pid: string, mid: string) => void
  onToggleShared: (mid: string) => void
  onAutoComplete: (pid: string) => void
  onTogglePin: (pid: string) => void
  onDelete: (pid: string) => void
}

export function ProgramCard({
  program: p, shared, isWbc = false,
  onToggle, onTally, onCompleteTally, onToggleShared,
  onAutoComplete, onTogglePin, onDelete,
}: Props) {
  const [expanded, setExpanded] = useState(false)
  const pc = pct(p, shared)
  const done = pc === 100
  const { done: dn, total: tot } = missionCounts(p, shared)
  const pinned = p.pinned ?? false

  const barColor = done
    ? 'linear-gradient(90deg, #22c55e, #16a34a)'
    : `linear-gradient(90deg, ${p.color}bb, ${p.color})`

  return (
    <div
      className="rounded-xl overflow-hidden transition-all"
      style={{
        border: pinned
          ? '1px solid rgba(240,180,41,0.5)'
          : done
            ? '1px solid rgba(34,197,94,0.25)'
            : expanded
              ? '1px solid rgba(240,180,41,0.3)'
              : '1px solid rgba(255,255,255,0.08)',
        background: pinned
          ? 'linear-gradient(135deg, #111d2e 0%, #162035 100%)'
          : 'linear-gradient(135deg, #0d1828 0%, #132030 100%)',
        boxShadow: pinned
          ? '0 0 20px rgba(240,180,41,0.1), 0 4px 16px rgba(0,0,0,0.4)'
          : '0 2px 8px rgba(0,0,0,0.3)',
        opacity: done && !pinned ? 0.72 : 1,
      }}
    >
      {/* Top stripe */}
      {pinned && (
        <div className="h-[2px] w-full" style={{ background: 'linear-gradient(90deg, #c8901a, #ffd166, #f0b429, #ffd166, #c8901a)' }} />
      )}
      {done && !pinned && (
        <div className="h-[2px] w-full completed-stripe-gold" />
      )}

      {/* Header */}
      <div
        onClick={() => setExpanded(e => !e)}
        className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
        style={{
          background: expanded && !done ? 'rgba(240,180,41,0.04)' : 'transparent',
        }}
      >
        <div
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ background: p.color, boxShadow: `0 0 8px ${p.color}90` }}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-display font-bold text-[14px] uppercase tracking-[0.04em] ${done && !pinned ? 'text-white/40' : 'text-white'}`}>
              {p.name}
            </span>
            {pinned && (
              <span
                className="text-[10px] font-bold uppercase tracking-[0.06em] px-1.5 py-0.5 rounded-[4px]"
                style={{ background: 'rgba(240,180,41,0.15)', color: '#ffd166', border: '1px solid rgba(240,180,41,0.35)' }}
              >
                📌 Pinned
              </span>
            )}
          </div>
          <div className="text-[12px] mt-0.5 font-medium" style={{ color: done ? 'rgba(200,215,235,0.35)' : 'rgba(200,215,235,0.65)' }}>
            {p.category}
            <span className="mx-1.5" style={{ color: 'rgba(200,215,235,0.3)' }}>·</span>
            <span style={{ color: done ? 'rgba(200,215,235,0.35)' : 'rgba(200,215,235,0.5)' }}>
              {dn}/{tot} missions
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Pin button */}
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onTogglePin(p.id) }}
            title={pinned ? 'Unpin' : 'Pin to top'}
            className="w-7 h-7 rounded-[6px] flex items-center justify-center text-[13px] transition-all"
            style={pinned
              ? { background: 'rgba(240,180,41,0.2)', border: '1px solid rgba(240,180,41,0.45)', color: '#ffd166' }
              : { background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)' }
            }
            onMouseEnter={e => {
              if (!pinned) {
                e.currentTarget.style.background = 'rgba(240,180,41,0.12)'
                e.currentTarget.style.borderColor = 'rgba(240,180,41,0.4)'
                e.currentTarget.style.color = '#ffd166'
              }
            }}
            onMouseLeave={e => {
              if (!pinned) {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                e.currentTarget.style.color = 'rgba(255,255,255,0.3)'
              }
            }}
          >
            📌
          </button>

          {/* Complete button */}
          {!done && (
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onAutoComplete(p.id) }}
              className="text-[11px] font-bold px-3 py-1.5 rounded-[6px] transition-all"
              style={{ background: 'rgba(240,180,41,0.12)', border: '1px solid rgba(240,180,41,0.35)', color: '#ffd166' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(240,180,41,0.22)'; e.currentTarget.style.boxShadow = '0 0 12px rgba(240,180,41,0.3)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(240,180,41,0.12)'; e.currentTarget.style.boxShadow = 'none' }}
            >
              Complete
            </button>
          )}

          {/* % badge */}
          <span
            className="font-display text-[12px] font-bold px-2.5 py-1 rounded-full min-w-[52px] text-center"
            style={done
              ? { background: 'rgba(34,197,94,0.15)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.3)' }
              : { background: 'rgba(240,180,41,0.12)', color: '#ffd166', border: '1px solid rgba(240,180,41,0.3)' }
            }
          >
            {done ? '✓ Done' : `${pc}%`}
          </span>

          <span
            className="text-[11px] transition-transform duration-200"
            style={{ color: 'rgba(200,215,235,0.4)', transform: expanded ? 'rotate(180deg)' : 'none' }}
          >▼</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-[3px]" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div className="h-full transition-all duration-500" style={{ background: barColor, width: `${pc}%` }} />
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4">
          {p.sections.map((sec, si) => (
            <div key={si}>
              <div
                className={`text-[11px] font-bold uppercase tracking-[0.09em] py-3 ${si > 0 ? 'border-t mt-1' : 'pt-3'}`}
                style={{ color: 'rgba(200,215,235,0.55)', borderColor: 'rgba(255,255,255,0.06)' }}
              >
                {sec.label}
              </div>
              {sec.missions.map(m => (
                <MissionRow key={m.id} pid={p.id} mission={m} onToggle={onToggle} onTally={onTally} onCompleteTally={onCompleteTally} />
              ))}
            </div>
          ))}

          {isWbc && p.id !== 'wbc-moonshot' && (
            <div>
              <div
                className="text-[11px] font-bold uppercase tracking-[0.09em] py-3 border-t mt-1"
                style={{ color: 'rgba(200,215,235,0.55)', borderColor: 'rgba(255,255,255,0.06)' }}
              >
                Series missions — shared across all 4 pools
              </div>
              {shared.map(m => <SharedMissionRow key={m.id} mission={m} onToggle={onToggleShared} />)}
            </div>
          )}

          {p.boss && (
            <div
              className="flex items-center gap-2.5 rounded-[8px] px-3.5 py-2.5 mt-4"
              style={{ background: 'rgba(240,180,41,0.07)', border: '1px solid rgba(240,180,41,0.2)' }}
            >
              <div className="w-3 h-3 rotate-45 rounded-sm flex-shrink-0" style={{ background: p.color }} />
              <div>
                <div className="text-[10px] uppercase tracking-[0.07em] font-semibold" style={{ color: 'rgba(240,180,41,0.6)' }}>Reward card(s)</div>
                <div className="text-[13px] font-semibold mt-0.5" style={{ color: '#e8edf8' }}>{p.boss}</div>
              </div>
            </div>
          )}

          <div className="flex gap-2 mt-4 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <button
              type="button"
              onClick={() => onDelete(p.id)}
              className="text-[11px] font-medium px-3 py-1.5 rounded-[6px] transition-colors"
              style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(200,215,235,0.4)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#fca5a5'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.35)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(200,215,235,0.4)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
            >
              ✕ Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
