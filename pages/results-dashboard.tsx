import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '../lib/firebase'

interface FileResult {
  id: string
  fileName: string
  fileType: string
  fileSize: number
  downloadURL: string
  extractedText: string
  verdict: string
  confidence: number
  reasons: string[]
  evidence: string[]
  timestamp: any
  sebiCheck?: {
    advisorName: string
    status: 'Found' | 'Not Found' | 'Checking...'
    registrationNumber?: string
  }
}

export default function ResultsDashboard() {
  const [fileResults, setFileResults] = useState<FileResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const flagsRef = collection(db, 'flags')
    const q = query(flagsRef, orderBy('timestamp', 'desc'))
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const results = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter((item: any) => item.inputType === 'file' && item.fileName)
          .map((item: any) => ({
            ...item,
            timestamp: item.timestamp
          })) as FileResult[]
        
        setFileResults(results)
        setLoading(false)
        setError(null)
      },
      (err) => {
        console.error('Error fetching file results:', err)
        setError('Failed to fetch results')
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  const getFileIcon = (fileType: string) => {
    if (fileType?.includes('pdf')) return '📄'
    if (fileType?.includes('word') || fileType?.includes('document')) return '📝'
    if (fileType?.includes('audio')) return '🎵'
    if (fileType?.includes('video')) return '🎥'
    return '📁'
  }

  const getFileTypeLabel = (fileType: string) => {
    if (fileType?.includes('pdf')) return 'Document'
    if (fileType?.includes('word') || fileType?.includes('document')) return 'Document'
    if (fileType?.includes('audio')) return 'Audio'
    if (fileType?.includes('video')) return 'Video'
    return 'File'
  }

  const formatFileSize = (bytes: number) => {
    if (!bytes) return ''
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getRiskLevel = (confidence: number) => {
    if (confidence >= 80) return { level: 'High', color: 'red', bgColor: 'bg-red-100', textColor: 'text-red-800' }
    if (confidence >= 60) return { level: 'Medium', color: 'yellow', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' }
    return { level: 'Low', color: 'green', bgColor: 'bg-green-100', textColor: 'text-green-800' }
  }

  const getVerdictBadgeClass = (verdict: string) => {
    switch (verdict) {
      case 'HIGH RISK':
        return 'bg-red-100 text-red-800'
      case 'WATCH':
        return 'bg-yellow-100 text-yellow-800'
      case 'LIKELY SAFE':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return 'N/A'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  // Mock SEBI registry check - looks for common Indian names in the text
  const checkSEBIRegistry = (text: string) => {
    // Return null if text is undefined, null, or empty
    if (!text || typeof text !== 'string') {
      return null
    }
    
    const commonNames = [
      'Ramesh', 'Suresh', 'Rajesh', 'Amit', 'Vikram', 'Priya', 'Sunita', 'Kumar', 'Sharma', 'Patel', 'Reddy', 'Singh',
      'Gupta', 'Agarwal', 'Jain', 'Mehta', 'Shah', 'Desai', 'Joshi', 'Pandey', 'Verma', 'Yadav', 'Khan', 'Ahmed'
    ]
    
    const foundNames = commonNames.filter(name => 
      text.toLowerCase().includes(name.toLowerCase())
    )
    
    if (foundNames.length > 0) {
      return {
        advisorName: foundNames[0],
        status: 'Not Found' as const,
        registrationNumber: undefined
      }
    }
    
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading file analysis results...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Results</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>File Analysis Results - FraudShield SEBI</title>
        <meta name="description" content="Analysis results for uploaded files" />
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
                <span className="text-sm text-gray-500">File Results</span>
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                  Admin Dashboard
                </Link>
                <Link href="/regulator" className="text-gray-600 hover:text-gray-900">
                  Live Monitor
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              File Analysis Results
            </h1>
            <p className="text-gray-600">
              AI-powered fraud detection analysis for uploaded files
            </p>
          </div>

          {/* Results Grid */}
          {fileResults.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📁</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No file analysis results yet</h3>
              <p className="text-gray-500 mb-4">Upload files to see analysis results here.</p>
              <Link 
                href="/verify"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
              >
                Upload Files
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {fileResults.map((result) => {
                const riskLevel = getRiskLevel(result.confidence)
                const sebiCheck = checkSEBIRegistry(result.extractedText)
                
                return (
                  <div key={result.id} className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                    {/* File Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-3xl">{getFileIcon(result.fileType)}</div>
                        <div>
                          <h3 className="font-semibold text-gray-900 truncate" title={result.fileName}>
                            {result.fileName}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {getFileTypeLabel(result.fileType)} • {formatFileSize(result.fileSize)}
                          </p>
                        </div>
                      </div>
                      <Link 
                        href={`/dashboard/flag/${result.id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View Details
                      </Link>
                    </div>

                    {/* Extracted Content Snippet */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Extracted Content:</h4>
                      <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 max-h-20 overflow-y-auto">
                        {result.extractedText && typeof result.extractedText === 'string' ? (
                          result.extractedText.length > 200 
                            ? result.extractedText.substring(0, 200) + '...'
                            : result.extractedText
                        ) : (
                          <span className="text-gray-400 italic">No content extracted</span>
                        )}
                      </div>
                    </div>

                    {/* Risk Assessment */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Risk Assessment:</span>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVerdictBadgeClass(result.verdict)}`}>
                            {result.verdict}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${riskLevel.bgColor} ${riskLevel.textColor}`}>
                            {riskLevel.level} Risk
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            riskLevel.color === 'red' ? 'bg-red-500' : 
                            riskLevel.color === 'yellow' ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${result.confidence}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Confidence: {result.confidence}%</p>
                    </div>

                    {/* SEBI Registry Check */}
                    {sebiCheck && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <span className="text-blue-600 text-sm font-medium">SEBI Check:</span>
                          <span className="text-sm text-gray-700">{sebiCheck.advisorName}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            (sebiCheck.status as string) === 'Found' ? 'bg-green-100 text-green-800' : 
                            (sebiCheck.status as string) === 'Checking...' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'
                          }`}>
                            {sebiCheck.status}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Key Reasons */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Key Reasons:</h4>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {result.reasons && Array.isArray(result.reasons) ? (
                          <>
                            {result.reasons.slice(0, 2).map((reason, index) => (
                              <li key={index} className="flex items-start">
                                <span className="text-gray-400 mr-2">•</span>
                                <span>{reason}</span>
                              </li>
                            ))}
                            {result.reasons.length > 2 && (
                              <li className="text-gray-400 text-xs">
                                +{result.reasons.length - 2} more reasons
                              </li>
                            )}
                          </>
                        ) : (
                          <li className="text-gray-400 text-xs">No reasons provided</li>
                        )}
                      </ul>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-200">
                      <span>{formatTimestamp(result.timestamp)}</span>
                      <a 
                        href={result.downloadURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        View File
                      </a>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </main>
      </div>
    </>
  )
}
