export interface Ed25519Signature2020Proof {
  type: 'Ed25519Signature2020'
  created: string
  verificationMethod: string
  proofPurpose: 'assertionMethod'
  proofValue: string
}

export interface CredentialSchema {
  id: string
  type: string
}

export interface OBv3AchievementCredential {
  '@context': string[]
  type: string[]
  id: string
  name: string
  issuer: {
    id: string
    type: string
    name: string
    url?: string
    image?: string
  }
  validFrom: string
  credentialSchema?: CredentialSchema[]
  credentialSubject: {
    id: string
    type: string
    name: string
    narrative?: string
    achievement: {
      id: string
      type: string
      name: string
      description: string
      criteria?: {
        narrative?: string
      }
    }
  }
  endorsement?: OBv3EndorsementCredential[]
  evidence?: Array<{
    id: string
    type: string
    name?: string
  }>
  proof?: Ed25519Signature2020Proof
}

export interface OBv3EndorsementCredential {
  '@context': string[]
  type: string[]
  id: string
  name: string
  issuer: {
    id: string
    type: string
    name: string
  }
  validFrom: string
  credentialSchema?: CredentialSchema[]
  credentialSubject: {
    id: string // Reference to the achievement or credential
    type: string
    endorsementComment: string
    profile: {
      type: string
      name: string
      description?: string // bona fides
    }
  }
  proof?: Ed25519Signature2020Proof
}
