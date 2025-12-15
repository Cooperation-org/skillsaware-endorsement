\*\*\*\*# Deployment Guide - SkillsAware Endorsement System

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

### Option A: IAM Roles (Recommended for AWS Deployments)

**For AWS Lambda, ECS, or EC2 with IAM roles:**

When deploying on AWS, use IAM roles instead of access keys for better security. The application will automatically use the IAM role credentials.

```bash
# No AWS_ACCESS_KEY_ID or AWS_SECRET_ACCESS_KEY needed!
# AWS_REGION still required
AWS_REGION=us-east-1
S3_BUCKET=skillsaware-artifacts
S3_PREFIX=endorsements

# Optional: AWS SES for email notifications
# Uses IAM role automatically
SES_FROM_EMAIL=noreply@skillsaware.com
SES_FROM_NAME=SkillsAware

# Optional: Webhook notifications
SKILLSAWARE_WEBHOOK_URL=https://your-webhook-endpoint.com/webhook
SKILLSAWARE_WEBHOOK_SECRET=your-webhook-secret

# Optional: Branding
BRAND_LOGO_URL=/logo/skillsaware-logo.svg
BRAND_PRIMARY_COLOR=#0B5FFF

# Optional: Application URL (for magic links)
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Optional: JWT expiry (defaults to 7 days)
JWT_EXPIRY_DAYS=7
```

**Benefits:**

- More secure (no credentials in environment variables)
- Automatic credential rotation
- No risk of credential leakage
- AWS best practice

### Option B: Access Keys (For Non-AWS Deployments or Development)

**For Vercel, Netlify, or local development:**

```bash
# Optional: S3 for archival storage and webhook integration
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
S3_BUCKET=skillsaware-artifacts
S3_PREFIX=endorsements

# Optional: AWS SES for email notifications
# Note: Uses same AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY as S3
SES_FROM_EMAIL=noreply@skillsaware.com
SES_FROM_NAME=SkillsAware

# Optional: Webhook notifications
SKILLSAWARE_WEBHOOK_URL=https://your-webhook-endpoint.com/webhook
SKILLSAWARE_WEBHOOK_SECRET=your-webhook-secret

# Optional: Branding
BRAND_LOGO_URL=/logo/skillsaware-logo.svg
BRAND_PRIMARY_COLOR=#0B5FFF

# Optional: Application URL (for magic links)
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Optional: JWT expiry (defaults to 7 days)
JWT_EXPIRY_DAYS=7
```

**Note:** Access keys are less secure than IAM roles. Use only when IAM roles are not available.

### AWS Secrets Management

For sensitive values like `JWT_SECRET` and `SKILLSAWARE_API_KEY`, consider using AWS secrets management:

**AWS Systems Manager Parameter Store:**

```bash
# Store secrets
aws ssm put-parameter --name /skillsaware/jwt-secret \
  --value "your-secret-here" --type SecureString

aws ssm put-parameter --name /skillsaware/api-key \
  --value "your-api-key" --type SecureString

# Reference in Lambda/ECS (see deployment sections below)
# JWT_SECRET: ${ssm:/skillsaware/jwt-secret}
# SKILLSAWARE_API_KEY: ${ssm:/skillsaware/api-key}
```

**AWS Secrets Manager:**

```bash
# Create secret
aws secretsmanager create-secret \
  --name skillsaware/secrets \
  --secret-string '{"jwt_secret":"...","api_key":"..."}'

# Reference in Lambda/ECS
# Use AWS SDK to retrieve at runtime
```

## AWS SES Configuration

### Setting Up AWS SES for Email Notifications

The system uses AWS SES to send automatic email notifications to endorsers when endorsement links are generated.

#### Step 1: Verify Email Address or Domain

**Option A: Verify Single Email (Development/Testing)**

1. Go to AWS SES Console → Verified identities
2. Click "Create identity"
3. Select "Email address"
4. Enter your sender email (e.g., `noreply@skillsaware.com`)
5. Check your email and click verification link

**Option B: Verify Domain (Production)**

1. Go to AWS SES Console → Verified identities
2. Click "Create identity"
3. Select "Domain"
4. Enter your domain (e.g., `skillsaware.com`)
5. Add DNS records to your domain's DNS provider:
   - CNAME records for DKIM
   - TXT record for domain verification
6. Wait for verification (can take up to 72 hours)

#### Step 2: Request Production Access (If Needed)

By default, AWS SES runs in "Sandbox mode" which only allows sending to verified email addresses.

**To send to any email address:**

1. Go to AWS SES Console → Account dashboard
2. Click "Request production access"
3. Fill out the form explaining your use case
4. Wait for approval (usually 24-48 hours)

**Sandbox Mode Limitations:**

- Can only send to verified email addresses
- Limited to 200 emails/day
- Limited to 1 email/second

**Production Mode:**

- Can send to any email address
- Higher sending limits (request increase if needed)
- Better deliverability

