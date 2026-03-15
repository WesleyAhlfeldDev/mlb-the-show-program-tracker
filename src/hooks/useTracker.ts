'use client'
import { useState, useEffect, useCallback } from 'react'
import type { Program, SharedMission, Mission, ActiveTab, TrackerState } from '@/types'
import {
  WBC_DEF, TA_DEF, F1_DEF, PLAYER_DEF, OTHER_DEF, SHARED_MISSIONS_DEFAULT
} from '@/data'

const SK = 'mlb26_v12'

function deepClone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v))
}

function initState(): TrackerState {
  return {
    wbc: deepClone(WBC_DEF),
    ta: deepClone(TA_DEF),
    f1: deepClone(F1_DEF),
    moonshot: [],
    player: deepClone(PLAYER_DEF),
    other: deepClone(OTHER_DEF),
    shared: deepClone(SHARED_MISSIONS_DEFAULT),
    cat: 'all',
  }
}

function loadState(): TrackerState {
  if (typeof window === 'undefined') return initState()
  try {
    const raw = localStorage.getItem(SK)
    if (!raw) return initState()
    const d = JSON.parse(raw) as Partial<TrackerState>
    return {
      wbc: d.wbc?.length ? d.wbc : deepClone(WBC_DEF),
      ta: d.ta?.length ? d.ta : deepClone(TA_DEF),
      f1: d.f1?.length ? d.f1 : deepClone(F1_DEF),
      moonshot: d.moonshot ?? [],
      player: d.player?.length ? d.player : deepClone(PLAYER_DEF),
      other: d.other?.length ? d.other : deepClone(OTHER_DEF),
      shared: d.shared?.length ? d.shared : deepClone(SHARED_MISSIONS_DEFAULT),
      cat: d.cat ?? 'all',
    }
  } catch {
    return initState()
  }
}

// ── Calc helpers ──────────────────────────────────────────────────────────────
export function pct(p: Program, shared: SharedMission[] = []): number {
  const nonRep = (ms: Mission[]) => ms.filter(m => m.type !== 'rep')
  const total = p.sections.reduce((a, s) => a + nonRep(s.missions).length, 0)
    + (p.tab === 'wbc' && p.id !== 'wbc-moonshot' ? shared.length : 0)
  const done = p.sections.reduce((a, s) => a + nonRep(s.missions).filter(m => m.done).length, 0)
    + (p.tab === 'wbc' && p.id !== 'wbc-moonshot' ? shared.filter(m => m.done).length : 0)
  return total ? Math.round((done / total) * 100) : 0
}

export function missionCounts(p: Program, shared: SharedMission[] = []) {
  const nonRep = (ms: Mission[]) => ms.filter(m => m.type !== 'rep')
  const withShared = p.tab === 'wbc' && p.id !== 'wbc-moonshot'
  const total = p.sections.reduce((a, s) => a + nonRep(s.missions).length, 0)
    + (withShared ? shared.length : 0)
  const done = p.sections.reduce((a, s) => a + nonRep(s.missions).filter(m => m.done).length, 0)
    + (withShared ? shared.filter(m => m.done).length : 0)
  return { done, total }
}

