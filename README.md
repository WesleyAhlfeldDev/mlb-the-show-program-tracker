# MLB The Show 26 — Program Tracker

A Next.js 14 app for tracking Diamond Dynasty programs — WBC pools, Team Affinity (all 30 teams + #1 Fan), Player, and Other programs.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run dev server
npm run dev
# → Open http://localhost:3000
```

## Features

- **All 30 teams** with Team Affinity + #1 Fan programs grouped together
- **WBC Pools A–D** + WBC Moonshot Event
- **Player programs** — Travis Hafner, Bill Mazeroski
- **Other programs** — Starter Program
- **Tally counters** with live progress bars
- **Auto-complete** button on every card header
- **Search** across all programs, teams, and missions
- **Tab navigation** — All, WBC, Team Affinity, Player, Other
- **Completed programs** sort to bottom with green stripe + COMPLETED badge
- **localStorage persistence** — progress survives page reloads
- **Export / Import** full JSON backup

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- No external state libraries — pure React hooks

## Project Structure

```
src/
  app/
    layout.tsx      # Root layout with fonts
    page.tsx        # Main page
    globals.css     # Base styles
  components/
    StatsBar.tsx    # Top stats row
    TabBar.tsx      # Sticky nav tabs
    SearchBar.tsx   # Search input
    ProgramCard.tsx # Individual program accordion
    MissionRow.tsx  # Mission rows (check / tally / repeatable)
    TeamGroup.tsx   # TA + #1 Fan grouped container
    WBCSection.tsx  # WBC tab view
    TASection.tsx   # Team Affinity tab view
    AllSection.tsx  # All / Search view
    ImportModal.tsx # Backup restore modal
  data/
    wbc.ts          # WBC pool + moonshot data
    ta.ts           # Team Affinity data (30 teams)
    f1.ts           # #1 Fan data (27 teams)
    player-other.ts # Player + Other program data
    index.ts        # Re-exports + constants
  hooks/
    useTracker.ts   # All state, actions, helpers
    useToast.ts     # Toast notifications
  types/
    index.ts        # TypeScript types
```

## Adding New Programs

Edit `src/data/player-other.ts` (or create a new file) and add your program object following the same shape. Add the program to the appropriate default array in `useTracker.ts`.

## Backup / Restore

- Click **Export All** in the header to download a `.json` backup
- Click **Import** to paste or upload a backup and restore all progress
