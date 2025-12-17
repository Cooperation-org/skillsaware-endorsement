'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function Home() {
  const [formData, setFormData] = useState({
    claimant_name: 'Alice Smith',
    claimant_email: 'alice@example.com',
    skill_name: 'Advanced JavaScript',
    skill_code: 'JS-ADV',
    skill_description:
      'Demonstrates mastery of closures, async/await, and prototypes within a production environment.'
  })

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    claim_id: string
    claimant_link: string
    expires_at: string
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/create-claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tenant_id: 'skillsaware',
          ...formData
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create claim')
      }

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  return (
    <div
      className='relative flex h-auto min-h-screen w-full flex-col'
      style={{
        backgroundColor: 'var(--skillsaware-bg-secondary)',
        overflowX: 'hidden',
        width: '100%',
        maxWidth: '100vw'
      }}
    >
      {/* Navigation */}
      <header
        className='sticky top-0 z-50 w-full backdrop-blur-sm border-b flex items-center justify-between'
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: 'var(--skillsaware-border)',
          padding: '0.75rem 1.5rem',
          maxWidth: '1400px',
          margin: '0 auto',
          width: '100%'
        }}
      >
        <div className='flex items-center gap-4'>
          <Image
            src='/logo/skillsaware-nav.svg'
            alt='SkillsAware Logo'
            width={120}
            height={30}
            className='skillsaware-logo'
            style={{
              width: '6.25vw',
              minHeight: '20px',
              height: 'auto',
              minWidth: '75px'
            }}
          />
        </div>
      </header>

      {/* Main Layout */}
      <div
        className='flex h-full grow flex-col py-8'
        style={{
          paddingLeft: '1.5rem',
          paddingRight: '1.5rem',
          maxWidth: '1400px',
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
          overflowX: 'hidden'
        }}
      >
        {/* Page Heading */}
        <div className='mb-8 max-w-[960px] mx-auto w-full' style={{ marginTop: '2rem' }}>
          <div className='flex flex-wrap justify-between gap-3'>
            <div className='flex min-w-72 flex-col gap-2'>
              <h1
                className='text-3xl md:text-4xl font-black leading-tight'
                style={{
                  color: 'var(--skillsaware-text-primary)',
                  letterSpacing: '-0.033em'
                }}
              >
                Endorsement Client
              </h1>
              <p
                className='text-base font-normal leading-normal max-w-2xl'
                style={{ color: 'var(--skillsaware-text-secondary)' }}
              >
                This page has only one purpose: to test the workflow and only to test.
              </p>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div
          className='grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-[960px] mx-auto w-full'
          style={{ boxSizing: 'border-box', overflowX: 'hidden' }}
        >
          {/* Left Column: Form & Actions (Span 2) */}
          <div className='lg:col-span-2 flex flex-col gap-6'>
            {result ? (
              /* Success Result Section */
              <div
                className='border rounded-xl p-6 md:p-8'
                style={{
                  backgroundColor: 'rgba(54, 179, 126, 0.05)',
                  borderColor: 'rgba(54, 179, 126, 0.2)'
                }}
              >
                <div
                  className='flex items-center gap-3 mb-6 border-b pb-4'
                  style={{ borderColor: 'rgba(54, 179, 126, 0.2)' }}
                >
                  <div
                    className='rounded-full p-2 flex items-center justify-center'
                    style={{
                      backgroundColor: 'rgba(54, 179, 126, 0.2)',
                      color: 'var(--skillsaware-success)'
                    }}
                  >
                    <span className='material-symbols-outlined'>check_circle</span>
                  </div>
                  <div>
                    <h3
                      className='text-lg font-bold'
                      style={{ color: 'var(--skillsaware-success)' }}
                    >
                      Claim Successfully Created
                    </h3>
                    <p
                      className='text-sm'
                      style={{ color: 'var(--skillsaware-success)' }}
                    >
                      Share the magic link below with the claimant.
                    </p>
                  </div>
                </div>
                <div className='grid gap-6'>
                  {/* Claim ID */}
                  <div className='flex flex-col gap-1'>
                    <span
                      className='text-xs font-semibold uppercase tracking-wider'
                      style={{ color: 'var(--skillsaware-text-secondary)' }}
                    >
                      Claim ID
                    </span>
                    <div
                      className='font-mono text-sm border rounded px-3 py-2 w-fit'
                      style={{
                        backgroundColor: 'var(--skillsaware-bg-primary)',
                        borderColor: 'var(--skillsaware-border)',
                        color: 'var(--skillsaware-text-primary)'
                      }}
                    >
                      {result.claim_id}
                    </div>
                  </div>
                  {/* Magic Link */}
                  <div className='flex flex-col gap-1'>
                    <span
                      className='text-xs font-semibold uppercase tracking-wider'
                      style={{ color: 'var(--skillsaware-text-secondary)' }}
                    >
                      Claimant Magic Link
                    </span>
                    <div className='flex gap-2' style={{ minWidth: 0 }}>
                      <div
                        className='flex-1 font-mono text-sm border rounded px-3 py-2'
                        style={{
                          backgroundColor: 'var(--skillsaware-bg-primary)',
                          borderColor: 'var(--skillsaware-border)',
                          color: 'var(--skillsaware-primary)',
                          overflow: 'hidden',
                          wordBreak: 'break-all',
                          overflowWrap: 'break-word',
                          minWidth: 0
                        }}
                      >
                        {result.claimant_link}
                      </div>
                      <button
                        onClick={() => copyToClipboard(result.claimant_link)}
                        className='border rounded px-3 flex items-center justify-center transition-colors'
                        style={{
                          borderColor: 'var(--skillsaware-border)',
                          backgroundColor: 'var(--skillsaware-bg-primary)',
                          color: 'var(--skillsaware-text-secondary)'
                        }}
                        title='Copy to clipboard'
                      >
                        <span
                          className='material-symbols-outlined'
                          style={{ fontSize: '20px' }}
                        >
                          content_copy
                        </span>
                      </button>
                    </div>
                  </div>
                  {/* Expiration */}
                  <div className='flex flex-col gap-1'>
                    <span
                      className='text-xs font-semibold uppercase tracking-wider'
                      style={{ color: 'var(--skillsaware-text-secondary)' }}
                    >
                      Expires At
                    </span>
                    <div
                      className='text-sm flex items-center gap-2'
                      style={{ color: 'var(--skillsaware-text-primary)' }}
                    >
                      <span
                        className='material-symbols-outlined'
                        style={{
                          fontSize: '18px',
                          color: 'var(--skillsaware-text-secondary)'
                        }}
                      >
                        schedule
                      </span>
                      {new Date(result.expires_at).toLocaleString()} UTC
                    </div>
                  </div>
                  {/* CTA */}
                  <div className='pt-2'>
                    <a
                      href={result.claimant_link}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='flex items-center gap-2 text-sm font-semibold transition-colors'
                      style={{ color: 'var(--skillsaware-primary)' }}
                    >
                      Open Claimant Form
                      <span
                        className='material-symbols-outlined'
                        style={{ fontSize: '18px' }}
                      >
                        open_in_new
                      </span>
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              /* Form Card */
              <div
                className='card rounded-xl shadow-sm border p-6 md:p-8'
                style={{
                  backgroundColor: 'var(--skillsaware-bg-primary)',
                  borderColor: 'var(--skillsaware-border)'
                }}
              >
                <h3
                  className='text-xl font-bold mb-6 flex items-center gap-2'
                  style={{ color: 'var(--skillsaware-text-primary)' }}
                >
                  <span
                    className='material-symbols-outlined'
                    style={{ color: 'var(--skillsaware-primary)' }}
                  >
                    edit_document
                  </span>
                  Claim Creation Form
                </h3>
                <form onSubmit={handleSubmit} className='flex flex-col gap-5'>
                  {/* Claimant Name */}
                  <label className='flex flex-col'>
                    <p
                      className='text-sm font-medium leading-normal pb-2'
                      style={{ color: 'var(--skillsaware-text-primary)' }}
                    >
                      Claimant Name
                    </p>
                    <input
                      className='flex w-full rounded-lg text-base font-normal leading-normal transition-all h-12 placeholder:text-sm px-4 focus:outline-0 focus:ring-2 focus:ring-primary/50 border'
                      placeholder='e.g. John Doe'
                      value={formData.claimant_name}
                      onChange={e =>
                        setFormData({ ...formData, claimant_name: e.target.value })
                      }
                      required
                      style={{
                        borderColor: 'var(--skillsaware-border)',
                        backgroundColor: 'var(--skillsaware-bg-primary)',
                        color: 'var(--skillsaware-text-primary)'
                      }}
                      onFocus={e => {
                        e.target.style.borderColor = 'var(--skillsaware-primary)'
                      }}
                      onBlur={e => {
                        e.target.style.borderColor = 'var(--skillsaware-border)'
                      }}
                    />
                  </label>
                  {/* Claimant Email */}
                  <label className='flex flex-col'>
                    <p
                      className='text-sm font-medium leading-normal pb-2'
                      style={{ color: 'var(--skillsaware-text-primary)' }}
                    >
                      Claimant Email
                    </p>
                    <input
                      className='flex w-full rounded-lg text-base font-normal leading-normal transition-all h-12 placeholder:text-sm px-4 focus:outline-0 focus:ring-2 focus:ring-primary/50 border'
                      placeholder='e.g. john@company.com'
                      type='email'
                      value={formData.claimant_email}
                      onChange={e =>
                        setFormData({ ...formData, claimant_email: e.target.value })
                      }
                      required
                      style={{
                        borderColor: 'var(--skillsaware-border)',
                        backgroundColor: 'var(--skillsaware-bg-primary)',
                        color: 'var(--skillsaware-text-primary)'
                      }}
                      onFocus={e => {
                        e.target.style.borderColor = 'var(--skillsaware-primary)'
                      }}
                      onBlur={e => {
                        e.target.style.borderColor = 'var(--skillsaware-border)'
                      }}
                    />
                  </label>
                  {/* Skill Code */}
                  <label className='flex flex-col'>
                    <p
                      className='text-sm font-medium leading-normal pb-2'
                      style={{ color: 'var(--skillsaware-text-primary)' }}
                    >
                      Skill Code
                    </p>
                    <div className='relative'>
                      <input
                        className='flex w-full rounded-lg text-base font-normal leading-normal transition-all h-12 placeholder:text-sm pl-10 pr-4 focus:outline-0 focus:ring-2 focus:ring-primary/50 border'
                        placeholder='e.g. SK-001'
                        value={formData.skill_code}
                        onChange={e =>
                          setFormData({ ...formData, skill_code: e.target.value })
                        }
                        required
                        style={{
                          borderColor: 'var(--skillsaware-border)',
                          backgroundColor: 'var(--skillsaware-bg-primary)',
                          color: 'var(--skillsaware-text-primary)'
                        }}
                        onFocus={e => {
                          e.target.style.borderColor = 'var(--skillsaware-primary)'
                        }}
                        onBlur={e => {
                          e.target.style.borderColor = 'var(--skillsaware-border)'
                        }}
                      />
                    </div>
                  </label>
                  {/* Skill Name */}
                  <label className='flex flex-col'>
                    <p
                      className='text-sm font-medium leading-normal pb-2'
                      style={{ color: 'var(--skillsaware-text-primary)' }}
                    >
                      Skill Name
                    </p>
                    <input
                      className='flex w-full rounded-lg text-base font-normal leading-normal transition-all h-12 placeholder:text-sm px-4 focus:outline-0 focus:ring-2 focus:ring-primary/50 border'
                      placeholder='e.g. Project Management'
                      value={formData.skill_name}
                      onChange={e =>
                        setFormData({ ...formData, skill_name: e.target.value })
                      }
                      required
                      style={{
                        borderColor: 'var(--skillsaware-border)',
                        backgroundColor: 'var(--skillsaware-bg-primary)',
                        color: 'var(--skillsaware-text-primary)'
                      }}
                      onFocus={e => {
                        e.target.style.borderColor = 'var(--skillsaware-primary)'
                      }}
                      onBlur={e => {
                        e.target.style.borderColor = 'var(--skillsaware-border)'
                      }}
                    />
                  </label>
                  {/* Skill Description */}
                  <label className='flex flex-col'>
                    <p
                      className='text-sm font-medium leading-normal pb-2'
                      style={{ color: 'var(--skillsaware-text-primary)' }}
                    >
                      Skill Description
                    </p>
                    <textarea
                      className='flex w-full rounded-lg text-base font-normal leading-normal transition-all min-h-32 placeholder:text-sm p-4 focus:outline-0 focus:ring-2 focus:ring-primary/50 border resize-none'
                      placeholder='Describe the competencies validated by this skill...'
                      value={formData.skill_description}
                      onChange={e =>
                        setFormData({ ...formData, skill_description: e.target.value })
                      }
                      required
                      style={{
                        borderColor: 'var(--skillsaware-border)',
                        backgroundColor: 'var(--skillsaware-bg-primary)',
                        color: 'var(--skillsaware-text-primary)'
                      }}
                      onFocus={e => {
                        e.target.style.borderColor = 'var(--skillsaware-primary)'
                      }}
                      onBlur={e => {
                        e.target.style.borderColor = 'var(--skillsaware-border)'
                      }}
                    />
                  </label>
                  {error && (
                    <div
                      className='p-4 border rounded-lg'
                      style={{
                        backgroundColor: 'rgba(222, 53, 11, 0.1)',
                        borderColor: 'rgba(222, 53, 11, 0.2)',
                        color: 'var(--skillsaware-error)'
                      }}
                    >
                      <p className='font-bold text-sm mb-1'>Submission Error</p>
                      <p className='text-sm'>{error}</p>
                    </div>
                  )}
                  <div className='pt-4'>
                    <button
                      type='submit'
                      disabled={loading}
                      className='w-full flex items-center justify-center gap-2 font-bold h-12 rounded-lg transition-colors focus:ring-4 focus:ring-primary/30'
                      style={{
                        backgroundColor: loading
                          ? 'var(--skillsaware-text-tertiary)'
                          : 'var(--skillsaware-primary)',
                        color: 'white',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.6 : 1
                      }}
                    >
                      <span className='material-symbols-outlined'>auto_fix_high</span>
                      {loading
                        ? 'Creating Claim...'
                        : 'Create Claim & Generate Magic Link'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Right Column: Info & Help (Span 1) */}
          <div className='flex flex-col gap-6'>
            {/* Info Card */}
            <div
              className='card rounded-xl shadow-sm border p-6 sticky'
              style={{
                top: '96px',
                backgroundColor: 'var(--skillsaware-bg-primary)',
                borderColor: 'var(--skillsaware-border)'
              }}
            >
              <div className='mb-5 text-center'>
                <h4
                  className='text-lg font-bold flex items-center justify-center gap-2'
                  style={{ color: 'var(--skillsaware-text-primary)' }}
                >
                  <span
                    className='material-symbols-outlined'
                    style={{ color: 'var(--skillsaware-text-secondary)' }}
                  >
                    info
                  </span>
                  How it works
                </h4>
              </div>
              <ol
                className='relative space-y-8'
                style={{
                  borderColor: 'var(--skillsaware-border)',
                  listStyle: 'none',
                  paddingLeft: 0,
                  marginLeft: 0,
                  textAlign: 'center'
                }}
              >
                <li>
                  <div className='flex flex-col items-center gap-3'>
                    <div className='flex items-center gap-3'>
                      <span
                        className='flex items-center justify-center rounded-full shrink-0'
                        style={{
                          width: '32px',
                          height: '32px',
                          backgroundColor: 'rgba(19, 127, 236, 0.15)',
                          border: '2px solid var(--skillsaware-primary)',
                          color: 'var(--skillsaware-primary)',
                          fontSize: '14px',
                          fontWeight: 'bold'
                        }}
                      >
                        1
                      </span>
                      <h3
                        className='text-sm font-semibold'
                        style={{
                          color: 'var(--skillsaware-text-primary)'
                        }}
                      >
                        Define Skill Claim
                      </h3>
                    </div>
                    <p
                      className='text-sm font-normal max-w-xs'
                      style={{ color: 'var(--skillsaware-text-secondary)' }}
                    >
                      Enter the claimant&apos;s details and the specific skill attributes
                      in the form.
                    </p>
                  </div>
                </li>
                <li>
                  <div className='flex flex-col items-center gap-3'>
                    <div className='flex items-center gap-3'>
                      <span
                        className='flex items-center justify-center rounded-full shrink-0'
                        style={{
                          width: '32px',
                          height: '32px',
                          backgroundColor: 'rgba(19, 127, 236, 0.15)',
                          border: '2px solid var(--skillsaware-primary)',
                          color: 'var(--skillsaware-primary)',
                          fontSize: '14px',
                          fontWeight: 'bold'
                        }}
                      >
                        2
                      </span>
                      <h3
                        className='text-sm font-semibold'
                        style={{ color: 'var(--skillsaware-text-primary)' }}
                      >
                        Generate Magic Link
                      </h3>
                    </div>
                    <p
                      className='text-sm font-normal max-w-xs'
                      style={{ color: 'var(--skillsaware-text-secondary)' }}
                    >
                      The system creates a signed, time-sensitive URL containing the claim
                      data.
                    </p>
                  </div>
                </li>
                <li>
                  <div className='flex flex-col items-center gap-3'>
                    <div className='flex items-center gap-3'>
                      <span
                        className='flex items-center justify-center rounded-full shrink-0'
                        style={{
                          width: '32px',
                          height: '32px',
                          backgroundColor: 'rgba(19, 127, 236, 0.15)',
                          border: '2px solid var(--skillsaware-primary)',
                          color: 'var(--skillsaware-primary)',
                          fontSize: '14px',
                          fontWeight: 'bold'
                        }}
                      >
                        3
                      </span>
                      <h3
                        className='text-sm font-semibold'
                        style={{ color: 'var(--skillsaware-text-primary)' }}
                      >
                        Send to Claimant
                      </h3>
                    </div>
                    <p
                      className='text-sm font-normal max-w-xs'
                      style={{ color: 'var(--skillsaware-text-secondary)' }}
                    >
                      Share the link. The claimant will verify their identity and accept
                      the endorsement.
                    </p>
                  </div>
                </li>
              </ol>
              {/* Stateless Note Highlight */}
              <div
                className='mt-8 border rounded-lg p-4 text-center'
                style={{
                  backgroundColor: 'rgba(19, 127, 236, 0.05)',
                  borderColor: 'rgba(19, 127, 236, 0.2)'
                }}
              >
                <div className='flex flex-col items-center gap-2'>
                  <span
                    className='material-symbols-outlined text-sm'
                    style={{ color: 'var(--skillsaware-primary)' }}
                  >
                    lightbulb
                  </span>
                  <div>
                    <p
                      className='text-xs font-bold mb-1'
                      style={{ color: 'var(--skillsaware-primary)' }}
                    >
                      Direct File Delivery
                    </p>
                    <p
                      className='text-xs leading-relaxed max-w-xs mx-auto'
                      style={{ color: 'var(--skillsaware-text-secondary)' }}
                    >
                      This system is <strong>stateless</strong>. We do not store claimant
                      PII on our servers. All necessary data is embedded directly into the
                      signed magic link.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
