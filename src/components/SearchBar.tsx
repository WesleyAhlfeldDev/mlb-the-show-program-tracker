'use client'

interface Props {
  value: string
  onChange: (v: string) => void
}

export function SearchBar({ value, onChange }: Props) {
  return (
    <div className="relative mb-4">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 text-sm pointer-events-none">
        🔍
      </span>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Search programs, teams, missions…"
        className="w-full rounded-xl text-white font-body text-[13px] pl-9 pr-9 py-2.5 outline-none placeholder:text-white/20 transition-all"
        style={{
          background: 'linear-gradient(135deg, #0d1424 0%, #141d30 100%)',
          border: value
            ? '1px solid rgba(240,180,41,0.45)'
            : '1px solid rgba(240,180,41,0.12)',
          boxShadow: value ? '0 0 16px rgba(240,180,41,0.1)' : 'none',
        }}
        onFocus={e => {
          e.currentTarget.style.border = '1px solid rgba(240,180,41,0.45)'
          e.currentTarget.style.boxShadow = '0 0 16px rgba(240,180,41,0.1)'
        }}
        onBlur={e => {
          if (!value) {
            e.currentTarget.style.border = '1px solid rgba(240,180,41,0.12)'
            e.currentTarget.style.boxShadow = 'none'
          }
        }}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center text-[11px] transition-colors text-white/40 hover:text-white"
          style={{ background: 'rgba(240,180,41,0.1)', border: '1px solid rgba(240,180,41,0.2)' }}
        >
          ✕
        </button>
      )}
    </div>
  )
}
