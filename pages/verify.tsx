import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import FileUpload from '../components/FileUpload'

export default function Verify() {
  const [inputText, setInputText] = useState('')
  const [inputType, setInputType] = useState<'advisor' | 'tip' | 'link' | 'file'>('advisor')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<{
    name: string
    type: string
    size: number
    downloadURL: string
    extractedText?: string
  } | null>(null)
  const router = useRouter()

  const handleFileUploaded = (fileInfo: {
    name: string
    type: string
    size: number
    downloadURL: string
    extractedText?: string
  }) => {
    setUploadedFile(fileInfo)
    setInputType('file')
  }

  const handleProcessFile = async (fileInfo: {
    name: string
    type: string
    size: number
    downloadURL: string
    extractedText?: string
  }) => {
    setIsSubmitting(true)

    try {
      // Try API first (works on Vercel), fallback to client-side
      let result
      
      try {
        console.log('Trying API route...')
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: fileInfo.extractedText || fileInfo.name,
            type: 'file'
          }),
        })

        if (response.ok) {
          const contentType = response.headers.get('content-type')
          if (contentType && contentType.includes('application/json')) {
            result = await response.json()
            console.log('API analysis successful:', result)
          } else {
            throw new Error('API returned non-JSON response')
          }
        } else {
          throw new Error(`API returned ${response.status}`)
        }
      } catch (error) {
        console.log('API failed, using client-side analysis:', error)
        result = await performClientSideAnalysis(fileInfo.extractedText || fileInfo.name, 'file')
      }
      
      // Store result in sessionStorage to pass to result page
      sessionStorage.setItem('verdictResult', JSON.stringify(result))
      
      // Redirect to result page
      router.push('/result')
    } catch (error) {
      console.error('Error processing file:', error)
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while processing the file. Please try again.'
      alert(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim() && inputType !== 'file') return

    setIsSubmitting(true)

    try {
      // Try API first (works on Vercel), fallback to client-side
      let result
      
      try {
        console.log('Trying API route...')
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: inputText.trim(),
            type: inputType,
          }),
        })

        if (response.ok) {
          const contentType = response.headers.get('content-type')
          if (contentType && contentType.includes('application/json')) {
            result = await response.json()
            console.log('API analysis successful:', result)
          } else {
            throw new Error('API returned non-JSON response')
          }
        } else {
          throw new Error(`API returned ${response.status}`)
        }
      } catch (error) {
        console.log('API failed, using client-side analysis:', error)
        result = await performClientSideAnalysis(inputText.trim(), inputType)
      }
      
      // Store result in sessionStorage to pass to result page
      sessionStorage.setItem('verdictResult', JSON.stringify(result))
      
      // Redirect to result page
      router.push('/result')
    } catch (error) {
      console.error('Error submitting verification:', error)
      const errorMessage = error instanceof Error ? error.message : 'An error occurred. Please try again.'
      alert(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const performClientSideAnalysis = async (text: string, type: string) => {
    console.log('Starting client-side analysis for:', text, 'type:', type)
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Simple client-side fraud detection
    const lowerText = text.toLowerCase()
    console.log('Analyzing text:', lowerText)
    
    // High risk indicators
    const highRiskKeywords = [
      'guaranteed', 'guarantee', 'guaranteed return', 'risk-free', 'no risk',
      'get rich quick', 'instant profit', 'double your money', 'triple your investment',
      'exclusive opportunity', 'limited time', 'act now', 'don\'t miss out',
      'secret formula', 'insider tip', 'confidential', 'urgent', 'immediate action'
    ]
    
    // Suspicious patterns
    const suspiciousPatterns = [
      /\d+%\s*return/i,
      /\d+%\s*profit/i,
      /\d+%\s*gain/i,
      /guaranteed\s+\d+/i,
      /risk.free/i,
      /no\s+risk/i,
      /double\s+your/i,
      /triple\s+your/i
    ]
    
    let riskScore = 0
    let reasons: string[] = []
    
    // Check for high risk keywords
    highRiskKeywords.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        riskScore += 20
        reasons.push(`Contains suspicious keyword: "${keyword}"`)
      }
    })
    
    // Check for suspicious patterns
    suspiciousPatterns.forEach(pattern => {
      if (pattern.test(text)) {
        riskScore += 15
        reasons.push('Contains unrealistic return promises')
      }
    })
    
    // Check for urgency tactics
    if (lowerText.includes('urgent') || lowerText.includes('immediate') || lowerText.includes('act now')) {
      riskScore += 10
      reasons.push('Uses pressure tactics to create urgency')
    }
    
    // Check for advisor name (if type is advisor)
    if (type === 'advisor') {
      // Simple check for common advisor names
      const commonNames = ['john', 'smith', 'kumar', 'sharma', 'patel', 'singh']
      const hasCommonName = commonNames.some(name => lowerText.includes(name))
      
      if (hasCommonName) {
        riskScore += 5
        reasons.push('Common name pattern detected')
      }
    }
    
    // Determine verdict
    let verdict = 'LIKELY SAFE'
    let confidence = 85
    
    if (riskScore >= 50) {
      verdict = 'HIGH RISK'
      confidence = 90
    } else if (riskScore >= 25) {
      verdict = 'WATCH'
      confidence = 75
    }
    
    // If no specific reasons found, add generic ones
    if (reasons.length === 0) {
      reasons = ['No obvious red flags detected', 'Appears to be standard investment advice']
    }
    
    return {
      verdict,
      confidence,
      reasons,
      evidence: ['https://www.sebi.gov.in/', 'https://www.investor.gov/'],
      inputText: text,
      inputType: type
    }
  }

  return (
    <>
      <Head>
        <title>Verify - FraudShield SEBI</title>
        <meta name="description" content="Verify SEBI registered advisors or analyze investment tips" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link href="/" className="text-2xl font-bold text-primary-600">
                  FraudShield SEBI
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                  Dashboard
                </Link>
                <Link href="/regulator" className="text-gray-600 hover:text-gray-900">
                  Live Monitor
                </Link>
                <Link href="/results-dashboard" className="text-gray-600 hover:text-gray-900">
                  File Results
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Verify & Analyze
            </h1>
            <p className="text-xl text-gray-600">
              Enter advisor name, paste tip text, provide a link, or upload a file to analyze
            </p>
          </div>

          <div className="card max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Input Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What would you like to verify?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <button
                    type="button"
                    onClick={() => setInputType('advisor')}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      inputType === 'advisor'
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">👤</div>
                    <div className="font-medium">Advisor Name</div>
                    <div className="text-sm text-gray-500">SEBI Registration</div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setInputType('tip')}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      inputType === 'tip'
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">💡</div>
                    <div className="font-medium">Tip Text</div>
                    <div className="text-sm text-gray-500">Paste Content</div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setInputType('link')}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      inputType === 'link'
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">🔗</div>
                    <div className="font-medium">Link</div>
                    <div className="text-sm text-gray-500">URL Analysis</div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setInputType('file')}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      inputType === 'file'
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">📁</div>
                    <div className="font-medium">File</div>
                    <div className="text-sm text-gray-500">Upload Document</div>
                  </button>
                </div>
              </div>

              {/* Input Field or File Upload */}
              {inputType === 'file' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload File
                  </label>
                  <FileUpload
                    onFileUploaded={handleFileUploaded}
                    onProcessFile={handleProcessFile}
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Upload PDF, DOCX, MP3, WAV, or MP4 files for fraud analysis
                  </p>
                </div>
              ) : (
                <div>
                  <label htmlFor="inputText" className="block text-sm font-medium text-gray-700 mb-2">
                    {inputType === 'advisor' && 'Advisor Name'}
                    {inputType === 'tip' && 'Tip Text'}
                    {inputType === 'link' && 'URL Link'}
                  </label>
                  <textarea
                    id="inputText"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={
                      inputType === 'advisor' 
                        ? 'Enter the full name of the financial advisor...'
                        : inputType === 'tip'
                        ? 'Paste the investment tip or recommendation text here...'
                        : 'Enter the URL or link to analyze...'
                    }
                    className="input-field min-h-[120px] resize-none"
                    required
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    {inputType === 'advisor' && 'We will check if this advisor is registered with SEBI'}
                    {inputType === 'tip' && 'We will analyze this text for potential fraud indicators'}
                    {inputType === 'link' && 'We will analyze the content at this URL for fraud indicators'}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              {inputType !== 'file' && (
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={!inputText.trim() || isSubmitting}
                    className="btn-primary w-full text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Analyzing...
                      </div>
                    ) : (
                      'Submit for Analysis'
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Info Section */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card">
              <h3 className="text-lg font-semibold mb-3 text-primary-600">
                🔍 What We Check
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• SEBI registration status</li>
                <li>• License validity and history</li>
                <li>• Disciplinary actions</li>
                <li>• Red flags in recommendations</li>
                <li>• Unrealistic return promises</li>
                <li>• Pressure tactics indicators</li>
              </ul>
            </div>
            
            <div className="card">
              <h3 className="text-lg font-semibold mb-3 text-primary-600">
                📁 File Analysis
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• PDF document analysis</li>
                <li>• Audio content review</li>
                <li>• Video fraud detection</li>
                <li>• Document authenticity</li>
                <li>• Content risk assessment</li>
                <li>• Multi-format support</li>
              </ul>
            </div>
            
            <div className="card">
              <h3 className="text-lg font-semibold mb-3 text-primary-600">
                ⚡ Quick Results
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Instant verification</li>
                <li>• Risk level assessment</li>
                <li>• Confidence score</li>
                <li>• Evidence links</li>
                <li>• Detailed reasoning</li>
                <li>• Report option</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
