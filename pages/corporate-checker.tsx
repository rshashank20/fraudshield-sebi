import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'

interface AnalysisResult {
  credibility: number
  verdict: 'HIGH RISK' | 'WATCH' | 'SAFE'
  reasoning: string
  evidence?: { label: string; url?: string; snippet?: string }[]
}

export default function CorporateAnnouncementChecker() {
  const [text, setText] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Platform verification state
  const [platformName, setPlatformName] = useState('')
  const [platformSubmitting, setPlatformSubmitting] = useState(false)
  const [platformError, setPlatformError] = useState<string | null>(null)
  const [platformResult, setPlatformResult] = useState<{
    confidenceScore: number
    verdict: 'HIGH RISK' | 'WATCH' | 'SAFE'
    reasoning: string
    evidenceLink?: string
  } | null>(null)

  // Ingestion preview state
  const [loadingFeed, setLoadingFeed] = useState(false)
  const [feedError, setFeedError] = useState<string | null>(null)
  const [feedItems, setFeedItems] = useState<Array<{ title: string; link?: string; published?: string; verdict?: string; credibility?: number }>>([])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null
    setFile(selected)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setResult(null)
    try {
      const body = {
        text: text?.trim() || undefined,
        fileName: file?.name
      }
      const res = await fetch('/api/corporate-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      if (!res.ok) throw new Error('Failed to analyze announcement')
      const data = await res.json()
      setResult(data)
    } catch (err: any) {
      // Fallback: show a neutral WATCH result so the user sees output
      setResult({
        credibility: 50,
        verdict: 'WATCH',
        reasoning: 'Service temporarily unavailable. Showing fallback assessment. Please retry.',
        evidence: [{ label: 'Exchange Filings', url: 'https://www.nseindia.com/' }]
      } as any)
      setError(err?.message || 'Unknown error')
    } finally {
      setSubmitting(false)
    }
  }

  const handlePlatformVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setPlatformSubmitting(true)
    setPlatformError(null)
    setPlatformResult(null)
    try {
      const res = await fetch('/api/verify-platform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: platformName })
      })
      if (!res.ok) throw new Error('Failed to verify platform')
      const data = await res.json()
      setPlatformResult(data)
    } catch (err: any) {
      setPlatformError(err?.message || 'Unknown error')
    } finally {
      setPlatformSubmitting(false)
    }
  }

  const getVerdictBadgeClass = (verdict: string) => {
    switch (verdict) {
      case 'HIGH RISK':
        return 'bg-red-100 text-red-800'
      case 'WATCH':
        return 'bg-yellow-100 text-yellow-800'
      case 'SAFE':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const fetchBseLatest = async () => {
    setLoadingFeed(true)
    setFeedError(null)
    setFeedItems([])
    try {
      const resp = await fetch('/api/bse-latest')
      const data = await resp.json()
      const items = Array.isArray(data.items) ? data.items.slice(0, 10) : []
      // Analyze top few using our endpoint
      const analyzed = await Promise.all(
        items.map(async (it: any) => {
          try {
            const r = await fetch('/api/corporate-check', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text: it.title })
            })
            const resJson = await r.json()
            return { ...it, verdict: resJson?.verdict, credibility: resJson?.credibility }
          } catch {
            return { ...it }
          }
        })
      )
      setFeedItems(analyzed)
    } catch (e: any) {
      setFeedError(e?.message || 'Failed to fetch feed')
    } finally {
      setLoadingFeed(false)
    }
  }

  return (
    <>
      <Head>
        <title>Corporate Credibility Checker - FraudShield SEBI</title>
        <meta name="description" content="Analyze corporate announcements and verify platforms for credibility and risk" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link href="/" className="text-2xl font-bold text-primary-600">
                  FraudShield SEBI
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">Credibility Checker</span>
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                  Admin Dashboard
                </Link>
                <Link href="/regulator" className="text-gray-600 hover:text-gray-900">
                  Live Monitor
                </Link>
                <Link href="/results-dashboard" className="text-gray-600 hover:text-gray-900">
                  File Results
                </Link>
                <Link href="/verify" className="text-gray-600 hover:text-gray-900">
                  Verify
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Corporate Credibility Checker</h1>
            <p className="text-gray-600">Analyze corporate disclosures and verify platforms for legitimacy and risk.</p>
          </div>

          {/* Input Card */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Announcement Text</label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[140px]"
                  placeholder="Paste corporate announcement here..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Document (PDF/DOCX)</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
                {file && (
                  <p className="text-xs text-gray-500 mt-1">Selected: {file.name}</p>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg"
                >
                  {submitting ? 'Analyzing...' : 'Analyze Announcement'}
                </button>
                <button
                  type="button"
                  className="text-sm text-gray-500 hover:text-gray-700"
                  onClick={() => { setText(''); setFile(null); setResult(null); setError(null) }}
                >
                  Reset
                </button>
              </div>
            </form>
            {error && (
              <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-800 text-sm">{error}</div>
            )}
          </div>

          {/* Result Card */}
          {result && (
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Analysis Result</h2>
                  <p className="text-sm text-gray-500">AI-style mock analysis based on sample announcements</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getVerdictBadgeClass(result.verdict)}`}>
                  {result.verdict}
                </span>
              </div>

              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      result.credibility >= 70 ? 'bg-green-500' : result.credibility >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${result.credibility}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Credibility: {result.credibility}%</p>
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-1">Reasoning</h3>
                <p className="text-gray-700 text-sm">{result.reasoning}</p>
              </div>

              {result.evidence && result.evidence.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Evidence</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    {result.evidence.map((e, i) => (
                      <li key={i}>
                        {e.url ? (
                          <a href={e.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                            {e.label}
                          </a>
                        ) : (
                          <span className="font-medium">{e.label}</span>
                        )}
                        {e.snippet && <span className="text-gray-500 ml-2">— {e.snippet}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Platform/App Verification */}
          <div className="mt-12">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-900">App/Website Verification</h2>
              <p className="text-gray-600">Check if a platform name appears legitimate or risky.</p>
            </div>

            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
              <form onSubmit={handlePlatformVerify} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Platform Name</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., TrustTrade Pro, Zerodha, QuickProfit App"
                    value={platformName}
                    onChange={(e) => setPlatformName(e.target.value)}
                  />
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    type="submit"
                    disabled={platformSubmitting}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg"
                  >
                    {platformSubmitting ? 'Verifying...' : 'Verify Platform'}
                  </button>
                  <button
                    type="button"
                    className="text-sm text-gray-500 hover:text-gray-700"
                    onClick={() => { setPlatformName(''); setPlatformResult(null); setPlatformError(null) }}
                  >
                    Reset
                  </button>
                </div>
              </form>
              {platformError && (
                <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-800 text-sm">{platformError}</div>
              )}
            </div>

            {platformResult && (
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Verification Result</h3>
                    <p className="text-sm text-gray-500">Keyword-based mock verification</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getVerdictBadgeClass(platformResult.verdict)}`}>
                    {platformResult.verdict}
                  </span>
                </div>

                <div className="mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        platformResult.confidenceScore >= 70 ? 'bg-green-500' : platformResult.confidenceScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${platformResult.confidenceScore}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Confidence: {platformResult.confidenceScore}%</p>
                </div>

                <div className="mb-2">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Reasoning</h4>
                  <p className="text-gray-700 text-sm">{platformResult.reasoning}</p>
                </div>

                {platformResult.evidenceLink && (
                  <a
                    href={platformResult.evidenceLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm underline"
                  >
                    View Evidence
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Ingestion Preview */}
          <div className="mt-12">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Exchange Ingestion Preview</h2>
              <p className="text-gray-600">Fetch latest BSE announcements and auto-tag with a preliminary credibility verdict.</p>
            </div>

            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
              <div className="flex items-center space-x-3">
                <button
                  onClick={fetchBseLatest}
                  disabled={loadingFeed}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg"
                >
                  {loadingFeed ? 'Fetching…' : 'Fetch Latest BSE Announcements'}
                </button>
                {feedError && <span className="text-sm text-red-600">{feedError}</span>}
              </div>
            </div>

            {feedItems.length > 0 && (
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Recent Announcements</h3>
                <ul className="space-y-3">
                  {feedItems.map((it, idx) => (
                    <li key={idx} className="border border-gray-100 rounded-lg p-3 flex items-start justify-between">
                      <div>
                        <div className="text-sm text-gray-900">{it.title || 'Untitled'}</div>
                        <div className="text-xs text-gray-500">{it.published || ''}</div>
                        {it.link && (
                          <a href={it.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 underline">View Source</a>
                        )}
                      </div>
                      {it.verdict && (
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVerdictBadgeClass(it.verdict)}`}>{it.verdict}</span>
                          {typeof it.credibility === 'number' && (
                            <div className="text-xs text-gray-500 mt-1">Cred: {Math.round(it.credibility)}%</div>
                          )}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  )
}


