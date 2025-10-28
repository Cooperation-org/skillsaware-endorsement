# SkillsAware OBv3 Endorsement System

A stateless, serverless endorsement workflow platform that enables skill claim creation, endorser validation, and Open Badges v3.0 credential generation—all without a database.

## 🎯 Overview

This system provides a complete endorsement workflow for SkillsAware:

- **Stateless Authentication**: JWT-based magic links (no sessions, no database)
- **Standards Compliance**: OBv3 JSON-LD credentials (W3C Verifiable Credentials v2.0)
- **Serverless Architecture**: Optimized for AWS Lambda/Vercel deployment
- **S3 Optional**: Works WITHOUT S3 bucket - files delivered directly to users
- **Cross-Device Support**: Downloads work on PC, mobile, and tablets
- **Security**: HMAC webhooks, short-lived JWTs, timing-safe comparisons
- **Artifact Generation**: Professional PDF certificates + JSON-LD credentials
- **Complete Evidence Capture**: Claimant narratives and evidence URLs in both PDF and JSON
- **📚 Interactive API Documentation**: Full Swagger/OpenAPI documentation with live testing

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ and npm
- **That's it!** No S3 bucket required (optional for archival)
- (Optional) AWS S3 bucket for long-term archival and webhooks
- (Optional) Webhook endpoint for receiving notifications

### 🎉 What's New (2025-10-23 Update)

**Major Improvements:**

1. ✅ **No S3 Required**: System now works perfectly without AWS S3 bucket
2. ✅ **Direct File Downloads**: PDF and JSON delivered directly to users via base64
3. ✅ **Cross-Device Compatible**: Downloads work on all devices (PC, mobile, tablets)
4. ✅ **Evidence Verified**: Complete evidence capture confirmed (narrative + URLs)
5. ✅ **Dual Download Methods**: Base64 + download URLs for maximum compatibility

See [CHANGES_SUMMARY.md](./CHANGES_SUMMARY.md) for detailed technical changes.

### Installation

1. **Clone and install dependencies:**

   ```bash
   npm install
   ```

2. **Environment setup:**

   **Minimum Required (System works with just these):**

   ```bash
   # Copy example environment file
   cp .env.local.example .env.local

   # Edit .env.local and set:
   JWT_SECRET=<your-super-secret-jwt-key-min-256-bits>
   SKILLSAWARE_API_KEY=<your-api-key>
   ```

   **Optional - Add S3 for archival storage:**

   ```bash
   # Uncomment these in .env.local if you want S3 archival:
   AWS_ACCESS_KEY_ID=your-access-key
   AWS_SECRET_ACCESS_KEY=your-secret-key
   AWS_REGION=us-east-1
   S3_BUCKET=skillsaware-artifacts
   S3_PREFIX=endorsements
   ```

   **Optional - Add webhook notifications:**

   ```bash
   # Uncomment these in .env.local if you want webhooks:
   SKILLSAWARE_WEBHOOK_URL=https://your-webhook-endpoint.com
   SKILLSAWARE_WEBHOOK_SECRET=<your-webhook-secret>
   ```

3. **Run development server:**

   ```bash
   npm run dev
   ```

