'use client'

import { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

interface TamperChange {
  field: string
  original: string
  modified: string
  description: string
}

interface ExtractedData {
  skillCode?: string
  skillName?: string
  claimantName?: string
  endorserName?: string
}

interface TamperDetails {
  detected: boolean
  changes?: TamperChange[]
  extractedData?: ExtractedData
  warning?: string
  contentModified?: boolean
  storedHash?: string
  currentHash?: string
  contentHash?: string
}

interface VerificationDifference {
  field: string
  youEntered: string
  pdfContains: string
}

interface VerificationResult {
  filename: string
  fileSize: number
  basicVerification: {
    valid: boolean
    message: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadata?: any
    tamperDetails?: TamperDetails
  }
  fullVerification?: {
    valid: boolean
    message: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadata?: any
    details?: {
      providedData?: {
        skillCode?: string
        claimantName?: string
        endorserName?: string
      }
      pdfData?: ExtractedData
      pdfTimestamp?: string
      signatureMatch?: boolean
      differences?: VerificationDifference[]
      expectedSignature?: string
      foundSignature?: string
      hint?: string
      [key: string]: unknown
    }
  } | null
  metadata: {
    title?: string
    author?: string
    subject?: string
    creator?: string
    producer?: string
    creationDate?: string
    modificationDate?: string
    keywords?: string[]
    customFields: Record<string, string>
  }
}

export default function VerifyPdfClient() {
  const [file, setFile] = useState<File | null>(null)
  const [verifying, setVerifying] = useState(false)
  const [result, setResult] = useState<VerificationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'metadata' | 'signature'>(
    'overview'
  )
  const [isDragging, setIsDragging] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Validate file type
      if (
        selectedFile.type !== 'application/pdf' &&
        !selectedFile.name.endsWith('.pdf')
      ) {
        setError('Please select a valid PDF file')
        setFile(null)
        // Reset the input
        e.target.value = ''
        return
      }

      // Validate file size (10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB')
        setFile(null)
        e.target.value = ''
        return
      }

      setFile(selectedFile)
      setResult(null)
      setError(null)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError('Please select a PDF file')
      return
    }

    setVerifying(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('pdf', file)

      const response = await fetch('/api/v1/verify-pdf', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed')
      }

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setVerifying(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    setResult(null)
    setError(null)
    setActiveTab('overview')
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) {
      // Validate file type
      if (droppedFile.type !== 'application/pdf' && !droppedFile.name.endsWith('.pdf')) {
        setError('Please select a valid PDF file')
        setFile(null)
        return
      }

      // Validate file size (10MB)
      if (droppedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB')
        setFile(null)
        return
      }

      setFile(droppedFile)
      setResult(null)
      setError(null)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  // Extract data from metadata for display
  const getIssuedTo = () => {
    // Try extractedData first (from PDF text parsing)
    if (result?.basicVerification.tamperDetails?.extractedData?.claimantName) {
      return result.basicVerification.tamperDetails.extractedData.claimantName
    }
    // Try parsing from credential data JSON
    try {
      const credentialData = result?.metadata.customFields?.['SkillsAware-CredentialData']
      if (credentialData) {
        const parsed = JSON.parse(credentialData)
        if (parsed.claimantName) return parsed.claimantName
      }
    } catch {
      // Ignore parse errors
    }
    // Fallback to custom fields
    return result?.metadata.customFields?.claimant_name || 'N/A'
  }

  const getIssuedBy = () => {
    // Try extractedData first (from PDF text parsing)
    if (result?.basicVerification.tamperDetails?.extractedData?.endorserName) {
      return result.basicVerification.tamperDetails.extractedData.endorserName
    }
    // Try parsing from credential data JSON
    try {
      const credentialData = result?.metadata.customFields?.['SkillsAware-CredentialData']
      if (credentialData) {
        const parsed = JSON.parse(credentialData)
        if (parsed.endorserName) return parsed.endorserName
      }
    } catch {
      // Ignore parse errors
    }
    // Fallback to custom fields or default
    return (
      result?.metadata.customFields?.endorser_name ||
      result?.metadata.customFields?.['SkillsAware-Issuer'] ||
      'SkillsAware'
    )
  }

  const getIssueDate = () => {
    // Try timestamp from SkillsAware metadata
    const timestamp = result?.metadata.customFields?.['SkillsAware-Timestamp']
    if (timestamp) {
      try {
        return new Date(timestamp).toLocaleDateString()
      } catch {
        // Fallback to creation date
      }
    }
    if (result?.metadata.creationDate) {
      return new Date(result.metadata.creationDate).toLocaleDateString()
    }
    return 'N/A'
  }

  const getCredentialId = () => {
    // Use SkillsAware-ClaimID from custom fields
    const claimId = result?.metadata.customFields?.['SkillsAware-ClaimID']
    if (claimId) return claimId
    // Fallback to other possible field names
    return (
      result?.metadata.customFields?.claim_id ||
      result?.metadata.customFields?.credential_id ||
      'N/A'
    )
  }

  return (
    <div
      className='min-h-screen flex flex-col'
      style={{ backgroundColor: 'var(--skillsaware-bg-secondary)' }}
    >
      <Navbar />

      <main className='min-h-screen py-10 px-4 sm:px-6'>
        <div className='max-w-4xl mx-auto space-y-8' style={{ marginTop: '2rem' }}>
          {/* Page Heading */}
          <div className='text-center space-y-4'>
            <h1
              className='text-3xl md:text-4xl font-black tracking-tight'
              style={{ color: 'var(--skillsaware-text-primary)' }}
            >
              PDF Certificate Verifier
            </h1>
            <p
              className='text-lg max-w-2xl mx-auto'
              style={{ color: 'var(--skillsaware-text-secondary)' }}
            >
              Verify the authenticity and integrity of any SkillsAware endorsed credential
              securely in your browser.
            </p>
          </div>

          {/* Main Verifier Card */}
          <div
            className='card rounded-xl shadow-sm border overflow-hidden'
            style={{
              backgroundColor: 'var(--skillsaware-bg-primary)',
              borderColor: 'var(--skillsaware-border)'
            }}
          >
            {/* Upload Zone */}
            <div>
              {/* Dropzone */}
              <form onSubmit={handleVerify}>
                <div
                  role='button'
                  tabIndex={0}
                  aria-label='Click or drag to upload PDF certificate'
                  className='relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all duration-300 px-6 py-16 group cursor-pointer overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2'
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => {
                    const input = document.getElementById(
                      'pdf-file-input'
                    ) as HTMLInputElement
                    input?.click()
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      const input = document.getElementById(
                        'pdf-file-input'
                      ) as HTMLInputElement
                      input?.click()
                    }
                  }}
                  style={{
                    borderColor: isDragging
                      ? 'var(--skillsaware-primary)'
                      : 'var(--skillsaware-border)',
                    backgroundColor: isDragging
                      ? 'rgba(11, 95, 255, 0.05)'
                      : 'var(--skillsaware-bg-secondary)',
                    transform: isDragging ? 'scale(1.02)' : 'scale(1)',
                    boxShadow: isDragging
                      ? '0 8px 24px rgba(11, 95, 255, 0.15)'
                      : '0 2px 8px rgba(9, 30, 66, 0.08)',
                    padding: '2rem',
                    margin: '2rem'
                  }}
                  onMouseEnter={e => {
                    if (!isDragging && !file) {
                      e.currentTarget.style.borderColor = 'rgba(11, 95, 255, 0.4)'
                      e.currentTarget.style.boxShadow =
                        '0 4px 16px rgba(11, 95, 255, 0.12)'
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isDragging && !file) {
                      e.currentTarget.style.borderColor = 'var(--skillsaware-border)'
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(9, 30, 66, 0.08)'
                    }
                  }}
                >
                  {/* Hidden file input - completely invisible */}
                  <input
                    id='pdf-file-input'
                    accept='.pdf'
                    aria-label='Upload PDF'
                    className='sr-only'
                    type='file'
                    onChange={handleFileChange}
                  />

                  {/* Animated background gradient */}
                  <div
                    className='absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500'
                    style={{
                      background:
                        'linear-gradient(135deg, rgba(11, 95, 255, 0.08) 0%, rgba(108, 92, 231, 0.05) 100%)'
                    }}
                  />

                  {/* Content */}
                  <div className='relative z-10 flex flex-col items-center gap-5 text-center'>
                    {/* Icon with animated pulse */}
                    <div
                      className='relative h-20 w-20 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300'
                      style={{
                        background:
                          'linear-gradient(135deg, rgba(11, 95, 255, 0.15) 0%, rgba(108, 92, 231, 0.1) 100%)',
                        color: 'var(--skillsaware-primary)',
                        boxShadow: '0 4px 16px rgba(11, 95, 255, 0.2)'
                      }}
                    >
                      <span className='material-symbols-outlined text-5xl'>
                        {isDragging ? 'file_upload' : 'cloud_upload'}
                      </span>
                      {isDragging && (
                        <div
                          className='absolute inset-0 rounded-2xl animate-ping'
                          style={{
                            backgroundColor: 'rgba(11, 95, 255, 0.3)',
                            animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite'
                          }}
                        />
                      )}
                    </div>

                    {/* Text content */}
                    <div className='space-y-2'>
                      <p
                        className='text-xl font-black tracking-tight'
                        style={{ color: 'var(--skillsaware-text-primary)' }}
                      >
                        {isDragging
                          ? 'Drop your PDF here'
                          : 'Click to browse from your device'}
                      </p>
                      <p
                        className='text-sm font-medium'
                        style={{ color: 'var(--skillsaware-text-secondary)' }}
                      >
                        {isDragging
                          ? 'Release to upload your certificate'
                          : 'Drag and drop your PDF certificate or click to select'}
                      </p>
                    </div>

                    {/* File info badge */}
                    <div
                      className='inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold shadow-sm backdrop-blur-sm'
                      style={{
                        borderColor: 'rgba(11, 95, 255, 0.2)',
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        color: 'var(--skillsaware-primary)'
                      }}
                    >
                      <span
                        className='material-symbols-outlined'
                        style={{ fontSize: '18px' }}
                      >
                        description
                      </span>
                      PDF only • Max 10MB
                    </div>

                    {/* Animated dots for loading state */}
                    {isDragging && (
                      <div className='flex gap-1.5 mt-2'>
                        {[0, 1, 2].map(i => (
                          <div
                            key={i}
                            className='h-2 w-2 rounded-full'
                            style={{
                              backgroundColor: 'var(--skillsaware-primary)',
                              animation: `bounce 1.4s ease-in-out ${i * 0.2}s infinite`
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Selected File Display - Premium Design */}
                {file && (
                  <div
                    className='mt-6 flex items-center justify-between rounded-xl border p-5 transition-all duration-300 animate-in fade-in slide-in-from-top-2'
                    style={{
                      borderColor: 'rgba(11, 95, 255, 0.3)',
                      backgroundColor:
                        'linear-gradient(135deg, rgba(11, 95, 255, 0.08) 0%, rgba(108, 92, 231, 0.05) 100%)',
                      background:
                        'linear-gradient(135deg, rgba(11, 95, 255, 0.08) 0%, rgba(108, 92, 231, 0.05) 100%)',
                      boxShadow: '0 4px 16px rgba(11, 95, 255, 0.1)'
                    }}
                  >
                    <div className='flex items-center gap-4 flex-1 min-w-0'>
                      <div
                        className='flex h-14 w-14 items-center justify-center rounded-xl shadow-md border-2 shrink-0'
                        style={{
                          backgroundColor: 'var(--skillsaware-bg-primary)',
                          borderColor: 'rgba(11, 95, 255, 0.3)',
                          color: 'var(--skillsaware-error)'
                        }}
                      >
                        <span className='material-symbols-outlined text-3xl'>
                          picture_as_pdf
                        </span>
                      </div>
                      <div className='flex-1 min-w-0'>
                        <p
                          className='text-base font-black truncate'
                          style={{ color: 'var(--skillsaware-text-primary)' }}
                        >
                          {file.name}
                        </p>
                        <div className='flex items-center gap-3 mt-1'>
                          <p
                            className='text-xs font-medium'
                            style={{ color: 'var(--skillsaware-text-secondary)' }}
                          >
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          <span
                            className='text-xs'
                            style={{ color: 'var(--skillsaware-text-tertiary)' }}
                          >
                            •
                          </span>
                          <div className='flex items-center gap-1'>
                            <span
                              className='block h-2 w-2 rounded-full animate-pulse'
                              style={{ backgroundColor: 'var(--skillsaware-success)' }}
                            />
                            <p
                              className='text-xs font-bold'
                              style={{ color: 'var(--skillsaware-success)' }}
                            >
                              Ready to verify
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      type='button'
                      onClick={e => {
                        e.stopPropagation()
                        handleReset()
                      }}
                      className='ml-4 text-slate-400 hover:text-red-500 transition-all duration-200 rounded-full p-2 hover:bg-red-50 hover:scale-110 shrink-0'
                      aria-label='Remove file'
                    >
                      <span className='material-symbols-outlined text-xl'>close</span>
                    </button>
                  </div>
                )}

                {/* Info Alert */}
                <div
                  className='mt-6 flex gap-3 rounded-lg p-4'
                  style={{
                    backgroundColor: 'rgba(19, 127, 236, 0.1)',
                    color: 'var(--skillsaware-primary)',
                    marginBottom: '2rem'
                  }}
                >
                  <span className='material-symbols-outlined shrink-0'>info</span>
                  <div className='text-sm'>
                    <span className='font-bold'>Local Verification:</span> Your document
                    is processed locally in your browser using client-side hashing. No
                    personal data or file content is uploaded to any server.
                  </div>
                </div>

                {/* Actions */}
                <div className='mt-8 flex flex-col sm:flex-row gap-4 justify-center'>
                  <button
                    type='submit'
                    disabled={verifying || !file}
                    className='flex-1 sm:flex-none min-w-[160px] inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-bold text-white shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-offset-2'
                    style={{
                      backgroundColor:
                        verifying || !file
                          ? 'var(--skillsaware-text-tertiary)'
                          : 'var(--skillsaware-primary)',
                      cursor: verifying || !file ? 'not-allowed' : 'pointer',
                      opacity: verifying || !file ? 0.6 : 1
                    }}
                  >
                    <span
                      className='material-symbols-outlined'
                      style={{ fontSize: '20px' }}
                    >
                      verified
                    </span>
                    {verifying ? 'Verifying...' : 'Verify PDF'}
                  </button>
                  {(file || result) && (
                    <button
                      type='button'
                      onClick={handleReset}
                      className='flex-1 sm:flex-none min-w-[160px] inline-flex items-center justify-center gap-2 rounded-lg border px-6 py-3 text-sm font-bold transition-all'
                      style={{
                        borderColor: 'var(--skillsaware-border)',
                        backgroundColor: 'var(--skillsaware-bg-primary)',
                        color: 'var(--skillsaware-text-primary)'
                      }}
                    >
                      <span
                        className='material-symbols-outlined'
                        style={{ fontSize: '20px' }}
                      >
                        refresh
                      </span>
                      Reset
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div
              className='rounded-xl border-2 p-5 animate-in fade-in slide-in-from-top-2'
              style={{
                borderColor: 'rgba(222, 53, 11, 0.3)',
                backgroundColor: 'rgba(222, 53, 11, 0.05)',
                boxShadow: '0 4px 16px rgba(222, 53, 11, 0.1)'
              }}
            >
              <div className='flex items-start gap-3'>
                <div
                  className='h-10 w-10 rounded-full flex items-center justify-center shrink-0'
                  style={{
                    backgroundColor: 'rgba(222, 53, 11, 0.15)',
                    color: 'var(--skillsaware-error)'
                  }}
                >
                  <span className='material-symbols-outlined text-xl'>error</span>
                </div>
                <div className='flex-1'>
                  <h3
                    className='text-base font-black mb-1'
                    style={{ color: 'var(--skillsaware-text-primary)' }}
                  >
                    {error.includes('Verification')
                      ? 'Verification Failed'
                      : 'File Error'}
                  </h3>
                  <p
                    className='text-sm font-medium'
                    style={{ color: 'var(--skillsaware-text-secondary)' }}
                  >
                    {error}
                  </p>
                </div>
                <button
                  type='button'
                  onClick={() => setError(null)}
                  className='text-slate-400 hover:text-red-500 transition-colors rounded-full p-1 shrink-0'
                  aria-label='Dismiss error'
                >
                  <span className='material-symbols-outlined text-lg'>close</span>
                </button>
              </div>
            </div>
          )}

          {/* RESULTS SECTION */}
          {result && (
            <div className='mt-8'>
              <div className='flex items-center justify-between mb-6 px-2'>
                <h3
                  className='text-lg font-bold'
                  style={{ color: 'var(--skillsaware-text-primary)' }}
                >
                  Verification Results
                </h3>
                <span
                  className='inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border'
                  style={{
                    backgroundColor: result.basicVerification.valid
                      ? 'rgba(54, 179, 126, 0.1)'
                      : 'rgba(222, 53, 11, 0.1)',
                    borderColor: result.basicVerification.valid
                      ? 'rgba(54, 179, 126, 0.2)'
                      : 'rgba(222, 53, 11, 0.2)',
                    color: result.basicVerification.valid
                      ? 'var(--skillsaware-success)'
                      : 'var(--skillsaware-error)'
                  }}
                >
                  <span
                    className='block h-2 w-2 rounded-full'
                    style={{
                      backgroundColor: result.basicVerification.valid
                        ? 'var(--skillsaware-success)'
                        : 'var(--skillsaware-error)'
                    }}
                  ></span>
                  Status: {result.basicVerification.valid ? 'PASSED' : 'FAILED'}
                </span>
              </div>

              <div
                className='card rounded-xl shadow-sm border overflow-hidden'
                style={{
                  backgroundColor: 'var(--skillsaware-bg-primary)',
                  borderColor: 'var(--skillsaware-border)'
                }}
              >
                {/* Success/Error Banner */}
                <div
                  className='border-b p-6 sm:p-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center'
                  style={{
                    backgroundColor: result.basicVerification.valid
                      ? 'rgba(54, 179, 126, 0.1)'
                      : 'rgba(222, 53, 11, 0.1)',
                    borderColor: result.basicVerification.valid
                      ? 'rgba(54, 179, 126, 0.2)'
                      : 'rgba(222, 53, 11, 0.2)'
                  }}
                >
                  <div
                    className='h-12 w-12 rounded-full flex items-center justify-center shrink-0'
                    style={{
                      backgroundColor: result.basicVerification.valid
                        ? 'rgba(54, 179, 126, 0.2)'
                        : 'rgba(222, 53, 11, 0.2)',
                      color: result.basicVerification.valid
                        ? 'var(--skillsaware-success)'
                        : 'var(--skillsaware-error)'
                    }}
                  >
                    <span className='material-symbols-outlined text-2xl'>
                      {result.basicVerification.valid ? 'check_circle' : 'error'}
                    </span>
                  </div>
                  <div className='flex-1'>
                    <h4
                      className='text-lg font-bold'
                      style={{ color: 'var(--skillsaware-text-primary)' }}
                    >
                      {result.basicVerification.valid
                        ? 'Certificate is Authentic'
                        : 'Certificate Verification Failed'}
                    </h4>
                    <p
                      className='text-sm mt-1'
                      style={{ color: 'var(--skillsaware-text-secondary)' }}
                    >
                      {result.basicVerification.message}
                    </p>
                  </div>
                </div>

                {/* Details Tabs */}
                <div
                  className='border-b px-6 sm:px-8 flex gap-6 overflow-x-auto'
                  style={{ borderColor: 'var(--skillsaware-border)' }}
                >
                  <button
                    className={`py-4 border-b-2 text-sm whitespace-nowrap transition-colors ${activeTab === 'overview' ? 'font-bold' : 'font-medium'}`}
                    onClick={() => setActiveTab('overview')}
                    style={{
                      borderBottomColor:
                        activeTab === 'overview'
                          ? 'var(--skillsaware-primary)'
                          : 'transparent',
                      color:
                        activeTab === 'overview'
                          ? 'var(--skillsaware-primary)'
                          : 'var(--skillsaware-text-secondary)'
                    }}
                  >
                    Overview
                  </button>
                  <button
                    className={`py-4 border-b-2 text-sm whitespace-nowrap transition-colors ${activeTab === 'metadata' ? 'font-bold' : 'font-medium'}`}
                    onClick={() => setActiveTab('metadata')}
                    style={{
                      borderBottomColor:
                        activeTab === 'metadata'
                          ? 'var(--skillsaware-primary)'
                          : 'transparent',
                      color:
                        activeTab === 'metadata'
                          ? 'var(--skillsaware-primary)'
                          : 'var(--skillsaware-text-secondary)'
                    }}
                  >
                    Technical Metadata
                  </button>
                  <button
                    className={`py-4 border-b-2 text-sm whitespace-nowrap transition-colors ${activeTab === 'signature' ? 'font-bold' : 'font-medium'}`}
                    onClick={() => setActiveTab('signature')}
                    style={{
                      borderBottomColor:
                        activeTab === 'signature'
                          ? 'var(--skillsaware-primary)'
                          : 'transparent',
                      color:
                        activeTab === 'signature'
                          ? 'var(--skillsaware-primary)'
                          : 'var(--skillsaware-text-secondary)'
                    }}
                  >
                    Signature Data
                  </button>
                </div>

                {/* Tab Content */}
                <div className='p-6 sm:p-8 space-y-8'>
                  {activeTab === 'overview' && (
                    <>
                      {/* Core Identity Grid */}
                      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                        <div className='space-y-1'>
                          <span
                            className='text-xs font-medium uppercase tracking-wider'
                            style={{ color: 'var(--skillsaware-text-secondary)' }}
                          >
                            Issued To
                          </span>
                          <p
                            className='text-base font-bold flex items-center gap-2'
                            style={{ color: 'var(--skillsaware-text-primary)' }}
                          >
                            <span
                              className='material-symbols-outlined text-lg'
                              style={{ color: 'var(--skillsaware-text-secondary)' }}
                            >
                              person
                            </span>
                            {getIssuedTo()}
                          </p>
                        </div>
                        <div className='space-y-1'>
                          <span
                            className='text-xs font-medium uppercase tracking-wider'
                            style={{ color: 'var(--skillsaware-text-secondary)' }}
                          >
                            Issued By
                          </span>
                          <p
                            className='text-base font-bold flex items-center gap-2'
                            style={{ color: 'var(--skillsaware-text-primary)' }}
                          >
                            <span
                              className='material-symbols-outlined text-lg'
                              style={{ color: 'var(--skillsaware-text-secondary)' }}
                            >
                              school
                            </span>
                            {getIssuedBy()}
                          </p>
                        </div>
                        <div className='space-y-1'>
                          <span
                            className='text-xs font-medium uppercase tracking-wider'
                            style={{ color: 'var(--skillsaware-text-secondary)' }}
                          >
                            Issue Date
                          </span>
                          <p
                            className='text-base font-bold flex items-center gap-2'
                            style={{ color: 'var(--skillsaware-text-primary)' }}
                          >
                            <span
                              className='material-symbols-outlined text-lg'
                              style={{ color: 'var(--skillsaware-text-secondary)' }}
                            >
                              calendar_today
                            </span>
                            {getIssueDate()}
                          </p>
                        </div>
                        <div className='space-y-1'>
                          <span
                            className='text-xs font-medium uppercase tracking-wider'
                            style={{ color: 'var(--skillsaware-text-secondary)' }}
                          >
                            Credential ID
                          </span>
                          <p
                            className='text-base font-bold flex items-center gap-2'
                            style={{ color: 'var(--skillsaware-text-primary)' }}
                          >
                            <span
                              className='material-symbols-outlined text-lg'
                              style={{ color: 'var(--skillsaware-text-secondary)' }}
                            >
                              fingerprint
                            </span>
                            {getCredentialId()}
                          </p>
                        </div>
                      </div>

                      <hr style={{ borderColor: 'var(--skillsaware-border)' }} />

                      {/* Integrity Checks */}
                      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                        <div className='space-y-4'>
                          <h5
                            className='font-bold text-sm'
                            style={{ color: 'var(--skillsaware-text-primary)' }}
                          >
                            Integrity Checks
                          </h5>
                          <div className='space-y-3'>
                            <div
                              className='flex items-center justify-between p-3 rounded-lg border'
                              style={{
                                backgroundColor: 'var(--skillsaware-bg-secondary)',
                                borderColor: 'var(--skillsaware-border)'
                              }}
                            >
                              <div className='flex items-center gap-3'>
                                <span
                                  className='material-symbols-outlined text-xl'
                                  style={{
                                    color: result.basicVerification.valid
                                      ? 'var(--skillsaware-success)'
                                      : 'var(--skillsaware-error)'
                                  }}
                                >
                                  {result.basicVerification.valid ? 'lock' : 'lock_open'}
                                </span>
                                <span
                                  className='text-sm font-medium'
                                  style={{ color: 'var(--skillsaware-text-primary)' }}
                                >
                                  Cryptographic Signature
                                </span>
                              </div>
                              <span
                                className='text-xs font-bold px-2 py-1 rounded'
                                style={{
                                  backgroundColor: result.basicVerification.valid
                                    ? 'rgba(54, 179, 126, 0.1)'
                                    : 'rgba(222, 53, 11, 0.1)',
                                  color: result.basicVerification.valid
                                    ? 'var(--skillsaware-success)'
                                    : 'var(--skillsaware-error)'
                                }}
                              >
                                {result.basicVerification.valid ? 'MATCH' : 'MISMATCH'}
                              </span>
                            </div>
                            <div
                              className='flex items-center justify-between p-3 rounded-lg border'
                              style={{
                                backgroundColor: 'var(--skillsaware-bg-secondary)',
                                borderColor: 'var(--skillsaware-border)'
                              }}
                            >
                              <div className='flex items-center gap-3'>
                                <span
                                  className='material-symbols-outlined text-xl'
                                  style={{
                                    color: result.basicVerification.tamperDetails
                                      ?.detected
                                      ? 'var(--skillsaware-error)'
                                      : 'var(--skillsaware-success)'
                                  }}
                                >
                                  {result.basicVerification.tamperDetails?.detected
                                    ? 'edit'
                                    : 'history_edu'}
                                </span>
                                <span
                                  className='text-sm font-medium'
                                  style={{ color: 'var(--skillsaware-text-primary)' }}
                                >
                                  Tamper Evidence
                                </span>
                              </div>
                              <span
                                className='text-xs font-bold px-2 py-1 rounded'
                                style={{
                                  backgroundColor: result.basicVerification.tamperDetails
                                    ?.detected
                                    ? 'rgba(222, 53, 11, 0.1)'
                                    : 'rgba(54, 179, 126, 0.1)',
                                  color: result.basicVerification.tamperDetails?.detected
                                    ? 'var(--skillsaware-error)'
                                    : 'var(--skillsaware-success)'
                                }}
                              >
                                {result.basicVerification.tamperDetails?.detected
                                  ? 'DETECTED'
                                  : 'NONE'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Tamper Details */}
                        {result.basicVerification.tamperDetails?.detected &&
                          result.basicVerification.tamperDetails.changes && (
                            <div className='space-y-4'>
                              <h5
                                className='font-bold text-sm'
                                style={{ color: 'var(--skillsaware-error)' }}
                              >
                                Tampering Details
                              </h5>
                              <div className='space-y-3'>
                                {result.basicVerification.tamperDetails.changes.map(
                                  (change: TamperChange, index: number) => (
                                    <div
                                      key={index}
                                      className='p-4 rounded-lg border'
                                      style={{
                                        backgroundColor: 'rgba(222, 53, 11, 0.05)',
                                        borderColor: 'rgba(222, 53, 11, 0.2)'
                                      }}
                                    >
                                      <div
                                        className='font-bold mb-2'
                                        style={{ color: 'var(--skillsaware-error)' }}
                                      >
                                        {change.field}
                                      </div>
                                      <div className='text-xs space-y-1.5'>
                                        <div>
                                          <strong>Original:</strong>{' '}
                                          <span style={{ fontFamily: 'monospace' }}>
                                            {change.original}
                                          </span>
                                        </div>
                                        {change.description && (
                                          <div className='mt-2 italic'>
                                            {change.description}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                      </div>
                    </>
                  )}

                  {activeTab === 'metadata' && (
                    <div className='space-y-4'>
                      <h5
                        className='font-bold text-sm'
                        style={{ color: 'var(--skillsaware-text-primary)' }}
                      >
                        PDF Metadata
                      </h5>
                      <div className='grid grid-cols-1 gap-4'>
                        {result.metadata.title && (
                          <div>
                            <strong
                              className='text-xs'
                              style={{ color: 'var(--skillsaware-text-secondary)' }}
                            >
                              Title:
                            </strong>
                            <p
                              className='text-sm mt-1'
                              style={{ color: 'var(--skillsaware-text-primary)' }}
                            >
                              {result.metadata.title}
                            </p>
                          </div>
                        )}
                        {result.metadata.author && (
                          <div>
                            <strong
                              className='text-xs'
                              style={{ color: 'var(--skillsaware-text-secondary)' }}
                            >
                              Author:
                            </strong>
                            <p
                              className='text-sm mt-1'
                              style={{ color: 'var(--skillsaware-text-primary)' }}
                            >
                              {result.metadata.author}
                            </p>
                          </div>
                        )}
                        {result.metadata.creator && (
                          <div>
                            <strong
                              className='text-xs'
                              style={{ color: 'var(--skillsaware-text-secondary)' }}
                            >
                              Creator:
                            </strong>
                            <p
                              className='text-sm mt-1'
                              style={{ color: 'var(--skillsaware-text-primary)' }}
                            >
                              {result.metadata.creator}
                            </p>
                          </div>
                        )}
                        {result.metadata.creationDate && (
                          <div>
                            <strong
                              className='text-xs'
                              style={{ color: 'var(--skillsaware-text-secondary)' }}
                            >
                              Created:
                            </strong>
                            <p
                              className='text-sm mt-1'
                              style={{ color: 'var(--skillsaware-text-primary)' }}
                            >
                              {new Date(result.metadata.creationDate).toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'signature' && (
                    <div className='space-y-4'>
                      <div className='flex items-center justify-between'>
                        <h5
                          className='font-bold text-sm'
                          style={{ color: 'var(--skillsaware-text-primary)' }}
                        >
                          Verification Data
                        </h5>
                        <button
                          onClick={() => {
                            const verificationData = {
                              valid: result.basicVerification.valid,
                              claimId:
                                result.metadata.customFields?.['SkillsAware-ClaimID'],
                              timestamp:
                                result.metadata.customFields?.['SkillsAware-Timestamp'],
                              signature:
                                result.metadata.customFields?.['SkillsAware-Signature'],
                              contentHash:
                                result.basicVerification.tamperDetails?.contentHash ||
                                result.metadata.customFields?.[
                                  'SkillsAware-ContentHash'
                                ] ||
                                'N/A',
                              version:
                                result.metadata.customFields?.['SkillsAware-Version'],
                              issuer:
                                result.metadata.customFields?.['SkillsAware-Issuer'],
                              message: result.basicVerification.message
                            }
                            navigator.clipboard.writeText(
                              JSON.stringify(verificationData, null, 2)
                            )
                            // Show feedback (you could add a toast here)
                          }}
                          className='flex items-center gap-1 text-xs font-medium transition-colors hover:opacity-80'
                          style={{ color: 'var(--skillsaware-primary)' }}
                        >
                          <span
                            className='material-symbols-outlined'
                            style={{ fontSize: '14px' }}
                          >
                            content_copy
                          </span>
                          Copy JSON
                        </button>
                      </div>
                      <div className='relative group'>
                        <pre
                          className='w-full p-4 rounded-lg text-xs font-mono overflow-x-auto leading-relaxed border shadow-inner'
                          style={{
                            backgroundColor: '#1e1e1e',
                            color: '#d1d5db',
                            borderColor: '#374151'
                          }}
                        >
                          <code>
                            {JSON.stringify(
                              {
                                valid: result.basicVerification.valid,
                                claimId:
                                  result.metadata.customFields?.['SkillsAware-ClaimID'] ||
                                  'N/A',
                                timestamp:
                                  result.metadata.customFields?.[
                                    'SkillsAware-Timestamp'
                                  ] || 'N/A',
                                signature: result.metadata.customFields?.[
                                  'SkillsAware-Signature'
                                ]
                                  ? `${result.metadata.customFields['SkillsAware-Signature'].substring(0, 20)}...`
                                  : 'N/A',
                                contentHash:
                                  result.basicVerification.tamperDetails?.contentHash ||
                                  result.metadata.customFields?.[
                                    'SkillsAware-ContentHash'
                                  ] ||
                                  'N/A',
                                version:
                                  result.metadata.customFields?.['SkillsAware-Version'] ||
                                  'N/A',
                                issuer:
                                  result.metadata.customFields?.['SkillsAware-Issuer'] ||
                                  'SkillsAware',
                                verificationMessage: result.basicVerification.message
                              },
                              null,
                              2
                            )}
                          </code>
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
