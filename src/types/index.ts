export type MissionType = 'check' | 'tally' | 'rep'

export interface Mission {
  id: string
  text: string
  xp: number
  type: MissionType
  target: number
  current: number
  done: boolean
}

export interface Section {
  label: string
  missions: Mission[]
}

export type TabType = 'wbc' | 'ta' | 'f1' | 'player' | 'other'

export interface Program {
  id: string
  name: string
  category: string
  color: string
  boss: string
  tab: TabType
  sections: Section[]
  teamId?: string // for F1 programs linking to TA
  pinned?: boolean
}

export interface SharedMission {
  id: string
  text: string
  xp: number
  done: boolean
}

export type ActiveTab = 'all' | 'wbc' | 'ta' | 'player' | 'other' | 'pinned'

export interface TrackerState {
  wbc: Program[]
  ta: Program[]
  f1: Program[]
  moonshot: Program[]
  player: Program[]
  other: Program[]
  shared: SharedMission[]
  cat: ActiveTab
}