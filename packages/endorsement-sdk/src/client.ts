import type {
  CreateClaimPayload,
  CreateClaimResponse,
  GenerateEndorserLinkPayload,
  GenerateEndorserLinkResponse,
  SubmitEndorsementPayload,
  SubmitEndorsementResponse,
  GetDownloadUrlResult,
  VerifyPdfOptions,
  VerifyPdfResponse
} from './types'
import {
  assertResponse,
  isCreateClaimResponse,
  isGenerateEndorserLinkResponse,
  isSubmitEndorsementResponse,
  isVerifyPdfResponse
} from './guards'

/**
 * Error thrown when the endorsement API returns a non-2xx response.
 * @public
 */
export class EndorsementApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body?: unknown
  ) {
    super(message)
    this.name = 'EndorsementApiError'
    Object.setPrototypeOf(this, EndorsementApiError.prototype)
  }
}

/**
 * Normalize base URL (no trailing slash).
 */
function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, '')
}

/**
 * Perform a JSON request, parse errors, and validate the response shape
 * at runtime using the provided type guard.
 *
 * The `guard` and `label` parameters ensure that external JSON is never
 * blindly trusted -- every response crosses a trust boundary and must be
 * proven to match the expected type before it is returned.
 */
async function request<T>(
  baseUrl: string,
  path: string,
  options: {
    method: 'GET' | 'POST'
    headers?: Record<string, string>
    body?: unknown
  },
  guard: (v: unknown) => v is T,
  label: string
): Promise<T> {
  const url = `${normalizeBaseUrl(baseUrl)}${path.startsWith('/') ? path : `/${path}`}`
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers
  }
  const res = await fetch(url, {
    method: options.method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  })
  let body: unknown
  const ct = res.headers.get('content-type')
  if (ct && ct.includes('application/json')) {
    try {
      body = await res.json()
    } catch {
      body = await res.text()
    }
  } else {
    body = await res.text()
  }
  if (!res.ok) {
    const msg =
      typeof body === 'object' && body !== null && 'error' in body
        ? String((body as { error: unknown }).error)
        : res.statusText || `HTTP ${res.status}`
    throw new EndorsementApiError(msg, res.status, body)
  }
  return assertResponse(body, guard, label)
}

/**
 * HTTP client for the endorsement API. Use the standalone functions
 * (createClaim, generateEndorserLink, etc.) or this class for a stateful client.
 * @public
 */
export class EndorsementClient {
  constructor(
    private readonly baseUrl: string,
    private readonly apiKey: string
  ) {}

  /**
   * Create a new claim and get the claimant magic link.
   */
  async createClaim(payload: CreateClaimPayload): Promise<CreateClaimResponse> {
    return request<CreateClaimResponse>(
      this.baseUrl,
      '/api/v1/claims',
      {
        method: 'POST',
        headers: { 'x-api-key': this.apiKey },
        body: payload
      },
      isCreateClaimResponse,
      'CreateClaimResponse'
    )
  }

  /**
   * Generate an endorser link (requires claimant JWT from claimant_link).
   */
  async generateEndorserLink(
    claimId: string,
    claimantToken: string,
    payload: GenerateEndorserLinkPayload
  ): Promise<GenerateEndorserLinkResponse> {
    return request<GenerateEndorserLinkResponse>(
      this.baseUrl,
      `/api/v1/claims/${encodeURIComponent(claimId)}/endorser-link`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${claimantToken}` },
        body: payload
      },
      isGenerateEndorserLinkResponse,
      'GenerateEndorserLinkResponse'
    )
  }

  /**
   * Submit endorsement (requires endorser JWT from endorser_link).
   */
  async submitEndorsement(
    endorserToken: string,
    payload: SubmitEndorsementPayload
  ): Promise<SubmitEndorsementResponse> {
    return request<SubmitEndorsementResponse>(
      this.baseUrl,
      '/api/v1/endorsements/submit',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${endorserToken}` },
        body: payload
      },
      isSubmitEndorsementResponse,
      'SubmitEndorsementResponse'
    )
  }

  /**
   * Build the download URL for JSON or PDF (use endorser token from submit flow).
   */
  getDownloadUrl(claimId: string, type: 'json' | 'pdf', token: string): GetDownloadUrlResult {
    const base = normalizeBaseUrl(this.baseUrl)
    const url = `${base}/api/v1/endorsements/${encodeURIComponent(claimId)}/download/${type}?token=${encodeURIComponent(token)}`
    const ext = type === 'json' ? 'obv3.json' : 'pdf'
    return { url, filename: `claim-${claimId}.${ext}` }
  }

  /**
   * Verify a credential PDF (basic + optional full signature check).
   */
  async verifyPdf(
    pdfBytes: ArrayBuffer | Uint8Array | Buffer,
    options?: VerifyPdfOptions
  ): Promise<VerifyPdfResponse> {
    const base = normalizeBaseUrl(this.baseUrl)
    const form = new FormData()
    const bytes: Uint8Array =
      pdfBytes instanceof ArrayBuffer
        ? new Uint8Array(pdfBytes)
        : new Uint8Array(pdfBytes.buffer, pdfBytes.byteOffset, pdfBytes.byteLength)
    form.append('pdf', new Blob([bytes], { type: 'application/pdf' }), 'credential.pdf')
    if (options?.skillCode) form.append('skillCode', options.skillCode)
    if (options?.claimantName) form.append('claimantName', options.claimantName)
    if (options?.endorserName) form.append('endorserName', options.endorserName)
    const res = await fetch(`${base}/api/v1/verify-pdf`, { method: 'POST', body: form })
    const data: unknown = await res.json()
    if (!res.ok) {
      const errBody = data as Record<string, unknown> | undefined
      const msg = errBody && typeof errBody === 'object' && 'error' in errBody ? String(errBody.error) : res.statusText
      throw new EndorsementApiError(msg ?? 'Verification failed', res.status, data)
    }
    return assertResponse(data, isVerifyPdfResponse, 'VerifyPdfResponse')
  }
}

export { request, normalizeBaseUrl }
