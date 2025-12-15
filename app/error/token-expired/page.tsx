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
        className='alert alert-warning'
        style={{ padding: '30px', borderRadius: '10px' }}
      >
        <svg
          style={{ width: '64px', height: '64px', marginBottom: '20px' }}
          fill='none'
          stroke='var(--skillsaware-warning)'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
          />
        </svg>
        <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>Token Expired</h1>
        <p
          style={{
            fontSize: '16px',
            color: 'var(--skillsaware-text-secondary)',
            marginBottom: '20px'
          }}
        >
          Your magic link has expired for security reasons.
        </p>
        <p style={{ fontSize: '14px', color: 'var(--skillsaware-text-secondary)' }}>
          Please contact SkillsAware to request a new link.
        </p>
      </div>
    </div>
  )
}
