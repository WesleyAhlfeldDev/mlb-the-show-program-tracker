'use client'
import { useState, useEffect } from 'react'

const ADMIN_PASSWORD = 'ahlfeld26'
const CUSTOM_KEY = 'mlb26_custom_v1'
const STATE_KEY = 'mlb26_v12'

type MissionType = 'check' | 'tally' | 'rep'
type TabType = 'player' | 'other' | 'wbc' | 'ta'
type ViewType = 'form' | 'list' | 'json'

interface MissionDraft {
  id: string
  text: string
  xp: number
  type: MissionType
  target: number
}

interface SectionDraft {
  id: string
  label: string
  missions: MissionDraft[]
}

interface ProgramDraft {
  name: string
  category: string
  color: string
  boss: string
  tab: TabType
  sections: SectionDraft[]
}

interface SavedProgram {
  id: string
  name: string
  category: string
  color: string
  boss: string
  tab: string
  pinned: boolean
  sections: {
    label: string
    missions: {
      id: string
      text: string
      xp: number
      type: string
      target: number
      current: number
      done: boolean
    }[]
  }[]
}

function blankMission(): MissionDraft {
  return {
    id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    text: '',
    xp: 5,
    type: 'check',
    target: 1,
  }
}

function blankSection(): SectionDraft {
  return {
    id: `s-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    label: '',
    missions: [blankMission()],
  }
}

function blankProgram(): ProgramDraft {
  return {
    name: '',
    category: '',
    color: '#f0b429',
    boss: '',
    tab: 'player',
    sections: [blankSection()],
  }
}

const cardStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #0d1424 0%, #141d30 100%)',
  border: '1px solid rgba(240,180,41,0.15)',
  borderRadius: '12px',
  padding: '20px',
}

const inputStyle: React.CSSProperties = {
  background: '#080c14',
  border: '1px solid rgba(240,180,41,0.2)',
  borderRadius: '6px',
  color: '#e8edf8',
  padding: '8px 12px',
  fontSize: '13px',
  width: '100%',
  outline: 'none',
}

const labelStyle: React.CSSProperties = {
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

const JSON_SCHEMA = [
  '{',
  '  "name": "Program Name",',
  '  "category": "Description · XP amount",',
  '  "color": "#003087",',
  '  "boss": "Reward card name",',
  '  "tab": "player | other | ta | wbc",',
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

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [pw, setPw] = useState('')
  const [pwError, setPwError] = useState(false)
  const [view, setView] = useState<ViewType>('form')
  const [draft, setDraft] = useState<ProgramDraft>(blankProgram)
  const [saved, setSaved] = useState<SavedProgram[]>([])
  const [toastMsg, setToastMsg] = useState('')
  const [jsonInput, setJsonInput] = useState('')
  const [jsonError, setJsonError] = useState('')

  useEffect(() => {
    if (!authed) return
    try {
      const raw = localStorage.getItem(CUSTOM_KEY)
      if (raw) setSaved(JSON.parse(raw) as SavedProgram[])
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

  function setMissionField(si: number, mi: number, field: keyof MissionDraft, val: string | number) {
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

  function persistProgram(prog: SavedProgram) {
    const next = [...saved, prog]
    localStorage.setItem(CUSTOM_KEY, JSON.stringify(next))
    setSaved(next)
    try {
      const raw = localStorage.getItem(STATE_KEY)
      const state = raw ? (JSON.parse(raw) as Record<string, unknown>) : {}
      const arr = Array.isArray(state[prog.tab]) ? (state[prog.tab] as SavedProgram[]) : []
      state[prog.tab] = [...arr, prog]
      localStorage.setItem(STATE_KEY, JSON.stringify(state))
    } catch { /* ignore */ }
  }

  function saveProgram() {
    if (!draft.name.trim()) { showToast('Program name is required'); return }
    const pid = `custom-${Date.now()}`
    const prog: SavedProgram = {
      id: pid,
      name: draft.name.trim(),
      category: draft.category.trim(),
      color: draft.color,
      boss: draft.boss.trim(),
      tab: draft.tab,
      pinned: false,
      sections: draft.sections.map(sec => ({
        label: sec.label,
        missions: sec.missions.map(m => ({
          id: m.id,
          text: m.text.trim(),
          xp: Number(m.xp),
          type: m.type,
          target: Number(m.target),
          current: 0,
          done: false,
        })),
      })),
    }
    persistProgram(prog)
    setDraft(blankProgram())
    showToast('Program saved! Reload the tracker to see it.')
  }

  function importFromJson() {
    setJsonError('')
    let parsed: unknown
    try {
      parsed = JSON.parse(jsonInput.trim())
    } catch {
      setJsonError('Invalid JSON — check for missing commas, brackets, or quotes.')
      return
    }

    const programs = Array.isArray(parsed) ? parsed : [parsed]
    let count = 0

    for (const raw of programs) {
      const p = raw as Record<string, unknown>
      if (!p.name || typeof p.name !== 'string') { setJsonError('Each program needs a "name" field.'); return }
      if (!Array.isArray(p.sections)) { setJsonError(`"${String(p.name)}" needs a "sections" array.`); return }

      const pid = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
      const prog: SavedProgram = {
        id: pid,
        name: p.name.trim(),
        category: typeof p.category === 'string' ? p.category.trim() : '',
        color: typeof p.color === 'string' ? p.color : '#f0b429',
        boss: typeof p.boss === 'string' ? p.boss.trim() : '',
        tab: ['player', 'other', 'ta', 'wbc'].includes(p.tab as string) ? (p.tab as string) : 'other',
        pinned: false,
        sections: (p.sections as Record<string, unknown>[]).map(sec => ({
          label: typeof sec.label === 'string' ? sec.label : '',
          missions: (Array.isArray(sec.missions) ? sec.missions as Record<string, unknown>[] : []).map((m, mi) => ({
            id: `m-${pid}-${mi}`,
            text: typeof m.text === 'string' ? m.text.trim() : '',
            xp: typeof m.xp === 'number' ? m.xp : 5,
            type: ['check', 'tally', 'rep'].includes(m.type as string) ? (m.type as string) : 'check',
            target: typeof m.target === 'number' ? m.target : 1,
            current: 0,
            done: false,
          })),
        })),
      }
      persistProgram(prog)
      count++
    }

    setJsonInput('')
    showToast(`Imported ${count} program${count !== 1 ? 's' : ''}! Reload the tracker.`)
    setView('list')
  }

  function deleteProgram(idx: number) {
    const prog = saved[idx]
    const next = saved.filter((_, i) => i !== idx)
    localStorage.setItem(CUSTOM_KEY, JSON.stringify(next))
    setSaved(next)
    try {
      const raw = localStorage.getItem(STATE_KEY)
      if (!raw) return
      const state = JSON.parse(raw) as Record<string, unknown>
      if (Array.isArray(state[prog.tab])) {
        state[prog.tab] = (state[prog.tab] as SavedProgram[]).filter(p => p.id !== prog.id)
        localStorage.setItem(STATE_KEY, JSON.stringify(state))
      }
    } catch { /* ignore */ }
    showToast('Program deleted.')
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#080c14' }}>
        <div style={{ ...cardStyle, width: '320px' }}>
          <div
            className="font-display font-bold text-[20px] uppercase tracking-[0.06em] mb-6 text-center"
            style={{ background: 'linear-gradient(135deg, #ffd166, #f0b429)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
          >
            Admin Access
          </div>
          <label style={labelStyle}>Password</label>
          <input
            type="password"
            value={pw}
            onChange={e => setPw(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && login()}
            style={{ ...inputStyle, marginBottom: '12px' }}
            placeholder="Enter password"
            autoFocus
          />
          {pwError && <div className="text-[12px] mb-3" style={{ color: '#fca5a5' }}>Incorrect password.</div>}
          <button onClick={login} style={{ ...goldBtn, width: '100%', padding: '10px' }}>Sign In</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20" style={{ background: '#080c14' }}>
      <div
        className="sticky top-0 z-50 px-6 flex items-center justify-between h-[58px]"
        style={{ background: 'linear-gradient(135deg, #080c14, #0d1424)', borderBottom: '1px solid rgba(240,180,41,0.15)' }}
      >
        <div
          className="font-display font-bold text-[17px] uppercase tracking-[0.04em]"
          style={{ background: 'linear-gradient(135deg, #ffd166, #f0b429)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
        >
          Program Admin
        </div>
        <div className="flex gap-2">
          <button onClick={() => setView('form')} style={view === 'form' ? goldBtn : dimBtn}>+ Add</button>
          <button onClick={() => setView('json')} style={view === 'json' ? goldBtn : dimBtn}>JSON Import</button>
          <button onClick={() => setView('list')} style={view === 'list' ? goldBtn : dimBtn}>Saved ({saved.length})</button>
          <button onClick={() => window.open('/', '_blank')} style={dimBtn}>Back to App</button>
        </div>
      </div>

      <div className="max-w-[860px] mx-auto px-6 pt-8">

        {view === 'list' && (
          <div>
            <div className="font-display font-bold text-[16px] uppercase tracking-[0.05em] mb-4" style={{ color: 'rgba(240,180,41,0.8)' }}>
              Custom Programs ({saved.length})
            </div>
            {saved.length === 0 ? (
              <div className="text-center py-16" style={{ color: 'rgba(255,255,255,0.2)' }}>No custom programs yet.</div>
            ) : (
              <div className="flex flex-col gap-3">
                {saved.map((prog, i) => {
                  const total = prog.sections.reduce((a, s) => a + s.missions.length, 0)
                  return (
                    <div key={prog.id} style={cardStyle} className="flex items-center justify-between gap-4">
                      <div>
                        <div className="font-display font-bold text-[15px] uppercase text-white">{prog.name}</div>
                        <div className="text-[12px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                          {prog.category} · {prog.tab} · {prog.sections.length} sections · {total} missions
                        </div>
                        {prog.boss && <div className="text-[11px] mt-0.5" style={{ color: 'rgba(240,180,41,0.5)' }}>🏆 {prog.boss}</div>}
                      </div>
                      <button onClick={() => deleteProgram(i)} style={dangerBtn}>✕ Delete</button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {view === 'json' && (
          <div className="flex flex-col gap-6">
            <div className="font-display font-bold text-[16px] uppercase tracking-[0.05em]" style={{ color: 'rgba(240,180,41,0.8)' }}>
              JSON Import
            </div>
            <div style={{ ...cardStyle, borderColor: 'rgba(240,180,41,0.25)' }}>
              <div className="font-display font-bold text-[12px] uppercase tracking-[0.07em] mb-3" style={{ color: '#f0b429' }}>
                Schema — paste one program or an array of programs
              </div>
              <pre
                className="text-[11px] leading-relaxed overflow-x-auto rounded-[6px] p-3"
                style={{ background: '#080c14', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.06)' }}
              >{JSON_SCHEMA}</pre>
              <div className="text-[11px] mt-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
                type: <code>check</code> = one-time, <code>tally</code> = stat tracking (needs target), <code>rep</code> = repeatable
              </div>
            </div>
            <div style={cardStyle}>
              <label style={labelStyle}>Paste JSON here</label>
              <textarea
                value={jsonInput}
                onChange={e => { setJsonInput(e.target.value); setJsonError('') }}
                rows={16}
                style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '12px', lineHeight: '1.6', resize: 'vertical' }}
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

        {view === 'form' && (
          <div className="flex flex-col gap-6">
            <div className="font-display font-bold text-[16px] uppercase tracking-[0.05em]" style={{ color: 'rgba(240,180,41,0.8)' }}>
              Add New Program
            </div>
            <div style={cardStyle}>
              <div className="font-display font-bold text-[13px] uppercase tracking-[0.07em] mb-4" style={{ color: '#f0b429' }}>Program Info</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label style={labelStyle}>Program Name *</label>
                  <input style={inputStyle} value={draft.name} onChange={e => setField('name', e.target.value)} placeholder="e.g. New York Yankees" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label style={labelStyle}>Category / Description</label>
                  <input style={inputStyle} value={draft.category} onChange={e => setField('category', e.target.value)} placeholder="e.g. Earn Yankees rewards! · 100K XP" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label style={labelStyle}>Reward Card / Boss</label>
                  <input style={inputStyle} value={draft.boss} onChange={e => setField('boss', e.target.value)} placeholder="e.g. Derek Jeter (Legendary)" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label style={labelStyle}>Tab</label>
                  <select style={{ ...inputStyle, cursor: 'pointer' }} value={draft.tab} onChange={e => setField('tab', e.target.value)}>
                    <option value="player">Player Program</option>
                    <option value="other">Other</option>
                    <option value="ta">Team Affinity</option>
                    <option value="wbc">WBC</option>
                  </select>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label style={labelStyle}>Color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={draft.color} onChange={e => setField('color', e.target.value)} style={{ width: '40px', height: '36px', padding: '2px', background: 'transparent', border: 'none', cursor: 'pointer' }} />
                    <input style={{ ...inputStyle, flex: 1 }} value={draft.color} onChange={e => setField('color', e.target.value)} placeholder="#f0b429" />
                  </div>
                </div>
              </div>
            </div>

            {draft.sections.map((sec, si) => (
              <div key={sec.id} style={{ ...cardStyle, borderColor: 'rgba(240,180,41,0.2)' }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="font-display font-bold text-[13px] uppercase tracking-[0.07em]" style={{ color: '#f0b429' }}>Section {si + 1}</div>
                  {draft.sections.length > 1 && <button onClick={() => removeSection(si)} style={dangerBtn}>Remove Section</button>}
                </div>
                <div className="mb-4">
                  <label style={labelStyle}>Section Label</label>
                  <input style={inputStyle} value={sec.label} onChange={e => setSectionLabel(si, e.target.value)} placeholder="e.g. Moments — 5 tasks · 30 XP" />
                </div>
                <div className="flex flex-col gap-3">
                  {sec.missions.map((m, mi) => (
                    <div key={m.id} className="rounded-[8px] p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-[0.06em]" style={{ color: 'rgba(240,180,41,0.5)' }}>Mission {mi + 1}</span>
                        {sec.missions.length > 1 && <button onClick={() => removeMission(si, mi)} style={{ ...dangerBtn, padding: '2px 8px', fontSize: '10px' }}>✕</button>}
                      </div>
                      <div className="grid grid-cols-12 gap-2">
                        <div className="col-span-12 md:col-span-6">
                          <label style={labelStyle}>Mission Text</label>
                          <input style={inputStyle} value={m.text} onChange={e => setMissionField(si, mi, 'text', e.target.value)} placeholder="e.g. Hit 10 home runs" />
                        </div>
                        <div className="col-span-4 md:col-span-2">
                          <label style={labelStyle}>Type</label>
                          <select style={{ ...inputStyle, cursor: 'pointer' }} value={m.type} onChange={e => setMissionField(si, mi, 'type', e.target.value as MissionType)}>
                            <option value="check">Check</option>
                            <option value="tally">Tally</option>
                            <option value="rep">Repeatable</option>
                          </select>
                        </div>
                        <div className="col-span-4 md:col-span-2">
                          <label style={labelStyle}>XP</label>
                          <input type="number" style={inputStyle} value={m.xp} onChange={e => setMissionField(si, mi, 'xp', parseInt(e.target.value) || 0)} min={0} />
                        </div>
                        {m.type === 'tally' && (
                          <div className="col-span-4 md:col-span-2">
                            <label style={labelStyle}>Target</label>
                            <input type="number" style={inputStyle} value={m.target} onChange={e => setMissionField(si, mi, 'target', parseInt(e.target.value) || 1)} min={1} />
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
              <button onClick={saveProgram} style={{ ...goldBtn, padding: '12px 28px', fontSize: '14px' }}>Save Program</button>
              <button onClick={() => setDraft(blankProgram())} style={dimBtn}>Reset</button>
            </div>
          </div>
        )}
      </div>

      {toastMsg && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-xl text-[13px] font-semibold"
          style={{ background: '#0d1424', border: '1px solid rgba(240,180,41,0.3)', color: '#ffd166', boxShadow: '0 8px 32px rgba(0,0,0,0.6)', whiteSpace: 'nowrap' }}
        >
          {toastMsg}
        </div>
      )}
    </div>
  )
}
