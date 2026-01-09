import { OBv3AchievementCredential, OBv3EndorsementCredential } from '@/types/obv3'
import { TenantConfig } from '@/types/tenant'
import { generateProof, getOrGenerateDidKey } from '@/lib/proof'
import crypto from 'crypto'

const OBV3_CONTEXT = [
  'https://www.w3.org/ns/credentials/v2',
  'https://purl.imsglobal.org/spec/ob/v3p0/context-3.0.3.json'
]

const OBV3_ACHIEVEMENT_CREDENTIAL_SCHEMA = {
  id: 'https://purl.imsglobal.org/spec/ob/v3p0/schema/json/ob_v3p0_achievementcredential_schema.json',
  type: '1EdTechJsonSchemaValidator2019'
}

/**
 * Generate a DID:Web identifier from an email address
 * Format: did:web:domain.com:users:base64url(email)
 */
function generateDidWeb(email: string, issuerId: string): string {
  try {
    // Extract domain from issuer ID (e.g., https://skillsaware-endorsement.vercel.app/issuers/whatscookin)
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

export async function generateAchievementCredential(
  data: {
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
  },
  tenant?: TenantConfig
): Promise<OBv3AchievementCredential> {
  const credentialId = `urn:uuid:${crypto.randomUUID()}`
  const subjectId = generateDidWeb(data.claimantEmail, data.issuerId)

  const credential: OBv3AchievementCredential = {
    '@context': OBV3_CONTEXT,
    type: ['VerifiableCredential', 'OpenBadgeCredential'],
    id: credentialId,
    issuer: {
      id: data.issuerId,
      type: 'Profile',
      name: data.issuerName
    },
    validFrom: new Date().toISOString(),
    credentialSchema: [OBV3_ACHIEVEMENT_CREDENTIAL_SCHEMA],
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

  // Generate proof if tenant config with keys is provided
  if (tenant) {
    try {
      const { privateKey, didKey } = getOrGenerateDidKey(
        tenant.issuer_private_key,
        tenant.issuer_public_key,
        tenant.issuer_did_key,
        tenant.id || data.tenantId // Pass tenant ID to ensure consistent DID per tenant
      )
      credential.proof = await generateProof(
        credential as unknown as Record<string, unknown>,
        privateKey,
        didKey
      )
    } catch (error) {
      console.warn('Failed to generate proof for achievement credential:', error)
      // Continue without proof if generation fails
    }
  }

  return credential
}

export async function generateEndorsementCredential(
  data: {
    claimId: string
    achievementCredentialId: string
    endorserName: string
    endorserEmail: string
    endorsementText: string
    bonaFides: string
    issuerId: string
    tenantId?: string // Optional tenant ID for DID caching
  },
  tenant?: TenantConfig
): Promise<OBv3EndorsementCredential> {
  const credentialId = `urn:uuid:${crypto.randomUUID()}`

  const credential: OBv3EndorsementCredential = {
    '@context': OBV3_CONTEXT,
    type: ['VerifiableCredential', 'EndorsementCredential'],
    id: credentialId,
    issuer: {
      id: data.issuerId,
      type: 'Profile',
      name: data.endorserName
    },
    validFrom: new Date().toISOString(),
    credentialSchema: [OBV3_ACHIEVEMENT_CREDENTIAL_SCHEMA],
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

  // Generate proof if tenant config with keys is provided
  if (tenant) {
    try {
      const { privateKey, didKey } = getOrGenerateDidKey(
        tenant.issuer_private_key,
        tenant.issuer_public_key,
        tenant.issuer_did_key,
        tenant.id || data.tenantId // Pass tenant ID to ensure consistent DID per tenant
      )
      credential.proof = await generateProof(
        credential as unknown as Record<string, unknown>,
        privateKey,
        didKey
      )
    } catch (error) {
      console.warn('Failed to generate proof for endorsement credential:', error)
      // Continue without proof if generation fails
    }
  }

  return credential
}
