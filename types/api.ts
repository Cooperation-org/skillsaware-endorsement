export interface CreateClaimRequest {
  tenant_id: string
  skill_code: string
  skill_name: string
  skill_description: string
  claimant_name: string
  claimant_email: string
}

export interface CreateClaimResponse {
  claim_id: string
  claimant_link: string
  expires_at: string
}

export interface GenerateEndorserLinkRequest {
  claimant_narrative: string
  endorser_name: string
  endorser_email: string
}

export interface GenerateEndorserLinkResponse {
  endorser_link: string
  expires_at: string
}

export interface SubmitEndorsementRequest {
  endorsement_text: string
  bona_fides: string
  evidence_urls?: string[]
  signature: string // Typed name for digital signature
}

export interface SubmitEndorsementResponse {
  success: boolean
  claim_id: string
  artifacts: {
    obv3_json: string // S3 key
    pdf: string // S3 key
  }
  webhook_delivered: boolean
}
