# SkillsAware Endorsement Client

A minimal Next.js client application to initiate the endorsement workflow by creating skill claims and generating magic links.

## 🎯 Purpose

This is a bare-minimum client that demonstrates how to:

- Create a skill claim via the endorsement system API
- Generate magic links for claimants
- Start the endorsement workflow

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- The endorsement system running (default: `http://localhost:3000`)

### Installation

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure environment variables:**

   Create a `.env.local` file in the root directory with:

   ```bash
   # URL of the endorsement system (no trailing slash)
   ENDORSEMENT_API_URL=http://localhost:3000

   # API key from the endorsement system
   ENDORSEMENT_API_KEY=8f33e3a4fd9322e89dc15300f603d91654d7eb38802f0cef0440ca292bf2c3f5
   ```

   > See `env.example.txt` for reference

3. **Run the development server:**

   ```bash
   npm run dev
   ```

4. **Open [http://localhost:3001](http://localhost:3001)** in your browser

   > Note: Runs on port 3001 by default to avoid conflicts with the endorsement system on port 3000

## 📋 Usage

1. Fill in the form with:
   - **Claimant Name**: The person claiming the skill
   - **Claimant Email**: Their email address
   - **Skill Code**: Pre-filled with `ICTDSN403`
   - **Skill Name**: Pre-filled with "Apply innovative thinking and practices in digital environments"
   - **Skill Description**: Pre-filled with a default description

2. Click **"Create Claim & Generate Magic Link"**

3. The system will:
   - Create a claim in the endorsement system
   - Generate a JWT-based magic link
   - Display the claimant link

4. Send the magic link to the claimant to start the endorsement workflow

## 🔗 Workflow

```
┌─────────────────┐
│  This Client    │ ─── POST /api/v1/claims ──▶ Endorsement System
│  (Create Claim) │                              │
└─────────────────┘                              │
                                                  ▼
                                          Generate Magic Link
                                                  │
                                                  ▼
                                          ┌──────────────────┐
                                          │ Claimant clicks  │
                                          │ magic link       │
                                          └──────────────────┘
                                                  │
                                                  ▼
                                          Submit narrative +
                                          Generate endorser link
                                                  │
                                                  ▼
                                          ┌──────────────────┐
                                          │ Endorser clicks  │
                                          │ magic link       │
                                          └──────────────────┘
                                                  │
                                                  ▼
                                          Submit endorsement
                                                  │
                                                  ▼
                                          Generate credentials
                                          (PDF + JSON)
                                                  │
                                                  ▼
                                          ┌─────────────────────────────┐
                                          │ Files delivered directly    │
                                          │ (base64 + download buttons) │
                                          │ ✨ No S3 required!          │
                                          └─────────────────────────────┘
                                                  │
                                          ┌───────┴───────┐
                                          ▼               ▼
                                    Optional:       Optional:
                                    Upload to S3    Send webhook
```

### ✨ What's New (2025-10-23)

The endorsement system now works **without requiring AWS S3**:

- ✅ Files delivered directly via base64 encoding
- ✅ Download buttons work on all devices (PC, mobile, tablets)
- ✅ Optional: S3 upload still available if configured
- ✅ Optional: Webhooks sent if S3 configured

## 🔧 Configuration

### Default Skill

The form is pre-populated with:

- **Skill Code**: `ICTDSN403`
- **Skill Name**: "Apply innovative thinking and practices in digital environments"

You can modify these defaults in `app/page.tsx`:

```typescript
const [formData, setFormData] = useState({
  skill_code: 'YOUR_SKILL_CODE',
  skill_name: 'Your Skill Name'
  // ...
})
```

### Connecting to Production

Update `.env.local` with your production values:

```bash
ENDORSEMENT_API_URL=https://your-endorsement-system.vercel.app
ENDORSEMENT_API_KEY=your-production-api-key
```

## 📦 SDK dependency

This app uses **skillsaware-endorsement-sdk** (see `../packages/endorsement-sdk`). It is installed via `file:../packages/endorsement-sdk` for local development. For production, install from NPM: `npm install skillsaware-endorsement-sdk`. Use `npm run build` for production builds (Turbopack may not resolve local `file:` packages; use `npm run build:turbo` only if the SDK is installed from NPM).

## 📁 Project Structure

```
endorsement-client/
├── app/
│   ├── api/
│   │   └── create-claim/
│   │       └── route.ts       # Uses SDK to create claim
│   ├── page.tsx                # Main form UI
│   └── layout.tsx              # Root layout
├── .env.local                  # Your config (create this)
├── env.example.txt             # Example config
├── package.json
└── README.md
```

## 🔐 Security Notes

- The API key is stored server-side only (in `.env.local`)
- The API route (`/api/create-claim`) proxies requests to hide credentials from the client
- Never commit `.env.local` to version control
- Use environment variables for production deployments

## 🐛 Troubleshooting

### "Failed to create claim"

- Ensure the endorsement system is running on `http://localhost:3000`
- Check that `ENDORSEMENT_API_KEY` matches the key in the endorsement system
- Verify the endorsement system is accepting requests

### Port conflicts

- This client runs on port 3000 by default
- If needed, specify a different port: `npm run dev -- -p 3001`

### CORS errors

- The endorsement system should allow requests from your client origin
- Check the endorsement system's CORS configuration

## 📝 License

Part of the SkillsAware Endorsement System

## 🤝 Related

- Main endorsement system: `../skillsaware-endorsement/`
- API Documentation: See the main system's README
