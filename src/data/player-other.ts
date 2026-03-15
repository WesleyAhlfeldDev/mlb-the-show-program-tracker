import type { Program } from '@/types'

function mk(id: string, text: string, xp: number, type: 'check'|'tally'|'rep', target = 0) {
  return { id, text, xp, type, target, current: 0, done: false }
}

export const PLAYER_DEF: Program[] = [
  {
    id: 'pl-hafner', name: 'Travis Hafner', category: 'Cornerstone · Earn Travis Hafner!',
    color: '#e31937', boss: 'Travis Hafner (Cornerstone)', tab: 'player',
    sections: [
      { label: 'Moments — 5 tasks · 30 XP', missions: [
        mk('haf-m1', 'Hafner Hits for the Cycle', 6, 'check'),
        mk('haf-m2', 'Top Five AL MVP Finish', 6, 'check'),
        mk('haf-m3', 'Single-Season Grand Slam Record', 6, 'check'),
        mk('haf-m4', "Hafner's Walk-Off Grand Slam", 6, 'check'),
        mk('haf-m5', 'Cleveland Cornerstone', 6, 'check'),
      ]},
      { label: 'Missions — 2 tasks · 20 XP', missions: [
        mk('haf-p1', "Tally 6 home runs with any players (Hafner's 2006 single-season grand slam record)", 10, 'tally', 6),
        mk('haf-p2', "Tally 1,039 PXP with any hitters (Hafner's career hits with Cleveland)", 10, 'tally', 1039),
      ]},
    ],
  },
  {
    id: 'pl-mazeroski', name: 'Bill Mazeroski', category: 'The Show Community Remembers',
    color: '#fdb827', boss: 'Bill Mazeroski (2nd Half Heroes)', tab: 'player',
    sections: [
      { label: 'Moment — 1 task · 5 XP', missions: [
        mk('maz-m1', 'Remembering Bill Mazeroski', 5, 'check'),
      ]},
      { label: 'Mission — 1 task · 4 XP', missions: [
        mk('maz-p1', 'Hit 1 home run with any player (Mazeroski hit the only walk-off HR in a Game 7 World Series, 1960)', 4, 'tally', 1),
      ]},
    ],
  },
]

export const OTHER_DEF: Program[] = [
  {
    id: 'oth-starter', name: 'Starter Program', category: 'Earn Troy Tulowitzki!',
    color: '#3b82f6', boss: 'Aaron Judge · Albert Pujols · Felix Hernandez · Troy Tulowitzki',
    tab: 'other',
    sections: [
      { label: 'Moments — 5 tasks · 15 XP', missions: [
        mk('st-m1', 'Aaron Judge - Cover and Captain', 3, 'check'),
        mk('st-m2', 'Ohtani Does it All', 3, 'check'),
        mk('st-m3', 'Pujols Mashes', 3, 'check'),
        mk('st-m4', 'King Félix Has Returned', 3, 'check'),
        mk('st-m5', "Tulo in '26", 3, 'check'),
      ]},
      { label: 'Stat Missions — 5 tasks · 15 XP', missions: [
        mk('st-p1', 'Win 1 game in any Diamond Dynasty mode', 3, 'tally', 1),
        mk('st-p2', 'Tally 5 hits in any Diamond Dynasty mode', 3, 'tally', 5),
        mk('st-p3', 'Hit 1 home run in any Diamond Dynasty mode', 3, 'tally', 1),
        mk('st-p4', 'Tally 5 strikeouts in any Diamond Dynasty mode', 3, 'tally', 5),
        mk('st-p5', 'Tally 5 innings pitched in any Diamond Dynasty mode', 3, 'tally', 5),
      ]},
      { label: 'Collections — 3 tasks · 15 XP', missions: [
        mk('st-c1', 'Collect 9 Common Live Series players', 5, 'tally', 9),
        mk('st-c2', 'Collect any 3 Silver Unlockables (Animations, Audio, Icons & Banners)', 5, 'tally', 3),
        mk('st-c3', 'Collect 1 Bat Skin', 5, 'tally', 1),
      ]},
      { label: 'Exchange — 1 task · 5 XP', missions: [
        mk('st-e1', 'Exchange 300 Common Live Series Players', 5, 'tally', 300),
      ]},
    ],
  },
]
