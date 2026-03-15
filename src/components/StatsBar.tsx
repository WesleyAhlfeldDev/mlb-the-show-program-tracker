'use client'

interface Props {
  stats: {
    done: number
    total: number
    wbcMs: { done: number; total: number }
    taMs: { done: number; total: number }
    talliesDone: number
  }
}

export function StatsBar({ stats }: Props) {
  const cards = [
    { num: stats.done, acc: stats.total, label: 'Programs done' },
    { num: stats.wbcMs.done, acc: stats.wbcMs.total, label: 'WBC missions' },
    { num: stats.taMs.done, acc: stats.taMs.total, label: 'TA + #1 Fan missions' },
    { num: stats.talliesDone, acc: null, label: 'Tallies complete' },
  ]
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-5">
      {cards.map(c => (
        <div key={c.label} className="bg-bg2 border border-white/[0.07] rounded-xl p-3.5 text-center">
          <div className="font-display text-[26px] font-bold leading-none">
            {c.num}
            {c.acc !== null && (
              <span className="text-blue-400">/{c.acc}</span>
            )}
          </div>
          <div className="text-[11px] text-white/35 uppercase tracking-[0.07em] mt-1">{c.label}</div>
        </div>
      ))}
    </div>
  )
}
