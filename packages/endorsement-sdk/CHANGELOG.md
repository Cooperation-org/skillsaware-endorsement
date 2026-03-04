# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2025-03-04

### Added

- Initial release.
- **createClaim** – Create a claim with API key; returns `claim_id` and `claimant_link`.
- **generateEndorserLink** – Generate endorser magic link (requires claimant JWT).
- **submitEndorsement** – Submit endorsement (requires endorser JWT); returns download URLs.
- **getDownloadUrl** – Build download URL for JSON or PDF credential.
- **verifyPdf** – Verify credential PDF (basic structure + optional full signature verification).
- **EndorsementClient** – Class API with the same methods.
- Full TypeScript types exported for all configs, payloads, and responses.
- **EndorsementApiError** – Thrown on non-2xx API responses (includes `status` and `body`).
- ESM and CJS builds; TypeScript declaration files (`.d.ts`).
- Zero runtime dependencies; works in Node 18+ and browsers with `fetch`.

[Unreleased]: https://github.com/Cooperation-org/skillsaware-endorsement/compare/skillsaware-endorsement-sdk-v0.1.0...HEAD
[0.1.0]: https://github.com/Cooperation-org/skillsaware-endorsement/releases/tag/skillsaware-endorsement-sdk-v0.1.0
