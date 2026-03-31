'use client'
import { useState, useRef } from 'react'
import type { Mission, SharedMission } from '@/types'

const Checkmark = () => (
  <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
    <path d="M1 3.5L3.5 6L8 1" stroke="#080c14" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

function Checkbox({ checked, onClick, color = 'gold' }: { checked: boolean; onClick: () => void; color?: 'gold' | 'green' }) {
  return (
    <button
      type="button"
      onClick={e => { e.stopPropagation(); onClick() }}
      className="w-5 h-5 rounded-[5px] flex-shrink-0 flex items-center justify-center transition-all"
      style={checked ? {
        background: color === 'green'
          ? 'linear-gradient(135deg, #22c55e, #15803d)'
          : 'linear-gradient(135deg, #ffd166, #f0b429)',
        border: '1px solid transparent',
        boxShadow: color === 'green' ? '0 0 8px rgba(34,197,94,0.4)' : '0 0 8px rgba(240,180,41,0.5)',
      } : {
        background: 'transparent',
        border: '1px solid rgba(255,255,255,0.18)',
      }}
      onMouseEnter={e => { if (!checked) e.currentTarget.style.borderColor = 'rgba(240,180,41,0.5)' }}
      onMouseLeave={e => { if (!checked) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)' }}
    >
      {checked && <Checkmark />}
    </button>
  )
}

function TallyCounter({ mission, onTally, onSet }: {
  mission: Mission
  onTally: (d: number) => void
  onSet: (val: number) => void
}) {
  const cur = mission.current ?? 0
  const tgt = mission.target
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  if (cur >= tgt) return null

  const commitEdit = () => {
    const parsed = parseInt(draft, 10)
    if (!isNaN(parsed)) onSet(Math.max(0, Math.min(parsed, tgt)))
    setEditing(false)
    setDraft('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commitEdit()
    if (e.key === 'Escape') { setEditing(false); setDraft('') }
  }

  return (
    <div
      className="flex items-stretch flex-shrink-0 rounded-[6px] overflow-hidden"
      style={{ border: '1px solid rgba(240,180,41,0.25)' }}
    >
      <button
        type="button"
        onClick={e => { e.stopPropagation(); onTally(-1) }}
        className="w-8 h-8 text-white text-base flex items-center justify-center transition-colors select-none"
        style={{ background: '#141d30' }}
        onMouseEnter={e => (e.currentTarget.style.background = '#1c2840')}
        onMouseLeave={e => (e.currentTarget.style.background = '#141d30')}
      >−</button>

      {editing ? (
        <input
          ref={inputRef}
          type="number"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={handleKeyDown}
          onClick={e => e.stopPropagation()}
          className="w-14 text-center font-display text-[12px] md:text-[14px] font-bold outline-none"
          style={{
            background: '#080c14',
            borderLeft: '1px solid rgba(240,180,41,0.3)',
            borderRight: '1px solid rgba(240,180,41,0.3)',
            color: '#ffd166',
            WebkitAppearance: 'none',
            MozAppearance: 'textfield',
          }}
          placeholder={String(cur)}
          autoFocus
        />
      ) : (
        <button
          type="button"
          title="Click to type a value"
          onClick={e => {
            e.stopPropagation()
            setDraft(String(cur))
            setEditing(true)
            setTimeout(() => inputRef.current?.select(), 10)
          }}
          className="w-14 text-center font-display text-[12px] md:text-[14px] font-bold text-white select-none transition-colors"
          style={{
            background: '#080c14',
            borderLeft: '1px solid rgba(240,180,41,0.15)',
            borderRight: '1px solid rgba(240,180,41,0.15)',
            cursor: 'text',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#0d1424'
            e.currentTarget.style.borderLeftColor = 'rgba(240,180,41,0.3)'
            e.currentTarget.style.borderRightColor = 'rgba(240,180,41,0.3)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = '#080c14'
            e.currentTarget.style.borderLeftColor = 'rgba(240,180,41,0.15)'
            e.currentTarget.style.borderRightColor = 'rgba(240,180,41,0.15)'
          }}
        >
          {cur}/{tgt}
        </button>
      )}

      <button
        type="button"
        onClick={e => { e.stopPropagation(); onTally(1) }}
        className="w-8 h-8 text-[#080c14] text-base font-black flex items-center justify-center transition-all select-none"
        style={{ background: 'linear-gradient(135deg, #ffd166, #f0b429)' }}
        onMouseEnter={e => (e.currentTarget.style.background = 'linear-gradient(135deg, #ffe08a, #f8c040)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'linear-gradient(135deg, #ffd166, #f0b429)')}
      >+</button>
    </div>
  )
}

function MiniBar({ current, target }: { current: number; target: number }) {
  const pct = Math.min((current ?? 0) / target, 1)
  return (
    <div className="h-[2px] rounded-full mt-1.5 overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{
          width: `${pct * 100}%`,
          background: pct >= 1 ? 'linear-gradient(90deg, #22c55e, #15803d)' : 'linear-gradient(90deg, #ffd166, #f0b429)',
        }}
      />
    </div>
  )
}

interface MissionRowProps {
  pid: string
  mission: Mission
  onToggle: (pid: string, mid: string) => void
  onTally: (pid: string, mid: string, delta: number) => void
  onCompleteTally: (pid: string, mid: string) => void
}

export function MissionRow({ pid, mission: m, onToggle, onTally, onCompleteTally }: MissionRowProps) {
  const done = m.done

  const handleSet = (val: number) => {
    const cur = m.current ?? 0
    const delta = val - cur
    if (delta !== 0) onTally(pid, m.id, delta)
  }

  if (m.type === 'check') {
    return (
      <div className="flex items-start gap-2.5 py-2 border-t first:border-t-0" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <div className="mt-0.5 flex-shrink-0"><Checkbox checked={done} onClick={() => onToggle(pid, m.id)} /></div>
        <span className={`flex-1 text-[13px] md:text-[15px] leading-snug ${done ? 'text-white/30 line-through' : 'text-white/90'}`}>{m.text}</span>
        <span className="text-[11px] md:text-[13px] font-semibold flex-shrink-0 mt-0.5 ml-1" style={{ color: '#ffd166' }}>+{m.xp.toLocaleString()} XP</span>
      </div>
    )
  }

  if (m.type === 'rep') {
    return (
      <div className="flex items-start gap-2.5 py-2 border-t first:border-t-0" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <div className="mt-0.5 flex-shrink-0"><Checkbox checked={done} onClick={() => onToggle(pid, m.id)} /></div>
        <div className="flex-1 min-w-0">
          <span className={`text-[13px] leading-snug ${done ? 'text-white/30 line-through' : 'text-white/90'}`}>{m.text}</span>
          <div className="text-[10px] md:text-[12px] mt-0.5" style={{ color: 'rgba(240,180,41,0.6)' }}>↻ repeatable</div>
        </div>
        <span className="text-[11px] font-semibold flex-shrink-0 mt-0.5 ml-1" style={{ color: '#ffd166' }}>+{m.xp.toLocaleString()} XP</span>
      </div>
    )
  }

  // Tally — stacked layout on mobile
  return (
    <div className="py-2 border-t first:border-t-0" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
      {/* Top row: checkbox + text */}
      <div className="flex items-start gap-2.5">
        <div className="mt-0.5 flex-shrink-0"><Checkbox checked={done} onClick={() => onCompleteTally(pid, m.id)} /></div>
        <span className={`flex-1 text-[13px] leading-snug ${done ? 'text-white/30 line-through' : 'text-white/90'}`}>{m.text}</span>
        <span className="text-[11px] font-semibold flex-shrink-0 ml-1 mt-0.5" style={{ color: '#ffd166' }}>+{m.xp.toLocaleString()} XP</span>
      </div>
      {/* Bottom row: progress bar + tally counter */}
      {!done && (
        <div className="flex items-center gap-2 mt-2 ml-[28px]">
          <div className="flex-1">
            <MiniBar current={m.current ?? 0} target={m.target} />
          </div>
          <TallyCounter mission={m} onTally={d => onTally(pid, m.id, d)} onSet={handleSet} />
        </div>
      )}
      {done && (
        <div className="flex items-center gap-1.5 mt-1 ml-[28px]">
          <div
            className="text-[10px] md:text-[12px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(34,197,94,0.12)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.25)' }}
          >
            ✓ {m.target}/{m.target}
          </div>
        </div>
      )}
    </div>
  )
}

export function SharedMissionRow({ mission: m, onToggle }: { mission: SharedMission; onToggle: (mid: string) => void }) {
  return (
    <div className="flex items-start gap-2.5 py-2 border-t first:border-t-0" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
      <div className="mt-0.5 flex-shrink-0"><Checkbox checked={m.done} onClick={() => onToggle(m.id)} color="green" /></div>
      <span className={`flex-1 text-[13px] md:text-[15px] leading-snug ${m.done ? 'text-white/30 line-through' : 'text-white/90'}`}>
        {m.text}
        <span
          className="inline-flex text-[9px] md:text-[11px] font-bold uppercase tracking-[0.06em] rounded-[4px] px-1.5 py-0.5 ml-1.5 align-middle"
          style={{ background: 'rgba(240,180,41,0.1)', color: '#ffd166', border: '1px solid rgba(240,180,41,0.2)' }}
        >all pools</span>
      </span>
      <span className="text-[11px] font-semibold flex-shrink-0 mt-0.5 ml-1" style={{ color: '#ffd166' }}>+{m.xp} XP</span>
    </div>
  )
}