#### Step 3: Configure IAM Permissions

### For IAM Roles (AWS Lambda, ECS, EC2)

**Lambda Execution Role or ECS Task Role:**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["ses:SendEmail", "ses:SendRawEmail"],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject"],
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    },
    {
      "Effect": "Allow",
      "Action": ["ssm:GetParameter", "ssm:GetParameters"],
      "Resource": "arn:aws:ssm:*:*:parameter/skillsaware/*"
    },
    {
      "Effect": "Allow",
      "Action": ["secretsmanager:GetSecretValue"],
      "Resource": "arn:aws:secretsmanager:*:*:secret:skillsaware/*"
    },
    {
      "Effect": "Allow",
      "Action": ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"],
      "Resource": "arn:aws:logs:*:*:*"
    }
  ]
}
```

**Or use AWS managed policies (less secure, broader permissions):**

- `AmazonSESFullAccess` (for SES)
- `AmazonS3FullAccess` (for S3) - or create custom policy with only PutObject
- `CloudWatchLogsFullAccess` (for logging)

### For IAM Users (Access Keys Approach)

**IAM User Policy:**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["ses:SendEmail", "ses:SendRawEmail"],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject"],
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

**Or use AWS managed policies:**

- `AmazonSESFullAccess` (for SES)
- `AmazonS3FullAccess` (for S3) - or create custom policy with only PutObject

**Note:** IAM roles are preferred over IAM users for AWS deployments as they are more secure and follow AWS best practices.

#### Step 4: Set Environment Variables

**For IAM Roles (AWS Lambda/ECS):**

No access keys needed! The IAM role provides credentials automatically.

```bash
# Only these are needed
AWS_REGION=us-east-1
SES_FROM_EMAIL=noreply@skillsaware.com  # Must be verified in SES
SES_FROM_NAME=SkillsAware
```

**For Access Keys (Vercel/Netlify/Local):**

```bash
# AWS credentials used for both S3 and SES
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1

# SES Configuration
SES_FROM_EMAIL=noreply@skillsaware.com  # Must be verified in SES
SES_FROM_NAME=SkillsAware
```

#### Step 5: Test Email Sending

1. Start your development server: `npm run dev`
2. Create a claim and generate an endorser link
3. Check the console logs for email sending status
4. Check the endorser's email inbox (and spam folder)

**Development Mode:**

- If AWS credentials are not configured, emails are logged to console instead of being sent
- Look for: `📧 [DEV] Email would be sent:` in console output

#### Troubleshooting Email Issues

**Email not received:**

- Check AWS SES console → Sending statistics for bounces/complaints
- Verify sender email is verified in SES
- Check spam folder
- Verify IAM permissions include `ses:SendEmail`
- Check CloudWatch logs for SES errors

**Email sending fails silently:**

- System logs errors but doesn't fail the request
- Check application logs for: `❌ Failed to send email:`
- Verify AWS credentials are correct
- Verify SES is not in sandbox mode (if sending to unverified addresses)

**Rate Limits:**

- Sandbox: 200 emails/day, 1 email/second
- Production: Default 50,000 emails/day (can request increase)
- If hitting limits, implement email queue or request limit increase

## AWS Deployment Options

The following sections provide comprehensive guides for deploying the SkillsAware Endorsement System on AWS. Choose the deployment method that best fits your needs:

- **AWS Lambda + API Gateway**: Serverless, auto-scaling, pay-per-use (Recommended)
- **AWS Amplify**: Simple Next.js hosting with automatic CI/CD
- **AWS ECS/Fargate**: Containerized deployment with more control
- **AWS EC2**: Traditional server deployment

## Deployment Options

### Option 1: AWS Lambda + API Gateway (Recommended - Serverless)

**Best for:** Serverless architecture, auto-scaling, pay-per-use, production deployments

**Prerequisites:**

- AWS CLI configured (`aws configure`)
- Serverless Framework installed OR AWS SAM CLI
- IAM permissions to create Lambda functions and API Gateway

#### Installation

**Option A: Using Serverless Framework**

```bash
# Install Serverless Framework globally
npm install -g serverless

# Or use npx (no global install needed)
npx serverless
```

**Option B: Using AWS SAM**

```bash
# Install AWS SAM CLI
# macOS
brew install aws-sam-cli

# Linux
pip install aws-sam-cli

# Windows
# Download from: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html
```

#### Create Deployment Configuration

**Serverless Framework (`serverless.yml`):**

```yaml
service: skillsaware-endorsement
frameworkVersion: '3'

