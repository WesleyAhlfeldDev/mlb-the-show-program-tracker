'use client'
import { useState, useEffect } from 'react'
import type { Program, Mission, MissionType, CustomTab } from '@/types'
import { WBC_DEF, TA_DEF, F1_DEF, PLAYER_DEF, OTHER_DEF } from '@/data'

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? ''
const SK = 'mlb26_v12'
const CUSTOM_TABS_KEY = 'mlb26_custom_tabs_v1'
const TAB_ORDER_KEY = 'mlb26_tab_order_v1'
const CUSTOM_KEY = 'mlb26_custom_v1'

const BUILT_IN_TAB_DEFS: { id: string; label: string }[] = [
  { id: 'all',    label: 'All' },
  { id: 'pinned', label: '📌 Pinned' },
  { id: 'wbc',    label: 'WBC' },
  { id: 'ta',     label: 'Team Affinity' },
  { id: 'player', label: 'Player' },
  { id: 'other',  label: 'Other' },
]

// ── Types ─────────────────────────────────────────────────────────────────────

interface MissionDraft {
  id: string
  text: string
  xp: number
  type: MissionType
  target: number
  done: boolean
  current: number
}

interface SectionDraft {
  _key: string
  label: string
  missions: MissionDraft[]
}

interface ProgramDraft {
  name: string
  category: string
  color: string
  boss: string
  tab: string
  sections: SectionDraft[]
}

interface AdminState {
  wbc: Program[]
  ta: Program[]
  f1: Program[]
  player: Program[]
  other: Program[]
  custom: Program[]
  [key: string]: unknown
}

function deepClone<T>(v: T): T { return JSON.parse(JSON.stringify(v)) }

// ── Helpers ───────────────────────────────────────────────────────────────────

function blankMission(): MissionDraft {
  return {
    id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    text: '', xp: 5, type: 'check', target: 1, done: false, current: 0,
  }
}

