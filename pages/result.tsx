import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'

interface VerdictResult {
  verdict: 'HIGH RISK' | 'WATCH' | 'LIKELY SAFE'
  confidence: number
  reasons: string[]
  evidence: string[]
  flagId?: string
  inputText: string
  inputType: string
}

export default function Result() {
  const [result, setResult] = useState<VerdictResult | null>(null)
  const [isReporting, setIsReporting] = useState(false)
  const [reportSubmitted, setReportSubmitted] = useState(false)
  const [reportId, setReportId] = useState<string | null>(null)
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Get result from sessionStorage
    const storedResult = sessionStorage.getItem('verdictResult')
    if (storedResult) {
      try {
        const parsedResult = JSON.parse(storedResult)
        console.log('Loaded result from sessionStorage:', parsedResult)
        
        // Ensure all required fields exist
        if (parsedResult.inputText && parsedResult.verdict) {
          setResult(parsedResult)
        } else {
          console.error('Invalid result data:', parsedResult)
          router.push('/verify')
        }
      } catch (error) {
        console.error('Error parsing stored result:', error)
        router.push('/verify')
      }
    } else {
      // If no result, redirect to verify page
      router.push('/verify')
    }
  }, [router])

  const handleReport = async () => {
    if (!result) {
      alert('No result data available. Please try the verification again.')
      return
    }

    // Validate required fields before sending
    if (!result.inputText || !result.verdict) {
      alert('Invalid result data. Please try the verification again.')
      return
    }

    setIsReporting(true)
    try {
      // Debug: Log the data being sent
      const reportData = {
        flagId: result.flagId,
        inputText: result.inputText,
        verdict: result.verdict,
        confidence: result.confidence || 0,
        reasons: result.reasons || [],
        evidence: result.evidence || [],
        anonymous: true,
      }
      
      console.log('Sending report data:', reportData)

      const response = await fetch('/api/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      })

      console.log('Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Report response:', data)
        setReportId(data.flagId)
        setReportSubmitted(true)
        setShowSuccessToast(true)
        
        // Auto-hide toast after 5 seconds
        setTimeout(() => setShowSuccessToast(false), 5000)
      } else {
        const errorData = await response.json()
        console.error('API Error:', errorData)
        throw new Error(errorData.error || 'Failed to submit report')
      }
    } catch (error) {
      console.error('Error reporting:', error)
      alert(`Failed to submit report: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsReporting(false)
    }
  }

  const getVerdictBadgeClass = (verdict: string) => {
    switch (verdict) {
      case 'HIGH RISK':
        return 'bg-red-100 text-red-800 px-4 py-2 rounded-full text-lg font-semibold'
      case 'WATCH':
        return 'bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-lg font-semibold'
      case 'LIKELY SAFE':
        return 'bg-green-100 text-green-800 px-4 py-2 rounded-full text-lg font-semibold'
      default:
        return 'bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-lg font-semibold'
    }
  }

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case 'HIGH RISK':
        return '🚨'
      case 'WATCH':
        return '⚠️'
      case 'LIKELY SAFE':
        return '✅'
      default:
        return '❓'
    }
  }

  if (!result) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Analysis Result - FraudShield SEBI</title>
        <meta name="description" content="View your fraud analysis results" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link href="/" className="text-2xl font-bold text-blue-600">
                  FraudShield SEBI
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                <Link href="/verify" className="text-gray-600 hover:text-gray-900">
                  New Analysis
                </Link>
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                  Dashboard
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Analysis Complete
            </h1>
            <p className="text-gray-600">
              Here are the results of your {result.inputType} analysis
            </p>
          </div>

          {/* Verdict Card */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 mb-8">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">
                {getVerdictIcon(result.verdict)}
              </div>
              <div className={getVerdictBadgeClass(result.verdict)}>
                {result.verdict}
              </div>
              <div className="mt-4">
                <span className="text-2xl font-bold text-gray-900">
                  {result.confidence}%
                </span>
                <span className="text-gray-600 ml-2">Confidence</span>
              </div>
            </div>

            {/* Input Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-700 mb-2">Analyzed Content:</h3>
              <p className="text-gray-600 text-sm">
                {result.inputText && result.inputText.length > 200 
                  ? `${result.inputText.substring(0, 200)}...` 
                  : result.inputText || 'No content provided'
                }
              </p>
            </div>

            {/* Reasons */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Key Findings:
              </h3>
              <ul className="space-y-3">
                {(result.reasons || []).map((reason, index) => (
                  <li key={index} className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">
                      {index + 1}
                    </span>
                    <span className="text-gray-700">{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Evidence Links */}
            {result.evidence && result.evidence.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Evidence & References:
                </h3>
                <ul className="space-y-2">
                  {(result.evidence || []).map((evidence, index) => (
                    <li key={index} className="flex items-center">
                      <span className="text-blue-600 mr-2">🔗</span>
                      <a 
                        href={evidence} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 underline text-sm"
                      >
                        {evidence}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <Link href="/verify" className="flex-1">
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg w-full">
                  Analyze Another
                </button>
              </Link>
              
              {result.flagId && (
                <button
                  onClick={handleReport}
                  disabled={isReporting || reportSubmitted}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {reportSubmitted ? (
                    <span className="flex items-center justify-center">
                      ✓ Reported
                    </span>
                  ) : isReporting ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Reporting...
                    </span>
                  ) : (
                    'Report to SEBI'
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                📊 What This Means
              </h3>
              <div className="text-sm text-gray-600 space-y-2">
                {result.verdict === 'HIGH RISK' && (
                  <>
                    <p>• <strong>High Risk:</strong> Strong indicators of potential fraud or unregistered activity</p>
                    <p>• Avoid this advisor or investment opportunity</p>
                    <p>• Consider reporting to SEBI immediately</p>
                  </>
                )}
                {result.verdict === 'WATCH' && (
                  <>
                    <p>• <strong>Watch:</strong> Some concerning indicators but not definitive</p>
                    <p>• Proceed with extreme caution</p>
                    <p>• Verify additional credentials independently</p>
                  </>
                )}
                {result.verdict === 'LIKELY SAFE' && (
                  <>
                    <p>• <strong>Likely Safe:</strong> No major red flags detected</p>
                    <p>• Still verify credentials independently</p>
                    <p>• Always do your own research</p>
                  </>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                🛡️ Next Steps
              </h3>
              <div className="text-sm text-gray-600 space-y-2">
                <p>• Verify SEBI registration independently</p>
                <p>• Check advisor&apos;s disciplinary history</p>
                <p>• Research the company or individual</p>
                <p>• Consult with other financial professionals</p>
                <p>• Trust your instincts and be cautious</p>
              </div>
            </div>
          </div>
        </main>

        {/* Success Toast */}
        {showSuccessToast && (
          <div className="fixed top-4 right-4 z-50">
            <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-4">
              <div className="text-2xl">✅</div>
              <div>
                <div className="font-semibold">Report Submitted Successfully!</div>
                <div className="text-sm opacity-90">Report ID: {reportId}</div>
                <div className="mt-2">
                  <Link 
                    href={`/dashboard#flag-${reportId}`}
                    className="text-sm underline hover:no-underline"
                  >
                    View in Dashboard
                  </Link>
                </div>
              </div>
              <button
                onClick={() => setShowSuccessToast(false)}
                className="text-white hover:text-gray-200 ml-4"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
