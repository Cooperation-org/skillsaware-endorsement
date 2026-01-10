'use client'

import { useState } from 'react'
import { JwtPayload } from '@/types/jwt'
import Navbar from '../../components/Navbar'

interface EndorserFormClientProps {
  readonly payload: JwtPayload
  readonly token: string
}

export default function EndorserFormClient({ payload, token }: EndorserFormClientProps) {
  const [endorsementText, setEndorsementText] = useState('')
  const [bonaFides, setBonaFides] = useState('')
  const [evidenceUrls, setEvidenceUrls] = useState<string[]>([])
  const [signature, setSignature] = useState('')
  const [consent, setConsent] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [urlErrors, setUrlErrors] = useState<{ [key: number]: string }>({})
  const [downloadLinks, setDownloadLinks] = useState<{
    jsonUrl: string
    pdfUrl: string
    jsonBase64?: string
    pdfBase64?: string
  } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    if (!consent) {
      setError('You must provide consent to submit the endorsement')
      setSubmitting(false)
      return
    }

    // Check if there are any URL validation errors
    if (Object.keys(urlErrors).length > 0) {
      setError('Please fix the invalid URL(s) before submitting')
      setSubmitting(false)
      return
    }

    try {
      // Filter out empty URLs and validate URL format
      const filteredEvidence = evidenceUrls
        .map(url => url.trim())
        .filter(url => url !== '')

      // Basic URL validation before sending
      const validUrls = filteredEvidence.filter(url => {
        try {
          new URL(url)
          return true
        } catch {
          return false
        }
      })

      const response = await fetch('/api/v1/endorsements/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          endorsement_text: endorsementText,
          bona_fides: bonaFides,
          evidence_urls: validUrls.length > 0 ? validUrls : undefined,
          signature: signature
        })
      })

      if (!response.ok) {
        const data = await response.json()
        // Show more detailed error message if available
        if (data.details) {
          throw new Error(`Invalid request: ${JSON.stringify(data.details)}`)
        }
        throw new Error(data.error || 'Failed to submit endorsement')
      }

      const result = await response.json()

      // Build download URLs with query params for regeneration
      const evidenceParam =
        validUrls.length > 0
          ? `&evidence_urls=${encodeURIComponent(JSON.stringify(validUrls))}`
          : ''
      const jsonUrl = `/api/v1/endorsements/${payload.claim_id}/download/json?token=${token}&endorsement_text=${encodeURIComponent(endorsementText)}&bona_fides=${encodeURIComponent(bonaFides)}&signature=${encodeURIComponent(signature)}${evidenceParam}`
      const pdfUrl = `/api/v1/endorsements/${payload.claim_id}/download/pdf?token=${token}&endorsement_text=${encodeURIComponent(endorsementText)}&bona_fides=${encodeURIComponent(bonaFides)}&signature=${encodeURIComponent(signature)}${evidenceParam}`

      setDownloadLinks({
        jsonUrl,
        pdfUrl,
        jsonBase64: result.downloads?.json?.base64,
        pdfBase64: result.downloads?.pdf?.base64
      })
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  const addEvidenceField = () => {
    setEvidenceUrls([...evidenceUrls, ''])
  }

  const removeEvidenceField = (index: number) => {
    const newUrls = evidenceUrls.filter((_, i) => i !== index)
    setEvidenceUrls(newUrls)
    // Reindex errors for remaining fields
    const reindexedErrors: { [key: number]: string } = {}
    Object.keys(urlErrors).forEach(key => {
      const oldIndex = parseInt(key)
      if (oldIndex > index) {
        reindexedErrors[oldIndex - 1] = urlErrors[oldIndex]
      } else if (oldIndex < index) {
        reindexedErrors[oldIndex] = urlErrors[oldIndex]
      }
      // Skip the deleted index
    })
    setUrlErrors(reindexedErrors)
  }

  const updateEvidenceUrl = (index: number, value: string) => {
    const newUrls = [...evidenceUrls]
    newUrls[index] = value
    setEvidenceUrls(newUrls)

    // Validate URL format if not empty
    if (value.trim() === '') {
      // Clear error if field is empty
      const newErrors = { ...urlErrors }
      delete newErrors[index]
      setUrlErrors(newErrors)
    } else {
      try {
        new URL(value.trim())
        // Clear error if URL is valid
        const newErrors = { ...urlErrors }
        delete newErrors[index]
        setUrlErrors(newErrors)
      } catch {
        setUrlErrors({
          ...urlErrors,
          [index]: 'Please enter a valid URL (e.g., https://example.com)'
        })
      }
    }
  }

  // Helper function to trigger browser download from base64
  const downloadBase64File = (base64: string, filename: string, mimeType: string) => {
    try {
      const byteCharacters = atob(base64)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.codePointAt(i) ?? 0
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: mimeType })
      const url = globalThis.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      globalThis.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
      alert('Direct download failed. Please use the download link instead.')
    }
  }

  if (success) {
    return (
      <div
        className='min-h-screen flex flex-col'
        style={{ backgroundColor: 'var(--skillsaware-bg-secondary)' }}
      >
        <Navbar />

        {/* Main Content */}
        <div className='flex flex-1 flex-col items-center py-8 md:py-12 px-4 md:px-8'>
          <div className='flex flex-col max-w-[800px] w-full gap-8'>
            {/* Success State */}
            <div
              className='flex flex-col items-center justify-center p-8 md:p-12 card rounded-xl shadow-lg border text-center'
              style={{ borderColor: 'var(--skillsaware-border)' }}
            >
              <div
                className='size-16 rounded-full flex items-center justify-center mb-6'
                style={{ backgroundColor: 'rgba(54, 179, 126, 0.1)' }}
              >
                <span
                  className='material-symbols-outlined'
                  style={{ fontSize: '40px', color: 'var(--skillsaware-success)' }}
                >
                  check_circle
                </span>
              </div>
              <h2
                className='text-2xl font-bold mb-2'
                style={{ color: 'var(--skillsaware-text-primary)' }}
              >
                Endorsement Submitted Successfully!
              </h2>
              <p
                className='max-w-md mx-auto mb-8'
                style={{ color: 'var(--skillsaware-text-secondary)' }}
              >
                Thank you for verifying this claim. The credential has been
                cryptographically signed and issued to the claimant.
              </p>
              {downloadLinks && (
                <div className='flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center items-center'>
                  {downloadLinks.pdfBase64 ? (
                    <button
                      onClick={() =>
                        downloadBase64File(
                          downloadLinks.pdfBase64!,
                          `${payload.skill_code}-${payload.claim_id}.pdf`,
                          'application/pdf'
                        )
                      }
                      className='flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg border hover:bg-slate-50 transition-colors text-sm font-semibold'
                      style={{
                        borderColor: 'var(--skillsaware-border)',
                        backgroundColor: 'var(--skillsaware-bg-primary)',
                        color: 'var(--skillsaware-text-primary)',
                        minWidth: '250px',
                        maxWidth: '300px'
                      }}
                    >
                      <span
                        className='material-symbols-outlined'
                        style={{ fontSize: '20px', color: 'var(--skillsaware-error)' }}
                      >
                        picture_as_pdf
                      </span>
                      Download Certificate
                    </button>
                  ) : (
                    <a
                      href={downloadLinks.pdfUrl}
                      download
                      className='flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg border hover:bg-slate-50 transition-colors text-sm font-semibold'
                      style={{
                        borderColor: 'var(--skillsaware-border)',
                        backgroundColor: 'var(--skillsaware-bg-primary)',
                        color: 'var(--skillsaware-text-primary)',
                        minWidth: '250px',
                        maxWidth: '300px'
                      }}
                    >
                      <span
                        className='material-symbols-outlined'
                        style={{ fontSize: '20px', color: 'var(--skillsaware-error)' }}
                      >
                        picture_as_pdf
                      </span>
                      Download Certificate
                    </a>
                  )}
                  {downloadLinks.jsonBase64 ? (
                    <button
                      onClick={() =>
                        downloadBase64File(
                          downloadLinks.jsonBase64!,
                          `${payload.skill_code}-${payload.claim_id}.obv3.json`,
                          'application/json'
                        )
                      }
                      className='flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg border hover:bg-slate-50 transition-colors text-sm font-semibold'
                      style={{
                        borderColor: 'var(--skillsaware-border)',
                        backgroundColor: 'var(--skillsaware-bg-primary)',
                        color: 'var(--skillsaware-text-primary)',
                        minWidth: '250px',
                        maxWidth: '300px'
                      }}
                    >
                      <span
                        className='material-symbols-outlined'
                        style={{ fontSize: '20px', color: 'var(--skillsaware-warning)' }}
                      >
                        data_object
                      </span>
                      Download JSON Credential
                    </button>
                  ) : (
                    <a
                      href={downloadLinks.jsonUrl}
                      download
                      className='flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg border hover:bg-slate-50 transition-colors text-sm font-semibold'
                      style={{
                        borderColor: 'var(--skillsaware-border)',
                        backgroundColor: 'var(--skillsaware-bg-primary)',
                        color: 'var(--skillsaware-text-primary)',
                        minWidth: '250px',
                        maxWidth: '300px'
                      }}
                    >
                      <span
                        className='material-symbols-outlined'
                        style={{ fontSize: '20px', color: 'var(--skillsaware-warning)' }}
                      >
                        data_object
                      </span>
                      Download JSON Credential
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className='min-h-screen flex flex-col'
      style={{ backgroundColor: 'var(--skillsaware-bg-secondary)' }}
    >
      <Navbar />

      {/* Main Content */}
      <div className='flex flex-1 flex-col items-center py-8 md:py-12 px-4 md:px-8'>
        <div
          className='flex flex-col max-w-[800px] w-full gap-8'
          style={{ marginTop: '2rem' }}
        >
          {/* Page Heading */}
          <div className='flex flex-col gap-2 text-center md:text-left'>
            <h1
              className='tracking-tight text-3xl md:text-[32px] font-bold leading-tight'
              style={{ color: 'var(--skillsaware-text-primary)' }}
            >
              Skill Endorsement
            </h1>
            <p
              className='text-sm md:text-base font-normal leading-normal'
              style={{ color: 'var(--skillsaware-text-secondary)' }}
            >
              You have been requested to review and endorse a skill claim. Please verify
              the information below and submit your professional attestation.
            </p>
          </div>

          {/* Read-Only Context Section */}
          <section
            className='flex flex-col rounded-xl border overflow-hidden shadow-sm'
            style={{
              borderColor: 'var(--skillsaware-border)',
              backgroundColor: 'var(--skillsaware-bg-primary)'
            }}
          >
            <div
              className='px-6 py-4 border-b'
              style={{
                backgroundColor: 'var(--skillsaware-bg-secondary)',
                borderColor: 'var(--skillsaware-border)',
                paddingTop: '1.5rem'
              }}
            >
              <h3
                className='text-base font-bold leading-tight flex items-center gap-2'
                style={{ color: 'var(--skillsaware-text-primary)' }}
              >
                <span
                  className='material-symbols-outlined'
                  style={{ fontSize: '20px', color: 'var(--skillsaware-primary)' }}
                >
                  verified
                </span>
                Claim Information
              </h3>
            </div>
            <div className='p-6 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8'>
              <div>
                <p
                  className='text-xs font-semibold uppercase tracking-wider mb-1'
                  style={{ color: 'var(--skillsaware-text-secondary)' }}
                >
                  Claimant
                </p>
                <div className='flex items-center gap-3'>
                  <div
                    className='size-8 rounded-full overflow-hidden shrink-0'
                    style={{ backgroundColor: 'var(--skillsaware-bg-tertiary)' }}
                  >
                    <span
                      className='material-symbols-outlined text-sm flex items-center justify-center w-full h-full'
                      style={{ color: 'var(--skillsaware-text-secondary)' }}
                    >
                      person
                    </span>
                  </div>
                  <p
                    className='text-sm font-medium'
                    style={{ color: 'var(--skillsaware-text-primary)' }}
                  >
                    {payload.claimant_name}
                  </p>
                </div>
              </div>
              <div>
                <p
                  className='text-xs font-semibold uppercase tracking-wider mb-1'
                  style={{ color: 'var(--skillsaware-text-secondary)' }}
                >
                  Skill Name
                </p>
                <p
                  className='text-sm font-medium'
                  style={{ color: 'var(--skillsaware-text-primary)' }}
                >
                  {payload.skill_name}
                </p>
              </div>
              <div>
                <p
                  className='text-xs font-semibold uppercase tracking-wider mb-1'
                  style={{ color: 'var(--skillsaware-text-secondary)' }}
                >
                  Skill Code
                </p>
                <code
                  className='text-xs px-2 py-1 rounded font-mono border'
                  style={{
                    backgroundColor: 'var(--skillsaware-bg-secondary)',
                    color: 'var(--skillsaware-text-primary)',
                    borderColor: 'var(--skillsaware-border)'
                  }}
                >
                  {payload.skill_code}
                </code>
              </div>
              <div className='col-span-1 md:col-span-2 mt-2'>
                <p
                  className='text-xs font-semibold uppercase tracking-wider mb-2'
                  style={{ color: 'var(--skillsaware-text-secondary)' }}
                >
                  Claimant Narrative
                </p>
                <div
                  className='border-l-4 p-4 rounded-r-lg'
                  style={{
                    backgroundColor: 'var(--skillsaware-bg-secondary)',
                    borderColor: 'var(--skillsaware-primary)'
                  }}
                >
                  <p
                    className='text-sm italic leading-relaxed'
                    style={{ color: 'var(--skillsaware-text-primary)' }}
                  >
                    &quot;{payload.claimant_narrative}&quot;
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Endorsement Form */}
          <form
            onSubmit={handleSubmit}
            className='flex flex-col rounded-xl border overflow-hidden shadow-lg'
            style={{
              borderColor: 'var(--skillsaware-border)',
              backgroundColor: 'var(--skillsaware-bg-primary)'
            }}
          >
            <div
              className='px-6 py-5 border-b flex justify-between items-center'
              style={{
                borderColor: 'var(--skillsaware-border)',
                paddingTop: '1.5rem',
                paddingBottom: '1.5rem'
              }}
            >
              <h3
                className='text-lg font-bold leading-tight'
                style={{ color: 'var(--skillsaware-text-primary)' }}
              >
                Your Endorsement
              </h3>
              <span
                className='px-2 py-1 rounded-full text-xs font-medium'
                style={{
                  backgroundColor: 'rgba(19, 127, 236, 0.1)',
                  color: 'var(--skillsaware-primary)',
                  paddingLeft: '1rem',
                  paddingRight: '1rem',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 'fit-content'
                }}
              >
                Step 2 of 2
              </span>
            </div>
            <div className='p-6 md:p-8 flex flex-col gap-8'>
              {/* Identity Field (Read-only) */}
              <div className='flex flex-col gap-2'>
                <label
                  className='text-sm font-semibold flex items-center gap-1'
                  htmlFor='endorserEmail'
                  style={{ color: 'var(--skillsaware-text-primary)' }}
                >
                  Endorsing as
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <span
                      className='material-symbols-outlined'
                      style={{
                        fontSize: '18px',
                        color: 'var(--skillsaware-text-tertiary)'
                      }}
                    >
                      email
                    </span>
                  </div>
                  <input
                    className='w-full rounded-lg border pl-10 pr-3 py-3 text-sm focus:outline-none transition-all cursor-not-allowed opacity-75'
                    id='endorserEmail'
                    type='text'
                    value={payload.endorser_email || ''}
                    readOnly
                    disabled
                    style={{
                      borderColor: 'var(--skillsaware-border)',
                      backgroundColor: 'var(--skillsaware-bg-secondary)',
                      color: 'var(--skillsaware-text-secondary)'
                    }}
                  />
                </div>
                <p
                  className='text-xs'
                  style={{ color: 'var(--skillsaware-text-tertiary)' }}
                >
                  This is the email address associated with your secure endorsement
                  link.
                </p>
              </div>

              {/* Credentials Field */}
              <div className='flex flex-col gap-2'>
                <label
                  className='text-sm font-semibold flex items-center gap-1'
                  htmlFor='credentials'
                  style={{ color: 'var(--skillsaware-text-primary)' }}
                >
                  Your Credentials / Bona Fides{' '}
                  <span style={{ color: 'var(--skillsaware-error)' }}>*</span>
                </label>
                <p
                  className='text-xs'
                  style={{ color: 'var(--skillsaware-text-secondary)' }}
                >
                  Why are you qualified to endorse this claim? (e.g., Senior Engineer,
                  Project Lead)
                </p>
                <textarea
                  className='w-full rounded-lg border p-3 text-sm focus:outline-none focus:ring-1 transition-all resize-none'
                  id='credentials'
                  value={bonaFides}
                  onChange={e => setBonaFides(e.target.value)}
                  required
                  placeholder='e.g., I have 10 years of experience in React and supervised Jane on the Alpha project...'
                  rows={3}
                  style={{
                    borderColor: 'var(--skillsaware-border)',
                    backgroundColor: 'var(--skillsaware-bg-primary)',
                    color: 'var(--skillsaware-text-primary)'
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = 'var(--skillsaware-primary)'
                    e.target.style.boxShadow = '0 0 0 1px var(--skillsaware-primary)'
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = 'var(--skillsaware-border)'
                    e.target.style.boxShadow = 'none'
                  }}
                />
              </div>

              {/* Statement Field */}
              <div className='flex flex-col gap-2'>
                <label
                  className='text-sm font-semibold flex items-center gap-1'
                  htmlFor='statement'
                  style={{ color: 'var(--skillsaware-text-primary)' }}
                >
                  Endorsement Statement{' '}
                  <span style={{ color: 'var(--skillsaware-error)' }}>*</span>
                </label>
                <textarea
                  className='w-full rounded-lg border p-3 text-sm focus:outline-none focus:ring-1 transition-all resize-none'
                  id='statement'
                  value={endorsementText}
                  onChange={e => setEndorsementText(e.target.value)}
                  required
                  placeholder='Provide your professional evaluation of the skill claim...'
                  rows={5}
                  style={{
                    borderColor: 'var(--skillsaware-border)',
                    backgroundColor: 'var(--skillsaware-bg-primary)',
                    color: 'var(--skillsaware-text-primary)'
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = 'var(--skillsaware-primary)'
                    e.target.style.boxShadow = '0 0 0 1px var(--skillsaware-primary)'
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = 'var(--skillsaware-border)'
                    e.target.style.boxShadow = 'none'
                  }}
                />
              </div>

              {/* Supporting Evidence (Dynamic List) */}
              <div className='flex flex-col gap-3'>
                <div className='flex justify-between items-center'>
                  <div
                    className='text-sm font-semibold'
                    style={{ color: 'var(--skillsaware-text-primary)' }}
                  >
                    Supporting Evidence
                  </div>
                  <span
                    className='text-xs px-2 py-0.5 rounded'
                    style={{
                      backgroundColor: 'var(--skillsaware-bg-secondary)',
                      color: 'var(--skillsaware-text-secondary)'
                    }}
                  >
                    Optional
                  </span>
                </div>
                <div className='flex flex-col gap-3'>
                  {evidenceUrls.map((url, index) => (
                    <div key={index} className='flex flex-col gap-2'>
                      <div className='flex flex-col sm:flex-row items-start sm:items-center gap-2'>
                        <div className='relative flex-1'>
                          <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                            <span
                              className='material-symbols-outlined'
                              style={{
                                fontSize: '18px',
                                color: 'var(--skillsaware-text-tertiary)'
                              }}
                            >
                              link
                            </span>
                          </div>
                          <input
                            className='w-full pl-10 rounded-lg border py-2.5 text-sm focus:outline-none focus:ring-1 transition-all'
                            type='url'
                            value={url}
                            onChange={e => updateEvidenceUrl(index, e.target.value)}
                            placeholder='https://github.com/project/repo...'
                            style={{
                              borderColor: urlErrors[index]
                                ? 'var(--skillsaware-error)'
                                : 'var(--skillsaware-border)',
                              backgroundColor: 'var(--skillsaware-bg-primary)',
                              color: 'var(--skillsaware-text-primary)'
                            }}
                            onFocus={e => {
                              e.target.style.borderColor = 'var(--skillsaware-primary)'
                              e.target.style.boxShadow =
                                '0 0 0 1px var(--skillsaware-primary)'
                            }}
                            onBlur={e => {
                              e.target.style.borderColor = urlErrors[index]
                                ? 'var(--skillsaware-error)'
                                : 'var(--skillsaware-border)'
                              e.target.style.boxShadow = 'none'
                            }}
                          />
                        </div>
                        <button
                          type='button'
                          onClick={() => removeEvidenceField(index)}
                          className='p-2 transition-colors shrink-0'
                          style={{ color: 'var(--skillsaware-text-tertiary)' }}
                          title='Remove URL'
                        >
                          <span
                            className='material-symbols-outlined'
                            style={{ fontSize: '20px' }}
                          >
                            delete
                          </span>
                        </button>
                      </div>
                      {urlErrors[index] && (
                        <p
                          className='text-xs'
                          style={{ color: 'var(--skillsaware-error)' }}
                        >
                          {urlErrors[index]}
                        </p>
                      )}
                    </div>
                  ))}
                  <button
                    className='flex items-center gap-1.5 text-sm font-medium transition-colors px-4 py-2.5 rounded-lg border whitespace-nowrap w-full sm:w-auto'
                    type='button'
                    onClick={addEvidenceField}
                    style={{
                      borderColor: 'var(--skillsaware-border)',
                      backgroundColor: 'var(--skillsaware-bg-primary)',
                      color: 'var(--skillsaware-text-primary)'
                    }}
                  >
                    <span
                      className='material-symbols-outlined'
                      style={{ fontSize: '18px' }}
                    >
                      add
                    </span>
                    Add URL
                  </button>
                </div>
              </div>

              {/* Divider */}
              <hr style={{ borderColor: 'var(--skillsaware-border)' }} />

              {/* Digital Signature */}
              <div className='flex flex-col gap-2'>
                <label
                  className='text-sm font-semibold flex items-center gap-1'
                  htmlFor='signature'
                  style={{ color: 'var(--skillsaware-text-primary)' }}
                >
                  Digital Signature{' '}
                  <span style={{ color: 'var(--skillsaware-error)' }}>*</span>
                </label>
                <p
                  className='text-xs'
                  style={{ color: 'var(--skillsaware-text-secondary)' }}
                >
                  Type your full legal name to sign this endorsement.
                </p>
                <div className='relative'>
                  <input
                    className='w-full rounded-lg border p-3 text-sm font-mono focus:outline-none focus:ring-1 transition-all'
                    id='signature'
                    type='text'
                    value={signature}
                    onChange={e => setSignature(e.target.value)}
                    required
                    placeholder='Full Name'
                    style={{
                      borderColor: 'var(--skillsaware-border)',
                      backgroundColor: 'var(--skillsaware-bg-secondary)',
                      color: 'var(--skillsaware-text-primary)'
                    }}
                    onFocus={e => {
                      e.target.style.borderColor = 'var(--skillsaware-primary)'
                      e.target.style.boxShadow = '0 0 0 1px var(--skillsaware-primary)'
                      e.target.style.backgroundColor = 'var(--skillsaware-bg-primary)'
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = 'var(--skillsaware-border)'
                      e.target.style.boxShadow = 'none'
                      e.target.style.backgroundColor = 'var(--skillsaware-bg-secondary)'
                    }}
                  />
                </div>
              </div>

              {/* Consent Checkbox */}
              <div
                className='flex gap-3 items-start p-4 rounded-lg border'
                style={{
                  backgroundColor: 'rgba(19, 127, 236, 0.05)',
                  borderColor: 'rgba(19, 127, 236, 0.2)'
                }}
              >
                <div className='flex h-6 items-center'>
                  <input
                    className='h-5 w-5 rounded border focus:ring-primary'
                    id='consent'
                    name='consent'
                    type='checkbox'
                    checked={consent}
                    onChange={e => setConsent(e.target.checked)}
                    style={{
                      borderColor: 'var(--skillsaware-border)',
                      cursor: 'pointer'
                    }}
                  />
                </div>
                <div className='text-sm leading-6'>
                  <label
                    className='font-medium'
                    htmlFor='consent'
                    style={{ color: 'var(--skillsaware-text-primary)' }}
                  >
                    I certify that this endorsement is accurate.
                  </label>
                  <p
                    className='text-xs mt-1'
                    style={{ color: 'var(--skillsaware-text-secondary)' }}
                  >
                    By checking this box, I confirm that I have reviewed the claim and
                    that my endorsement is based on professional knowledge of the
                    claimant&apos;s skills. I understand this credential will be
                    cryptographically signed.
                  </p>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div
                  className='flex items-center gap-2 p-3 rounded-lg border'
                  style={{
                    backgroundColor: 'rgba(222, 53, 11, 0.1)',
                    borderColor: 'rgba(222, 53, 11, 0.2)',
                    color: 'var(--skillsaware-error)'
                  }}
                >
                  <span
                    className='material-symbols-outlined'
                    style={{ fontSize: '20px' }}
                  >
                    error
                  </span>
                  <span className='text-sm font-medium'>{error}</span>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div
              className='px-6 py-5 border-t flex flex-col md:flex-row justify-end items-center gap-4'
              style={{
                backgroundColor: 'var(--skillsaware-bg-secondary)',
                borderColor: 'var(--skillsaware-border)'
              }}
            >
              <button
                type='button'
                className='text-sm font-bold px-4 py-2 transition-colors'
                style={{ color: 'var(--skillsaware-text-secondary)' }}
              >
                Cancel
              </button>
              <button
                type='submit'
                disabled={submitting}
                className='flex min-w-[180px] items-center justify-center overflow-hidden rounded-lg h-11 px-6 text-white text-sm font-bold leading-normal transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed'
                style={{
                  backgroundColor: submitting
                    ? 'var(--skillsaware-text-tertiary)'
                    : 'var(--skillsaware-primary)',
                  cursor: submitting ? 'not-allowed' : 'pointer'
                }}
              >
                {submitting ? (
                  <>
                    <svg
                      className='animate-spin -ml-1 mr-3 h-4 w-4 text-white'
                      fill='none'
                      viewBox='0 0 24 24'
                      xmlns='http://www.w3.org/2000/svg'
                    >
                      <circle
                        className='opacity-25'
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='currentColor'
                        strokeWidth='4'
                      ></circle>
                      <path
                        className='opacity-75'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                        fill='currentColor'
                      ></path>
                    </svg>
                    <span className='truncate'>Submitting...</span>
                  </>
                ) : (
                  <span className='truncate'>Submit Endorsement</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
