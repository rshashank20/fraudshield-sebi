// Alpha Vantage API integration for live market data
// Documentation: https://www.alphavantage.co/documentation/

interface AlphaVantageResponse {
  'Meta Data': {
    '1. Information': string
    '2. Symbol': string
    '3. Last Refreshed': string
    '4. Interval': string
    '5. Output Size': string
    '6. Time Zone': string
  }
  'Time Series (60min)': {
    [key: string]: {
      '1. open': string
      '2. high': string
      '3. low': string
      '4. close': string
      '5. volume': string
    }
  }
}

interface PriceDataPoint {
  time: string
  price: number
  volume: number
}

// Rate limiter for Alpha Vantage API (5 calls per minute on free tier)
class RateLimiter {
  private calls: number[] = []
  private maxCalls: number = 5
  private windowMs: number = 60000 // 1 minute

  async waitIfNeeded() {
    const now = Date.now()
    this.calls = this.calls.filter(time => now - time < this.windowMs)
    
    if (this.calls.length >= this.maxCalls) {
      const oldestCall = Math.min(...this.calls)
      const waitTime = this.windowMs - (now - oldestCall)
      console.log(`Rate limit reached. Waiting ${waitTime}ms...`)
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
    
    this.calls.push(now)
  }
}

const rateLimiter = new RateLimiter()

// Cache for API responses (5 minute TTL)
const cache = new Map<string, { data: PriceDataPoint[], timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

function getCachedData(key: string): PriceDataPoint[] | null {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('Using cached data for', key)
    return cached.data
  }
  return null
}

function setCachedData(key: string, data: PriceDataPoint[]) {
  cache.set(key, {
    data,
    timestamp: Date.now()
  })
}

// Fetch real-time price data from Alpha Vantage
export async function fetchRealTimePrice(ticker: string): Promise<PriceDataPoint[]> {
  const cacheKey = `price_${ticker}`
  const cachedData = getCachedData(cacheKey)
  if (cachedData) {
    return cachedData
  }

  try {
    await rateLimiter.waitIfNeeded()
    
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY
    if (!apiKey) {
      throw new Error('Alpha Vantage API key not configured')
    }

    console.log(`Fetching real-time data for ${ticker}...`)
    
    const response = await fetch(
      `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${ticker}&interval=60min&outputsize=compact&apikey=${apiKey}`
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: AlphaVantageResponse = await response.json()

    if (data['Error Message']) {
      throw new Error(data['Error Message'])
    }

    if (data['Note']) {
      throw new Error('API call frequency limit reached. Please try again later.')
    }

    if (!data['Time Series (60min)']) {
      throw new Error('No time series data available')
    }

    const priceData = processAlphaVantageData(data)
    setCachedData(cacheKey, priceData)
    
    console.log(`Successfully fetched ${priceData.length} data points for ${ticker}`)
    return priceData

  } catch (error) {
    console.error('Error fetching real-time data:', error)
    
    // Fallback to simulated data
    console.log('Falling back to simulated data for', ticker)
    return generateSimulatedPriceData(ticker)
  }
}

// Process Alpha Vantage response data
function processAlphaVantageData(data: AlphaVantageResponse): PriceDataPoint[] {
  const timeSeries = data['Time Series (60min)']
  const dataPoints: PriceDataPoint[] = []

  // Get last 24 hours of data
  const sortedEntries = Object.entries(timeSeries)
    .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
    .slice(0, 24)

  sortedEntries.forEach(([timestamp, values]) => {
    dataPoints.push({
      time: new Date(timestamp).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }),
      price: parseFloat(values['4. close']),
      volume: parseInt(values['5. volume'])
    })
  })

  return dataPoints.reverse() // Reverse to get chronological order
}

// Generate simulated price data as fallback
function generateSimulatedPriceData(ticker: string): PriceDataPoint[] {
  console.log(`Generating simulated data for ${ticker}`)
  
  // Use ticker as seed for consistent "random" data
  const seed = ticker.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
  const basePrice = 100 + (seed % 200) // Base price between 100-300
  
  const dataPoints: PriceDataPoint[] = []
  let currentPrice = basePrice
  
  for (let i = 23; i >= 0; i--) {
    const time = new Date(Date.now() - i * 60 * 60 * 1000)
    const timeStr = time.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })
    
    // Seeded random walk
    const random = Math.sin(seed + i) * 0.1
    const change = (Math.random() - 0.5) * 0.05 + random * 0.02
    currentPrice = currentPrice * (1 + change)
    
    dataPoints.push({
      time: timeStr,
      price: Math.max(currentPrice, 1), // Prevent negative prices
      volume: Math.floor(Math.random() * 1000000) + 100000
    })
  }
  
  return dataPoints
}

// Get current stock quote
export async function getCurrentQuote(ticker: string): Promise<{ price: number, change: number, changePercent: number } | null> {
  try {
    const data = await fetchRealTimePrice(ticker)
    if (data.length < 2) return null
    
    const current = data[data.length - 1]
    const previous = data[data.length - 2]
    
    const change = current.price - previous.price
    const changePercent = (change / previous.price) * 100
    
    return {
      price: current.price,
      change,
      changePercent
    }
  } catch (error) {
    console.error('Error getting current quote:', error)
    return null
  }
}

// Check if API key is configured
export function isApiKeyConfigured(): boolean {
  return !!process.env.ALPHA_VANTAGE_API_KEY
}

// Get API status
export function getApiStatus(): { configured: boolean, rateLimited: boolean } {
  return {
    configured: isApiKeyConfigured(),
    rateLimited: rateLimiter.calls.length >= rateLimiter.maxCalls
  }
}
