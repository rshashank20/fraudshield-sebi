import { NextApiRequest, NextApiResponse } from 'next'
import { fetchRealTimePrice, getCurrentQuote, isApiKeyConfigured } from '../../utils/alphaVantage'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { ticker, action } = req.query

  if (!ticker || typeof ticker !== 'string') {
    return res.status(400).json({ error: 'Ticker symbol is required' })
  }

  try {
    if (action === 'quote') {
      // Get current quote
      const quote = await getCurrentQuote(ticker)
      if (!quote) {
        return res.status(404).json({ error: 'Quote not found' })
      }
      return res.status(200).json(quote)
    } else {
      // Get time series data
      const data = await fetchRealTimePrice(ticker)
      return res.status(200).json({
        ticker,
        data,
        apiConfigured: isApiKeyConfigured(),
        timestamp: new Date().toISOString()
      })
    }
  } catch (error: any) {
    console.error('Market data API error:', error)
    return res.status(500).json({ 
      error: error.message || 'Failed to fetch market data',
      apiConfigured: isApiKeyConfigured()
    })
  }
}
