# Deployment Guide - SkillsAware Endorsement System

## Overview

This system now works **WITHOUT requiring an S3 bucket** while still supporting S3 for optional archival and webhook integration. Files are delivered directly to users via base64 encoding and download endpoints.

## Key Features

✅ **Works without S3 bucket** - Files delivered directly via API
✅ **Cross-device compatible** - Downloads work on PC, mobile, and tablets
✅ **Evidence fully captured** - Both claimant narrative and evidence URLs included in PDF and JSON
✅ **Serverless ready** - No external storage dependencies required
✅ **S3 optional** - Still uploads to S3 if configured for webhooks/archival

## Required Environment Variables

```bash
# Minimum required for operation
JWT_SECRET=your-super-secret-jwt-key-min-256-bits-please-change
SKILLSAWARE_API_KEY=your-api-key
```

## Optional Environment Variables

```bash
# Optional: S3 for archival storage and webhook integration
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
S3_BUCKET=skillsaware-artifacts
S3_PREFIX=endorsements

# Optional: Webhook notifications
SKILLSAWARE_WEBHOOK_URL=https://your-webhook-endpoint.com/webhook
SKILLSAWARE_WEBHOOK_SECRET=your-webhook-secret

# Optional: Branding
BRAND_LOGO_URL=https://example.com/logo.png
BRAND_PRIMARY_COLOR=#0B5FFF

# Optional: Application URL (for magic links)
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Optional: JWT expiry (defaults to 7 days)
JWT_EXPIRY_DAYS=7
```

## Deployment Options

### Option 1: Serverless (Vercel, Netlify, etc.) - NO S3 NEEDED

**Perfect for production without S3:**

1. Set only required environment variables:
   ```bash
   JWT_SECRET=<strong-random-secret>
   SKILLSAWARE_API_KEY=<your-api-key>
   ```

2. Deploy to Vercel:
   ```bash
   npm install
   npm run build
   vercel deploy --prod
   ```

3. Files are delivered directly via:
   - Base64 in API response (for programmatic access)
   - Download endpoints (for browser downloads)

**How it works:**
- PDF and JSON generated on-demand
- Returned as base64 in submission response
- Download URLs work for 7 days (JWT expiry)
- No external storage needed

### Option 2: With S3 for Archival + Webhooks

**Use when you need:**
- Long-term archival storage
- Webhook integration with external systems
- Separate file hosting

1. Set all environment variables including S3 credentials

2. Deploy normally:
   ```bash
   npm install
   npm run build
   vercel deploy --prod
   ```

**How it works:**
- Files uploaded to S3 in parallel with response
- If S3 upload fails, falls back to direct delivery
- Webhook only sent if S3 upload succeeds
- Base64 downloads still available as backup

### Option 3: Local Development

```bash
# Copy example env file
cp .env.local.example .env.local

# Edit .env.local and set JWT_SECRET and API_KEY

# Run development server
npm run dev
```

**Local behavior:**
- S3 uploads fall back to `.artifacts/` folder
- All downloads work via base64
- Webhook calls still attempted (if configured)

## File Download Methods

After successful endorsement submission, users get files via:

### Method 1: Direct Download Buttons (Preferred)
- Uses base64 data from API response
- Works immediately without additional requests
- Compatible with all devices and browsers
- No expiry concerns

### Method 2: Download URLs (Fallback)
- Server-side regeneration endpoint
- Format: `/api/v1/endorsements/{claim_id}/download/{type}?token={jwt}`
- Works for 7 days (or JWT expiry setting)
- Cross-device compatible

## API Response Structure

