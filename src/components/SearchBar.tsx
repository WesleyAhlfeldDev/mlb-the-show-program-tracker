'use client'

interface Props {
  value: string
  onChange: (v: string) => void
}

export function SearchBar({ value, onChange }: Props) {
  return (
    <div className="relative mb-4">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm pointer-events-none">
        🔍
      </span>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Search programs, teams, missions…"
        className={[
          'w-full bg-bg2 border border-white/[0.13] rounded-xl text-white',
          'font-body text-[13px] pl-9 pr-9 py-2.5 outline-none',
          'placeholder:text-white/25 transition-colors',
          'focus:border-blue-500',
        ].join(' ')}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-bg4 text-white/50 hover:text-white hover:bg-white/20 text-[11px] flex items-center justify-center transition-colors"
        >
          ✕
        </button>
      )}
    </div>
  )
}
