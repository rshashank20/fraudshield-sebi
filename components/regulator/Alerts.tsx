import { useState, useEffect } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '../../lib/firebase'

interface Alert {
  id: string
  type: 'spike' | 'anomaly' | 'pattern'
  ticker: string
  message: string
  timestamp: Date
  severity: 'low' | 'medium' | 'high'
}

interface AlertsProps {
  selectedTicker?: string | null
}

export default function Alerts({ selectedTicker }: AlertsProps) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [messageVolume, setMessageVolume] = useState<{ [key: string]: number }>({})

  useEffect(() => {
    const flagsRef = collection(db, 'flags')
    const q = query(flagsRef)

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const flags = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp
      }))

      // Calculate message volume by ticker
      const volumeByTicker: { [key: string]: number } = {}
      const now = new Date()
      const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)

      flags.forEach((flag: any) => {
        const flagTime = flag.timestamp?.toDate ? flag.timestamp.toDate() : new Date(flag.timestamp)
        if (flagTime >= last24h) {
          const text = flag.inputText || ''
          const tickerMatches = text.match(/\$?([A-Z]{2,5})\b/g)
          
          if (tickerMatches) {
            tickerMatches.forEach((match: string) => {
              const ticker = match.replace('$', '').toUpperCase()
              if (ticker.length >= 2 && ticker.length <= 5) {
                volumeByTicker[ticker] = (volumeByTicker[ticker] || 0) + 1
              }
            })
          }
        }
      })

      setMessageVolume(volumeByTicker)

      // Generate alerts based on volume spikes
      const newAlerts: Alert[] = []
      const tickers = Object.keys(volumeByTicker)
      
      if (tickers.length > 0) {
        const volumes = Object.values(volumeByTicker)
        const median = volumes.sort((a, b) => a - b)[Math.floor(volumes.length / 2)]
        const threshold = median * 3

        tickers.forEach(ticker => {
          const volume = volumeByTicker[ticker]
          if (volume > threshold) {
            const severity = volume > median * 5 ? 'high' : volume > median * 4 ? 'medium' : 'low'
            
            newAlerts.push({
              id: `spike-${ticker}-${Date.now()}`,
              type: 'spike',
              ticker,
              message: `Message volume spike detected: ${volume} messages (${Math.round((volume / median) * 100)}% above median)`,
              timestamp: new Date(),
              severity
            })
          }
        })
      }

      // Add some mock alerts for demo purposes
      if (newAlerts.length === 0 && tickers.length > 0) {
        const randomTicker = tickers[Math.floor(Math.random() * tickers.length)]
        newAlerts.push({
          id: `mock-${Date.now()}`,
          type: 'anomaly',
          ticker: randomTicker,
          message: `Unusual trading pattern detected in ${randomTicker}`,
          timestamp: new Date(),
          severity: 'medium'
        })
      }

      setAlerts(newAlerts.slice(0, 5)) // Keep only latest 5 alerts
    })

    return () => unsubscribe()
  }, [])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'spike':
        return '📈'
      case 'anomaly':
        return '⚠️'
      case 'pattern':
        return '🔍'
      default:
        return '📊'
    }
  }

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - timestamp.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return timestamp.toLocaleDateString()
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Alerts</h3>
        <p className="text-sm text-gray-500">Real-time monitoring alerts</p>
      </div>
      
      <div className="p-4">
        {alerts.length === 0 ? (
          <div className="text-center py-4">
            <div className="text-gray-400 text-2xl mb-2">✅</div>
            <p className="text-gray-500 text-sm">No alerts at this time</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}
              >
                <div className="flex items-start space-x-3">
                  <div className="text-lg">{getAlertIcon(alert.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">
                        {alert.ticker} Alert
                      </h4>
                      <span className="text-xs opacity-75">
                        {formatTimestamp(alert.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm mt-1 opacity-90">
                      {alert.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {selectedTicker && messageVolume[selectedTicker] && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-800">
              <strong>${selectedTicker}</strong> has {messageVolume[selectedTicker]} messages in the last 24h
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
