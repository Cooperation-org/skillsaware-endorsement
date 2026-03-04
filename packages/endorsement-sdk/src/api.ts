import type {
  CreateClaimConfig,
  CreateClaimPayload,
  CreateClaimResponse,
  GenerateEndorserLinkConfig,
  GenerateEndorserLinkPayload,
  GenerateEndorserLinkResponse,
  SubmitEndorsementConfig,
  SubmitEndorsementPayload,
  SubmitEndorsementResponse,
  GetDownloadUrlConfig,
  GetDownloadUrlParams,
  GetDownloadUrlResult,
  VerifyPdfConfig,
  VerifyPdfOptions,
  VerifyPdfResponse
} from './types'
import { EndorsementClient, EndorsementApiError } from './client'

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, '')
}

/**
 * Create a new claim. Returns claim_id and claimant_link (magic link).
 * Use the API key on the server; do not expose it in client bundles.
 *
 * @example
 * const res = await createClaim(
 *   { baseUrl: process.env.ENDORSEMENT_URL!, apiKey: process.env.API_KEY! },
 *   { tenant_id: 'acme', skill_code: 'SK-1', skill_name: 'Skill', skill_description: '...', claimant_name: 'Jane', claimant_email: 'jane@example.com' }
 * )
 * window.open(res.claimant_link)
 */
export async function createClaim(
  config: CreateClaimConfig,
  payload: CreateClaimPayload
): Promise<CreateClaimResponse> {
  const client = new EndorsementClient(config.baseUrl, config.apiKey)
  return client.createClaim(payload)
}

/**
 * Generate an endorser link. Requires the claimant JWT (from claimant_link query param).
 *
 * @example
 * const res = await generateEndorserLink(
 *   { baseUrl, claimantToken: tokenFromClaimantLink },
 *   { claimId, claimant_narrative: '...', endorser_name: 'John', endorser_email: 'john@example.com' }
 * )
 * window.open(res.endorser_link)
 */
export async function generateEndorserLink(
  config: GenerateEndorserLinkConfig,
  payload: GenerateEndorserLinkPayload & { claimId: string }
): Promise<GenerateEndorserLinkResponse> {
  const { claimId, ...body } = payload
  const base = normalizeBaseUrl(config.baseUrl)
  const res = await fetch(
    `${base}/api/v1/claims/${encodeURIComponent(claimId)}/endorser-link`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.claimantToken}`
      },
      body: JSON.stringify(body)
    }
  )
  const data = (await res.json()) as { error?: string } | GenerateEndorserLinkResponse
  if (!res.ok) {
    const msg = 'error' in data ? data.error : res.statusText
    throw new EndorsementApiError(msg ?? 'Request failed', res.status, data)
  }
  return data as GenerateEndorserLinkResponse
}

/**
 * Submit the endorsement. Requires the endorser JWT (from endorser_link).
 * Returns download URLs for JSON and PDF.
 */
export async function submitEndorsement(
  config: SubmitEndorsementConfig,
  payload: SubmitEndorsementPayload
): Promise<SubmitEndorsementResponse> {
  const base = normalizeBaseUrl(config.baseUrl)
  const res = await fetch(`${base}/api/v1/endorsements/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.endorserToken}`
    },
    body: JSON.stringify(payload)
  })
  const data = (await res.json()) as { error?: string } | SubmitEndorsementResponse
  if (!res.ok) {
    const msg = 'error' in data ? data.error : res.statusText
    throw new EndorsementApiError(msg ?? 'Request failed', res.status, data)
  }
  return data as SubmitEndorsementResponse
}

/**
 * Build the download URL for JSON or PDF. Use the token from the submit response
 * or the endorser link. Client can use this URL as href or open in new tab.
 */
export function getDownloadUrl(
  config: GetDownloadUrlConfig,
  params: GetDownloadUrlParams
): GetDownloadUrlResult {
  const base = normalizeBaseUrl(config.baseUrl)
  const url = `${base}/api/v1/endorsements/${encodeURIComponent(params.claimId)}/download/${params.type}?token=${encodeURIComponent(config.token)}`
  const ext = params.type === 'json' ? 'obv3.json' : 'pdf'
  return { url, filename: `claim-${params.claimId}.${ext}` }
}

/**
 * Verify a credential PDF (basic structure + optional full signature check).
 * Sends the PDF to the backend POST /api/v1/verify-pdf.
 * Pass options (skillCode, claimantName, endorserName) for full cryptographic verification.
 *
 * @example
 * const pdfBuffer = await fs.promises.readFile('credential.pdf')
 * const result = await verifyPdf(
 *   { baseUrl: 'https://...' },
 *   pdfBuffer,
 *   { skillCode: 'SK-1', claimantName: 'Jane', endorserName: 'John' }
 * )
 */
export async function verifyPdf(
  config: VerifyPdfConfig,
  pdfBytes: ArrayBuffer | Uint8Array | Buffer,
  options?: VerifyPdfOptions
): Promise<VerifyPdfResponse> {
  const base = normalizeBaseUrl(config.baseUrl)
  const form = new FormData()
  const bytes: Uint8Array =
    pdfBytes instanceof ArrayBuffer
      ? new Uint8Array(pdfBytes)
      : new Uint8Array(pdfBytes.buffer, pdfBytes.byteOffset, pdfBytes.byteLength)
  const blob = new Blob([bytes], { type: 'application/pdf' })
  form.append('pdf', blob, 'credential.pdf')
  if (options?.skillCode) form.append('skillCode', options.skillCode)
  if (options?.claimantName) form.append('claimantName', options.claimantName)
  if (options?.endorserName) form.append('endorserName', options.endorserName)

  const res = await fetch(`${base}/api/v1/verify-pdf`, {
    method: 'POST',
    body: form
  })
  const data = (await res.json()) as { error?: string } | VerifyPdfResponse
  if (!res.ok) {
    const msg = 'error' in data ? data.error : res.statusText
    throw new EndorsementApiError(msg ?? 'Verification failed', res.status, data)
  }
  return data as VerifyPdfResponse
}
