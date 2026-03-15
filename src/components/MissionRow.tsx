'use client'
import type { Mission, SharedMission } from '@/types'

// ── Tally counter ─────────────────────────────────────────────────────────────
function TallyCounter({
  mission, onTally,
}: { mission: Mission; onTally: (delta: number) => void }) {
  const cur = mission.current ?? 0
  const tgt = mission.target
  const done = cur >= tgt
  const pct = Math.min(cur / tgt, 1)

  if (done) {
    return (
      <div className="w-7 h-7 bg-green-500/15 border border-green-500/30 rounded-[6px] flex items-center justify-center text-green-400 text-xs flex-shrink-0">
        ✓
      </div>
    )
  }
  return (
    <div className="flex items-stretch flex-shrink-0 rounded-[6px] overflow-hidden border border-white/[0.13]">
      <button
        onClick={() => onTally(-1)}
        className="w-[30px] h-[30px] bg-bg3 hover:bg-bg4 text-white text-lg flex items-center justify-center transition-colors"
      >
        −
      </button>
      <div className="min-w-[52px] text-center font-display text-[13px] font-bold bg-bg text-white flex items-center justify-center border-x border-white/[0.13] px-1">
        {cur}/{tgt}
      </div>
      <button
        onClick={() => onTally(1)}
        className="w-[30px] h-[30px] bg-blue-500 hover:bg-blue-600 text-white text-lg font-bold flex items-center justify-center transition-colors"
      >
        +
      </button>
    </div>
  )
}

// ── Progress mini-bar (shown under tally label) ───────────────────────────────
function MiniBar({ current, target }: { current: number; target: number }) {
  const pct = Math.min((current ?? 0) / target, 1)
  return (
    <div className="h-[2px] bg-bg4 rounded-full mt-1 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{ width: `${pct * 100}%`, background: pct >= 1 ? '#22c55e' : '#3b82f6' }}
      />
    </div>
  )
}

// ── Individual mission row ────────────────────────────────────────────────────
interface MissionRowProps {
  pid: string
  mission: Mission
  onToggle: (pid: string, mid: string) => void
  onTally: (pid: string, mid: string, delta: number) => void
}

export function MissionRow({ pid, mission: m, onToggle, onTally }: MissionRowProps) {
  const done = m.done

  if (m.type === 'check') {
    return (
      <div className="flex items-start gap-2.5 py-1.5 border-t border-white/[0.04] first:border-t-0">
        <button
          onClick={() => onToggle(pid, m.id)}
          className={[
            'w-4 h-4 rounded-[4px] flex-shrink-0 mt-0.5 flex items-center justify-center transition-all border',
            done
              ? 'bg-blue-500 border-blue-500'
              : 'border-white/[0.13] hover:border-blue-400',
          ].join(' ')}
        >
          {done && (
            <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
              <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
        <span className={`flex-1 text-[13px] leading-snug ${done ? 'text-white/30 line-through' : 'text-white/85'}`}>
          {m.text}
        </span>
        <span className="text-[11px] text-green-400 font-semibold flex-shrink-0 mt-0.5">
          +{m.xp.toLocaleString()} XP
        </span>
      </div>
    )
  }

  if (m.type === 'rep') {
    return (
      <div className="flex items-start gap-2.5 py-1.5 border-t border-white/[0.04] first:border-t-0">
        <button
          onClick={() => onToggle(pid, m.id)}
          className={[
            'w-4 h-4 rounded-[4px] flex-shrink-0 mt-0.5 flex items-center justify-center transition-all border',
            done ? 'bg-blue-500 border-blue-500' : 'border-white/[0.13] hover:border-blue-400',
          ].join(' ')}
        >
          {done && (
            <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
              <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
        <div className="flex-1 min-w-0">
          <span className={`text-[13px] leading-snug ${done ? 'text-white/30 line-through' : 'text-white/85'}`}>
            {m.text}
          </span>
          <div className="text-[10px] text-amber-400 mt-0.5">↻ repeatable</div>
        </div>
        <span className="text-[11px] text-green-400 font-semibold flex-shrink-0 mt-0.5">
          +{m.xp.toLocaleString()} XP
        </span>
      </div>
    )
  }

  // tally
  return (
    <div className="flex items-center gap-2.5 py-2 border-t border-white/[0.04] first:border-t-0">
      <div className="flex-1 min-w-0">
        <div className={`text-[13px] leading-snug ${done ? 'text-white/30 line-through' : 'text-white/85'}`}>
          {m.text}
        </div>
        <MiniBar current={m.current ?? 0} target={m.target} />
      </div>
      <TallyCounter mission={m} onTally={d => onTally(pid, m.id, d)} />
      <span className="text-[11px] text-green-400 font-semibold flex-shrink-0 ml-1">
        +{m.xp.toLocaleString()} XP
      </span>
    </div>
  )
}

// ── Shared WBC mission row ────────────────────────────────────────────────────
interface SharedRowProps {
  mission: SharedMission
  onToggle: (mid: string) => void
}

export function SharedMissionRow({ mission: m, onToggle }: SharedRowProps) {
  return (
    <div className="flex items-start gap-2.5 py-1.5 border-t border-white/[0.04] first:border-t-0">
      <button
        onClick={() => onToggle(m.id)}
        className={[
          'w-4 h-4 rounded-[4px] flex-shrink-0 mt-0.5 flex items-center justify-center transition-all border',
          m.done ? 'bg-green-700 border-green-500' : 'border-white/[0.13] hover:border-green-400',
        ].join(' ')}
      >
        {m.done && (
          <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
            <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>
      <span className={`flex-1 text-[13px] leading-snug ${m.done ? 'text-white/30 line-through' : 'text-white/85'}`}>
        {m.text}
        <span className="inline-flex text-[9px] font-bold uppercase tracking-[0.06em] bg-green-500/12 text-green-400 border border-green-500/20 rounded-[4px] px-1.5 py-0.5 ml-1.5 align-middle">
          all pools
        </span>
      </span>
      <span className="text-[11px] text-green-400 font-semibold flex-shrink-0 mt-0.5">
        +{m.xp} XP
      </span>
    </div>
  )
}
