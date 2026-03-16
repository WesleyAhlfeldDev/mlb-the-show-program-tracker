'use client'
import { useState } from 'react'
import { useTracker, sortByCompletion } from '@/hooks/useTracker'
import { useToast, ToastContainer } from '@/hooks/useToast'
import { TabBar } from '@/components/TabBar'
import { SearchBar } from '@/components/SearchBar'
import { WBCSection } from '@/components/WBCSection'
import { TASection } from '@/components/TASection'
import { AllSection } from '@/components/AllSection'
import { ProgramCard } from '@/components/ProgramCard'
import { TeamGroup } from '@/components/TeamGroup'
import { ImportModal } from '@/components/ImportModal'
import type { ActiveTab, Program } from '@/types'

export default function Home() {
  const tracker = useTracker()
  const {
    state, hydrated, setCat,
    toggleCheck, tally, completeTally, toggleShared,
    autoComplete, togglePin, deleteProgram,
    exportAll, importBackup,
  } = tracker
  const { toast, toasts } = useToast()
  const [searchQ, setSearchQ] = useState('')
  const [showImport, setShowImport] = useState(false)

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#080c14' }}>
        <div className="font-display text-[18px] uppercase tracking-widest animate-pulse" style={{ color: 'rgba(240,180,41,0.4)' }}>
          Loading…
        </div>
      </div>
    )
  }

  const handlers = {
    onToggle: toggleCheck,
    onTally: tally,
    onToggleShared: toggleShared,
    onAutoComplete: (pid: string) => { autoComplete(pid); toast('Program completed! ✓', 'green') },
    onCompleteTally: completeTally,
    onTogglePin: togglePin,
    onDelete: (pid: string) => { deleteProgram(pid); toast('Program deleted.') },
  }

  const handleTabChange = (tab: ActiveTab) => {
    if (tab !== 'all') setSearchQ('')
    setCat(tab)
  }
  const handleSearch = (v: string) => {
    setSearchQ(v)
    if (v) setCat('all')
  }

  const activeTab = state.cat
  const allProgs = [...state.wbc, ...state.ta, ...state.f1, ...state.player, ...state.other]
  const pinnedCount = allProgs.filter(p => p.pinned).length

  return (
    <>
      {/* ── Header ── */}
      <header
        className="sticky top-0 z-50 px-4 md:px-6 flex items-center justify-between h-[58px]"
        style={{
          background: 'linear-gradient(135deg, #080c14 0%, #0d1424 100%)',
          borderBottom: '1px solid rgba(240,180,41,0.15)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-[18px] h-[18px] rotate-45 rounded-[3px]"
            style={{ background: 'linear-gradient(135deg, #ffd166, #f0b429)', boxShadow: '0 0 12px rgba(240,180,41,0.5)' }}
          />
          <div>
            <div
              className="font-display font-bold text-[17px] uppercase tracking-[0.03em] leading-none"
              style={{
                background: 'linear-gradient(135deg, #ffd166 0%, #f0b429 60%, #c8901a 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              MLB The Show 26 · Program Tracker
            </div>
            <div className="text-[10px] uppercase tracking-[0.08em] mt-0.5" style={{ color: 'rgba(240,180,41,0.4)' }}>
              Diamond Dynasty · All 30 Teams
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowImport(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[12px] font-medium transition-all"
            style={{ background: 'rgba(240,180,41,0.06)', border: '1px solid rgba(240,180,41,0.15)', color: 'rgba(240,180,41,0.7)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(240,180,41,0.12)'; e.currentTarget.style.color = '#f0b429' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(240,180,41,0.06)'; e.currentTarget.style.color = 'rgba(240,180,41,0.7)' }}
          >
            <span>⬆</span>
            <span className="hidden sm:inline">Import</span>
          </button>
          <button
            onClick={() => { exportAll(); toast('Backup downloaded!', 'blue') }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[12px] font-bold transition-all"
            style={{ background: 'linear-gradient(135deg, #ffd166, #f0b429)', color: '#080c14', boxShadow: '0 0 16px rgba(240,180,41,0.3)' }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 24px rgba(240,180,41,0.5)' }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 16px rgba(240,180,41,0.3)' }}
          >
            <span>⬇</span>
            <span className="hidden sm:inline">Export All</span>
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <main className="max-w-[980px] mx-auto px-4 md:px-6 pb-20 pt-6">

        <TabBar active={activeTab} onChange={handleTabChange} pinnedCount={pinnedCount} />

        <SearchBar value={searchQ} onChange={handleSearch} />

        {/* All / Search */}
        {(activeTab === 'all' || searchQ) && (
          <AllSection
            wbc={state.wbc} ta={state.ta} f1={state.f1}
            player={state.player} other={state.other}
            shared={state.shared} searchQ={searchQ}
            {...handlers}
          />
        )}

        {/* Pinned */}
        {activeTab === 'pinned' && !searchQ && (
          <PinnedTab
            allProgs={allProgs}
            wbcIds={state.wbc.map(p => p.id)}
            taIds={state.ta.map(p => p.id)}
            f1={state.f1}
            shared={state.shared}
            handlers={handlers}
          />
        )}

        {/* WBC */}
        {activeTab === 'wbc' && !searchQ && (
          <WBCSection programs={state.wbc} shared={state.shared} {...handlers} />
        )}

        {/* Team Affinity */}
        {activeTab === 'ta' && !searchQ && (
          <TASection ta={state.ta} f1={state.f1} shared={state.shared} {...handlers} />
        )}

        {/* Player */}
        {activeTab === 'player' && !searchQ && (
          <div>
            <div
              className="rounded-[6px] px-3.5 py-2.5 text-[12px] mb-4"
              style={{ background: 'rgba(240,180,41,0.06)', border: '1px solid rgba(240,180,41,0.15)', color: 'rgba(240,180,41,0.85)' }}
            >
              🎯 <strong>Player Programs</strong> — complete moments and stat missions to earn exclusive player cards.
            </div>
            <div className="flex flex-col gap-2">
              {sortByCompletion(state.player, state.shared).map(p => (
                <ProgramCard key={p.id} program={p} shared={state.shared} {...handlers} />
              ))}
            </div>
          </div>
        )}

        {/* Other */}
        {activeTab === 'other' && !searchQ && (
          <div>
            <div
              className="rounded-[6px] px-3.5 py-2.5 text-[12px] mb-4"
              style={{ background: 'rgba(240,180,41,0.06)', border: '1px solid rgba(240,180,41,0.15)', color: 'rgba(240,180,41,0.85)' }}
            >
              📋 <strong>Other Programs</strong> — starter and themed programs with a variety of mission types.
            </div>
            <div className="flex flex-col gap-2">
              {sortByCompletion(state.other, state.shared).map(p => (
                <ProgramCard key={p.id} program={p} shared={state.shared} {...handlers} />
              ))}
            </div>
          </div>
        )}
      </main>

      {showImport && (
        <ImportModal
          onClose={() => setShowImport(false)}
          onImport={(json) => {
            const result = importBackup(json)
            if (result.ok) toast('Backup restored!', 'green')
            return result
          }}
        />
      )}

      <ToastContainer toasts={toasts} />
    </>
  )
}

// ── Pinned tab view ───────────────────────────────────────────────────────────
type Handlers = {
  onToggle: (pid: string, mid: string) => void
  onTally: (pid: string, mid: string, delta: number) => void
  onToggleShared: (mid: string) => void
  onAutoComplete: (pid: string) => void
  onCompleteTally: (pid: string, mid: string) => void
  onTogglePin: (pid: string) => void
  onDelete: (pid: string) => void
}

function PinnedTab({
  allProgs, wbcIds, taIds, f1, shared, handlers,
}: {
  allProgs: Program[]
  wbcIds: string[]
  taIds: string[]
  f1: Program[]
  shared: import('@/types').SharedMission[]
  handlers: Handlers
}) {
  const pinned = allProgs.filter(p => p.pinned)

  if (pinned.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4 opacity-40">📌</div>
        <div
          className="font-display font-bold text-[18px] uppercase tracking-[0.04em] mb-2"
          style={{ color: 'rgba(255,255,255,0.25)' }}
        >
          No pinned programs yet
        </div>
        <div className="text-[13px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
          Click the 📌 icon on any program card to pin it here
        </div>
      </div>
    )
  }

  return (
    <div>
      <div
        className="rounded-[6px] px-3.5 py-2.5 text-[12px] mb-4"
        style={{ background: 'rgba(240,180,41,0.06)', border: '1px solid rgba(240,180,41,0.15)', color: 'rgba(240,180,41,0.85)' }}
      >
        📌 <strong>Pinned Programs</strong> — your favourites, always one tap away.
      </div>
      <div className="flex flex-col gap-2">
        {pinned.map(p => {
          const isWbc = wbcIds.includes(p.id)
          const isTa = taIds.includes(p.id)
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
    </div>
  )
}
