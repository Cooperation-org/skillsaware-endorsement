# SkillsAware Endorsement System - Quick Start Guide

This guide will help you get the SkillsAware OBv3 Endorsement System up and running quickly.

## Prerequisites

- Node.js 20+ installed
- npm or yarn package manager
- (Optional) AWS account for S3 and SES

## Step 1: Installation

```bash
# Clone the repository (if not already done)
cd skillsaware-endorsement

# Install dependencies
npm install
```

## Step 2: Environment Setup

Create a `.env.local` file in the root directory:

```bash
# Minimum required variables
JWT_SECRET=your-super-secret-jwt-key-min-256-bits
SKILLSAWARE_API_KEY=your-api-key-here

# Optional: S3 Storage
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
S3_BUCKET=skillsaware-endorsements
S3_PREFIX=endorsements

# Optional: Email Notifications (AWS SES)
SES_FROM_EMAIL=noreply@skillsaware.com
SES_FROM_NAME=SkillsAware

# Optional: Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Generate a secure JWT secret:**

```bash
# On Linux/Mac:
openssl rand -hex 32

# On Windows PowerShell:
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

## Step 3: Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3000`

## Step 4: Test the System

### Option A: Using the Web Interface

1. Open `http://localhost:3000` in your browser
2. Navigate to API documentation at `http://localhost:3000/api-docs`
3. Use the interactive Swagger UI to test endpoints

### Option B: Using curl

**1. Create a Claim:**

```bash
curl -X POST http://localhost:3000/api/v1/claims \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key-here" \
  -d '{
    "tenant_id": "skillsaware",
    "skill_code": "TEST001",
    "skill_name": "Test Skill",
    "skill_description": "A test skill for verification",
    "claimant_name": "Jane Doe",
    "claimant_email": "jane@example.com"
  }'
```

**2. Copy the `claimant_link` from the response and open it in your browser**

**3. Complete the claimant form:**

- Enter your skill narrative
- Enter endorser name and email
- Submit the form

**4. Check endorser email** (if SES configured) or use the endorser link directly

**5. Complete the endorser form:**

- Enter endorser credentials
- Enter endorsement statement
- Add evidence URLs (optional)
- Enter digital signature
- Check consent checkbox
- Submit

**6. Download the generated PDF and JSON files**

## Step 5: Verify Everything Works

### Checklist

- [ ] Server starts without errors
- [ ] Landing page loads at `http://localhost:3000`
- [ ] API docs accessible at `http://localhost:3000/api-docs`
- [ ] Can create a claim via API
- [ ] Claimant form accessible via magic link
- [ ] Can generate endorser link
- [ ] Email sent to endorser (if SES configured)
- [ ] Endorser form accessible
- [ ] Can submit endorsement
- [ ] PDF downloads successfully
- [ ] JSON downloads successfully
- [ ] PDF includes SkillsAware logo
- [ ] PDF includes all information (skill, claimant, endorser, evidence)
- [ ] JSON includes schema references
- [ ] JSON uses DID:Web format

## Common Issues

### Port Already in Use

If port 3000 is already in use:

```bash
# Kill the process using port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or change the port
PORT=3001 npm run dev
```

### PDF Generation Fails

**Development:**

- Ensure Chrome or Edge is installed
- System auto-detects Chrome/Edge on Windows
- Or set `CHROME_PATH` environment variable

**Production:**

- Uses `@sparticuz/chromium` automatically
- No additional setup needed

### Email Not Sending

**Development Mode:**

- Emails are logged to console instead of being sent
- Look for: `📧 [DEV] Email would be sent:` in console

**Production:**

- Verify AWS SES is configured
- Check sender email is verified in SES
- Verify IAM permissions include `ses:SendEmail`
- Check CloudWatch logs for errors

### S3 Upload Fails

**Expected Behavior:**

- System continues to work without S3
- Files delivered via base64/download URLs
- Check console for warnings (non-critical)

**To Enable S3:**

- Set AWS credentials
- Verify IAM permissions include `s3:PutObject`
- Verify bucket exists and is accessible

## Next Steps

- Read [README.md](./README.md) for comprehensive documentation
- Read [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment (includes AWS Lambda, Amplify, ECS, EC2, and Vercel options)
- Read [TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md) for testing guide
- **For AWS Deployment:**
  - See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed AWS deployment instructions
  - Use IAM roles instead of access keys (more secure)
  - Store secrets in Parameter Store or Secrets Manager
  - Configure AWS SES for email notifications
  - Set up S3 bucket for long-term storage
- Replace placeholder logo with actual SkillsAware logo

## Getting Help

- Check the troubleshooting section in README.md
- Review error messages in browser console and server logs
- Verify all environment variables are set correctly
- Check AWS service status if using S3/SES
