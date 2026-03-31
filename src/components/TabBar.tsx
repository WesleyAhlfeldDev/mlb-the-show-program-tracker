'use client'
import type { ActiveTab, CustomTab } from '@/types'

export const BUILT_IN_TABS: { id: string; label: string }[] = [
  { id: 'all',    label: 'All' },
  { id: 'pinned', label: '📌 Pinned' },
  { id: 'wbc',    label: 'WBC' },
  { id: 'ta',     label: 'Team Affinity' },
  { id: 'player', label: 'Player' },
  { id: 'other',  label: 'Other' },
]

interface Props {
  active: ActiveTab
  onChange: (tab: ActiveTab) => void
  pinnedCount: number
  customTabs?: CustomTab[]
  tabOrder?: string[]
}

export function TabBar({ active, onChange, pinnedCount, customTabs = [], tabOrder }: Props) {
  const allTabs = [...BUILT_IN_TABS, ...customTabs]

  const tabs = tabOrder && tabOrder.length > 0
    ? [
        ...tabOrder.map(id => allTabs.find(t => t.id === id)).filter(Boolean) as { id: string; label: string }[],
        ...allTabs.filter(t => !tabOrder.includes(t.id)),
      ]
    : allTabs

  return (
    <div className="sticky top-[58px] z-40 mb-4">
      <div
        className="flex gap-1 rounded-xl p-1.5 overflow-x-auto scrollbar-none border"
        style={{
          background: 'linear-gradient(135deg, #0d1424 0%, #141d30 100%)',
          borderColor: 'rgba(240,180,41,0.15)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
        }}
      >
        {tabs.map(t => {
          const isActive = active === t.id
          const isPinnedTab = t.id === 'pinned'
          return (
            <button
              key={t.id}
              onClick={() => onChange(t.id)}
              className={[
                'font-display font-bold text-[13px] md:text-[15px] uppercase tracking-[0.06em] whitespace-nowrap',
                'px-5 py-2 rounded-[6px] transition-all duration-200 flex-shrink-0 flex items-center gap-1.5',
                isActive ? 'text-bg font-black' : 'text-white/40 hover:text-white/80 hover:bg-white/5',
              ].join(' ')}
              style={isActive ? {
                background: 'linear-gradient(135deg, #ffd166 0%, #f0b429 50%, #c8901a 100%)',
                boxShadow: '0 0 16px rgba(240,180,41,0.4), 0 2px 8px rgba(0,0,0,0.3)',
              } : {}}
            >
              {t.label}
              {isPinnedTab && pinnedCount > 0 && (
                <span
                  className="text-[10px] md:text-[12px] font-black px-1.5 py-0.5 rounded-full leading-none"
                  style={isActive
                    ? { background: 'rgba(0,0,0,0.2)', color: '#080c14' }
                    : { background: 'rgba(240,180,41,0.2)', color: '#f0b429' }
                  }
                >
                  {pinnedCount}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