provider:
  name: aws
  runtime: nodejs20.x
  region: us-east-1
  memorySize: 2048 # Required for PDF generation
  timeout: 30 # API Gateway max is 29s, but Lambda can be higher
  ephemeralStorageSize: 1024 # May need more for Chromium
  environment:
    NODE_ENV: production
    AWS_REGION: ${self:provider.region}
    S3_BUCKET: ${self:custom.s3Bucket}
    S3_PREFIX: endorsements
    SES_FROM_EMAIL: noreply@skillsaware.com
    SES_FROM_NAME: SkillsAware
    NEXT_PUBLIC_APP_URL: https://api.yourdomain.com
    JWT_EXPIRY_DAYS: 7
    # Secrets from Parameter Store
    JWT_SECRET: ${ssm:/skillsaware/jwt-secret~true}
    SKILLSAWARE_API_KEY: ${ssm:/skillsaware/api-key~true}
    # Optional
    BRAND_LOGO_URL: /logo/skillsaware-logo.svg
    BRAND_PRIMARY_COLOR: '#0B5FFF'
    SKILLSAWARE_WEBHOOK_URL: ${ssm:/skillsaware/webhook-url~true}
    SKILLSAWARE_WEBHOOK_SECRET: ${ssm:/skillsaware/webhook-secret~true}
  iamRoleStatements:
    - Effect: Allow
      Action:
        - s3:PutObject
      Resource: arn:aws:s3:::${self:custom.s3Bucket}/*
    - Effect: Allow
      Action:
        - ses:SendEmail
        - ses:SendRawEmail
      Resource: '*'
    - Effect: Allow
      Action:
        - ssm:GetParameter
        - ssm:GetParameters
      Resource: arn:aws:ssm:${self:provider.region}:*:parameter/skillsaware/*
    - Effect: Allow
      Action:
        - logs:CreateLogGroup
        - logs:CreateLogStream
        - logs:PutLogEvents
      Resource: '*'

custom:
  s3Bucket: skillsaware-artifacts

functions:
  api:
    handler: index.handler
    events:
      - http:
          path: /{proxy+}
          method: ANY
          cors: true
      - http:
          path: /
          method: ANY
          cors: true

plugins:
  - serverless-nextjs-plugin
```

**Note:** For Next.js on Lambda, you'll need to use a Next.js serverless adapter. Consider using `@sls-next/lambda-at-edge` or similar.

#### Store Secrets in Parameter Store

```bash
# Store JWT secret
aws ssm put-parameter \
  --name /skillsaware/jwt-secret \
  --value "your-super-secret-jwt-key-min-256-bits" \
  --type SecureString \
  --region us-east-1

# Store API key
aws ssm put-parameter \
  --name /skillsaware/api-key \
  --value "your-api-key" \
  --type SecureString \
  --region us-east-1

# Optional: Store webhook configuration
aws ssm put-parameter \
  --name /skillsaware/webhook-url \
  --value "https://your-webhook-endpoint.com/webhook" \
  --type SecureString \
  --region us-east-1

aws ssm put-parameter \
  --name /skillsaware/webhook-secret \
  --value "your-webhook-secret" \
  --type SecureString \
  --region us-east-1
```

#### Deploy

```bash
# Build the application
npm install
npm run build

# Deploy with Serverless Framework
serverless deploy

# Or deploy with AWS SAM
sam build
sam deploy --guided
```

#### Configure Custom Domain

1. **Create API Gateway Custom Domain:**
   - Go to API Gateway → Custom domain names
   - Create domain: `api.yourdomain.com`
   - Configure SSL certificate (AWS Certificate Manager)
   - Map to your API Gateway stage

2. **Update Route 53:**
   - Create A record (alias) pointing to API Gateway custom domain

3. **Update Environment Variable:**
   - Set `NEXT_PUBLIC_APP_URL=https://api.yourdomain.com`

#### Important Considerations

**Lambda Limitations:**

- **Request Size:** API Gateway has 10MB limit
- **Timeout:** API Gateway max 29 seconds (Lambda can be higher, but API Gateway will timeout)
- **Memory:** Minimum 1024MB for PDF generation, recommended 2048MB
- **Ephemeral Storage:** Default 512MB, may need increase for Chromium
- **Cold Starts:** First request after idle period will be slower (~2-5 seconds)

**Mitigation Strategies:**

- Use provisioned concurrency to reduce cold starts (additional cost)
- Optimize bundle size
- Consider using Lambda@Edge for static assets
- Use CloudFront CDN for static files

#### Monitoring

**CloudWatch Logs:**

- Automatic log groups created: `/aws/lambda/skillsaware-endorsement-api`
- View logs: AWS Console → CloudWatch → Log groups

**CloudWatch Metrics:**

- Invocations, errors, duration, throttles
- Set up alarms for errors and high latency

**Example Alarm:**

```bash
aws cloudwatch put-metric-alarm \
  --alarm-name skillsaware-high-error-rate \
  --alarm-description "Alert when error rate exceeds 5%" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 1
```

### Option 2: AWS Amplify

**Best for:** Simple Next.js deployments, automatic CI/CD, preview deployments

**Prerequisites:**

- AWS account
- Git repository (GitHub, GitLab, Bitbucket, or CodeCommit)
- Amplify CLI installed

#### Installation

```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Configure Amplify
amplify configure
```

#### Setup

```bash
# Initialize Amplify in your project
amplify init

# Follow prompts:
# - Project name: skillsaware-endorsement
# - Environment: production (or dev, staging)
# - Default editor: your preferred editor
# - App type: javascript
# - Framework: react
# - Source directory: ./
# - Distribution directory: .next
# - Build command: npm run build
# - Start command: npm start
```

#### Add Hosting

```bash
# Add hosting
amplify add hosting

# Select: Hosting with Amplify Console
# Follow prompts to connect your Git repository
```

#### Configure Environment Variables

1. **In Amplify Console:**
   - Go to App Settings → Environment variables
   - Add all required variables:
     - `JWT_SECRET` (mark as secret)
     - `SKILLSAWARE_API_KEY` (mark as secret)
     - `AWS_REGION`
     - `S3_BUCKET`
     - `S3_PREFIX`
     - `SES_FROM_EMAIL`
     - `SES_FROM_NAME`
     - `NEXT_PUBLIC_APP_URL`
     - Optional: `BRAND_LOGO_URL`, `BRAND_PRIMARY_COLOR`, etc.

2. **Or use AWS Secrets Manager:**
   - Store secrets in Secrets Manager
   - Reference in build settings using AWS SDK

#### Configure IAM Role

Amplify creates a service role automatically. Ensure it has permissions for:

- S3: PutObject
- SES: SendEmail, SendRawEmail
- Secrets Manager: GetSecretValue (if using)

#### Deploy

```bash
# Deploy to Amplify
amplify publish

# Or push to Git (triggers automatic build)
git push origin main
```

**Automatic Features:**

- Builds on every Git push
- Preview deployments for pull requests
- Automatic SSL certificates
- Custom domain support
- CDN distribution

#### Custom Domain

1. **In Amplify Console:**
   - Go to App Settings → Domain management
   - Add custom domain
   - Follow DNS verification steps
   - SSL certificate managed automatically

#### Cost Considerations

- **Build minutes:** $0.01 per minute
- **Hosting:** Free tier includes 100GB transfer/month
- **Estimated:** $0-10/month for typical usage
- **Scales automatically** with traffic

### Option 3: AWS ECS/Fargate (Containerized)

**Best for:** Containerized deployments, more control, auto-scaling

**Prerequisites:**

- Docker installed
- AWS CLI configured
- ECR repository created

#### Create Dockerfile

Create `Dockerfile` in project root:

```dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

**Update `next.config.ts` for standalone output:**

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone' // Required for Docker
  /* other config options */
}

