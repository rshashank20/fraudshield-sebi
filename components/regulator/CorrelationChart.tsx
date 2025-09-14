import { useState, useEffect, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { fetchRealTimePrice, isApiKeyConfigured } from '../../utils/alphaVantage'

interface ChartDataPoint {
  time: string
  messageVolume: number
  price: number
  volume?: number
}

interface CorrelationChartProps {
  selectedTicker: string | null
}

// Generate seeded random walk for price simulation
function generatePriceSeries(ticker: string, dataPoints: number): number[] {
  const seed = ticker.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
  const basePrice = 100 + (seed % 200) // Base price between 100-300
  
  const prices: number[] = [basePrice]
  let currentPrice = basePrice
  
  for (let i = 1; i < dataPoints; i++) {
    // Seeded random walk
    const random = Math.sin(seed + i) * 0.1
    const change = (Math.random() - 0.5) * 0.05 + random * 0.02
    currentPrice = currentPrice * (1 + change)
    prices.push(Math.max(currentPrice, 1)) // Prevent negative prices
  }
  
  return prices
}

export default function CorrelationChart({ selectedTicker }: CorrelationChartProps) {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [messageVolume, setMessageVolume] = useState<{ [key: string]: number }>({})
  const [loading, setLoading] = useState(false)
  const [apiStatus, setApiStatus] = useState({ configured: false, usingRealData: false })

  // Generate time series data
  const timeSeries = useMemo(() => {
    const now = new Date()
    const dataPoints = 24 // Last 24 hours
    const points: ChartDataPoint[] = []
    
    for (let i = dataPoints - 1; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000) // Hourly intervals
      const timeStr = time.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      })
      
      points.push({
        time: timeStr,
        messageVolume: 0,
        price: 0
      })
    }
    
    return points
  }, [])

  useEffect(() => {
    if (!selectedTicker) {
      setChartData([])
      return
    }

    setLoading(true)
    setApiStatus({ configured: isApiKeyConfigured(), usingRealData: false })

    // Listen to flags collection for message volume calculation
    const flagsRef = collection(db, 'flags')
    const q = query(flagsRef)

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const flags = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp
      }))

      // Calculate message volume by hour for the selected ticker
      const volumeByHour: { [key: string]: number } = {}
      const now = new Date()
      
      flags.forEach((flag: any) => {
        const text = flag.inputText || ''
        const containsTicker = text.toUpperCase().includes(selectedTicker.toUpperCase()) ||
                             text.includes(`$${selectedTicker}`)
        
        if (containsTicker) {
          const flagTime = flag.timestamp?.toDate ? flag.timestamp.toDate() : new Date(flag.timestamp)
          const hourKey = flagTime.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          })
          
          volumeByHour[hourKey] = (volumeByHour[hourKey] || 0) + 1
        }
      })

      setMessageVolume(volumeByHour)

      try {
        // Try to fetch real-time price data via API route
        const response = await fetch(`/api/market-data?ticker=${selectedTicker}`)
        const result = await response.json()
        
        if (response.ok && result.data && result.data.length > 0) {
          // Use real-time data
          const combinedData = timeSeries.map((point) => {
            const realDataPoint = result.data.find((d: any) => d.time === point.time)
            return {
              ...point,
              messageVolume: volumeByHour[point.time] || 0,
              price: realDataPoint?.price || point.price,
              volume: realDataPoint?.volume
            }
          })
          
          setChartData(combinedData)
          setApiStatus({ configured: result.apiConfigured, usingRealData: true })
        } else {
          throw new Error(result.error || 'No real-time data available')
        }
      } catch (error) {
        console.log('Falling back to simulated data:', error)
        
        // Fallback to simulated data
        const prices = generatePriceSeries(selectedTicker, timeSeries.length)
        const combinedData = timeSeries.map((point, index) => ({
          ...point,
          messageVolume: volumeByHour[point.time] || 0,
          price: prices[index] || 100
        }))

        setChartData(combinedData)
        setApiStatus({ configured: isApiKeyConfigured(), usingRealData: false })
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [selectedTicker, timeSeries])

  if (!selectedTicker) {
    return (
      <div className="bg-white rounded-xl shadow-md border border-gray-200 h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-4xl mb-2">📊</div>
          <p className="text-gray-500">Select a ticker from the feed to view correlation</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md border border-gray-200 h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Correlation Analysis</h3>
            <p className="text-sm text-gray-500">${selectedTicker} - Message Volume vs Price</p>
          </div>
          <div className="flex items-center space-x-2">
            {apiStatus.configured && (
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                apiStatus.usingRealData 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {apiStatus.usingRealData ? 'Live Data' : 'Simulated'}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex-1 p-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              yAxisId="volume"
              orientation="left"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              yAxisId="price"
              orientation="right"
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              formatter={(value, name) => [
                name === 'messageVolume' ? `${value} messages` : `$${Number(value).toFixed(2)}`,
                name === 'messageVolume' ? 'Message Volume' : 'Price'
              ]}
              labelFormatter={(label) => `Time: ${label}`}
            />
            <Line
              yAxisId="volume"
              type="monotone"
              dataKey="messageVolume"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={{ r: 3 }}
              name="messageVolume"
            />
            <Line
              yAxisId="price"
              type="monotone"
              dataKey="price"
              stroke="#EF4444"
              strokeWidth={2}
              dot={{ r: 3 }}
              name="price"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-gray-600">Message Volume</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-gray-600">Price</span>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            Last 24 hours
          </div>
        </div>
      </div>
    </div>
  )
}
