export default function TokenExpiredPage() {
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
          backgroundColor: '#fff3e0',
          padding: '30px',
          borderRadius: '10px',
          border: '2px solid #ff9800'
        }}
      >
        <svg
          style={{ width: '64px', height: '64px', marginBottom: '20px' }}
          fill='none'
          stroke='#ff9800'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
          />
        </svg>
        <h1 style={{ color: '#e65100', fontSize: '24px', marginBottom: '10px' }}>
          Token Expired
        </h1>
        <p style={{ fontSize: '16px', color: '#555', marginBottom: '20px' }}>
          Your magic link has expired for security reasons.
        </p>
        <p style={{ fontSize: '14px', color: '#666' }}>
          Please contact SkillsAware to request a new link.
        </p>
      </div>
    </div>
  )
}
