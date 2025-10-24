export default function Home() {
  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <header
        style={{
          borderBottom: '4px solid #0B5FFF',
          paddingBottom: '20px',
          marginBottom: '40px'
        }}
      >
        <h1 style={{ color: '#0B5FFF', fontSize: '36px', marginBottom: '10px' }}>
          SkillsAware OBv3 Endorsement System
        </h1>
        <p style={{ fontSize: '18px', color: '#666' }}>
          Stateless, Standards-Compliant Skill Credential Platform
        </p>
      </header>

      {/* Overview */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ color: '#333', fontSize: '24px', marginBottom: '15px' }}>
          Overview
        </h2>
        <p
          style={{
            fontSize: '16px',
            lineHeight: '1.6',
            color: '#555',
            marginBottom: '15px'
          }}
        >
          This is a serverless endorsement workflow platform that enables skill claim
          creation, endorser validation, and OBv3 credential generation—all without a
          database.
        </p>
        <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#555' }}>
          Built with Next.js 15, powered by Open Badges v3.0 standards.
        </p>
      </section>

      {/* Verification Section */}
      <section
        style={{
          marginBottom: '40px',
          backgroundColor: '#e8f5e9',
          padding: '30px',
          borderRadius: '8px',
          border: '2px solid #4caf50'
        }}
      >
        <h2 style={{ color: '#2e7d32', fontSize: '24px', marginBottom: '20px' }}>
          🔐 PDF Certificate Verification
        </h2>

        <p
          style={{
            fontSize: '16px',
            lineHeight: '1.8',
            color: '#555',
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
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '6px',
            marginBottom: '20px'
          }}
        >
          <h3 style={{ color: '#2e7d32', fontSize: '18px', marginBottom: '15px' }}>
            How Verification Works
          </h3>
          <ul
            style={{
              fontSize: '15px',
              lineHeight: '1.8',
              color: '#555',
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

        <div
          style={{
            backgroundColor: '#fff3cd',
            padding: '15px',
            borderRadius: '6px',
            marginBottom: '20px',
            border: '1px solid #ffc107'
          }}
        >
          <strong style={{ color: '#856404' }}>🛡️ Why Both Metadata and Content?</strong>
          <p
            style={{
              fontSize: '14px',
              color: '#856404',
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
          <a
            href='/verify'
            style={{
              display: 'inline-block',
              backgroundColor: '#4caf50',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            Verify Certificate (Web) →
          </a>
          <a
            href='#verification-api'
            style={{
              display: 'inline-block',
              backgroundColor: '#2e7d32',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            View API Documentation →
          </a>
        </div>
      </section>

      {/* Features */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ color: '#333', fontSize: '24px', marginBottom: '15px' }}>
          Features
        </h2>
        <ul
          style={{
            fontSize: '16px',
            lineHeight: '1.8',
            color: '#555',
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

      {/* API Documentation */}
      <section id='verification-api' style={{ marginBottom: '40px' }}>
        <h2 style={{ color: '#333', fontSize: '24px', marginBottom: '15px' }}>
          API Endpoints
        </h2>
        <div style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '5px' }}>
          <div style={{ marginBottom: '15px' }}>
            <code
              style={{
                fontSize: '14px',
                color: '#c2185b',
                backgroundColor: '#fff',
                padding: '4px 8px',
                borderRadius: '3px'
              }}
            >
              POST /api/v1/claims
            </code>
            <p style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
              Create a new skill claim and generate claimant magic link
            </p>
          </div>
          <div style={{ marginBottom: '15px' }}>
            <code
              style={{
                fontSize: '14px',
                color: '#c2185b',
                backgroundColor: '#fff',
                padding: '4px 8px',
                borderRadius: '3px'
              }}
            >
              POST /api/v1/claims/[id]/endorser-link
            </code>
            <p style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
              Generate endorser magic link after claimant submission
            </p>
          </div>
          <div style={{ marginBottom: '15px' }}>
            <code
              style={{
                fontSize: '14px',
                color: '#c2185b',
                backgroundColor: '#fff',
                padding: '4px 8px',
                borderRadius: '3px'
              }}
            >
              POST /api/v1/endorsements/submit
            </code>
            <p style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
              Submit endorsement and generate OBv3 credentials
            </p>
          </div>
          <div
            style={{
              marginBottom: '15px',
              backgroundColor: '#e8f5e9',
              padding: '12px',
              borderRadius: '5px',
              border: '2px solid #4caf50'
            }}
          >
            <code
              style={{
                fontSize: '14px',
                color: '#2e7d32',
                backgroundColor: '#fff',
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
                color: '#666',
                marginTop: '8px',
                marginBottom: '8px'
              }}
            >
              <strong>Verify PDF certificate authenticity and detect tampering</strong>
            </p>
            <details style={{ fontSize: '13px', color: '#555', marginTop: '8px' }}>
              <summary
                style={{ cursor: 'pointer', fontWeight: 'bold', color: '#2e7d32' }}
              >
                Request Format (multipart/form-data)
              </summary>
              <pre
                style={{
                  backgroundColor: '#f9f9f9',
                  padding: '10px',
                  borderRadius: '4px',
                  marginTop: '8px',
                  overflow: 'auto'
                }}
              >
                {`pdf: <File> (PDF file to verify)`}
              </pre>
            </details>
            <details style={{ fontSize: '13px', color: '#555', marginTop: '8px' }}>
              <summary
                style={{ cursor: 'pointer', fontWeight: 'bold', color: '#2e7d32' }}
              >
                Response Format
              </summary>
              <pre
                style={{
                  backgroundColor: '#f9f9f9',
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
                color: '#c2185b',
                backgroundColor: '#fff',
                padding: '4px 8px',
                borderRadius: '3px'
              }}
            >
              POST /api/v1/webhook/test
            </code>
            <p style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
              Test webhook delivery with HMAC signature
            </p>
          </div>
        </div>
      </section>

      {/* System Status */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ color: '#333', fontSize: '24px', marginBottom: '15px' }}>
          System Status
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '12px',
              height: '12px',
              backgroundColor: '#4caf50',
              borderRadius: '50%'
            }}
          />
          <span style={{ fontSize: '16px', color: '#555' }}>Operational</span>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: '2px solid #e0e0e0',
          paddingTop: '20px',
          textAlign: 'center'
        }}
      >
        <p style={{ fontSize: '14px', color: '#999' }}>
          Powered by What&apos;s Cookin&apos; Inc. | Standards-compliant Open Badges v3.0
          <br />
          Built with Next.js 15, jose, AWS SDK, and Puppeteer
        </p>
      </footer>
    </div>
  )
}
