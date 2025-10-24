export default function InvalidTokenPage() {
  return (
    <div
      style={{
        padding: '40px',
        maxWidth: '600px',
        margin: '0 auto',
        textAlign: 'center'
      }}
    >
      <div
        style={{
          backgroundColor: '#ffebee',
          padding: '30px',
          borderRadius: '10px',
          border: '2px solid #f44336'
        }}
      >
        <svg
          style={{ width: '64px', height: '64px', marginBottom: '20px' }}
          fill='none'
          stroke='#f44336'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
          />
        </svg>
        <h1 style={{ color: '#c62828', fontSize: '24px', marginBottom: '10px' }}>
          Invalid Token
        </h1>
        <p style={{ fontSize: '16px', color: '#555', marginBottom: '20px' }}>
          The link you are trying to access is invalid or has been tampered with.
        </p>
        <p style={{ fontSize: '14px', color: '#666' }}>
          Please verify the link or contact SkillsAware for assistance.
        </p>
      </div>
    </div>
  )
}