function blankSection(): SectionDraft {
  return {
    _key: `s-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    label: '', missions: [blankMission()],
  }
}

function blankProgramDraft(): ProgramDraft {
  return {
    name: '', category: '', color: '#f0b429', boss: '', tab: 'player',
    sections: [blankSection()],
  }
}

function programToDraft(p: Program): ProgramDraft {
  return {
    name: p.name,
    category: p.category,
    color: p.color,
    boss: p.boss,
    tab: p.tab,
    sections: p.sections.map(sec => ({
      _key: `s-${Math.random().toString(36).slice(2)}`,
      label: sec.label,
      missions: sec.missions.map(m => ({
        id: m.id,
        text: m.text,
        xp: m.xp,
        type: m.type as MissionType,
        target: m.target,
        done: m.done,
        current: m.current,
      })),
    })),
  }
}

function draftToProgram(draft: ProgramDraft, id: string, existing?: Program): Program {
  return {
    id,
    name: draft.name.trim(),
    category: draft.category.trim(),
    color: draft.color,
    boss: draft.boss.trim(),
    tab: draft.tab,
    pinned: existing?.pinned ?? false,
    teamId: existing?.teamId,
    sections: draft.sections.map(sec => ({
      label: sec.label,
      missions: sec.missions.map(m => ({
        id: m.id,
        text: m.text.trim(),
        xp: Number(m.xp),
        type: m.type,
        target: Number(m.target),
        current: m.current,
        done: m.done,
      })),
    })),
  }
}

function getArrayKey(tab: string): keyof AdminState {
  if (['wbc', 'ta', 'f1', 'player', 'other'].includes(tab)) return tab as keyof AdminState
  return 'custom'
}

function loadAdminState(): AdminState {
  if (typeof window === 'undefined') {
    return { wbc: [], ta: [], f1: [], player: [], other: [], custom: [] }
  }
  try {
    const raw = localStorage.getItem(SK)
    const d = raw ? (JSON.parse(raw) as Partial<AdminState>) : {}
    return {
      wbc: (d.wbc as Program[]) ?? deepClone(WBC_DEF),
      ta: (d.ta as Program[]) ?? deepClone(TA_DEF),
      f1: (d.f1 as Program[]) ?? deepClone(F1_DEF),
      player: (d.player as Program[]) ?? deepClone(PLAYER_DEF),
      other: (d.other as Program[]) ?? deepClone(OTHER_DEF),
      custom: (d.custom as Program[]) ?? [],
      ...(d as object),
    }
  } catch {
    return {
      wbc: deepClone(WBC_DEF),
      ta: deepClone(TA_DEF),
      f1: deepClone(F1_DEF),
      player: deepClone(PLAYER_DEF),
      other: deepClone(OTHER_DEF),
      custom: [],
    }
  }
}

function saveAdminState(s: AdminState) {
  try {
    const existing = localStorage.getItem(SK)
    const base = existing ? JSON.parse(existing) : {}
    localStorage.setItem(SK, JSON.stringify({ ...base, ...s }))
  } catch { /* ignore */ }
}

function loadCustomTabs(): CustomTab[] {
  try {
    const raw = localStorage.getItem(CUSTOM_TABS_KEY)
    return raw ? (JSON.parse(raw) as CustomTab[]) : []
  } catch { return [] }
}

function saveCustomTabs(tabs: CustomTab[]) {
  try { localStorage.setItem(CUSTOM_TABS_KEY, JSON.stringify(tabs)) } catch { /* ignore */ }
}

function getAllPrograms(s: AdminState): Program[] {
  return [...s.wbc, ...s.ta, ...s.f1, ...s.player, ...s.other, ...s.custom]
}

function findProgram(s: AdminState, pid: string): Program | undefined {
  return getAllPrograms(s).find(p => p.id === pid)
}

function upsertProgram(s: AdminState, prog: Program, oldId?: string): AdminState {
  const next = { ...s }
  // Remove old if changing tab or updating
  const removeId = oldId ?? prog.id
  for (const key of ['wbc', 'ta', 'f1', 'player', 'other', 'custom'] as const) {
    next[key] = (s[key] as Program[]).filter(p => p.id !== removeId)
  }
  // Add to appropriate bucket
  const bucket = getArrayKey(prog.tab)
  next[bucket] = [...(next[bucket] as Program[]), prog]
  return next
}

function deleteFromState(s: AdminState, pid: string): AdminState {
  const next = { ...s }
  for (const key of ['wbc', 'ta', 'f1', 'player', 'other', 'custom'] as const) {
    next[key] = (s[key] as Program[]).filter(p => p.id !== pid)
  }
  return next
}

// ── Styles ────────────────────────────────────────────────────────────────────

const card: React.CSSProperties = {
  background: 'linear-gradient(135deg, #0d1424 0%, #141d30 100%)',
  border: '1px solid rgba(240,180,41,0.15)',
  borderRadius: '12px',
  padding: '20px',
}

const inp: React.CSSProperties = {
  background: '#080c14',
  border: '1px solid rgba(240,180,41,0.2)',
  borderRadius: '6px',
  color: '#e8edf8',
  padding: '8px 12px',
  fontSize: '13px',
  width: '100%',
  outline: 'none',
}

const lbl: React.CSSProperties = {
  color: 'rgba(240,180,41,0.7)',
  fontSize: '11px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  display: 'block',
  marginBottom: '4px',
}

const goldBtn: React.CSSProperties = {
  background: 'linear-gradient(135deg, #ffd166, #f0b429)',
  color: '#080c14',
  fontWeight: 700,
  fontSize: '12px',
  padding: '8px 16px',
  borderRadius: '6px',
  border: 'none',
  cursor: 'pointer',
}

const dimBtn: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  color: 'rgba(255,255,255,0.5)',
  fontWeight: 600,
  fontSize: '12px',
  padding: '8px 14px',
  borderRadius: '6px',
  border: '1px solid rgba(255,255,255,0.1)',
  cursor: 'pointer',
}

const dangerBtn: React.CSSProperties = {
  background: 'rgba(239,68,68,0.08)',
  color: '#fca5a5',
  fontWeight: 600,
  fontSize: '11px',
  padding: '5px 10px',
  borderRadius: '6px',
  border: '1px solid rgba(239,68,68,0.2)',
  cursor: 'pointer',
}

const blueBtn: React.CSSProperties = {
  background: 'rgba(96,165,250,0.08)',
  color: '#93c5fd',
  fontWeight: 600,
  fontSize: '11px',
  padding: '5px 10px',
  borderRadius: '6px',
  border: '1px solid rgba(96,165,250,0.2)',
  cursor: 'pointer',
}

// ── Component ─────────────────────────────────────────────────────────────────

type ViewType = 'programs' | 'form' | 'json' | 'tabs'

export default function AdminPage() {
  const [mounted, setMounted] = useState(false)
  const [authed, setAuthed] = useState(false)
  const [pw, setPw] = useState('')
  const [pwError, setPwError] = useState(false)

  const [view, setView] = useState<ViewType>('programs')
  const [trackerState, setTrackerState] = useState<AdminState | null>(null)
  const [customTabs, setCustomTabs] = useState<CustomTab[]>([])
  const [filterTab, setFilterTab] = useState<string>('all')
  const [searchQ, setSearchQ] = useState('')

  // Form state (add or edit)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<ProgramDraft>(blankProgramDraft)

  // JSON import
  const [jsonInput, setJsonInput] = useState('')
  const [jsonError, setJsonError] = useState('')

  // Custom tab form
  const [newTabLabel, setNewTabLabel] = useState('')
  const [renamingTabId, setRenamingTabId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [tabOrder, setTabOrder] = useState<string[]>([])

  const [toastMsg, setToastMsg] = useState('')

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!authed) return
    setTrackerState(loadAdminState())
    setCustomTabs(loadCustomTabs())
    try {
      const raw = localStorage.getItem(TAB_ORDER_KEY)
      if (raw) setTabOrder(JSON.parse(raw) as string[])
    } catch { /* ignore */ }
  }, [authed])

  function showToast(msg: string) {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 3500)
  }

  function login() {
    if (pw === ADMIN_PASSWORD) { setAuthed(true); setPwError(false) }
    else setPwError(true)
  }

  // ── Program helpers ──────────────────────────────────────────────────────────

  function startAdd() {
    setEditingId(null)
    setDraft(blankProgramDraft())
    setView('form')
  }

  function startEdit(pid: string) {
    if (!trackerState) return
    const prog = findProgram(trackerState, pid)
    if (!prog) return
    setEditingId(pid)
    setDraft(programToDraft(prog))
    setView('form')
  }

  function handleDelete(pid: string) {
    if (!trackerState) return
    const prog = findProgram(trackerState, pid)
    if (!prog) return
    if (!confirm(`Delete "${prog.name}"? This cannot be undone.`)) return
    const next = deleteFromState(trackerState, pid)
    setTrackerState(next)
    saveAdminState(next)
    // Also remove from custom_v1 if present
    try {
      const raw = localStorage.getItem(CUSTOM_KEY)
      if (raw) {
        const arr = JSON.parse(raw) as Program[]
        localStorage.setItem(CUSTOM_KEY, JSON.stringify(arr.filter(p => p.id !== pid)))
      }
    } catch { /* ignore */ }
    showToast('Program deleted.')
  }

  function handleSave() {
    if (!trackerState) return
    if (!draft.name.trim()) { showToast('Program name is required.'); return }

    const id = editingId ?? `custom-${Date.now()}`
    const existing = editingId ? findProgram(trackerState, editingId) : undefined
    const prog = draftToProgram(draft, id, existing)

    const next = upsertProgram(trackerState, prog, editingId ?? undefined)
    setTrackerState(next)
    saveAdminState(next)

    // Keep custom_v1 in sync for non-built-in programs
    if (!isBuiltIn(id)) {
      try {
        const raw = localStorage.getItem(CUSTOM_KEY)
        const arr: Program[] = raw ? (JSON.parse(raw) as Program[]) : []
        const filtered = arr.filter(p => p.id !== id)
        localStorage.setItem(CUSTOM_KEY, JSON.stringify([...filtered, prog]))
      } catch { /* ignore */ }
    }

    showToast(editingId ? 'Program updated! Reload the tracker to see changes.' : 'Program saved! Reload the tracker to see it.')
    setView('programs')
    setEditingId(null)
  }

  function isBuiltIn(id: string) {
    const builtInIds = [
      ...WBC_DEF.map(p => p.id),
      ...TA_DEF.map(p => p.id),
      ...F1_DEF.map(p => p.id),
      ...PLAYER_DEF.map(p => p.id),
      ...OTHER_DEF.map(p => p.id),
    ]
    return builtInIds.includes(id)
  }

  // ── JSON import ──────────────────────────────────────────────────────────────

  function importFromJson() {
    if (!trackerState) return
    setJsonError('')
    let parsed: unknown
    try { parsed = JSON.parse(jsonInput.trim()) }
    catch { setJsonError('Invalid JSON — check for missing commas, brackets, or quotes.'); return }

    const programs = Array.isArray(parsed) ? parsed : [parsed]
    let count = 0
    let next = { ...trackerState }

    for (const raw of programs) {
      const p = raw as Record<string, unknown>
      if (!p.name || typeof p.name !== 'string') { setJsonError('Each program needs a "name" field.'); return }
      if (!Array.isArray(p.sections)) { setJsonError(`"${String(p.name)}" needs a "sections" array.`); return }

      const pid = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
      const prog: Program = {
        id: pid,
        name: (p.name as string).trim(),
        category: typeof p.category === 'string' ? p.category.trim() : '',
        color: typeof p.color === 'string' ? p.color : '#f0b429',
        boss: typeof p.boss === 'string' ? p.boss.trim() : '',
        tab: typeof p.tab === 'string' ? p.tab : 'other',
        pinned: false,
        sections: (p.sections as Record<string, unknown>[]).map((sec, si) => ({
          label: typeof sec.label === 'string' ? sec.label : '',
          missions: (Array.isArray(sec.missions) ? sec.missions as Record<string, unknown>[] : []).map((m, mi) => ({
            id: `m-${pid}-${si}-${mi}`,
            text: typeof m.text === 'string' ? m.text.trim() : '',
            xp: typeof m.xp === 'number' ? m.xp : 5,
            type: (['check', 'tally', 'rep'].includes(m.type as string) ? m.type : 'check') as MissionType,
            target: typeof m.target === 'number' ? m.target : 1,
            current: 0,
            done: false,
          })),
        })),
      }
      next = upsertProgram(next, prog)
      count++
    }

    setTrackerState(next)
    saveAdminState(next)
    setJsonInput('')
    showToast(`Imported ${count} program${count !== 1 ? 's' : ''}! Reload the tracker.`)
    setView('programs')
  }

  // ── Custom tabs ──────────────────────────────────────────────────────────────

  // Build the ordered list of all tabs for display/reorder
  function getOrderedTabs(): { id: string; label: string; isBuiltIn: boolean }[] {
    const all = [
      ...BUILT_IN_TAB_DEFS.map(t => ({ ...t, isBuiltIn: true })),
      ...customTabs.map(t => ({ ...t, isBuiltIn: false })),
    ]
    if (tabOrder.length === 0) return all
    const ordered = [
      ...tabOrder.map(id => all.find(t => t.id === id)).filter(Boolean) as { id: string; label: string; isBuiltIn: boolean }[],
      ...all.filter(t => !tabOrder.includes(t.id)),
    ]
    return ordered
  }

  function moveTab(idx: number, dir: -1 | 1) {
    const ordered = getOrderedTabs()
    const swapIdx = idx + dir
    if (swapIdx < 0 || swapIdx >= ordered.length) return
    const next = [...ordered]
    ;[next[idx], next[swapIdx]] = [next[swapIdx], next[idx]]
    const newOrder = next.map(t => t.id)
    setTabOrder(newOrder)
    try { localStorage.setItem(TAB_ORDER_KEY, JSON.stringify(newOrder)) } catch { /* ignore */ }
  }

  function handleAddTab() {
    if (!newTabLabel.trim()) return
    const id = `ct-${Date.now()}`
    const next = [...customTabs, { id, label: newTabLabel.trim() }]
    setCustomTabs(next)
    saveCustomTabs(next)
    setNewTabLabel('')
    showToast('Tab created! Reload the tracker to see it.')
  }

  function handleDeleteTab(id: string) {
    const tab = customTabs.find(t => t.id === id)
    if (!tab) return
    if (!confirm(`Delete tab "${tab.label}"? Programs assigned to it will move to the "Other" bucket in admin, but remain in their original array.`)) return
    const next = customTabs.filter(t => t.id !== id)
    setCustomTabs(next)
    saveCustomTabs(next)
    showToast('Tab deleted.')
  }

  function handleRenameTab(id: string) {
    if (!renameValue.trim()) return
    const next = customTabs.map(t => t.id === id ? { ...t, label: renameValue.trim() } : t)
    setCustomTabs(next)
    saveCustomTabs(next)
    setRenamingTabId(null)
    setRenameValue('')
    showToast('Tab renamed. Reload the tracker to see changes.')
  }

  // ── Draft helpers ────────────────────────────────────────────────────────────

  function setField(field: keyof ProgramDraft, val: string) {
    setDraft(d => ({ ...d, [field]: val }))
  }

  function setSectionLabel(si: number, val: string) {
    setDraft(d => {
      const sections = [...d.sections]
      sections[si] = { ...sections[si], label: val }
      return { ...d, sections }
    })
  }

  function addSection() {
    setDraft(d => ({ ...d, sections: [...d.sections, blankSection()] }))
  }

  function removeSection(si: number) {
    setDraft(d => ({ ...d, sections: d.sections.filter((_, i) => i !== si) }))
  }

  function setMissionField(si: number, mi: number, field: keyof MissionDraft, val: string | number | boolean) {
    setDraft(d => {
      const sections = [...d.sections]
      const missions = [...sections[si].missions]
      missions[mi] = { ...missions[mi], [field]: val }
      sections[si] = { ...sections[si], missions }
      return { ...d, sections }
    })
  }

  function addMission(si: number) {
    setDraft(d => {
      const sections = [...d.sections]
      sections[si] = { ...sections[si], missions: [...sections[si].missions, blankMission()] }
      return { ...d, sections }
    })
  }

  function removeMission(si: number, mi: number) {
    setDraft(d => {
      const sections = [...d.sections]
      sections[si] = { ...sections[si], missions: sections[si].missions.filter((_, i) => i !== mi) }
      return { ...d, sections }
    })
  }

  function markAllMissions(si: number, done: boolean) {
    setDraft(d => {
      const sections = [...d.sections]
      sections[si] = {
        ...sections[si],
        missions: sections[si].missions.map(m => ({
          ...m,
          done: m.type !== 'rep' ? done : m.done,
          current: m.type === 'tally' && done ? m.target : m.type === 'tally' && !done ? 0 : m.current,
        })),
      }
      return { ...d, sections }
    })
  }

  // ── Tab dropdown options ─────────────────────────────────────────────────────

  const tabOptions = [
    { value: 'wbc', label: 'WBC' },
    { value: 'ta', label: 'Team Affinity' },
    { value: 'f1', label: '#1 Fan (TA linked)' },
    { value: 'player', label: 'Player Program' },
    { value: 'other', label: 'Other' },
    ...customTabs.map(t => ({ value: t.id, label: t.label })),
  ]

  const filterOptions = [
    { value: 'all', label: 'All' },
    { value: 'wbc', label: 'WBC' },
    { value: 'ta', label: 'Team Affinity' },
    { value: 'f1', label: '#1 Fan' },
    { value: 'player', label: 'Player' },
    { value: 'other', label: 'Other' },
    ...customTabs.map(t => ({ value: t.id, label: t.label })),
  ]

  // ── Filtered program list ────────────────────────────────────────────────────

  function getFilteredPrograms(): Program[] {
    if (!trackerState) return []
    let all = getAllPrograms(trackerState)
    if (filterTab !== 'all') all = all.filter(p => p.tab === filterTab)
    if (searchQ.trim()) {
      const q = searchQ.toLowerCase()
      all = all.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.boss.toLowerCase().includes(q)
      )
    }
    return all
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  if (!mounted) return null

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#080c14' }}>
        <div style={{ ...card, width: '320px' }}>
          <div
            className="font-display font-bold text-[20px] uppercase tracking-[0.06em] mb-6 text-center"
            style={{ background: 'linear-gradient(135deg, #ffd166, #f0b429)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
          >
            Admin Access
          </div>
          <label style={lbl}>Password</label>
          <input
            type="password"
            value={pw}
            onChange={e => setPw(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && login()}
            style={{ ...inp, marginBottom: '12px' }}
            placeholder="Enter password"
            autoFocus
          />
          {pwError && <div className="text-[12px] mb-3" style={{ color: '#fca5a5' }}>Incorrect password.</div>}
          <button onClick={login} style={{ ...goldBtn, width: '100%', padding: '10px' }}>Sign In</button>
        </div>
      </div>
    )
  }

  const filtered = getFilteredPrograms()

  return (
    <div className="min-h-screen pb-20" style={{ background: '#080c14' }}>
      {/* Header */}
      <div
        className="sticky top-0 z-50 px-4 md:px-6 flex items-center justify-between h-[58px] flex-wrap gap-2"
        style={{ background: 'linear-gradient(135deg, #080c14, #0d1424)', borderBottom: '1px solid rgba(240,180,41,0.15)' }}
      >
        <div
          className="font-display font-bold text-[17px] uppercase tracking-[0.04em]"
          style={{ background: 'linear-gradient(135deg, #ffd166, #f0b429)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
        >
          Program Admin
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['programs', 'form', 'json', 'tabs'] as ViewType[]).map(v => {
            const labels: Record<ViewType, string> = { programs: 'All Programs', form: editingId ? 'Edit Program' : '+ Add Program', json: 'JSON Import', tabs: 'Manage Tabs' }
            return (
              <button
                key={v}
                onClick={() => {
                  if (v === 'form') startAdd()
                  else { setView(v); setEditingId(null) }
                }}
                style={view === v ? goldBtn : dimBtn}
              >
                {labels[v]}
              </button>
            )
          })}
          <button onClick={() => window.open('/', '_blank')} style={dimBtn}>Back to App</button>
        </div>
      </div>

      <div className="max-w-[920px] mx-auto px-4 md:px-6 pt-8">

        {/* ── ALL PROGRAMS VIEW ── */}
        {view === 'programs' && (
          <div>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div className="font-display font-bold text-[16px] uppercase tracking-[0.05em]" style={{ color: 'rgba(240,180,41,0.8)' }}>
                All Programs ({trackerState ? getAllPrograms(trackerState).length : 0})
              </div>
              <button onClick={startAdd} style={{ ...goldBtn, fontSize: '13px', padding: '8px 18px' }}>+ Add Program</button>
            </div>

            {/* Filter chips */}
            <div className="flex gap-2 flex-wrap mb-4">
              {filterOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setFilterTab(opt.value)}
                  className="text-[11px] font-bold uppercase tracking-[0.06em] px-3 py-1.5 rounded-full transition-all"
                  style={filterTab === opt.value
                    ? { background: 'linear-gradient(135deg, #ffd166, #f0b429)', color: '#080c14' }
                    : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }
                  }
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <input
              style={{ ...inp, marginBottom: '16px' }}
              placeholder="Search programs by name, category, or reward..."
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
            />

            {filtered.length === 0 ? (
              <div className="text-center py-16" style={{ color: 'rgba(255,255,255,0.2)' }}>No programs found.</div>
            ) : (
              <div className="flex flex-col gap-2">
                {filtered.map(prog => {
                  const totalMissions = prog.sections.reduce((a, s) => a + s.missions.length, 0)
                  const doneMissions = prog.sections.reduce((a, s) => a + s.missions.filter(m => m.done).length, 0)
                  const tabLabel = tabOptions.find(t => t.value === prog.tab)?.label ?? prog.tab
                  return (
                    <div key={prog.id} style={card} className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ background: prog.color || '#f0b429', boxShadow: `0 0 6px ${prog.color || '#f0b429'}60` }}
                        />
                        <div className="min-w-0">
                          <div className="font-display font-bold text-[14px] uppercase text-white truncate">{prog.name}</div>
                          <div className="text-[11px] mt-0.5 flex flex-wrap gap-x-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
                            <span>{tabLabel}</span>
                            <span>·</span>
                            <span>{prog.sections.length} section{prog.sections.length !== 1 ? 's' : ''}</span>
                            <span>·</span>
                            <span>{doneMissions}/{totalMissions} done</span>
                            {prog.boss && <><span>·</span><span style={{ color: 'rgba(240,180,41,0.5)' }}>{prog.boss}</span></>}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => startEdit(prog.id)} style={blueBtn}>Edit</button>
                        <button onClick={() => handleDelete(prog.id)} style={dangerBtn}>Delete</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── ADD / EDIT FORM VIEW ── */}
        {view === 'form' && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="font-display font-bold text-[16px] uppercase tracking-[0.05em]" style={{ color: 'rgba(240,180,41,0.8)' }}>
                {editingId ? 'Edit Program' : 'Add New Program'}
              </div>
              {editingId && (
                <span className="text-[11px] px-2 py-1 rounded-full" style={{ background: 'rgba(96,165,250,0.1)', color: '#93c5fd', border: '1px solid rgba(96,165,250,0.2)' }}>
                  Editing: {draft.name || editingId}
                </span>
              )}
            </div>

            {/* Program Info */}
            <div style={card}>
              <div className="font-display font-bold text-[13px] uppercase tracking-[0.07em] mb-4" style={{ color: '#f0b429' }}>Program Info</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label style={lbl}>Program Name *</label>
                  <input style={inp} value={draft.name} onChange={e => setField('name', e.target.value)} placeholder="e.g. New York Yankees" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label style={lbl}>Category / Description</label>
                  <input style={inp} value={draft.category} onChange={e => setField('category', e.target.value)} placeholder="e.g. Earn Yankees rewards! · 100K XP" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label style={lbl}>Reward Card / Boss</label>
                  <input style={inp} value={draft.boss} onChange={e => setField('boss', e.target.value)} placeholder="e.g. Derek Jeter (Legendary)" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label style={lbl}>Tab</label>
                  <select style={{ ...inp, cursor: 'pointer' }} value={draft.tab} onChange={e => setField('tab', e.target.value)}>
                    {tabOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label style={lbl}>Color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={draft.color} onChange={e => setField('color', e.target.value)} style={{ width: '40px', height: '36px', padding: '2px', background: 'transparent', border: 'none', cursor: 'pointer' }} />
                    <input style={{ ...inp, flex: 1 }} value={draft.color} onChange={e => setField('color', e.target.value)} placeholder="#f0b429" />
                  </div>
                </div>
              </div>
            </div>

            {/* Sections */}
            {draft.sections.map((sec, si) => (
              <div key={sec._key} style={{ ...card, borderColor: 'rgba(240,180,41,0.2)' }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="font-display font-bold text-[13px] uppercase tracking-[0.07em]" style={{ color: '#f0b429' }}>
                    Section {si + 1}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => markAllMissions(si, true)} style={{ ...dimBtn, fontSize: '10px', padding: '4px 8px' }}>✓ All Done</button>
                    <button onClick={() => markAllMissions(si, false)} style={{ ...dimBtn, fontSize: '10px', padding: '4px 8px' }}>✗ All Undone</button>
                    {draft.sections.length > 1 && <button onClick={() => removeSection(si)} style={dangerBtn}>Remove Section</button>}
                  </div>
                </div>
                <div className="mb-4">
                  <label style={lbl}>Section Label</label>
                  <input style={inp} value={sec.label} onChange={e => setSectionLabel(si, e.target.value)} placeholder="e.g. Moments — 5 tasks · 30 XP" />
                </div>
                <div className="flex flex-col gap-3">
                  {sec.missions.map((m, mi) => (
                    <div key={m.id} className="rounded-[8px] p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-[0.06em]" style={{ color: 'rgba(240,180,41,0.5)' }}>Mission {mi + 1}</span>
                        {sec.missions.length > 1 && (
                          <button onClick={() => removeMission(si, mi)} style={{ ...dangerBtn, padding: '2px 8px', fontSize: '10px' }}>✕</button>
                        )}
                      </div>
                      <div className="grid grid-cols-12 gap-2">
                        <div className="col-span-12 md:col-span-5">
                          <label style={lbl}>Mission Text</label>
                          <input style={inp} value={m.text} onChange={e => setMissionField(si, mi, 'text', e.target.value)} placeholder="e.g. Hit 10 home runs" />
                        </div>
                        <div className="col-span-4 md:col-span-2">
                          <label style={lbl}>Type</label>
                          <select style={{ ...inp, cursor: 'pointer' }} value={m.type} onChange={e => setMissionField(si, mi, 'type', e.target.value as MissionType)}>
                            <option value="check">Check</option>
                            <option value="tally">Tally</option>
                            <option value="rep">Repeatable</option>
                          </select>
                        </div>
                        <div className="col-span-4 md:col-span-2">
                          <label style={lbl}>XP</label>
                          <input type="number" style={inp} value={m.xp} onChange={e => setMissionField(si, mi, 'xp', parseInt(e.target.value) || 0)} min={0} />
                        </div>
                        {m.type === 'tally' && (
                          <div className="col-span-4 md:col-span-2">
                            <label style={lbl}>Target</label>
                            <input type="number" style={inp} value={m.target} onChange={e => setMissionField(si, mi, 'target', parseInt(e.target.value) || 1)} min={1} />
                          </div>
                        )}
                        {/* Progress controls */}
                        {m.type !== 'rep' && (
                          <div className="col-span-12 md:col-span-1 flex items-end">
                            <label className="flex items-center gap-1.5 cursor-pointer" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>
                              <input
                                type="checkbox"
                                checked={m.done}
                                onChange={e => {
                                  setMissionField(si, mi, 'done', e.target.checked)
                                  if (m.type === 'tally') setMissionField(si, mi, 'current', e.target.checked ? m.target : 0)
                                }}
                                style={{ width: '14px', height: '14px', cursor: 'pointer' }}
                              />
                              Done
                            </label>
                          </div>
                        )}
                        {m.type === 'tally' && (
                          <div className="col-span-6 md:col-span-2">
                            <label style={lbl}>Current</label>
                            <input
                              type="number"
                              style={inp}
                              value={m.current}
                              onChange={e => {
                                const val = Math.max(0, parseInt(e.target.value) || 0)
                                setMissionField(si, mi, 'current', val)
                                setMissionField(si, mi, 'done', val >= m.target)
                              }}
                              min={0}
                              max={m.target}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={() => addMission(si)} style={{ ...dimBtn, marginTop: '12px', fontSize: '11px' }}>+ Add Mission</button>
              </div>
            ))}

            <button onClick={addSection} style={dimBtn}>+ Add Section</button>

            <div className="flex items-center gap-3">
              <button onClick={handleSave} style={{ ...goldBtn, padding: '12px 28px', fontSize: '14px' }}>
                {editingId ? 'Save Changes' : 'Save Program'}
              </button>
              <button onClick={() => { setView('programs'); setEditingId(null) }} style={dimBtn}>Cancel</button>
              {!editingId && <button onClick={() => setDraft(blankProgramDraft())} style={dimBtn}>Reset Form</button>}
            </div>
          </div>
        )}

        {/* ── JSON IMPORT VIEW ── */}
        {view === 'json' && (
          <div className="flex flex-col gap-6">
            <div className="font-display font-bold text-[16px] uppercase tracking-[0.05em]" style={{ color: 'rgba(240,180,41,0.8)' }}>
              JSON Import
            </div>
            <div style={{ ...card, borderColor: 'rgba(240,180,41,0.25)' }}>
              <div className="font-display font-bold text-[12px] uppercase tracking-[0.07em] mb-3" style={{ color: '#f0b429' }}>
                Schema — paste one program or an array of programs
              </div>
              <pre className="text-[11px] leading-relaxed overflow-x-auto rounded-[6px] p-3" style={{ background: '#080c14', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.06)' }}>{JSON_SCHEMA}</pre>
              <div className="text-[11px] mt-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
                type: <code>check</code> = one-time, <code>tally</code> = stat tracking (needs target), <code>rep</code> = repeatable
              </div>
            </div>
            <div style={card}>
              <label style={lbl}>Paste JSON here</label>
              <textarea
                value={jsonInput}
                onChange={e => { setJsonInput(e.target.value); setJsonError('') }}
                rows={16}
                style={{ ...inp, fontFamily: 'monospace', fontSize: '12px', lineHeight: '1.6', resize: 'vertical' }}
                placeholder="Paste your program JSON here..."
              />
              {jsonError && (
                <div className="text-[12px] mt-2 px-3 py-2 rounded-[6px]" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>
                  {jsonError}
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button onClick={importFromJson} disabled={!jsonInput.trim()} style={{ ...goldBtn, padding: '12px 28px', fontSize: '14px', opacity: jsonInput.trim() ? 1 : 0.4 }}>
                Import Programs
              </button>
              <button onClick={() => { setJsonInput(''); setJsonError('') }} style={dimBtn}>Clear</button>
            </div>
          </div>
        )}

        {/* ── MANAGE TABS VIEW ── */}
        {view === 'tabs' && (() => {
          const orderedTabs = getOrderedTabs()
          return (
            <div className="flex flex-col gap-6">
              <div className="font-display font-bold text-[16px] uppercase tracking-[0.05em]" style={{ color: 'rgba(240,180,41,0.8)' }}>
                Manage Tabs
              </div>

              {/* Tab order */}
              <div style={card}>
                <div className="font-display font-bold text-[13px] uppercase tracking-[0.07em] mb-1" style={{ color: '#f0b429' }}>
                  Tab Order
                </div>
                <div className="text-[11px] mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Use ↑ ↓ to reorder. Changes apply immediately — reload the tracker to see the new order.
                </div>
                <div className="flex flex-col gap-2">
                  {orderedTabs.map((tab, idx) => (
                    <div
                      key={tab.id}
                      className="flex items-center gap-3 rounded-[8px] px-3 py-2.5"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      <span
                        className="text-[11px] font-bold w-5 text-center flex-shrink-0"
                        style={{ color: 'rgba(255,255,255,0.2)' }}
                      >
                        {idx + 1}
                      </span>
                      <span className="flex-1 font-bold text-[13px] uppercase tracking-[0.05em] text-white">{tab.label}</span>
                      {!tab.isBuiltIn && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(240,180,41,0.1)', color: 'rgba(240,180,41,0.6)', border: '1px solid rgba(240,180,41,0.15)' }}>
                          custom
                        </span>
                      )}
                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          onClick={() => moveTab(idx, -1)}
                          disabled={idx === 0}
                          style={{ ...dimBtn, padding: '4px 10px', fontSize: '13px', opacity: idx === 0 ? 0.25 : 1 }}
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => moveTab(idx, 1)}
                          disabled={idx === orderedTabs.length - 1}
                          style={{ ...dimBtn, padding: '4px 10px', fontSize: '13px', opacity: idx === orderedTabs.length - 1 ? 0.25 : 1 }}
                        >
                          ↓
                        </button>
                        {!tab.isBuiltIn && (
                          renamingTabId === tab.id ? (
                            <>
                              <input
                                style={{ ...inp, width: '140px' }}
                                value={renameValue}
                                onChange={e => setRenameValue(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') handleRenameTab(tab.id); if (e.key === 'Escape') setRenamingTabId(null) }}
                                autoFocus
                              />
                              <button onClick={() => handleRenameTab(tab.id)} style={{ ...goldBtn, padding: '4px 10px', fontSize: '11px' }}>Save</button>
                              <button onClick={() => setRenamingTabId(null)} style={{ ...dimBtn, padding: '4px 8px', fontSize: '11px' }}>✕</button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => { setRenamingTabId(tab.id); setRenameValue(tab.label) }}
                                style={blueBtn}
                              >
                                Rename
                              </button>
                              <button onClick={() => handleDeleteTab(tab.id)} style={dangerBtn}>Delete</button>
                            </>
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => {
                    setTabOrder([])
                    try { localStorage.removeItem(TAB_ORDER_KEY) } catch { /* ignore */ }
                    showToast('Tab order reset to default.')
                  }}
                  style={{ ...dimBtn, marginTop: '12px', fontSize: '11px' }}
                >
                  Reset to Default Order
                </button>
              </div>

              {/* Add new tab */}
              <div style={card}>
                <div className="font-display font-bold text-[13px] uppercase tracking-[0.07em] mb-4" style={{ color: '#f0b429' }}>Create New Tab</div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label style={lbl}>Tab Name</label>
                    <input
                      style={inp}
                      value={newTabLabel}
                      onChange={e => setNewTabLabel(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddTab()}
                      placeholder="e.g. Storyline, Conquest, Events"
                    />
                  </div>
                  <div className="flex items-end">
                    <button onClick={handleAddTab} disabled={!newTabLabel.trim()} style={{ ...goldBtn, opacity: newTabLabel.trim() ? 1 : 0.4, padding: '10px 20px' }}>
                      Create Tab
                    </button>
                  </div>
                </div>
                <div className="text-[11px] mt-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  After creating a tab, assign programs to it via the Add/Edit Program form.
                </div>
              </div>
            </div>
          )
        })()}
      </div>

      {/* Toast */}
      {toastMsg && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-xl text-[13px] font-semibold z-50"
          style={{ background: '#0d1424', border: '1px solid rgba(240,180,41,0.3)', color: '#ffd166', boxShadow: '0 8px 32px rgba(0,0,0,0.6)', whiteSpace: 'nowrap' }}
        >
          {toastMsg}
        </div>
      )}
    </div>
  )
}

// ── JSON schema hint ───────────────────────────────────────────────────────────
const JSON_SCHEMA = [
  '{',
  '  "name": "Program Name",',
  '  "category": "Description · XP amount",',
  '  "color": "#003087",',
  '  "boss": "Reward card name",',
  '  "tab": "player | other | wbc | ta | f1 | <custom-tab-id>",',
  '  "sections": [',
  '    {',
  '      "label": "Section label",',
  '      "missions": [',
  '        {',
  '          "text": "Mission description",',
  '          "xp": 10,',
  '          "type": "check | tally | rep",',
  '          "target": 1',
  '        }',
  '      ]',
  '    }',
  '  ]',
  '}',
].join('\n')
