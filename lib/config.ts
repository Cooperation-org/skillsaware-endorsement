import crypto from 'crypto'
import { TenantConfig } from '@/types/tenant'

function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex')
}

// In production: load from JSON file or AWS Secrets Manager
const TENANT_CONFIGS: Record<string, TenantConfig> = {
  skillsaware: {
    id: 'skillsaware',
    name: 'SkillsAware',
    api_key_hash: hashApiKey(process.env.SKILLSAWARE_API_KEY || 'dev-api-key'),
    webhook_url: process.env.SKILLSAWARE_WEBHOOK_URL,
    webhook_secret: process.env.SKILLSAWARE_WEBHOOK_SECRET,
    s3_bucket: process.env.S3_BUCKET,
    s3_prefix: process.env.S3_PREFIX,
    s3_region: process.env.AWS_REGION,
    issuer_id: 'https://skillsaware-endorsement.vercel.app/issuers/whatscookin',
    issuer_name: 'SkillsAware',
    brand_logo_url: process.env.BRAND_LOGO_URL || '/logo/skillsaware-logo.svg',
    brand_primary_color: process.env.BRAND_PRIMARY_COLOR || '#0B5FFF',
    issuer_private_key: process.env.SKILLSAWARE_ISSUER_PRIVATE_KEY,
    issuer_public_key: process.env.SKILLSAWARE_ISSUER_PUBLIC_KEY,
    issuer_did_key: process.env.SKILLSAWARE_ISSUER_DID_KEY
  }
}

export function getTenantConfig(tenantId: string): TenantConfig | null {
  return TENANT_CONFIGS[tenantId] ?? null
}

export function validateTenantApiKey(apiKey: string): TenantConfig | null {
  const hash = hashApiKey(apiKey)
  const tenant = Object.values(TENANT_CONFIGS).find(t => t.api_key_hash === hash)
  return tenant ?? null
}
