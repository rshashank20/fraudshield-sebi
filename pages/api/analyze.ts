import { NextApiRequest, NextApiResponse } from 'next'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('API analyze called:', req.method, req.body)
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { text, type } = req.body

    if (!text) {
      return res.status(400).json({ error: 'Text is required' })
    }

    console.log('GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY)
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'API key not configured' })
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `Analyze this text for SEBI fraud indicators: "${text}"

Is this likely to be fraudulent? Respond with:
- HIGH RISK if clearly fraudulent
- WATCH if suspicious 
- LIKELY SAFE if appears legitimate

Also provide confidence (0-100) and specific reasons.`

    console.log('Calling Gemini API...')
    const result = await model.generateContent(prompt)
    const response = await result.response
    const analysis = response.text()
    
    console.log('Gemini response:', analysis)

    // Parse Gemini response - handle different formats
    let verdict = 'WATCH'
    let confidence = 70
    let reasons = ['Analysis completed']
    
    // Try to extract JSON from markdown code blocks first
    let jsonMatch = analysis.match(/```json\s*(\{[\s\S]*?\})\s*```/)
    if (jsonMatch) {
      try {
        const jsonResponse = JSON.parse(jsonMatch[1])
        verdict = jsonResponse.verdict || verdict
        confidence = jsonResponse.confidence || confidence
        reasons = jsonResponse.reasons || reasons
      } catch (e) {
        console.log('Failed to parse JSON from markdown:', e)
      }
    } else {
      // Parse plain text response
      if (analysis.toLowerCase().includes('high risk') || analysis.toLowerCase().includes('fraudulent')) {
        verdict = 'HIGH RISK'
        confidence = 85
        reasons = ['High risk indicators detected']
      } else if (analysis.toLowerCase().includes('likely safe') || analysis.toLowerCase().includes('legitimate')) {
        verdict = 'LIKELY SAFE'
        confidence = 80
        reasons = ['Appears to be legitimate']
      } else if (analysis.toLowerCase().includes('watch') || analysis.toLowerCase().includes('suspicious')) {
        verdict = 'WATCH'
        confidence = 70
        reasons = ['Suspicious indicators require review']
      }
      
      // Extract confidence number if mentioned
      const confidenceMatch = analysis.match(/confidence[:\s]*(\d+)/i)
      if (confidenceMatch) {
        confidence = parseInt(confidenceMatch[1])
      }
      
      // Extract specific reasons if mentioned
      const reasonLines = analysis.split('\n').filter(line => 
        line.includes('*') || line.includes('-') || line.includes('•')
      )
      if (reasonLines.length > 0) {
        reasons = reasonLines.map(line => 
          line.replace(/^[\*\-\•\s]+/, '').trim()
        ).filter(reason => reason.length > 0)
      }
    }

    const parsedAnalysis = {
      verdict,
      confidence,
      reasons: reasons.length > 0 ? reasons : ['Analysis completed'],
      evidence: ['https://www.sebi.gov.in/']
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
