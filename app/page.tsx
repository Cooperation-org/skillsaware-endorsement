import Image from 'next/image'

export default function Home() {
  return (
    <div
      className='container'
      style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}
    >
      {/* Header */}
      <header
        className='skillsaware-header'
        style={{ padding: '30px', marginBottom: '40px', textAlign: 'center' }}
      >
        <Image
          src='/logo/skillsaware-logo.svg'
          alt='SkillsAware Logo'
          width={250}
          height={75}
          className='skillsaware-logo'
          style={{ margin: '0 auto 20px', filter: 'brightness(0) invert(1)' }}
        />
        <h1
          style={{
            color: 'var(--skillsaware-text-inverse)',
            fontSize: '36px',
            marginBottom: '10px'
          }}
        >
          OBv3 Endorsement System
        </h1>
        <p
          style={{
            fontSize: '18px',
            color: 'var(--skillsaware-text-inverse)',
            opacity: 0.9
          }}
        >
          Stateless, Standards-Compliant Skill Credential Platform
        </p>
      </header>

      {/* Overview */}
      <section style={{ marginBottom: '40px' }}>
        <h2
          style={{
            color: 'var(--skillsaware-text-primary)',
            fontSize: '24px',
            marginBottom: '15px'
          }}
        >
          Overview
        </h2>
        <p
          style={{
            fontSize: '16px',
            lineHeight: '1.6',
            color: 'var(--skillsaware-text-secondary)',
            marginBottom: '15px'
          }}
        >
          This is a serverless endorsement workflow platform that enables skill claim
          creation, endorser validation, and OBv3 credential generation—all without a
          database.
        </p>
        <p
          style={{
            fontSize: '16px',
            lineHeight: '1.6',
            color: 'var(--skillsaware-text-secondary)'
          }}
        >
          Built with Next.js 15, powered by Open Badges v3.0 standards.
        </p>
      </section>

      {/* Verification Section */}
      <section
        className='card mb-3'
        style={{ borderLeft: '4px solid var(--skillsaware-success)' }}
      >
        <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>
          🔐 PDF Certificate Verification
        </h2>

        <p
          style={{
            fontSize: '16px',
            lineHeight: '1.8',
            color: 'var(--skillsaware-text-secondary)',
            marginBottom: '20px'
          }}
        >
          Every SkillsAware certificate includes{' '}
          <strong>multi-layer cryptographic protection</strong> that ensures authenticity
          and detects any tampering. Our verification system checks multiple aspects of
          the certificate:
        </p>

        <div
          style={{
            backgroundColor: 'var(--skillsaware-bg-primary)',
            padding: '20px',
            borderRadius: '6px',
            marginBottom: '20px'
          }}
        >
          <h3
            style={{
              color: 'var(--skillsaware-success)',
              fontSize: '18px',
              marginBottom: '15px'
            }}
          >
            How Verification Works
          </h3>
          <ul
            style={{
              fontSize: '15px',
              lineHeight: '1.8',
              color: 'var(--skillsaware-text-secondary)',
              paddingLeft: '20px',
              marginBottom: '0'
            }}
          >
            <li>
              <strong>Metadata Integrity:</strong> Verifies HMAC-SHA256 signature and
              content hash stored in PDF metadata
            </li>
            <li>
              <strong>Creator Validation:</strong> Ensures the PDF was created by
              SkillsAware and not modified with external editors
            </li>
            <li>
              <strong>Content Verification:</strong> Extracts and validates actual PDF
              text against stored credential data
            </li>
            <li>
              <strong>Context-Aware Matching:</strong> Checks that names, signatures, and
              skill codes appear in their expected locations
            </li>
          </ul>
        </div>

        <div className='alert alert-warning' style={{ marginBottom: '20px' }}>
          <strong>🛡️ Why Both Metadata and Content?</strong>
          <p
            style={{
              fontSize: '14px',
              marginTop: '8px',
              marginBottom: '0'
            }}
          >
            Checking metadata alone isn&apos;t enough - someone could edit the PDF text
            while keeping metadata intact. Checking content alone isn&apos;t secure -
            someone could forge a PDF with fake text. Our system verifies{' '}
            <strong>both layers</strong> and ensures they match, providing complete tamper
            detection.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <a href='/verify' className='btn btn-success'>
            Verify Certificate (Web) →
          </a>
          <a href='/api-docs' className='btn btn-primary'>
            View Full API Documentation →
          </a>
        </div>
      </section>

      {/* Features */}
      <section style={{ marginBottom: '40px' }}>
        <h2
          style={{
            color: 'var(--skillsaware-text-primary)',
            fontSize: '24px',
            marginBottom: '15px'
          }}
        >
          Features
        </h2>
        <ul
          style={{
            fontSize: '16px',
            lineHeight: '1.8',
            color: 'var(--skillsaware-text-secondary)',
            paddingLeft: '20px'
          }}
        >
          <li>Stateless authentication via JWT magic links</li>
          <li>OBv3-compliant JSON-LD credential generation</li>
          <li>Professional PDF certificate rendering with cryptographic signatures</li>
          <li>PDF verification to detect tampering and modifications</li>
          <li>S3 artifact storage with presigned URLs (optional)</li>
          <li>Direct file delivery via base64 (no S3 required)</li>
          <li>HMAC-signed webhook notifications</li>
          <li>Multi-tenant configuration support</li>
          <li>Zero database - completely serverless</li>
        </ul>
      </section>

      {/* API Documentation Section */}
      <section
        className='card mb-3'
        style={{ borderLeft: '4px solid var(--skillsaware-primary)' }}
      >
        <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>
          📚 Interactive API Documentation
        </h2>
        <p
          style={{
            fontSize: '16px',
            lineHeight: '1.8',
            color: 'var(--skillsaware-text-secondary)',
            marginBottom: '20px'
          }}
        >
          Explore our comprehensive API documentation with interactive examples using
          Swagger UI. Test endpoints directly from your browser, view request/response
          schemas, and learn about authentication requirements.
        </p>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <a href='/api-docs' className='btn btn-primary'>
            Open Interactive API Docs →
          </a>
          <a
            href='/api/openapi'
            target='_blank'
            rel='noopener noreferrer'
            className='btn btn-secondary'
          >
            Download OpenAPI Spec (JSON)
          </a>
        </div>
      </section>

      {/* API Endpoints */}
      <section id='verification-api' style={{ marginBottom: '40px' }}>
        <h2
          style={{
            color: 'var(--skillsaware-text-primary)',
            fontSize: '24px',
            marginBottom: '15px'
          }}
        >
          API Endpoints Overview
        </h2>
        <div
          style={{
            backgroundColor: 'var(--skillsaware-bg-secondary)',
            padding: '20px',
            borderRadius: '5px'
          }}
        >
          <div style={{ marginBottom: '15px' }}>
            <code
              style={{
                fontSize: '14px',
                color: 'var(--skillsaware-accent-purple)',
                backgroundColor: 'var(--skillsaware-bg-primary)',
                padding: '4px 8px',
                borderRadius: '3px'
              }}
            >
              POST /api/v1/claims
            </code>
            <p
              style={{
                fontSize: '14px',
                color: 'var(--skillsaware-text-secondary)',
                marginTop: '5px'
              }}
            >
              Create a new skill claim and generate claimant magic link
            </p>
          </div>
          <div style={{ marginBottom: '15px' }}>
            <code
              style={{
                fontSize: '14px',
                color: 'var(--skillsaware-accent-purple)',
                backgroundColor: 'var(--skillsaware-bg-primary)',
                padding: '4px 8px',
                borderRadius: '3px'
              }}
            >
              POST /api/v1/claims/[id]/endorser-link
            </code>
            <p
              style={{
                fontSize: '14px',
                color: 'var(--skillsaware-text-secondary)',
                marginTop: '5px'
              }}
            >
              Generate endorser magic link after claimant submission
            </p>
          </div>
          <div style={{ marginBottom: '15px' }}>
            <code
              style={{
                fontSize: '14px',
                color: 'var(--skillsaware-accent-purple)',
                backgroundColor: 'var(--skillsaware-bg-primary)',
                padding: '4px 8px',
                borderRadius: '3px'
              }}
            >
              POST /api/v1/endorsements/submit
            </code>
            <p
              style={{
                fontSize: '14px',
                color: 'var(--skillsaware-text-secondary)',
                marginTop: '5px'
              }}
            >
              Submit endorsement and generate OBv3 credentials
            </p>
          </div>
          <div className='alert alert-success' style={{ marginBottom: '15px' }}>
            <code
              style={{
                fontSize: '14px',
                color: 'var(--skillsaware-success)',
                backgroundColor: 'var(--skillsaware-bg-primary)',
                padding: '4px 8px',
                borderRadius: '3px',
                fontWeight: 'bold'
              }}
            >
              POST /api/v1/verify-pdf
            </code>
            <p
              style={{
                fontSize: '14px',
                color: 'var(--skillsaware-text-secondary)',
                marginTop: '8px',
                marginBottom: '8px'
              }}
            >
              <strong>Verify PDF certificate authenticity and detect tampering</strong>
            </p>
            <details
              style={{
                fontSize: '13px',
                color: 'var(--skillsaware-text-secondary)',
                marginTop: '8px'
              }}
            >
              <summary
                style={{
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  color: 'var(--skillsaware-success)'
                }}
              >
                Request Format (multipart/form-data)
              </summary>
              <pre
                style={{
                  backgroundColor: 'var(--skillsaware-bg-tertiary)',
                  padding: '10px',
                  borderRadius: '4px',
                  marginTop: '8px',
                  overflow: 'auto'
                }}
              >
                {`pdf: <File> (PDF file to verify)`}
              </pre>
            </details>
            <details
              style={{
                fontSize: '13px',
                color: 'var(--skillsaware-text-secondary)',
                marginTop: '8px'
              }}
            >
              <summary
                style={{
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  color: 'var(--skillsaware-success)'
                }}
              >
                Response Format
              </summary>
              <pre
                style={{
                  backgroundColor: 'var(--skillsaware-bg-tertiary)',
                  padding: '10px',
                  borderRadius: '4px',
                  marginTop: '8px',
                  overflow: 'auto'
                }}
              >
                {`{
  "basicVerification": {
    "valid": true|false,
    "message": "Verification result message",
    "tamperDetails": {
      "detected": true|false,
      "changes": [
        {
          "field": "Digital Signature",
          "original": "Muhammad Hany",
          "status": "SIGNATURE MODIFIED OR REMOVED"
        }
      ]
    }
  },
  "metadata": {
    "title": "...",
    "author": "...",
    "customFields": { ... }
  }
}`}
              </pre>
            </details>
          </div>
          <div>
            <code
              style={{
                fontSize: '14px',
                color: 'var(--skillsaware-accent-purple)',
                backgroundColor: 'var(--skillsaware-bg-primary)',
                padding: '4px 8px',
                borderRadius: '3px'
              }}
            >
              POST /api/v1/webhook/test
            </code>
            <p
              style={{
                fontSize: '14px',
                color: 'var(--skillsaware-text-secondary)',
                marginTop: '5px'
              }}
            >
              Test webhook delivery with HMAC signature
            </p>
          </div>
        </div>
      </section>

      {/* System Status */}
      <section style={{ marginBottom: '40px' }}>
        <h2
          style={{
            color: 'var(--skillsaware-text-primary)',
            fontSize: '24px',
            marginBottom: '15px'
          }}
        >
          System Status
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '12px',
              height: '12px',
              backgroundColor: 'var(--skillsaware-success)',
              borderRadius: '50%'
            }}
          />
          <span style={{ fontSize: '16px', color: 'var(--skillsaware-text-secondary)' }}>
            Operational
          </span>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: '2px solid var(--skillsaware-border)',
          paddingTop: '20px',
          textAlign: 'center'
        }}
      >
        <p style={{ fontSize: '14px', color: 'var(--skillsaware-text-tertiary)' }}>
          Powered by SkillsAware | Standards-compliant Open Badges v3.0
          <br />
          Built with Next.js 15, jose, AWS SDK, and Puppeteer
        </p>
      </footer>
    </div>
  )
}
