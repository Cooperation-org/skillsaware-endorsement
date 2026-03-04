# skillsaware-endorsement-sdk

Client SDK for the **SkillsAware OBv3 Endorsement** API: create claims, generate endorser links, submit endorsements, verify credential PDFs, and download credentials (JSON/PDF) with minimal setup.

- **Zero runtime dependencies** – uses native `fetch`
- **TypeScript** – full type definitions included
- **ESM + CJS** – works in Node 18+ and browsers

## Table of contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [Quick start](#quick-start)
- [API reference](#api-reference)
- [Verify PDF](#verify-pdf)
- [Types](#types)
- [Errors](#errors)
- [Example: Next.js API route](#example-nextjs-api-route)
- [Backend testing with Postman](#backend-testing-with-postman)
- [Links](#links)
- [License](#license)

## Requirements

- **Node 18+** or a browser with `fetch`
- Endorsement backend URL and API key (from your SkillsAware / tenant setup)
- For CORS: if the backend is on another origin, ensure it allows your app’s origin

## Installation

```bash
npm install skillsaware-endorsement-sdk
```

## Configuration

You need:

- **Base URL** – endorsement backend (e.g. `https://skillsaware-endorsement.vercel.app` or `http://localhost:3000`)
- **API key** – for creating claims (keep server-side; do not expose in client bundles)

In a Next.js app, use env vars such as:

- `NEXT_PUBLIC_ENDORSEMENT_URL` – backend base URL (public if the client opens links to it)
- `SKILLSAWARE_API_KEY` or `ENDORSEMENT_API_KEY` – API key (server-only, e.g. in API routes or Server Actions)

## Quick start

**1. Create a claim (server-side with API key)**

```ts
import { createClaim } from 'skillsaware-endorsement-sdk'

const result = await createClaim(
  {
    baseUrl: process.env.NEXT_PUBLIC_ENDORSEMENT_URL!,
    apiKey: process.env.SKILLSAWARE_API_KEY!
  },
  {
    tenant_id: 'your-tenant',
    skill_code: 'SK-001',
    skill_name: 'Project Management',
    skill_description: 'Leads projects and delivers on time.',
    claimant_name: 'Jane Doe',
    claimant_email: 'jane@example.com'
  }
)

console.log(result.claim_id, result.claimant_link, result.expires_at)
```

**2. Open the claimant flow**

Send the user to `result.claimant_link` (same tab or new window):

```ts
window.open(result.claimant_link, '_blank')
// or
window.location.href = result.claimant_link
```

The claimant form is hosted on the backend; your app only needs to open the link.

**3. Full flow (claim → claimant → endorser → download)**

1. **Create claim** – `createClaim(config, payload)` → get `claim_id`, `claimant_link`.
2. **Claimant** – User opens `claimant_link`, completes the form, requests an endorser link (backend returns `endorser_link`).
3. **Endorser** – User opens `endorser_link`, completes the endorsement form, submits.
4. **Download** – After submit, the backend returns `downloads.json.url` and `downloads.pdf.url`. Use those, or build URLs with `getDownloadUrl(config, { claimId, type: 'json' | 'pdf' })` and the endorser token.

No need to reimplement claimant/endorser forms; they live on the backend.

## API reference

### Standalone functions

| Function | Description |
|----------|-------------|
| `createClaim(config, payload)` | Create a claim; returns `claim_id`, `claimant_link`, `expires_at`. Config: `{ baseUrl, apiKey }`. |
| `generateEndorserLink(config, payload)` | Generate endorser link. Config: `{ baseUrl, claimantToken }`. Payload: `{ claimId, claimant_narrative, endorser_name?, endorser_email? }`. |
| `submitEndorsement(config, payload)` | Submit endorsement. Config: `{ baseUrl, endorserToken }`. Payload: `{ endorsement_text, bona_fides, signature, evidence_urls? }`. |
| `getDownloadUrl(config, params)` | Build download URL. Config: `{ baseUrl, token }`. Params: `{ claimId, type: 'json' \| 'pdf' }`. Returns `{ url, filename }`. |
| `verifyPdf(config, pdfBytes, options?)` | Verify a credential PDF. Config: `{ baseUrl }`. Optional `{ skillCode, claimantName, endorserName }` for full signature verification. Returns basic + optional full verification and metadata. |

### Class API

```ts
import { EndorsementClient } from 'skillsaware-endorsement-sdk'

const client = new EndorsementClient(baseUrl, apiKey)
const claim = await client.createClaim(payload)
const endorser = await client.generateEndorserLink(claimId, claimantToken, payload)
const submitted = await client.submitEndorsement(endorserToken, payload)
const { url } = client.getDownloadUrl(claimId, 'pdf', endorserToken)

// Verify a downloaded PDF (basic + optional full signature check)
const verification = await client.verifyPdf(pdfBuffer, {
  skillCode: 'SK-001',
  claimantName: 'Jane Doe',
  endorserName: 'John Manager'
})
console.log(verification.basicVerification.valid, verification.fullVerification?.valid)
```

### Verify PDF

Use `verifyPdf(config, pdfBytes, options?)` or `client.verifyPdf(pdfBytes, options?)` to verify a credential PDF:

- **Basic verification:** structure and SkillsAware metadata (no options).
- **Full verification:** pass `{ skillCode, claimantName, endorserName }` to verify the embedded signature against the credential data.

Returns `VerifyPdfResponse`: `filename`, `fileSize`, `basicVerification`, `fullVerification` (null if options not provided), and `metadata`.

### Types

All request/response types are exported for TypeScript:

- `CreateClaimPayload`, `CreateClaimResponse`, `CreateClaimConfig`
- `GenerateEndorserLinkPayload`, `GenerateEndorserLinkResponse`, `GenerateEndorserLinkConfig`
- `SubmitEndorsementPayload`, `SubmitEndorsementResponse`, `SubmitEndorsementConfig`
- `GetDownloadUrlConfig`, `GetDownloadUrlParams`, `GetDownloadUrlResult`, `DownloadInfo`
- `VerifyPdfConfig`, `VerifyPdfOptions`, `VerifyPdfResponse`, `VerifyPdfBasicResult`, `VerifyPdfFullResult`, `VerifyPdfMetadata`
- `EndorsementApiError` – thrown on non-2xx responses (has `status` and `body`)

### Errors

On non-2xx responses the SDK throws `EndorsementApiError` with:

- `message` – error message (often from the API `error` field)
- `status` – HTTP status code
- `body` – parsed response body (if JSON)

## Example: Next.js API route

```ts
// app/api/create-claim/route.ts
import { createClaim } from 'skillsaware-endorsement-sdk'

export async function POST(request: Request) {
  const body = await request.json()
  const result = await createClaim(
    {
      baseUrl: process.env.NEXT_PUBLIC_ENDORSEMENT_URL!,
      apiKey: process.env.SKILLSAWARE_API_KEY!
    },
    body
  )
  return Response.json(result)
}
```

Your frontend can POST to this route and then open `result.claimant_link`.

## Backend testing with Postman

A Postman collection is included in this package for testing the endorsement API directly:

- **Path (after install):** `node_modules/skillsaware-endorsement-sdk/postman/SkillsAware-Endorsement-API.postman_collection.json`
- **In repo:** `packages/endorsement-sdk/postman/SkillsAware-Endorsement-API.postman_collection.json`

Import it into Postman, then set collection variables: `baseUrl` (e.g. `http://localhost:3000` or your backend URL), `apiKey` (your `SKILLSAWARE_API_KEY`). After running Create Claim, the collection auto-sets `claimId` and `claimantToken`; after Generate Endorser Link it sets `endorserToken`. You can then run Submit Endorsement and the download requests.

## Publishing (maintainers)

Repo: [Cooperation-org/skillsaware-endorsement](https://github.com/Cooperation-org/skillsaware-endorsement).

1. **Login to NPM** (one-time):
   ```bash
   npm login
   ```
   Use your NPM account; create one at [npmjs.com](https://www.npmjs.com/signup) if needed.

2. **From repo root or `packages/endorsement-sdk`**:
   ```bash
   cd packages/endorsement-sdk
   npm run build
   npm publish --dry-run   # check tarball (dist, README, LICENSE, CHANGELOG)
   npm publish
   ```
   The package name `skillsaware-endorsement-sdk` is unscoped, so no `--access public` is needed. If you later switch to a scoped name (e.g. `@cooperation-org/endorsement-sdk`), use `npm publish --access public`.

3. **After publishing**: The package will be at `https://www.npmjs.com/package/skillsaware-endorsement-sdk`. For new versions, bump `version` in `package.json` and add an entry to `CHANGELOG.md`, then run `npm publish` again.

## Links

- **NPM:** [skillsaware-endorsement-sdk](https://www.npmjs.com/package/skillsaware-endorsement-sdk)
- **Repository:** [github.com/Cooperation-org/skillsaware-endorsement](https://github.com/Cooperation-org/skillsaware-endorsement) (monorepo; SDK lives in `packages/endorsement-sdk`)
- **Changelog:** [CHANGELOG.md](./CHANGELOG.md)

## License

MIT. See [LICENSE](./LICENSE) for the full text.
