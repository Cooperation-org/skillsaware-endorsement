'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { JwtPayload } from '@/types/jwt'
import Navbar from '../../components/Navbar'

interface ClaimantFormClientProps {
  readonly payload: JwtPayload
  readonly token: string
}

interface EndorserInput {
  name: string
  email: string
}

interface EndorserResult {
  name: string
  email: string
  link: string
  error?: string
  emailSent?: boolean
  emailError?: string
}

export default function ClaimantFormClient({ payload, token }: ClaimantFormClientProps) {
  const [narrative, setNarrative] = useState('')
  const [endorsers, setEndorsers] = useState<EndorserInput[]>([{ name: '', email: '' }])
  const [results, setResults] = useState<EndorserResult[]>([])
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{
    narrative?: string
    [key: string]: string | undefined
  }>({})

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768) // 768px is typical mobile breakpoint
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Manage dynamic endorser list
  const addEndorser = () => {
    setEndorsers([...endorsers, { name: '', email: '' }])
  }

  const removeEndorser = (index: number) => {
    const newEndorsers = endorsers.filter((_, i) => i !== index)
    setEndorsers(newEndorsers)
    // Clear errors for removed index (simplified)
    setFieldErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[`endorser_name_${index}`]
      delete newErrors[`endorser_email_${index}`]
      return newErrors
    })
  }

  const updateEndorser = (index: number, field: 'name' | 'email', value: string) => {
    const newEndorsers = [...endorsers]
    newEndorsers[index] = { ...newEndorsers[index], [field]: value }
    setEndorsers(newEndorsers)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})
    setSubmitting(true)

    // Filter out completely empty rows, but keep rows with partial data to validate
    const validEndorsers = endorsers.filter(e => e.name.trim() || e.email.trim())
    
    // If no endorsers at all, use one empty one (API allows it if optional)
    // But if API requires at least one, we should check. 
    // The current API implementation makes name/email optional if just generating a link.
    // However, for multiple invites, we probably want at least one.
    const endorsersToProcess = validEndorsers.length > 0 ? validEndorsers : [{ name: '', email: '' }]

    try {
      const promises = endorsersToProcess.map(async (endorser, index) => {
        const requestBody: {
          claimant_narrative: string
          endorser_name?: string
          endorser_email?: string
        } = {
          claimant_narrative: narrative
        }

        if (endorser.name.trim()) requestBody.endorser_name = endorser.name.trim()
        if (endorser.email.trim()) requestBody.endorser_email = endorser.email.trim()

        const response = await fetch(`/api/v1/claims/${payload.claim_id}/endorser-link`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(requestBody)
        })

        if (!response.ok) {
          const data = await response.json()
          const errorMessage = data.error || 'Failed to generate link'
          
          // Map errors to specific row index
          if (errorMessage.toLowerCase().includes('narrative')) {
            setFieldErrors(prev => ({ ...prev, narrative: errorMessage }))
          }
          if (errorMessage.toLowerCase().includes('email')) {
             setFieldErrors(prev => ({ ...prev, [`endorser_email_${index}`]: errorMessage }))
          }

          return {
            name: endorser.name,
            email: endorser.email,
            link: '',
            error: errorMessage
          }
        }

        const data = await response.json()
        return {
          name: endorser.name,
          email: endorser.email,
          link: data.endorser_link,
          emailSent: data.email_sent ?? false,
          emailError: data.email_error
        }
      })

      const results = await Promise.all(promises)

      // Check if any succeeded
      const successes = results.filter(r => r.link)
      const failures = results.filter(r => r.error)

      if (successes.length > 0) {
        setResults(results) // Show results view
        if (failures.length > 0) {
           setError(`Generated ${successes.length} links, but ${failures.length} failed.`)
        }
      } else if (failures.length > 0) {
         setError(failures[0].error || 'Failed to generate links')
         // Keep on form view to fix errors
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Link copied to clipboard!')
  }

  const openMailto = (email: string, link: string) => {
    const subject = encodeURIComponent('Skill Endorsement Request')
    const body = encodeURIComponent(
      `Please use the following link to complete the endorsement:\n\n${link}`
    )
    const mailtoLink = `mailto:${email}?subject=${subject}&body=${body}`
    window.location.href = mailtoLink
  }

  const openGmail = (email: string, link: string) => {
    const subject = encodeURIComponent('Skill Endorsement Request')
    const body = encodeURIComponent(
      `Please use the following link to complete the endorsement:\n\n${link}`
    )
    const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${subject}&body=${body}`
    window.open(gmailLink, '_blank')
  }

  if (results.length > 0) {
    return (
      <div
        className='min-h-screen flex flex-col'
        style={{ backgroundColor: 'var(--skillsaware-bg-secondary)' }}
      >
        <Navbar />

        <main className='flex-1 flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8' style={{ overflowX: 'hidden', width: '100%', maxWidth: '100vw' }}>
          <div className='w-full max-w-[900px] space-y-8' style={{ width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
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
                  Invitations Generated
                </h3>
                <p
                  className='mb-6 max-w-md mx-auto'
                  style={{ color: 'var(--skillsaware-text-secondary)' }}
                >
                  Your claim has been prepared. Share these links with your endorsers.
                </p>

                {/* Results Table */}
                <div className='overflow-x-auto rounded-lg border' style={{ borderColor: 'var(--skillsaware-border)', maxWidth: '100%', overflow: 'hidden' }}>
                  <table className='w-full divide-y divide-gray-200' style={{ backgroundColor: 'var(--skillsaware-bg-primary)', tableLayout: 'fixed', width: '100%' }}>
                    <colgroup>
                      <col style={{ width: '35%' }} />
                      <col style={{ width: '35%' }} />
                      <col style={{ width: '30%' }} />
                    </colgroup>
                    <thead style={{ backgroundColor: 'var(--skillsaware-bg-secondary)' }}>
                      <tr>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--skillsaware-text-secondary)' }}>Endorser</th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--skillsaware-text-secondary)' }}>Link</th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--skillsaware-text-secondary)' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {results.map((result, idx) => {
                        const hasEmail = result.email && result.email.trim()
                        const emailStatus = hasEmail 
                          ? (result.emailSent === true ? 'sent' : result.emailError ? 'failed' : 'not_sent')
                          : 'no_email'
                        
                        // Create a meaningful link preview
                        const getLinkPreview = (link: string) => {
                          try {
                            const url = new URL(link)
                            const domain = url.hostname
                            const path = url.pathname + url.search
                            const maxPathLength = isMobile ? 15 : 30
                            const truncatedPath = path.length > maxPathLength 
                              ? path.substring(0, maxPathLength) + '...' 
                              : path
                            return `${domain}${truncatedPath}`
                          } catch {
                            // Fallback if URL parsing fails
                            const maxLength = isMobile ? 20 : 40
                            return link.length > maxLength 
                              ? link.substring(0, maxLength) + '...' 
                              : link
                          }
                        }
                        
                        return (
                        <tr key={idx}>
                          <td className="px-3 py-3 text-left" style={{ wordBreak: 'break-word', overflowWrap: 'break-word', overflow: 'hidden' }}>
                            <div className="text-xs font-medium truncate" style={{ color: 'var(--skillsaware-text-primary)' }}>{result.name || 'Unknown'}</div>
                            <div className="text-xs break-all truncate" style={{ color: 'var(--skillsaware-text-secondary)' }}>{result.email || '-'}</div>
                            {result.error && <span className="text-xs text-red-500 truncate block">{result.error}</span>}
                          </td>
                          <td className="px-3 py-3 text-left relative group" style={{ minWidth: 0, overflow: 'hidden' }}>
                            {result.link ? (
                                <button
                                    onClick={() => copyToClipboard(result.link)}
                                    className="text-xs text-left hover:text-blue-600 transition-colors flex items-center gap-1.5 group-hover:bg-gray-50 p-1 rounded w-full"
                                    title={`Click to copy: ${result.link}`}
                                    style={{ color: 'var(--skillsaware-text-tertiary)' }}
                                >
                                    <span className="font-mono text-xs truncate flex-1" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{getLinkPreview(result.link)}</span>
                                    <span className="material-symbols-outlined text-sm text-blue-600 shrink-0" style={{ fontSize: '14px' }}>content_copy</span>
                                </button>
                            ) : (
                                <span className="text-xs text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-3 py-3 text-left" style={{ overflow: 'hidden' }}>
                            {emailStatus === 'sent' && (
                              <div className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs shrink-0" style={{ color: 'var(--skillsaware-success)', fontSize: '14px' }}>check_circle</span>
                                <span className="text-xs truncate" style={{ color: 'var(--skillsaware-success)' }}>Sent</span>
                              </div>
                            )}
                            {emailStatus === 'failed' && result.email && result.link && (
                              <div className="flex flex-col gap-1.5">
                                <div className="flex items-center gap-1">
                                  <span className="material-symbols-outlined text-xs shrink-0" style={{ color: 'var(--skillsaware-error)', fontSize: '14px' }}>error</span>
                                  <span className="text-xs truncate" style={{ color: 'var(--skillsaware-error)' }}>Failed</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                  <button
                                    onClick={() => openMailto(result.email, result.link)}
                                    className="text-xs px-1.5 py-0.5 rounded border flex items-center gap-0.5 w-full transition-colors hover:bg-gray-50"
                                    style={{
                                      borderColor: 'var(--skillsaware-border)',
                                      color: 'var(--skillsaware-primary)'
                                    }}
                                    title="Open default email client"
                                  >
                                    <span className="material-symbols-outlined text-xs shrink-0" style={{ fontSize: '12px' }}>mail</span>
                                    <span className="truncate text-xs">Mailto</span>
                                  </button>
                                  <button
                                    onClick={() => openGmail(result.email, result.link)}
                                    className="text-xs px-1.5 py-0.5 rounded border flex items-center gap-0.5 w-full transition-colors hover:bg-gray-50"
                                    style={{
                                      borderColor: 'var(--skillsaware-border)',
                                      color: 'var(--skillsaware-primary)'
                                    }}
                                    title="Open Gmail in new tab"
                                  >
                                    <span className="material-symbols-outlined text-xs shrink-0" style={{ fontSize: '12px' }}>mail</span>
                                    <span className="truncate text-xs">Gmail</span>
                                  </button>
                                </div>
                              </div>
                            )}
                            {emailStatus === 'not_sent' && hasEmail && result.link && (
                              <div className="flex flex-col gap-1.5">
                                <span className="text-xs truncate" style={{ color: 'var(--skillsaware-text-tertiary)' }}>Not auto</span>
                                <div className="flex flex-col gap-1">
                                  <button
                                    onClick={() => openMailto(result.email, result.link)}
                                    className="text-xs px-1.5 py-0.5 rounded border flex items-center gap-0.5 w-full transition-colors hover:bg-gray-50"
                                    style={{
                                      borderColor: 'var(--skillsaware-border)',
                                      color: 'var(--skillsaware-primary)'
                                    }}
                                    title="Open default email client"
                                  >
                                    <span className="material-symbols-outlined text-xs shrink-0" style={{ fontSize: '12px' }}>mail</span>
                                    <span className="truncate text-xs">Mailto</span>
                                  </button>
                                  <button
                                    onClick={() => openGmail(result.email, result.link)}
                                    className="text-xs px-1.5 py-0.5 rounded border flex items-center gap-0.5 w-full transition-colors hover:bg-gray-50"
                                    style={{
                                      borderColor: 'var(--skillsaware-border)',
                                      color: 'var(--skillsaware-primary)'
                                    }}
                                    title="Open Gmail in new tab"
                                  >
                                    <span className="material-symbols-outlined text-xs shrink-0" style={{ fontSize: '12px' }}>mail</span>
                                    <span className="truncate text-xs">Gmail</span>
                                  </button>
                                </div>
                              </div>
                            )}
                            {emailStatus === 'no_email' && (
                              <span className="text-xs truncate" style={{ color: 'var(--skillsaware-text-tertiary)' }}>No email</span>
                            )}
                          </td>
                        </tr>
                      )})}
                    </tbody>
                  </table>
                </div>
                
                <div className='mt-8 pt-6 border-t border-dashed' style={{ borderColor: 'var(--skillsaware-border)' }}>
                  <button
                    onClick={() => {
                      setResults([])
                      setEndorsers([{ name: '', email: '' }])
                      // Keep narrative
                    }}
                    className='text-sm font-medium hover:underline transition-all'
                    style={{ color: 'var(--skillsaware-primary)' }}
                  >
                    + Create New Invitations
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
              Review the skill details and provide your narrative to generate endorsement links.
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

              {/* Dynamic Endorsers List */}
              <div className='space-y-3'>
                <div className="flex justify-between items-center">
                    <label className='block text-sm font-semibold' style={{ color: 'var(--skillsaware-text-primary)' }}>
                        Endorsers
                    </label>
                </div>
                
                {endorsers.map((endorser, index) => (
                    <div key={index} className='flex flex-col gap-3 p-4 rounded-lg border bg-gray-50/50' style={{ borderColor: 'var(--skillsaware-border)' }}>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            {/* Name */}
                            <div className='space-y-1'>
                                <label className='text-xs font-medium text-gray-500'>Name</label>
                                <input
                                    className='block w-full rounded-md border py-2 px-3 text-sm focus:outline-none focus:ring-1 transition-all'
                                    type='text'
                                    value={endorser.name}
                                    onChange={e => updateEndorser(index, 'name', e.target.value)}
                                    placeholder='e.g. Alex Smith'
                                    style={{
                                        borderColor: 'var(--skillsaware-border)',
                                        backgroundColor: 'var(--skillsaware-bg-primary)'
                                    }}
                                />
                            </div>
                             {/* Email */}
                             <div className='space-y-1'>
                                <label className='text-xs font-medium text-gray-500'>Email</label>
                                <input
                                    className='block w-full rounded-md border py-2 px-3 text-sm focus:outline-none focus:ring-1 transition-all'
                                    type='email'
                                    value={endorser.email}
                                    onChange={e => updateEndorser(index, 'email', e.target.value)}
                                    placeholder='name@company.com'
                                    style={{
                                        borderColor: fieldErrors[`endorser_email_${index}`] ? 'var(--skillsaware-error)' : 'var(--skillsaware-border)',
                                        backgroundColor: 'var(--skillsaware-bg-primary)'
                                    }}
                                />
                                {fieldErrors[`endorser_email_${index}`] && (
                                    <span className="text-xs text-red-500 block">{fieldErrors[`endorser_email_${index}`]}</span>
                                )}
                            </div>
                        </div>
                        {index > 0 && (
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => removeEndorser(index)}
                                    className="text-xs text-red-600 hover:text-red-800 font-medium flex items-center gap-1"
                                >
                                    <span className="material-symbols-outlined text-[16px]">delete</span>
                                    Remove
                                </button>
                            </div>
                        )}
                    </div>
                ))}

                <button
                    type="button"
                    onClick={addEndorser}
                    className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 mt-2"
                >
                    <span className="material-symbols-outlined text-[18px]">add_circle</span>
                    Add another endorser
                </button>
              </div>

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
                      <span>Generate Invitations</span>
                      <span
                        className='material-symbols-outlined'
                        style={{ fontSize: '20px' }}
                      >
                        send
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