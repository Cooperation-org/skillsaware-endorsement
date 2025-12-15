'use client'

import { useState } from 'react'
import Image from 'next/image'
import { JwtPayload } from '@/types/jwt'

interface ClaimantFormClientProps {
  payload: JwtPayload
  token: string
}

export default function ClaimantFormClient({ payload, token }: ClaimantFormClientProps) {
  const [narrative, setNarrative] = useState('')
  const [endorserName, setEndorserName] = useState('')
  const [endorserEmail, setEndorserEmail] = useState('')
  const [endorserLink, setEndorserLink] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const response = await fetch(`/api/v1/claims/${payload.claim_id}/endorser-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          claimant_narrative: narrative,
          endorser_name: endorserName,
          endorser_email: endorserEmail
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to generate endorser link')
      }

      const data = await response.json()
      setEndorserLink(data.endorser_link)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(endorserLink)
    alert('Link copied to clipboard!')
  }

  if (endorserLink) {
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
        <h1>Endorser Link Generated</h1>
        <p className='mb-2'>
          Share this link with your endorser to complete the skill endorsement process.
        </p>
        <div className='card'>
          <p style={{ fontSize: '14px', wordBreak: 'break-all', marginBottom: '10px' }}>
            {endorserLink}
          </p>
          <button onClick={copyToClipboard} className='btn btn-primary'>
            Copy to Clipboard
          </button>
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
      <h1>Skill Claim Form</h1>

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
        <p style={{ fontSize: '14px' }}>{payload.skill_description}</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className='card'>
        <div className='mb-2'>
          <label htmlFor='narrative'>Your Skill Narrative *</label>
          <textarea
            id='narrative'
            value={narrative}
            onChange={e => setNarrative(e.target.value)}
            required
            rows={6}
            placeholder='Describe how you have demonstrated this skill...'
          />
        </div>

        <div className='mb-2'>
          <label htmlFor='endorserName'>Endorser Name *</label>
          <input
            type='text'
            id='endorserName'
            value={endorserName}
            onChange={e => setEndorserName(e.target.value)}
            required
            placeholder='Name of person who will endorse your skill'
          />
        </div>

        <div className='mb-2'>
          <label htmlFor='endorserEmail'>Endorser Email *</label>
          <input
            type='email'
            id='endorserEmail'
            value={endorserEmail}
            onChange={e => setEndorserEmail(e.target.value)}
            required
            placeholder='email@example.com'
          />
        </div>

        {error && <div className='alert alert-error'>{error}</div>}

        <button type='submit' disabled={submitting} className='btn btn-primary'>
          {submitting ? (
            <>
              <span
                className='loading'
                style={{ width: '16px', height: '16px', borderWidth: '2px' }}
              ></span>
              Generating...
            </>
          ) : (
            'Generate Endorser Link'
          )}
        </button>
      </form>
    </div>
  )
}
