'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'

const SK = 'mlb26_pxp_v2'

// ── Constants ─────────────────────────────────────────────────────────────────

const PARALLELS = [
  { level: 1, threshold: 500,   roman: 'I' },
  { level: 2, threshold: 1500,  roman: 'II' },
  { level: 3, threshold: 3000,  roman: 'III' },
  { level: 4, threshold: 6000,  roman: 'IV' },
  { level: 5, threshold: 10000, roman: 'V' },
]

const DIFFICULTIES = [
  { id: 'rookie',  label: 'Rookie',       mult: 1 },
  { id: 'veteran', label: 'Veteran',      mult: 1.3 },
  { id: 'allstar', label: 'All-Star',     mult: 1.8 },
  { id: 'hof',     label: 'Hall of Fame', mult: 2.3 },
  { id: 'legend',  label: 'Legend',       mult: 3 },
  { id: 'goat',    label: 'G.O.A.T.',     mult: 3.5 },
]

const HITTER_STATS = [
  { id: 'hr',     label: 'Home Run',         short: 'HR',  basePXP: 40 },
  { id: 'pa',     label: 'Plate Appearance', short: 'PA',  basePXP: 40 },
  { id: 'triple', label: 'Triple',           short: '3B',  basePXP: 30 },
  { id: 'sb',     label: 'Stolen Base',      short: 'SB',  basePXP: 20 },
  { id: 'double', label: 'Double',           short: '2B',  basePXP: 15 },
  { id: 'single', label: 'Single',           short: '1B',  basePXP: 10 },
  { id: 'walk',   label: 'Walk',             short: 'BB',  basePXP: 10 },
  { id: 'rbi',    label: 'RBI',              short: 'RBI', basePXP: 10 },
  { id: 'run',    label: 'Run Scored',       short: 'R',   basePXP: 10 },
]

const PITCHER_STATS = [
  { id: 'hold', label: 'Hold',           short: 'HLD', basePXP: 50 },
  { id: 'save', label: 'Save',           short: 'SV',  basePXP: 50 },
  { id: 'ip',   label: 'Inning Pitched', short: 'IP',  basePXP: 40 },
  { id: 'cg',   label: 'Complete Game',  short: 'CG',  basePXP: 25 },
  { id: 'sho',  label: 'Shutout',        short: 'SHO', basePXP: 25 },
  { id: 'win',  label: 'Win',            short: 'W',   basePXP: 20 },
  { id: 'k',    label: 'Strikeout',      short: 'K',   basePXP: 10 },
  { id: 'qs',   label: 'Quality Start',  short: 'QS',  basePXP: 10 },
]

