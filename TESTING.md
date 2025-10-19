# Testing Guide - SkillsAware OBv3 Endorsement System

Complete testing scenarios for developers to validate the endorsement workflow.

## 🚀 Quick Start

### Prerequisites
1. Start the development server:
   ```bash
   npm run dev
   ```

2. **(Optional)** Start a webhook receiver for testing:
   ```bash
   # In a new terminal
   npx http-server -p 3001
   ```

3. Import Postman collection: `skillsaware-api.postman_collection.json`

---

## 📋 Test Scenarios

### Scenario 1: Complete Happy Path Flow

**Objective:** Test the entire endorsement workflow from claim creation to credential generation.

#### Step 1: Create a Claim
**API:** `POST /api/v1/claims`

**Using Postman:**
1. Open "1. Create Claim" request
2. Click "Send"
3. Verify response contains `claim_id` and `claimant_link`
4. Copy the `claimant_link` URL

**Using cURL:**
```bash
curl -X POST http://localhost:3000/api/v1/claims \
  -H "Content-Type: application/json" \
  -H "x-api-key: 8f33e3a4fd9322e89dc15300f603d91654d7eb38802f0cef0440ca292bf2c3f5" \
  -d '{
    "tenant_id": "skillsaware",
    "skill_code": "ICTDSN403",
    "skill_name": "Design and Develop Complex ICT Solutions",
    "skill_description": "Advanced ICT solution design and development",
    "claimant_name": "Jane Doe",
    "claimant_email": "jane.doe@example.com"
  }'
```

**Expected Response (200):**
```json
{
  "claim_id": "550e8400-e29b-41d4-a716-446655440000",
  "claimant_link": "http://localhost:3000/form/claimant?token=eyJhbGc...",
  "expires_at": "2025-01-26T12:00:00.000Z"
}
```

**Validation:**
- ✅ Status code is 200
- ✅ Response contains valid UUID for `claim_id`
- ✅ `claimant_link` contains a JWT token
- ✅ `expires_at` is 7 days in the future

---

#### Step 2: Open Claimant Form
**Action:** Browser navigation

1. Paste the `claimant_link` from Step 1 into your browser
2. The page should redirect and set an HttpOnly cookie
3. Form should display pre-filled skill information

**Expected UI:**
- ✅ Skill name, code, and description are displayed (read-only)
- ✅ Claimant name is shown
- ✅ Form has textarea for "Your Skill Narrative"
- ✅ Form has inputs for "Endorser Name" and "Endorser Email"
- ✅ "Generate Endorser Link" button is visible

**Manual Test:**
1. Fill in narrative: "I have successfully designed and developed complex ICT solutions..."
2. Enter endorser name: "John Manager"
3. Enter endorser email: "john.manager@example.com"
4. Click "Generate Endorser Link"

---

#### Step 3: Generate Endorser Link
**API:** `POST /api/v1/claims/{claim_id}/endorser-link`

**Using Postman:**
1. Open "2. Generate Endorser Link" request
2. Ensure `{{claimant_token}}` variable is set from Step 1
3. Click "Send"
4. Copy the `endorser_link` URL

**Expected Response (200):**
```json
{
  "endorser_link": "http://localhost:3000/form/endorser?token=eyJhbGc...",
  "expires_at": "2025-01-26T12:00:00.000Z"
}
```

**Validation:**
- ✅ Status code is 200
- ✅ `endorser_link` contains a different JWT than claimant link
- ✅ Link is displayed in the browser UI
- ✅ "Copy to Clipboard" button works

---

#### Step 4: Open Endorser Form
**Action:** Browser navigation

1. Paste the `endorser_link` from Step 3 into your browser
2. Form should display claimant's information and narrative

**Expected UI:**
- ✅ Skill information displayed (read-only)
- ✅ Claimant name and narrative shown (read-only)
- ✅ Form has textarea for "Endorsement Statement"
- ✅ Form has input for "Your Credentials / Bona Fides"
- ✅ Form has optional "Supporting Evidence" URL inputs
- ✅ Form has "Digital Signature" input
- ✅ Form has consent checkbox

