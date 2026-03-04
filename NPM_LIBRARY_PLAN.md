# NPM Library Plan: SkillsAware Endorsement Client SDK

**Purpose:** Build an NPM package that clients can install to integrate the SkillsAware OBv3 Endorsement flow into their sites with minimal setup. This document is a fool-proof plan for an AI Agent to follow so nothing is missed.

**End goal:** Publish to NPM; client creates a Next.js app, installs the lib, integrates it, and deploys to Vercel to test live.

---

## Table of Contents

1. [Scope & Success Criteria](#1-scope--success-criteria)
2. [Phase 1: Package Scaffold](#2-phase-1-package-scaffold)
3. [Phase 2: SDK API & Build](#3-phase-2-sdk-api--build)
4. [Phase 3: Documentation & Types](#4-phase-3-documentation--types)
5. [Phase 4: NPM Publish Readiness](#5-phase-4-npm-publish-readiness)
6. [Phase 5: Client Integration & Vercel Test](#6-phase-5-client-integration--vercel-test)
7. [Checklists Summary](#7-checklists-summary)
8. [Postman & Live Test](#8-postman--live-test)

---

## 1. Scope & Success Criteria

### In scope

- **NPM package** (e.g. `@skillsaware/endorsement-client` or `skillsaware-endorsement-sdk`) that:
  - Runs in browser and/or Node (isomorphic where possible).
  - Calls the endorsement backend API (create claim, endorser link, submit endorsement, downloads).
  - Exposes a simple, typed API so the client only needs base URL + API key (and optionally token handling).
- **Build:** ESM + CJS outputs, TypeScript declaration files (`.d.ts`), no bundling of React/Next (peer or optional).
- **Docs:** README with install, minimal config, and usage (e.g. Create Claim → open claimant link → endorser flow).
- **Publish:** Package is publishable to NPM (name reserved if scoped), version strategy clear.
- **Verification:** A separate Next.js app can install the lib from NPM (or `npm link`/local path), integrate it, deploy to Vercel, and complete one full endorsement flow live.

### Out of scope (for this plan)

- Implementing the backend endorsement API (already in this repo).
- Hosting or modifying the backend; the lib only consumes it.

### Success criteria (all must pass)

| # | Criterion | How to verify |
|---|-----------|----------------|
| S1 | Package installs with `npm install <package-name>` (or from tarball/link). | Run in a fresh Next.js app: `npm install <pkg>`. No install errors. |
| S2 | Client can create a claim with only base URL + API key (and required payload). | Call e.g. `createClaim({ baseUrl, apiKey, ...payload })` and receive `claim_id` and `claimant_link`. |
| S3 | Client can open the claimant flow (e.g. redirect or window to `claimant_link`). | After create claim, opening the returned link shows the claimant form. |
| S4 | Client can complete the full flow: claim → claimant form → endorser link → endorser form → submit → download PDF/JSON. | Manual or automated E2E: one full flow on a deployed app. |
| S5 | TypeScript types are exported and work in a TS Next.js app. | Import types from the package; no `any` required; `tsc` passes. |
| S6 | Package builds without errors and produces ESM + CJS + `.d.ts`. | Run `npm run build` in the package; check `dist/` (or chosen output). |
| S7 | README documents install, env/config, and at least one full integration path. | Human or agent can follow README to integrate in a new app. |
| S8 | Postman collection runs against live backend (local or Vercel). | All requests in the collection succeed with correct env (base URL, API key, tokens). |

---

## 2. Phase 1: Package Scaffold

**Objective:** Create a new package (in repo root or in a subfolder like `packages/endorsement-sdk`) that looks like a standard NPM library.

### Steps

1. **Choose package location**
   - Option A: Monorepo folder, e.g. `packages/endorsement-sdk/`.
   - Option B: Separate folder at root, e.g. `endorsement-sdk/`.
   - Create the folder and `cd` into it for all subsequent steps in this phase.

2. **Initialize package**
   - Run `npm init -y`.
   - Set `"name"`: e.g. `@skillsaware/endorsement-client` (scoped) or `skillsaware-endorsement-sdk` (unscoped). Ensure it matches NPM availability.
   - Set `"version"`: e.g. `"0.1.0"`.
   - Set `"description"`, `"keywords"`, `"license"`, `"repository"`, `"author"` as appropriate.

3. **Entry points in `package.json`**
   - `"main"`: CJS entry (e.g. `"dist/index.cjs"` or `"dist/cjs/index.js"`).
   - `"module"`: ESM entry (e.g. `"dist/index.js"` or `"dist/esm/index.js"`).
   - `"types"`: TypeScript entry (e.g. `"dist/index.d.ts"`).
   - `"exports"`: Node-style conditional exports for `import`/`require`/`types`, e.g.:
     ```json
     "exports": {
       ".": {
         "import": "./dist/index.js",
         "require": "./dist/index.cjs",
         "types": "./dist/index.d.ts"
       }
     }
     ```
   - `"files"`: Include only what’s needed for consumers (e.g. `["dist", "README.md"]`). Exclude tests and source if not needed at runtime.

4. **TypeScript**
   - Add `typescript` as devDependency.
   - Add `tsconfig.json`:
     - `"declaration": true`, `"declarationMap": true`.
     - Output to a single folder (e.g. `dist/`) or separate `dist/esm` and `dist/cjs` if using dual builds.
     - Target ES2020 or similar; module NodeNext/ESNext as appropriate.

5. **Build tool**
   - Use a bundler that outputs both ESM and CJS and generates `.d.ts` (e.g. **tsup**, **unbuild**, or **rollup** + **tsc**).
   - Recommended: **tsup** — minimal config, supports ESM/CJS and types in one step.
   - Add `"build"` script, e.g. `"build": "tsup"` or `tsup src/index.ts --format cjs,esm --dts`.
   - Add `"prepare"` or `"prepublishOnly"` to run `build` before publish (optional but recommended).

6. **Source layout**
   - Create `src/index.ts` as the main entry.
   - Optionally: `src/api.ts`, `src/types.ts`, `src/client.ts` — keep the public API surface in `index.ts` (re-exports only).

7. **Dependencies**
   - Prefer **zero or minimal runtime dependencies** (use `fetch` for HTTP). If you need a fetch polyfill for old Node, document it or use optional dependency.
   - No React/Next in the package unless the plan explicitly adds a React component; if later you add a React hook/component, list React as peerDependency.

8. **Lint/format (optional but recommended)**
   - Add ESLint + Prettier config or inherit from root; ensure `npm run build` and `npm run lint` pass.

### Phase 1 checklist

- [ ] Package folder exists and has its own `package.json`.
- [ ] `name`, `version`, `main`, `module`, `types`, `exports`, `files` are set.
- [ ] TypeScript compiles with declarations.
- [ ] Build script produces ESM, CJS, and `.d.ts` in `dist/`.
- [ ] No unnecessary dependencies; React/Next not included unless planned.

---

## 3. Phase 2: SDK API & Build

**Objective:** Implement the client API that talks to the existing backend and expose a minimal, typed surface.

### Backend endpoints to support (reference)

- `POST /api/v1/claims` — create claim (headers: `x-api-key`, body: tenant_id, skill_*, claimant_*).
- `POST /api/v1/claims/:claimId/endorser-link` — generate endorser link (headers: `Authorization: Bearer <claimant-jwt>`, body: claimant_narrative, endorser_name, endorser_email).
- `POST /api/v1/endorsements/submit` — submit endorsement (headers: `Authorization: Bearer <endorser-jwt>`, body: endorsement_text, bona_fides, evidence_urls, signature).
- `GET /api/v1/endorsements/:claimId/download/json?token=...` — download JSON.
- `GET /api/v1/endorsements/:claimId/download/pdf?token=...` — download PDF.

(Optional: test-token, webhook test — can be in Postman only.)

### Steps

1. **Base client**
   - Create a client that holds `baseUrl` (e.g. `https://your-endorsement.vercel.app`) and `apiKey`.
   - All requests go to `baseUrl + path`; add `x-api-key` where the backend requires it.

2. **Typed functions (minimal surface)**
   - `createClaim(config, payload)`  
     - Config: `{ baseUrl, apiKey }`.  
     - Payload: `{ tenant_id, skill_code, skill_name, skill_description, claimant_name, claimant_email }`.  
     - Returns: `{ claim_id, claimant_link, expires_at }`.
   - `generateEndorserLink(config, payload)`  
     - Config: `{ baseUrl, claimantToken }` (and optional apiKey if needed).  
     - Payload: `{ claimId, claimant_narrative, endorser_name?, endorser_email? }`.  
     - Returns: `{ endorser_link, expires_at, email_sent?, email_error? }`.
   - `submitEndorsement(config, payload)`  
     - Config: `{ baseUrl, endorserToken }`.  
     - Payload: `{ endorsement_text, bona_fides, signature, evidence_urls? }`.  
     - Returns: response with `downloads`, `json_base64`, etc.
   - `getDownloadUrl(config, params)`  
     - Config: `{ baseUrl, token }`.  
     - Params: `{ claimId, type: 'json' | 'pdf' }`.  
     - Returns: URL string (or object with url + filename) so the client can open in new tab or use as href.

   Alternatively, expose a single `EndorsementClient` class with methods `createClaim`, `generateEndorserLink`, `submitEndorsement`, `getDownloadUrl` that store baseUrl/apiKey/tokens internally.

3. **HTTP layer**
   - Use `fetch` only. Handle non-2xx: parse JSON error body and throw a clear error (e.g. custom `EndorsementApiError` with status and message).

4. **Types**
   - Define and export TypeScript interfaces for:
     - CreateClaimPayload, CreateClaimResponse
     - GenerateEndorserLinkPayload, GenerateEndorsementLinkResponse
     - SubmitEndorsementPayload, SubmitEndorsementResponse
     - (Optional) DownloadInfo
   - Export these from `src/index.ts` so consumers get full IntelliSense.

5. **Build**
   - Ensure `npm run build` runs without errors and output is in `dist/` with correct entry points. No backend code or env secrets in the bundle.

### Phase 2 checklist

- [ ] createClaim works with real backend (local or Vercel).
- [ ] generateEndorserLink works with claimant JWT.
- [ ] submitEndorsement works with endorser JWT.
- [ ] getDownloadUrl (or equivalent) returns valid PDF/JSON URLs.
- [ ] All request/response types exported.
- [ ] Errors from API are surfaced (status + message).

---

## 4. Phase 3: Documentation & Types

**Objective:** Any developer (or AI) can integrate the lib using only the README and exported types.

### Steps

1. **README.md in the package**
   - Package name and one-line description.
   - Installation: `npm install @skillsaware/endorsement-client` (or chosen name).
   - **Requirements:** Node 18+ (or 20+) and/or browser with fetch; optional note about CORS if backend is on another origin.
   - **Quick start:**
     - Minimal config: base URL and API key.
     - Example: create claim, get `claimant_link`, then “Open this link in the same or new window to continue the flow.”
   - **API reference:** List each public function or class method with params and return type (or link to generated docs).
   - **Environment / config:** Document that the client needs the endorsement backend URL (e.g. `NEXT_PUBLIC_ENDORSEMENT_URL`) and API key (server-side or via env); no secrets in client bundle if possible.
   - **Full flow:** 1) Create claim → 2) Redirect user to claimant_link → 3) User completes claimant form and requests endorser link → 4) Endorser uses endorser_link → 5) After submit, show download links (from response or getDownloadUrl). Optionally mention Postman for backend-only testing.

2. **JSDoc**
   - Add brief JSDoc to exported functions and types so IDEs show helpful tooltips.

3. **Example snippet (copy-pasteable)**
   - One block for “Create claim and open claimant form” in a browser context (e.g. Next.js client component or plain JS).

### Phase 3 checklist

- [ ] README has install, config, and quick start.
- [ ] Full flow (claim → claimant → endorser → download) described.
- [ ] All public APIs listed or linked.
- [ ] Exported types are documented or self-explanatory via JSDoc.

---

## 5. Phase 4: NPM Publish Readiness

**Objective:** Package can be published to NPM and installed by others.

### Steps

1. **NPM account and scope**
   - If using a scoped package (e.g. `@skillsaware/...`), ensure the scope exists and you’re logged in (`npm login`). If unscoped, ensure the name is available (`npm search` or try publishing with `--dry-run`).

2. **Version**
   - Use semver. For first release, `0.1.0` or `1.0.0` is fine. Document versioning policy (e.g. “we use semver”).

3. **Publish dry run**
   - Run `npm publish --dry-run` (or `npm publish --access public` for scoped) and confirm the tarball contains only `dist/`, README, and package.json (no tests, no `.env`, no backend code).

4. **.npmignore or `files`**
   - Prefer `"files": ["dist", "README.md"]` (or equivalent) so only necessary files are published. If using .npmignore, ensure `dist` and types are not ignored.

5. **Scripts**
   - `prepublishOnly`: run `npm run build` so that every publish ships a fresh build.

### Phase 4 checklist

- [ ] `npm publish --dry-run` succeeds and file list is correct.
- [ ] No secrets or local paths in the package.
- [ ] Version and name are correct for NPM.

---

## 6. Phase 5: Client Integration & Vercel Test

**Objective:** Prove the lib works in a real Next.js app deployed on Vercel.

### Steps

1. **Create a new Next.js app** (outside or inside this repo, e.g. `endorsement-client-demo` or reuse `endorsement-client`).
   - `npx create-next-app@latest endorsement-client-demo --typescript --tailwind --eslint --app --src-dir`.
   - Or use existing `endorsement-client` and add the SDK as dependency.

2. **Install the SDK**
   - From NPM (after publish): `npm install @skillsaware/endorsement-client`.
   - For local testing before publish: `npm install file:../packages/endorsement-sdk` or `npm link`.

3. **Environment variables**
   - In the Next.js app, set:
     - `NEXT_PUBLIC_ENDORSEMENT_URL` = backend base URL (e.g. `https://skillsaware-endorsement.vercel.app`).
     - For create-claim (server or API route): `SKILLSAWARE_API_KEY` or equivalent (server-side only; do not expose in client bundle if sensitive).

4. **Integration**
   - One page that:
     - Calls `createClaim` (from a Server Action or API route that uses the API key, or from client if key is public — not recommended for production).
     - Displays “Claim created” and a button/link “Continue to claimant form” that opens `claimant_link` (same tab or new tab).
   - No need to reimplement claimant/endorser forms — they live on the backend; the client only opens the links. Optionally add a second page that “simulates” receiving the endorser link and opening it.

5. **Deploy to Vercel**
   - Connect the Next.js app to Vercel; set env vars in project settings.
   - Deploy. Ensure `NEXT_PUBLIC_ENDORSEMENT_URL` points to the deployed backend (or local backend with tunnel for quick test).

6. **Live test**
   - On the deployed URL: create a claim → open claimant link → complete claimant form → generate endorser link → open endorser link → complete endorsement → submit → download PDF/JSON.
   - Confirm no CORS or mixed-content issues; confirm downloads work.

### Phase 5 checklist

- [ ] Next.js app exists and has SDK as dependency.
- [ ] Env vars set (backend URL, API key on server).
- [ ] Create-claim + open claimant link works in production.
- [ ] Full flow (claim → claimant → endorser → download) completes on Vercel.
- [ ] No console errors; downloads open or save correctly.

---

## 7. Checklists Summary

**Before considering the plan “done”, run through:**

| Phase | Checklist |
|-------|-----------|
| 1 – Scaffold | Package folder, package.json (main/module/types/exports/files), TS + build (ESM, CJS, .d.ts). |
| 2 – SDK API | createClaim, generateEndorserLink, submitEndorsement, getDownloadUrl; types exported; errors handled. |
| 3 – Docs | README: install, config, quick start, full flow, API reference. |
| 4 – Publish | npm publish --dry-run ok; no secrets; prepublishOnly build. |
| 5 – Integration | Next.js app with SDK; env vars; deploy to Vercel; one full flow E2E. |
| Success | S1–S8 from [Success criteria](#1-scope--success-criteria) all pass. |

---

## 8. Postman & Live Test

- A **Postman collection** is included in the SDK package: **`packages/endorsement-sdk/postman/SkillsAware-Endorsement-API.postman_collection.json`** (and shipped in the NPM package under `postman/`).
- Use it to test the **backend** API directly (create claim, endorser link, submit endorsement, downloads, optional webhook test).
- **Collection variables:** Set `baseUrl` (e.g. `https://skillsaware-endorsement.vercel.app` or `http://localhost:3000`) and `apiKey` (your `SKILLSAWARE_API_KEY`). For endorser-link and submit, set `claimantToken` and `endorserToken` (from previous request responses or from the magic links).
- **Success:** All requests in the collection return 2xx when given valid baseUrl, apiKey, and tokens (and optional test token request to get a JWT for testing).

After the SDK is built, the **client** (Next.js app) uses the SDK to call the same backend; Postman remains the way to verify the backend and to grab sample tokens for development.

---

## Quick Reference: File Layout (Suggested)

```text
packages/endorsement-sdk/   (or endorsement-sdk/)
├── package.json
├── tsconfig.json
├── tsup.config.ts         (or rollup.config.js)
├── README.md
├── src/
│   ├── index.ts           # Public API + re-exports
│   ├── client.ts          # HTTP client / EndorsementClient
│   ├── api.ts             # createClaim, generateEndorserLink, submitEndorsement, getDownloadUrl
│   └── types.ts           # All request/response types
└── dist/                  # Generated; in .gitignore if desired
    ├── index.js
    ├── index.cjs
    └── index.d.ts
```

Root repo (this repo) keeps the **backend** (Next.js API routes) and the **Postman collection**; the NPM lib can live in a subfolder or in a separate repo and depend only on the public API described in the README and in this plan.
