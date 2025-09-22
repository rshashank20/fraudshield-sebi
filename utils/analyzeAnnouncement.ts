export type AnnouncementVerdict = 'HIGH RISK' | 'WATCH' | 'SAFE'

export interface AnnouncementAnalysis {
  credibilityScore: number
  verdict: AnnouncementVerdict
  reasoning: string
  evidenceLink: string
}

const HIGH_RISK_KEYWORDS = [
  '300% revenue',
  'sebi approval',
  'fake news',
  'guaranteed',
  'leaked',
  'insider',
  'act now',
  'limited time',
  'double your'
]

const SAFE_KEYWORDS = [
  'stable quarterly',
  'as per filings',
  'board approved',
  'regulatory approvals',
  'press release',
  'audited results',
  'conference call',
  'earnings release'
]

function containsAny(text: string, phrases: string[]): boolean {
  const t = text.toLowerCase()
  return phrases.some(p => t.includes(p))
}

function extractPercentClaims(text: string): number[] {
  const matches = Array.from(text.matchAll(/(\d{1,3})\s*%/g))
  return matches.map(m => Number(m[1])).filter(n => !Number.isNaN(n))
}

export function analyzeAnnouncement(text: string): AnnouncementAnalysis {
  const normalized = (text || '').trim()

  if (normalized.length === 0) {
    return {
      credibilityScore: 50,
      verdict: 'WATCH',
      reasoning: 'No content provided. Further verification needed via official exchange filings.',
      evidenceLink: 'https://www.nseindia.com/'
    }
  }

  // Risk scoring based on patterns
  const percents = extractPercentClaims(normalized)
  const hasExtremePercent = percents.some(p => p >= 100)
  const hasRiskWords = containsAny(normalized, HIGH_RISK_KEYWORDS)
  const hasSafeWords = containsAny(normalized, SAFE_KEYWORDS)

  // Compute a credibility baseline (higher is more credible)
  let credibility = 60
  if (hasExtremePercent) credibility -= 25
  if (hasRiskWords) credibility -= 20
  if (hasSafeWords) credibility += 20

  // Clamp 0..100
  credibility = Math.max(0, Math.min(100, credibility))

  if (hasExtremePercent || hasRiskWords) {
    const reasonBits: string[] = []
    if (hasExtremePercent) {
      reasonBits.push('contains extreme percentage claims')
    }
    if (hasRiskWords) {
      reasonBits.push('uses promotional or unsubstantiated language')
    }
    return {
      credibilityScore: Math.min(credibility, 35),
      verdict: 'HIGH RISK',
      reasoning: `Flagged as suspicious: ${reasonBits.join(' and ')} without official backing.`,
      evidenceLink: 'https://www.sebi.gov.in/'
    }
  }

  if (hasSafeWords) {
    return {
      credibilityScore: Math.max(credibility, 85),
      verdict: 'SAFE',
      reasoning: 'Contains governance/filing cues typical of legitimate disclosures (e.g., board approvals, audited results).',
      evidenceLink: 'https://www.bseindia.com/'
    }
  }

  return {
    credibilityScore: Math.round(credibility),
    verdict: 'WATCH',
    reasoning: 'No clear indicators of credibility or manipulation. Recommend checking exchange announcements for confirmation.',
    evidenceLink: 'https://www.nseindia.com/'
  }
}


