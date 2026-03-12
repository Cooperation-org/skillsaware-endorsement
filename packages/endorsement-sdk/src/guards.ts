import type {
  CreateClaimResponse,
  GenerateEndorserLinkResponse,
  SubmitEndorsementResponse,
  VerifyPdfResponse
} from './types'

/**
 * Assert that a value is a non-null object. Used internally by type guards.
 */
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

/**
 * Assert that an object has a string property at the given key.
 */
function hasString(obj: Record<string, unknown>, key: string): boolean {
  return typeof obj[key] === 'string'
}

/**
 * Assert that an object has a boolean property at the given key.
 */
function hasBoolean(obj: Record<string, unknown>, key: string): boolean {
  return typeof obj[key] === 'boolean'
}

/**
 * Assert that an object has a number property at the given key.
 */
function hasNumber(obj: Record<string, unknown>, key: string): boolean {
  return typeof obj[key] === 'number'
}

/**
 * Runtime type guard for CreateClaimResponse.
 * Validates that the required fields (claim_id, claimant_link, expires_at) are present strings.
 */
export function isCreateClaimResponse(data: unknown): data is CreateClaimResponse {
  return (
    isObject(data) &&
    hasString(data, 'claim_id') &&
    hasString(data, 'claimant_link') &&
    hasString(data, 'expires_at')
  )
}

/**
 * Runtime type guard for GenerateEndorserLinkResponse.
 * Validates that the required fields (endorser_link, expires_at) are present strings.
 */
export function isGenerateEndorserLinkResponse(data: unknown): data is GenerateEndorserLinkResponse {
  return (
    isObject(data) &&
    hasString(data, 'endorser_link') &&
    hasString(data, 'expires_at')
  )
}

/**
 * Runtime type guard for SubmitEndorsementResponse.
 * Validates required fields: success (boolean), claim_id (string), message (string),
 * and downloads (object with json and pdf sub-objects containing url, filename, ready).
 */
export function isSubmitEndorsementResponse(data: unknown): data is SubmitEndorsementResponse {
  if (
    !isObject(data) ||
    !hasBoolean(data, 'success') ||
    !hasString(data, 'claim_id') ||
    !hasString(data, 'message')
  ) {
    return false
  }
  if (!isObject(data.downloads)) return false
  const downloads = data.downloads as Record<string, unknown>
  if (!isObject(downloads.json) || !isObject(downloads.pdf)) return false
  const json = downloads.json as Record<string, unknown>
  const pdf = downloads.pdf as Record<string, unknown>
  return (
    hasString(json, 'url') &&
    hasString(json, 'filename') &&
    hasBoolean(json, 'ready') &&
    hasString(pdf, 'url') &&
    hasString(pdf, 'filename') &&
    hasBoolean(pdf, 'ready')
  )
}

/**
 * Runtime type guard for VerifyPdfResponse.
 * Validates required fields: filename (string), fileSize (number),
 * basicVerification (object with valid, message), metadata (object).
 */
export function isVerifyPdfResponse(data: unknown): data is VerifyPdfResponse {
  if (
    !isObject(data) ||
    !hasString(data, 'filename') ||
    !hasNumber(data, 'fileSize')
  ) {
    return false
  }
  if (!isObject(data.basicVerification)) return false
  const basic = data.basicVerification as Record<string, unknown>
  if (!hasBoolean(basic, 'valid') || !hasString(basic, 'message')) return false
  // fullVerification can be null or an object with valid + message
  if (data.fullVerification !== null) {
    if (!isObject(data.fullVerification)) return false
    const full = data.fullVerification as Record<string, unknown>
    if (!hasBoolean(full, 'valid') || !hasString(full, 'message')) return false
  }
  if (!isObject(data.metadata)) return false
  return true
}

/**
 * Validate and narrow an unknown API response to the expected type.
 * Throws EndorsementApiError if the shape does not match.
 *
 * This is the SINGLE function that should be used at every trust boundary
 * to replace naked `as T` casts.
 */
export function assertResponse<T>(
  data: unknown,
  guard: (v: unknown) => v is T,
  label: string
): T {
  if (!guard(data)) {
    throw new TypeError(
      `Invalid ${label} response: expected shape not satisfied. ` +
        `Received keys: ${typeof data === 'object' && data !== null ? Object.keys(data).join(', ') : typeof data}`
    )
  }
  return data
}
