export interface WebhookPayload {
  event: 'claim.endorsed'
  claim_id: string
  skill_code: string
  skill_name: string
  claimant_name: string
  endorser_name: string
  tenant_id?: string // Optional tenant ID for webhook routing
  artifacts: Array<{
    type: 'obv3-json' | 'pdf'
    s3_key: string
    s3_url?: string // Optional presigned GET URL
  }>
  timestamp: string
}
