import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface ShowCard {
  uuid: string
  name: string
  display_position: string
  ovr: number
  rarity: string
  team: string
  img: string
  series: string
  series_year?: number
}

interface ShowApiResponse {
  items?: ShowCard[]
  total_pages?: number
}

// Module-level cache — persists across requests in the same server process
let cachedCards: ShowCard[] = []
let cacheExpiry = 0

async function fetchPage(page: number): Promise<ShowCard[]> {
  const url = `https://mlb26.theshow.com/apis/items.json?type=mlb_card&page=${page}`
  try {
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; MLB-Tracker/1.0)',
      },
    })
    if (!res.ok) return []
    const data = (await res.json()) as ShowApiResponse
    return data.items ?? []
  } catch {
    return []
  }
}

async function getAllCards(): Promise<ShowCard[]> {
  if (cachedCards.length > 0 && Date.now() < cacheExpiry) {
    return cachedCards
  }

  const BASE = 'https://mlb26.theshow.com/apis/items.json?type=mlb_card&page=1'
  const res = await fetch(BASE, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'Mozilla/5.0 (compatible; MLB-Tracker/1.0)',
    },
  })
  if (!res.ok) return []

  const firstData = (await res.json()) as ShowApiResponse
  const firstItems = firstData.items ?? []
  const totalPages = firstData.total_pages ?? 1

  console.log(`[cards] Warming cache: ${totalPages} total pages`)

  // Fetch all remaining pages in parallel
  const restPages = Array.from({ length: totalPages - 1 }, (_, i) => i + 2)
  const restResults = await Promise.all(restPages.map(fetchPage))

  const all = [...firstItems, ...restResults.flat()]
  cachedCards = all
  cacheExpiry = Date.now() + 60 * 60 * 1000 // cache for 1 hour
  console.log(`[cards] Cache warmed: ${all.length} cards`)

  return all
}

export async function GET(request: NextRequest) {
  const name = request.nextUrl.searchParams.get('name')?.trim()

  if (!name || name.length < 2) {
    return NextResponse.json({ items: [] })
  }

  try {
    const allCards = await getAllCards()
    const nameLower = name.toLowerCase()

    const items = allCards
      .filter(c => c.name.toLowerCase().includes(nameLower))
      .sort((a, b) => {
        const aStarts = a.name.toLowerCase().startsWith(nameLower) ? 0 : 1
        const bStarts = b.name.toLowerCase().startsWith(nameLower) ? 0 : 1
        return aStarts - bStarts
      })
      .slice(0, 25)
      .map(c => ({
        uuid: c.uuid,
        name: c.name,
        display_position: c.display_position,
        ovr: c.ovr,
        rarity: c.rarity,
        team: c.team,
        img: c.img,
        series: c.series ?? '',
      }))

    return NextResponse.json(
      { items },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (err) {
    console.error('MLB The Show card search error:', err)
    return NextResponse.json(
      { items: [], error: 'Could not reach MLB The Show API' },
      { status: 502 }
    )
  }
}
