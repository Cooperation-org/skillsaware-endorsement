import { OBv3AchievementCredential, OBv3EndorsementCredential } from '@/types/obv3';
import crypto from 'crypto';

const OBV3_CONTEXT = [
  'https://www.w3.org/ns/credentials/v2',
  'https://purl.imsglobal.org/spec/ob/v3p0/context-3.0.3.json',
];

export function generateAchievementCredential(data: {
  claimId: string;
  tenantId: string;
  issuerId: string;
  issuerName: string;
  claimantName: string;
  claimantEmail: string;
  skillCode: string;
  skillName: string;
  skillDescription: string;
  narrative: string;
  evidence?: string[];
}): OBv3AchievementCredential {
  const credentialId = `urn:uuid:${crypto.randomUUID()}`;
  const subjectId = `did:email:${data.claimantEmail}`;

  return {
    '@context': OBV3_CONTEXT,
    type: ['VerifiableCredential', 'AchievementCredential'],
    id: credentialId,
    issuer: {
      id: data.issuerId,
      type: 'Profile',
      name: data.issuerName,
    },
    issuanceDate: new Date().toISOString(),
    credentialSubject: {
      id: subjectId,
      type: 'AchievementSubject',
      name: data.claimantName,
      narrative: data.narrative,
      achievement: {
        id: data.skillCode,
        type: 'Achievement',
        name: data.skillName,
        description: data.skillDescription,
        criteria: {
          narrative: 'Demonstrated competency through peer endorsement',
        },
      },
    },
    evidence: data.evidence?.map((url, index) => ({
      id: url,
      type: 'Evidence',
      name: `Evidence ${index + 1}`,
    })),
  };
}

export function generateEndorsementCredential(data: {
  claimId: string;
  achievementCredentialId: string;
  endorserName: string;
  endorserEmail: string;
  endorsementText: string;
  bonaFides: string;
  issuerId: string;
}): OBv3EndorsementCredential {
  const credentialId = `urn:uuid:${crypto.randomUUID()}`;

  return {
    '@context': OBV3_CONTEXT,
    type: ['VerifiableCredential', 'EndorsementCredential'],
    id: credentialId,
    issuer: {
      id: data.issuerId,
      type: 'Profile',
      name: data.endorserName,
    },
    issuanceDate: new Date().toISOString(),
    credentialSubject: {
      id: data.achievementCredentialId,
      type: 'EndorsementSubject',
      endorsementComment: data.endorsementText,
      profile: {
        type: 'Profile',
        name: data.endorserName,
        description: data.bonaFides,
      },
    },
  };
}
