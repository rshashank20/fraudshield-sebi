import type { NextApiRequest, NextApiResponse } from 'next'
import { analyzeAnnouncement } from '../../utils/analyzeAnnouncement'
import { searchExchangeFilings } from '../../utils/filingsLookup'
import { llmAnalyzeAnnouncement } from '../../utils/llmAnalyze'

type Verdict = 'HIGH RISK' | 'WATCH' | 'SAFE'

interface CorporateCheckResponse {
  credibility: number
  verdict: Verdict
  reasoning: string
  evidence?: {
    label: string
    url?: string
    snippet?: string
  }[]
  matchedMockId?: string
}

const mockAnnouncements: Array<{
  id: string
  title: string
  text: string
  verdict: Verdict
  credibility: number
  reasoning: string
  evidence: CorporateCheckResponse['evidence']
}> = [
  {
    id: 'mock-1',
    title: 'Guaranteed Dividend Windfall',
    text:
      'Company ABC announces a special guaranteed dividend of 25% next month for all shareholders. Act now before record date—limited window!'
    ,
    verdict: 'HIGH RISK',
    credibility: 18,
    reasoning:
      'Uses promotional language ("guaranteed", "act now") and unusually high dividend claims without audited backing; resembles pump messaging.',
    evidence: [
      { label: 'Similar scam pattern (SEBI advisory)', url: 'https://www.sebi.gov.in/' },
      { label: 'Historical payouts inconsistent', snippet: 'Avg dividend last 8 qtrs: 0.8% to 1.4% per qtr' }
    ]
  },
  {
    id: 'mock-2',
    title: 'Strategic Acquisition (Board Approved)',
    text:
      'XYZ Ltd. board has approved the acquisition of LMN Pvt. Ltd., subject to customary regulatory approvals. Detailed presentation attached.'
    ,
    verdict: 'SAFE',
    credibility: 86,
    reasoning:
      'Neutral, factual tone with governance cues (board approved, regulatory approvals). Announcement structure matches typical corporate disclosures.',
    evidence: [
      { label: 'Stock exchange filing link', url: 'https://www.nseindia.com/' },
      { label: 'Historical behavior', snippet: 'Prior M&A announcements followed similar templates and timelines' }
    ]
  },
  {
    id: 'mock-3',
    title: 'Insider Tip: Quarterly Profit To Double',
    text:
      'Leaked internal document shows profits to double this quarter. Confidential sources confirm. Buy before it is announced!'
    ,
    verdict: 'WATCH',
    credibility: 48,
    reasoning:
      'Mentions leaks and confidential sources without substantiation; speculative and time-pressuring. Monitor for official filings.',
    evidence: [
      { label: 'No exchange filing found', url: 'https://www.bseindia.com/' },
      { label: 'Media chatter only', snippet: 'Social posts cite anonymous sources; no company release' }
    ]
  }
]

function pickMockByText(text: string | undefined): typeof mockAnnouncements[number] {
  if (!text) return mockAnnouncements[1]
  const normalized = text.toLowerCase()
  if (normalized.includes('guaranteed') || normalized.includes('act now') || normalized.includes('windfall')) {
    return mockAnnouncements[0]
  }
  if (normalized.includes('board') && normalized.includes('approved')) {
    return mockAnnouncements[1]
  }
  if (normalized.includes('leaked') || normalized.includes('insider') || normalized.includes('double')) {
    return mockAnnouncements[2]
  }
  // default: choose the most neutral
  return mockAnnouncements[1]
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<CorporateCheckResponse>) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).end('Method Not Allowed')
  }

  try {
    const { text, fileName }: { text?: string; fileName?: string } = req.body || {}

    // 1) Try LLM analysis if available
    const llm = await llmAnalyzeAnnouncement(text || '')
    // 2) Exchange filings heuristic/lookup
    const filings = await searchExchangeFilings(text || '')
    // 3) Keyword mock fallback
    const mock = analyzeAnnouncement(text || '')

    // Blend results: prefer LLM verdict if present; otherwise mock. Boost credibility if filings matched
    const baseCred = llm?.credibilityScore ?? mock.credibilityScore
    const verdict = llm?.verdict ?? mock.verdict
    const reasoning = llm?.reasoning ?? mock.reasoning

    const credibility = Math.max(0, Math.min(100, baseCred + (filings?.matched ? 5 : 0)))

    const evidence: CorporateCheckResponse['evidence'] = []
    if (filings) {
      evidence.push({ label: filings.title || 'Exchange filings', url: filings.url, snippet: filings.snippet })
    }
    if (!filings?.matched && mock.evidenceLink) {
      evidence.push({ label: 'Reference', url: mock.evidenceLink })
    }

    const response: CorporateCheckResponse = {
      credibility,
      verdict,
      reasoning,
      evidence: evidence.length ? evidence : undefined,
      matchedMockId: undefined
    }

    return res.status(200).json(response)
  } catch (error) {
    return res.status(200).json({
      credibility: 50,
      verdict: 'WATCH',
      reasoning: 'Analyzer encountered an issue; defaulting to watch. Please retry or verify via official exchange filings.',
      evidence: [{ label: 'Exchange portal', url: 'https://www.nseindia.com/' }]
    })
  }
}


