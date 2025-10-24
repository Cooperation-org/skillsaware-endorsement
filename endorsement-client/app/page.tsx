'use client'

import { useState } from 'react'

export default function Home() {
  const [formData, setFormData] = useState({
    claimant_name: 'Jane Doe',
    claimant_email: 'jane.doe@example.com',
    skill_name: 'Apply innovative thinking and practices in digital environments',
    skill_code: 'ICTDSN403',
    skill_description:
      'Demonstrates the ability to apply innovative thinking and practices in digital environments'
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

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4'>
      <div className='max-w-2xl mx-auto'>
        <div className='bg-white rounded-lg shadow-xl p-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            SkillsAware Endorsement Client
          </h1>
          <p className='text-gray-600 mb-8'>
            Create a skill claim and generate magic links for the endorsement workflow
          </p>

          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* Claimant Name */}
            <div>
              <label
                htmlFor='claimant_name'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Claimant Name *
              </label>
              <input
                type='text'
                id='claimant_name'
                required
                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                value={formData.claimant_name}
                onChange={e =>
                  setFormData({ ...formData, claimant_name: e.target.value })
                }
                placeholder='Jane Doe'
              />
            </div>

            {/* Claimant Email */}
            <div>
              <label
                htmlFor='claimant_email'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Claimant Email *
              </label>
              <input
                type='email'
                id='claimant_email'
                required
                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                value={formData.claimant_email}
                onChange={e =>
                  setFormData({ ...formData, claimant_email: e.target.value })
                }
                placeholder='jane@example.com'
              />
            </div>

            {/* Skill Code */}
            <div>
              <label
                htmlFor='skill_code'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Skill Code *
              </label>
              <input
                type='text'
                id='skill_code'
                required
                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                value={formData.skill_code}
                onChange={e => setFormData({ ...formData, skill_code: e.target.value })}
              />
            </div>

            {/* Skill Name */}
            <div>
              <label
                htmlFor='skill_name'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Skill Name *
              </label>
              <input
                type='text'
                id='skill_name'
                required
                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                value={formData.skill_name}
                onChange={e => setFormData({ ...formData, skill_name: e.target.value })}
              />
            </div>

            {/* Skill Description */}
            <div>
              <label
                htmlFor='skill_description'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Skill Description *
              </label>
              <textarea
                id='skill_description'
                required
                rows={3}
                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                value={formData.skill_description}
                onChange={e =>
                  setFormData({ ...formData, skill_description: e.target.value })
                }
              />
            </div>

            {/* Submit Button */}
            <button
              type='submit'
              disabled={loading}
              className='w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors'
            >
              {loading ? 'Creating Claim...' : 'Create Claim & Generate Magic Link'}
            </button>
          </form>

          {/* Error Display */}
          {error && (
            <div className='mt-6 p-4 bg-red-50 border border-red-200 rounded-lg'>
              <h3 className='text-red-800 font-medium mb-1'>Error</h3>
              <p className='text-red-600 text-sm'>{error}</p>
            </div>
          )}

          {/* Success Result */}
          {result && (
            <div className='mt-6 p-6 bg-green-50 border border-green-200 rounded-lg'>
              <h3 className='text-green-800 font-bold text-lg mb-4'>
                ✓ Claim Created Successfully!
              </h3>

              <div className='space-y-4'>
                <div>
                  <p className='text-sm font-medium text-gray-700 mb-1'>Claim ID:</p>
                  <code className='block bg-white px-3 py-2 rounded border border-gray-200 text-sm'>
                    {result.claim_id}
                  </code>
                </div>

                <div>
                  <p className='text-sm font-medium text-gray-700 mb-1'>
                    Claimant Magic Link:
                  </p>
                  <div className='bg-white px-3 py-2 rounded border border-gray-200'>
                    <a
                      href={result.claimant_link}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-blue-600 hover:text-blue-800 text-sm break-all'
                    >
                      {result.claimant_link}
                    </a>
                  </div>
                </div>

                <div>
                  <p className='text-sm font-medium text-gray-700 mb-1'>Expires At:</p>
                  <code className='block bg-white px-3 py-2 rounded border border-gray-200 text-sm'>
                    {new Date(result.expires_at).toLocaleString()}
                  </code>
                </div>

                <div className='pt-2'>
                  <a
                    href={result.claimant_link}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-block bg-green-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors'
                  >
                    Open Claimant Form →
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className='mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6'>
          <h3 className='text-blue-900 font-bold mb-2'>How it works:</h3>
          <ol className='text-blue-800 text-sm space-y-2 list-decimal list-inside'>
            <li>Fill in the claimant details above</li>
            <li>Click &ldquo;Create Claim&rdquo; to generate a magic link</li>
            <li>Send the claimant link to the person claiming the skill</li>
            <li>They submit their narrative and generate an endorser link</li>
            <li>The endorser completes the endorsement form</li>
            <li>PDF certificate and JSON credentials are generated</li>
            <li>Files are available for immediate download (no S3 required!)</li>
            <li>
              Optional: Files can also be stored in S3 and webhook sent if configured
            </li>
          </ol>

          <div className='mt-4 p-3 bg-green-50 border border-green-300 rounded'>
            <p className='text-green-900 text-sm'>
              <strong>✨ New:</strong> The system now works without AWS S3! Files are
              delivered directly to users for download.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
