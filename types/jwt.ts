export interface JwtPayload {
  iss: string // Issuer: https://endorse.skillsaware.com
  aud: string // Audience: skillsaware
  tenant: string // Tenant ID
  claim_id: string // UUID for this claim
  skill_code: string // e.g., "ICTDSN403"
  skill_name: string // e.g., "Design Skills"
  skill_description: string // Full skill description blob
  role: 'claimant' | 'endorser'
  exp: number // Expiry timestamp
  nonce: string // One-time use ID

  // Claimant-specific fields (when role = 'claimant')
  claimant_name?: string
  claimant_email?: string

  // Endorser-specific fields (when role = 'endorser')
  endorser_name?: string
  endorser_email?: string
  claimant_narrative?: string // Carried from claimant submission
}
