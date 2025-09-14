import { NextApiRequest, NextApiResponse } from 'next'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { text, type } = req.body

    if (!text) {
      return res.status(400).json({ error: 'Text is required' })
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'API key not configured' })
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

    const prompt = `
    Analyze this ${type || 'text'} for potential fraud indicators related to SEBI regulations:
    
    "${text}"
    
    Provide a JSON response with:
    - verdict: "HIGH RISK", "WATCH", or "LIKELY SAFE"
    - confidence: number between 0-100
    - reasons: array of specific reasons
    - evidence: array of relevant regulations or sources
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    const analysis = response.text()

    // Try to parse JSON response
    let parsedAnalysis
    try {
      parsedAnalysis = JSON.parse(analysis)
    } catch {
      // Fallback if not valid JSON
      parsedAnalysis = {
        verdict: 'WATCH',
        confidence: 70,
        reasons: ['Analysis completed - manual review recommended'],
        evidence: ['https://www.sebi.gov.in/']
      }
    }

    res.status(200).json({
      verdict: parsedAnalysis.verdict || 'WATCH',
      confidence: parsedAnalysis.confidence || 70,
      reasons: parsedAnalysis.reasons || ['Analysis completed'],
      evidence: parsedAnalysis.evidence || ['https://www.sebi.gov.in/'],
      inputText: text,
      inputType: type || 'text'
    })

  } catch (error) {
    console.error('Analysis error:', error)
    res.status(500).json({ 
      error: 'Analysis failed',
      verdict: 'WATCH',
      confidence: 50,
      reasons: ['System error - fallback response'],
      evidence: ['https://www.sebi.gov.in/'],
      inputText: req.body.text || '',
      inputType: req.body.type || 'text'
    })
  }
}
