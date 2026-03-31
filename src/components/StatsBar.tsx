'use client'

interface Props {
  stats: {
    done: number
    total: number
    wbcMs: { done: number; total: number }
    taMs:  { done: number; total: number }
    talliesDone: number
  }
}

export function StatsBar({ stats }: Props) {
  const cards = [
    { num: stats.done,            acc: stats.total,        label: 'Programs done' },
    { num: stats.wbcMs.done,      acc: stats.wbcMs.total,  label: 'WBC missions' },
    { num: stats.taMs.done,       acc: stats.taMs.total,   label: 'TA + #1 Fan missions' },
    { num: stats.talliesDone,     acc: null,               label: 'Tallies complete' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-5">
      {cards.map((c, i) => (
        <div
          key={c.label}
          className="rounded-xl p-3.5 text-center border relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0d1424 0%, #141d30 100%)',
            borderColor: 'rgba(240,180,41,0.12)',
          }}
        >
          {/* subtle corner glow */}
          <div
            className="absolute -top-4 -right-4 w-16 h-16 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(240,180,41,0.12) 0%, transparent 70%)' }}
          />
          <div className="font-display text-[28px] md:text-[36px] font-black leading-none relative">
            <span style={{
              background: 'linear-gradient(135deg, #ffd166 0%, #f0b429 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              {c.num}
            </span>
            {c.acc !== null && (
              <span className="text-white/25 text-[20px] md:text-[26px]">/{c.acc}</span>
            )}
          </div>
          <div className="text-[11px] md:text-[13px] text-white/35 uppercase tracking-[0.07em] mt-1">{c.label}</div>
        </div>
      ))}
    </div>
  )
}
