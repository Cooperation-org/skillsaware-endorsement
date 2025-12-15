# Production Workflow Test Guide

This guide explains how to test the complete endorsement workflow in production with S3 integration.

## Quick Start

### Prerequisites

1. **Environment Variables Set:**
   ```bash
   # Required
   SKILLSAWARE_API_KEY=your-api-key
   
   # For S3 testing
   AWS_ACCESS_KEY_ID=your-access-key
   AWS_SECRET_ACCESS_KEY=your-secret-key
   AWS_REGION=us-east-1
   S3_BUCKET=your-bucket-name
   S3_PREFIX=endorsements
   
   # Optional - for webhook testing
   SKILLSAWARE_WEBHOOK_URL=https://your-webhook-endpoint.com/webhook
   SKILLSAWARE_WEBHOOK_SECRET=your-webhook-secret
   ```

2. **Server Running:**
   - Development: `npm run dev` (runs on http://localhost:3000)
   - Production: Your production server URL

### Running the Test

**Option 1: Test against localhost (development)**
```bash
node test-production-workflow.js
# or
node test-production-workflow.js http://localhost:3000
```

**Option 2: Test against production**
```bash
node test-production-workflow.js https://your-production-domain.com
```

**Option 3: Using environment variable**
```bash
export API_BASE_URL=https://your-production-domain.com
node test-production-workflow.js
```

## What the Test Does

The test script performs a complete end-to-end workflow:

1. ✅ **Creates a Claim**
   - POST `/api/v1/claims`
   - Validates API key authentication
   - Verifies response contains `claim_id` and `claimant_link`

2. ✅ **Generates Endorser Link**
   - POST `/api/v1/claims/{claim_id}/endorser-link`
   - Uses claimant JWT token
   - Verifies endorser link is generated

3. ✅ **Submits Endorsement**
   - POST `/api/v1/endorsements/submit`
   - Uses endorser JWT token
   - Verifies S3 upload status (`s3_uploaded: true`)
   - Verifies webhook delivery status (`webhook_delivered: true`)

4. ✅ **Tests File Downloads**
   - Downloads JSON credential from download URL
   - Downloads PDF certificate from download URL
   - Validates file contents

5. ✅ **Verifies S3 Uploads** (if configured)
   - Shows expected S3 keys
   - Provides AWS CLI command to verify manually

## Expected Output

### Successful Test (with S3 configured)

```
🚀 Starting Production Workflow Test
   Base URL: https://your-production-domain.com
   S3 Bucket: your-bucket-name
   S3 Prefix: endorsements
   Test Skill Code: TEST-PROD-1234567890

📋 Step 1: Creating claim...
✅ [Create Claim] Claim created: abc-123-def-456

🔗 Step 2: Generating endorser link...
✅ [Generate Endorser Link] Endorser link generated successfully

📝 Step 3: Submitting endorsement...
✅ [Submit Endorsement] Endorsement submitted successfully
✅ [S3 Upload] Files uploaded to S3 successfully
✅ [Webhook Delivery] Webhook delivered successfully

📥 Step 4: Testing file downloads...
✅ [Download JSON] JSON downloaded successfully (2048 bytes)
✅ [Download PDF] PDF downloaded successfully (~180 KB)

☁️  Step 5: Verifying S3 uploads...
⚠️  [S3 Verification] Manual verification required - check S3 bucket for files
   Expected JSON key: s3://your-bucket-name/endorsements/abc-123-def-456/claim.obv3.json
   Expected PDF key: s3://your-bucket-name/endorsements/abc-123-def-456/claim.pdf

============================================================
📊 Test Summary
============================================================

✅ Passed: 6
❌ Failed: 0
⚠️  Warnings: 1

📋 Submission Details:
   Claim ID: abc-123-def-456
   S3 Uploaded: Yes ✅
   Webhook Delivered: Yes ✅

📥 Download URLs:
   JSON: https://your-production-domain.com/api/v1/endorsements/abc-123-def-456/download/json?token=...
   PDF: https://your-production-domain.com/api/v1/endorsements/abc-123-def-456/download/pdf?token=...

============================================================

✅ All tests passed successfully!
```

### Test with Warnings (S3 not configured)

If S3 is not configured, you'll see warnings but the test will still pass:

```
⚠️  [S3 Upload] S3 upload not performed (may not be configured)
⚠️  [Webhook Delivery] Webhook not delivered (may not be configured or S3 upload failed)
⚠️  [S3 Verification] S3_BUCKET not configured, skipping S3 verification
```

## Manual S3 Verification

After running the test, verify files were uploaded to S3:

```bash
# List files for the test claim
aws s3 ls s3://your-bucket-name/endorsements/TEST-PROD-1234567890/

# Download and verify JSON
aws s3 cp s3://your-bucket-name/endorsements/TEST-PROD-1234567890/claim.obv3.json ./test-claim.json
cat test-claim.json | jq '.@context'  # Should show OBv3 contexts

# Download and verify PDF
aws s3 cp s3://your-bucket-name/endorsements/TEST-PROD-1234567890/claim.pdf ./test-claim.pdf
file test-claim.pdf  # Should show "PDF document"
```

## Troubleshooting

### Test Fails at "Create Claim"

**Possible causes:**
- API key is incorrect
- Server is not running
- Base URL is wrong

**Solutions:**
```bash
# Verify API key
echo $SKILLSAWARE_API_KEY

# Test server connectivity
curl https://your-production-domain.com/api/v1/claims \
  -H "x-api-key: $SKILLSAWARE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"tenant_id":"skillsaware","skill_code":"TEST","skill_name":"Test","skill_description":"Test","claimant_name":"Test","claimant_email":"test@example.com"}'
```

### S3 Upload Fails

**Possible causes:**
- AWS credentials incorrect
- S3 bucket doesn't exist
- IAM permissions insufficient

**Solutions:**
```bash
# Verify AWS credentials
aws sts get-caller-identity

# Verify bucket exists
aws s3 ls s3://your-bucket-name/

# Test S3 permissions
aws s3 cp test.txt s3://your-bucket-name/test.txt
```

### Webhook Not Delivered

**Possible causes:**
- Webhook URL not configured
- Webhook endpoint not accessible
- S3 upload failed (webhooks only sent after successful S3 upload)

**Solutions:**
- Check `SKILLSAWARE_WEBHOOK_URL` is set
- Verify webhook endpoint is accessible
- Ensure S3 upload succeeded first

### Downloads Fail

**Possible causes:**
- JWT token expired
- Download endpoint has issues
- Network connectivity problems

**Solutions:**
- Check server logs for errors
- Verify download URLs are accessible
- Test download URLs manually in browser

## Test Data

The test uses the following data (you can modify `test-production-workflow.js` to change it):

- **Skill Code:** `TEST-PROD-{timestamp}` (unique per test run)
- **Skill Name:** "Production Test Skill"
- **Claimant:** Test Claimant (test-claimant@example.com)
- **Endorser:** Test Endorser (test-endorser@example.com)
- **Evidence URLs:** https://example.com/evidence1, https://example.com/evidence2

## Next Steps

After successful test:

1. ✅ Verify files in S3 bucket
2. ✅ Check webhook was received (if configured)
3. ✅ Download and inspect PDF certificate
4. ✅ Validate OBv3 JSON credential structure
5. ✅ Test with real user data

## Integration with CI/CD

You can integrate this test into your CI/CD pipeline:

```yaml
# Example GitHub Actions
- name: Test Production Workflow
  env:
    SKILLSAWARE_API_KEY: ${{ secrets.SKILLSAWARE_API_KEY }}
    AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
    AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    AWS_REGION: us-east-1
    S3_BUCKET: ${{ secrets.S3_BUCKET }}
  run: |
    node test-production-workflow.js https://your-production-domain.com
```

## See Also

- [TESTING.md](./TESTING.md) - Comprehensive testing scenarios
- [README.md](./README.md) - System overview and API documentation
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide

