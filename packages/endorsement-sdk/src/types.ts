/**
 * Payload for creating a new claim.
 * @public
 */
export interface CreateClaimPayload {
  tenant_id: string
  skill_code: string
  skill_name: string
  skill_description: string
  claimant_name: string
  claimant_email: string
}

/**
 * Response from create claim API.
 * @public
 */
export interface CreateClaimResponse {
  claim_id: string
  claimant_link: string
  expires_at: string
}

/**
 * Payload for generating an endorser link (requires claimant JWT).
 * @public
 */
export interface GenerateEndorserLinkPayload {
  claimant_narrative: string
  endorser_name?: string
  endorser_email?: string
}

/**
 * Response from generate endorser link API.
 * @public
 */
export interface GenerateEndorserLinkResponse {
  endorser_link: string
  expires_at: string
  email_sent?: boolean
  email_error?: string
}

/**
 * Payload for submitting an endorsement (requires endorser JWT).
 * @public
 */
export interface SubmitEndorsementPayload {
  endorsement_text: string
  bona_fides: string
  evidence_urls?: string[]
  signature: string
}

/**
 * Download info for one format (JSON or PDF).
 * @public
 */
export interface DownloadInfo {
  url: string
  filename: string
  ready: boolean
  size_estimate?: string
  expires_in?: string
  source?: string
  s3_url?: string
  note?: string
}

/**
 * Response from submit endorsement API.
 * @public
 */
export interface SubmitEndorsementResponse {
  success: boolean
  claim_id: string
  message: string
  downloads: {
    json: DownloadInfo
    pdf: DownloadInfo
  }
  json_base64?: string
  s3_uploaded?: boolean
  s3_keys?: { json: string; pdf: string }
  webhook_delivered?: boolean
}

/**
 * Config shared by SDK calls: base URL of the endorsement backend.
 * @public
 */
export interface BaseConfig {
  baseUrl: string
}

/**
 * Config for createClaim: base URL and API key.
 * @public
 */
export interface CreateClaimConfig extends BaseConfig {
  apiKey: string
}

/**
 * Config for generateEndorserLink: base URL and claimant JWT.
 * @public
 */
export interface GenerateEndorserLinkConfig extends BaseConfig {
  claimantToken: string
}

/**
 * Config for submitEndorsement: base URL and endorser JWT.
 * @public
 */
export interface SubmitEndorsementConfig extends BaseConfig {
  endorserToken: string
}

/**
 * Config for getDownloadUrl: base URL and token (endorser JWT).
 * @public
 */
export interface GetDownloadUrlConfig extends BaseConfig {
  token: string
}

/**
 * Params for getDownloadUrl.
 * @public
 */
export interface GetDownloadUrlParams {
  claimId: string
  type: 'json' | 'pdf'
}

/**
 * Result of getDownloadUrl: URL and suggested filename.
 * @public
 */
export interface GetDownloadUrlResult {
  url: string
  filename: string
}

/**
 * Config for verifyPdf: base URL only (no API key required).
 * @public
 */
export interface VerifyPdfConfig extends BaseConfig {}

/**
 * Optional credential data for full PDF signature verification.
 * @public
 */
export interface VerifyPdfOptions {
  skillCode?: string
  claimantName?: string
  endorserName?: string
}

/**
 * Basic PDF verification result (structure, metadata presence).
 * @public
 */
export interface VerifyPdfBasicResult {
  valid: boolean
  message: string
  metadata?: Record<string, unknown>
}

/**
 * Full PDF signature verification result (cryptographic check).
 * @public
 */
export interface VerifyPdfFullResult {
  valid: boolean
  message: string
  metadata?: Record<string, unknown>
  details?: Record<string, unknown>
}

/**
 * PDF metadata extracted from the file.
 * @public
 */
export interface VerifyPdfMetadata {
  title?: string
  author?: string
  subject?: string
  creator?: string
  producer?: string
  creationDate?: string
  modificationDate?: string
  keywords?: string
  customFields?: Record<string, string>
}

/**
 * Response from verify PDF API.
 * @public
 */
export interface VerifyPdfResponse {
  filename: string
  fileSize: number
  basicVerification: VerifyPdfBasicResult
  fullVerification: VerifyPdfFullResult | null
  metadata: VerifyPdfMetadata
}
