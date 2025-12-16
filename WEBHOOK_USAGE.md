# Webhook Usage Guide

---

# ⚠️ **CRITICAL: PRODUCTION IMPLEMENTATION REQUIRED** ⚠️

## 🚨 **THE WEBHOOK ENDPOINT IN THIS CODEBASE IS FOR TESTING/DEMO ONLY** 🚨

**The webhook endpoint at `/api/webhook` in this repository is provided ONLY for:**
- ✅ Testing webhook delivery during development
- ✅ Understanding webhook payload structure  
- ✅ Verifying HMAC signature validation
- ✅ Demo purposes

**DO NOT use this endpoint in production!**

**SkillsAware developers MUST implement the webhook endpoint in the MAIN SKILLSAWARE WEBSITE.**

---

## What is the Webhook?

The webhook is an **optional notification system** that sends a POST request to an external endpoint when an endorsement is successfully completed and uploaded to S3.

## Purpose

The webhook allows **external systems** (like your main application, database, or notification service) to be notified when:
- ✅ An endorsement is successfully submitted
- ✅ Files are uploaded to S3
- ✅ Credentials are ready for download

## When is it Called?

The webhook is triggered **automatically** when:
1. An endorsement is submitted via `POST /api/v1/endorsements/submit`
2. S3 upload succeeds (both JSON and PDF files)
3. Webhook URL and secret are configured

**Important:** The webhook is **non-blocking** - it runs in the background and doesn't delay the API response.

## What Data is Sent?

The webhook sends a JSON payload with the following structure:

```json
{
  "event": "claim.endorsed",
  "claim_id": "815dbda6-de57-4a2e-8077-cf2e9752dc56",
  "skill_code": "TEST-PROD-1765829489489",
  "skill_name": "Production Test Skill",
  "claimant_name": "Test Claimant",
  "endorser_name": "Test Endorser",
  "artifacts": [
    {
      "type": "obv3-json",
      "s3_key": "endorsements/815dbda6-de57-4a2e-8077-cf2e9752dc56/claim.obv3.json"
    },
    {
      "type": "pdf",
      "s3_key": "endorsements/815dbda6-de57-4a2e-8077-cf2e9752dc56/claim.pdf"
    }
  ],
  "timestamp": "2025-01-19T12:00:00.000Z"
}
```

## Security

The webhook includes HMAC-SHA256 signature for verification:

**Headers:**
- `Content-Type: application/json`
- `X-Signature: sha256=<hmac-signature>`
- `X-Tenant: skillsaware`
- `X-Event-Id: <unique-event-id>`

**Verification Example (Node.js):**
```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return signature === `sha256=${expectedSig}`;
}

// Usage
const isValid = verifyWebhook(
  req.body,
  req.headers['x-signature'],
  process.env.SKILLSAWARE_WEBHOOK_SECRET
);
```

## Use Cases

### 1. **Database Integration**
Notify your main application to store endorsement records:
```javascript
// Your webhook endpoint
app.post('/api/webhook', async (req, res) => {
  // Verify signature
  if (!verifyWebhook(req.body, req.headers['x-signature'], secret)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  // Store in database
  await db.endorsements.create({
    claimId: req.body.claim_id,
    skillCode: req.body.skill_code,
    s3JsonKey: req.body.artifacts[0].s3_key,
    s3PdfKey: req.body.artifacts[1].s3_key,
    timestamp: req.body.timestamp
  });
  
  res.json({ success: true });
});
```

### 2. **Notification Service**
Send emails, SMS, or push notifications:
```javascript
app.post('/api/webhook', async (req, res) => {
  // Verify signature...
  
  // Send notification
  await sendEmail({
    to: 'admin@example.com',
    subject: 'New Endorsement Completed',
    body: `Claim ${req.body.claim_id} has been endorsed for ${req.body.skill_name}`
  });
  
  res.json({ success: true });
});
```

### 3. **Analytics & Reporting**
Track endorsement metrics:
```javascript
app.post('/api/webhook', async (req, res) => {
  // Verify signature...
  
  // Track analytics
  await analytics.track('endorsement.completed', {
    claimId: req.body.claim_id,
    skillCode: req.body.skill_code,
    timestamp: req.body.timestamp
  });
  
  res.json({ success: true });
});
```

## Configuration

Set these environment variables:

```bash
SKILLSAWARE_WEBHOOK_URL=https://your-external-api.com/webhooks/endorsements
SKILLSAWARE_WEBHOOK_SECRET=your-secret-key-for-hmac-signing
```

**Important:** The webhook URL must:
- ✅ Accept POST requests
- ✅ Return 2xx status code on success
- ✅ Be publicly accessible (not localhost unless using ngrok)
- ✅ Handle the webhook payload within 30 seconds

## Retry Logic

If the webhook fails, it automatically retries with exponential backoff:
- Attempt 1: Immediate
- Attempt 2: After 1 minute
- Attempt 3: After 5 minutes
- Attempt 4: After 30 minutes
- Attempt 5: After 6 hours
- Attempt 6: After 24 hours

## Current Issue: HTTP 405

You're seeing `HTTP 405: Method Not Allowed` because:

1. **The endpoint exists** but doesn't accept POST requests
2. **The endpoint is configured incorrectly** (might be a GET endpoint)
3. **The endpoint is not a webhook handler** (might be a regular API endpoint)

### Solution

**Option 1: Create a proper webhook endpoint**

If you want to receive webhooks, create an endpoint that accepts POST:

```typescript
// app/api/webhook/route.ts (in your external system)
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const signature = request.headers.get('x-signature');
    const secret = process.env.SKILLSAWARE_WEBHOOK_SECRET!;
    
    // Verify signature
    const expectedSig = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');
    
    if (signature !== `sha256=${expectedSig}`) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
    
    // Process webhook
    console.log('Webhook received:', payload);
    
    // Your business logic here
    // - Store in database
    // - Send notifications
    // - Update records
    // etc.
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

**Option 2: Disable webhook (if not needed)**

If you don't need webhooks, remove the environment variables:

```bash
# Remove or comment out these lines in .env.local
# SKILLSAWARE_WEBHOOK_URL=https://skillsaware-endorsement.vercel.app/api/webhook
# SKILLSAWARE_WEBHOOK_SECRET=your-secret
```

The system will work perfectly without webhooks - they're completely optional.

## Testing

Test your webhook endpoint:

```bash
# Using the test endpoint
curl -X POST http://localhost:3000/api/v1/webhook/test \
  -H "x-api-key: your-api-key" \
  -H "Content-Type: application/json"
```

Or use a webhook testing service:
- https://webhook.site (temporary webhook URLs for testing)
- https://requestbin.com (inspect webhook payloads)

## Summary

- **Purpose:** Notify external systems when endorsements are completed
- **When:** After successful S3 upload
- **Data:** Claim details + S3 keys for artifacts
- **Security:** HMAC-SHA256 signature verification
- **Retry:** Automatic with exponential backoff
- **Optional:** System works perfectly without webhooks

The 405 error means your endpoint doesn't accept POST requests. Either create a proper webhook handler or disable webhooks if you don't need them.