export default nextConfig
```

#### Build and Push to ECR

```bash
# Create ECR repository
aws ecr create-repository --repository-name skillsaware-endorsement

# Get login token
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Build image
docker build -t skillsaware-endorsement .

# Tag image
docker tag skillsaware-endorsement:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/skillsaware-endorsement:latest

# Push image
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/skillsaware-endorsement:latest
```

#### Create ECS Task Definition

```json
{
  "family": "skillsaware-endorsement",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "executionRoleArn": "arn:aws:iam::<account-id>:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::<account-id>:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "skillsaware-endorsement",
      "image": "<account-id>.dkr.ecr.us-east-1.amazonaws.com/skillsaware-endorsement:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "AWS_REGION",
          "value": "us-east-1"
        },
        {
          "name": "S3_BUCKET",
          "value": "skillsaware-artifacts"
        },
        {
          "name": "S3_PREFIX",
          "value": "endorsements"
        },
        {
          "name": "SES_FROM_EMAIL",
          "value": "noreply@skillsaware.com"
        },
        {
          "name": "SES_FROM_NAME",
          "value": "SkillsAware"
        },
        {
          "name": "NEXT_PUBLIC_APP_URL",
          "value": "https://api.yourdomain.com"
        }
      ],
      "secrets": [
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:ssm:us-east-1:<account-id>:parameter/skillsaware/jwt-secret"
        },
        {
          "name": "SKILLSAWARE_API_KEY",
          "valueFrom": "arn:aws:ssm:us-east-1:<account-id>:parameter/skillsaware/api-key"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/skillsaware-endorsement",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

#### Create ECS Service

```bash
# Create ECS cluster
aws ecs create-cluster --cluster-name skillsaware-cluster

# Create service
aws ecs create-service \
  --cluster skillsaware-cluster \
  --service-name skillsaware-endorsement \
  --task-definition skillsaware-endorsement \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:us-east-1:<account-id>:targetgroup/skillsaware-tg/xxx,containerName=skillsaware-endorsement,containerPort=3000"
```

#### Configure Application Load Balancer

1. **Create Target Group:**
   - Port: 3000
   - Protocol: HTTP
   - Health check: `/api/health` (if implemented) or `/`

2. **Create Load Balancer:**
   - Type: Application Load Balancer
   - Scheme: Internet-facing
   - Listeners: HTTP (80) → HTTPS (443)
   - SSL certificate from Certificate Manager

3. **Configure Auto-Scaling:**
   - Min capacity: 1
   - Max capacity: 10
   - Target CPU: 70%
   - Target memory: 80%

#### Cost Considerations

- **vCPU:** $0.04048 per hour
- **Memory:** $0.004445 per GB per hour
- **For 1 task (1 vCPU, 2GB):** ~$0.049/hour = ~$35/month
- **With auto-scaling:** Scales based on demand

### Option 4: AWS EC2 (Traditional Server)

**Best for:** Full control, custom configurations, cost-effective for steady traffic

**Prerequisites:**

- EC2 instance (Ubuntu 22.04 LTS recommended)
- SSH access
- Security group configured (ports 22, 80, 443)

#### Instance Requirements

- **Instance Type:** t3.medium or larger (2 vCPU, 4GB RAM minimum)
- **Storage:** 20GB+ SSD
- **OS:** Ubuntu 22.04 LTS

#### Setup Server

```bash
# SSH into EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Clone repository
git clone https://github.com/your-org/skillsaware-endorsement.git
cd skillsaware-endorsement

# Install dependencies
npm install --production

# Build application
npm run build
```

#### Configure Environment Variables

```bash
# Create .env file
sudo nano .env

# Add all environment variables
JWT_SECRET=your-secret
SKILLSAWARE_API_KEY=your-api-key
AWS_REGION=us-east-1
# ... etc
```

#### Setup PM2

```bash
# Start application with PM2
pm2 start npm --name "skillsaware" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the command it outputs
```

#### Configure Nginx Reverse Proxy

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/skillsaware

# Add configuration:
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/skillsaware /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

#### Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d api.yourdomain.com

# Auto-renewal (already configured by certbot)
```

#### Configure IAM Role for EC2

1. **Create IAM Role:**
   - Go to IAM → Roles → Create role
   - Select: EC2
   - Attach policies: S3, SES permissions (or custom policy)
   - Name: `EC2-SkillsAware-Role`

2. **Attach to EC2 Instance:**
   - Go to EC2 → Instances
   - Select instance → Actions → Security → Modify IAM role
   - Select the role created above

3. **Remove Access Keys:**
   - No need for `AWS_ACCESS_KEY_ID` or `AWS_SECRET_ACCESS_KEY` in `.env`
   - Application will use IAM role automatically

#### Systemd Service (Alternative to PM2)

```bash
# Create systemd service file
sudo nano /etc/systemd/system/skillsaware.service

# Add:
[Unit]
Description=SkillsAware Endorsement System
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/skillsaware-endorsement
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm start
Restart=always

[Install]
WantedBy=multi-user.target

# Enable and start
sudo systemctl enable skillsaware
sudo systemctl start skillsaware
```

#### Cost Considerations

- **t3.medium:** ~$0.0416/hour = ~$30/month
- **t3.large:** ~$0.0832/hour = ~$60/month
- **Data transfer:** First 100GB free, then $0.09/GB
- **Estimated:** $30-100/month depending on instance size and traffic

### Option 5: Vercel (Alternative - Serverless)

**Perfect for:** Quick deployment, automatic CI/CD, no AWS account needed

**Prerequisites:**

- Vercel account (free tier available)
- Vercel CLI installed

#### Quick Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set required environment variables
vercel env add JWT_SECRET production
vercel env add SKILLSAWARE_API_KEY production
```

#### With S3 and SES

```bash
# After basic deployment, add AWS variables:
vercel env add AWS_ACCESS_KEY_ID production
vercel env add AWS_SECRET_ACCESS_KEY production
vercel env add AWS_REGION production
vercel env add S3_BUCKET production
vercel env add S3_PREFIX production
vercel env add SES_FROM_EMAIL production
vercel env add SES_FROM_NAME production

# Redeploy
vercel --prod
```

**How it works:**

- PDFs and JSON files uploaded to S3 **during submission** (not on-demand)
- Both files uploaded in parallel for faster processing
- Email sent to endorser when link is generated (if SES configured)
- Webhook notification sent after successful S3 upload
- If S3 upload fails, system falls back to direct delivery (base64)
- Email failures are logged but don't break the request flow
- Webhook only sent if S3 upload succeeds
- Base64 downloads still available as backup

**Cost:**

- Free tier: 100GB bandwidth, 100 serverless function executions/day
- Pro: $20/month for higher limits
- Estimated: $0-20/month

### Option 6: Local Development

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

### General Issues

#### Files don't download

**Solution:** The success page now has two download methods:

1. Primary: Direct base64 download (button click)
2. Fallback: Download URL (link)

If one fails, try the other.

#### S3 upload errors in logs

**Expected behavior** if S3 not configured. System continues and delivers files directly.
Check logs for: `⚠️ S3 upload failed, continuing with base64 response`

#### Webhook not delivered

**Expected behavior** if:

- Webhook URL not configured
- S3 upload failed (webhook only sent after successful S3 upload)

#### JWT expired errors

**Solution:** Magic links expire after 7 days (default). Request a new claim.

### AWS-Specific Issues

#### Lambda Timeout Errors

**Symptoms:**

- 504 Gateway Timeout errors
- Requests taking > 29 seconds

**Solutions:**

- Increase Lambda timeout (but API Gateway max is 29s)
- Optimize PDF generation
- Use async processing for long operations
- Consider ECS for operations > 29 seconds
- Check CloudWatch logs for slow operations

#### API Gateway 413 Errors (Request Too Large)

**Symptoms:**

- 413 Payload Too Large errors
- Requests > 10MB

**Solutions:**

- Use S3 for large file uploads
- Stream large responses
- Compress request/response payloads
- Use CloudFront for static assets

#### Cold Start Performance Issues

**Symptoms:**

- First request after idle period is slow (2-5 seconds)
- Subsequent requests are fast

**Solutions:**

- Use provisioned concurrency (additional cost)
- Keep functions warm with scheduled pings
- Optimize bundle size
- Use Lambda@Edge for static assets
- Consider ECS for always-on workloads

#### IAM Permission Errors

**Symptoms:**

- `AccessDenied` errors
- S3 upload failures
- SES email sending failures

**Solutions:**

- Verify IAM role has correct permissions
- Check resource ARNs in policy
- Verify IAM role is attached to Lambda/ECS/EC2
- Test permissions with AWS CLI:
  ```bash
  aws s3 cp test.txt s3://your-bucket/test.txt
  aws ses send-email --from test@example.com --to test@example.com --subject "Test" --text "Test"
  ```

#### Parameter Store Access Errors

**Symptoms:**

- `ParameterNotFound` errors
- Secrets not loading

**Solutions:**

- Verify parameter exists: `aws ssm get-parameter --name /skillsaware/jwt-secret`
- Check IAM role has `ssm:GetParameter` permission
- Verify parameter region matches Lambda region
- Check parameter name matches exactly (case-sensitive)

#### VPC Connectivity Issues

**Symptoms:**

- Timeouts when accessing S3/SES
- Network errors

**Solutions:**

- Add VPC endpoint for S3 (if using private subnets)
- Verify security group allows outbound HTTPS (443)
- Check NAT Gateway configuration (if using private subnets)
- Consider removing VPC if not needed (reduces cold starts)

#### CloudWatch Logs Not Appearing

**Symptoms:**

- No logs in CloudWatch
- Logs delayed

**Solutions:**

- Verify IAM role has `logs:CreateLogGroup`, `logs:CreateLogStream`, `logs:PutLogEvents`
- Check log group name matches configuration
- Verify log retention settings
- Check CloudWatch service quotas

#### High Costs

**Symptoms:**

- Unexpected AWS bills
- Costs higher than expected

**Solutions:**

- Review Cost Explorer for cost breakdown
- Check for provisioned concurrency (if not needed)
- Review log retention (set to 7-30 days)
- Check for orphaned resources
- Set up cost budgets and alerts
- Consider reserved instances for EC2 (if steady traffic)

#### ECS Tasks Not Starting

**Symptoms:**

- Tasks in PENDING state
- Tasks failing to start

**Solutions:**

- Check task definition for errors
- Verify IAM roles are correct
- Check security group allows traffic
- Verify ECR image exists and is accessible
- Check CloudWatch logs for errors
- Verify subnet and VPC configuration

#### EC2 Application Not Starting

**Symptoms:**

- Application not running after reboot
- PM2/systemd service not starting

**Solutions:**

- Verify PM2 startup: `pm2 startup` and follow instructions
- Check systemd service: `sudo systemctl status skillsaware`
- Verify service is enabled: `sudo systemctl enable skillsaware`
- Check logs: `journalctl -u skillsaware -f`
- Verify environment variables are set correctly

## Production Checklist

### General Requirements

- [ ] Set strong `JWT_SECRET` (min 256 bits)
- [ ] Set production `SKILLSAWARE_API_KEY`
- [ ] Configure custom domain in `NEXT_PUBLIC_APP_URL`
- [ ] Optional: Configure S3 credentials for archival
- [ ] Optional: Configure webhook URL and secret
- [ ] Optional: Set brand logo and colors
- [ ] Test complete flow end-to-end
- [ ] Verify downloads work on mobile devices
- [ ] Check PDF includes all evidence URLs

### AWS-Specific Checklist

**For Lambda/ECS:**

- [ ] Configure IAM roles (no access keys)
- [ ] Store secrets in Parameter Store/Secrets Manager
- [ ] Set appropriate memory (2048MB+ for PDF generation)
- [ ] Configure timeout (30s for Lambda)
- [ ] Set up CloudWatch alarms (errors, latency, throttling)
- [ ] Configure log retention (7-30 days)
- [ ] Set up custom domain (Route 53 + API Gateway/ALB)
- [ ] Configure SSL certificate (Certificate Manager)
- [ ] Test cold start performance
- [ ] Monitor costs in Cost Explorer

**For ECS:**

- [ ] Configure task execution role
- [ ] Configure task role (for S3/SES)
- [ ] Set up Application Load Balancer
- [ ] Configure auto-scaling (min/max capacity)
- [ ] Set up health checks
- [ ] Configure VPC (if needed)
- [ ] Set up CloudWatch container insights

**For EC2:**

- [ ] Attach IAM role to instance
- [ ] Configure security groups (ports 22, 80, 443)
- [ ] Set up Nginx reverse proxy
- [ ] Configure SSL certificate (Let's Encrypt)
- [ ] Set up PM2 or systemd service
- [ ] Configure auto-start on boot
- [ ] Set up CloudWatch agent for logs
- [ ] Configure automatic security updates

**For All AWS Deployments:**

- [ ] Verify SES email sending works
- [ ] Test S3 uploads (if configured)
- [ ] Verify webhook delivery (if configured)
- [ ] Set up cost budgets and alerts
- [ ] Review IAM permissions (principle of least privilege)
- [ ] Enable CloudTrail for audit logging
- [ ] Configure backup strategy (if needed)

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

## AWS-Specific Considerations

### Cold Starts (Lambda)

**Impact:**

- First request after idle period: 2-5 seconds slower
- Subsequent requests: Normal speed
- More noticeable with larger memory allocations

**Mitigation:**

- Use provisioned concurrency (additional cost: ~$0.015/hour per GB)
- Keep functions warm with scheduled pings
- Optimize bundle size
- Use Lambda@Edge for static assets

### Request Size Limits

**API Gateway:**

- Maximum request size: 10MB
- Maximum response size: 10MB
- If exceeded: 413 Payload Too Large error

**Solutions:**

- Use S3 for large file uploads
- Stream large responses
- Use CloudFront for static assets

### Timeout Limits

**API Gateway:**

- Maximum timeout: 29 seconds
- If Lambda exceeds: 504 Gateway Timeout error

**Lambda:**

- Configurable up to 15 minutes
- But API Gateway will timeout at 29 seconds

**Solutions:**

- Optimize PDF generation
- Use async processing for long operations
- Consider ECS for operations > 29 seconds

### Memory Requirements

**PDF Generation:**

- Minimum: 1024MB
- Recommended: 2048MB
- Chromium needs significant memory

**Cost Impact:**

- Higher memory = higher cost per request
- Balance memory vs execution time

### Ephemeral Storage

**Lambda Default:**

- 512MB ephemeral storage
- May need increase for Chromium

**Configuration:**

```yaml
provider:
  ephemeralStorageSize: 1024 # In MB
```

### VPC Configuration

**When Needed:**

- Private S3 buckets (VPC endpoint)
- RDS databases
- Private subnets

**Considerations:**

- VPC adds cold start latency (~1-2 seconds)
- Additional ENI costs
- More complex networking

**Recommendation:**

- Avoid VPC unless necessary
- Use public S3 buckets with IAM policies
- Use Parameter Store/Secrets Manager instead of RDS

### CloudFront CDN

**Benefits:**

- Faster static asset delivery
- Lower latency globally
- Custom domain with SSL
- DDoS protection

**Setup:**

1. Create CloudFront distribution
2. Point to API Gateway or ALB
3. Configure custom domain
4. Set up SSL certificate (Certificate Manager)

### Route 53 DNS

**Configuration:**

- Create hosted zone for your domain
- Add A record (alias) to API Gateway/ALB/CloudFront
- Configure health checks

### Certificate Manager

**SSL Certificates:**

- Free SSL certificates
- Automatic renewal
- Use for API Gateway, ALB, CloudFront

## AWS Monitoring & Logging

### CloudWatch Logs

**Automatic Logging:**

- Lambda: `/aws/lambda/<function-name>`
- ECS: `/ecs/<cluster-name>/<service-name>`
- EC2: Configure in application or use CloudWatch agent

**Log Retention:**

- Default: Never expire (costs money)
- Recommended: 7-30 days
- Configure in Log Groups → Edit retention

**View Logs:**

```bash
# Using AWS CLI
aws logs tail /aws/lambda/skillsaware-endorsement-api --follow

# Or in Console
# CloudWatch → Log groups → Select group → View logs
```

### CloudWatch Metrics

**Automatic Metrics:**

- Lambda: Invocations, errors, duration, throttles
- API Gateway: Count, latency, 4xx/5xx errors
- ECS: CPU utilization, memory utilization
- ALB: Request count, target response time

**Custom Metrics:**

```typescript
// Example: Track PDF generation time
import { CloudWatch } from '@aws-sdk/client-cloudwatch'

const cloudwatch = new CloudWatch({ region: 'us-east-1' })

await cloudwatch.putMetricData({
  Namespace: 'SkillsAware',
  MetricData: [
    {
      MetricName: 'PDFGenerationTime',
      Value: generationTime,
      Unit: 'Milliseconds',
      Timestamp: new Date()
    }
  ]
})
```

### CloudWatch Alarms

**Recommended Alarms:**

1. **High Error Rate:**

```bash
aws cloudwatch put-metric-alarm \
  --alarm-name skillsaware-high-error-rate \
  --alarm-description "Alert when error rate exceeds 5%" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 1
```

2. **High Latency:**

```bash
aws cloudwatch put-metric-alarm \
  --alarm-name skillsaware-high-latency \
  --alarm-description "Alert when p99 latency exceeds 5 seconds" \
  --metric-name Duration \
  --namespace AWS/Lambda \
  --statistic p99 \
  --period 300 \
  --threshold 5000 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2
```

3. **Throttling:**

```bash
aws cloudwatch put-metric-alarm \
  --alarm-name skillsaware-throttling \
  --alarm-description "Alert when Lambda throttling occurs" \
  --metric-name Throttles \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 60 \
  --threshold 1 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 1
```

### X-Ray Tracing (Optional)

**Enable X-Ray:**

- Lambda: Add `AWSXRayDaemonWriteAccess` to execution role
- API Gateway: Enable X-Ray tracing in stage settings

**Benefits:**

- End-to-end request tracing
- Performance bottleneck identification
- Service map visualization

**Cost:**

- First 100,000 traces: Free
- Additional: $5 per 1 million traces

### Cost Monitoring

**AWS Cost Explorer:**

- View costs by service
- Set up budgets
- Create cost alerts

**Recommended Budgets:**

- Monthly budget: $50-100
- Alert at 80% and 100%
- Track Lambda, API Gateway, ECS costs

## Cost Analysis

### AWS Lambda + API Gateway

**Pricing:**

- **Lambda:**
  - Requests: $0.20 per 1M requests
  - Compute: $0.0000166667 per GB-second
  - Example: 100K requests/month, 2GB, 1s avg = ~$0.20 + $3.33 = **$3.53/month**
- **API Gateway:**
  - REST API: $3.50 per 1M requests
  - Example: 100K requests = **$0.35/month**
- **Total:** ~$4-10/month for moderate usage

**With Provisioned Concurrency:**

- Additional: $0.015 per GB-hour
- Example: 2GB, always warm = ~$22/month
- **Total:** ~$26-30/month

### AWS Amplify

**Pricing:**

- **Build minutes:** $0.01 per minute
- **Hosting:** Free tier (100GB transfer/month)
- **Additional transfer:** $0.15 per GB
- **Estimated:** $0-10/month for typical usage

### AWS ECS Fargate

**Pricing:**

- **vCPU:** $0.04048 per hour
- **Memory:** $0.004445 per GB per hour
- **Example:** 1 task, 1 vCPU, 2GB, 24/7 = ~$0.049/hour = **~$35/month**
- **With auto-scaling:** Scales with demand, higher costs during peak

### AWS EC2

**Pricing:**

- **t3.medium (2 vCPU, 4GB):** $0.0416/hour = **~$30/month**
- **t3.large (2 vCPU, 8GB):** $0.0832/hour = **~$60/month**
- **Data transfer:** First 100GB free, then $0.09/GB
- **Estimated:** $30-100/month depending on instance size

### Additional AWS Services

**S3 Storage:**

- Storage: $0.023 per GB/month
- PUT requests: $0.005 per 1,000 requests
- GET requests: $0.0004 per 1,000 requests
- **Estimated:** $1-5/month for typical usage

**SES Email:**

- First 62,000 emails/month: Free (if from EC2)
- Additional: $0.10 per 1,000 emails
- **Estimated:** $0-5/month for typical usage

**CloudWatch:**

- Logs: $0.50 per GB ingested
- Metrics: First 10 metrics free, then $0.30 per metric
- **Estimated:** $1-5/month

### Comparison Table

| Deployment Option        | Monthly Cost (Low) | Monthly Cost (High) | Best For                        |
| ------------------------ | ------------------ | ------------------- | ------------------------------- |
| **Lambda + API Gateway** | $4                 | $30                 | Serverless, auto-scaling        |
| **AWS Amplify**          | $0                 | $10                 | Simple Next.js hosting          |
| **ECS Fargate**          | $35                | $200+               | Containerized, steady traffic   |
| **EC2**                  | $30                | $100                | Full control, predictable costs |
| **Vercel**               | $0                 | $20                 | Quick deployment, no AWS        |

**Note:** All costs are approximate and vary based on usage, region, and AWS pricing changes. Monitor costs in AWS Cost Explorer.

## Support

For issues or questions:

1. Check server logs for detailed error messages
2. Verify environment variables are set correctly
3. Test with simple workflow first
4. Check TESTING.md for test scenarios
