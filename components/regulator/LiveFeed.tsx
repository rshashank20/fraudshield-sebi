import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { db } from '../../lib/firebase'

interface Flag {
  id: string
  inputText: string
  verdict: string
  confidence: number
  timestamp: any
  fileName?: string
  fileType?: string
}

interface LiveFeedProps {
  onFlagSelect: (flag: Flag) => void
  selectedFlagId?: string
}

const platforms = ['Twitter', 'Telegram', 'Reddit', 'WhatsApp', 'Email', 'Phone Call']
const tickers = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'META', 'NVDA', 'NFLX', 'BTC', 'ETH']

export default function LiveFeed({ onFlagSelect, selectedFlagId }: LiveFeedProps) {
  const [flags, setFlags] = useState<Flag[]>([])
  const [loading, setLoading] = useState(true)
  const feedRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const flagsRef = collection(db, 'flags')
    const q = query(flagsRef, orderBy('timestamp', 'desc'), limit(50))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const flagsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp
      })) as Flag[]

      setFlags(flagsData)
      setLoading(false)

      // Auto-scroll to top when new items arrive
      if (feedRef.current) {
        feedRef.current.scrollTop = 0
      }
    })

    return () => unsubscribe()
  }, [])

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

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return 'N/A'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return date.toLocaleDateString()
  }

  const extractTicker = (text: string) => {
    const tickerMatch = text.match(/\$?([A-Z]{2,5})\b/)
    return tickerMatch ? tickerMatch[1] : null
  }

  const getRandomPlatform = (flagId: string) => {
    // Use flag ID to generate consistent "random" platform
    const hash = flagId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0)
    return platforms[Math.abs(hash) % platforms.length]
  }

  const truncateText = (text: string, maxLength: number = 120) => {
    if (!text) return 'No content'
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md border border-gray-200 h-full">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Live Feed</h3>
        </div>
        <div className="p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Live Feed</h3>
        <p className="text-sm text-gray-500">Real-time fraud detection alerts</p>
      </div>
      
      <div 
        ref={feedRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
        {flags.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-2">📊</div>
            <p className="text-gray-500">No flags detected yet</p>
          </div>
        ) : (
          flags.map((flag) => {
            const ticker = extractTicker(flag.inputText)
            const platform = getRandomPlatform(flag.id)
            const isSelected = selectedFlagId === flag.id

            return (
              <div
                key={flag.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => onFlagSelect(flag)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">{formatTimestamp(flag.timestamp)}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {platform}
                    </span>
                    {ticker && (
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                        ${ticker}
                      </span>
                    )}
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getVerdictBadgeClass(flag.verdict)}`}>
                    {flag.verdict}
                  </span>
                </div>
                
                <p className="text-sm text-gray-700 mb-2">
                  {truncateText(flag.inputText)}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">
                      {flag.fileName ? `File: ${flag.fileName}` : 'Text Input'}
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">
                      {flag.confidence}% confidence
                    </span>
                  </div>
                  <Link
                    href={`/dashboard/flag/${flag.id}`}
                    className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Investigate
                  </Link>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
