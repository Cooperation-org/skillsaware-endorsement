import React from 'react';

interface CredentialTemplateProps {
  skillName: string;
  skillCode: string;
  skillDescription: string;
  claimantName: string;
  narrative: string;
  endorserName: string;
  endorsementText: string;
  bonaFides: string;
  signature: string;
  evidence?: string[];
  logoUrl?: string;
  primaryColor?: string;
}

export default function CredentialTemplate({
  skillName,
  skillCode,
  skillDescription,
  claimantName,
  narrative,
  endorserName,
  endorsementText,
  bonaFides,
  signature,
  evidence,
  logoUrl,
  primaryColor = '#0B5FFF',
}: CredentialTemplateProps) {
  return (
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif', color: '#333' }}>
      {/* Header */}
      <div style={{ borderBottom: `4px solid ${primaryColor}`, paddingBottom: '20px', marginBottom: '30px' }}>
        {logoUrl && (
          <img src={logoUrl} alt="Logo" style={{ maxHeight: '60px', marginBottom: '10px' }} />
        )}
        <h1 style={{ color: primaryColor, fontSize: '28px', margin: '10px 0' }}>
          Skill Endorsement Certificate
        </h1>
        <p style={{ fontSize: '14px', color: '#666', margin: '5px 0' }}>
          Issued by: What&apos;s Cookin&apos; Inc.
        </p>
        <p style={{ fontSize: '12px', color: '#999' }}>
          {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Skill Information */}
      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: primaryColor, fontSize: '20px', marginBottom: '10px' }}>
          Skill: {skillName}
        </h2>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
          <strong>Skill Code:</strong> {skillCode}
        </p>
        <div style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '5px', marginTop: '10px' }}>
          <p style={{ fontSize: '13px', lineHeight: '1.6', margin: 0 }}>
            {skillDescription}
          </p>
        </div>
      </section>

      {/* Claimant Information */}
      <section style={{ marginBottom: '30px' }}>
        <h3 style={{ color: '#333', fontSize: '16px', marginBottom: '10px' }}>
          Claimant: {claimantName}
        </h3>
        <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderLeft: `4px solid ${primaryColor}`, borderRadius: '3px' }}>
          <p style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>Skill Narrative:</p>
          <p style={{ fontSize: '13px', lineHeight: '1.6', margin: 0, fontStyle: 'italic' }}>
            &quot;{narrative}&quot;
          </p>
        </div>
      </section>

      {/* Endorsement */}
      <section style={{ marginBottom: '30px' }}>
        <h3 style={{ color: '#333', fontSize: '16px', marginBottom: '10px' }}>
          Endorsement by: {endorserName}
        </h3>
        <div style={{ backgroundColor: '#f0f8ff', padding: '15px', borderLeft: `4px solid ${primaryColor}`, borderRadius: '3px' }}>
          <p style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>Endorser Credentials:</p>
          <p style={{ fontSize: '13px', marginBottom: '12px', color: '#555' }}>
            {bonaFides}
          </p>
          <p style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>Endorsement Statement:</p>
          <p style={{ fontSize: '13px', lineHeight: '1.6', margin: 0, fontStyle: 'italic' }}>
            &quot;{endorsementText}&quot;
          </p>
        </div>
      </section>

      {/* Evidence */}
      {evidence && evidence.length > 0 && (
        <section style={{ marginBottom: '30px' }}>
          <h3 style={{ color: '#333', fontSize: '16px', marginBottom: '10px' }}>
            Supporting Evidence
          </h3>
          <ul style={{ paddingLeft: '20px', margin: 0 }}>
            {evidence.map((url, index) => (
              <li key={index} style={{ fontSize: '12px', marginBottom: '5px', color: '#0066cc' }}>
                <a href={url} style={{ color: '#0066cc', textDecoration: 'none' }}>
                  {url}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Digital Signature */}
      <section style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #e0e0e0' }}>
        <p style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
          <strong>Digital Signature:</strong>
        </p>
        <p style={{ fontSize: '18px', fontFamily: 'Brush Script MT, cursive', color: primaryColor, margin: '5px 0' }}>
          {signature}
        </p>
        <p style={{ fontSize: '11px', color: '#999', marginTop: '15px' }}>
          This is a digitally verified skill endorsement certificate.
          <br />
          Certificate ID: {Math.random().toString(36).substring(7).toUpperCase()}
        </p>
      </section>

      {/* Footer */}
      <div style={{ marginTop: '50px', paddingTop: '20px', borderTop: '2px solid #e0e0e0', textAlign: 'center' }}>
        <p style={{ fontSize: '11px', color: '#999' }}>
          Generated with SkillsAware OBv3 Endorsement System
          <br />
          Powered by What&apos;s Cookin&apos; Inc. | Standards-compliant Open Badges v3.0
        </p>
      </div>
    </div>
  );
}
