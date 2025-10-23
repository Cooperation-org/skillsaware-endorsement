export interface TenantConfig {
  id: string;
  name: string;
  api_key_hash: string;      // SHA256 hash of API key
  webhook_url?: string;      // Optional: webhook endpoint
  webhook_secret?: string;   // Optional: webhook HMAC secret
  s3_bucket?: string;        // Optional: S3 bucket for archival
  s3_prefix?: string;        // Optional: S3 key prefix
  s3_region?: string;        // Optional: AWS region
  brand_logo_url?: string;
  brand_primary_color?: string;
  issuer_id: string;         // e.g., "https://endorse.skillsaware.com/issuers/whatscookin"
  issuer_name: string;       // e.g., "What's Cookin' Inc."
}
