/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ⚠️  IMPORTANT: THIS IS FOR TESTING AND DEMO PURPOSES ONLY ⚠️
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * 🚨 THIS WEBHOOK ENDPOINT IS NOT FOR PRODUCTION USE 🚨
 * 
 * This endpoint is provided ONLY for:
 * - Testing webhook delivery during development
 * - Understanding webhook payload structure
 * - Verifying HMAC signature validation
 * - Demo purposes
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * ✅ PRODUCTION IMPLEMENTATION REQUIRED ✅
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * SkillsAware developers MUST:
 * 
 * 1. ✅ Implement a similar webhook endpoint in the MAIN SKILLSAWARE WEBSITE
 * 2. ✅ Update SKILLSAWARE_WEBHOOK_URL to point to the SkillsAware main system
 * 3. ✅ Remove or disable this test endpoint in production
 * 
 * DO NOT use this endpoint in production!
 * The webhook MUST be implemented in the SkillsAware main website.
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/webhook'
import { getTenantConfig } from '@/lib/config'

export async function POST(request: NextRequest) {
  try {
    // Get webhook payload
    const payload = await request.json()

    // Get signature from headers
    const signature = request.headers.get('x-signature')
    // Try to get tenant from payload first, then header, then default
    const headerTenantId = request.headers.get('x-tenant')
    const eventId = request.headers.get('x-event-id')
    
    // Get tenant ID from payload if available (more reliable)
    const payloadTenantId = (payload as { tenant_id?: string }).tenant_id
    const tenantId = payloadTenantId || headerTenantId || 'skillsaware'

    // Log received webhook (for debugging and visibility)
    console.log('\n' + '='.repeat(60))
    console.log('[Webhook] 📥 Webhook received at', new Date().toISOString())
    console.log('[Webhook] Headers:', {
      'X-Signature': signature ? `${signature.substring(0, 20)}...` : 'missing',
      'X-Tenant': tenantId,
      'X-Event-Id': eventId
    })
    console.log('[Webhook] Payload:', JSON.stringify(payload, null, 2))
    console.log('='.repeat(60) + '\n')

    if (!signature) {
      console.error('[Webhook] ❌ Missing X-Signature header')
      return NextResponse.json(
        { error: 'Missing X-Signature header' },
        { status: 401 }
      )
    }

    // Get tenant config to retrieve webhook secret
    console.log(`[Webhook] Looking up tenant config for: "${tenantId}"`)
    const tenant = getTenantConfig(tenantId)
    if (!tenant) {
      console.error(`[Webhook] ❌ Tenant not found: "${tenantId}"`)
      console.error('[Webhook] Available tenants: skillsaware (default)')
      return NextResponse.json(
        { error: `Tenant "${tenantId}" not found` },
        { status: 404 }
      )
    }
    if (!tenant.webhook_secret) {
      console.error(`[Webhook] ❌ Webhook secret not configured for tenant: "${tenantId}"`)
      return NextResponse.json(
        { error: 'Webhook secret not configured for tenant' },
        { status: 500 }
      )
    }
    console.log(`[Webhook] ✅ Tenant config found: ${tenant.name} (${tenant.id})`)

    // Verify HMAC signature
    const payloadString = JSON.stringify(payload)
    const isValid = verifyWebhookSignature(
      payloadString,
      signature.replace('sha256=', ''), // Remove prefix
      tenant.webhook_secret
    )

    if (!isValid) {
      console.error('[Webhook] ❌ Invalid signature received - signature verification failed')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    // Log signature verification success
    console.log('[Webhook] ✅ Signature verified successfully')
    console.log('[Webhook] Event details:', {
      event: payload.event,
      claim_id: payload.claim_id,
      skill_code: payload.skill_code,
      skill_name: payload.skill_name,
      claimant_name: payload.claimant_name,
      endorser_name: payload.endorser_name,
      event_id: eventId,
      timestamp: payload.timestamp
    })

    // ============================================
    // YOUR BUSINESS LOGIC HERE
    // ============================================
    // 
    // This is where SkillsAware developers should implement:
    // 
    // 1. Store endorsement record in database
    //    await db.endorsements.create({
    //      claimId: payload.claim_id,
    //      skillCode: payload.skill_code,
    //      skillName: payload.skill_name,
    //      claimantName: payload.claimant_name,
    //      endorserName: payload.endorser_name,
    //      s3JsonKey: payload.artifacts[0].s3_key,
    //      s3PdfKey: payload.artifacts[1].s3_key,
    //      timestamp: payload.timestamp
    //    })
    //
    // 2. Send notifications
    //    await sendNotification({
    //      type: 'endorsement.completed',
    //      claimId: payload.claim_id,
    //      skillName: payload.skill_name
    //    })
    //
    // 3. Update analytics
    //    await analytics.track('endorsement.completed', {
    //      claimId: payload.claim_id,
    //      skillCode: payload.skill_code
    //    })
    //
    // 4. Trigger downstream processes
    //    await processEndorsement(payload.claim_id)
    //
    // ============================================

    // Log the artifacts (S3 keys) for reference
    console.log('[Webhook] 📦 Artifacts available in S3:')
    payload.artifacts.forEach((artifact: { type: string; s3_key: string }) => {
      console.log(`   - ${artifact.type}: ${artifact.s3_key}`)
    })

    // ═══════════════════════════════════════════════════════════════════════
    // ⚠️  THIS IS A TEST/DEMO ENDPOINT - NOT FOR PRODUCTION ⚠️
    // ═══════════════════════════════════════════════════════════════════════
    // 
    // SkillsAware developers: This endpoint is for testing only.
    // 
    // YOU MUST implement a similar endpoint in the MAIN SKILLSAWARE WEBSITE
    // with your actual business logic:
    // 
    // 1. Store endorsement record in SkillsAware database
    // 2. Send notifications to relevant users
    // 3. Update analytics and reporting
    // 4. Trigger downstream processes
    // 
    // DO NOT use this endpoint in production!
    // ═══════════════════════════════════════════════════════════════════════

    // Return success response
    // IMPORTANT: Return 2xx status code to indicate successful processing
    // Any other status code will trigger retries
    const response = {
      success: true,
      message: 'Webhook received and processed',
      event: payload.event,
      claim_id: payload.claim_id,
      event_id: eventId,
      received_at: new Date().toISOString()
    }

    console.log('[Webhook] ✅ Webhook processed successfully, returning response:', response)
    console.log('='.repeat(60) + '\n')

    return NextResponse.json(response)
  } catch (error) {
    console.error('\n' + '='.repeat(60))
    console.error('[Webhook] ❌ Error processing webhook:', error)
    if (error instanceof Error) {
      console.error('[Webhook] Error message:', error.message)
      console.error('[Webhook] Error stack:', error.stack)
    }
    console.error('='.repeat(60) + '\n')

    // Return error response
    // This will trigger webhook retries
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * Example webhook payload structure:
 * 
 * {
 *   "event": "claim.endorsed",
 *   "claim_id": "815dbda6-de57-4a2e-8077-cf2e9752dc56",
 *   "skill_code": "TEST-PROD-1765829489489",
 *   "skill_name": "Production Test Skill",
 *   "claimant_name": "Test Claimant",
 *   "endorser_name": "Test Endorser",
 *   "artifacts": [
 *     {
 *       "type": "obv3-json",
 *       "s3_key": "endorsements/815dbda6-de57-4a2e-8077-cf2e9752dc56/claim.obv3.json"
 *     },
 *     {
 *       "type": "pdf",
 *       "s3_key": "endorsements/815dbda6-de57-4a2e-8077-cf2e9752dc56/claim.pdf"
 *     }
 *   ],
 *   "timestamp": "2025-01-19T12:00:00.000Z"
 * }
 * 
 * Headers:
 * - Content-Type: application/json
 * - X-Signature: sha256=<hmac-signature>
 * - X-Tenant: skillsaware
 * - X-Event-Id: <unique-event-id>
 */

