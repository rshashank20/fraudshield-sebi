export interface FilingEvidence {
  matched: boolean
  source: 'NSE' | 'BSE' | 'Heuristic'
  title?: string
  url?: string
  snippet?: string
}

// Attempts lightweight public lookups; falls back to heuristics when network blocks
export async function searchExchangeFilings(query: string): Promise<FilingEvidence | null> {
  const q = (query || '').trim()
  if (!q) return null

  // Simple heuristics to simulate a match when phrasing looks like formal disclosure
  const lower = q.toLowerCase()
  if (lower.includes('board') && lower.includes('approved')) {
    return {
      matched: true,
      source: 'Heuristic',
      title: 'Board-approved corporate action (detected by pattern)',
      url: 'https://www.nseindia.com/',
      snippet: 'Detected governance cues: “board”, “approved”, “regulatory approvals”.'
    }
  }

  // Best-effort fetch to a known BSE XML feed; ignore failures
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 2500)
    const res = await fetch('https://www.bseindia.com/xml-data/corpfiling/BA_Ann.xml', { signal: controller.signal })
    clearTimeout(timeout)
    if (res.ok) {
      const text = await res.text()
      const normalized = text.toLowerCase()
      const words = q.split(/\s+/).filter(Boolean).map(w => w.toLowerCase())
      const hit = words.some(w => normalized.includes(w))
      if (hit) {
        return {
          matched: true,
          source: 'BSE',
          title: 'Potentially relevant BSE filing detected',
          url: 'https://www.bseindia.com/corporates/ann.html',
          snippet: 'Query terms found in recent announcements feed.'
        }
      }
    }
  } catch {
    // ignore network errors
  }

  return {
    matched: false,
    source: 'Heuristic',
    title: 'No matching exchange filing found',
    url: 'https://www.nseindia.com/companies-listing/corporate-filings-announcements',
    snippet: 'No clear match detected in public feeds; consider manual search.'
  }
}