**Manual Test:**
1. Fill in bona fides: "Senior Technical Lead at TechCorp"
2. Fill in endorsement: "Jane has demonstrated exceptional skills..."
3. Add evidence URL (optional): "https://github.com/example/project"
4. Type signature: "John Manager"
5. Check consent checkbox
6. Click "Submit Endorsement"

---

#### Step 5: Submit Endorsement
**API:** `POST /api/v1/endorsements/submit`

**Using Postman:**
1. Open "3. Submit Endorsement" request
2. Ensure `{{endorser_token}}` variable is set
3. Click "Send"

**Expected Response (200):**
```json
{
  "success": true,
  "claim_id": "550e8400-e29b-41d4-a716-446655440000",
  "artifacts": {
    "obv3_json": "endorsements/550e8400-e29b-41d4-a716-446655440000/claim.obv3.json",
    "pdf": "endorsements/550e8400-e29b-41d4-a716-446655440000/claim.pdf"
  },
  "webhook_delivered": true
}
```

**Validation:**
- ✅ Status code is 200
- ✅ `success` is true
- ✅ `artifacts` contains S3 keys for both JSON and PDF
- ✅ `webhook_delivered` is true (if webhook endpoint is configured)
- ✅ Browser shows success confirmation page

---

### Scenario 2: Authentication & Authorization Tests

#### Test 2.1: Invalid API Key
**Objective:** Verify API key validation

**Test:**
```bash
curl -X POST http://localhost:3000/api/v1/claims \
  -H "Content-Type: application/json" \
  -H "x-api-key: invalid-key" \
  -d '{"tenant_id": "skillsaware", ...}'
```

**Expected Response (401):**
```json
{
  "error": "Invalid API key"
}
```

---

#### Test 2.2: Missing API Key
**Test:**
```bash
curl -X POST http://localhost:3000/api/v1/claims \
  -H "Content-Type: application/json" \
  -d '{"tenant_id": "skillsaware", ...}'
```

**Expected Response (401):**
```json
{
  "error": "Missing API key"
}
```

---

#### Test 2.3: Expired Token
**Objective:** Verify token expiry handling

**Steps:**
1. Create a claim
2. Wait for token to expire (or modify `JWT_EXPIRY_DAYS` to a very small value)
3. Try to access the form with expired token

**Expected:**
- ✅ Browser redirects to `/error/token-expired`
- ✅ User-friendly error message displayed

---

#### Test 2.4: Invalid Token
**Test:**
```bash
# Try to access endorser form with claimant token (wrong role)
curl -X POST http://localhost:3000/api/v1/endorsements/submit \
  -H "Authorization: Bearer <claimant-token>" \
  -d '{...}'
```

**Expected Response (403):**
```json
{
  "error": "Invalid token role"
}
```

---

### Scenario 3: Input Validation Tests

#### Test 3.1: Missing Required Fields
**Using Postman:** Open "Error: Missing Required Fields" request

**Expected Response (400):**
```json
{
  "error": "Invalid request",
  "details": {
    "fieldErrors": {
      "skill_name": ["Required"],
      "skill_description": ["Required"],
      "claimant_name": ["Required"],
      "claimant_email": ["Required"]
    }
  }
}
```

---

#### Test 3.2: Invalid Email Format
**Test:**
```bash
curl -X POST http://localhost:3000/api/v1/claims \
  -H "Content-Type: application/json" \
  -H "x-api-key: 8f33e3a4fd9322e89dc15300f603d91654d7eb38802f0cef0440ca292bf2c3f5" \
  -d '{
    "tenant_id": "skillsaware",
    "skill_code": "TEST001",
    "skill_name": "Test",
    "skill_description": "Test",
    "claimant_name": "Test",
    "claimant_email": "not-an-email"
  }'
```

**Expected Response (400):**
```json
{
  "error": "Invalid request",
  "details": {
    "fieldErrors": {
      "claimant_email": ["Invalid email"]
    }
  }
}
```

