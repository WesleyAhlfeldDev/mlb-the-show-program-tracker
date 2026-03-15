export { WBC_DEF, SHARED_MISSIONS_DEFAULT } from './wbc'
export { TA_DEF } from './ta'
export { F1_DEF } from './f1'
export { PLAYER_DEF, OTHER_DEF } from './player-other'

// Team metadata for display
export const TEAM_SHORT: Record<string, string> = {
  'Los Angeles Angels': 'Angels',
  'Houston Astros': 'Astros',
  'Athletics': 'Athletics',
  'Toronto Blue Jays': 'Blue Jays',
  'Cleveland Guardians': 'Guardians',
  'Seattle Mariners': 'Mariners',
  'Baltimore Orioles': 'Orioles',
  'Texas Rangers': 'Rangers',
  'Tampa Bay Rays': 'Rays',
  'Boston Red Sox': 'Red Sox',
  'Kansas City Royals': 'Royals',
  'Detroit Tigers': 'Tigers',
  'Minnesota Twins': 'Twins',
  'Chicago White Sox': 'White Sox',
  'New York Yankees': 'Yankees',
  'Atlanta Braves': 'Braves',
  'Chicago Cubs': 'Cubs',
  'Arizona Diamondbacks': 'D-backs',
  'Los Angeles Dodgers': 'Dodgers',
  'San Francisco Giants': 'Giants',
  'Miami Marlins': 'Marlins',
  'New York Mets': 'Mets',
  'Washington Nationals': 'Nationals',
  'San Diego Padres': 'Padres',
  'Philadelphia Phillies': 'Phillies',
  'Pittsburgh Pirates': 'Pirates',
  'Cincinnati Reds': 'Reds',
  'Colorado Rockies': 'Rockies',
  'St. Louis Cardinals': 'Cardinals',
  'Milwaukee Brewers': 'Brewers',
}

export const AL_IDS = ['ta-laa','ta-hou','ta-ath','ta-tor','ta-cle','ta-sea','ta-bal','ta-tex','ta-tb','ta-bos','ta-kc','ta-det','ta-min','ta-cws','ta-nyy']
export const NL_IDS = ['ta-atl','ta-chc','ta-ari','ta-lad','ta-sf','ta-mia','ta-nym','ta-was','ta-sd','ta-phi','ta-pit','ta-cin','ta-col','ta-stl','ta-mil']
