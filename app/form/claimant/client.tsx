'use client'

import { useState } from 'react'
import Link from 'next/link'
import { JwtPayload } from '@/types/jwt'
import Navbar from '../../components/Navbar'

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
  const [fieldErrors, setFieldErrors] = useState<{
    narrative?: string
    endorser_name?: string
    endorser_email?: string
  }>({})

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
        const errorMessage = data.error || 'Failed to generate endorser link'

        // Parse field-level errors if available
        const newFieldErrors: typeof fieldErrors = {}
        if (data.details && typeof data.details === 'object') {
          if (data.details.claimant_narrative)
            newFieldErrors.narrative = data.details.claimant_narrative
          if (data.details.endorser_name)
            newFieldErrors.endorser_name = data.details.endorser_name
          if (data.details.endorser_email)
            newFieldErrors.endorser_email = data.details.endorser_email
        }

        // Check if error message mentions specific fields
        if (errorMessage.toLowerCase().includes('narrative')) {
          newFieldErrors.narrative = errorMessage
        }
        if (
          errorMessage.toLowerCase().includes('endorser name') ||
          errorMessage.toLowerCase().includes('endorser_name')
        ) {
          newFieldErrors.endorser_name = errorMessage
        }
        if (
          errorMessage.toLowerCase().includes('endorser email') ||
          errorMessage.toLowerCase().includes('endorser_email') ||
          errorMessage.toLowerCase().includes('email')
        ) {
          newFieldErrors.endorser_email = errorMessage
        }

        setFieldErrors(newFieldErrors)
        setError(errorMessage)
        throw new Error(errorMessage)
      }

      const data = await response.json()
      setEndorserLink(data.endorser_link)
      setFieldErrors({})
      setError('')
    } catch (err) {
      if (!(err instanceof Error && err.message.includes('Failed to generate'))) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      }
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
        className='min-h-screen flex flex-col'
        style={{ backgroundColor: 'var(--skillsaware-bg-secondary)' }}
      >
        <Navbar />

        <main className='flex-1 flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8'>
          <div className='w-full max-w-[720px] space-y-8'>
            {/* Success State */}
            <div
              className='card rounded-xl shadow-sm border overflow-hidden'
              style={{ borderColor: 'rgba(54, 179, 126, 0.2)' }}
            >
              <div className='text-center p-8'>
                <div
                  className='mx-auto flex items-center justify-center rounded-full mb-4'
                  style={{
                    width: '64px',
                    height: '64px',
                    backgroundColor: 'rgba(54, 179, 126, 0.1)'
                  }}
                >
                  <span
                    className='material-symbols-outlined text-3xl'
                    style={{ color: 'var(--skillsaware-success)' }}
                  >
                    check_circle
                  </span>
                </div>
                <h3
                  className='text-xl font-bold mb-2'
                  style={{ color: 'var(--skillsaware-text-primary)' }}
                >
                  Endorser Link Generated
                </h3>
                <p
                  className='mb-6 max-w-md mx-auto'
                  style={{ color: 'var(--skillsaware-text-secondary)' }}
                >
                  Your claim has been prepared. Send the magic link below to{' '}
                  <span
                    className='font-medium'
                    style={{ color: 'var(--skillsaware-text-primary)' }}
                  >
                    {endorserName}
                  </span>{' '}
                  to verify your skill.
                </p>
                <div className='flex flex-col sm:flex-row gap-2 max-w-lg mx-auto'>
                  <div className='relative flex-grow'>
                    <input
                      className='block w-full rounded-lg border py-2.5 px-4 text-sm focus:outline-none'
                      readOnly
                      type='text'
                      value={endorserLink}
                      style={{
                        borderColor: 'var(--skillsaware-border)',
                        backgroundColor: 'var(--skillsaware-bg-secondary)',
                        color: 'var(--skillsaware-text-secondary)'
                      }}
                    />
                  </div>
                  <button
                    onClick={copyToClipboard}
                    className='shrink-0 flex items-center justify-center gap-2 rounded-lg border hover:bg-gray-50 px-4 py-2.5 text-sm font-semibold shadow-sm transition-colors'
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
                      content_copy
                    </span>
                    Copy to Clipboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div
      className='min-h-screen flex flex-col'
      style={{ backgroundColor: 'var(--skillsaware-bg-secondary)' }}
    >
      <Navbar />

      <main className='flex-1 flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8'>
        <div className='w-full max-w-[720px] space-y-8' style={{ marginTop: '2rem' }}>
          {/* Page Heading */}
          <div className='text-center sm:text-left space-y-2'>
            <h1
              className='text-3xl sm:text-4xl font-black leading-tight'
              style={{
                color: 'var(--skillsaware-text-primary)',
                letterSpacing: '-0.033em'
              }}
            >
              Claim Your Skill Credential
            </h1>
            <p
              className='text-base font-normal'
              style={{ color: 'var(--skillsaware-text-secondary)' }}
            >
              Review the skill details and provide your narrative to generate an
              endorsement link.
            </p>
          </div>

          {/* Main Form Card */}
          <div
            className='card rounded-xl shadow-sm border overflow-hidden'
            style={{
              backgroundColor: 'var(--skillsaware-bg-primary)',
              borderColor: 'var(--skillsaware-border)'
            }}
          >
            {/* Read-only Context Section */}
            <div
              className='border-b p-6'
              style={{
                backgroundColor: 'var(--skillsaware-bg-secondary)',
                borderColor: 'var(--skillsaware-border)'
              }}
            >
              <div className='flex items-center gap-3 mb-4'>
                <span
                  className='material-symbols-outlined'
                  style={{ color: 'var(--skillsaware-text-secondary)' }}
                >
                  info
                </span>
                <h3
                  className='text-sm font-bold uppercase tracking-wider'
                  style={{ color: 'var(--skillsaware-text-secondary)' }}
                >
                  Skill Context
                </h3>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <p
                    className='text-xs font-medium uppercase mb-1'
                    style={{ color: 'var(--skillsaware-text-secondary)' }}
                  >
                    Skill Name
                  </p>
                  <p
                    className='text-base font-semibold'
                    style={{ color: 'var(--skillsaware-text-primary)' }}
                  >
                    {payload.skill_name}
                  </p>
                  <span
                    className='inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset mt-1'
                    style={{
                      backgroundColor: 'rgba(19, 127, 236, 0.1)',
                      color: 'var(--skillsaware-primary)'
                    }}
                  >
                    {payload.skill_code}
                  </span>
                </div>
                <div>
                  <p
                    className='text-xs font-medium uppercase mb-1'
                    style={{ color: 'var(--skillsaware-text-secondary)' }}
                  >
                    Claimant
                  </p>
                  <div className='flex items-center gap-2'>
                    <p
                      className='text-base font-medium'
                      style={{ color: 'var(--skillsaware-text-primary)' }}
                    >
                      {payload.claimant_name}
                    </p>
                  </div>
                </div>
                <div className='md:col-span-2'>
                  <p
                    className='text-xs font-medium uppercase mb-1'
                    style={{ color: 'var(--skillsaware-text-secondary)' }}
                  >
                    Description
                  </p>
                  <p
                    className='text-sm leading-relaxed'
                    style={{ color: 'var(--skillsaware-text-primary)' }}
                  >
                    {payload.skill_description}
                  </p>
                </div>
              </div>
            </div>

            {/* Claimant Form */}
            <form onSubmit={handleSubmit} className='p-6 md:p-8 space-y-6'>
              {/* Narrative Field */}
              <div className='space-y-2'>
                <label
                  className='block text-sm font-semibold'
                  htmlFor='narrative'
                  style={{ color: 'var(--skillsaware-text-primary)' }}
                >
                  Your Skill Narrative{' '}
                  <span style={{ color: 'var(--skillsaware-error)' }}>*</span>
                </label>
                <textarea
                  className='w-full resize-y rounded-lg border p-4 text-base focus:outline-none focus:ring-1 transition-all'
                  id='narrative'
                  name='narrative'
                  value={narrative}
                  onChange={e => setNarrative(e.target.value)}
                  required
                  rows={6}
                  placeholder='Describe a specific situation where you demonstrated this skill. What was the context, what action did you take, and what was the result?'
                  style={{
                    borderColor: fieldErrors.narrative
                      ? 'var(--skillsaware-error)'
                      : 'var(--skillsaware-border)',
                    backgroundColor: 'var(--skillsaware-bg-primary)',
                    color: 'var(--skillsaware-text-primary)',
                    minHeight: '160px'
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = 'var(--skillsaware-primary)'
                    e.target.style.boxShadow = '0 0 0 1px var(--skillsaware-primary)'
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = fieldErrors.narrative
                      ? 'var(--skillsaware-error)'
                      : 'var(--skillsaware-border)'
                    e.target.style.boxShadow = 'none'
                  }}
                />
                {fieldErrors.narrative && (
                  <p
                    className='text-xs flex items-center gap-1 mt-1'
                    style={{ color: 'var(--skillsaware-error)' }}
                  >
                    <span
                      className='material-symbols-outlined'
                      style={{ fontSize: '14px' }}
                    >
                      error
                    </span>
                    {fieldErrors.narrative}
                  </p>
                )}
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {/* Endorser Name */}
                <div className='space-y-2'>
                  <label
                    className='block text-sm font-semibold'
                    htmlFor='endorser-name'
                    style={{ color: 'var(--skillsaware-text-primary)' }}
                  >
                    Endorser Name{' '}
                    <span style={{ color: 'var(--skillsaware-error)' }}>*</span>
                  </label>
                  <div className='relative'>
                    <input
                      className='block w-full rounded-lg border py-2.5 pl-10 pr-4 text-base focus:outline-none focus:ring-1 transition-all'
                      id='endorser-name'
                      type='text'
                      value={endorserName}
                      onChange={e => setEndorserName(e.target.value)}
                      required
                      placeholder='e.g. Alex Smith'
                      style={{
                        borderColor: fieldErrors.endorser_name
                          ? 'var(--skillsaware-error)'
                          : 'var(--skillsaware-border)',
                        backgroundColor: 'var(--skillsaware-bg-primary)',
                        color: 'var(--skillsaware-text-primary)'
                      }}
                      onFocus={e => {
                        e.target.style.borderColor = 'var(--skillsaware-primary)'
                        e.target.style.boxShadow = '0 0 0 1px var(--skillsaware-primary)'
                      }}
                      onBlur={e => {
                        e.target.style.borderColor = fieldErrors.endorser_name
                          ? 'var(--skillsaware-error)'
                          : 'var(--skillsaware-border)'
                        e.target.style.boxShadow = 'none'
                      }}
                    />
                  </div>
                  {fieldErrors.endorser_name && (
                    <p
                      className='text-xs flex items-center gap-1 mt-1'
                      style={{ color: 'var(--skillsaware-error)' }}
                    >
                      <span
                        className='material-symbols-outlined'
                        style={{ fontSize: '14px' }}
                      >
                        error
                      </span>
                      {fieldErrors.endorser_name}
                    </p>
                  )}
                </div>

                {/* Endorser Email */}
                <div className='space-y-2'>
                  <label
                    className='block text-sm font-semibold'
                    htmlFor='endorser-email'
                    style={{ color: 'var(--skillsaware-text-primary)' }}
                  >
                    Endorser Email{' '}
                    <span style={{ color: 'var(--skillsaware-error)' }}>*</span>
                  </label>
                  <div className='relative'>
                    <input
                      className='block w-full rounded-lg border py-2.5 pl-10 pr-4 text-base focus:outline-none focus:ring-1 transition-all'
                      id='endorser-email'
                      type='email'
                      value={endorserEmail}
                      onChange={e => setEndorserEmail(e.target.value)}
                      required
                      placeholder='name@company.com'
                      style={{
                        borderColor: fieldErrors.endorser_email
                          ? 'var(--skillsaware-error)'
                          : 'var(--skillsaware-border)',
                        backgroundColor: 'var(--skillsaware-bg-primary)',
                        color: 'var(--skillsaware-text-primary)'
                      }}
                      onFocus={e => {
                        e.target.style.borderColor = 'var(--skillsaware-primary)'
                        e.target.style.boxShadow = '0 0 0 1px var(--skillsaware-primary)'
                      }}
                      onBlur={e => {
                        e.target.style.borderColor = fieldErrors.endorser_email
                          ? 'var(--skillsaware-error)'
                          : 'var(--skillsaware-border)'
                        e.target.style.boxShadow = 'none'
                      }}
                    />
                  </div>
                  {fieldErrors.endorser_email && (
                    <p
                      className='text-xs flex items-center gap-1 mt-1'
                      style={{ color: 'var(--skillsaware-error)' }}
                    >
                      <span
                        className='material-symbols-outlined'
                        style={{ fontSize: '14px' }}
                      >
                        error
                      </span>
                      {fieldErrors.endorser_email}
                    </p>
                  )}
                  {error && !fieldErrors.endorser_email && (
                    <p
                      className='text-xs flex items-center gap-1 mt-1'
                      style={{ color: 'var(--skillsaware-error)' }}
                    >
                      <span
                        className='material-symbols-outlined'
                        style={{ fontSize: '14px' }}
                      >
                        error
                      </span>
                      {error}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Area */}
              <div className='pt-4 flex flex-col sm:flex-row items-center justify-between gap-4'>
                <p
                  className='text-sm'
                  style={{ color: 'var(--skillsaware-text-secondary)' }}
                >
                  By generating this link, you agree to the{' '}
                  <Link
                    href='/terms'
                    className='transition-colors'
                    style={{ color: 'var(--skillsaware-primary)' }}
                  >
                    Terms of Service
                  </Link>
                  .
                </p>
                <button
                  type='submit'
                  disabled={submitting}
                  onClick={handleSubmit}
                  className='w-full sm:w-auto min-w-[200px] flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-bold text-white shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2'
                  style={{
                    backgroundColor: submitting
                      ? 'var(--skillsaware-text-tertiary)'
                      : 'var(--skillsaware-primary)',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    opacity: submitting ? 0.6 : 1
                  }}
                >
                  {submitting ? (
                    <>
                      <span
                        className='loading'
                        style={{ width: '16px', height: '16px', borderWidth: '2px' }}
                      ></span>
                      Generating...
                    </>
                  ) : (
                    <>
                      <span>Generate Endorser Link</span>
                      <span
                        className='material-symbols-outlined'
                        style={{ fontSize: '20px' }}
                      >
                        link
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
