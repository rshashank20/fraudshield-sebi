import { useState, useEffect } from 'react'
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore'
import { db } from '../../lib/firebase'

interface KPIData {
  totalFlags: number
  flagsLast24h: number
  highRiskLast24h: number
  topTicker: string
}

interface KPICardsProps {
  onTickerSelect?: (ticker: string) => void
}

export default function KPICards({ onTickerSelect }: KPICardsProps) {
  const [kpiData, setKpiData] = useState<KPIData>({
    totalFlags: 0,
    flagsLast24h: 0,
    highRiskLast24h: 0,
    topTicker: 'N/A'
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const flagsRef = collection(db, 'flags')
    const q = query(flagsRef)

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const now = new Date()
      const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      
      const allFlags = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp
      }))

      // Calculate KPIs
      const totalFlags = allFlags.length
      
      const flagsLast24h = allFlags.filter(flag => {
        const flagTime = flag.timestamp?.toDate ? flag.timestamp.toDate() : new Date(flag.timestamp)
        return flagTime >= last24h
      }).length

      const highRiskLast24h = allFlags.filter((flag: any) => {
        const flagTime = flag.timestamp?.toDate ? flag.timestamp.toDate() : new Date(flag.timestamp)
        return flagTime >= last24h && flag.verdict === 'HIGH RISK'
      }).length

      // Extract tickers from inputText (look for patterns like $AAPL, AAPL, etc.)
      const tickerCounts: { [key: string]: number } = {}
      allFlags.forEach((flag: any) => {
        const text = flag.inputText || ''
        const tickerMatches = text.match(/\$?([A-Z]{1,5})\b/g)
        if (tickerMatches) {
          tickerMatches.forEach((match: string) => {
            const ticker = match.replace('$', '').toUpperCase()
            if (ticker.length >= 2 && ticker.length <= 5) {
              tickerCounts[ticker] = (tickerCounts[ticker] || 0) + 1
            }
          })
        }
      })

      const topTicker = Object.keys(tickerCounts).length > 0 
        ? Object.keys(tickerCounts).reduce((a, b) => tickerCounts[a] > tickerCounts[b] ? a : b)
        : 'N/A'

      setKpiData({
        totalFlags,
        flagsLast24h,
        highRiskLast24h,
        topTicker
      })
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-md border border-gray-200 p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total Flags */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 text-xl">📊</span>
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Total Flags</p>
            <p className="text-2xl font-bold text-gray-900">{kpiData.totalFlags}</p>
          </div>
        </div>
      </div>

      {/* Flags Last 24h */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 text-xl">⏰</span>
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Last 24h</p>
            <p className="text-2xl font-bold text-gray-900">{kpiData.flagsLast24h}</p>
          </div>
        </div>
      </div>

      {/* High Risk Last 24h */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-red-600 text-xl">⚠️</span>
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">High Risk (24h)</p>
            <p className="text-2xl font-bold text-gray-900">{kpiData.highRiskLast24h}</p>
          </div>
        </div>
      </div>

      {/* Top Ticker */}
      <div 
        className="bg-white rounded-xl shadow-md border border-gray-200 p-6 cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => onTickerSelect?.(kpiData.topTicker)}
      >
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-purple-600 text-xl">📈</span>
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Top Ticker</p>
            <p className="text-2xl font-bold text-gray-900">{kpiData.topTicker}</p>
            {kpiData.topTicker !== 'N/A' && (
              <p className="text-xs text-gray-500">Click to analyze</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
