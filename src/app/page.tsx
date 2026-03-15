'use client'
import { useState } from 'react'
import { useTracker, sortByCompletion } from '@/hooks/useTracker'
import { useToast, ToastContainer } from '@/hooks/useToast'
import { StatsBar } from '@/components/StatsBar'
import { TabBar } from '@/components/TabBar'
import { SearchBar } from '@/components/SearchBar'
import { WBCSection } from '@/components/WBCSection'
import { TASection } from '@/components/TASection'
import { AllSection } from '@/components/AllSection'
import { ProgramCard } from '@/components/ProgramCard'
import { ImportModal } from '@/components/ImportModal'
import type { ActiveTab } from '@/types'

export default function Home() {
  const tracker = useTracker()
  const { state, hydrated, setCat, toggleCheck, tally, toggleShared, autoComplete, deleteProgram, exportAll, importBackup, stats } = tracker
  const { toast, toasts } = useToast()
  const [searchQ, setSearchQ] = useState('')
  const [showImport, setShowImport] = useState(false)

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-[#0d0f12] flex items-center justify-center">
        <div className="font-display text-white/30 text-lg uppercase tracking-widest animate-pulse">
          Loading…
        </div>
      </div>
    )
  }

  const s = stats()
  const handlers = {
    onToggle: toggleCheck,
    onTally: tally,
    onToggleShared: toggleShared,
    onAutoComplete: (pid: string) => {
      autoComplete(pid)
      toast('Program completed! ✓', 'green')
    },
    onDelete: (pid: string) => {
      deleteProgram(pid)
      toast('Program deleted.')
    },
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

  return (
    <>
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-bg2 border-b border-white/[0.07] px-4 md:px-6 flex items-center justify-between h-[58px]">
        <div className="flex items-center gap-2.5">
          <div className="w-[18px] h-[18px] bg-blue-500 rotate-45 rounded-[3px]" />
          <div>
            <div className="font-display font-bold text-[17px] uppercase tracking-[0.03em] leading-none">
              MLB The Show 26 · Program Tracker
            </div>
            <div className="text-[10px] text-white/30 uppercase tracking-[0.08em] mt-0.5">
              Diamond Dynasty · All 30 Teams
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowImport(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-bg3 border border-white/[0.13] text-[12px] font-medium text-white hover:bg-bg4 transition-colors"
          >
            <span>⬆</span>
            <span className="hidden sm:inline">Import</span>
          </button>
          <button
            onClick={() => { exportAll(); toast('Backup downloaded!', 'blue') }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-blue-500 border border-blue-500 text-[12px] font-medium text-white hover:bg-blue-600 transition-colors"
          >
            <span>⬇</span>
            <span className="hidden sm:inline">Export All</span>
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <main className="max-w-[980px] mx-auto px-4 md:px-6 pb-20 pt-6">
        <StatsBar stats={s} />

        <TabBar active={activeTab} onChange={handleTabChange} />

        <SearchBar value={searchQ} onChange={handleSearch} />

        {/* ── All / Search view ── */}
        {(activeTab === 'all' || searchQ) && (
          <AllSection
            wbc={state.wbc}
            ta={state.ta}
            f1={state.f1}
            player={state.player}
            other={state.other}
            shared={state.shared}
            searchQ={searchQ}
            {...handlers}
          />
        )}

        {/* ── WBC ── */}
        {activeTab === 'wbc' && !searchQ && (
          <WBCSection
            programs={state.wbc}
            shared={state.shared}
            {...handlers}
          />
        )}

        {/* ── Team Affinity ── */}
        {activeTab === 'ta' && !searchQ && (
          <TASection
            ta={state.ta}
            f1={state.f1}
            shared={state.shared}
            {...handlers}
          />
        )}

        {/* ── Player ── */}
        {activeTab === 'player' && !searchQ && (
          <div>
            <div className="bg-blue-500/10 border border-blue-500/25 rounded-[6px] px-3.5 py-2.5 text-[12px] text-blue-300 mb-4">
              🎯 <strong>Player Programs</strong> — complete moments and stat missions to earn exclusive player cards.
            </div>
            <div className="flex flex-col gap-2">
              {sortByCompletion(state.player, state.shared).map(p => (
                <ProgramCard key={p.id} program={p} shared={state.shared} {...handlers} />
              ))}
            </div>
          </div>
        )}

        {/* ── Other ── */}
        {activeTab === 'other' && !searchQ && (
          <div>
            <div className="bg-blue-500/10 border border-blue-500/25 rounded-[6px] px-3.5 py-2.5 text-[12px] text-blue-300 mb-4">
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

      {/* ── Import Modal ── */}
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
