export interface TenantConfig {
  id: string;
  name: string;
  api_key_hash: string;      // SHA256 hash of API key
  webhook_url: string;
  webhook_secret: string;
  s3_bucket: string;
  s3_prefix: string;
  s3_region: string;
  brand_logo_url?: string;
  brand_primary_color?: string;
  issuer_id: string;         // e.g., "https://endorse.skillsaware.com/issuers/whatscookin"
  issuer_name: string;       // e.g., "What's Cookin' Inc."
}
