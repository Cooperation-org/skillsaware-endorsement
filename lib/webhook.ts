import crypto from 'crypto'
import { WebhookPayload } from '@/types/webhook'

export function generateHmacSignature(payload: string | Buffer, secret: string): string {
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(payload)
  return hmac.digest('hex')
}

export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string
): boolean {
  const expectedSig = Buffer.from(generateHmacSignature(payload, secret), 'hex')
  const receivedSig = Buffer.from(signature, 'hex')

  // Length check before timing-safe comparison
  if (expectedSig.length !== receivedSig.length) {
    return false
  }

  // CRITICAL: Use timingSafeEqual to prevent timing attacks
  return crypto.timingSafeEqual(expectedSig, receivedSig)
}

export async function sendWebhook(
  url: string,
  payload: WebhookPayload,
  secret: string,
  maxRetries = 5
): Promise<{ success: boolean; lastError?: string }> {
  const payloadString = JSON.stringify(payload)
  const signature = generateHmacSignature(payloadString, secret)
  const eventId = crypto.randomUUID()

  const retryDelays = [60, 300, 1800, 21600, 86400] // 1m, 5m, 30m, 6h, 24h (in seconds)

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Signature': `sha256=${signature}`,
          'X-Tenant': payload.claim_id.split('/')[0], // Extract tenant from claim_id
          'X-Event-Id': eventId
        },
        body: payloadString
      })

      if (response.ok) {
        return { success: true }
      }

      // Log failure and retry
      console.error(`Webhook attempt ${attempt + 1} failed: ${response.status}`)
    } catch (error) {
      console.error(`Webhook attempt ${attempt + 1} error:`, error)
    }

    // Wait before retry (except on last attempt)
    if (attempt < maxRetries - 1) {
      const delayMs = retryDelays[attempt] * 1000
      await new Promise(resolve => setTimeout(resolve, delayMs))
    }
  }

  return { success: false, lastError: 'Max retries exceeded' }
}
