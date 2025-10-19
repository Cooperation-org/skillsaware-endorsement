'use client';

import { useState } from 'react';
import { JwtPayload } from '@/types/jwt';

interface EndorserFormClientProps {
  payload: JwtPayload;
  token: string;
}

export default function EndorserFormClient({ payload, token }: EndorserFormClientProps) {
  const [endorsementText, setEndorsementText] = useState('');
  const [bonaFides, setBonaFides] = useState('');
  const [evidenceUrls, setEvidenceUrls] = useState<string[]>(['']);
  const [signature, setSignature] = useState('');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [urlErrors, setUrlErrors] = useState<{ [key: number]: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    if (!consent) {
      setError('You must provide consent to submit the endorsement');
      setSubmitting(false);
      return;
    }

    // Check if there are any URL validation errors
    if (Object.keys(urlErrors).length > 0) {
      setError('Please fix the invalid URL(s) before submitting');
      setSubmitting(false);
      return;
    }

    try {
      // Filter out empty URLs and validate URL format
      const filteredEvidence = evidenceUrls
        .map(url => url.trim())
        .filter(url => url !== '');

      // Basic URL validation before sending
      const validUrls = filteredEvidence.filter(url => {
        try {
          new URL(url);
          return true;
        } catch {
          return false;
        }
      });

      const response = await fetch('/api/v1/endorsements/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          endorsement_text: endorsementText,
          bona_fides: bonaFides,
          evidence_urls: validUrls.length > 0 ? validUrls : undefined,
          signature: signature,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        // Show more detailed error message if available
        if (data.details) {
          throw new Error(`Invalid request: ${JSON.stringify(data.details)}`);
        }
        throw new Error(data.error || 'Failed to submit endorsement');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const addEvidenceField = () => {
    setEvidenceUrls([...evidenceUrls, '']);
  };

  const updateEvidenceUrl = (index: number, value: string) => {
    const newUrls = [...evidenceUrls];
    newUrls[index] = value;
    setEvidenceUrls(newUrls);

    // Validate URL format if not empty
    if (value.trim() !== '') {
      try {
        new URL(value.trim());
        // Clear error if URL is valid
        const newErrors = { ...urlErrors };
        delete newErrors[index];
        setUrlErrors(newErrors);
      } catch {
        setUrlErrors({ ...urlErrors, [index]: 'Please enter a valid URL (e.g., https://example.com)' });
      }
    } else {
      // Clear error if field is empty
      const newErrors = { ...urlErrors };
      delete newErrors[index];
      setUrlErrors(newErrors);
    }
  };

  if (success) {
    return (
      <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ color: '#0B5FFF', marginBottom: '20px' }}>Endorsement Submitted Successfully!</h1>
        <div style={{ backgroundColor: '#e8f5e9', padding: '30px', borderRadius: '10px' }}>
          <svg
            style={{ width: '64px', height: '64px', marginBottom: '20px' }}
            fill="none"
            stroke="#4caf50"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <h2 style={{ color: '#2e7d32', marginBottom: '10px' }}>Thank You!</h2>
          <p style={{ fontSize: '16px', color: '#555' }}>
            Your endorsement for <strong>{payload.claimant_name}</strong> has been recorded.
            <br />
            The credential and PDF certificate have been generated and sent to SkillsAware.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ color: '#0B5FFF', marginBottom: '20px' }}>Skill Endorsement Form</h1>

      {/* Skill Information (Read-only) */}
      <div style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '5px', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>Skill Information</h2>
        <p><strong>Skill Name:</strong> {payload.skill_name}</p>
        <p><strong>Skill Code:</strong> {payload.skill_code}</p>
        <p><strong>Claimant:</strong> {payload.claimant_name}</p>
        <p style={{ marginTop: '10px' }}><strong>Description:</strong></p>
        <p style={{ fontSize: '14px', color: '#666' }}>{payload.skill_description}</p>
        <p style={{ marginTop: '10px' }}><strong>Claimant&apos;s Narrative:</strong></p>
        <p style={{ fontSize: '14px', color: '#666', fontStyle: 'italic' }}>
          &quot;{payload.claimant_narrative}&quot;
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="bonaFides" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Your Credentials / Bona Fides *
          </label>
          <input
            type="text"
            id="bonaFides"
            value={bonaFides}
            onChange={(e) => setBonaFides(e.target.value)}
            required
            placeholder="e.g., Senior Developer at Company X"
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '14px',
              border: '1px solid #ccc',
              borderRadius: '5px',
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="endorsementText" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Endorsement Statement *
          </label>
          <textarea
            id="endorsementText"
            value={endorsementText}
            onChange={(e) => setEndorsementText(e.target.value)}
            required
            rows={6}
            placeholder="Describe how the claimant has demonstrated this skill..."
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '14px',
              border: '1px solid #ccc',
              borderRadius: '5px',
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Supporting Evidence (Optional)
          </label>
          {evidenceUrls.map((url, index) => (
            <div key={index} style={{ marginBottom: '10px' }}>
              <input
                type="url"
                value={url}
                onChange={(e) => updateEvidenceUrl(index, e.target.value)}
                placeholder="https://example.com/evidence"
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '14px',
                  border: urlErrors[index] ? '1px solid #c62828' : '1px solid #ccc',
                  borderRadius: '5px',
                }}
              />
              {urlErrors[index] && (
                <p style={{ color: '#c62828', fontSize: '12px', marginTop: '4px', marginBottom: '0' }}>
                  {urlErrors[index]}
                </p>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addEvidenceField}
            style={{
              backgroundColor: '#f0f0f0',
              color: '#333',
              padding: '8px 16px',
              border: '1px solid #ccc',
              borderRadius: '5px',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            + Add Evidence URL
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="signature" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Digital Signature (Type your full name) *
          </label>
          <input
            type="text"
            id="signature"
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            required
            placeholder="Your Full Name"
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '14px',
              border: '1px solid #ccc',
              borderRadius: '5px',
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              style={{ marginRight: '10px', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '14px' }}>
              I consent to this endorsement being recorded and shared. I confirm that the information provided is accurate to the best of my knowledge.
            </span>
          </label>
        </div>

        {error && (
          <div style={{ padding: '10px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '5px', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          style={{
            backgroundColor: '#0B5FFF',
            color: 'white',
            padding: '12px 30px',
            border: 'none',
            borderRadius: '5px',
            fontSize: '16px',
            cursor: submitting ? 'not-allowed' : 'pointer',
            opacity: submitting ? 0.6 : 1,
          }}
        >
          {submitting ? 'Submitting...' : 'Submit Endorsement'}
        </button>
      </form>
    </div>
  );
}