After successful endorsement submission:

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
      "base64": "eyJAY29udGV4dCI6...",
      "filename": "ICTDSN403-uuid.obv3.json",
      "url": "/api/v1/endorsements/uuid/download/json?token=..."
    },
    "pdf": {
      "base64": "JVBERi0xLjQKJ...",
      "filename": "ICTDSN403-uuid.pdf",
      "url": "/api/v1/endorsements/uuid/download/pdf?token=..."
    }
  },
  "s3_uploaded": false,
  "webhook_delivered": false
}
```

## Evidence Handling

### Claimant Evidence
All evidence is fully captured and included:

1. **Claimant Narrative** - Captured in claimant form, stored in JWT, included in PDF and JSON
2. **Evidence URLs** - Captured in endorser form, validated, included in both formats

### PDF Structure
The PDF certificate includes:
- Skill information (name, code, description)
- Claimant name and narrative
- Endorser information and credentials (bona fides)
- Endorsement statement
- **Supporting evidence URLs** (if provided)
- Digital signature
- Branding (logo and colors)

### JSON Credential
The OBv3 JSON includes:
- Achievement credential with claimant subject
- Claimant narrative in `credentialSubject.narrative`
- Evidence array: `evidence: [{ id: "url", type: "Evidence", name: "Evidence 1" }]`
- Embedded endorsement credential
- Endorser profile with bona fides

## Testing the Complete Flow

### 1. Start the Main Server
```bash
cd skillsaware-endorsement
npm run dev  # Runs on http://localhost:3000
```

### 2. Start the Client Demo (Optional)
```bash
cd endorsement-client
npm run dev  # Runs on http://localhost:3001
```

### 3. Test Workflow

**Option A: Using Client Demo**
1. Go to http://localhost:3001
2. Fill in claimant details
3. Click "Create Claim & Generate Magic Link"
4. Click "Open Claimant Form"
5. Fill in narrative and endorser details
6. Get endorser link, open it
7. Fill in endorsement, bona fides, evidence URLs
8. Submit and download PDF/JSON

**Option B: Using API Directly**
```bash
# Create claim
curl -X POST http://localhost:3000/api/v1/claims \
  -H "Content-Type: application/json" \
  -H "x-api-key: dev-api-key" \
  -d '{
    "tenant_id": "skillsaware",
    "skill_code": "ICTDSN403",
    "skill_name": "Apply innovative thinking",
    "skill_description": "Demonstrates innovative thinking...",
    "claimant_name": "Jane Doe",
    "claimant_email": "jane@example.com"
  }'

# Follow the claimant_link in browser
# Complete the forms
# Download files from success page
```

## Cross-Device Compatibility

### Desktop Browsers
✅ Chrome, Firefox, Safari, Edge - All supported
✅ Direct download via base64
✅ Download URLs work

### Mobile Browsers
✅ iOS Safari - Both methods work
✅ Android Chrome - Both methods work
✅ Files save to Downloads folder

### Tablets
✅ iPad - Fully supported
✅ Android tablets - Fully supported

## Troubleshooting

### Files don't download
**Solution:** The success page now has two download methods:
1. Primary: Direct base64 download (button click)
2. Fallback: Download URL (link)

If one fails, try the other.

### S3 upload errors in logs
**Expected behavior** if S3 not configured. System continues and delivers files directly.
Check logs for: `⚠️ S3 upload failed, continuing with base64 response`

### Webhook not delivered
**Expected behavior** if:
- Webhook URL not configured
- S3 upload failed (webhook only sent after successful S3 upload)

### JWT expired errors
**Solution:** Magic links expire after 7 days (default). Request a new claim.

## Production Checklist

- [ ] Set strong `JWT_SECRET` (min 256 bits)
- [ ] Set production `SKILLSAWARE_API_KEY`
- [ ] Configure custom domain in `NEXT_PUBLIC_APP_URL`
- [ ] Optional: Configure S3 credentials for archival
- [ ] Optional: Configure webhook URL and secret
- [ ] Optional: Set brand logo and colors
- [ ] Test complete flow end-to-end
- [ ] Verify downloads work on mobile devices
- [ ] Check PDF includes all evidence URLs

## Security Notes

1. **JWT Secret**: Must be at least 256 bits for HS256 algorithm
2. **API Keys**: Stored as SHA256 hashes, never in plain text
3. **Webhook Signatures**: HMAC-SHA256 with timing-safe comparison
4. **File Access**: Protected by JWT authentication
5. **CORS**: Configure allowed origins in production

## Performance Considerations

### Without S3
- **Pros**: Instant delivery, no external dependencies, lower costs
- **Cons**: No long-term archival, files regenerated on each download request

### With S3
- **Pros**: Long-term storage, webhook integration, CDN-ready
- **Cons**: Additional cost, requires AWS credentials, potential upload failures

### Recommendation
Start without S3 for simplicity. Add S3 later when:
- You need webhook integration with external systems
- You need long-term archival (>7 days)
- You want to serve files from CDN

## Cost Analysis

### Without S3
- **Hosting**: Vercel free tier or ~$20/month
- **Total**: $0-20/month

### With S3
- **Hosting**: $0-20/month
- **S3 Storage**: ~$0.023/GB/month
- **S3 Requests**: ~$0.005/1000 PUT requests
- **Estimated**: $0-30/month for typical usage

## Support

For issues or questions:
1. Check server logs for detailed error messages
2. Verify environment variables are set correctly
3. Test with simple workflow first
4. Check TESTING.md for test scenarios
