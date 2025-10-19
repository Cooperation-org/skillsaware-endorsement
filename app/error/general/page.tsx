export default function GeneralErrorPage() {
  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{ backgroundColor: '#f5f5f5', padding: '30px', borderRadius: '10px', border: '2px solid #9e9e9e' }}>
        <svg
          style={{ width: '64px', height: '64px', marginBottom: '20px' }}
          fill="none"
          stroke="#757575"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h1 style={{ color: '#424242', fontSize: '24px', marginBottom: '10px' }}>
          Something Went Wrong
        </h1>
        <p style={{ fontSize: '16px', color: '#555', marginBottom: '20px' }}>
          An unexpected error occurred while processing your request.
        </p>
        <p style={{ fontSize: '14px', color: '#666' }}>
          Please try again later or contact support if the problem persists.
        </p>
      </div>
    </div>
  );
}
