export type PlatformVerdict = 'HIGH RISK' | 'WATCH' | 'SAFE'

export interface PlatformVerificationResult {
  confidenceScore: number
  verdict: PlatformVerdict
  reasoning: string
  evidenceLink: string
}

const HIGH_RISK_KEYWORDS = [
  'trusttrade pro',
  'quickprofit app',
  'investmax123'
]

const SAFE_KEYWORDS = [
  'zerodha',
  'upstox',
  'groww'
]

function includesAny(haystack: string, needles: string[]): boolean {
  const h = haystack.toLowerCase()
  return needles.some(n => h.includes(n))
}

export function verifyAppOrWebsite(name: string): PlatformVerificationResult {
  const normalized = (name || '').trim()

  if (normalized.length === 0) {
    return {
      confidenceScore: 50,
      verdict: 'WATCH',
      reasoning: 'No name provided. Further verification needed against official app stores and SEBI investor alerts.',
      evidenceLink: 'https://www.sebi.gov.in/'
    }
  }

  if (includesAny(normalized, HIGH_RISK_KEYWORDS)) {
    // Score in ~20–30 range; add slight deterministic jitter from length
    const base = 25
    const jitter = (normalized.length % 11) - 5 // -5..+5
    const score = Math.max(20, Math.min(30, base + jitter))
    return {
      confidenceScore: score,
      verdict: 'HIGH RISK',
      reasoning: 'Name resembles common fake platforms attempting to impersonate legitimate brokers; likely unregistered and risky.',
      evidenceLink: 'https://www.sebi.gov.in/investors.html'
    }
  }

  if (includesAny(normalized, SAFE_KEYWORDS)) {
    return {
      confidenceScore: 90,
      verdict: 'SAFE',
      reasoning: 'Recognized, registered platform with established presence in India; matches legitimate broker names.',
      evidenceLink: 'https://www.nseindia.com/market-data/sebi-registered-intermediaries'
    }
  }

  return {
    confidenceScore: 50,
    verdict: 'WATCH',
    reasoning: 'Unable to confirm legitimacy from name alone. Recommend checking official broker lists and app store publisher details.',
    evidenceLink: 'https://www.sebi.gov.in/'
  }
}


