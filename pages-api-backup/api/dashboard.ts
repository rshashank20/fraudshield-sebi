import { NextApiRequest, NextApiResponse } from 'next'
import { db } from '../../lib/firebase'
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore'

interface DashboardData {
  kpis: {
    totalFlags: number
    highRiskFlags: number
    watchFlags: number
    safeFlags: number
    avgConfidence: number
  }
  recentFlags: Array<{
    id: string
    inputText: string
    inputType: string
    verdict: string
    confidence: number
    timestamp: string
    reported: boolean
  }>
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Get all flags from Firestore
    const flagsSnapshot = await getDocs(collection(db, 'flags'))
    const flags = flagsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any[]

    // Calculate KPIs
    const totalFlags = flags.length
    const highRiskFlags = flags.filter(flag => flag.verdict === 'HIGH RISK').length
    const watchFlags = flags.filter(flag => flag.verdict === 'WATCH').length
    const safeFlags = flags.filter(flag => flag.verdict === 'LIKELY SAFE').length
    const avgConfidence = flags.length > 0 
      ? Math.round(flags.reduce((sum, flag) => sum + (flag.confidence || 0), 0) / flags.length)
      : 0

    // Get recent flags (last 20)
    const recentFlagsQuery = query(
      collection(db, 'flags'),
      orderBy('timestamp', 'desc'),
      limit(20)
    )
    const recentFlagsSnapshot = await getDocs(recentFlagsQuery)
    const recentFlags = recentFlagsSnapshot.docs.map(doc => ({
      id: doc.id,
      inputText: doc.data().inputText,
      inputType: doc.data().inputType,
      verdict: doc.data().verdict,
      confidence: doc.data().confidence,
      timestamp: doc.data().timestamp?.toDate?.()?.toISOString() || new Date().toISOString(),
      reported: doc.data().reported || false
    }))

    const dashboardData: DashboardData = {
      kpis: {
        totalFlags,
        highRiskFlags,
        watchFlags,
        safeFlags,
        avgConfidence
      },
      recentFlags
    }

    res.status(200).json(dashboardData)
  } catch (error) {
    console.error('Error in dashboard API:', error)
    
    // Return mock data if Firestore is not available
    const mockData: DashboardData = {
      kpis: {
        totalFlags: 0,
        highRiskFlags: 0,
        watchFlags: 0,
        safeFlags: 0,
        avgConfidence: 0
      },
      recentFlags: []
    }

    res.status(200).json(mockData)
  }
}
