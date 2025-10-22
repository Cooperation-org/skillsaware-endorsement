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
                                          Upload to S3
                                          Send webhook ──▶ Your Database
```

## 🔧 Configuration

### Default Skill

The form is pre-populated with:
- **Skill Code**: `ICTDSN403`
- **Skill Name**: "Apply innovative thinking and practices in digital environments"

You can modify these defaults in `app/page.tsx`:

```typescript
const [formData, setFormData] = useState({
  skill_code: 'YOUR_SKILL_CODE',
  skill_name: 'Your Skill Name',
  // ...
});
```

### Connecting to Production

Update `.env.local` with your production values:

```bash
ENDORSEMENT_API_URL=https://your-endorsement-system.vercel.app
ENDORSEMENT_API_KEY=your-production-api-key
```

## 📁 Project Structure

```
endorsement-client/
├── app/
│   ├── api/
│   │   └── create-claim/
│   │       └── route.ts       # Proxy to endorsement API
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
