export interface TenantConfig {
  id: string
  name: string
  api_key_hash: string // SHA256 hash of API key
  webhook_url?: string // Optional: webhook endpoint
  webhook_secret?: string // Optional: webhook HMAC secret
  s3_bucket?: string // Optional: S3 bucket for archival
  s3_prefix?: string // Optional: S3 key prefix
  s3_region?: string // Optional: AWS region
  brand_logo_url?: string
  brand_primary_color?: string
  issuer_id: string // e.g., "https://skillsaware-endorsement.vercel.app/issuers/whatscookin"
  issuer_name: string // e.g., "What's Cookin' Inc."
  issuer_private_key?: string // Ed25519 private key (base58 or hex)
  issuer_public_key?: string // Ed25519 public key (optional, can derive from private)
  issuer_did_key?: string // DID key identifier (optional, can generate from public key)
}
