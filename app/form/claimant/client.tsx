'use client'

import { useState } from 'react'
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
      <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ color: '#0B5FFF', marginBottom: '20px' }}>
          Endorser Link Generated
        </h1>
        <p style={{ marginBottom: '20px' }}>
          Share this link with your endorser to complete the skill endorsement process.
        </p>
        <div
          style={{
            backgroundColor: '#f5f5f5',
            padding: '20px',
            borderRadius: '5px',
            marginBottom: '20px'
          }}
        >
          <p style={{ fontSize: '14px', wordBreak: 'break-all', marginBottom: '10px' }}>
            {endorserLink}
          </p>
          <button
            onClick={copyToClipboard}
            style={{
              backgroundColor: '#0B5FFF',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Copy to Clipboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ color: '#0B5FFF', marginBottom: '20px' }}>Skill Claim Form</h1>

      {/* Skill Information (Read-only) */}
      <div
        style={{
          backgroundColor: '#f5f5f5',
          padding: '20px',
          borderRadius: '5px',
          marginBottom: '30px'
        }}
      >
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
        <p style={{ fontSize: '14px', color: '#666' }}>{payload.skill_description}</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label
            htmlFor='narrative'
            style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}
          >
            Your Skill Narrative *
          </label>
          <textarea
            id='narrative'
            value={narrative}
            onChange={e => setNarrative(e.target.value)}
            required
            rows={6}
            placeholder='Describe how you have demonstrated this skill...'
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '14px',
              border: '1px solid #ccc',
              borderRadius: '5px'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label
            htmlFor='endorserName'
            style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}
          >
            Endorser Name *
          </label>
          <input
            type='text'
            id='endorserName'
            value={endorserName}
            onChange={e => setEndorserName(e.target.value)}
            required
            placeholder='Name of person who will endorse your skill'
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '14px',
              border: '1px solid #ccc',
              borderRadius: '5px'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label
            htmlFor='endorserEmail'
            style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}
          >
            Endorser Email *
          </label>
          <input
            type='email'
            id='endorserEmail'
            value={endorserEmail}
            onChange={e => setEndorserEmail(e.target.value)}
            required
            placeholder='email@example.com'
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '14px',
              border: '1px solid #ccc',
              borderRadius: '5px'
            }}
          />
        </div>

        {error && (
          <div
            style={{
              padding: '10px',
              backgroundColor: '#ffebee',
              color: '#c62828',
              borderRadius: '5px',
              marginBottom: '20px'
            }}
          >
            {error}
          </div>
        )}

        <button
          type='submit'
          disabled={submitting}
          style={{
            backgroundColor: '#0B5FFF',
            color: 'white',
            padding: '12px 30px',
            border: 'none',
            borderRadius: '5px',
            fontSize: '16px',
            cursor: submitting ? 'not-allowed' : 'pointer',
            opacity: submitting ? 0.6 : 1
          }}
        >
          {submitting ? 'Generating...' : 'Generate Endorser Link'}
        </button>
      </form>
    </div>
  )
}
