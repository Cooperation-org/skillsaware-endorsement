'use client';

import { useState } from 'react';

interface VerificationResult {
  filename: string;
  fileSize: number;
  basicVerification: {
    valid: boolean;
    message: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadata?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tamperDetails?: any;
  };
  fullVerification?: {
    valid: boolean;
    message: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadata?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    details?: any;
  } | null;
  metadata: {
    title?: string;
    author?: string;
    subject?: string;
    creator?: string;
    producer?: string;
    creationDate?: string;
    modificationDate?: string;
    keywords?: string[];
    customFields: Record<string, string>;
  };
}

export default function VerifyPdfClient() {
  const [file, setFile] = useState<File | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
      setError(null);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a PDF file');
      return;
    }

    setVerifying(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('pdf', file);

      const response = await fetch('/api/v1/verify-pdf', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setVerifying(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setSkillCode('');
    setClaimantName('');
    setEndorserName('');
    setResult(null);
    setError(null);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', padding: '40px 20px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ color: '#0B5FFF', fontSize: '32px', marginBottom: '10px' }}>
            PDF Certificate Verifier
          </h1>
          <p style={{ color: '#666', fontSize: '16px' }}>
            Upload a SkillsAware PDF certificate to verify its authenticity and check for modifications
          </p>
        </div>

        {/* Upload Form */}
        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
          <form onSubmit={handleVerify}>
            {/* File Upload */}
            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '10px', color: '#333' }}>
                Select PDF Certificate *
              </label>
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px dashed #0B5FFF',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  backgroundColor: '#f8f9ff',
                }}
              />
              {file && (
                <p style={{ marginTop: '8px', fontSize: '13px', color: '#666' }}>
                  Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>

            {/* Info Box */}
            <div style={{ backgroundColor: '#e3f2fd', padding: '15px', borderRadius: '8px', marginBottom: '20px', borderLeft: '4px solid #0B5FFF' }}>
              <p style={{ fontSize: '14px', color: '#1565c0', margin: 0 }}>
                <strong>✨ Automatic Verification:</strong> All credential data is stored in the PDF metadata and will be automatically verified. Just upload and click verify!
              </p>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="submit"
                disabled={verifying || !file}
                style={{
                  flex: 1,
                  backgroundColor: verifying ? '#ccc' : '#0B5FFF',
                  color: 'white',
                  padding: '14px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: verifying || !file ? 'not-allowed' : 'pointer',
                }}
              >
                {verifying ? 'Verifying...' : 'Verify PDF'}
              </button>
              {(file || result) && (
                <button
                  type="button"
                  onClick={handleReset}
                  style={{
                    backgroundColor: '#666',
                    color: 'white',
                    padding: '14px 24px',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    cursor: 'pointer',
                  }}
                >
                  Reset
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{ backgroundColor: '#ffebee', border: '1px solid #ef5350', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
            <h3 style={{ color: '#c62828', fontSize: '16px', marginBottom: '5px' }}>❌ Verification Failed</h3>
            <p style={{ color: '#d32f2f', fontSize: '14px', margin: 0 }}>{error}</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '25px', color: '#333' }}>Verification Results</h2>

            {/* Basic Verification */}
            <div style={{
              backgroundColor: result.basicVerification.valid ? '#e8f5e9' : '#ffebee',
              border: `2px solid ${result.basicVerification.valid ? '#4caf50' : '#ef5350'}`,
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '25px',
            }}>
              <h3 style={{ fontSize: '18px', marginBottom: '10px', color: result.basicVerification.valid ? '#2e7d32' : '#c62828' }}>
                {result.basicVerification.valid ? '✅ Verification: PASSED' : '❌ Verification: FAILED'}
              </h3>
              <p style={{ fontSize: '14px', color: '#555', margin: 0 }}>
                {result.basicVerification.message}
              </p>

              {/* Tamper Detection Details - only show if tampering was detected */}
              {result.basicVerification.tamperDetails && result.basicVerification.tamperDetails.detected && (
                <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#fff3e0', borderRadius: '6px', border: '2px solid #ff9800' }}>
                  <h4 style={{ fontSize: '16px', marginBottom: '12px', color: '#e65100' }}>
                    🔍 Tampering Details Detected:
                  </h4>

                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {result.basicVerification.tamperDetails.changes?.map((change: any, index: number) => (
                    <div key={index} style={{
                      marginBottom: '12px',
                      padding: '12px',
                      backgroundColor: '#ffffff',
                      borderRadius: '6px',
                      borderLeft: '4px solid #ff9800'
                    }}>
                      <div style={{ marginBottom: '6px', fontWeight: 'bold', color: '#e65100' }}>
                        {change.field}:
                      </div>
                      <div style={{ marginBottom: '4px', paddingLeft: '10px', fontSize: '13px' }}>
                        <strong style={{ color: '#666' }}>Original (Expected):</strong>{' '}
                        <span style={{ backgroundColor: '#e8f5e9', padding: '2px 6px', borderRadius: '3px', color: '#2e7d32', fontFamily: 'monospace' }}>
                          {change.original}
                        </span>
                      </div>
                      <div style={{ marginBottom: '4px', paddingLeft: '10px', fontSize: '13px' }}>
                        <strong style={{ color: '#666' }}>Current Status:</strong>{' '}
                        <span style={{ backgroundColor: '#ffebee', padding: '2px 6px', borderRadius: '3px', color: '#c62828', fontFamily: 'monospace' }}>
                          {change.status || change.modified || change.current || 'MODIFIED'}
                        </span>
                      </div>
                      {change.description && (
                        <div style={{ marginTop: '6px', paddingLeft: '10px', fontSize: '12px', color: '#666', fontStyle: 'italic' }}>
                          {change.description}
                        </div>
                      )}
                    </div>
                  ))}

                  {result.basicVerification.tamperDetails.warning && (
                    <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#ffebee', borderRadius: '4px', color: '#c62828', fontSize: '13px' }}>
                      {result.basicVerification.tamperDetails.warning}
                    </div>
                  )}

                  {result.basicVerification.tamperDetails.contentModified && result.basicVerification.tamperDetails.storedHash && (
                    <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#fff3e0', borderRadius: '4px', border: '1px solid #ff9800' }}>
                      <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '8px', color: '#e65100' }}>
                        🔐 Content Hash Verification:
                      </div>
                      <div style={{ fontSize: '12px', fontFamily: 'monospace', color: '#333' }}>
                        <div style={{ marginBottom: '4px' }}>
                          <strong style={{ color: '#666' }}>Original Hash:</strong>{' '}
                          <span style={{ color: '#2e7d32' }}>{result.basicVerification.tamperDetails.storedHash}</span>
                        </div>
                        <div style={{ marginBottom: '8px' }}>
                          <strong style={{ color: '#666' }}>Current Hash:</strong>{' '}
                          <span style={{ color: '#c62828' }}>{result.basicVerification.tamperDetails.currentHash}</span>
                        </div>
                        <div style={{ fontSize: '11px', color: '#666', fontStyle: 'italic', marginTop: '8px', padding: '8px', backgroundColor: '#ffffff', borderRadius: '3px' }}>
                          💡 The content hash is calculated from the certificate&apos;s text content. A mismatch means someone edited the names, skill code, or other text in the PDF after it was issued.
                        </div>
                      </div>
                    </div>
                  )}

                  {result.basicVerification.tamperDetails.extractedData && Object.keys(result.basicVerification.tamperDetails.extractedData).length > 0 && (
                    <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#e3f2fd', borderRadius: '4px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '8px', color: '#1565c0' }}>
                        📝 Current PDF Content (What we can read):
                      </div>
                      <div style={{ fontSize: '12px', fontFamily: 'monospace', color: '#333' }}>
                        {result.basicVerification.tamperDetails.extractedData.skillCode && (
                          <div style={{ marginBottom: '4px' }}>
                            <strong>Skill Code:</strong> {result.basicVerification.tamperDetails.extractedData.skillCode}
                          </div>
                        )}
                        {result.basicVerification.tamperDetails.extractedData.skillName && (
                          <div style={{ marginBottom: '4px' }}>
                            <strong>Skill Name:</strong> {result.basicVerification.tamperDetails.extractedData.skillName}
                          </div>
                        )}
                        {result.basicVerification.tamperDetails.extractedData.claimantName && (
                          <div style={{ marginBottom: '4px' }}>
                            <strong>Claimant:</strong> {result.basicVerification.tamperDetails.extractedData.claimantName}
                          </div>
                        )}
                        {result.basicVerification.tamperDetails.extractedData.endorserName && (
                          <div style={{ marginBottom: '4px' }}>
                            <strong>Endorser:</strong> {result.basicVerification.tamperDetails.extractedData.endorserName}
                          </div>
                        )}
                      </div>
                      {result.basicVerification.tamperDetails.contentModified && (
                        <div style={{ marginTop: '8px', fontSize: '11px', color: '#c62828', fontWeight: 'bold' }}>
                          ⚠️ This content doesn&apos;t match the original hash - someone changed the text!
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Full Verification (if performed) */}
            {result.fullVerification && (
              <div style={{
                backgroundColor: result.fullVerification.valid ? '#e8f5e9' : '#ffebee',
                border: `2px solid ${result.fullVerification.valid ? '#4caf50' : '#ef5350'}`,
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '25px',
              }}>
                <h3 style={{ fontSize: '18px', marginBottom: '10px', color: result.fullVerification.valid ? '#2e7d32' : '#c62828' }}>
                  {result.fullVerification.valid ? '✅ Full Verification: PASSED' : '❌ Full Verification: FAILED'}
                </h3>
                <p style={{ fontSize: '14px', margin: 0 }}>
                  {result.fullVerification.message}
                </p>
                {result.fullVerification.valid && (
                  <div style={{ marginTop: '15px', padding: '15px', backgroundColor: 'white', borderRadius: '5px' }}>
                    <p style={{ fontSize: '14px', color: '#2e7d32', fontWeight: 'bold', margin: 0 }}>
                      🔒 This PDF is authentic and has NOT been modified since issuance.
                    </p>
                  </div>
                )}
                {!result.fullVerification.valid && (
                  <div style={{ marginTop: '15px', padding: '15px', backgroundColor: 'white', borderRadius: '5px' }}>
                    <p style={{ fontSize: '14px', color: '#c62828', fontWeight: 'bold', margin: 0 }}>
                      ⚠️ This PDF may have been modified or the credential data doesn&apos;t match.
                    </p>
                  </div>
                )}

                {/* Verification Details */}
                {result.fullVerification.details && (
                  <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
                    <h4 style={{ fontSize: '14px', marginBottom: '10px', color: '#333' }}>Verification Details:</h4>
                    <div style={{ fontSize: '13px', color: '#555', fontFamily: 'monospace' }}>
                      <div style={{ marginBottom: '8px' }}>
                        <strong>Skill Code:</strong> {result.fullVerification.details.providedData?.skillCode}
                      </div>
                      <div style={{ marginBottom: '8px' }}>
                        <strong>Claimant Name:</strong> {result.fullVerification.details.providedData?.claimantName}
                      </div>
                      <div style={{ marginBottom: '8px' }}>
                        <strong>Endorser Name:</strong> {result.fullVerification.details.providedData?.endorserName}
                      </div>
                      <div style={{ marginBottom: '8px' }}>
                        <strong>PDF Timestamp:</strong> {result.fullVerification.details.pdfTimestamp}
                      </div>
                      {!result.fullVerification.valid && result.fullVerification.details.differences && result.fullVerification.details.differences.length > 0 && (
                        <>
                          <div style={{ marginTop: '12px', marginBottom: '12px' }}>
                            <strong style={{ color: '#c62828' }}>❌ Found {result.fullVerification.details.differences.length} Difference(s):</strong>
                          </div>
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          {result.fullVerification.details.differences.map((diff: any, index: number) => (
                            <div key={index} style={{
                              marginBottom: '12px',
                              padding: '12px',
                              backgroundColor: '#ffebee',
                              borderRadius: '6px',
                              borderLeft: '4px solid #c62828'
                            }}>
                              <div style={{ marginBottom: '6px', fontWeight: 'bold', color: '#c62828' }}>
                                {diff.field}:
                              </div>
                              <div style={{ marginBottom: '4px', paddingLeft: '10px' }}>
                                <strong style={{ color: '#666' }}>You entered:</strong>{' '}
                                <span style={{ backgroundColor: '#fff', padding: '2px 6px', borderRadius: '3px', color: '#d32f2f', fontWeight: 'bold' }}>
                                  {diff.youEntered}
                                </span>
                              </div>
                              <div style={{ paddingLeft: '10px' }}>
                                <strong style={{ color: '#666' }}>PDF contains:</strong>{' '}
                                <span style={{ backgroundColor: '#fff', padding: '2px 6px', borderRadius: '3px', color: '#2e7d32', fontWeight: 'bold' }}>
                                  {diff.pdfContains}
                                </span>
                              </div>
                            </div>
                          ))}
                          {result.fullVerification.details.hint && (
                            <div style={{ marginTop: '12px', padding: '10px', backgroundColor: '#fff3cd', borderRadius: '4px', color: '#856404' }}>
                              💡 {result.fullVerification.details.hint}
                            </div>
                          )}
                        </>
                      )}
                      {!result.fullVerification.valid && result.fullVerification.details.expectedSignature && (!result.fullVerification.details.differences || result.fullVerification.details.differences.length === 0) && (
                        <>
                          <div style={{ marginTop: '12px', marginBottom: '8px' }}>
                            <strong style={{ color: '#c62828' }}>Signature Mismatch:</strong>
                          </div>
                          <div style={{ marginBottom: '8px', paddingLeft: '10px' }}>
                            <strong>Expected:</strong> {result.fullVerification.details.expectedSignature}
                          </div>
                          <div style={{ marginBottom: '8px', paddingLeft: '10px' }}>
                            <strong>Found:</strong> {result.fullVerification.details.foundSignature}
                          </div>
                          {result.fullVerification.details.hint && (
                            <div style={{ marginTop: '12px', padding: '10px', backgroundColor: '#fff3cd', borderRadius: '4px', color: '#856404' }}>
                              💡 {result.fullVerification.details.hint}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PDF Metadata */}
            <div style={{ backgroundColor: '#f8f9ff', padding: '20px', borderRadius: '8px', marginBottom: '25px' }}>
              <h3 style={{ fontSize: '18px', marginBottom: '15px', color: '#333' }}>📄 PDF Metadata</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                {result.metadata.title && (
                  <div>
                    <strong style={{ fontSize: '13px', color: '#666' }}>Title:</strong>
                    <p style={{ fontSize: '14px', margin: '4px 0 0 0' }}>{result.metadata.title}</p>
                  </div>
                )}
                {result.metadata.author && (
                  <div>
                    <strong style={{ fontSize: '13px', color: '#666' }}>Author:</strong>
                    <p style={{ fontSize: '14px', margin: '4px 0 0 0' }}>{result.metadata.author}</p>
                  </div>
                )}
                {result.metadata.creator && (
                  <div>
                    <strong style={{ fontSize: '13px', color: '#666' }}>Creator:</strong>
                    <p style={{ fontSize: '14px', margin: '4px 0 0 0' }}>{result.metadata.creator}</p>
                  </div>
                )}
                {result.metadata.creationDate && (
                  <div>
                    <strong style={{ fontSize: '13px', color: '#666' }}>Created:</strong>
                    <p style={{ fontSize: '14px', margin: '4px 0 0 0' }}>
                      {new Date(result.metadata.creationDate).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* SkillsAware Custom Fields */}
            {Object.keys(result.metadata.customFields).length > 0 && (
              <div style={{ backgroundColor: '#fff3e0', padding: '20px', borderRadius: '8px' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '15px', color: '#e65100' }}>
                  🔐 SkillsAware Signature Data
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                  {Object.entries(result.metadata.customFields).map(([key, value]) => (
                    <div key={key}>
                      <strong style={{ fontSize: '13px', color: '#666' }}>{key}:</strong>
                      <p style={{
                        fontSize: '12px',
                        fontFamily: 'monospace',
                        backgroundColor: 'white',
                        padding: '8px',
                        borderRadius: '4px',
                        margin: '4px 0 0 0',
                        wordBreak: 'break-all',
                      }}>
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info Section */}
        <div style={{ backgroundColor: '#e3f2fd', border: '1px solid #2196f3', padding: '20px', borderRadius: '8px', marginTop: '30px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '10px', color: '#1565c0' }}>ℹ️ How Verification Works</h3>
          <ul style={{ fontSize: '14px', color: '#555', paddingLeft: '20px', margin: 0 }}>
            <li style={{ marginBottom: '8px' }}>
              <strong>Basic Verification:</strong> Checks if the PDF is from SkillsAware and has proper signature format
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>Full Verification:</strong> Verifies the cryptographic signature against original credential data
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>Signature:</strong> HMAC-SHA256 hash ensures the PDF hasn&apos;t been modified
            </li>
            <li>
              <strong>Security:</strong> Any modification to the PDF content will invalidate the signature
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
