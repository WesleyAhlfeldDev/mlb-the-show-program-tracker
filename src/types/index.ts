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

export type TabType = string

export interface Program {
  id: string
  name: string
  category: string
  color: string
  boss: string
  tab: TabType
  sections: Section[]
  teamId?: string
  pinned?: boolean
}

export interface SharedMission {
  id: string
  text: string
  xp: number
  done: boolean
}

export type ActiveTab = string

export interface CustomTab {
  id: string
  label: string
}

export interface TrackerState {
  wbc: Program[]
  ta: Program[]
  f1: Program[]
  moonshot: Program[]
  player: Program[]
  other: Program[]
  custom: Program[]
  shared: SharedMission[]
  cat: ActiveTab
}
