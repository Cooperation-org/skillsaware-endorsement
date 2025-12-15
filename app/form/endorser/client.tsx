'use client'

import { useState } from 'react'
import Image from 'next/image'
import { JwtPayload } from '@/types/jwt'

interface EndorserFormClientProps {
  payload: JwtPayload
  token: string
}

export default function EndorserFormClient({ payload, token }: EndorserFormClientProps) {
  const [endorsementText, setEndorsementText] = useState('')
  const [bonaFides, setBonaFides] = useState('')
  const [evidenceUrls, setEvidenceUrls] = useState<string[]>([''])
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

  const updateEvidenceUrl = (index: number, value: string) => {
    const newUrls = [...evidenceUrls]
    newUrls[index] = value
    setEvidenceUrls(newUrls)

    // Validate URL format if not empty
    if (value.trim() !== '') {
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
    } else {
      // Clear error if field is empty
      const newErrors = { ...urlErrors }
      delete newErrors[index]
      setUrlErrors(newErrors)
    }
  }

  // Helper function to trigger browser download from base64
  const downloadBase64File = (base64: string, filename: string, mimeType: string) => {
    try {
      const byteCharacters = atob(base64)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: mimeType })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
      alert('Direct download failed. Please use the download link instead.')
    }
  }

  if (success) {
    return (
      <div
        className='container'
        style={{
          padding: '40px',
          maxWidth: '800px',
          margin: '0 auto',
          textAlign: 'center'
        }}
      >
        <div style={{ marginBottom: '30px' }}>
          <Image
            src='/logo/skillsaware-logo.svg'
            alt='SkillsAware Logo'
            width={200}
            height={60}
            className='skillsaware-logo'
            style={{ margin: '0 auto 20px' }}
          />
        </div>
        <h1>Endorsement Submitted Successfully!</h1>
        <div
          className='alert alert-success'
          style={{ padding: '30px', textAlign: 'left' }}
        >
          <svg
            style={{ width: '64px', height: '64px', marginBottom: '20px' }}
            fill='none'
            stroke='var(--skillsaware-success)'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M5 13l4 4L19 7'
            />
          </svg>
          <h2 style={{ color: 'var(--skillsaware-success)', marginBottom: '10px' }}>
            Thank You!
          </h2>
          <p
            style={{
              fontSize: '16px',
              color: 'var(--skillsaware-text-secondary)',
              marginBottom: '30px'
            }}
          >
            Your endorsement for <strong>{payload.claimant_name}</strong> has been
            recorded.
            <br />
            The credential and PDF certificate have been generated.
          </p>

          {downloadLinks && (
            <div style={{ marginTop: '30px' }}>
              <h3
                style={{
                  fontSize: '18px',
                  color: 'var(--skillsaware-text-primary)',
                  marginBottom: '20px'
                }}
              >
                Download Your Credentials
              </h3>
              <div
                style={{
                  display: 'flex',
                  gap: '15px',
                  justifyContent: 'center',
                  flexWrap: 'wrap'
                }}
              >
                {/* PDF Download Button */}
                {downloadLinks.pdfBase64 ? (
                  <button
                    onClick={() =>
                      downloadBase64File(
                        downloadLinks.pdfBase64!,
                        `${payload.skill_code}-${payload.claim_id}.pdf`,
                        'application/pdf'
                      )
                    }
                    className='btn'
                    style={{ backgroundColor: 'var(--skillsaware-error)' }}
                  >
                    <svg width='20' height='20' fill='currentColor' viewBox='0 0 24 24'>
                      <path d='M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z' />
                    </svg>
                    Download PDF Certificate
                  </button>
                ) : (
                  <a
                    href={downloadLinks.pdfUrl}
                    download
                    className='btn'
                    style={{
                      backgroundColor: 'var(--skillsaware-error)',
                      color: 'var(--skillsaware-text-inverse)'
                    }}
                  >
                    <svg width='20' height='20' fill='currentColor' viewBox='0 0 24 24'>
                      <path d='M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z' />
                    </svg>
                    Download PDF Certificate
                  </a>
                )}

                {/* JSON Download Button */}
                {downloadLinks.jsonBase64 ? (
                  <button
                    onClick={() =>
                      downloadBase64File(
                        downloadLinks.jsonBase64!,
                        `${payload.skill_code}-${payload.claim_id}.obv3.json`,
                        'application/json'
                      )
                    }
                    className='btn btn-primary'
                  >
                    <svg width='20' height='20' fill='currentColor' viewBox='0 0 24 24'>
                      <path d='M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z' />
                    </svg>
                    Download JSON Credential
                  </button>
                ) : (
                  <a href={downloadLinks.jsonUrl} download className='btn btn-primary'>
                    <svg width='20' height='20' fill='currentColor' viewBox='0 0 24 24'>
                      <path d='M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z' />
                    </svg>
                    Download JSON Credential
                  </a>
                )}
              </div>

              <p
                style={{
                  fontSize: '13px',
                  color: 'var(--skillsaware-text-secondary)',
                  marginTop: '20px'
                }}
              >
                💡 <strong>Tip:</strong> The PDF is a human-readable certificate. The JSON
                file contains the machine-readable credential in Open Badges v3 format.
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      className='container'
      style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}
    >
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <Image
          src='/logo/skillsaware-logo.svg'
          alt='SkillsAware Logo'
          width={200}
          height={60}
          className='skillsaware-logo'
          style={{ margin: '0 auto 20px' }}
        />
      </div>
      <h1>Skill Endorsement Form</h1>

      {/* Skill Information (Read-only) */}
      <div className='card mb-3'>
        <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>Skill Information</h2>
        <p>
          <strong>Skill Name:</strong> {payload.skill_name}
        </p>
        <p>
          <strong>Skill Code:</strong> {payload.skill_code}
        </p>
        <p>
          <strong>Claimant:</strong> {payload.claimant_name}
        </p>
        <p style={{ marginTop: '10px' }}>
          <strong>Description:</strong>
        </p>
        <p style={{ fontSize: '14px', color: 'var(--skillsaware-text-secondary)' }}>
          {payload.skill_description}
        </p>
        <p style={{ marginTop: '10px' }}>
          <strong>Claimant&apos;s Narrative:</strong>
        </p>
        <p
          style={{
            fontSize: '14px',
            color: 'var(--skillsaware-text-secondary)',
            fontStyle: 'italic'
          }}
        >
          &quot;{payload.claimant_narrative}&quot;
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className='card'>
        <div className='mb-2'>
          <label htmlFor='bonaFides'>Your Credentials / Bona Fides *</label>
          <input
            type='text'
            id='bonaFides'
            value={bonaFides}
            onChange={e => setBonaFides(e.target.value)}
            required
            placeholder='e.g., Senior Developer at Company X'
          />
        </div>

        <div className='mb-2'>
          <label htmlFor='endorsementText'>Endorsement Statement *</label>
          <textarea
            id='endorsementText'
            value={endorsementText}
            onChange={e => setEndorsementText(e.target.value)}
            required
            rows={6}
            placeholder='Describe how the claimant has demonstrated this skill...'
          />
        </div>

        <div className='mb-2'>
          <label>Supporting Evidence (Optional)</label>
          {evidenceUrls.map((url, index) => (
            <div key={index} style={{ marginBottom: '10px' }}>
              <input
                type='url'
                value={url}
                onChange={e => updateEvidenceUrl(index, e.target.value)}
                placeholder='https://example.com/evidence'
                style={{
                  borderColor: urlErrors[index] ? 'var(--skillsaware-error)' : undefined
                }}
              />
              {urlErrors[index] && (
                <p
                  style={{
                    color: 'var(--skillsaware-error)',
                    fontSize: '12px',
                    marginTop: '4px',
                    marginBottom: '0'
                  }}
                >
                  {urlErrors[index]}
                </p>
              )}
            </div>
          ))}
          <button
            type='button'
            onClick={addEvidenceField}
            className='btn btn-secondary'
            style={{ marginTop: '10px' }}
          >
            + Add Evidence URL
          </button>
        </div>

        <div className='mb-2'>
          <label htmlFor='signature'>Digital Signature (Type your full name) *</label>
          <input
            type='text'
            id='signature'
            value={signature}
            onChange={e => setSignature(e.target.value)}
            required
            placeholder='Your Full Name'
          />
        </div>

        <div className='mb-2'>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type='checkbox'
              checked={consent}
              onChange={e => setConsent(e.target.checked)}
              style={{
                marginRight: '10px',
                cursor: 'pointer',
                width: '18px',
                height: '18px'
              }}
            />
            <span style={{ fontSize: '14px' }}>
              I consent to this endorsement being recorded and shared. I confirm that the
              information provided is accurate to the best of my knowledge.
            </span>
          </label>
        </div>

        {error && <div className='alert alert-error'>{error}</div>}

        <button type='submit' disabled={submitting} className='btn btn-primary'>
          {submitting ? (
            <>
              <span
                className='loading'
                style={{ width: '16px', height: '16px', borderWidth: '2px' }}
              ></span>
              Submitting...
            </>
          ) : (
            'Submit Endorsement'
          )}
        </button>
      </form>
    </div>
  )
}
