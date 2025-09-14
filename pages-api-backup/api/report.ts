import { NextApiRequest, NextApiResponse } from 'next'
import { db } from '../../lib/firebase'
import { doc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore'

interface ReportRequest {
  flagId?: string
  inputText: string
  verdict: string
  confidence: number
  reasons: string[]
  evidence: string[]
  anonymous: boolean
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    console.log('Report API called with:', req.body)
    
    const { flagId, inputText, verdict, confidence, reasons, evidence, anonymous }: ReportRequest = req.body

    // Validate required fields
    if (!inputText) {
      return res.status(400).json({ error: 'Missing inputText field' })
    }
    if (!verdict) {
      return res.status(400).json({ error: 'Missing verdict field' })
    }
    if (!Array.isArray(reasons)) {
      return res.status(400).json({ error: 'Missing or invalid reasons array' })
    }
    if (!Array.isArray(evidence)) {
      return res.status(400).json({ error: 'Missing or invalid evidence array' })
    }

    let resultFlagId: string

    if (flagId) {
      // Update existing flag
      const flagRef = doc(db, 'flags', flagId)
      await updateDoc(flagRef, {
        inputText,
        verdict,
        confidence,
        reasons,
        evidence,
        anonymous: anonymous || false,
        reported: true,
        reportedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      resultFlagId = flagId
    } else {
      // Create new flag
      const flagData = {
        inputText,
        verdict,
        confidence,
        reasons,
        evidence,
        anonymous: anonymous || false,
        status: 'pending',
        timestamp: serverTimestamp(),
        createdAt: serverTimestamp()
      }

      const docRef = await addDoc(collection(db, 'flags'), flagData)
      resultFlagId = docRef.id
    }

    console.log('Report successful, flagId:', resultFlagId)
    res.status(200).json({ 
      success: true, 
      message: 'Flag reported successfully',
      flagId: resultFlagId
    })
  } catch (error) {
    console.error('Error in report API:', error)
    console.error('Error details:', error.message)
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    })
  }
}
