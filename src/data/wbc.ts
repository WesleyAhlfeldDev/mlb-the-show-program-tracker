import type { SharedMission, Mission, Section, Program } from '@/types'

export const SHARED_MISSIONS_DEFAULT: SharedMission[] = [
  { id: 's1', text: 'Tally 30 innings pitched with WBC series players', xp: 3, done: false },
  { id: 's2', text: 'Tally 60 strikeouts with WBC series players', xp: 3, done: false },
  { id: 's3', text: 'Tally 50 hits with WBC series players', xp: 3, done: false },
  { id: 's4', text: 'Tally 30 extra-base hits with WBC series players', xp: 3, done: false },
  { id: 's5', text: 'Tally 20 home runs with WBC series players', xp: 3, done: false },
]

function mk(id: string, text: string, xp: number, type: Mission['type'], target = 0): Mission {
  return { id, text, xp, type, target, current: 0, done: false }
}

// ─── WBC Pools ───────────────────────────────────────────────────────────────
export const WBC_DEF: Program[] = [
  {
    id: 'pa', name: 'WBC Pool A', category: 'Earn Nolan Arenado', color: '#3b82f6',
    boss: 'Nolan Arenado', tab: 'wbc',
    sections: [
      { label: 'Moments — 10 tasks', missions: [
        mk('a1','Johan Camargo — Panama moment',3,'check'),
        mk('a2','Alfredo Despaigne — Cuba moment',3,'check'),
        mk('a3','Seth Lugo — Puerto Rico moment',3,'check'),
        mk('a4','Owen Caissie — Canada moment',3,'check'),
        mk('a5','Gio Urshela — Colombia moment',3,'check'),
        mk('a6','Adrian Almeida — Colombia moment',3,'check'),
        mk('a7','Rubén Tejada — Panama moment',3,'check'),
        mk('a8','James Paxton — Canada moment',3,'check'),
        mk('a9','Alexei Ramírez — Cuba moment',3,'check'),
        mk('a10','Nolan Arenado — Puerto Rico moment',3,'check'),
      ]},
      { label: 'Player missions — 9 tasks', missions: [
        mk('ap1','Tally 3 hits with Johan Camargo',4,'tally',3),
        mk('ap2','Tally 2 XBH with Alfredo Despaigne',4,'tally',2),
        mk('ap3','Tally 10 Ks with Seth Lugo',4,'tally',10),
        mk('ap4','Get on base 3× with Owen Caissie',4,'tally',3),
        mk('ap5','Tally 2 XBH with Gio Urshela',4,'tally',2),
        mk('ap6','Tally 5 IP with Adrian Almeida',4,'tally',5),
        mk('ap7','Tally 5 hits with Rubén Tejada',4,'tally',5),
        mk('ap8','Tally 2 wins with James Paxton',4,'tally',2),
        mk('ap9','Tally 3 XBH with Alexei Ramírez',4,'tally',3),
      ]},
      { label: 'Repeatable PXP', missions: [
        mk('ar1','Tally 2,000 PXP with Camargo/Despaigne/Lugo/Caissie/Urshela',4,'rep'),
        mk('ar2','Tally 2,000 PXP with Almeida/Tejada/Paxton/Ramírez',4,'rep'),
      ]},
    ],
  },
  {
    id: 'pb', name: 'WBC Pool B', category: 'Earn Bryce Harper', color: '#ec4899',
    boss: 'Bryce Harper', tab: 'wbc',
    sections: [
      { label: 'Moments — 10 tasks', missions: [
        mk('b1','Dante Bichette Jr. — Brazil moment',3,'check'),
        mk('b2','Rowdy Tellez — Mexico moment',3,'check'),
        mk('b3','Andrew Fischer — Italy moment',3,'check'),
        mk('b4','Trayce Thompson — Great Britain moment',3,'check'),
        mk('b5','Gunnar Henderson — United States moment',3,'check'),
        mk('b6','Joseph Contreras — Brazil moment',3,'check'),
        mk('b7','Vance Worley — Great Britain moment',3,'check'),
        mk('b8','Jac Caglianone — Italy moment',3,'check'),
        mk('b9','Randy Arozarena — Mexico moment',3,'check'),
        mk('b10','Bryce Harper — United States moment',3,'check'),
      ]},
      { label: 'Player missions — 9 tasks', missions: [
        mk('bp1','Get on base 3× with Dante Bichette Jr.',4,'tally',3),
        mk('bp2','Tally 2 XBH with Rowdy Tellez',4,'tally',2),
        mk('bp3','Tally 3 hits with Andrew Fischer',4,'tally',3),
        mk('bp4','Get on base 3× with Trayce Thompson',4,'tally',3),
        mk('bp5','Tally 2 XBH with Gunnar Henderson',4,'tally',2),
        mk('bp6','Tally 10 Ks with Joseph Contreras',4,'tally',10),
        mk('bp7','Tally 2 wins with Vance Worley',4,'tally',2),
        mk('bp8','Tally 3 XBH with Jac Caglianone',4,'tally',3),
        mk('bp9','Get on base 5× with Randy Arozarena',4,'tally',5),
      ]},
      { label: 'Repeatable PXP', missions: [
        mk('br1','Tally 2,000 PXP with Bichette Jr./Tellez/Fischer/Thompson/Henderson',4,'rep'),
        mk('br2','Tally 2,000 PXP with Contreras/Worley/Caglianone/Arozarena',4,'rep'),
      ]},
    ],
  },
  {
    id: 'pc', name: 'WBC Pool C', category: 'Earn Hyun-min Ahn', color: '#22c55e',
    boss: 'Hyun-min Ahn', tab: 'wbc',
    sections: [
      { label: 'Moments — 10 tasks', missions: [
        mk('c1','Martin Cervinka — Czechia moment',3,'check'),
        mk('c2','Robbie Perkins — Australia moment',3,'check'),
        mk('c3','Kungkuan Giljegiljaw — Chinese Taipei moment',3,'check'),
        mk('c4','Jung Hoo Lee — Korea moment',3,'check'),
        mk('c5','Teruaki Sato — Japan moment',3,'check'),
        mk('c6','Martin Muzik — Czechia moment',3,'check'),
        mk('c7','Masataka Yoshida — Japan moment',3,'check'),
        mk('c8','An-Ko Lin — Chinese Taipei moment',3,'check'),
        mk('c9','Travis Bazzana — Australia moment',3,'check'),
        mk('c10','Hyun-min Ahn — Korea moment',3,'check'),
      ]},
      { label: 'Player missions — 9 tasks', missions: [
        mk('cp1','Tally 3 hits with Martin Cervinka',4,'tally',3),
        mk('cp2','Get on base 3× with Robbie Perkins',4,'tally',3),
        mk('cp3','Tally 2 XBH with Kungkuan Giljegiljaw',4,'tally',2),
        mk('cp4','Get on base 3× with Jung Hoo Lee',4,'tally',3),
        mk('cp5','Tally 2 XBH with Teruaki Sato',4,'tally',2),
        mk('cp6','Tally 5 hits with Martin Muzik',4,'tally',5),
        mk('cp7','Tally 3 XBH with Masataka Yoshida',4,'tally',3),
        mk('cp8','Tally 3 XBH with An-Ko Lin',4,'tally',3),
        mk('cp9','Get on base 5× with Travis Bazzana',4,'tally',5),
      ]},
      { label: 'Repeatable PXP', missions: [
        mk('cr1','Tally 2,000 PXP with Cervinka/Perkins/Giljegiljaw/Lee/Sato',4,'rep'),
        mk('cr2','Tally 2,000 PXP with Muzik/Yoshida/Lin/Bazzana',4,'rep'),
      ]},
    ],
  },
  {
    id: 'pd', name: 'WBC Pool D', category: 'Earn Didi Gregorius', color: '#f59e0b',
    boss: 'Didi Gregorius', tab: 'wbc',
    sections: [
      { label: 'Moments — 10 tasks', missions: [
        mk('d1','Duque Hebbert — Nicaragua moment',3,'check'),
        mk('d2','Druw Jones — Netherlands moment',3,'check'),
        mk('d3','Spencer Horwitz — Israel moment',3,'check'),
        mk('d4','Ezequiel Tovar — Venezuela moment',3,'check'),
        mk('d5','Sandy Alcántara — Dominican Republic moment',3,'check'),
        mk('d6','Juan Soto — Dominican Republic moment',3,'check'),
        mk('d7','Harrison Bader — Israel moment',3,'check'),
        mk('d8','Mark Vientos — Nicaragua moment',3,'check'),
        mk('d9','Jackson Chourio — Venezuela moment',3,'check'),
        mk('d10','Didi Gregorius — Netherlands moment',3,'check'),
      ]},
      { label: 'Player missions — 9 tasks', missions: [
        mk('dp1','Tally 3 IP with Duque Hebbert',4,'tally',3),
        mk('dp2','Get on base 3× with Druw Jones',4,'tally',3),
        mk('dp3','Tally 2 XBH with Spencer Horwitz',4,'tally',2),
        mk('dp4','Tally 3 hits with Ezequiel Tovar',4,'tally',3),
        mk('dp5','Tally 10 Ks with Sandy Alcántara',4,'tally',10),
        mk('dp6','Tally 3 XBH with Juan Soto',4,'tally',3),
        mk('dp7','Get on base 5× with Harrison Bader',4,'tally',5),
        mk('dp8','Tally 3 XBH with Mark Vientos',4,'tally',3),
        mk('dp9','Tally 5 hits with Jackson Chourio',4,'tally',5),
      ]},
      { label: 'Repeatable PXP', missions: [
        mk('dr1','Tally 2,000 PXP with Hebbert/Jones/Horwitz/Tovar/Alcántara',4,'rep'),
        mk('dr2','Tally 2,000 PXP with Soto/Bader/Vientos/Chourio',4,'rep'),
      ]},
    ],
  },
  {
    id: 'wbc-moonshot', name: 'WBC Moonshot Event', category: 'Earn Brice Turang!',
    color: '#7c3aed', boss: 'Brice Turang (WBC) · WBC Gold Player Pack', tab: 'wbc',
    sections: [
      { label: 'Missions — 7 tasks', missions: [
        mk('ms-hits','Tally 15 hits in the WBC Moonshot Event',5,'tally',15),
        mk('ms-ks','Tally 3 strikeouts in the WBC Moonshot Event',5,'tally',3),
        mk('ms-xbh','Tally 5 extra-base hits in the WBC Moonshot Event',5,'tally',5),
        mk('ms-runs','Score 10 runs in the WBC Moonshot Event',10,'tally',10),
        mk('ms-tb','Tally 25 total bases in the WBC Moonshot Event',10,'tally',25),
        mk('ms-hr','Tally 10 home runs in the WBC Moonshot Event',15,'tally',10),
        mk('ms-wins','Win 5 games in the WBC Moonshot Event',15,'tally',5),
      ]},
    ],
  },
]
