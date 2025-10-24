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
    issuer_id: 'https://endorse.skillsaware.com/issuers/whatscookin',
    issuer_name: "What's Cookin' Inc.",
    brand_logo_url: process.env.BRAND_LOGO_URL,
    brand_primary_color: process.env.BRAND_PRIMARY_COLOR || '#0B5FFF'
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