4. **Open [http://localhost:3000](http://localhost:3000)** to see the system dashboard.

### 🎯 Understanding the Two Modes

#### Mode 1: Without S3 (Recommended for Getting Started)

**Environment Variables:**

```bash
JWT_SECRET=your-secret-here
SKILLSAWARE_API_KEY=your-api-key
```

**What Happens:**

- ✅ Files generated on submission
- ✅ Returned as base64 in API response
- ✅ Download buttons work immediately
- ✅ Files available for 7 days (JWT expiry)
- ✅ No AWS costs
- ⚠️ No long-term archival
- ⚠️ No webhook notifications

**Perfect For:**

- Development and testing
- Small deployments
- POC/demo environments
- Cost-sensitive projects

#### Mode 2: With S3 (Optional - For Production)

**Additional Environment Variables:**

```bash
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET=your-bucket
SKILLSAWARE_WEBHOOK_URL=https://...
SKILLSAWARE_WEBHOOK_SECRET=...
```

**What Happens:**

- ✅ Everything from Mode 1 +
- ✅ Files uploaded to S3 for long-term storage
- ✅ Webhook sent to external systems
- ✅ Files available indefinitely
- ✅ Can serve from CloudFront CDN
- 💰 S3 storage costs (~$0.023/GB/month)

**Perfect For:**

- Production environments
- Long-term archival needs
- Integration with external systems
- High-availability requirements

## 📚 API Documentation

### Interactive Swagger UI

Access comprehensive, interactive API documentation at:

```
http://localhost:3000/api-docs
```

**Features:**

- 🎯 Try all endpoints directly from the browser
- 📖 Complete request/response schemas
- 🔐 Authentication examples (API Key & JWT)
- 📝 Detailed descriptions and examples
- 🚀 Real-time API testing

### OpenAPI Specification

Download the OpenAPI 3.0 specification (JSON):

```
http://localhost:3000/api/openapi
```

Import this into tools like Postman, Insomnia, or any OpenAPI-compatible client.

### Quick Links

- **Web Interface:** [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
- **OpenAPI JSON:** [http://localhost:3000/api/openapi](http://localhost:3000/api/openapi)
- **Home Page:** [http://localhost:3000/](http://localhost:3000/)

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
  "evidence_urls": ["https://example.com/evidence1", "https://example.com/evidence2"],
  "signature": "John Manager"
}
```

**Response (NEW - 2025-10-23):**

```json
{
  "success": true,
  "claim_id": "uuid",
  "artifacts": {
    "obv3_json": "endorsements/uuid/claim.obv3.json",
    "pdf": "endorsements/uuid/claim.pdf"
  },
  "downloads": {
    "json": {
      "base64": "eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvbnMv...",
      "filename": "ICTDSN403-uuid.obv3.json",
      "url": "/api/v1/endorsements/uuid/download/json?token=..."
    },
    "pdf": {
      "base64": "JVBERi0xLjQKJeLjz9MKNSAwIG9iago8PC9GaWx0ZXIvRmxh...",
      "filename": "ICTDSN403-uuid.pdf",
      "url": "/api/v1/endorsements/uuid/download/pdf?token=..."
    }
  },
  "s3_uploaded": false,
  "webhook_delivered": false
}
```

**Download Methods:**

1. **Base64 Data**: Use `downloads.pdf.base64` or `downloads.json.base64` for immediate download
2. **Download URLs**: Use `downloads.pdf.url` or `downloads.json.url` for browser downloads (works for 7 days)

### 4. Download Files (NEW)

**Endpoint:** `GET /api/v1/endorsements/{claim_id}/download/{type}`

**Parameters:**

- `type`: Either `json` or `pdf`
- Query params: `token`, `endorsement_text`, `bona_fides`, `signature`, `evidence_urls`

**Example:**

```bash
GET /api/v1/endorsements/abc-123/download/pdf?token=eyJhbGc...
```

**Response:**

- Downloads the file directly to browser/device
- Works on all devices (PC, mobile, tablets)
- Files valid for 7 days (or JWT expiry setting)

### 5. Test Webhook

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
- **Storage**: AWS S3 (optional - presigned URLs) or Direct delivery (base64)
- **PDF**: Puppeteer-core + @sparticuz/chromium
- **Validation**: Zod schemas
- **Standards**: OBv3 v3.0.3, W3C Verifiable Credentials v2.0

### File Delivery Architecture (NEW - 2025-10-23)

The system now supports **two file delivery mechanisms**:

#### 1. Direct Delivery (No S3 Required)

```
User submits endorsement
    ↓
Generate PDF + JSON
    ↓
Convert to base64
    ↓
Return in API response
    ↓
User downloads immediately
```

**Advantages:**

- ✅ No AWS dependencies
- ✅ Zero storage costs
- ✅ Instant delivery
- ✅ Works everywhere
- ✅ Simple deployment

**Limitations:**

- ⚠️ Files regenerated on each download
- ⚠️ 7-day access (JWT expiry)
- ⚠️ No webhook integration

#### 2. S3 Archival (Optional)

```
User submits endorsement
    ↓
Generate PDF + JSON
    ↓
Upload to S3 (parallel)
    ↓
Send webhook notification
    ↓
Return base64 + S3 keys
    ↓
User downloads via either method
```

**Advantages:**

- ✅ Long-term archival
- ✅ Webhook notifications
- ✅ CDN-ready
- ✅ Indefinite access
- ✅ Integration with external systems

**Costs:**

- 💰 ~$0.023/GB/month storage
- 💰 ~$0.005/1000 PUT requests

### Evidence Capture Flow

```
1. Claimant Form
   ├─ Skill Narrative (textarea)
   └─ Stored in JWT as "claimant_narrative"

2. Endorser Form
   ├─ Reads narrative from JWT
   ├─ Endorsement Text (textarea)
   ├─ Bona Fides (credentials)
   ├─ Evidence URLs (optional, array)
   └─ Digital Signature

3. Submit Endorsement
   ├─ Generate Achievement Credential (JSON)
   │   ├─ credentialSubject.narrative = claimant_narrative
   │   └─ evidence = [{ id: url, type: "Evidence", name: "Evidence 1" }]
   ├─ Generate Endorsement Credential (JSON)
   ├─ Generate PDF Certificate
   │   ├─ Claimant Information section with narrative
   │   ├─ Endorsement section with endorser details
   │   └─ Supporting Evidence section with clickable URLs
   └─ Return files (base64 + optionally upload to S3)

4. Success Page
   ├─ Download PDF button (base64 decode)
   ├─ Download JSON button (base64 decode)
   ├─ Fallback: Download URLs (valid 7 days)
   └─ Works on all devices
```

### Project Structure

```
skillsaware/
├── app/
│   ├── api/v1/              # API routes
│   │   ├── claims/          # Claim creation & endorser link
│   │   ├── endorsements/    # Endorsement submission
│   │   │   ├── submit/      # Main submission endpoint
│   │   │   └── [id]/download/[type]/  # NEW: Download endpoints
│   │   └── webhook/         # Webhook testing
│   ├── form/                # Magic link forms
│   │   ├── claimant/        # Claimant narrative form
│   │   │   ├── page.tsx     # Server component (JWT verification)
│   │   │   └── client.tsx   # Client form component
│   │   └── endorser/        # Endorsement form
│   │       ├── page.tsx     # Server component (JWT verification)
│   │       └── client.tsx   # Client form + download UI (UPDATED)
│   ├── error/               # Error pages
│   └── templates/           # PDF templates
├── lib/                     # Core libraries
│   ├── config.ts           # Tenant configuration (UPDATED: S3 optional)
│   ├── jwt.ts              # JWT with jose
│   ├── s3.ts               # S3 integration (optional now)
│   ├── webhook.ts          # HMAC webhooks
│   ├── obv3.ts             # OBv3 credentials (includes evidence)
│   ├── pdf.ts              # PDF generation (includes evidence)
│   └── validation.ts       # Input validation
├── types/                   # TypeScript types
│   └── tenant.ts           # UPDATED: Optional S3 fields
├── middleware.ts           # Route protection
├── .env.local              # Environment config
├── DEPLOYMENT.md           # NEW: Deployment guide
└── CHANGES_SUMMARY.md      # NEW: Detailed change log
```

## 🧪 Testing

See [TESTING.md](./TESTING.md) for comprehensive testing scenarios.

### Quick Test (Complete Workflow)

**Option 1: Using the Client Demo**

```bash
# Terminal 1: Main server
npm run dev

# Terminal 2: Client demo (in endorsement-client folder)
cd endorsement-client
npm run dev

# Browser:
# 1. Open http://localhost:3001
# 2. Fill in claimant details
# 3. Click "Create Claim"
# 4. Follow the magic link
# 5. Complete claimant form
# 6. Get endorser link
# 7. Complete endorser form
# 8. Download PDF and JSON files!
```

**Option 2: Using curl (API Only)**

```bash
# Step 1: Create claim
curl -X POST http://localhost:3000/api/v1/claims \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key" \
  -d '{
    "tenant_id": "skillsaware",
    "skill_code": "TEST001",
    "skill_name": "Test Skill",
    "skill_description": "A test skill for verification",
    "claimant_name": "Test User",
    "claimant_email": "test@example.com"
  }'

# Step 2: Follow claimant_link in browser
# Step 3: Complete forms
# Step 4: Check downloads in success page
```

### Testing File Downloads

**Test on Different Devices:**

1. **Desktop Browser**: Should download immediately via base64
2. **Mobile Safari (iOS)**: Should download to Files app
3. **Android Chrome**: Should download to Downloads folder
4. **Tablet**: Should work on both iOS and Android tablets

**Verify Evidence in Files:**

```bash
# After downloading, check PDF includes:
# 1. "Skill Narrative" section with claimant's narrative
# 2. "Supporting Evidence" section with clickable URLs
# 3. "Endorsement Statement" with endorser's text

# Check JSON includes:
# 1. credentialSubject.narrative field
# 2. evidence array with URL objects
# 3. endorsement array with EndorsementCredential
```

## 📦 Build & Deploy

See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive deployment guide.

### Build for Production

```bash
npm run build
```

### Quick Deploy to Vercel (No S3 Required!)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set ONLY required environment variables
vercel env add JWT_SECRET production
vercel env add SKILLSAWARE_API_KEY production

# That's it! System works without S3
```

### Deploy with S3 (Optional)

```bash
# After basic deployment, add S3 variables:
vercel env add AWS_ACCESS_KEY_ID production
vercel env add AWS_SECRET_ACCESS_KEY production
vercel env add S3_BUCKET production
vercel env add S3_PREFIX production
vercel env add SKILLSAWARE_WEBHOOK_URL production
vercel env add SKILLSAWARE_WEBHOOK_SECRET production

# Redeploy
vercel --prod
```

### Deploy to AWS Lambda

**Minimum Configuration:**

- Environment: JWT_SECRET, SKILLSAWARE_API_KEY
- Memory: 1024MB (for PDF generation)
- Timeout: 30 seconds minimum

**With S3:**

- Add AWS credentials to environment
- Grant Lambda role `s3:PutObject` permission
- Configure VPC if using private S3 buckets

### Deploy to Other Platforms

**Netlify:**

```bash
npm run build
netlify deploy --prod
# Set environment variables in Netlify dashboard
```

**Docker:**

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variable Checklist

**Minimum (Required):**

- ✅ `JWT_SECRET` - Strong random secret (min 256 bits)
- ✅ `SKILLSAWARE_API_KEY` - Your API key

**Optional (S3 Archival):**

- ⚪ `AWS_ACCESS_KEY_ID`
- ⚪ `AWS_SECRET_ACCESS_KEY`
- ⚪ `S3_BUCKET`
- ⚪ `S3_PREFIX`
- ⚪ `AWS_REGION`

**Optional (Webhooks):**

- ⚪ `SKILLSAWARE_WEBHOOK_URL`
- ⚪ `SKILLSAWARE_WEBHOOK_SECRET`

**Optional (Branding):**

- ⚪ `BRAND_LOGO_URL`
- ⚪ `BRAND_PRIMARY_COLOR`

## 🔧 Configuration

### Tenant Configuration

Edit `lib/config.ts` to add new tenants:

```typescript
const TENANT_CONFIGS: Record<string, TenantConfig> = {
  skillsaware: {
    id: 'skillsaware',
    name: 'SkillsAware',
    api_key_hash: hashApiKey(process.env.SKILLSAWARE_API_KEY || 'dev-api-key'),

    // Optional fields (system works without them):
    webhook_url: process.env.SKILLSAWARE_WEBHOOK_URL,
    webhook_secret: process.env.SKILLSAWARE_WEBHOOK_SECRET,
    s3_bucket: process.env.S3_BUCKET,
    s3_prefix: process.env.S3_PREFIX,
    s3_region: process.env.AWS_REGION,

    // Branding (optional):
    brand_logo_url: process.env.BRAND_LOGO_URL,
    brand_primary_color: process.env.BRAND_PRIMARY_COLOR || '#0B5FFF',

    // Required:
    issuer_id: 'https://endorse.skillsaware.com/issuers/whatscookin',
    issuer_name: "What's Cookin' Inc."
  }
  // Add new tenants here
}
```

**Note:** As of 2025-10-23, S3 and webhook fields are optional. System works with minimal configuration.

### Webhook Retry Logic

Default retry delays: `1m, 5m, 30m, 6h, 24h` (exponential backoff)

Configure in `lib/webhook.ts`:

```typescript
const retryDelays = [60, 300, 1800, 21600, 86400] // seconds
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

### Files Don't Download

**Symptoms:** Click download button, nothing happens

**Solutions:**

1. Try the fallback download URL (link below buttons)
2. Check browser console for errors
3. Verify JWT not expired (check `/error/token-expired`)
4. Try different browser
5. On mobile: Check file saved to Downloads/Files app

**Technical Details:**

- Primary method: Base64 decode → Blob → download
- Fallback: Direct URL download endpoint
- Both methods should work on all modern browsers

### PDF Generation Fails

**Symptoms:** Error during endorsement submission

**Cause:** Chromium not available

**Solutions:**

- **Development**: System auto-detects Chrome/Edge on Windows
  - Supported paths:
    - `C:\Program Files\Google\Chrome\Application\chrome.exe`
    - `C:\Program Files\Microsoft\Edge\Application\msedge.exe`
  - Custom path: Set `CHROME_PATH` environment variable
- **Production**: Uses `@sparticuz/chromium` (serverless-optimized)
- **Fallback**: System returns HTML buffer (will be corrupted as PDF)

### S3 Upload Errors (Non-Critical)

**Symptoms:** Console shows: `⚠️ S3 upload failed, continuing with base64 response`

**Status:** **This is expected behavior when S3 not configured**

**Impact:**

- ✅ System continues to work perfectly
- ✅ Files delivered directly to users
- ⚠️ No long-term archival
- ⚠️ No webhook notifications

**Solutions (Optional):**

- Ignore if you don't need S3
- To enable S3: Set `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET`
- Required permissions: `s3:PutObject`
- **Development Fallback**: Files saved to `.artifacts/` directory locally

### Token Expired Error

**Symptoms:** `/error/token-expired` page

**Cause:** JWT expired (default 7 days)

**Solutions:**

- Request new claim via API
- User must re-complete workflow
- To extend: Set `JWT_EXPIRY_DAYS` in environment

### Webhook Not Receiving

**Symptoms:** `webhook_delivered: false` in response

**Cause 1:** Webhook not configured

- **Solution**: Set `SKILLSAWARE_WEBHOOK_URL` and `SKILLSAWARE_WEBHOOK_SECRET`

**Cause 2:** S3 upload failed

- **Note**: Webhooks only sent after successful S3 upload
- **Solution**: Configure S3 credentials

**Cause 3:** Webhook endpoint not accessible

- **Solution**: Use ngrok for local testing: `ngrok http 3001`

### Evidence Missing from PDF

**Symptoms:** PDF doesn't show evidence URLs

**Status:** **Should not occur** - evidence is properly captured

**Verification:**

1. Check endorser form includes evidence URL fields
2. Verify URLs are valid format (https://...)
3. Check PDF "Supporting Evidence" section (near bottom)
4. Verify JSON has `evidence` array

**If still missing:**

- Check server logs for PDF generation errors
- Verify `evidence_urls` in API request
- Test with simple URL like `https://example.com`

### Cross-Device Issues

**iOS Safari:**

- Files download to Files app
- May show "This file may be unsafe" warning (normal)
- Tap "Download" to proceed

**Android Chrome:**

- Files download to Downloads folder
- Check notification bar for download progress

**Mobile Data:**

- PDF files ~50-200 KB
- JSON files ~5-15 KB
- Should download quickly on 4G/5G

## 📝 License

Proprietary - What's Cookin' Inc.

## 🤝 Contributing

For future developers:

### Required Reading

1. **`README.md`** (this file) - System overview and setup
2. **`DEPLOYMENT.md`** - Deployment guide and environment configuration
3. **`CHANGES_SUMMARY.md`** - Recent changes and technical details (2025-10-23)
4. **`TESTING.md`** - Comprehensive test scenarios
5. **`PRPs/skillsaware-obv3-endorsement-system.md`** - Original architecture

### Key Concepts to Understand

#### 1. Stateless Design

- No database - all state in JWT tokens
- JWT carries full claim context
- Tokens expire after 7 days
- Middleware manages cookie-based token storage

#### 2. File Delivery Mechanisms (Added 2025-10-23)

- **Primary**: Base64 in API response → Client decodes → Download
- **Secondary**: Download URLs → Server regenerates → Stream to client
- **Optional**: S3 upload → Presigned URLs → Long-term access

#### 3. Evidence Capture Flow

```
Claimant Form → JWT (narrative)
     ↓
Endorser Form → API (narrative + evidence_urls)
     ↓
Generate Credentials → PDF + JSON (both include evidence)
     ↓
Return to Client → Download buttons
```

#### 4. Two Operating Modes

- **Without S3**: Files delivered directly, no external dependencies
- **With S3**: Files also uploaded to S3, webhooks sent

### Development Workflow

```bash
# 1. Create feature branch
git checkout -b feature/your-feature

# 2. Make changes

# 3. Test locally (without S3)
npm run dev

# 4. Test with S3 (if applicable)
# Set S3 env vars in .env.local
npm run dev

# 5. Lint and build
npm run lint
npm run build

# 6. Test complete workflow
# Use client demo or Postman collection

# 7. Commit
git commit -m "feat: your feature description"
```

### Code Style

- TypeScript strict mode
- No `any` types
- Prefer `const` over `let`
- Use Zod for validation
- Async/await over promises
- Error handling in try/catch

### Testing Requirements

- All API endpoints must work WITHOUT S3
- Test file downloads on multiple devices
- Verify evidence appears in PDF and JSON
- Check JWT expiry handling
- Validate cross-browser compatibility

### Architecture Constraints

- **No database** - Must remain stateless
- **Edge compatible** - Use `jose` not `jsonwebtoken`
- **Serverless friendly** - No long-running processes
- **Optional S3** - Don't require external storage
- **Mobile-first** - Downloads must work on phones

## 📞 Support

### Documentation Files

- **`README.md`** (this file) - Main documentation
- **`DEPLOYMENT.md`** - Deployment guide and configuration
- **`CHANGES_SUMMARY.md`** - Recent changes (2025-10-23 update)
- **`TESTING.md`** - Test scenarios and examples
- **`PRPs/skillsaware-obv3-endorsement-system.md`** - Original architecture
- **Landing Page** - See `/` when server is running

### Common Questions

**Q: Do I need an S3 bucket?**
A: No! As of 2025-10-23, S3 is completely optional. The system works perfectly without it.

**Q: How do users download files without S3?**
A: Files are converted to base64 and returned in the API response. Users click download buttons that decode and save the files.

**Q: Does the PDF include evidence?**
A: Yes! Both claimant narrative and evidence URLs are included in the PDF and JSON credentials.

**Q: What devices are supported?**
A: All modern browsers on PC, Mac, iOS, and Android. Downloads tested on:

- Desktop: Chrome, Firefox, Safari, Edge
- Mobile: iOS Safari, Android Chrome
- Tablets: iPad, Android tablets

**Q: How long are files available?**
A: Without S3: 7 days (JWT expiry). With S3: Indefinitely.

**Q: Can I use this in production without S3?**
A: Yes! Many deployments run without S3. Add S3 later if you need long-term archival or webhooks.

### Getting Help

- Check troubleshooting section above
- Review `DEPLOYMENT.md` for environment setup
- See `CHANGES_SUMMARY.md` for recent updates
- Contact SkillsAware team for support

### Reporting Issues

When reporting issues, include:

1. Environment (dev/production)
2. S3 configured? (yes/no)
3. Device/browser details
4. Error messages from console
5. Steps to reproduce
