'use client'

import { useState } from 'react'

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
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
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--skillsaware-bg-secondary)',
        padding: '40px 20px'
      }}
    >
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1
            style={{
              color: 'var(--skillsaware-primary)',
              fontSize: '32px',
              marginBottom: '10px'
            }}
          >
            PDF Certificate Verifier
          </h1>
          <p style={{ color: 'var(--skillsaware-text-secondary)', fontSize: '16px' }}>
            Upload a SkillsAware PDF certificate to verify its authenticity and check for
            modifications
          </p>
        </div>

        {/* Upload Form */}
        <div
          style={{
            backgroundColor: 'var(--skillsaware-bg-primary)',
            padding: '30px',
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            marginBottom: '30px'
          }}
        >
          <form onSubmit={handleVerify}>
            {/* File Upload */}
            <div style={{ marginBottom: '25px' }}>
              <label
                style={{
                  display: 'block',
                  fontWeight: 'bold',
                  marginBottom: '10px',
                  color: 'var(--skillsaware-text-primary)'
                }}
              >
                Select PDF Certificate *
              </label>
              <input
                type='file'
                accept='.pdf,application/pdf'
                onChange={handleFileChange}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px dashed var(--skillsaware-primary)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  backgroundColor: 'var(--skillsaware-hero-teal-light)'
                }}
              />
              {file && (
                <p
                  style={{
                    marginTop: '8px',
                    fontSize: '13px',
                    color: 'var(--skillsaware-text-secondary)'
                  }}
                >
                  Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>

            {/* Info Box */}
            <div className='alert alert-info' style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '14px', margin: 0 }}>
                <strong>✨ Automatic Verification:</strong> All credential data is stored
                in the PDF metadata and will be automatically verified. Just upload and
                click verify!
              </p>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type='submit'
                disabled={verifying || !file}
                className='btn btn-primary'
                style={{
                  flex: 1,
                  opacity: verifying || !file ? 0.6 : 1,
                  cursor: verifying || !file ? 'not-allowed' : 'pointer'
                }}
              >
                {verifying ? 'Verifying...' : 'Verify PDF'}
              </button>
              {(file || result) && (
                <button
                  type='button'
                  onClick={handleReset}
                  className='btn btn-secondary'
                  style={{
                    padding: '14px 24px'
                  }}
                >
                  Reset
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className='alert alert-error' style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '5px' }}>
              ❌ Verification Failed
            </h3>
            <p style={{ fontSize: '14px', margin: 0 }}>{error}</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div
            style={{
              backgroundColor: 'var(--skillsaware-bg-primary)',
              padding: '30px',
              borderRadius: '10px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}
          >
            <h2
              style={{
                fontSize: '24px',
                marginBottom: '25px',
                color: 'var(--skillsaware-text-primary)'
              }}
            >
              Verification Results
            </h2>

            {/* Basic Verification */}
            <div
              className={
                result.basicVerification.valid
                  ? 'alert alert-success'
                  : 'alert alert-error'
              }
              style={{ marginBottom: '25px' }}
            >
              <h3
                style={{
                  fontSize: '18px',
                  marginBottom: '10px'
                }}
              >
                {result.basicVerification.valid
                  ? '✅ Verification: PASSED'
                  : '❌ Verification: FAILED'}
              </h3>
              <p
                style={{
                  fontSize: '14px',
                  color: 'var(--skillsaware-text-secondary)',
                  margin: 0
                }}
              >
                {result.basicVerification.message}
              </p>

              {/* Tamper Detection Details - only show if tampering was detected */}
              {result.basicVerification.tamperDetails &&
                result.basicVerification.tamperDetails.detected && (
                  <div className='alert alert-warning' style={{ marginTop: '15px' }}>
                    <h4 style={{ fontSize: '16px', marginBottom: '12px' }}>
                      🔍 Tampering Details Detected:
                    </h4>

                    {result.basicVerification.tamperDetails.changes?.map(
                      (change: TamperChange, index: number) => (
                        <div
                          key={index}
                          style={{
                            marginBottom: '12px',
                            padding: '12px',
                            backgroundColor: 'var(--skillsaware-bg-primary)',
                            borderRadius: '6px',
                            borderLeft: '4px solid var(--skillsaware-warning)'
                          }}
                        >
                          <div
                            style={{
                              marginBottom: '6px',
                              fontWeight: 'bold',
                              color: 'var(--skillsaware-warning)'
                            }}
                          >
                            {change.field}:
                          </div>
                          <div
                            style={{
                              marginBottom: '4px',
                              paddingLeft: '10px',
                              fontSize: '13px'
                            }}
                          >
                            <strong
                              style={{ color: 'var(--skillsaware-text-secondary)' }}
                            >
                              Original (Expected):
                            </strong>{' '}
                            <span
                              style={{
                                backgroundColor: 'var(--skillsaware-alert-success-bg)',
                                padding: '2px 6px',
                                borderRadius: '3px',
                                color: 'var(--skillsaware-success)',
                                fontFamily: 'monospace'
                              }}
                            >
                              {change.original}
                            </span>
                          </div>
                          <div
                            style={{
                              marginBottom: '4px',
                              paddingLeft: '10px',
                              fontSize: '13px'
                            }}
                          >
                            <strong
                              style={{ color: 'var(--skillsaware-text-secondary)' }}
                            >
                              Current Status:
                            </strong>{' '}
                            <span
                              style={{
                                backgroundColor: 'var(--skillsaware-alert-error-bg)',
                                padding: '2px 6px',
                                borderRadius: '3px',
                                color: 'var(--skillsaware-error)',
                                fontFamily: 'monospace'
                              }}
                            >
                              {change.modified}
                            </span>
                          </div>
                          {change.description && (
                            <div
                              style={{
                                marginTop: '6px',
                                paddingLeft: '10px',
                                fontSize: '12px',
                                color: 'var(--skillsaware-text-secondary)',
                                fontStyle: 'italic'
                              }}
                            >
                              {change.description}
                            </div>
                          )}
                        </div>
                      )
                    )}

                    {result.basicVerification.tamperDetails.warning && (
                      <div
                        className='alert alert-error'
                        style={{ marginTop: '12px', fontSize: '13px' }}
                      >
                        {result.basicVerification.tamperDetails.warning}
                      </div>
                    )}

                    {result.basicVerification.tamperDetails.contentModified &&
                      result.basicVerification.tamperDetails.storedHash && (
                        <div
                          className='alert alert-warning'
                          style={{ marginTop: '12px' }}
                        >
                          <div
                            style={{
                              fontSize: '13px',
                              fontWeight: 'bold',
                              marginBottom: '8px'
                            }}
                          >
                            🔐 Content Hash Verification:
                          </div>
                          <div
                            style={{
                              fontSize: '12px',
                              fontFamily: 'monospace',
                              color: 'var(--skillsaware-text-primary)'
                            }}
                          >
                            <div style={{ marginBottom: '4px' }}>
                              <strong
                                style={{ color: 'var(--skillsaware-text-secondary)' }}
                              >
                                Original Hash:
                              </strong>{' '}
                              <span style={{ color: 'var(--skillsaware-success)' }}>
                                {result.basicVerification.tamperDetails.storedHash}
                              </span>
                            </div>
                            <div style={{ marginBottom: '8px' }}>
                              <strong
                                style={{ color: 'var(--skillsaware-text-secondary)' }}
                              >
                                Current Hash:
                              </strong>{' '}
                              <span style={{ color: 'var(--skillsaware-error)' }}>
                                {result.basicVerification.tamperDetails.currentHash}
                              </span>
                            </div>
                            <div
                              style={{
                                fontSize: '11px',
                                color: 'var(--skillsaware-text-secondary)',
                                fontStyle: 'italic',
                                marginTop: '8px',
                                padding: '8px',
                                backgroundColor: 'var(--skillsaware-bg-primary)',
                                borderRadius: '3px'
                              }}
                            >
                              💡 The content hash is calculated from the
                              certificate&apos;s text content. A mismatch means someone
                              edited the names, skill code, or other text in the PDF after
                              it was issued.
                            </div>
                          </div>
                        </div>
                      )}

                    {result.basicVerification.tamperDetails.extractedData &&
                      Object.keys(result.basicVerification.tamperDetails.extractedData)
                        .length > 0 && (
                        <div className='alert alert-info' style={{ marginTop: '12px' }}>
                          <div
                            style={{
                              fontSize: '13px',
                              fontWeight: 'bold',
                              marginBottom: '8px'
                            }}
                          >
                            📝 Current PDF Content (What we can read):
                          </div>
                          <div
                            style={{
                              fontSize: '12px',
                              fontFamily: 'monospace',
                              color: 'var(--skillsaware-text-primary)'
                            }}
                          >
                            {result.basicVerification.tamperDetails.extractedData
                              .skillCode && (
                              <div style={{ marginBottom: '4px' }}>
                                <strong>Skill Code:</strong>{' '}
                                {
                                  result.basicVerification.tamperDetails.extractedData
                                    .skillCode
                                }
                              </div>
                            )}
                            {result.basicVerification.tamperDetails.extractedData
                              .skillName && (
                              <div style={{ marginBottom: '4px' }}>
                                <strong>Skill Name:</strong>{' '}
                                {
                                  result.basicVerification.tamperDetails.extractedData
                                    .skillName
                                }
                              </div>
                            )}
                            {result.basicVerification.tamperDetails.extractedData
                              .claimantName && (
                              <div style={{ marginBottom: '4px' }}>
                                <strong>Claimant:</strong>{' '}
                                {
                                  result.basicVerification.tamperDetails.extractedData
                                    .claimantName
                                }
                              </div>
                            )}
                            {result.basicVerification.tamperDetails.extractedData
                              .endorserName && (
                              <div style={{ marginBottom: '4px' }}>
                                <strong>Endorser:</strong>{' '}
                                {
                                  result.basicVerification.tamperDetails.extractedData
                                    .endorserName
                                }
                              </div>
                            )}
                          </div>
                          {result.basicVerification.tamperDetails.contentModified && (
                            <div
                              style={{
                                marginTop: '8px',
                                fontSize: '11px',
                                color: 'var(--skillsaware-error)',
                                fontWeight: 'bold'
                              }}
                            >
                              ⚠️ This content doesn&apos;t match the original hash -
                              someone changed the text!
                            </div>
                          )}
                        </div>
                      )}
                  </div>
                )}
            </div>

            {/* Full Verification (if performed) */}
            {result.fullVerification && (
              <div
                className={
                  result.fullVerification.valid
                    ? 'alert alert-success'
                    : 'alert alert-error'
                }
                style={{ marginBottom: '25px' }}
              >
                <h3
                  style={{
                    fontSize: '18px',
                    marginBottom: '10px'
                  }}
                >
                  {result.fullVerification.valid
                    ? '✅ Full Verification: PASSED'
                    : '❌ Full Verification: FAILED'}
                </h3>
                <p style={{ fontSize: '14px', margin: 0 }}>
                  {result.fullVerification.message}
                </p>
                {result.fullVerification.valid && (
                  <div
                    style={{
                      marginTop: '15px',
                      padding: '15px',
                      backgroundColor: 'var(--skillsaware-bg-primary)',
                      borderRadius: '5px'
                    }}
                  >
                    <p
                      style={{
                        fontSize: '14px',
                        color: 'var(--skillsaware-success)',
                        fontWeight: 'bold',
                        margin: 0
                      }}
                    >
                      🔒 This PDF is authentic and has NOT been modified since issuance.
                    </p>
                  </div>
                )}
                {!result.fullVerification.valid && (
                  <div
                    style={{
                      marginTop: '15px',
                      padding: '15px',
                      backgroundColor: 'var(--skillsaware-bg-primary)',
                      borderRadius: '5px'
                    }}
                  >
                    <p
                      style={{
                        fontSize: '14px',
                        color: 'var(--skillsaware-error)',
                        fontWeight: 'bold',
                        margin: 0
                      }}
                    >
                      ⚠️ This PDF may have been modified or the credential data
                      doesn&apos;t match.
                    </p>
                  </div>
                )}

                {/* Verification Details */}
                {result.fullVerification.details && (
                  <div
                    style={{
                      marginTop: '15px',
                      padding: '15px',
                      backgroundColor: 'var(--skillsaware-bg-secondary)',
                      borderRadius: '5px'
                    }}
                  >
                    <h4
                      style={{
                        fontSize: '14px',
                        marginBottom: '10px',
                        color: 'var(--skillsaware-text-primary)'
                      }}
                    >
                      Verification Details:
                    </h4>
                    <div
                      style={{
                        fontSize: '13px',
                        color: 'var(--skillsaware-text-secondary)',
                        fontFamily: 'monospace'
                      }}
                    >
                      <div style={{ marginBottom: '8px' }}>
                        <strong>Skill Code:</strong>{' '}
                        {result.fullVerification.details.providedData?.skillCode}
                      </div>
                      <div style={{ marginBottom: '8px' }}>
                        <strong>Claimant Name:</strong>{' '}
                        {result.fullVerification.details.providedData?.claimantName}
                      </div>
                      <div style={{ marginBottom: '8px' }}>
                        <strong>Endorser Name:</strong>{' '}
                        {result.fullVerification.details.providedData?.endorserName}
                      </div>
                      <div style={{ marginBottom: '8px' }}>
                        <strong>PDF Timestamp:</strong>{' '}
                        {result.fullVerification.details.pdfTimestamp}
                      </div>
                      {!result.fullVerification.valid &&
                        result.fullVerification.details.differences &&
                        result.fullVerification.details.differences.length > 0 && (
                          <>
                            <div style={{ marginTop: '12px', marginBottom: '12px' }}>
                              <strong style={{ color: 'var(--skillsaware-error)' }}>
                                ❌ Found{' '}
                                {result.fullVerification.details.differences.length}{' '}
                                Difference(s):
                              </strong>
                            </div>
                            {result.fullVerification.details.differences.map(
                              (diff: VerificationDifference, index: number) => (
                                <div
                                  key={index}
                                  className='alert alert-error'
                                  style={{ marginBottom: '12px' }}
                                >
                                  <div
                                    style={{
                                      marginBottom: '6px',
                                      fontWeight: 'bold'
                                    }}
                                  >
                                    {diff.field}:
                                  </div>
                                  <div
                                    style={{ marginBottom: '4px', paddingLeft: '10px' }}
                                  >
                                    <strong
                                      style={{
                                        color: 'var(--skillsaware-text-secondary)'
                                      }}
                                    >
                                      You entered:
                                    </strong>{' '}
                                    <span
                                      style={{
                                        backgroundColor: 'var(--skillsaware-bg-primary)',
                                        padding: '2px 6px',
                                        borderRadius: '3px',
                                        color: 'var(--skillsaware-error)',
                                        fontWeight: 'bold'
                                      }}
                                    >
                                      {diff.youEntered}
                                    </span>
                                  </div>
                                  <div style={{ paddingLeft: '10px' }}>
                                    <strong
                                      style={{
                                        color: 'var(--skillsaware-text-secondary)'
                                      }}
                                    >
                                      PDF contains:
                                    </strong>{' '}
                                    <span
                                      style={{
                                        backgroundColor: 'var(--skillsaware-bg-primary)',
                                        padding: '2px 6px',
                                        borderRadius: '3px',
                                        color: 'var(--skillsaware-success)',
                                        fontWeight: 'bold'
                                      }}
                                    >
                                      {diff.pdfContains}
                                    </span>
                                  </div>
                                </div>
                              )
                            )}
                            {result.fullVerification.details.hint && (
                              <div
                                style={{
                                  marginTop: '12px',
                                  padding: '10px',
                                  backgroundColor: '#fff3cd',
                                  borderRadius: '4px',
                                  color: '#856404'
                                }}
                              >
                                💡 {result.fullVerification.details.hint}
                              </div>
                            )}
                          </>
                        )}
                      {!result.fullVerification.valid &&
                        result.fullVerification.details.expectedSignature &&
                        (!result.fullVerification.details.differences ||
                          result.fullVerification.details.differences.length === 0) && (
                          <>
                            <div style={{ marginTop: '12px', marginBottom: '8px' }}>
                              <strong style={{ color: '#c62828' }}>
                                Signature Mismatch:
                              </strong>
                            </div>
                            <div style={{ marginBottom: '8px', paddingLeft: '10px' }}>
                              <strong>Expected:</strong>{' '}
                              {result.fullVerification.details.expectedSignature}
                            </div>
                            <div style={{ marginBottom: '8px', paddingLeft: '10px' }}>
                              <strong>Found:</strong>{' '}
                              {result.fullVerification.details.foundSignature}
                            </div>
                            {result.fullVerification.details.hint && (
                              <div
                                style={{
                                  marginTop: '12px',
                                  padding: '10px',
                                  backgroundColor: '#fff3cd',
                                  borderRadius: '4px',
                                  color: '#856404'
                                }}
                              >
                                💡 {result.fullVerification.details.hint}
                              </div>
                            )}
                          </>
                        )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PDF Metadata */}
            <div
              style={{
                backgroundColor: '#f8f9ff',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '25px'
              }}
            >
              <h3 style={{ fontSize: '18px', marginBottom: '15px', color: '#333' }}>
                📄 PDF Metadata
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                {result.metadata.title && (
                  <div>
                    <strong style={{ fontSize: '13px', color: '#666' }}>Title:</strong>
                    <p style={{ fontSize: '14px', margin: '4px 0 0 0' }}>
                      {result.metadata.title}
                    </p>
                  </div>
                )}
                {result.metadata.author && (
                  <div>
                    <strong style={{ fontSize: '13px', color: '#666' }}>Author:</strong>
                    <p style={{ fontSize: '14px', margin: '4px 0 0 0' }}>
                      {result.metadata.author}
                    </p>
                  </div>
                )}
                {result.metadata.creator && (
                  <div>
                    <strong style={{ fontSize: '13px', color: '#666' }}>Creator:</strong>
                    <p style={{ fontSize: '14px', margin: '4px 0 0 0' }}>
                      {result.metadata.creator}
                    </p>
                  </div>
                )}
                {result.metadata.creationDate && (
                  <div>
                    <strong style={{ fontSize: '13px', color: '#666' }}>Created:</strong>
                    <p style={{ fontSize: '14px', margin: '4px 0 0 0' }}>
                      {new Date(result.metadata.creationDate).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* SkillsAware Custom Fields */}
            {Object.keys(result.metadata.customFields).length > 0 && (
              <div
                style={{
                  backgroundColor: '#fff3e0',
                  padding: '20px',
                  borderRadius: '8px'
                }}
              >
                <h3 style={{ fontSize: '18px', marginBottom: '15px', color: '#e65100' }}>
                  🔐 SkillsAware Signature Data
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                  {Object.entries(result.metadata.customFields).map(([key, value]) => (
                    <div key={key}>
                      <strong style={{ fontSize: '13px', color: '#666' }}>{key}:</strong>
                      <p
                        style={{
                          fontSize: '12px',
                          fontFamily: 'monospace',
                          backgroundColor: 'white',
                          padding: '8px',
                          borderRadius: '4px',
                          margin: '4px 0 0 0',
                          wordBreak: 'break-all'
                        }}
                      >
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info Section */}
        <div
          style={{
            backgroundColor: '#e3f2fd',
            border: '1px solid #2196f3',
            padding: '20px',
            borderRadius: '8px',
            marginTop: '30px'
          }}
        >
          <h3 style={{ fontSize: '16px', marginBottom: '10px', color: '#1565c0' }}>
            ℹ️ How Verification Works
          </h3>
          <ul style={{ fontSize: '14px', color: '#555', paddingLeft: '20px', margin: 0 }}>
            <li style={{ marginBottom: '8px' }}>
              <strong>Basic Verification:</strong> Checks if the PDF is from SkillsAware
              and has proper signature format
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>Full Verification:</strong> Verifies the cryptographic signature
              against original credential data
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>Signature:</strong> HMAC-SHA256 hash ensures the PDF hasn&apos;t
              been modified
            </li>
            <li>
              <strong>Security:</strong> Any modification to the PDF content will
              invalidate the signature
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
