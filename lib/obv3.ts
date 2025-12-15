import { OBv3AchievementCredential, OBv3EndorsementCredential } from '@/types/obv3'
import crypto from 'crypto'

const OBV3_CONTEXT = [
  'https://www.w3.org/ns/credentials/v2',
  'https://purl.imsglobal.org/spec/ob/v3p0/context-3.0.3.json',
  'https://purl.imsglobal.org/spec/ob/v3p0/schema/achievement-credential-3.0.3.json'
]

/**
 * Generate a DID:Web identifier from an email address
 * Format: did:web:domain.com:users:base64url(email)
 */
function generateDidWeb(email: string, issuerId: string): string {
  try {
    // Extract domain from issuer ID (e.g., https://endorse.skillsaware.com/issuers/whatscookin)
    const issuerUrl = new URL(issuerId)
    const domain = issuerUrl.hostname

    // Encode email in base64url format (URL-safe base64)
    const emailEncoded = Buffer.from(email)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')

    return `did:web:${domain}:users:${emailEncoded}`
  } catch {
    // Fallback: use domain from environment or default
    const domain = process.env.NEXT_PUBLIC_APP_URL
      ? new URL(process.env.NEXT_PUBLIC_APP_URL).hostname
      : 'skillsaware.com'
    const emailEncoded = Buffer.from(email)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
    return `did:web:${domain}:users:${emailEncoded}`
  }
}

export function generateAchievementCredential(data: {
  claimId: string
  tenantId: string
  issuerId: string
  issuerName: string
  claimantName: string
  claimantEmail: string
  skillCode: string
  skillName: string
  skillDescription: string
  narrative: string
  evidence?: string[]
}): OBv3AchievementCredential {
  const credentialId = `urn:uuid:${crypto.randomUUID()}`
  const subjectId = generateDidWeb(data.claimantEmail, data.issuerId)

  return {
    '@context': OBV3_CONTEXT,
    type: ['VerifiableCredential', 'AchievementCredential'],
    id: credentialId,
    issuer: {
      id: data.issuerId,
      type: 'Profile',
      name: data.issuerName
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
          narrative: 'Demonstrated competency through peer endorsement'
        }
      }
    },
    evidence: data.evidence?.map((url, index) => ({
      id: url,
      type: 'Evidence',
      name: `Evidence ${index + 1}`
    }))
  }
}

export function generateEndorsementCredential(data: {
  claimId: string
  achievementCredentialId: string
  endorserName: string
  endorserEmail: string
  endorsementText: string
  bonaFides: string
  issuerId: string
}): OBv3EndorsementCredential {
  const credentialId = `urn:uuid:${crypto.randomUUID()}`

  return {
    '@context': OBV3_CONTEXT,
    type: ['VerifiableCredential', 'EndorsementCredential'],
    id: credentialId,
    issuer: {
      id: data.issuerId,
      type: 'Profile',
      name: data.endorserName
    },
    issuanceDate: new Date().toISOString(),
    credentialSubject: {
      id: data.achievementCredentialId,
      type: 'EndorsementSubject',
      endorsementComment: data.endorsementText,
      profile: {
        type: 'Profile',
        name: data.endorserName,
        description: data.bonaFides
      }
    }
  }
}
