import { SignJWT, jwtVerify } from 'jose'
import { JwtPayload } from '@/types/jwt'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'dev-secret-key-please-change-in-production-min-256-bits'
)
const JWT_EXPIRY_DAYS = parseInt(process.env.JWT_EXPIRY_DAYS || '7', 10)

export async function createToken(
  payload: Omit<JwtPayload, 'exp'>,
  expiryDays = JWT_EXPIRY_DAYS
): Promise<string> {
  const token = await new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${expiryDays}d`)
    .sign(JWT_SECRET)

  return token
}

export async function verifyToken(token: string): Promise<JwtPayload> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as JwtPayload
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('expired')) {
        throw new Error('TOKEN_EXPIRED')
      }
    }
    throw new Error('TOKEN_INVALID')
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
