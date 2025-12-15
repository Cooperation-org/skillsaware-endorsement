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

function getErrorMessage(error: unknown, url: string): string {
  if (error instanceof Error) {
    const errorCode = (error as Error & { code?: string }).code
    const errorCause = (error as Error & { cause?: { code?: string } }).cause

    // Handle specific error codes
    if (errorCode === 'ECONNREFUSED' || errorCause?.code === 'ECONNREFUSED') {
      const urlObj = new URL(url)
      if (urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1') {
        return `Connection refused: Webhook URL uses localhost (${urlObj.hostname}), which is not accessible from server. Use a publicly accessible URL or a service like ngrok for local testing.`
      }
      return `Connection refused: Webhook endpoint at ${urlObj.hostname} is not accessible. Verify the URL is correct and the server is running.`
    }

    if (errorCode === 'ENOTFOUND' || errorCause?.code === 'ENOTFOUND') {
      return `DNS lookup failed: Webhook URL hostname not found. Verify the URL is correct.`
    }

    if (errorCode === 'ETIMEDOUT' || errorCause?.code === 'ETIMEDOUT') {
      return `Connection timeout: Webhook endpoint did not respond within 30 seconds.`
    }

    if (errorCode === 'ECONNRESET' || errorCause?.code === 'ECONNRESET') {
      return `Connection reset: Webhook endpoint closed the connection.`
    }

    // Generic error message
    return error.message || String(error)
  }

  return String(error)
}

export async function sendWebhook(
  url: string,
  payload: WebhookPayload,
  secret: string,
  maxRetries = 5
): Promise<{ success: boolean; lastError?: string }> {
  // Validate URL format
  try {
    new URL(url)
  } catch {
    const errorMsg = `Invalid webhook URL format: ${url}`
    console.error(`[Webhook] ${errorMsg}`)
    return { success: false, lastError: errorMsg }
  }

  const payloadString = JSON.stringify(payload)
  const signature = generateHmacSignature(payloadString, secret)
  const eventId = crypto.randomUUID()

  const retryDelays = [60, 300, 1800, 21600, 86400] // 1m, 5m, 30m, 6h, 24h (in seconds)
  let lastError: string | undefined

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Create AbortController for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Signature': `sha256=${signature}`,
          'X-Tenant': payload.claim_id.split('/')[0], // Extract tenant from claim_id
          'X-Event-Id': eventId
        },
        body: payloadString,
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        console.log(`[Webhook] Successfully delivered to ${new URL(url).hostname} (attempt ${attempt + 1})`)
        return { success: true }
      }

      // Log failure and retry
      const errorMsg = `HTTP ${response.status}: ${response.statusText}`
      lastError = errorMsg
      console.error(`[Webhook] Attempt ${attempt + 1}/${maxRetries} failed: ${errorMsg}`)
    } catch (error) {
      const errorMsg = getErrorMessage(error, url)
      lastError = errorMsg
      
      if (error instanceof Error && error.name === 'AbortError') {
        console.error(`[Webhook] Attempt ${attempt + 1}/${maxRetries} timed out after 30 seconds`)
      } else {
        console.error(`[Webhook] Attempt ${attempt + 1}/${maxRetries} error: ${errorMsg}`)
      }
    }

    // Wait before retry (except on last attempt)
    if (attempt < maxRetries - 1) {
      const delayMs = retryDelays[attempt] * 1000
      const delayMinutes = delayMs / 60000
      console.log(`[Webhook] Retrying in ${delayMinutes} minute(s)...`)
      await new Promise(resolve => setTimeout(resolve, delayMs))
    }
  }

  console.error(`[Webhook] Failed after ${maxRetries} attempts. Last error: ${lastError}`)
  return { success: false, lastError: lastError || 'Max retries exceeded' }
}
