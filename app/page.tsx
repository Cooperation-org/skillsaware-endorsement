export default function Home() {
  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <header style={{ borderBottom: '4px solid #0B5FFF', paddingBottom: '20px', marginBottom: '40px' }}>
        <h1 style={{ color: '#0B5FFF', fontSize: '36px', marginBottom: '10px' }}>
          SkillsAware OBv3 Endorsement System
        </h1>
        <p style={{ fontSize: '18px', color: '#666' }}>
          Stateless, Standards-Compliant Skill Credential Platform
        </p>
      </header>

      {/* Overview */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ color: '#333', fontSize: '24px', marginBottom: '15px' }}>Overview</h2>
        <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#555', marginBottom: '15px' }}>
          This is a serverless endorsement workflow platform that enables skill claim creation,
          endorser validation, and OBv3 credential generation—all without a database.
        </p>
        <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#555' }}>
          Built with Next.js 15, powered by Open Badges v3.0 standards.
        </p>
      </section>

      {/* Features */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ color: '#333', fontSize: '24px', marginBottom: '15px' }}>Features</h2>
        <ul style={{ fontSize: '16px', lineHeight: '1.8', color: '#555', paddingLeft: '20px' }}>
          <li>Stateless authentication via JWT magic links</li>
          <li>OBv3-compliant JSON-LD credential generation</li>
          <li>Professional PDF certificate rendering</li>
          <li>S3 artifact storage with presigned URLs</li>
          <li>HMAC-signed webhook notifications</li>
          <li>Multi-tenant configuration support</li>
          <li>Zero database - completely serverless</li>
        </ul>
      </section>

      {/* API Documentation */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ color: '#333', fontSize: '24px', marginBottom: '15px' }}>API Endpoints</h2>
        <div style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '5px' }}>
          <div style={{ marginBottom: '15px' }}>
            <code style={{ fontSize: '14px', color: '#c2185b', backgroundColor: '#fff', padding: '4px 8px', borderRadius: '3px' }}>
              POST /api/v1/claims
            </code>
            <p style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
              Create a new skill claim and generate claimant magic link
            </p>
          </div>
          <div style={{ marginBottom: '15px' }}>
            <code style={{ fontSize: '14px', color: '#c2185b', backgroundColor: '#fff', padding: '4px 8px', borderRadius: '3px' }}>
              POST /api/v1/claims/[id]/endorser-link
            </code>
            <p style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
              Generate endorser magic link after claimant submission
            </p>
          </div>
          <div style={{ marginBottom: '15px' }}>
            <code style={{ fontSize: '14px', color: '#c2185b', backgroundColor: '#fff', padding: '4px 8px', borderRadius: '3px' }}>
              POST /api/v1/endorsements/submit
            </code>
            <p style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
              Submit endorsement and generate OBv3 credentials
            </p>
          </div>
          <div>
            <code style={{ fontSize: '14px', color: '#c2185b', backgroundColor: '#fff', padding: '4px 8px', borderRadius: '3px' }}>
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
        <h2 style={{ color: '#333', fontSize: '24px', marginBottom: '15px' }}>System Status</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '12px',
            height: '12px',
            backgroundColor: '#4caf50',
            borderRadius: '50%'
          }} />
          <span style={{ fontSize: '16px', color: '#555' }}>Operational</span>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '2px solid #e0e0e0', paddingTop: '20px', textAlign: 'center' }}>
        <p style={{ fontSize: '14px', color: '#999' }}>
          Powered by What&apos;s Cookin&apos; Inc. | Standards-compliant Open Badges v3.0
          <br />
          Built with Next.js 15, jose, AWS SDK, and Puppeteer
        </p>
      </footer>
    </div>
  );
}
