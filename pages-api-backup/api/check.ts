import { NextApiRequest, NextApiResponse } from 'next'
import { db } from '../../lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { GoogleGenerativeAI } from '@google/generative-ai'

interface CheckRequest {
  inputText: string
  type: 'advisor' | 'tip' | 'link'
}

interface CheckResponse {
  verdict: 'HIGH RISK' | 'WATCH' | 'LIKELY SAFE'
  confidence: number
  reasons: string[]
  evidence: string[]
  flagId: string
  inputText: string
  inputType: string
}

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyDvRN0J-J3DkG0dl1s4GQtbjcpLraefx08')

// Gemini-powered fraud analysis function
async function analyzeInputWithGemini(inputText: string, type: string, inputType: string = 'text'): Promise<Omit<CheckResponse, 'flagId'>> {
  try {
    console.log('Starting Gemini analysis for:', inputText.substring(0, 50) + '...')
    
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    
    const prompt = `You are an AI fraud detection assistant for the securities market. 
Classify the given text into one of three categories:
1. HIGH_RISK (fraud, scam, guaranteed returns, impersonation, fake apps/docs, pump-and-dump)
2. WATCH (suspicious or unverified, requires further verification, rumours, speculative news, event invites)
3. LIKELY_SAFE (legit corporate filings, normal analysis, regulatory circulars, official news)

Return result in strict JSON:
{
  "verdict": "HIGH_RISK" | "WATCH" | "LIKELY_SAFE",
  "confidence": 0-100,
  "reasons": ["short bullet points on why"]
}

Keep it concise and professional. No extra text.

Input: ${inputText}`

    console.log('Sending prompt to Gemini...')
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    console.log('Gemini response:', text)
    
    // Parse JSON response
    let parsedResult
    try {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsedResult = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      console.error('JSON parsing error:', parseError)
      console.log('Raw response:', text)
      
      // Fallback to regex parsing if JSON fails
      const verdictMatch = text.match(/verdict["\s]*:["\s]*"([^"]+)"/i)
      const confidenceMatch = text.match(/confidence["\s]*:["\s]*(\d+)/i)
      const reasonsMatch = text.match(/reasons["\s]*:["\s]*\[(.*?)\]/i)
      
      parsedResult = {
        verdict: verdictMatch ? verdictMatch[1].toUpperCase() : 'WATCH',
        confidence: confidenceMatch ? parseInt(confidenceMatch[1]) : 75,
        reasons: reasonsMatch ? 
          reasonsMatch[1].split(',').map(r => r.trim().replace(/"/g, '')).filter(r => r.length > 0) : 
          ['Analysis completed']
      }
    }
    
    const verdict = parsedResult.verdict || 'WATCH'
    const confidence = parsedResult.confidence || 75
    const reasons = Array.isArray(parsedResult.reasons) ? parsedResult.reasons : ['Analysis completed']
    
    // Validate verdict format (convert underscores to spaces for display)
    const validVerdict = ['HIGH_RISK', 'WATCH', 'LIKELY_SAFE'].includes(verdict) ? 
      verdict.replace('_', ' ') : 'WATCH'
    
    console.log('Parsed result:', { verdict: validVerdict, confidence, reasons })
    
    return {
      verdict: validVerdict as 'HIGH RISK' | 'WATCH' | 'LIKELY SAFE',
      confidence: Math.max(0, Math.min(100, confidence)),
      reasons: reasons.length > 0 ? reasons : ['Analysis completed'],
      evidence: ['https://www.sebi.gov.in/', 'https://www.investor.gov/'],
      inputText: inputText,
      inputType: inputType
    }
    
  } catch (error) {
    console.error('Gemini API error:', error)
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error')
    
    // Fallback response on error
    return {
      verdict: 'WATCH',
      confidence: 50,
      reasons: ['System error, fallback response'],
      evidence: ['https://www.sebi.gov.in/'],
      inputText: inputText,
      inputType: inputType
    }
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { inputText, type }: CheckRequest = req.body

    if (!inputText || !type) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Debug: Check if API key is available
    console.log('Gemini API Key available:', !!process.env.GEMINI_API_KEY)
    console.log('API Key length:', process.env.GEMINI_API_KEY?.length || 0)

    // Perform analysis with Gemini AI
    const analysisResult = await analyzeInputWithGemini(inputText, type, req.body.inputType || 'text')

    // Save to Firestore
    const flagData = {
      inputText,
      inputType: type,
      verdict: analysisResult.verdict,
      confidence: analysisResult.confidence,
      reasons: analysisResult.reasons,
      evidence: analysisResult.evidence,
      timestamp: serverTimestamp(),
      reported: false
    }

    const docRef = await addDoc(collection(db, 'flags'), flagData)

    const response: CheckResponse = {
      ...analysisResult,
      flagId: docRef.id,
      inputText,
      inputType: type
    }

    res.status(200).json(response)
  } catch (error) {
    console.error('Error in check API:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
