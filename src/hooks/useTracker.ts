'use client'
import { useState, useEffect, useCallback } from 'react'
import type { Program, SharedMission, Mission, Section, ActiveTab, TrackerState } from '@/types'
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

// ── Pure immutable helpers ────────────────────────────────────────────────────

function updateMissionInSection(sec: Section, mid: string, updater: (m: Mission) => Mission): Section {
  const idx = sec.missions.findIndex(m => m.id === mid)
  if (idx === -1) return sec
  const missions = [...sec.missions]
  missions[idx] = updater({ ...missions[idx] })
  return { ...sec, missions }
}

function updateMissionInProgram(prog: Program, mid: string, updater: (m: Mission) => Mission): Program {
  let found = false
  const sections = prog.sections.map(sec => {
    if (found) return sec
    const updated = updateMissionInSection(sec, mid, updater)
    if (updated !== sec) found = true
    return updated
  })
  return found ? { ...prog, sections } : prog
}

function updateProgramInArray(arr: Program[], pid: string, updater: (p: Program) => Program): Program[] {
  return arr.map(p => p.id === pid ? updater({ ...p }) : p)
}

function updateProgInState(s: TrackerState, pid: string, updater: (p: Program) => Program): TrackerState {
  if (s.wbc.some(p => p.id === pid))
    return { ...s, wbc: updateProgramInArray(s.wbc, pid, updater) }
  if (s.ta.some(p => p.id === pid))
    return { ...s, ta: updateProgramInArray(s.ta, pid, updater) }
  if (s.f1.some(p => p.id === pid))
    return { ...s, f1: updateProgramInArray(s.f1, pid, updater) }
  if (s.moonshot.some(p => p.id === pid))
    return { ...s, moonshot: updateProgramInArray(s.moonshot, pid, updater) }
  if (s.player.some(p => p.id === pid))
    return { ...s, player: updateProgramInArray(s.player, pid, updater) }
  if (s.other.some(p => p.id === pid))
    return { ...s, other: updateProgramInArray(s.other, pid, updater) }
  return s
}

function completeAllMissions(p: Program): Program {
  return {
    ...p,
    sections: p.sections.map(sec => ({
      ...sec,
      missions: sec.missions.map(m => {
        if (m.type === 'tally') return { ...m, current: m.target, done: true }
        if (m.type === 'check') return { ...m, done: true }
        return m
      }),
    })),
  }
}

// ── Calc helpers ──────────────────────────────────────────────────────────────
export function pct(p: Program, shared: SharedMission[] = []): number {
  const nonRep = (ms: Mission[]) => ms.filter(m => m.type !== 'rep')
  const withShared = p.tab === 'wbc' && p.id !== 'wbc-moonshot'
  const total = p.sections.reduce((a, s) => a + nonRep(s.missions).length, 0)
    + (withShared ? shared.length : 0)
  const done = p.sections.reduce((a, s) => a + nonRep(s.missions).filter(m => m.done).length, 0)
    + (withShared ? shared.filter(m => m.done).length : 0)
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

// Sort: pinned first → in-progress → completed
export function sortByCompletion(arr: Program[], shared: SharedMission[]): Program[] {
  return [...arr].sort((a, b) => {
    const ap = a.pinned ?? false
    const bp = b.pinned ?? false
    const ad = pct(a, shared) === 100
    const bd = pct(b, shared) === 100

    // Pinned always float to top (even if completed)
    if (ap && !bp) return -1
    if (!ap && bp) return 1
    // Within same pin group: completed go to bottom
    if (ad && !bd) return 1
    if (!ad && bd) return -1
    return 0
  })
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useTracker() {
  const [state, setState] = useState<TrackerState>(initState)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setState(loadState())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try { localStorage.setItem(SK, JSON.stringify(state)) } catch {}
  }, [state, hydrated])

  const allPrograms = useCallback(() =>
    [...state.wbc, ...state.ta, ...state.f1, ...state.moonshot, ...state.player, ...state.other],
    [state]
  )

  const setCat = useCallback((cat: ActiveTab) => {
    setState(s => ({ ...s, cat }))
  }, [])

  const toggleCheck = useCallback((pid: string, mid: string) => {
    setState(s =>
      updateProgInState(s, pid, p =>
        updateMissionInProgram(p, mid, m => ({ ...m, done: !m.done }))
      )
    )
  }, [])

  const tally = useCallback((pid: string, mid: string, delta: number) => {
    setState(s =>
      updateProgInState(s, pid, p =>
        updateMissionInProgram(p, mid, m => {
          const next = Math.max(0, Math.min((m.current ?? 0) + delta, m.target))
          return { ...m, current: next, done: next >= m.target }
        })
      )
    )
  }, [])

  const completeTally = useCallback((pid: string, mid: string) => {
    setState(s =>
      updateProgInState(s, pid, p =>
        updateMissionInProgram(p, mid, m => {
          const nowDone = !m.done
          return { ...m, current: nowDone ? m.target : 0, done: nowDone }
        })
      )
    )
  }, [])

  const toggleShared = useCallback((mid: string) => {
    setState(s => ({
      ...s,
      shared: s.shared.map(m => m.id === mid ? { ...m, done: !m.done } : m),
    }))
  }, [])

  const autoComplete = useCallback((pid: string) => {
    setState(s => {
      let next = updateProgInState(s, pid, completeAllMissions)
      const isWbcPool = s.wbc.some(p => p.id === pid && p.id !== 'wbc-moonshot')
      if (isWbcPool) {
        next = { ...next, shared: next.shared.map(m => ({ ...m, done: true })) }
      }
      return next
    })
  }, [])

  // Toggle pinned state
  const togglePin = useCallback((pid: string) => {
    setState(s =>
      updateProgInState(s, pid, p => ({ ...p, pinned: !p.pinned }))
    )
  }, [])

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

  const stats = useCallback(() => {
    const all = allPrograms()
    const done = all.filter(p => pct(p, state.shared) === 100).length
    const wbcMs = state.wbc.reduce((a, p) => {
      const { done: d, total: t } = missionCounts(p, state.shared)
      return { done: a.done + d, total: a.total + t }
    }, { done: 0, total: 0 })
    const taMs = [...state.ta, ...state.f1, ...state.player, ...state.other].reduce((a, p) => {
      const { done: d, total: t } = missionCounts(p, state.shared)
      return { done: a.done + d, total: a.total + t }
    }, { done: 0, total: 0 })
    const talliesDone = all.reduce((a, p) =>
      a + p.sections.reduce((b, s) =>
        b + s.missions.filter(m => m.type === 'tally' && m.done).length, 0), 0)
    return { done, total: all.length, wbcMs, taMs, talliesDone }
  }, [allPrograms, state])

  return {
    state, hydrated, setCat,
    toggleCheck, tally, completeTally,
    toggleShared, autoComplete, togglePin,
    deleteProgram, exportAll, importBackup,
    stats, allPrograms,
  }
}
