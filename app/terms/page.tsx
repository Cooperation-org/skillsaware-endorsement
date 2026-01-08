import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'Terms of Service for SkillsAware Endorsement System. Read our terms and conditions for using the skill endorsement platform.',
  openGraph: {
    title: 'Terms of Service | SkillsAware',
    description:
      'Terms of Service for SkillsAware Endorsement System. Read our terms and conditions for using the skill endorsement platform.',
    images: [
      {
        url: '/logo/og-images/default.png',
        width: 1200,
        height: 630,
        alt: 'SkillsAware Terms of Service'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms of Service | SkillsAware',
    description:
      'Terms of Service for SkillsAware Endorsement System. Read our terms and conditions for using the skill endorsement platform.',
    images: ['/logo/og-images/default.png']
  }
}

export default function TermsPage() {
  return (
    <div
      className='min-h-screen flex flex-col'
      style={{ backgroundColor: 'var(--skillsaware-bg-secondary)' }}
    >
      <Navbar />

      <main className='flex-grow'>
        <div
          style={{
            padding: '2rem 1.5rem',
            maxWidth: '800px',
            margin: '0 auto',
            marginTop: '2rem'
          }}
        >
          {/* Demo Notice */}
          <div
            className='mb-8 p-4 rounded-lg border'
            style={{
              backgroundColor: 'rgba(255, 171, 0, 0.1)',
              borderColor: 'rgba(255, 171, 0, 0.3)'
            }}
          >
            <p
              className='text-sm font-semibold'
              style={{ color: 'var(--skillsaware-warning)' }}
            >
              ⚠️ Demo Content: This is for demo purpose until the desired text is
              provided.
            </p>
          </div>

          {/* Terms Content */}
          <div
            className='card rounded-xl shadow-sm border overflow-hidden'
            style={{
              backgroundColor: 'var(--skillsaware-bg-primary)',
              borderColor: 'var(--skillsaware-border)'
            }}
          >
            <div className='p-6 md:p-8 space-y-6'>
              <h1
                className='text-3xl font-bold'
                style={{ color: 'var(--skillsaware-text-primary)' }}
              >
                Terms of Service
              </h1>

              <div
                className='space-y-6'
                style={{ color: 'var(--skillsaware-text-secondary)' }}
              >
                <section>
                  <h2
                    className='text-xl font-semibold mb-3'
                    style={{ color: 'var(--skillsaware-text-primary)' }}
                  >
                    1. Acceptance of Terms
                  </h2>
                  <p className='text-sm leading-relaxed'>
                    By accessing and using the SkillsAware Endorsement System, you accept
                    and agree to be bound by the terms and provision of this agreement.
                  </p>
                </section>

                <section>
                  <h2
                    className='text-xl font-semibold mb-3'
                    style={{ color: 'var(--skillsaware-text-primary)' }}
                  >
                    2. Use License
                  </h2>
                  <p className='text-sm leading-relaxed mb-2'>
                    Permission is granted to temporarily use the SkillsAware Endorsement
                    System for personal, non-commercial transitory viewing only. This is
                    the grant of a license, not a transfer of title, and under this
                    license you may not:
                  </p>
                  <ul className='list-disc list-inside space-y-1 text-sm ml-4'>
                    <li>modify or copy the materials</li>
                    <li>use the materials for any commercial purpose</li>
                    <li>attempt to decompile or reverse engineer any software</li>
                    <li>remove any copyright or other proprietary notations</li>
                  </ul>
                </section>

                <section>
                  <h2
                    className='text-xl font-semibold mb-3'
                    style={{ color: 'var(--skillsaware-text-primary)' }}
                  >
                    3. Disclaimer
                  </h2>
                  <p className='text-sm leading-relaxed'>
                    The materials on SkillsAware&apos;s website are provided on an
                    &apos;as is&apos; basis. SkillsAware makes no warranties, expressed or
                    implied, and hereby disclaims and negates all other warranties
                    including without limitation, implied warranties or conditions of
                    merchantability, fitness for a particular purpose, or non-infringement
                    of intellectual property or other violation of rights.
                  </p>
                </section>

                <section>
                  <h2
                    className='text-xl font-semibold mb-3'
                    style={{ color: 'var(--skillsaware-text-primary)' }}
                  >
                    4. Limitations
                  </h2>
                  <p className='text-sm leading-relaxed'>
                    In no event shall SkillsAware or its suppliers be liable for any
                    damages (including, without limitation, damages for loss of data or
                    profit, or due to business interruption) arising out of the use or
                    inability to use the materials on SkillsAware&apos;s website.
                  </p>
                </section>

                <section>
                  <h2
                    className='text-xl font-semibold mb-3'
                    style={{ color: 'var(--skillsaware-text-primary)' }}
                  >
                    5. Accuracy of Materials
                  </h2>
                  <p className='text-sm leading-relaxed'>
                    The materials appearing on SkillsAware&apos;s website could include
                    technical, typographical, or photographic errors. SkillsAware does not
                    warrant that any of the materials on its website are accurate,
                    complete, or current.
                  </p>
                </section>

                <section>
                  <h2
                    className='text-xl font-semibold mb-3'
                    style={{ color: 'var(--skillsaware-text-primary)' }}
                  >
                    6. Links
                  </h2>
                  <p className='text-sm leading-relaxed'>
                    SkillsAware has not reviewed all of the sites linked to its website
                    and is not responsible for the contents of any such linked site. The
                    inclusion of any link does not imply endorsement by SkillsAware of the
                    site.
                  </p>
                </section>

                <section>
                  <h2
                    className='text-xl font-semibold mb-3'
                    style={{ color: 'var(--skillsaware-text-primary)' }}
                  >
                    7. Modifications
                  </h2>
                  <p className='text-sm leading-relaxed'>
                    SkillsAware may revise these terms of service for its website at any
                    time without notice. By using this website you are agreeing to be
                    bound by the then current version of these terms of service.
                  </p>
                </section>

                <section>
                  <h2
                    className='text-xl font-semibold mb-3'
                    style={{ color: 'var(--skillsaware-text-primary)' }}
                  >
                    8. Governing Law
                  </h2>
                  <p className='text-sm leading-relaxed'>
                    These terms and conditions are governed by and construed in accordance
                    with applicable laws and you irrevocably submit to the exclusive
                    jurisdiction of the courts in that location.
                  </p>
                </section>
              </div>

              <div
                className='pt-6 border-t'
                style={{ borderColor: 'var(--skillsaware-border)' }}
              >
                <p
                  className='text-xs'
                  style={{ color: 'var(--skillsaware-text-tertiary)' }}
                >
                  Last updated: {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Back Link */}
          <div className='mt-8 text-center'>
            <Link
              href='/'
              className='text-sm font-medium transition-colors'
              style={{ color: 'var(--skillsaware-primary)' }}
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