const PITCHER_API_POSITIONS = ['SP', 'RP', 'CP', 'CL']
const HITTER_POSITIONS  = ['C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'DH']
const PITCHER_POSITIONS = ['SP', 'RP', 'CL']

// ── Types ─────────────────────────────────────────────────────────────────────

interface CardResult {
  uuid: string; name: string; display_position: string
  ovr: number; rarity: string; team: string; img: string; series: string
}

interface LogEntry { stat: string; pxp: number; ts: number }

interface CardEntry {
  id: string; playerName: string; position: string
  cardUuid: string | null; cardImg: string | null; cardOvr: number | null
  cardRarity: string | null; cardSeries: string | null; cardTeam: string | null
  currentPXP: number; pxpInput: string; log: LogEntry[]
}

interface PXPState {
  cards: CardEntry[]; isOnline: boolean; difficulty: string
}

function initPXPState(): PXPState {
  return { cards: [], isOnline: false, difficulty: 'legend' }
}

function blankCard(overrides: Partial<CardEntry> = {}): CardEntry {
  return {
    id: `manual-${Date.now()}`,
    playerName: '', position: 'RF',
    cardUuid: null, cardImg: null, cardOvr: null,
    cardRarity: null, cardSeries: null, cardTeam: null,
    currentPXP: 0, pxpInput: '0', log: [],
    ...overrides,
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function mapApiPosition(p: string) { return p === 'CP' ? 'CL' : p }
function isPitcherPos(p: string) { return PITCHER_API_POSITIONS.includes(p) }

function getMultiplier(isOnline: boolean, difficulty: string) {
  if (isOnline) return 1.5
  return DIFFICULTIES.find(d => d.id === difficulty)?.mult ?? 1
}

function getCurrentParallel(pxp: number) {
  let p = 0
  for (const par of PARALLELS) { if (pxp >= par.threshold) p = par.level; else break }
  return p
}

function getNextParallel(pxp: number) {
  return PARALLELS.find(p => pxp < p.threshold) ?? null
}

function getPrevThreshold(pxp: number) {
  let prev = 0
  for (const p of PARALLELS) { if (pxp >= p.threshold) prev = p.threshold; else break }
  return prev
}

function getModTier(pxp: number): 'none' | 'silver' | 'gold' | 'diamond' {
  if (pxp >= 10000) return 'diamond'
  if (pxp >= 3000)  return 'gold'
  if (pxp >= 500)   return 'silver'
  return 'none'
}

function rarityStyle(rarity: string) {
  switch (rarity?.toLowerCase()) {
    case 'diamond': return { color: '#7dd3fc', bg: 'rgba(130,210,255,0.12)', border: 'rgba(130,210,255,0.35)' }
    case 'gold':    return { color: '#f0b429', bg: 'rgba(240,180,41,0.12)',   border: 'rgba(240,180,41,0.35)'  }
    case 'silver':  return { color: '#c8ccd8', bg: 'rgba(190,195,210,0.12)', border: 'rgba(190,195,210,0.35)' }
    case 'bronze':  return { color: '#cd7f32', bg: 'rgba(205,127,50,0.12)',  border: 'rgba(205,127,50,0.35)'  }
    default:        return { color: '#a3a3a3', bg: 'rgba(163,163,163,0.1)',  border: 'rgba(163,163,163,0.25)' }
  }
}

const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V']

function chip(active: boolean): React.CSSProperties {
  return active
    ? { background: 'linear-gradient(135deg, #ffd166, #f0b429)', color: '#080c14', fontWeight: 800, fontSize: '11px', padding: '4px 9px', borderRadius: '5px', border: 'none', cursor: 'pointer' }
    : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', fontWeight: 600, fontSize: '11px', padding: '4px 9px', borderRadius: '5px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }
}

// ── Card Accordion ────────────────────────────────────────────────────────────

function CardAccordion({
  card, open, onToggle, onUpdate, onRemove, multiplier,
}: {
  card: CardEntry
  open: boolean
  onToggle: () => void
  onUpdate: (partial: Partial<CardEntry>) => void
  onRemove: () => void
  multiplier: number
}) {
  const isHitter    = !isPitcherPos(card.position)
  const stats       = isHitter ? HITTER_STATS : PITCHER_STATS
  const curPar      = getCurrentParallel(card.currentPXP)
  const nextPar     = getNextParallel(card.currentPXP)
  const modTier     = getModTier(card.currentPXP)
  const prevThresh  = getPrevThreshold(card.currentPXP)
  const progressPct = nextPar
    ? Math.min(100, ((card.currentPXP - prevThresh) / (nextPar.threshold - prevThresh)) * 100)
    : 100
  const rar = card.cardRarity ? rarityStyle(card.cardRarity) : null

  const sessionCounts: Record<string, number> = {}
  for (const e of card.log) sessionCounts[e.stat] = (sessionCounts[e.stat] ?? 0) + 1
  const sessionTotal = card.log.reduce((a, e) => a + e.pxp, 0)

  const MOD_COLOR: Record<string, string> = {
    none: 'rgba(255,255,255,0.25)', silver: '#c8ccd8', gold: '#f0b429', diamond: '#7dd3fc',
  }
  const MOD_LABEL: Record<string, string> = {
    none: 'No Mod', silver: 'Silver', gold: 'Gold', diamond: 'Diamond',
  }

  function addStat(stat: { label: string; basePXP: number }) {
    const gained = Math.round(stat.basePXP * multiplier)
    const newPXP = card.currentPXP + gained
    onUpdate({
      currentPXP: newPXP,
      pxpInput: String(newPXP),
      log: [{ stat: stat.label, pxp: gained, ts: Date.now() }, ...card.log].slice(0, 100),
    })
  }

  function applyPXP() {
    const val = Math.max(0, Math.min(parseInt(card.pxpInput) || 0, 99999))
    onUpdate({ currentPXP: val, pxpInput: String(val), log: [] })
  }

  return (
    <div style={{ border: `1px solid ${open ? 'rgba(240,180,41,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '10px', overflow: 'hidden', transition: 'border-color 0.15s' }}>

      {/* ── Header row (always visible) ── */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-3 py-2.5 text-left"
        style={{ background: open ? 'rgba(240,180,41,0.06)' : 'rgba(255,255,255,0.02)', border: 'none', cursor: 'pointer' }}
      >
        {/* Card image */}
        {card.cardImg ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={card.cardImg} alt={card.playerName} style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '6px', flexShrink: 0 }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
        ) : (
          <div style={{ width: '40px', height: '40px', borderRadius: '6px', background: 'rgba(255,255,255,0.04)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
            {isHitter ? '⚾' : '🥎'}
          </div>
        )}

        {/* Name + badges */}
        <div className="flex-1 min-w-0">
          <div className="font-bold text-[14px] truncate" style={{ color: open ? '#fff' : 'rgba(255,255,255,0.7)' }}>
            {card.playerName || 'Unnamed Card'}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            {rar && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: rar.bg, color: rar.color, border: `1px solid ${rar.border}` }}>{card.cardRarity}</span>}
            <span className="text-[9px]" style={{ color: isHitter ? '#4ade80' : '#60a5fa' }}>{card.position}</span>
            {card.cardOvr && <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{card.cardOvr} OVR</span>}
          </div>
        </div>

        {/* PXP summary */}
        <div className="text-right flex-shrink-0">
          <div className="font-black tabular-nums text-[15px]" style={{ color: '#ffd166' }}>{card.currentPXP.toLocaleString()}</div>
          <div className="text-[9px]" style={{ color: MOD_COLOR[modTier] }}>
            {curPar > 0 ? `Par. ${ROMAN[curPar]} · ${MOD_LABEL[modTier]}` : 'No parallel'}
          </div>
        </div>

        <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '10px', flexShrink: 0, marginLeft: '4px' }}>{open ? '▲' : '▼'}</span>
      </button>

      {/* ── Expanded body ── */}
      {open && (
        <div style={{ background: 'linear-gradient(135deg, #0d1424, #111827)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>

          {/* Progress bar */}
          <div className="px-3 pt-3 pb-2">
            <div className="flex justify-between text-[10px] mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
              <span className="font-bold tabular-nums" style={{ color: '#ffd166' }}>{card.currentPXP.toLocaleString()} PXP</span>
              {nextPar
                ? <span>{(nextPar.threshold - card.currentPXP).toLocaleString()} to Par. {ROMAN[nextPar.level]}</span>
                : <span style={{ color: '#f0b429' }}>🏆 Par. V — Maxed!</span>
              }
            </div>
            <div className="w-full rounded-full overflow-hidden" style={{ height: '6px', background: 'rgba(255,255,255,0.06)' }}>
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progressPct}%`, background: 'linear-gradient(90deg, #c8901a, #f0b429, #ffd166)' }} />
            </div>

            {/* Parallel chips */}
            <div className="grid grid-cols-5 gap-1 mt-2">
              {PARALLELS.map(p => {
                const reached = card.currentPXP >= p.threshold
                const isCur   = curPar === p.level
                return (
                  <div key={p.level} className="rounded-[5px] py-1 text-center" style={{ background: reached ? 'rgba(240,180,41,0.1)' : 'rgba(255,255,255,0.02)', border: `1px solid ${isCur ? 'rgba(240,180,41,0.5)' : reached ? 'rgba(240,180,41,0.18)' : 'rgba(255,255,255,0.05)'}` }}>
                    <div className="text-[11px] font-black" style={{ color: reached ? '#f0b429' : 'rgba(255,255,255,0.18)' }}>{p.roman}</div>
                    <div className="text-[8px] tabular-nums" style={{ color: reached ? 'rgba(240,180,41,0.55)' : 'rgba(255,255,255,0.12)' }}>{p.threshold >= 1000 ? `${p.threshold / 1000}K` : p.threshold}</div>
                  </div>
                )
              })}
            </div>

            {/* Mod chips */}
            <div className="grid grid-cols-3 gap-1 mt-1.5">
              {[
                { tier: 'silver',  threshold: 500,   label: 'Silver Mod', textColor: '#c8ccd8', borderColor: 'rgba(190,195,210,0.3)', bg: 'rgba(190,195,210,0.06)' },
                { tier: 'gold',    threshold: 3000,  label: 'Gold Mod',   textColor: '#f0b429', borderColor: 'rgba(240,180,41,0.3)',   bg: 'rgba(240,180,41,0.06)'  },
                { tier: 'diamond', threshold: 10000, label: 'Diamond Mod',textColor: '#7dd3fc', borderColor: 'rgba(130,210,255,0.3)', bg: 'rgba(130,210,255,0.06)' },
              ].map(m => {
                const unlocked = card.currentPXP >= m.threshold
                return (
                  <div key={m.tier} className="rounded-[5px] px-1.5 py-1.5 text-center" style={{ background: unlocked ? m.bg : 'rgba(255,255,255,0.02)', border: `1px solid ${unlocked ? m.borderColor : 'rgba(255,255,255,0.05)'}` }}>
                    <div className="text-[9px] font-bold" style={{ color: unlocked ? m.textColor : 'rgba(255,255,255,0.2)' }}>{m.label}</div>
                    <div className="text-[8px] mt-0.5" style={{ color: unlocked ? m.textColor : 'rgba(255,255,255,0.15)', opacity: unlocked ? 0.75 : 1 }}>
                      {unlocked ? 'Unlocked' : `${(m.threshold - card.currentPXP).toLocaleString()} needed`}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '0 12px' }} />

          {/* Set PXP */}
          <div className="px-3 py-2.5 flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-[0.07em]" style={{ color: 'rgba(240,180,41,0.5)' }}>Set PXP</span>
            <input
              type="number"
              value={card.pxpInput}
              onChange={e => onUpdate({ pxpInput: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && applyPXP()}
              min={0} max={99999}
              style={{ background: '#080c14', border: '1px solid rgba(240,180,41,0.2)', borderRadius: '5px', color: '#e8edf8', padding: '5px 8px', fontSize: '12px', outline: 'none', width: '110px' }}
            />
            <button onClick={applyPXP} style={chip(false)}>Apply</button>
            <button onClick={() => onUpdate({ currentPXP: 0, pxpInput: '0', log: [] })} style={{ background: 'rgba(239,68,68,0.07)', color: '#fca5a5', fontWeight: 600, fontSize: '11px', padding: '4px 9px', borderRadius: '5px', border: '1px solid rgba(239,68,68,0.18)', cursor: 'pointer' }}>
              Reset
            </button>
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '0 12px' }} />

          {/* Stat buttons */}
          <div className="px-3 py-2.5">
            <div className="text-[10px] font-bold uppercase tracking-[0.07em] mb-2" style={{ color: 'rgba(240,180,41,0.5)' }}>
              {isHitter ? '⚾ Hitter Stats' : '🥎 Pitcher Stats'} <span style={{ color: 'rgba(255,255,255,0.2)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>· ×{multiplier} applied</span>
            </div>
            <div className={`grid gap-1.5 ${isHitter ? 'grid-cols-3' : 'grid-cols-4'}`}>
              {stats.map(stat => {
                const effective = Math.round(stat.basePXP * multiplier)
                const count     = sessionCounts[stat.label] ?? 0
                return (
                  <button
                    key={stat.id}
                    onClick={() => addStat(stat)}
                    className="flex flex-col items-start rounded-[7px] p-2 active:scale-[0.96] transition-transform"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', textAlign: 'left' }}
                    onMouseEnter={e => { const el = e.currentTarget; el.style.background = 'rgba(240,180,41,0.08)'; el.style.borderColor = 'rgba(240,180,41,0.25)' }}
                    onMouseLeave={e => { const el = e.currentTarget; el.style.background = 'rgba(255,255,255,0.04)'; el.style.borderColor = 'rgba(255,255,255,0.08)' }}
                  >
                    <div className="flex items-center justify-between w-full mb-0.5">
                      <span className="text-[9px] font-bold uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>{stat.short}</span>
                      {count > 0 && <span className="text-[8px] font-black px-1 rounded-full" style={{ background: 'rgba(240,180,41,0.15)', color: '#f0b429' }}>×{count}</span>}
                    </div>
                    <div className="text-[18px] font-black tabular-nums leading-none" style={{ color: '#ffd166' }}>+{effective}</div>
                  </button>
                )
              })}
            </div>

            {/* Position override */}
            <details className="mt-2">
              <summary className="text-[9px] cursor-pointer select-none" style={{ color: 'rgba(255,255,255,0.2)' }}>Override position</summary>
              <div className="flex flex-col gap-1 mt-1.5">
                <div className="flex flex-wrap items-center gap-1">
                  <span className="text-[8px] font-bold uppercase flex-shrink-0 self-center" style={{ color: 'rgba(255,255,255,0.2)', minWidth: '42px' }}>Hitters</span>
                  {HITTER_POSITIONS.map(pos => <button key={pos} onClick={() => onUpdate({ position: pos })} style={chip(card.position === pos)}>{pos}</button>)}
                </div>
                <div className="flex flex-wrap items-center gap-1">
                  <span className="text-[8px] font-bold uppercase flex-shrink-0 self-center" style={{ color: 'rgba(255,255,255,0.2)', minWidth: '42px' }}>Pitchers</span>
                  {PITCHER_POSITIONS.map(pos => <button key={pos} onClick={() => onUpdate({ position: pos })} style={chip(card.position === pos)}>{pos}</button>)}
                </div>
              </div>
            </details>
          </div>

          {/* Session log */}
          {card.log.length > 0 && (
            <>
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '0 12px' }} />
              <div className="px-3 py-2.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.07em]" style={{ color: 'rgba(240,180,41,0.5)' }}>
                    Session Log <span style={{ color: '#ffd166', fontWeight: 800 }}>+{sessionTotal.toLocaleString()}</span>
                  </span>
                  <button onClick={() => onUpdate({ log: [] })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.25)', fontSize: '10px', padding: 0 }}>Clear</button>
                </div>
                <div className="flex flex-col gap-0.5 overflow-y-auto" style={{ maxHeight: '140px' }}>
                  {card.log.map((entry, i) => (
                    <div key={`${entry.ts}-${i}`} className="flex items-center justify-between px-2 py-1 rounded-[4px]" style={{ background: 'rgba(255,255,255,0.02)', borderLeft: '2px solid rgba(240,180,41,0.2)' }}>
                      <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{entry.stat}</span>
                      <span className="text-[11px] font-bold tabular-nums" style={{ color: '#ffd166' }}>+{entry.pxp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Remove button */}
          <div className="px-3 pb-2.5 flex justify-end">
            <button
              onClick={onRemove}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.2)', fontSize: '11px', padding: 0 }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fca5a5' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.2)' }}
            >
              Remove card
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function PXPCalculatorPage() {
  const [mounted, setMounted]   = useState(false)
  const [state, setState]       = useState<PXPState>(initPXPState)
  const [openCardId, setOpenCardId] = useState<string | null>(null)
  const [showAddCard, setShowAddCard] = useState(false)
  const [manualMode, setManualMode]   = useState(false)
  const [pendingCard, setPendingCard] = useState<Partial<CardEntry>>({ position: 'RF' })
  const [showSettings, setShowSettings] = useState(false)

  const [searchQuery, setSearchQuery]     = useState('')
  const [searchResults, setSearchResults] = useState<CardResult[]>([])
  const [isSearching, setIsSearching]     = useState(false)
  const [showDropdown, setShowDropdown]   = useState(false)
  const [searchError, setSearchError]     = useState('')

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dropdownRef   = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
    try {
      const raw = localStorage.getItem(SK)
      if (raw) {
        const saved = JSON.parse(raw) as Partial<PXPState>
        setState(s => ({ ...s, ...saved }))
      }
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setShowDropdown(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const persist = useCallback((s: PXPState) => {
    try { localStorage.setItem(SK, JSON.stringify(s)) } catch { /* ignore */ }
  }, [])

  useEffect(() => { if (mounted) persist(state) }, [state, mounted, persist])

  function updateCard(id: string, partial: Partial<CardEntry>) {
    setState(s => ({ ...s, cards: s.cards.map(c => c.id === id ? { ...c, ...partial } : c) }))
  }

  function removeCard(id: string) {
    setState(s => ({ ...s, cards: s.cards.filter(c => c.id !== id) }))
    if (openCardId === id) setOpenCardId(null)
  }

  function addCard(entry: CardEntry) {
    setState(s => ({ ...s, cards: [...s.cards, entry] }))
    setOpenCardId(entry.id)
    setShowAddCard(false)
    setPendingCard({ position: 'RF' })
    setSearchQuery('')
    setSearchResults([])
    setManualMode(false)
  }

  function toggleCard(id: string) {
    setOpenCardId(prev => prev === id ? null : id)
  }

  // ── Card search ─────────────────────────────────────────────────────────────

  function handleSearchInput(val: string) {
    setSearchQuery(val); setSearchError('')
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    if (!val.trim() || val.length < 2) { setSearchResults([]); setShowDropdown(false); setIsSearching(false); return }
    setIsSearching(true); setShowDropdown(true)
    searchTimeout.current = setTimeout(async () => {
      try {
        const res  = await fetch(`/api/cards?name=${encodeURIComponent(val.trim())}`)
        const data = await res.json() as { items: CardResult[]; error?: string }
        if (data.error) setSearchError(data.error)
        setSearchResults(data.items ?? [])
      } catch {
        setSearchError('Search unavailable — check your connection.')
        setSearchResults([])
      } finally { setIsSearching(false) }
    }, 400)
  }

  function selectCard(card: CardResult) {
    const existing = state.cards.find(c => c.id === card.uuid)
    if (existing) { setOpenCardId(card.uuid); setShowAddCard(false); setSearchQuery(''); setSearchResults([]); return }
    addCard(blankCard({
      id: card.uuid, playerName: card.name, position: mapApiPosition(card.display_position),
      cardUuid: card.uuid, cardImg: card.img, cardOvr: card.ovr,
      cardRarity: card.rarity, cardSeries: card.series, cardTeam: card.team,
      pxpInput: '0',
    }))
  }

  if (!mounted) return null

  const multiplier  = getMultiplier(state.isOnline, state.difficulty)
  const diffLabel   = DIFFICULTIES.find(d => d.id === state.difficulty)?.label ?? ''

  return (
    <div className="min-h-screen pb-20" style={{ background: '#080c14' }}>

      {/* ── Header ── */}
      <header
        className="sticky top-0 z-50 px-4 md:px-6 flex items-center justify-between h-[50px]"
        style={{ background: 'linear-gradient(135deg, #080c14, #0d1424)', borderBottom: '1px solid rgba(240,180,41,0.15)', boxShadow: '0 4px 24px rgba(0,0,0,0.5)' }}
      >
        <div className="flex items-center gap-2">
          <div className="w-[14px] h-[14px] rotate-45 rounded-[2px]" style={{ background: 'linear-gradient(135deg, #ffd166, #f0b429)' }} />
          <span className="font-display font-bold text-[15px] uppercase tracking-[0.04em]" style={{ background: 'linear-gradient(135deg, #ffd166, #f0b429)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            PXP Calculator
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(v => !v)}
            className="text-[11px] font-bold px-2.5 py-1.5 rounded-[6px]"
            style={{ background: showSettings ? 'rgba(240,180,41,0.12)' : 'rgba(255,255,255,0.04)', color: showSettings ? '#f0b429' : 'rgba(255,255,255,0.4)', border: `1px solid ${showSettings ? 'rgba(240,180,41,0.25)' : 'rgba(255,255,255,0.08)'}`, cursor: 'pointer' }}
          >
            ⚙ {state.isOnline ? 'Online' : diffLabel} ×{multiplier}
          </button>
          <Link href="/" className="text-[11px] font-bold uppercase tracking-[0.06em] px-3 py-1.5 rounded-[6px]" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.08)', textDecoration: 'none' }}>
            ← Tracker
          </Link>
        </div>
      </header>

      {/* ── Settings dropdown ── */}
      {showSettings && (
        <div className="max-w-[600px] mx-auto px-3 md:px-4 pt-3">
          <div style={{ background: 'linear-gradient(135deg, #0d1424, #141d30)', border: '1px solid rgba(240,180,41,0.2)', borderRadius: '10px', padding: '14px 16px' }}>
            <div className="flex flex-col gap-3">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.08em] mb-2" style={{ color: 'rgba(240,180,41,0.55)' }}>Mode</div>
                <div className="flex gap-1.5">
                  <button onClick={() => setState(s => ({ ...s, isOnline: false }))} style={chip(!state.isOnline)}>Offline</button>
                  <button onClick={() => setState(s => ({ ...s, isOnline: true }))}  style={chip(state.isOnline)}>Online ×1.5</button>
                </div>
              </div>
              {!state.isOnline && (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.08em] mb-2" style={{ color: 'rgba(240,180,41,0.55)' }}>Difficulty</div>
                  <div className="flex flex-wrap gap-1.5">
                    {DIFFICULTIES.map(d => (
                      <button key={d.id} onClick={() => setState(s => ({ ...s, difficulty: d.id }))} style={chip(state.difficulty === d.id)}>
                        {d.label} <span style={{ opacity: 0.6 }}>×{d.mult}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <main className="max-w-[600px] mx-auto px-3 md:px-4 pt-3 flex flex-col gap-2">

        {/* Card list */}
        {state.cards.map(card => (
          <CardAccordion
            key={card.id}
            card={card}
            open={openCardId === card.id}
            onToggle={() => toggleCard(card.id)}
            onUpdate={partial => updateCard(card.id, partial)}
            onRemove={() => removeCard(card.id)}
            multiplier={multiplier}
          />
        ))}

        {/* Add card */}
        {!showAddCard ? (
          <button
            onClick={() => setShowAddCard(true)}
            className="w-full py-2.5 rounded-[10px] text-[12px] font-bold transition-all"
            style={{ background: 'rgba(240,180,41,0.05)', border: '1px dashed rgba(240,180,41,0.2)', color: 'rgba(240,180,41,0.55)', cursor: 'pointer' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(240,180,41,0.08)'; (e.currentTarget as HTMLElement).style.color = '#f0b429' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(240,180,41,0.05)'; (e.currentTarget as HTMLElement).style.color = 'rgba(240,180,41,0.55)' }}
          >
            + Add Card
          </button>
        ) : (
          <div ref={dropdownRef} style={{ background: 'linear-gradient(135deg, #0d1424, #141d30)', border: '1px solid rgba(240,180,41,0.2)', borderRadius: '10px', padding: '14px' }} className="relative">
            {!manualMode ? (
              <>
                <div className="relative">
                  <input
                    style={{ background: '#080c14', border: '1px solid rgba(240,180,41,0.2)', borderRadius: '6px', color: '#e8edf8', padding: '7px 32px 7px 10px', fontSize: '13px', outline: 'none', width: '100%', boxSizing: 'border-box' }}
                    value={searchQuery}
                    onChange={e => handleSearchInput(e.target.value)}
                    onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
                    placeholder="Search player name…"
                    autoComplete="off"
                    autoFocus
                  />
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>
                    {isSearching ? '⟳' : '🔍'}
                  </div>
                </div>

                {showDropdown && (
                  <div className="absolute left-0 right-0 z-50 mt-1 rounded-[8px] overflow-hidden" style={{ background: '#0d1424', border: '1px solid rgba(240,180,41,0.2)', boxShadow: '0 8px 32px rgba(0,0,0,0.7)', maxHeight: '260px', overflowY: 'auto' }}>
                    {isSearching && <div className="px-3 py-2.5 text-[11px] text-center" style={{ color: 'rgba(255,255,255,0.35)' }}>Searching…</div>}
                    {!isSearching && searchError && <div className="px-3 py-2.5 text-[11px]" style={{ color: '#fca5a5' }}>{searchError}</div>}
                    {!isSearching && !searchError && searchResults.length === 0 && searchQuery.length >= 2 && (
                      <div className="px-3 py-2.5 text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>No cards found for &ldquo;{searchQuery}&rdquo;</div>
                    )}
                    {searchResults.map(card => {
                      const rs = rarityStyle(card.rarity)
                      const alreadyAdded = state.cards.some(c => c.id === card.uuid)
                      return (
                        <button
                          key={card.uuid}
                          onClick={() => selectCard(card)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-left"
                          style={{ background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(240,180,41,0.07)' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                        >
                          {card.img && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={card.img} alt={card.name} style={{ width: '34px', height: '34px', objectFit: 'contain', flexShrink: 0, borderRadius: '4px' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-[12px] font-bold text-white truncate">{card.name}</div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: rs.bg, color: rs.color, border: `1px solid ${rs.border}` }}>{card.rarity}</span>
                              <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{card.ovr} OVR · {card.display_position}</span>
                              {card.team && <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.25)' }}>{card.team}</span>}
                            </div>
                          </div>
                          {alreadyAdded && <span className="text-[9px] font-bold px-1.5 py-1 rounded-full flex-shrink-0" style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.2)' }}>Tracking</span>}
                        </button>
                      )
                    })}
                  </div>
                )}

                <div className="mt-2 flex items-center justify-between">
                  <button onClick={() => { setManualMode(true); setPendingCard({ position: 'RF' }) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(240,180,41,0.5)', fontSize: '10px', fontWeight: 600, textDecoration: 'underline', padding: 0 }}>
                    Enter manually
                  </button>
                  <button onClick={() => { setShowAddCard(false); setSearchQuery(''); setSearchResults([]) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.25)', fontSize: '10px', padding: 0 }}>
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-3">
                <input
                  style={{ background: '#080c14', border: '1px solid rgba(240,180,41,0.2)', borderRadius: '6px', color: '#e8edf8', padding: '7px 10px', fontSize: '13px', outline: 'none', width: '100%', boxSizing: 'border-box' }}
                  value={pendingCard.playerName ?? ''}
                  onChange={e => setPendingCard(p => ({ ...p, playerName: e.target.value }))}
                  placeholder="Player name (optional)"
                  autoFocus
                />
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.08em] mb-1.5" style={{ color: 'rgba(240,180,41,0.55)' }}>Position</div>
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap gap-1">
                      <span className="text-[8px] font-bold uppercase flex-shrink-0 self-center" style={{ color: 'rgba(255,255,255,0.2)', minWidth: '42px' }}>Hitters</span>
                      {HITTER_POSITIONS.map(pos => <button key={pos} onClick={() => setPendingCard(p => ({ ...p, position: pos }))} style={chip((pendingCard.position ?? 'RF') === pos)}>{pos}</button>)}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <span className="text-[8px] font-bold uppercase flex-shrink-0 self-center" style={{ color: 'rgba(255,255,255,0.2)', minWidth: '42px' }}>Pitchers</span>
                      {PITCHER_POSITIONS.map(pos => <button key={pos} onClick={() => setPendingCard(p => ({ ...p, position: pos }))} style={chip((pendingCard.position ?? 'RF') === pos)}>{pos}</button>)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => addCard(blankCard({ ...pendingCard, pxpInput: '0' }))} style={{ background: 'linear-gradient(135deg, #ffd166, #f0b429)', color: '#080c14', fontWeight: 800, fontSize: '11px', padding: '6px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>Add Card</button>
                  <button onClick={() => setManualMode(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', fontSize: '10px', padding: 0 }}>← Search</button>
                </div>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  )
}
