import { NextApiRequest, NextApiResponse } from 'next'
import { db } from '../../lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { GoogleGenerativeAI } from '@google/generative-ai'

interface ProcessFileRequest {
  fileName: string
  fileType: string
  fileSize: number
  downloadURL: string
  extractedText?: string
}

interface ProcessFileResponse {
  verdict: 'HIGH RISK' | 'WATCH' | 'LIKELY SAFE'
  confidence: number
  reasons: string[]
  evidence: string[]
  flagId: string
  fileName: string
  fileType: string
  fileSize: number
  downloadURL: string
}

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyDvRN0J-J3DkG0dl1s4GQtbjcpLraefx08')

// File processing function using existing AI analysis
async function processFileWithGemini(fileInfo: ProcessFileRequest): Promise<Omit<ProcessFileResponse, 'flagId'>> {
  try {
    console.log('Processing file:', fileInfo.fileName, 'Type:', fileInfo.fileType)
    
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    
    // Use the extracted text for analysis, fallback to file name if no content
    const contentToAnalyze = fileInfo.extractedText || `File: ${fileInfo.fileName}`
    
    // Use the same prompt format as the existing /api/check endpoint
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

Input: ${contentToAnalyze}`

    console.log('Sending prompt to Gemini for file analysis...')
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    console.log('Gemini response:', text)
    
    // Parse JSON response
    let parsedResult
    try {
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
          ['File analysis completed']
      }
    }
    
    const verdict = parsedResult.verdict || 'WATCH'
    const confidence = parsedResult.confidence || 75
    const reasons = Array.isArray(parsedResult.reasons) ? parsedResult.reasons : ['File analysis completed']
    
    // Validate verdict format (convert underscores to spaces for display)
    const validVerdict = ['HIGH_RISK', 'WATCH', 'LIKELY_SAFE'].includes(verdict) ? 
      verdict.replace('_', ' ') : 'WATCH'
    
    console.log('Parsed result:', { verdict: validVerdict, confidence, reasons })
    
    return {
      verdict: validVerdict as 'HIGH RISK' | 'WATCH' | 'LIKELY SAFE',
      confidence: Math.max(0, Math.min(100, confidence)),
      reasons: reasons.length > 0 ? reasons : ['File analysis completed'],
      evidence: ['https://www.sebi.gov.in/', 'https://www.investor.gov/'],
      fileName: fileInfo.fileName,
      fileType: fileInfo.fileType,
      fileSize: fileInfo.fileSize,
      downloadURL: fileInfo.downloadURL
    }
    
  } catch (error) {
    console.error('File processing error:', error)
    console.error('Error details:', error.message)
    
    // Fallback response on error
    return {
      verdict: 'WATCH',
      confidence: 50,
      reasons: ['System error, fallback response'],
      evidence: ['https://www.sebi.gov.in/'],
      fileName: fileInfo.fileName,
      fileType: fileInfo.fileType,
      fileSize: fileInfo.fileSize,
      downloadURL: fileInfo.downloadURL
    }
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { fileName, fileType, fileSize, downloadURL, extractedText }: ProcessFileRequest = req.body

    if (!fileName || !fileType || !downloadURL) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Debug: Check if API key is available
    console.log('Gemini API Key available:', !!process.env.GEMINI_API_KEY)
    console.log('API Key length:', process.env.GEMINI_API_KEY?.length || 0)

    // Process file with Gemini AI
    const analysisResult = await processFileWithGemini({
      fileName,
      fileType,
      fileSize: fileSize || 0,
      downloadURL,
      extractedText
    })

    // Save to Firestore
    const flagData = {
      inputText: `File: ${fileName}${extractedText ? `\n\nExtracted Content:\n${extractedText.substring(0, 500)}${extractedText.length > 500 ? '...' : ''}` : ''}`,
      inputType: 'file',
      verdict: analysisResult.verdict,
      confidence: analysisResult.confidence,
      reasons: analysisResult.reasons,
      evidence: analysisResult.evidence,
      fileName: analysisResult.fileName,
      fileType: analysisResult.fileType,
      fileSize: analysisResult.fileSize,
      downloadURL: analysisResult.downloadURL,
      extractedText: extractedText || null,
      timestamp: serverTimestamp(),
      reported: false
    }

    const docRef = await addDoc(collection(db, 'flags'), flagData)

    const response: ProcessFileResponse = {
      ...analysisResult,
      flagId: docRef.id
    }

    res.status(200).json(response)
  } catch (error) {
    console.error('Error in process-file API:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
