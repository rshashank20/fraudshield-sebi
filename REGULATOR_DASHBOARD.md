# Regulator Dashboard - Live Market Data Integration

## Overview
The Regulator Dashboard provides real-time fraud detection monitoring with simulated market data. This document explains how to integrate with live market data sources.

## Current Implementation
- **Simulated Data**: Uses seeded random walk for price generation
- **Real-time Flags**: Live Firestore integration for fraud detection
- **Mock Alerts**: Generated based on message volume spikes

## Live Market Data Integration

### 1. API Keys Setup

Add the following to your `.env.local` file:

```bash
# Alpha Vantage API (Free tier: 5 calls/minute, 500 calls/day)
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key_here

# Alternative: Yahoo Finance API
YAHOO_FINANCE_API_KEY=your_yahoo_finance_key_here

# Optional: Additional data sources
POLYGON_API_KEY=your_polygon_key_here
IEX_CLOUD_API_KEY=your_iex_cloud_key_here
```

### 2. API Key Sources

#### Alpha Vantage (Recommended)
- **Website**: https://www.alphavantage.co/support/#api-key
- **Free Tier**: 5 calls/minute, 500 calls/day
- **Documentation**: https://www.alphavantage.co/documentation/

#### Yahoo Finance
- **Website**: https://finance.yahoo.com/
- **API**: https://rapidapi.com/apidojo/api/yahoo-finance1/
- **Rate Limits**: Varies by plan

#### Polygon.io
- **Website**: https://polygon.io/
- **Free Tier**: 5 calls/minute
- **Real-time Data**: Available

### 3. Code Integration

#### Update CorrelationChart.tsx

Replace the `generatePriceSeries` function with real API calls:

```typescript
// components/regulator/CorrelationChart.tsx

async function fetchRealTimePrice(ticker: string, timeRange: string) {
  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${ticker}&interval=60min&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`
    )
    const data = await response.json()
    
    if (data['Error Message']) {
      throw new Error(data['Error Message'])
    }
    
    return processAlphaVantageData(data)
  } catch (error) {
    console.error('Error fetching real-time data:', error)
    // Fallback to simulated data
    return generatePriceSeries(ticker, 24)
  }
}

function processAlphaVantageData(data: any) {
  const timeSeries = data['Time Series (60min)']
  const prices = Object.values(timeSeries).map((item: any) => 
    parseFloat(item['4. close'])
  )
  return prices.slice(-24) // Last 24 hours
}
```

#### Add Rate Limiting

```typescript
// utils/rateLimiter.ts
class RateLimiter {
  private calls: number[] = []
  private maxCalls: number
  private windowMs: number

  constructor(maxCalls: number, windowMs: number) {
    this.maxCalls = maxCalls
    this.windowMs = windowMs
  }

  async waitIfNeeded() {
    const now = Date.now()
    this.calls = this.calls.filter(time => now - time < this.windowMs)
    
    if (this.calls.length >= this.maxCalls) {
      const oldestCall = Math.min(...this.calls)
      const waitTime = this.windowMs - (now - oldestCall)
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
    
    this.calls.push(now)
  }
}

// Usage
const rateLimiter = new RateLimiter(5, 60000) // 5 calls per minute
await rateLimiter.waitIfNeeded()
```

### 4. Enhanced Features

#### Real-time Price Updates
```typescript
// Add WebSocket connection for real-time updates
useEffect(() => {
  const ws = new WebSocket('wss://stream.polygon.io/stocks')
  
  ws.onopen = () => {
    ws.send(JSON.stringify({
      action: 'auth',
      params: process.env.POLYGON_API_KEY
    }))
  }
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data)
    if (data.ev === 'T') { // Trade event
      updatePrice(data.sym, data.p)
    }
  }
  
  return () => ws.close()
}, [])
```

#### Advanced Alerts
```typescript
// Enhanced alert detection
const detectAnomalies = (priceData: number[], volumeData: number[]) => {
  const alerts = []
  
  // Price spike detection
  const priceChange = (priceData[priceData.length - 1] - priceData[0]) / priceData[0]
  if (Math.abs(priceChange) > 0.1) { // 10% change
    alerts.push({
      type: 'price_spike',
      severity: 'high',
      message: `Significant price movement detected: ${(priceChange * 100).toFixed(2)}%`
    })
  }
  
  // Volume spike detection
  const avgVolume = volumeData.reduce((a, b) => a + b, 0) / volumeData.length
  const currentVolume = volumeData[volumeData.length - 1]
  if (currentVolume > avgVolume * 3) {
    alerts.push({
      type: 'volume_spike',
      severity: 'medium',
      message: `Unusual trading volume detected: ${(currentVolume / avgVolume).toFixed(1)}x average`
    })
  }
  
  return alerts
}
```

### 5. Performance Optimization

#### Caching Strategy
```typescript
// utils/cache.ts
const cache = new Map()

function getCachedData(key: string, ttl: number = 300000) { // 5 minutes
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data
  }
  return null
}

function setCachedData(key: string, data: any) {
  cache.set(key, {
    data,
    timestamp: Date.now()
  })
}
```

#### Error Handling
```typescript
// utils/errorHandler.ts
export function handleApiError(error: any, fallback: any) {
  console.error('API Error:', error)
  
  if (error.status === 429) {
    // Rate limit exceeded
    return { ...fallback, warning: 'Rate limit exceeded, using cached data' }
  }
  
  if (error.status >= 500) {
    // Server error
    return { ...fallback, warning: 'Service temporarily unavailable' }
  }
  
  return fallback
}
```

### 6. Testing

#### Mock Data for Development
```typescript
// Keep the existing generatePriceSeries function for development
const isDevelopment = process.env.NODE_ENV === 'development'
const useMockData = !process.env.ALPHA_VANTAGE_API_KEY || isDevelopment

if (useMockData) {
  return generatePriceSeries(ticker, dataPoints)
} else {
  return await fetchRealTimePrice(ticker, '24h')
}
```

## Deployment Considerations

1. **Environment Variables**: Ensure API keys are properly set in production
2. **Rate Limiting**: Implement proper rate limiting to avoid API quota exhaustion
3. **Error Handling**: Graceful fallback to simulated data when APIs are unavailable
4. **Caching**: Implement Redis or similar for production caching
5. **Monitoring**: Add logging and monitoring for API usage

## Security Notes

- Never expose API keys in client-side code
- Use server-side API routes for sensitive operations
- Implement proper authentication for the regulator dashboard
- Consider IP whitelisting for production deployment

## Support

For questions about integration or troubleshooting:
1. Check API documentation for the chosen provider
2. Verify API key permissions and rate limits
3. Test with a simple API call first
4. Monitor browser console for errors
