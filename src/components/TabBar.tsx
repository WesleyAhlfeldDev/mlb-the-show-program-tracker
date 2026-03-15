'use client'
import type { ActiveTab } from '@/types'

const TABS: { id: ActiveTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'wbc', label: 'WBC' },
  { id: 'ta', label: 'Team Affinity' },
  { id: 'player', label: 'Player' },
  { id: 'other', label: 'Other' },
]

interface Props {
  active: ActiveTab
  onChange: (tab: ActiveTab) => void
}

export function TabBar({ active, onChange }: Props) {
  return (
    <div className="sticky top-[58px] z-40 mb-4">
      <div className="flex gap-1 bg-bg2 border border-white/[0.07] rounded-xl p-1.5 overflow-x-auto scrollbar-none">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={[
              'font-display font-bold text-[13px] uppercase tracking-[0.06em] whitespace-nowrap',
              'px-5 py-2 rounded-[6px] transition-colors duration-150 flex-shrink-0',
              active === t.id
                ? 'bg-blue-500 text-white'
                : 'text-white/50 hover:bg-bg3 hover:text-white'
            ].join(' ')}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  )
}
