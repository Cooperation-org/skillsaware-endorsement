# SkillsAware OBv3 Endorsement System

## Brief Description

The **SkillsAware OBv3 Endorsement System** is a stateless, serverless platform that enables organizations to create, validate, and issue skill endorsement credentials. Built on modern web standards, it provides a complete workflow for skill claim creation, endorser validation, and Open Badges v3.0 credential generation—all without requiring a database.

## Key Features

- **Stateless Architecture**: JWT-based magic links eliminate the need for database storage, ensuring maximum privacy and security
- **Standards Compliant**: Fully compliant with Open Badges v3.0 and W3C Verifiable Credentials v2.0 standards
- **Serverless Ready**: Optimized for AWS Lambda, Vercel, and other serverless platforms
- **Dual Credential Output**: Generates both professional PDF certificates and JSON-LD credentials
- **Zero Data Retention**: No user data is stored—all context is embedded in secure, time-limited tokens
- **Optional Cloud Storage**: Works without S3, with optional integration for long-term archival and webhook notifications
- **Cross-Device Support**: File downloads work seamlessly on desktop, mobile, and tablet devices

## What It Does

1. **Claim Creation**: Allows claimants to create skill claims via API with secure magic links
2. **Endorser Validation**: Enables endorsers to validate and endorse skill claims through web forms
3. **Credential Generation**: Automatically generates Open Badges v3.0 compliant credentials (PDF + JSON-LD)
4. **Verification**: Provides PDF certificate verification with multi-layer cryptographic protection

## Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Authentication**: JWT tokens with jose library (Edge Runtime compatible)
- **Standards**: OBv3 v3.0.3, W3C Verifiable Credentials v2.0
- **PDF Generation**: Puppeteer-core + Chromium
- **Optional Storage**: AWS S3 for archival
- **Optional Email**: AWS SES for endorser notifications

## Use Cases

- Educational institutions issuing skill endorsements
- Professional certification programs
- Skills-based credentialing systems
- Workforce development platforms
- Any organization needing verifiable skill credentials

## Quick Stats

- **Zero Database Required**: Fully stateless operation
- **7-Day Token Expiry**: Configurable JWT expiration
- **99.9% Uptime**: Serverless architecture ensures high availability
- **Standards-Based**: Interoperable with any OBv3-compliant system
