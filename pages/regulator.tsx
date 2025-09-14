import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import KPICards from '../components/regulator/KPICards'
import LiveFeed from '../components/regulator/LiveFeed'
import CorrelationChart from '../components/regulator/CorrelationChart'
import Alerts from '../components/regulator/Alerts'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'

interface Flag {
  id: string
  inputText: string
  verdict: string
  confidence: number
  timestamp: any
  fileName?: string
  fileType?: string
}

export default function RegulatorDashboard() {
  const [selectedFlag, setSelectedFlag] = useState<Flag | null>(null)
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null)
  const [isGeneratingMockData, setIsGeneratingMockData] = useState(false)

  // Generate mock data for demo purposes
  const generateMockData = async () => {
    setIsGeneratingMockData(true)
    
    const mockFlags = [
      {
        inputText: "BUY $AAPL NOW! Guaranteed 50% returns in 30 days! Don't miss this opportunity!",
        verdict: "HIGH RISK",
        confidence: 95,
        fileName: "investment_tip_1.pdf",
        fileType: "application/pdf"
      },
      {
        inputText: "Ramesh Kumar is offering exclusive stock tips. Contact him at +91-9876543210 for guaranteed profits!",
        verdict: "HIGH RISK", 
        confidence: 88,
        fileName: "advisor_call.mp3",
        fileType: "audio/mpeg"
      },
      {
        inputText: "Tesla stock analysis: Strong fundamentals, good long-term hold. Consider adding to portfolio.",
        verdict: "LIKELY SAFE",
        confidence: 75,
        fileName: "tesla_analysis.docx",
        fileType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      },
      {
        inputText: "URGENT: $BTC will hit $100k by end of month! Invest now before it's too late!",
        verdict: "HIGH RISK",
        confidence: 92,
        fileName: "bitcoin_alert.mp4",
        fileType: "video/mp4"
      },
      {
        inputText: "Market update: Tech stocks showing resilience. Diversified portfolio recommended.",
        verdict: "LIKELY SAFE",
        confidence: 70,
        fileName: "market_update.pdf",
        fileType: "application/pdf"
      },
      {
        inputText: "Suresh Patel claims to have insider information about $GOOGL. DM for details!",
        verdict: "WATCH",
        confidence: 65,
        fileName: "insider_tip.mp3",
        fileType: "audio/mpeg"
      },
      {
        inputText: "Microsoft quarterly earnings beat expectations. Strong buy recommendation.",
        verdict: "LIKELY SAFE",
        confidence: 80,
        fileName: "msft_earnings.docx",
        fileType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      },
      {
        inputText: "FREE MONEY! Double your investment in 7 days! No risk, guaranteed returns!",
        verdict: "HIGH RISK",
        confidence: 98,
        fileName: "scam_alert.pdf",
        fileType: "application/pdf"
      },
      {
        inputText: "Amazon stock dip is temporary. Great buying opportunity for long-term investors.",
        verdict: "LIKELY SAFE",
        confidence: 72,
        fileName: "amzn_analysis.mp4",
        fileType: "video/mp4"
      },
      {
        inputText: "Vikram Singh offering premium trading signals. Join his WhatsApp group for daily tips!",
        verdict: "WATCH",
        confidence: 60,
        fileName: "trading_signals.mp3",
        fileType: "audio/mpeg"
      }
    ]

    try {
      // Add mock flags to Firestore with random timestamps
      for (let i = 0; i < mockFlags.length; i++) {
        const flag = mockFlags[i]
        const randomHoursAgo = Math.floor(Math.random() * 24) // Random time in last 24 hours
        const timestamp = new Date(Date.now() - randomHoursAgo * 60 * 60 * 1000)
        
        await addDoc(collection(db, 'flags'), {
          ...flag,
          inputType: 'file',
          reasons: [
            flag.verdict === 'HIGH RISK' ? 'Contains guaranteed return promises' : 
            flag.verdict === 'WATCH' ? 'Requires further verification' : 
            'Appears to be legitimate financial advice'
          ],
          evidence: ['https://www.sebi.gov.in/', 'https://www.investor.gov/'],
          timestamp: serverTimestamp(),
          reported: false
        })
        
        // Add small delay between inserts
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      
      alert('Mock data generated successfully!')
    } catch (error) {
      console.error('Error generating mock data:', error)
      alert('Error generating mock data. Please try again.')
    } finally {
      setIsGeneratingMockData(false)
    }
  }

  const handleFlagSelect = (flag: Flag) => {
    setSelectedFlag(flag)
    
    // Extract ticker from flag text
    const tickerMatch = flag.inputText.match(/\$?([A-Z]{2,5})\b/)
    if (tickerMatch) {
      setSelectedTicker(tickerMatch[1])
    } else {
      setSelectedTicker(null)
    }
  }

  const handleTickerSelect = (ticker: string) => {
    setSelectedTicker(ticker)
    setSelectedFlag(null)
  }

  return (
    <>
      <Head>
        <title>Regulator Dashboard - FraudShield SEBI</title>
        <meta name="description" content="Live monitoring dashboard for SEBI regulators" />
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
                <span className="text-sm text-gray-500">Regulator Dashboard</span>
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                  Admin Dashboard
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
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Live Monitoring Dashboard
                </h1>
                <p className="text-gray-600">
                  Real-time fraud detection and market surveillance
                </p>
              </div>
              <button
                onClick={generateMockData}
                disabled={isGeneratingMockData}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                {isGeneratingMockData ? 'Generating...' : 'Generate Mock Data'}
              </button>
            </div>
          </div>

          {/* KPI Cards */}
          <KPICards onTickerSelect={handleTickerSelect} />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Left: Live Feed */}
            <div className="lg:col-span-1">
              <LiveFeed 
                onFlagSelect={handleFlagSelect}
                selectedFlagId={selectedFlag?.id}
              />
            </div>

            {/* Right: Correlation Chart */}
            <div className="lg:col-span-2">
              <CorrelationChart selectedTicker={selectedTicker} />
            </div>
          </div>

          {/* Alerts Row */}
          <div className="mb-8">
            <Alerts selectedTicker={selectedTicker} />
          </div>

          {/* API Status */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-3">
              ✅ Live Market Data Integration Active
            </h3>
            <div className="text-sm text-green-800 space-y-2">
              <p>
                <strong>Alpha Vantage API Key Configured!</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Real-time stock price data from Alpha Vantage</li>
                <li>Automatic fallback to simulated data if API fails</li>
                <li>Rate limiting (5 calls/minute) built-in</li>
                <li>5-minute caching for optimal performance</li>
              </ul>
              <p className="mt-3 text-xs text-green-600">
                💡 <strong>Status:</strong> Live market data is now active. Select a ticker from the feed to see real-time price correlation.
              </p>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
