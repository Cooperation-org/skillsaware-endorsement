# SkillsAware OBv3 Endorsement System

A stateless, serverless endorsement workflow platform that enables skill claim creation, endorser validation, and Open Badges v3.0 credential generation—all without a database.

## 🎯 Overview

This system provides a complete endorsement workflow for SkillsAware:
- **Stateless Authentication**: JWT-based magic links (no sessions, no database)
- **Standards Compliance**: OBv3 JSON-LD credentials (W3C Verifiable Credentials v2.0)
- **Serverless Architecture**: Optimized for AWS Lambda/Vercel deployment
- **Security**: HMAC webhooks, short-lived JWTs, timing-safe comparisons
- **Artifact Generation**: Professional PDF certificates + JSON-LD credentials

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ and npm
- AWS S3 bucket (for artifact storage)
- (Optional) Webhook endpoint for receiving notifications

### Installation

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Environment setup:**

   The `.env.local` file has been created with secure API keys. Review and configure:

   ```bash
   # Required: Already configured
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   JWT_SECRET=<generated-secret>
   SKILLSAWARE_API_KEY=<generated-api-key>
   SKILLSAWARE_WEBHOOK_SECRET=<generated-webhook-secret>

   # Required: Configure these for S3 storage
   # Uncomment and add your AWS credentials in .env.local:
   AWS_ACCESS_KEY_ID=your-access-key
   AWS_SECRET_ACCESS_KEY=your-secret-key
   AWS_REGION=us-east-1
   S3_BUCKET=skillsaware-artifacts
   S3_PREFIX=endorsements
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Open [http://localhost:3000](http://localhost:3000)** to see the system dashboard.

## 📡 API Endpoints

### 1. Create Claim
**Endpoint:** `POST /api/v1/claims`

**Headers:**
- `Content-Type: application/json`
- `x-api-key: <SKILLSAWARE_API_KEY>`

**Request Body:**
```json
{
  "tenant_id": "skillsaware",
  "skill_code": "ICTDSN403",
  "skill_name": "Design Skills",
  "skill_description": "Demonstrates advanced design capabilities",
  "claimant_name": "Jane Doe",
  "claimant_email": "jane@example.com"
}
```

**Response:**
```json
{
  "claim_id": "uuid",
  "claimant_link": "http://localhost:3000/form/claimant?token=<jwt>",
  "expires_at": "2025-01-26T00:00:00.000Z"
}
```

### 2. Generate Endorser Link
**Endpoint:** `POST /api/v1/claims/{claim_id}/endorser-link`

**Headers:**
- `Authorization: Bearer <claimant-jwt-token>`

**Request Body:**
```json
{
  "claimant_narrative": "I have demonstrated this skill through...",
  "endorser_name": "John Manager",
  "endorser_email": "john@example.com"
}
```

### 3. Submit Endorsement
**Endpoint:** `POST /api/v1/endorsements/submit`

**Headers:**
- `Authorization: Bearer <endorser-jwt-token>`

**Request Body:**
```json
{
  "endorsement_text": "Jane has demonstrated exceptional skills...",
  "bona_fides": "Senior Developer at Company X",
  "evidence_urls": ["https://example.com/evidence1"],
  "signature": "John Manager"
}
```

### 4. Test Webhook
**Endpoint:** `POST /api/v1/webhook/test`

**Headers:**
- `x-api-key: <SKILLSAWARE_API_KEY>`

## 🔐 Authentication & Security

### API Key Authentication
- API key required in `x-api-key` header for claim creation
- Key is hashed with SHA256 before storage
- Current API key: `8f33e3a4fd9322e89dc15300f603d91654d7eb38802f0cef0440ca292bf2c3f5`

### JWT Magic Links
- Stateless authentication using `jose` library (Edge Runtime compatible)
- Tokens expire after 7 days (configurable via `JWT_EXPIRY_DAYS`)
- All claim context embedded in token (no database lookups)
- Tokens stored in HttpOnly cookies after first use

### HMAC Webhook Signatures
- All webhooks signed with HMAC-SHA256
- Signature in `X-Signature` header: `sha256=<signature>`
- Uses `crypto.timingSafeEqual` for timing-attack protection

## 🏗️ Architecture

### Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Runtime**: Edge-compatible (jose, not jsonwebtoken)
- **Storage**: AWS S3 (presigned URLs)
- **PDF**: Puppeteer-core + @sparticuz/chromium
- **Validation**: Zod schemas
- **Standards**: OBv3 v3.0.3, W3C Verifiable Credentials v2.0

### Project Structure
```
skillsaware/
├── app/
│   ├── api/v1/              # API routes
│   │   ├── claims/          # Claim creation & endorser link
│   │   ├── endorsements/    # Endorsement submission
│   │   └── webhook/         # Webhook testing
│   ├── form/                # Magic link forms
│   │   ├── claimant/        # Claimant narrative form
│   │   └── endorser/        # Endorsement form
│   ├── error/               # Error pages
│   └── templates/           # PDF templates
├── lib/                     # Core libraries
│   ├── config.ts           # Tenant configuration
│   ├── jwt.ts              # JWT with jose
│   ├── s3.ts               # S3 integration
│   ├── webhook.ts          # HMAC webhooks
│   ├── obv3.ts             # OBv3 credentials
│   ├── pdf.ts              # PDF generation
│   └── validation.ts       # Input validation
├── types/                   # TypeScript types
├── middleware.ts           # Route protection
└── .env.local              # Environment config
```

## 🧪 Testing

See [TESTING.md](./TESTING.md) for comprehensive testing scenarios.

**Quick test:**
```bash
# Import the Postman collection
# File: skillsaware-api.postman_collection.json

