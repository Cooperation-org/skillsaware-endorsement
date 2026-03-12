import { SignJWT, jwtVerify, JWTPayload } from 'jose'
import { JwtPayload } from '@/types/jwt'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'dev-secret-key-please-change-in-production-min-256-bits'
)
const JWT_EXPIRY_DAYS = parseInt(process.env.JWT_EXPIRY_DAYS || '7', 10)

/**
 * Convert a JwtPayload (minus exp) into a jose-compatible JWTPayload.
 * This avoids `as unknown as Record<string, unknown>` by explicitly
 * spreading the known fields into a structurally compatible object.
 */
function toJosePayload(payload: Omit<JwtPayload, 'exp'>): JWTPayload {
  const result: JWTPayload = {}
  for (const [key, value] of Object.entries(payload)) {
    result[key] = value
  }
  return result
}

/**
 * Runtime type guard that validates a jose JWTPayload contains
 * the fields required by our application's JwtPayload interface.
 */
function isJwtPayload(value: JWTPayload): value is JWTPayload & JwtPayload {
  return (
    typeof value.iss === 'string' &&
    typeof value.aud === 'string' &&
    typeof value.tenant === 'string' &&
    typeof value.claim_id === 'string' &&
    typeof value.skill_code === 'string' &&
    typeof value.skill_name === 'string' &&
    typeof value.skill_description === 'string' &&
    (value.role === 'claimant' || value.role === 'endorser') &&
    typeof value.nonce === 'string'
  )
}

export async function createToken(
  payload: Omit<JwtPayload, 'exp'>,
  expiryDays = JWT_EXPIRY_DAYS
): Promise<string> {
  const token = await new SignJWT(toJosePayload(payload))
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${expiryDays}d`)
    .sign(JWT_SECRET)

  return token
}

export async function verifyToken(token: string): Promise<JwtPayload> {
  try {
    if (!token || token.trim() === '') {
      throw new Error('TOKEN_INVALID: Token is empty or missing')
    }

    const { payload } = await jwtVerify(token, JWT_SECRET)
    if (!isJwtPayload(payload)) {
      throw new Error('TOKEN_INVALID: Token payload does not match expected structure')
    }
    return payload
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('expired')) {
        throw new Error('TOKEN_EXPIRED')
      }
      if (error.message.includes('signature') || error.message.includes('invalid')) {
        throw new Error(
          'TOKEN_INVALID: Token signature verification failed. Make sure you are using a valid token from a claim creation or endorser link.'
        )
      }
    }
    throw new Error(
      'TOKEN_INVALID: Token verification failed. Ensure you have a valid JWT token from the API.'
    )
  }
}

export function extractTokenFromRequest(request: Request): string | null {
  // Check Authorization header
  const authHeader = request.headers.get('Authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  // Check query params
  const url = new URL(request.url)
  const tokenParam = url.searchParams.get('token')
  if (tokenParam) {
    return tokenParam
  }

  // Check cookies
  const cookieHeader = request.headers.get('Cookie')
  if (cookieHeader) {
    const match = cookieHeader.match(/token=([^;]+)/)
    if (match) {
      return match[1]
    }
  }

  return null
}