export function sortByCompletion(arr: Program[], shared: SharedMission[]): Program[] {
  return [...arr].sort((a, b) => {
    const ad = pct(a, shared) === 100
    const bd = pct(b, shared) === 100
    if (ad === bd) return 0
    return ad ? 1 : -1
  })
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useTracker() {
  const [state, setState] = useState<TrackerState>(initState)
  const [hydrated, setHydrated] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    setState(loadState())
    setHydrated(true)
  }, [])

  // Save to localStorage on every state change (after hydration)
  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(SK, JSON.stringify(state))
    } catch {}
  }, [state, hydrated])

  const allPrograms = useCallback(() =>
    [...state.wbc, ...state.ta, ...state.f1, ...state.moonshot, ...state.player, ...state.other],
    [state]
  )

  // ── Tab ────────────────────────────────────────────────────────────────────
  const setCat = useCallback((cat: ActiveTab) => {
    setState(s => ({ ...s, cat }))
  }, [])

  // ── Toggle mission checkbox ────────────────────────────────────────────────
  const toggleCheck = useCallback((pid: string, mid: string) => {
    setState(s => {
      const arr = getAllArray(s)
      const prog = arr.find(p => p.id === pid)
      if (!prog) return s
      for (const sec of prog.sections) {
        const m = sec.missions.find(m => m.id === mid)
        if (m) { m.done = !m.done; break }
      }
      return { ...s, ...rebuildArrays(s, arr) }
    })
  }, [])

  // ── Tally ──────────────────────────────────────────────────────────────────
  const tally = useCallback((pid: string, mid: string, delta: number) => {
    setState(s => {
      const arr = getAllArray(s)
      const prog = arr.find(p => p.id === pid)
      if (!prog) return s
      for (const sec of prog.sections) {
        const m = sec.missions.find(m => m.id === mid)
        if (m) {
          m.current = Math.max(0, Math.min((m.current ?? 0) + delta, m.target))
          m.done = m.current >= m.target
          break
        }
      }
      return { ...s, ...rebuildArrays(s, arr) }
    })
  }, [])

  // ── Toggle shared mission ──────────────────────────────────────────────────
  const toggleShared = useCallback((mid: string) => {
    setState(s => {
      const shared = s.shared.map(m => m.id === mid ? { ...m, done: !m.done } : m)
      return { ...s, shared }
    })
  }, [])

  // ── Auto-complete ──────────────────────────────────────────────────────────
  const autoComplete = useCallback((pid: string) => {
    setState(s => {
      const arr = getAllArray(s)
      const prog = arr.find(p => p.id === pid)
      if (!prog) return s
      prog.sections.forEach(sec => sec.missions.forEach(m => {
        if (m.type === 'tally') { m.current = m.target; m.done = true }
        else if (m.type === 'check') { m.done = true }
      }))
      return { ...s, ...rebuildArrays(s, arr) }
    })
  }, [])

  // ── Delete ─────────────────────────────────────────────────────────────────
  const deleteProgram = useCallback((pid: string) => {
    setState(s => ({
      ...s,
      wbc: s.wbc.filter(p => p.id !== pid),
      ta: s.ta.filter(p => p.id !== pid),
      f1: s.f1.filter(p => p.id !== pid),
      player: s.player.filter(p => p.id !== pid),
      other: s.other.filter(p => p.id !== pid),
    }))
  }, [])

  // ── Export / Import ────────────────────────────────────────────────────────
  const exportAll = useCallback(() => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'mlb26-tracker-backup.json'
    a.click()
  }, [state])

  const importBackup = useCallback((json: string): { ok: boolean; error?: string } => {
    try {
      const d = JSON.parse(json) as Partial<TrackerState>
      setState(s => ({
        ...s,
        wbc: d.wbc ?? s.wbc,
        ta: d.ta ?? s.ta,
        f1: d.f1 ?? s.f1,
        player: d.player ?? s.player,
        other: d.other ?? s.other,
        shared: d.shared ?? s.shared,
      }))
      return { ok: true }
    } catch (e: unknown) {
      return { ok: false, error: String(e) }
    }
  }, [])

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = useCallback(() => {
    const all = allPrograms()
    const done = all.filter(p => pct(p, state.shared) === 100).length
    const wbcMs = [...state.wbc].reduce((a, p) => {
      const { done: d, total: t } = missionCounts(p, state.shared)
      return { done: a.done + d, total: a.total + t }
    }, { done: 0, total: 0 })
    const taMs = [...state.ta, ...state.f1, ...state.player, ...state.other].reduce((a, p) => {
      const { done: d, total: t } = missionCounts(p, state.shared)
      return { done: a.done + d, total: a.total + t }
    }, { done: 0, total: 0 })
    const talliesDone = all.reduce((a, p) =>
      a + p.sections.reduce((b, s) => b + s.missions.filter(m => m.type === 'tally' && m.done).length, 0), 0)
    return { done, total: all.length, wbcMs, taMs, talliesDone }
  }, [allPrograms, state])

  return {
    state, hydrated, setCat, toggleCheck, tally, toggleShared,
    autoComplete, deleteProgram, exportAll, importBackup, stats, allPrograms,
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function getAllArray(s: TrackerState): Program[] {
  return [...s.wbc, ...s.ta, ...s.f1, ...s.moonshot, ...s.player, ...s.other]
}

function rebuildArrays(s: TrackerState, all: Program[]): Partial<TrackerState> {
  const byId = new Map(all.map(p => [p.id, p]))
  return {
    wbc: s.wbc.map(p => byId.get(p.id) ?? p),
    ta: s.ta.map(p => byId.get(p.id) ?? p),
    f1: s.f1.map(p => byId.get(p.id) ?? p),
    moonshot: s.moonshot.map(p => byId.get(p.id) ?? p),
    player: s.player.map(p => byId.get(p.id) ?? p),
    other: s.other.map(p => byId.get(p.id) ?? p),
  }
}
