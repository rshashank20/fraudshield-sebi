import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '../lib/firebase'

interface FileUploadProps {
  onFileUploaded: (fileInfo: {
    name: string
    type: string
    size: number
    downloadURL: string
    extractedText?: string
  }) => void
  onProcessFile: (fileInfo: {
    name: string
    type: string
    size: number
    downloadURL: string
    extractedText?: string
  }) => void
}

const ALLOWED_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'audio/mpeg': ['.mp3'],
  'audio/wav': ['.wav'],
  'video/mp4': ['.mp4']
}

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

export default function FileUpload({ onFileUploaded, onProcessFile }: FileUploadProps) {
  const [uploadedFile, setUploadedFile] = useState<{
    name: string
    type: string
    size: number
    downloadURL: string
    extractedText?: string
  } | null>(null)
  const [uploading, setUploading] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setError(null)
    setUploading(true)

    try {
      // Validate file type
      const isValidType = Object.values(ALLOWED_TYPES).some(extensions => 
        extensions.some(ext => file.name.toLowerCase().endsWith(ext))
      )

      if (!isValidType) {
        throw new Error('Invalid file type. Please upload PDF, DOCX, MP3, WAV, or MP4 files only.')
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        throw new Error('File size too large. Maximum size is 50MB.')
      }

      // Upload to Firebase Storage
      const timestamp = Date.now()
      const fileName = `${timestamp}_${file.name}`
      const storageRef = ref(storage, `uploads/${fileName}`)
      
      const snapshot = await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(snapshot.ref)

      const fileInfo = {
        name: file.name,
        type: file.type,
        size: file.size,
        downloadURL
      }

      setUploadedFile(fileInfo)
      onFileUploaded(fileInfo)

      // Extract content for supported file types
      if (file.type.includes('pdf') || 
          file.type.includes('document') || 
          file.type.includes('word') || 
          file.type.includes('audio') || 
          file.type.includes('video')) {
        
        setExtracting(true)
        try {
          console.log('Extracting content from file:', file.name)
          const response = await fetch('/api/extract-content', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              downloadURL,
              fileName: file.name,
              fileType: file.type
            }),
          })

          if (response.ok) {
            const result = await response.json()
            if (result.success && result.extractedText) {
              const updatedFileInfo = {
                ...fileInfo,
                extractedText: result.extractedText
              }
              setUploadedFile(updatedFileInfo)
              onFileUploaded(updatedFileInfo)
              console.log('Content extracted successfully. Length:', result.extractedText.length)
            } else {
              console.warn('Content extraction failed:', result.error)
            }
          } else {
            console.warn('Content extraction API error:', response.status)
          }
        } catch (extractError) {
          console.error('Content extraction error:', extractError)
          // Don't show error to user, just log it
        } finally {
          setExtracting(false)
        }
      }
      
    } catch (err: any) {
      console.error('Upload error:', err)
      setError(err.message || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }, [onFileUploaded])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ALLOWED_TYPES,
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE
  })

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return '📄'
    if (type.includes('word') || type.includes('document')) return '📝'
    if (type.includes('audio')) return '🎵'
    if (type.includes('video')) return '🎥'
    return '📁'
  }

  const resetUpload = () => {
    setUploadedFile(null)
    setError(null)
  }

  return (
    <div className="w-full">
      {!uploadedFile ? (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
            }
            ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} disabled={uploading} />
          
          {uploading || extracting ? (
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600">
                {uploading ? 'Uploading file...' : 'Extracting content...'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-6xl">📁</div>
              <div>
                <p className="text-lg font-medium text-gray-900">
                  {isDragActive ? 'Drop the file here' : 'Drag & drop a file here'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  or click to select a file
                </p>
              </div>
              <div className="text-xs text-gray-400">
                <p>Supported formats: PDF, DOCX, MP3, WAV, MP4</p>
                <p>Maximum size: 50MB</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="text-2xl">{getFileIcon(uploadedFile.type)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-green-800 truncate">
                  {uploadedFile.name}
                </h4>
                <button
                  onClick={resetUpload}
                  className="text-green-600 hover:text-green-800 text-sm"
                >
                  ✕
                </button>
              </div>
              <div className="mt-1 text-xs text-green-600">
                <p>Type: {uploadedFile.type}</p>
                <p>Size: {formatFileSize(uploadedFile.size)}</p>
                <p className="text-green-500">✓ Upload successful</p>
                {uploadedFile.extractedText && (
                  <p className="text-green-500">✓ Content extracted</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Extracted Text Preview */}
          {uploadedFile.extractedText && (
            <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Extracted Content Preview:</h4>
              <div className="max-h-32 overflow-y-auto text-xs text-gray-600 bg-white border border-gray-200 rounded p-2">
                {uploadedFile.extractedText.length > 500 
                  ? uploadedFile.extractedText.substring(0, 500) + '...'
                  : uploadedFile.extractedText
                }
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {uploadedFile.extractedText.length} characters extracted
              </p>
            </div>
          )}

          <div className="mt-4 flex space-x-3">
            <button
              onClick={() => onProcessFile(uploadedFile)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Process File
            </button>
            <a
              href={uploadedFile.downloadURL}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
            >
              View File
            </a>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="text-red-400 text-xl mr-3">⚠️</div>
            <div>
              <h4 className="text-sm font-medium text-red-800">Upload Error</h4>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
