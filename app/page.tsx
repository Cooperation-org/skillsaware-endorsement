import Link from 'next/link'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

export default function Home() {
  return (
    <div
      className='min-h-screen flex flex-col'
      style={{ backgroundColor: 'var(--skillsaware-bg-secondary)' }}
    >
      {/* Header */}
      <Navbar />

      <main className='flex-grow'>
        {/* Hero Section */}
        <section className='relative overflow-hidden hero-section'>
          <div className='hero-container max-w-[1400px] mx-auto'>
            <div className='flex flex-col lg:flex-row gap-12 items-center'>
              <div className='flex-1 flex flex-col gap-6 max-w-2xl'>
                {/* Version Badge */}
                <div
                  className='inline-flex items-center gap-2 px-3 py-1 rounded-full w-fit'
                  style={{
                    backgroundColor: 'rgba(19, 127, 236, 0.1)',
                    border: '1px solid rgba(19, 127, 236, 0.2)',
                    width: 'fit-content'
                  }}
                >
                  <span
                    className='material-symbols-outlined'
                    style={{ color: 'var(--skillsaware-primary)', fontSize: '0.875rem' }}
                  >
                    bolt
                  </span>
                  <span
                    className='text-xs font-semibold uppercase tracking-wide'
                    style={{ color: 'var(--skillsaware-primary)' }}
                  >
                    Version 2.0 Now Live
                  </span>
                </div>
                <h1
                  className='text-4xl lg:text-6xl font-black leading-[1.1] tracking-tight'
                  style={{ color: 'var(--skillsaware-text-primary)', fontWeight: 900 }}
                >
                  The Standard for{' '}
                  <span style={{ color: 'var(--skillsaware-primary)', fontWeight: 900 }}>
                    Stateless
                  </span>{' '}
                  Skill Credentials
                </h1>
                <p
                  className='text-lg leading-relaxed max-w-xl'
                  style={{
                    color: 'var(--skillsaware-text-secondary)',
                    fontWeight: 400
                  }}
                >
                  Secure, fast, and standards-compliant endorsement verification for the
                  modern web. Built on W3C standards with zero data retention.
                </p>
                <div className='flex flex-wrap gap-4 mt-2'>
                  <Link
                    href='/verify'
                    className='btn btn-primary flex items-center gap-2 shadow-lg'
                    style={{
                      padding: '0.75rem 1.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '700',
                      boxShadow: '0 10px 15px -3px rgba(19, 127, 236, 0.25)'
                    }}
                  >
                    <span
                      className='material-symbols-outlined'
                      style={{ fontSize: '20px' }}
                    >
                      play_arrow
                    </span>
                    Get Started
                  </Link>
                  <Link
                    href='/api-docs'
                    className='btn btn-secondary flex items-center gap-2'
                    style={{
                      padding: '0.75rem 1.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '700'
                    }}
                  >
                    <span
                      className='material-symbols-outlined'
                      style={{ fontSize: '20px' }}
                    >
                      description
                    </span>
                    View Documentation
                  </Link>
                </div>
              </div>
              <div className='flex-1 w-full relative'>
                {/* Terminal/Demo Visualization - Dark Theme */}
                <div
                  className='relative rounded-xl overflow-hidden shadow-2xl border aspect-[4/3] group w-full'
                  style={{
                    backgroundColor: '#1f2937',
                    borderColor: '#374151',
                    marginTop: '2rem'
                  }}
                >
                  <div
                    className='absolute inset-0'
                    style={{
                      background: 'linear-gradient(to bottom right, #1f2937, #000000)',
                      zIndex: 0
                    }}
                  ></div>
                  {/* Faint glow from center */}
                  <div
                    className='absolute top-1/2 left-1/2'
                    style={{
                      transform: 'translate(-50%, -50%)',
                      width: '75%',
                      height: '75%',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      borderRadius: '50%',
                      filter: 'blur(60px)',
                      zIndex: 1
                    }}
                  ></div>
                  <div
                    className='relative p-6 flex flex-col h-full justify-between'
                    style={{ fontFamily: 'monospace', fontSize: '0.875rem', zIndex: 10 }}
                  >
                    <div className='flex gap-2 mb-4'>
                      <div
                        className='rounded-full'
                        style={{
                          width: '12px',
                          height: '12px',
                          backgroundColor: '#ef4444'
                        }}
                      ></div>
                      <div
                        className='rounded-full'
                        style={{
                          width: '12px',
                          height: '12px',
                          backgroundColor: '#eab308'
                        }}
                      ></div>
                      <div
                        className='rounded-full'
                        style={{
                          width: '12px',
                          height: '12px',
                          backgroundColor: '#22c55e'
                        }}
                      ></div>
                    </div>
                    <div className='space-y-3'>
                      <div className='flex items-center gap-3'>
                        <span
                          style={{
                            color: '#60a5fa',
                            textShadow: '0 0 8px rgba(96, 165, 250, 0.5)'
                          }}
                        >
                          &gt;
                        </span>
                        <span style={{ color: '#9ca3af', fontWeight: 400 }}>
                          Initialising ledger connection...
                        </span>
                      </div>
                      <div className='flex items-center gap-3'>
                        <span
                          style={{
                            color: '#60a5fa',
                            textShadow: '0 0 8px rgba(96, 165, 250, 0.5)'
                          }}
                        >
                          &gt;
                        </span>
                        <span style={{ color: '#9ca3af', fontWeight: 400 }}>
                          Verifying cryptographic signature...
                        </span>
                      </div>
                      <div className='flex items-center gap-3'>
                        <span
                          style={{
                            color: '#4ade80',
                            textShadow: '0 0 8px rgba(74, 222, 128, 0.5)'
                          }}
                        >
                          &gt;
                        </span>
                        <span
                          style={{
                            color: '#4ade80',
                            fontWeight: 500,
                            textShadow: '0 0 8px rgba(74, 222, 128, 0.4)'
                          }}
                        >
                          Certificate Validated: ID #884-291
                        </span>
                      </div>
                      <div
                        className='p-3 rounded border mt-2'
                        style={{
                          backgroundColor: 'rgba(31, 41, 55, 0.5)',
                          borderColor: '#374151'
                        }}
                      >
                        <div
                          className='flex justify-between text-xs mb-1'
                          style={{ color: '#9ca3af', fontWeight: 500 }}
                        >
                          <span>ISSUER</span>
                          <span>STATUS</span>
                        </div>
                        <div
                          className='flex justify-between'
                          style={{ color: '#ffffff', fontWeight: 500 }}
                        >
                          <span>SkillsAware Foundation</span>
                          <span
                            className='flex items-center gap-1'
                            style={{
                              color: '#4ade80',
                              fontWeight: 500,
                              textShadow: '0 0 8px rgba(74, 222, 128, 0.4)'
                            }}
                          >
                            <span
                              className='relative block'
                              style={{
                                height: '8px',
                                width: '8px',
                                marginRight: '4px',
                                flexShrink: 0,
                                filter: 'drop-shadow(0 0 4px rgba(74, 222, 128, 0.6))'
                              }}
                            >
                              <span
                                className='absolute block rounded-full opacity-75'
                                style={{
                                  height: '8px',
                                  width: '8px',
                                  borderRadius: '50%',
                                  backgroundColor: '#4ade80',
                                  animation:
                                    'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
                                  top: 0,
                                  left: 0,
                                  boxShadow: '0 0 8px rgba(74, 222, 128, 0.8)'
                                }}
                              ></span>
                              <span
                                className='relative block rounded-full'
                                style={{
                                  height: '8px',
                                  width: '8px',
                                  borderRadius: '50%',
                                  backgroundColor: '#4ade80',
                                  top: 0,
                                  left: 0,
                                  boxShadow: '0 0 6px rgba(74, 222, 128, 0.6)'
                                }}
                              ></span>
                            </span>
                            <span
                              className='material-symbols-outlined'
                              style={{
                                fontSize: '14px',
                                filter: 'drop-shadow(0 0 4px rgba(74, 222, 128, 0.5))'
                              }}
                            >
                              check_circle
                            </span>
                            Verified
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PDF Certificate Verification Section */}
        <section
          className='border-y'
          style={{
            backgroundColor: 'var(--skillsaware-bg-primary)',
            borderColor: 'var(--skillsaware-border)',
            paddingTop: '4rem',
            paddingBottom: '4rem'
          }}
        >
          <div style={{ padding: '0 1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div
              className='card rounded-xl shadow-sm border overflow-hidden mb-6'
              style={{
                borderLeft: '4px solid var(--skillsaware-success)',
                backgroundColor: 'var(--skillsaware-bg-primary)',
                borderColor: 'var(--skillsaware-border)'
              }}
            >
              <div style={{ padding: '2rem' }}>
                <h2
                  className='text-3xl font-bold tracking-tight mb-4'
                  style={{ color: 'var(--skillsaware-text-primary)' }}
                >
                  🔐 PDF Certificate Verification
                </h2>

                <p
                  className='text-base leading-relaxed mb-6'
                  style={{ color: 'var(--skillsaware-text-secondary)' }}
                >
                  Every SkillsAware certificate includes{' '}
                  <strong>multi-layer cryptographic protection</strong> that ensures
                  authenticity and detects any tampering. Our verification system checks
                  multiple aspects of the certificate:
                </p>

                <div
                  className='rounded-lg border p-5 mb-6'
                  style={{
                    backgroundColor: 'var(--skillsaware-bg-primary)',
                    borderColor: 'var(--skillsaware-border)'
                  }}
                >
                  <h3
                    className='text-lg font-bold mb-4'
                    style={{ color: 'var(--skillsaware-success)' }}
                  >
                    How Verification Works
                  </h3>
                  <ul
                    className='space-y-3'
                    style={{
                      fontSize: '15px',
                      lineHeight: '1.8',
                      color: 'var(--skillsaware-text-secondary)',
                      paddingLeft: '1.5rem'
                    }}
                  >
                    <li>
                      <strong>Metadata Integrity:</strong> Verifies HMAC-SHA256 signature
                      and content hash stored in PDF metadata
                    </li>
                    <li>
                      <strong>Creator Validation:</strong> Ensures the PDF was created by
                      SkillsAware and not modified with external editors
                    </li>
                    <li>
                      <strong>Content Verification:</strong> Extracts and validates actual
                      PDF text against stored credential data
                    </li>
                    <li>
                      <strong>Context-Aware Matching:</strong> Checks that names,
                      signatures, and skill codes appear in their expected locations
                    </li>
                  </ul>
                </div>

                <div
                  className='alert alert-warning mb-6'
                  style={{
                    backgroundColor: '#fff4e5',
                    borderColor: 'var(--skillsaware-warning)',
                    borderLeft: '4px solid var(--skillsaware-warning)',
                    padding: '1rem',
                    borderRadius: '6px'
                  }}
                >
                  <strong style={{ color: '#5e3a00' }}>
                    🛡️ Why Both Metadata and Content?
                  </strong>
                  <p
                    className='text-sm mt-2'
                    style={{ color: '#5e3a00', marginBottom: 0 }}
                  >
                    Checking metadata alone isn&apos;t enough - someone could edit the PDF
                    text while keeping metadata intact. Checking content alone isn&apos;t
                    secure - someone could forge a PDF with fake text. Our system verifies{' '}
                    <strong>both layers</strong> and ensures they match, providing
                    complete tamper detection.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                  <Link
                    href='/verify'
                    className='btn btn-success inline-flex items-center gap-2'
                    style={{
                      padding: '0.75rem 1.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '700'
                    }}
                  >
                    <span
                      className='material-symbols-outlined'
                      style={{ fontSize: '20px' }}
                    >
                      verified
                    </span>
                    Verify Certificate (Web) →
                  </Link>
                  <Link
                    href='/api-docs'
                    className='btn btn-primary inline-flex items-center gap-2'
                    style={{
                      padding: '0.75rem 1.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '700'
                    }}
                  >
                    <span
                      className='material-symbols-outlined'
                      style={{ fontSize: '20px' }}
                    >
                      description
                    </span>
                    View Full API Documentation →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section
          style={{
            backgroundColor: 'var(--skillsaware-bg-secondary)',
            paddingTop: '4rem',
            paddingBottom: '4rem'
          }}
        >
          <div style={{ padding: '0 1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
            <div className='flex flex-col md:flex-row justify-between items-end gap-6 mb-12'>
              <div style={{ maxWidth: '36rem' }}>
                <h2
                  className='text-3xl font-bold tracking-tight mb-4'
                  style={{ color: 'var(--skillsaware-text-primary)' }}
                >
                  Key Capabilities
                </h2>
                <p style={{ color: 'var(--skillsaware-text-secondary)' }}>
                  Why leading platforms trust SkillsAware for credential management and
                  verification.
                </p>
              </div>
            </div>
            <div className='grid md:grid-cols-3 gap-6'>
              {/* Feature 1 */}
              <div className='card rounded-xl border shadow-sm hover:shadow-lg transition-shadow'>
                <div
                  className='flex items-center justify-center mb-4'
                  style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: 'rgba(19, 127, 236, 0.1)',
                    borderRadius: '0.5rem',
                    color: 'var(--skillsaware-primary)'
                  }}
                >
                  <span className='material-symbols-outlined'>lock</span>
                </div>
                <h3
                  className='text-lg font-bold mb-2'
                  style={{ color: 'var(--skillsaware-text-primary)' }}
                >
                  Stateless Architecture
                </h3>
                <p
                  className='text-sm leading-relaxed'
                  style={{ color: 'var(--skillsaware-text-secondary)' }}
                >
                  No stored user data ensures maximum privacy and security. We verify
                  signatures without retaining the content.
                </p>
              </div>
              {/* Feature 2 */}
              <div className='card rounded-xl border shadow-sm hover:shadow-lg transition-shadow'>
                <div
                  className='flex items-center justify-center mb-4'
                  style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: 'rgba(108, 92, 231, 0.1)',
                    borderRadius: '0.5rem',
                    color: 'var(--skillsaware-accent-purple)'
                  }}
                >
                  <span className='material-symbols-outlined'>verified</span>
                </div>
                <h3
                  className='text-lg font-bold mb-2'
                  style={{ color: 'var(--skillsaware-text-primary)' }}
                >
                  Open Standards
                </h3>
                <p
                  className='text-sm leading-relaxed'
                  style={{ color: 'var(--skillsaware-text-secondary)' }}
                >
                  Fully compliant with W3C Verifiable Credentials standards, ensuring
                  interoperability across platforms.
                </p>
              </div>
              {/* Feature 3 */}
              <div className='card rounded-xl border shadow-sm hover:shadow-lg transition-shadow'>
                <div
                  className='flex items-center justify-center mb-4'
                  style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: 'rgba(255, 171, 0, 0.1)',
                    borderRadius: '0.5rem',
                    color: 'var(--skillsaware-warning)'
                  }}
                >
                  <span className='material-symbols-outlined'>offline_bolt</span>
                </div>
                <h3
                  className='text-lg font-bold mb-2'
                  style={{ color: 'var(--skillsaware-text-primary)' }}
                >
                  Instant Validation
                </h3>
                <p
                  className='text-sm leading-relaxed'
                  style={{ color: 'var(--skillsaware-text-secondary)' }}
                >
                  Real-time verification with 99.9% uptime SLA. Get results in
                  milliseconds, not seconds.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* API Section */}
        <section
          className='border-t api-section'
          style={{
            backgroundColor: 'var(--skillsaware-bg-primary)',
            borderColor: 'var(--skillsaware-border)'
          }}
        >
          <div className='api-section-container max-w-[1400px] mx-auto'>
            <div className='flex flex-col lg:flex-row gap-12 lg:gap-20 lg:items-start'>
              <div
                className='w-full lg:flex-1 flex flex-col gap-6'
                style={{ maxWidth: '42rem' }}
              >
                <h2
                  className='text-3xl font-bold tracking-tight mb-4'
                  style={{ color: 'var(--skillsaware-text-primary)' }}
                >
                  Developer-First API
                </h2>
                <p
                  className='text-lg'
                  style={{ color: 'var(--skillsaware-text-secondary)' }}
                >
                  Integrate verification directly into your application. Our REST API is
                  built for simplicity and performance.
                </p>
                <div className='space-y-4'>
                  <div className='flex gap-4 items-start'>
                    <div
                      className='mt-1 p-1 rounded'
                      style={{ backgroundColor: 'rgba(19, 127, 236, 0.1)' }}
                    ></div>
                    <div>
                      <h4
                        className='font-bold'
                        style={{ color: 'var(--skillsaware-text-primary)' }}
                      >
                        Multipart Uploads
                      </h4>
                      <p
                        className='text-sm'
                        style={{ color: 'var(--skillsaware-text-secondary)' }}
                      >
                        Standard multipart/form-data support for easy file handling.
                      </p>
                    </div>
                  </div>
                  <div className='flex gap-4 items-start'>
                    <div
                      className='mt-1 p-1 rounded'
                      style={{ backgroundColor: 'rgba(19, 127, 236, 0.1)' }}
                    ></div>
                    <div>
                      <h4
                        className='font-bold'
                        style={{ color: 'var(--skillsaware-text-primary)' }}
                      >
                        JSON Responses
                      </h4>
                      <p
                        className='text-sm'
                        style={{ color: 'var(--skillsaware-text-secondary)' }}
                      >
                        Predictable, typed JSON responses for every request.
                      </p>
                    </div>
                  </div>
                </div>
                <Link
                  href='/api-docs'
                  className='btn btn-secondary flex items-center gap-2'
                  style={{
                    padding: '0.75rem 1.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '700'
                  }}
                >
                  <span>Open API Docs</span>
                  <span
                    className='material-symbols-outlined'
                    style={{ fontSize: '18px' }}
                  >
                    open_in_new
                  </span>
                </Link>
              </div>
              <div className='w-full lg:flex-1 relative'>
                <div
                  className='rounded-xl overflow-hidden shadow-2xl border w-full'
                  style={{ backgroundColor: '#1e1e1e', borderColor: '#374151' }}
                >
                  <div
                    className='flex items-center justify-between px-4 py-3 border-b'
                    style={{ backgroundColor: '#252526', borderColor: '#374151' }}
                  >
                    <div className='flex items-center gap-2'>
                      <div
                        className='rounded-full'
                        style={{
                          width: '12px',
                          height: '12px',
                          backgroundColor: '#ef4444'
                        }}
                      ></div>
                      <div
                        className='rounded-full'
                        style={{
                          width: '12px',
                          height: '12px',
                          backgroundColor: '#eab308'
                        }}
                      ></div>
                      <div
                        className='rounded-full'
                        style={{
                          width: '12px',
                          height: '12px',
                          backgroundColor: '#22c55e'
                        }}
                      ></div>
                    </div>
                    <div className='text-xs font-mono' style={{ color: '#9ca3af' }}>
                      verify-pdf-request.js
                    </div>
                  </div>
                  <div className='p-6 overflow-x-auto'>
                    <pre
                      className='font-mono text-sm leading-relaxed'
                      style={{ color: '#d1d5db' }}
                    >
                      <code>
                        <span style={{ color: '#c084fc' }}>const</span>{' '}
                        <span style={{ color: '#60a5fa' }}>formData</span> ={' '}
                        <span style={{ color: '#c084fc' }}>new</span>{' '}
                        <span style={{ color: '#fbbf24' }}>FormData</span>();
                        <br />
                        <span style={{ color: '#60a5fa' }}>formData</span>.
                        <span style={{ color: '#fbbf24' }}>append</span>(
                        <span style={{ color: '#86efac' }}>&apos;file&apos;</span>,{' '}
                        <span style={{ color: '#60a5fa' }}>fileInput</span>.
                        <span style={{ color: '#60a5fa' }}>files</span>[
                        <span style={{ color: '#fb923c' }}>0</span>]);
                        <br />
                        <br />
                        <span style={{ color: '#c084fc' }}>const</span>{' '}
                        <span style={{ color: '#60a5fa' }}>response</span> ={' '}
                        <span style={{ color: '#c084fc' }}>await</span>{' '}
                        <span style={{ color: '#fbbf24' }}>fetch</span>(
                        <span style={{ color: '#86efac' }}>
                          &apos;https://api.skillsaware.io/v1/verify-pdf&apos;
                        </span>
                        , {'{'}
                        <br />
                        {'  '}
                        <span style={{ color: '#60a5fa' }}>method</span>:{' '}
                        <span style={{ color: '#86efac' }}>&apos;POST&apos;</span>,<br />
                        {'  '}
                        <span style={{ color: '#60a5fa' }}>body</span>:{' '}
                        <span style={{ color: '#60a5fa' }}>formData</span>
                        <br />
                        {'}'});
                        <br />
                        <br />
                        <span style={{ color: '#c084fc' }}>const</span>{' '}
                        <span style={{ color: '#60a5fa' }}>result</span> ={' '}
                        <span style={{ color: '#c084fc' }}>await</span>{' '}
                        <span style={{ color: '#60a5fa' }}>response</span>.
                        <span style={{ color: '#fbbf24' }}>json</span>();
                        <br />
                        <span style={{ color: '#6b7280' }}>
                          {'//'} {'{'} &quot;valid&quot;: true, &quot;issuer&quot;:
                          &quot;SkillsAware&quot;, ... {'}'}
                        </span>
                      </code>
                    </pre>
                  </div>
                  <div
                    className='px-4 py-2 border-t flex justify-between items-center'
                    style={{ backgroundColor: '#252526', borderColor: '#374151' }}
                  >
                    <span
                      className='text-[10px] font-mono uppercase'
                      style={{ color: '#6b7280' }}
                    >
                      Request Preview
                    </span>
                    <div className='flex items-center gap-2'>
                      <div
                        className='rounded-full'
                        style={{
                          height: '8px',
                          width: '8px',
                          backgroundColor: '#22c55e'
                        }}
                      ></div>
                      <span
                        className='text-[10px] font-mono'
                        style={{ color: '#9ca3af' }}
                      >
                        200 OK
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