# Or use curl:
curl -X POST http://localhost:3000/api/v1/claims \
  -H "Content-Type: application/json" \
  -H "x-api-key: 8f33e3a4fd9322e89dc15300f603d91654d7eb38802f0cef0440ca292bf2c3f5" \
  -d '{
    "tenant_id": "skillsaware",
    "skill_code": "TEST001",
    "skill_name": "Test Skill",
    "skill_description": "A test skill for verification",
    "claimant_name": "Test User",
    "claimant_email": "test@example.com"
  }'
```

## 📦 Build & Deploy

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables
vercel env add JWT_SECRET
vercel env add SKILLSAWARE_API_KEY
vercel env add AWS_ACCESS_KEY_ID
# ... etc
```

### Deploy to AWS Lambda
- Configure environment variables in AWS Systems Manager Parameter Store
- Increase memory to 1024MB (for PDF generation)
- Set timeout to 30 seconds minimum
- Use VPC if accessing private S3 buckets

## 🔧 Configuration

### Tenant Configuration
Edit `lib/config.ts` to add new tenants:

```typescript
const TENANT_CONFIGS: Record<string, TenantConfig> = {
  skillsaware: {
    id: 'skillsaware',
    name: 'SkillsAware',
    api_key_hash: hashApiKey(process.env.SKILLSAWARE_API_KEY!),
    webhook_url: process.env.SKILLSAWARE_WEBHOOK_URL!,
    webhook_secret: process.env.SKILLSAWARE_WEBHOOK_SECRET!,
    s3_bucket: process.env.S3_BUCKET!,
    // ...
  },
  // Add new tenants here
};
```

### Webhook Retry Logic
Default retry delays: `1m, 5m, 30m, 6h, 24h` (exponential backoff)

Configure in `lib/webhook.ts`:
```typescript
const retryDelays = [60, 300, 1800, 21600, 86400]; // seconds
```

## 📚 Standards & Compliance

### Open Badges v3.0
- Context: `https://purl.imsglobal.org/spec/ob/v3p0/context-3.0.3.json`
- Spec: https://www.imsglobal.org/spec/ob/v3p0
- Credential types: AchievementCredential, EndorsementCredential

### W3C Verifiable Credentials
- Context: `https://www.w3.org/ns/credentials/v2`
- Spec: https://www.w3.org/TR/vc-data-model-2.0/

## 🐛 Troubleshooting

### PDF Generation Fails
- **Cause**: Chromium not available
- **Solution**: System automatically detects Chrome/Edge on Windows for development
- **Supported paths**:
  - `C:\Program Files\Google\Chrome\Application\chrome.exe`
  - `C:\Program Files\Microsoft\Edge\Application\msedge.exe`
- **Custom path**: Set `CHROME_PATH` environment variable
- **Fallback**: System returns HTML instead of PDF if no browser found

### S3 Upload Errors
- **Cause**: AWS credentials not configured
- **Solution**: Set `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` in `.env.local`
- **Required permissions**: `s3:PutObject`, `s3:GetObject`
- **Development Fallback**: In development mode without AWS credentials, artifacts are saved to `.artifacts/` directory locally

### Token Expired Error
- **Cause**: JWT expired (default 7 days)
- **Solution**: Request new magic link via API

### Webhook Not Receiving
- **Cause**: Webhook endpoint not accessible
- **Solution**: Use ngrok for local testing: `ngrok http 3001`

## 📝 License

Proprietary - What's Cookin' Inc.

## 🤝 Contributing

For future developers:
1. Read `TESTING.md` for test scenarios
2. Review `PRPs/skillsaware-obv3-endorsement-system.md` for architecture details
3. Follow TypeScript strict mode
4. All PRs must pass `npm run lint` and `npm run build`

## 📞 Support

- Documentation: See `/` landing page when server is running
- Issues: Contact SkillsAware team
- Architecture: Review PRP document in `PRPs/` folder
