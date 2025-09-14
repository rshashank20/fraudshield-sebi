import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { doc, getDoc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore'
import { db } from '../../../lib/firebase'

interface Flag {
  id: string
  inputText: string
  inputType: string
  verdict: string
  confidence: number
  reasons: string[]
  evidence: string[]
  timestamp: any
  status?: string
  audit?: Array<{
    action: string
    actor: string
    ts: any
  }>
}

export default function FlagDetails() {
  const [flag, setFlag] = useState<Flag | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)
  const [showConfirmModal, setShowConfirmModal] = useState<string | null>(null)
  const router = useRouter()
  const { id: flagId } = router.query

  useEffect(() => {
    if (flagId && typeof flagId === 'string') {
      fetchFlag(flagId)
    }
    
    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (loading) {
        setError('Request timed out. Please try again.')
        setLoading(false)
      }
    }, 10000) // 10 second timeout
    
    return () => clearTimeout(timeout)
  }, [flagId, loading])

  const fetchFlag = async (flagId: string) => {
    try {
      console.log('Fetching flag with ID:', flagId)
      const flagRef = doc(db, 'flags', flagId)
      const flagSnap = await getDoc(flagRef)
      
      console.log('Flag snapshot:', flagSnap.exists())
      
      if (flagSnap.exists()) {
        const data = flagSnap.data()
        console.log('Flag data:', data)
        setFlag({
          id: flagSnap.id,
          status: 'pending', // Default status
          ...data
        } as Flag)
      } else {
        console.log('Flag not found in Firestore')
        setError('Flag not found')
      }
    } catch (err) {
      console.error('Error fetching flag:', err)
      setError(`Failed to fetch flag details: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleTriageAction = async (action: string) => {
    if (!flag) return

    setUpdating(action)
    try {
      const flagRef = doc(db, 'flags', flag.id)
      
      await updateDoc(flagRef, {
        status: action === 'fraud' ? 'fraud' : action === 'false_alarm' ? 'false_alarm' : 'more_info',
        updatedAt: serverTimestamp(),
        audit: arrayUnion({
          action,
          actor: 'regulator_demo',
          ts: serverTimestamp()
        })
      })

      // Update local state
      setFlag(prev => prev ? {
        ...prev,
        status: action === 'fraud' ? 'fraud' : action === 'false_alarm' ? 'false_alarm' : 'more_info',
        audit: [
          ...(prev.audit || []),
          {
            action,
            actor: 'regulator_demo',
            ts: new Date()
          }
        ]
      } : null)

      setShowConfirmModal(null)
    } catch (err) {
      console.error('Error updating flag:', err)
      alert('Failed to update flag. Please try again.')
    } finally {
      setUpdating(null)
    }
  }

  const getVerdictBadgeClass = (verdict: string) => {
    switch (verdict) {
      case 'HIGH RISK':
        return 'bg-red-100 text-red-800'
      case 'WATCH':
        return 'bg-yellow-100 text-yellow-800'
      case 'LIKELY SAFE':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusBadgeClass = (status?: string) => {
    switch (status) {
      case 'fraud':
        return 'bg-red-100 text-red-800'
      case 'false_alarm':
        return 'bg-green-100 text-green-800'
      case 'more_info':
        return 'bg-yellow-100 text-yellow-800'
      case 'pending':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return 'N/A'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading flag details...</p>
        </div>
      </div>
    )
  }

  if (error || !flag) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Flag not found'}</p>
          <Link href="/dashboard" className="btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Flag Details - FraudShield SEBI</title>
        <meta name="description" content="Flag details and triage" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link href="/" className="text-2xl font-bold text-blue-600">
                  FraudShield SEBI
                </Link>
                <span className="ml-4 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                  Flag Details
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                  Dashboard
                </Link>
                <Link href="/verify" className="text-gray-600 hover:text-gray-900">
                  Verify
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Flag Details
                </h1>
                <p className="text-gray-600">
                  Flag ID: {flag.id}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getVerdictBadgeClass(flag.verdict)}`}>
                  {flag.verdict}
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(flag.status)}`}>
                  {(flag.status || 'pending').replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Flag Content */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Input Content</h2>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-gray-800 whitespace-pre-wrap">{flag.inputText}</p>
              <div className="mt-2 text-sm text-gray-500">
                Type: {flag.inputType} | Confidence: {flag.confidence}%
              </div>
            </div>

            {/* Reasons */}
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Analysis Reasons</h3>
            <ul className="space-y-2 mb-6">
              {flag.reasons.map((reason, index) => (
                <li key={index} className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-gray-700">{reason}</span>
                </li>
              ))}
            </ul>

            {/* Evidence */}
            {flag.evidence && flag.evidence.length > 0 && (
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Evidence & References</h3>
                <ul className="space-y-2 mb-6">
                  {flag.evidence.map((evidence, index) => (
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
              </>
            )}

            {/* Timestamp */}
            <div className="text-sm text-gray-500">
              Submitted: {formatTimestamp(flag.timestamp)}
            </div>
          </div>

          {/* Triage Actions */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Triage Actions</h2>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setShowConfirmModal('fraud')}
                disabled={updating !== null}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating === 'fraud' ? 'Updating...' : 'Mark Fraud'}
              </button>
              
              <button
                onClick={() => setShowConfirmModal('false_alarm')}
                disabled={updating !== null}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating === 'false_alarm' ? 'Updating...' : 'Mark False Alarm'}
              </button>
              
              <button
                onClick={() => setShowConfirmModal('more_info')}
                disabled={updating !== null}
                className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating === 'more_info' ? 'Updating...' : 'Request More Info'}
              </button>
            </div>
          </div>

          {/* Audit Trail */}
          {flag.audit && flag.audit.length > 0 && (
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Audit Trail</h2>
              <div className="space-y-3">
                {flag.audit.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div>
                      <span className="font-medium text-gray-900">{entry.action.replace('_', ' ').toUpperCase()}</span>
                      <span className="text-gray-500 ml-2">by {entry.actor}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatTimestamp(entry.ts)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Confirm Action
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to mark this flag as <strong>{showConfirmModal.replace('_', ' ')}</strong>?
                This action will be recorded in the audit trail.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleTriageAction(showConfirmModal)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setShowConfirmModal(null)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-2 px-4 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