---

#### Test 3.3: Narrative Too Short
**Test:** Submit endorser link request with very short narrative

**Expected Response (400):**
```json
{
  "error": "Invalid request",
  "details": {
    "fieldErrors": {
      "claimant_narrative": ["String must contain at least 10 character(s)"]
    }
  }
}
```

---

### Scenario 4: Webhook Testing

#### Test 4.1: Test Webhook Endpoint
**Using Postman:** Open "4. Test Webhook" request

**Expected Response (200):**
```json
{
  "success": true,
  "webhook_url": "http://localhost:3001/api/webhook"
}
```

**If webhook endpoint is not available:**
```json
{
  "success": false,
  "webhook_url": "http://localhost:3001/api/webhook",
  "error": "Max retries exceeded"
}
```

---

#### Test 4.2: Verify HMAC Signature
**Objective:** Validate webhook signature on receiving end

**Webhook Payload Example:**
```json
{
  "event": "claim.endorsed",
  "claim_id": "550e8400-e29b-41d4-a716-446655440000",
  "skill_code": "ICTDSN403",
  "skill_name": "Design Skills",
  "claimant_name": "Jane Doe",
  "endorser_name": "John Manager",
  "artifacts": [
    {
      "type": "obv3-json",
      "s3_key": "endorsements/.../claim.obv3.json"
    },
    {
      "type": "pdf",
      "s3_key": "endorsements/.../claim.pdf"
    }
  ],
  "timestamp": "2025-01-19T12:00:00.000Z"
}
```

**Headers Sent:**
- `Content-Type: application/json`
- `X-Signature: sha256=<hmac-signature>`
- `X-Tenant: skillsaware`
- `X-Event-Id: <uuid>`

