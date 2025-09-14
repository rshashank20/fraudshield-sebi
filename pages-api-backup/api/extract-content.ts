import { NextApiRequest, NextApiResponse } from 'next'
import pdf from 'pdf-parse'
import mammoth from 'mammoth'
import OpenAI from 'openai'
import ffmpeg from 'fluent-ffmpeg'
import fs from 'fs'
import path from 'path'
import { promisify } from 'util'

// Promisify fs functions
const writeFile = promisify(fs.writeFile)
const unlink = promisify(fs.unlink)

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-demo-key'
})

interface ExtractContentRequest {
  downloadURL: string
  fileName: string
  fileType: string
}

interface ExtractContentResponse {
  success: boolean
  extractedText: string
  error?: string
}

// Download file from URL
async function downloadFile(url: string, filePath: string): Promise<void> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.statusText}`)
  }
  
  const buffer = await response.arrayBuffer()
  await writeFile(filePath, Buffer.from(buffer))
}

// Extract text from PDF
async function extractPDFText(filePath: string): Promise<string> {
  try {
    const dataBuffer = fs.readFileSync(filePath)
    const data = await pdf(dataBuffer)
    return data.text
  } catch (error) {
    console.error('PDF extraction error:', error)
    throw new Error('Failed to extract text from PDF')
  }
}

// Extract text from DOCX
async function extractDOCXText(filePath: string): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ path: filePath })
    return result.value
  } catch (error) {
    console.error('DOCX extraction error:', error)
    throw new Error('Failed to extract text from DOCX')
  }
}

// Extract audio from video using ffmpeg
async function extractAudioFromVideo(videoPath: string, audioPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .toFormat('wav')
      .on('end', () => {
        console.log('Audio extraction completed')
        resolve()
      })
      .on('error', (err) => {
        console.error('Audio extraction error:', err)
        reject(new Error('Failed to extract audio from video'))
      })
      .save(audioPath)
  })
}

// Transcribe audio using OpenAI Whisper
async function transcribeAudio(audioPath: string): Promise<string> {
  try {
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(audioPath),
      model: 'whisper-1',
    })
    return transcription.text
  } catch (error) {
    console.error('Audio transcription error:', error)
    throw new Error('Failed to transcribe audio')
  }
}

// Main content extraction function
async function extractFileContent(
  downloadURL: string, 
  fileName: string, 
  fileType: string
): Promise<string> {
  const tempDir = path.join(process.cwd(), 'temp')
  
  // Ensure temp directory exists
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true })
  }
  
  const fileExtension = path.extname(fileName).toLowerCase()
  const tempFilePath = path.join(tempDir, `temp_${Date.now()}${fileExtension}`)
  const audioPath = path.join(tempDir, `audio_${Date.now()}.wav`)
  
  try {
    // Download file
    console.log('Downloading file from:', downloadURL)
    await downloadFile(downloadURL, tempFilePath)
    console.log('File downloaded to:', tempFilePath)
    
    let extractedText = ''
    
    if (fileType.includes('pdf')) {
      console.log('Extracting text from PDF...')
      extractedText = await extractPDFText(tempFilePath)
    } else if (fileType.includes('document') || fileType.includes('word')) {
      console.log('Extracting text from DOCX...')
      extractedText = await extractDOCXText(tempFilePath)
    } else if (fileType.includes('audio')) {
      console.log('Transcribing audio...')
      extractedText = await transcribeAudio(tempFilePath)
    } else if (fileType.includes('video')) {
      console.log('Extracting audio from video...')
      await extractAudioFromVideo(tempFilePath, audioPath)
      console.log('Transcribing extracted audio...')
      extractedText = await transcribeAudio(audioPath)
    } else {
      throw new Error('Unsupported file type for content extraction')
    }
    
    console.log('Content extraction completed. Text length:', extractedText.length)
    return extractedText
    
  } finally {
    // Clean up temporary files
    try {
      if (fs.existsSync(tempFilePath)) {
        await unlink(tempFilePath)
        console.log('Cleaned up temp file:', tempFilePath)
      }
      if (fs.existsSync(audioPath)) {
        await unlink(audioPath)
        console.log('Cleaned up audio file:', audioPath)
      }
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError)
    }
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { downloadURL, fileName, fileType }: ExtractContentRequest = req.body

    if (!downloadURL || !fileName || !fileType) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: downloadURL, fileName, fileType' 
      })
    }

    console.log('Starting content extraction for:', fileName, 'Type:', fileType)
    
    // Check if OpenAI API key is available
    if ((fileType.includes('audio') || fileType.includes('video')) && !process.env.OPENAI_API_KEY) {
      return res.status(400).json({
        success: false,
        error: 'OpenAI API key not configured for audio/video processing'
      })
    }

    const extractedText = await extractFileContent(downloadURL, fileName, fileType)

    const response: ExtractContentResponse = {
      success: true,
      extractedText: extractedText.trim()
    }

    res.status(200).json(response)
    
  } catch (error: any) {
    console.error('Content extraction error:', error)
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Content extraction failed' 
    })
  }
}
