import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { collection, query, orderBy, limit, onSnapshot, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface Flag {
  id: string
  inputText: string
  inputType: string
  verdict: string
  confidence: number
  timestamp: any
  reported: boolean
  fileName?: string
  fileType?: string
  fileSize?: number
  downloadURL?: string
  extractedText?: string
}

export default function Dashboard() {
  const [flags, setFlags] = useState<Flag[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    const flagsRef = collection(db, 'flags')
    const q = query(flagsRef, orderBy('timestamp', 'desc'), limit(10))
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const flagsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp
        })) as Flag[]
        setFlags(flagsData)
        setLoading(false)
        setError(null)
      },
      (err) => {
        console.error('Error fetching flags:', err)
        setError('Failed to fetch data')
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  // Handle anchor scrolling for flag details
  useEffect(() => {
    const hash = window.location.hash
    if (hash && hash.startsWith('#flag-')) {
      const flagId = hash.replace('#flag-', '')
      const flagRow = document.querySelector(`[data-flag-id="${flagId}"]`)
      if (flagRow) {
        flagRow.scrollIntoView({ behavior: 'smooth', block: 'center' })
        // Highlight the row briefly
        flagRow.classList.add('bg-blue-50')
        setTimeout(() => {
          flagRow.classList.remove('bg-blue-50')
        }, 2000)
      }
    }
  }, [flags])

  // Calculate KPIs from flags data
  const totalSubmissions = flags.length
  const highRiskCount = flags.filter(flag => flag.verdict === 'HIGH RISK').length
  const watchCount = flags.filter(flag => flag.verdict === 'WATCH').length
  const likelySafeCount = flags.filter(flag => flag.verdict === 'LIKELY SAFE').length

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

  const truncateText = (text: string, maxLength: number = 40) => {
    if (!text) return 'No content'
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  }

  const getFileIcon = (fileType: string) => {
    if (fileType?.includes('pdf')) return '📄'
    if (fileType?.includes('word') || fileType?.includes('document')) return '📝'
    if (fileType?.includes('audio')) return '🎵'
    if (fileType?.includes('video')) return '🎥'
    return '📁'
  }

  const formatFileSize = (bytes: number) => {
    if (!bytes) return ''
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const downloadPDFReport = async () => {
    setDownloading(true)
    try {
      console.log('Starting PDF generation...')
      
      // Fetch all flags from Firestore
      const flagsRef = collection(db, 'flags')
      const q = query(flagsRef, orderBy('timestamp', 'desc'))
      const snapshot = await getDocs(q)
      const allFlags = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp
      })) as Flag[]

      console.log('Fetched flags:', allFlags.length)

      // Calculate KPIs
      const totalFlags = allFlags.length
      const highRiskCount = allFlags.filter(flag => flag.verdict === 'HIGH RISK').length
      const watchCount = allFlags.filter(flag => flag.verdict === 'WATCH').length
      const likelySafeCount = allFlags.filter(flag => flag.verdict === 'LIKELY SAFE').length

      console.log('KPIs calculated:', { totalFlags, highRiskCount, watchCount, likelySafeCount })

      // Create PDF
      const doc = new jsPDF()
      console.log('PDF document created')
      
      // Add title
      const currentDate = new Date().toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
      
      doc.setFontSize(20)
      doc.setFont('helvetica', 'bold')
      doc.text('Fraud Monitoring Report', 20, 30)
      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      doc.text(`Generated on: ${currentDate}`, 20, 40)

      // Add summary section
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Summary', 20, 60)
      
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(`Total Flags: ${totalFlags}`, 20, 75)
      doc.text(`High Risk: ${highRiskCount}`, 20, 85)
      doc.text(`Watch: ${watchCount}`, 20, 95)
      doc.text(`Likely Safe: ${likelySafeCount}`, 20, 105)

      // Add divider line
      doc.setLineWidth(0.5)
      doc.line(20, 115, 190, 115)

      // Prepare table data
      const tableData = allFlags.map(flag => {
        let contentDisplay = flag.inputText
        if (flag.inputType === 'file' && flag.fileName) {
          contentDisplay = `${getFileIcon(flag.fileType || '')} ${flag.fileName}`
          if (flag.fileSize) {
            contentDisplay += ` (${formatFileSize(flag.fileSize)})`
          }
        }
        return [
          contentDisplay.length > 50 ? contentDisplay.substring(0, 50) + '...' : contentDisplay,
          flag.inputType === 'file' ? 'FILE' : flag.inputType.toUpperCase(),
          flag.verdict,
          `${flag.confidence || 0}%`,
          formatTimestamp(flag.timestamp)
        ]
      })

      console.log('Table data prepared:', tableData.length, 'rows')

      // Add table
      console.log('Adding table to PDF...')
      autoTable(doc, {
        startY: 125,
        head: [['Content / File', 'Type', 'Verdict', 'Confidence %', 'Timestamp']],
        body: tableData,
        styles: {
          fontSize: 8,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [66, 139, 202],
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: 15 },
          2: { cellWidth: 20 },
          3: { cellWidth: 20 },
          4: { cellWidth: 25 }
        }
      })

      // Add footer
      const pageCount = doc.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.text(`Page ${i} of ${pageCount}`, 20, 285)
        doc.text('FraudShield SEBI - Fraud Monitoring System', 140, 285)
      }

      // Download the PDF
      const fileName = `fraud-monitoring-report-${new Date().toISOString().split('T')[0]}.pdf`
      console.log('Saving PDF with filename:', fileName)
      doc.save(fileName)
      console.log('PDF saved successfully')

    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF report. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="btn-primary"
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
        <title>Regulator Dashboard - FraudShield SEBI</title>
        <meta name="description" content="SEBI regulator dashboard for fraud monitoring" />
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
                <span className="text-sm text-gray-500">Admin Dashboard</span>
                <Link href="/regulator" className="text-gray-600 hover:text-gray-900">
                  Live Monitor
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
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Regulator Dashboard
                </h1>
                <p className="text-gray-600">
                  Monitor fraud detection flags and system performance
                </p>
              </div>
              <button
                onClick={downloadPDFReport}
                disabled={downloading || flags.length === 0}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                {downloading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <span>📄</span>
                    <span>Download Report (PDF)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 text-xl">📊</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Submissions</p>
                  <p className="text-2xl font-bold text-gray-900">{totalSubmissions}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <span className="text-red-600 text-xl">⚠️</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">High Risk Count</p>
                  <p className="text-2xl font-bold text-gray-900">{highRiskCount}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <span className="text-yellow-600 text-xl">👀</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Watch Count</p>
                  <p className="text-2xl font-bold text-gray-900">{watchCount}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 text-xl">✅</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Likely Safe Count</p>
                  <p className="text-2xl font-bold text-gray-900">{likelySafeCount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Flags Table */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                10 Most Recent Flags
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Real-time updates from fraud detection system
              </p>
            </div>

            {error ? (
              <div className="p-6 text-center">
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h3>
                <p className="text-gray-600">{error}</p>
              </div>
            ) : flags.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📊</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No flags yet</h3>
                <p className="text-gray-500">Flags will appear here as users submit verification requests.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Content / File
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Verdict
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Confidence %
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Timestamp
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {flags.map((flag, index) => (
                      <tr key={flag.id} data-flag-id={flag.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4">
                          <Link 
                            href={`/dashboard/flag/${flag.id}`}
                            className="text-sm text-gray-900 max-w-xs hover:text-blue-600 hover:underline"
                          >
                            {flag.inputType === 'file' && flag.fileName ? (
                              <div className="flex items-center space-x-2">
                                <span className="text-lg">{getFileIcon(flag.fileType || '')}</span>
                                <div>
                                  <div className="font-medium">{flag.fileName}</div>
                                  {flag.fileSize && (
                                    <div className="text-xs text-gray-500">{formatFileSize(flag.fileSize)}</div>
                                  )}
                                  {flag.extractedText && (
                                    <div className="text-xs text-gray-600 mt-1">
                                      {truncateText(flag.extractedText, 30)}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : (
                              truncateText(flag.inputText, 40)
                            )}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            flag.inputType === 'file' 
                              ? 'bg-blue-100 text-blue-800' 
                              : flag.inputType === 'advisor'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {flag.inputType === 'file' ? 'FILE' : flag.inputType.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getVerdictBadgeClass(flag.verdict)}`}>
                            {flag.verdict}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {flag.confidence || 0}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatTimestamp(flag.timestamp)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </main>
      </div>
    </>
  )
}