**Verification Code (Node.js):**
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
  '438a5280706a52f10b6aab934363cf07befa5c5604de65f0030b88423154003f'
);
```

---

### Scenario 5: OBv3 Credential Validation

#### Test 5.1: Validate JSON-LD Structure
**Objective:** Ensure generated credentials comply with OBv3 spec

**Steps:**
1. Complete endorsement flow (Scenario 1)
2. Download `claim.obv3.json` from S3 (or check response logs)
3. Validate against OBv3 schema

**Expected JSON-LD Structure:**
```json
{
  "@context": [
    "https://www.w3.org/ns/credentials/v2",
    "https://purl.imsglobal.org/spec/ob/v3p0/context-3.0.3.json"
  ],
  "type": ["VerifiableCredential", "AchievementCredential"],
  "id": "urn:uuid:...",
  "issuer": {
    "id": "https://endorse.skillsaware.com/issuers/whatscookin",
    "type": "Profile",
    "name": "What's Cookin' Inc."
  },
  "issuanceDate": "2025-01-19T12:00:00.000Z",
  "credentialSubject": {
    "id": "did:email:jane.doe@example.com",
    "type": "AchievementSubject",
    "name": "Jane Doe",
    "narrative": "...",
    "achievement": {
      "id": "ICTDSN403",
      "type": "Achievement",
      "name": "Design Skills",
      "description": "...",
      "criteria": {
        "narrative": "Demonstrated competency through peer endorsement"
      }
    }
  },
  "endorsement": [
    {
      "@context": [...],
      "type": ["VerifiableCredential", "EndorsementCredential"],
      "id": "urn:uuid:...",
      "issuer": {
        "id": "https://endorse.skillsaware.com/issuers/whatscookin",
        "type": "Profile",
        "name": "John Manager"
      },
      "issuanceDate": "2025-01-19T12:00:00.000Z",
      "credentialSubject": {
        "id": "<achievement-credential-id>",
        "type": "EndorsementSubject",
        "endorsementComment": "Jane has demonstrated exceptional skills...",
        "profile": {
          "type": "Profile",
          "name": "John Manager",
          "description": "Senior Technical Lead at TechCorp"
        }
      }
    }
  ],
  "evidence": [
    {
      "id": "https://github.com/example/project",
      "type": "Evidence",
      "name": "Evidence 1"
    }
  ]
}
```

**Validation Checklist:**
- ✅ `@context` includes W3C and OBv3 v3.0.3 contexts
- ✅ `type` includes "VerifiableCredential" and "AchievementCredential"
- ✅ `id` is a URN with UUID
- ✅ `credentialSubject.id` uses DID format
- ✅ `endorsement` array contains EndorsementCredential
- ✅ `issuanceDate` is ISO 8601 format
- ✅ All required fields present

---

### Scenario 6: Error Handling & Edge Cases

#### Test 6.1: Claim ID Mismatch
**Test:** Try to generate endorser link with wrong claim_id

**Expected Response (403):**
```json
{
  "error": "Claim ID mismatch"
}
```

---

#### Test 6.2: Form Without Consent
**UI Test:**
1. Open endorser form
2. Fill all fields
3. DO NOT check consent checkbox
4. Try to submit

**Expected:**
- ✅ Error message: "You must provide consent to submit the endorsement"
- ✅ Form does not submit

---

#### Test 6.3: S3 Upload Failure
**Scenario:** S3 credentials not configured

**Expected:**
- ✅ API returns 500 error
- ✅ Error logged: "S3 upload failed"
- ✅ User sees generic error message (security)

---

### Scenario 7: Browser Testing

#### Test 7.1: Token Cookie Flow
**Objective:** Verify magic link → cookie → redirect flow

**Steps:**
1. Get claimant link from API
2. Open link in browser (includes `?token=...`)
3. Observe network tab

**Expected:**
- ✅ Page loads with token in URL
- ✅ Middleware sets `token` cookie (HttpOnly, Secure in prod)
- ✅ Page redirects to clean URL (no token in query)
- ✅ Form loads using cookie token

---

#### Test 7.2: Multiple Evidence URLs
**UI Test:**
1. Open endorser form
2. Click "Add Evidence URL" multiple times
3. Fill in multiple URLs
4. Submit

**Expected:**
- ✅ Multiple input fields appear
- ✅ All URLs included in submission
- ✅ All URLs appear in generated credential

---

#### Test 7.3: Copy to Clipboard
**UI Test:**
1. Complete claimant form
2. Click "Copy to Clipboard" on endorser link

**Expected:**
- ✅ Link copied to clipboard
- ✅ Alert confirms: "Link copied to clipboard!"
- ✅ Can paste link into new tab

---

## 🔍 Debugging Tips

### Enable Detailed Logging
Add to your test requests:
```bash
# Check server logs in terminal running npm run dev
```

### Decode JWT Tokens
```bash
# Use jwt.io or decode locally
echo "eyJhbGc..." | base64 -d
```

### Test S3 Uploads Locally
Without S3 configured, the system will attempt upload but fail gracefully.
Check console logs for detailed error messages.

### Monitor Webhook Delivery
Use tools like:
- **ngrok**: `ngrok http 3001` for local webhook testing
- **RequestBin**: https://requestbin.com for inspecting webhooks
- **webhook.site**: https://webhook.site for quick testing

---

## ✅ Test Checklist

Before deploying to production:

- [ ] All Postman requests return expected status codes
- [ ] Happy path flow (Scenario 1) completes successfully
- [ ] Invalid API key returns 401
- [ ] Missing required fields return 400 with validation details
- [ ] Token expiry redirects to error page
- [ ] Wrong token role returns 403
- [ ] OBv3 JSON-LD validates against schema
- [ ] PDF generates successfully (in deployment environment)
- [ ] Webhooks deliver with correct HMAC signature
- [ ] UI forms display correctly
- [ ] Copy to clipboard works
- [ ] Multiple evidence URLs supported
- [ ] Consent checkbox enforced
- [ ] All error states show user-friendly messages

---

## 📞 Support

If tests fail:
1. Check `.env.local` configuration
2. Verify server is running: `npm run dev`
3. Review server logs for errors
4. Check `README.md` for troubleshooting section
5. Review PRP document: `PRPs/skillsaware-obv3-endorsement-system.md`
