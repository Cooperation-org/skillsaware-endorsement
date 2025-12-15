import { NextRequest, NextResponse } from 'next/server'
import { extractTokenFromRequest, verifyToken } from '@/lib/jwt'
import { getTenantConfig } from '@/lib/config'
import { generateAchievementCredential, generateEndorsementCredential } from '@/lib/obv3'
import { getPresignedPutUrl, uploadToS3 } from '@/lib/s3'
import { renderCredentialPdf } from '@/lib/pdf'
import { sendWebhook } from '@/lib/webhook'
import { SubmitEndorsementSchema } from '@/lib/validation'

// Force Node.js runtime for puppeteer and pdf-lib
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    // Extract and verify JWT
    const token = extractTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'Missing authentication token' }, { status: 401 })
    }

    const payload = await verifyToken(token)

    if (payload.role !== 'endorser') {
      return NextResponse.json({ error: 'Invalid token role' }, { status: 403 })
    }

    // Validate request body
    const body = await request.json()
    const result = SubmitEndorsementSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: result.error.flatten() },
        { status: 400 }
      )
    }

    const data = result.data

    // Get tenant config
    const tenant = getTenantConfig(payload.tenant)
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    // Generate OBv3 credentials
    const achievementCred = generateAchievementCredential({
      claimId: payload.claim_id,
      tenantId: payload.tenant,
      issuerId: tenant.issuer_id,
      issuerName: tenant.issuer_name,
      claimantName: payload.claimant_name!,
      claimantEmail: payload.claimant_email!,
      skillCode: payload.skill_code,
      skillName: payload.skill_name,
      skillDescription: payload.skill_description,
      narrative: payload.claimant_narrative!,
      evidence: data.evidence_urls
    })

    const endorsementCred = generateEndorsementCredential({
      claimId: payload.claim_id,
      achievementCredentialId: achievementCred.id,
      endorserName: payload.endorser_name!,
      endorserEmail: payload.endorser_email!,
      endorsementText: data.endorsement_text,
      bonaFides: data.bona_fides,
      issuerId: tenant.issuer_id
    })

    // Attach endorsement to achievement credential
    achievementCred.endorsement = [endorsementCred]

    // Prepare JSON content
    const jsonContent = JSON.stringify(achievementCred, null, 2)
    const s3Prefix = tenant.s3_prefix || 'endorsements'
    const jsonKey = `${s3Prefix}/${payload.claim_id}/claim.obv3.json`
    const pdfKey = `${s3Prefix}/${payload.claim_id}/claim.pdf`

    // JSON is ready immediately (no base64 encoding needed)
    const jsonBase64 = Buffer.from(jsonContent).toString('base64')

    // Generate PDF immediately for S3 upload
    let pdfBuffer: Buffer | null = null
    try {
      pdfBuffer = await renderCredentialPdf({
        skillName: payload.skill_name,
        skillCode: payload.skill_code,
        skillDescription: payload.skill_description,
        claimantName: payload.claimant_name!,
        narrative: payload.claimant_narrative!,
        endorserName: payload.endorser_name!,
        endorsementText: data.endorsement_text,
        bonaFides: data.bona_fides,
        signature: data.signature,
        evidence: data.evidence_urls,
        logoUrl: tenant.brand_logo_url,
        primaryColor: tenant.brand_primary_color,
        claimId: payload.claim_id,
        jwtToken: token
      })
      console.log('[Submit] PDF generated successfully, size:', pdfBuffer.length, 'bytes')
    } catch (pdfError) {
      console.error('[Submit] PDF generation failed:', pdfError)
      // Continue without PDF - it can be generated on-demand via download endpoint
    }

    // Upload both JSON and PDF to S3 if configured
    let s3Uploaded = false
    try {
      if (tenant.s3_bucket && tenant.s3_prefix) {
        // Upload JSON to S3
        const jsonUrl = await getPresignedPutUrl(
          tenant.s3_bucket,
          jsonKey,
          'application/json'
        )
        await uploadToS3(jsonUrl, jsonContent, 'application/json')
        console.log('[Submit] JSON uploaded to S3:', jsonKey)

        // Upload PDF to S3 if generated
        if (pdfBuffer) {
          const pdfUrl = await getPresignedPutUrl(
            tenant.s3_bucket,
            pdfKey,
            'application/pdf'
          )
          await uploadToS3(pdfUrl, pdfBuffer, 'application/pdf')
          console.log('[Submit] PDF uploaded to S3:', pdfKey)
        }

        s3Uploaded = true
      }
    } catch (s3Error) {
      console.warn('S3 upload failed, continuing without S3:', s3Error)
      // Continue without S3 - files will be available via download endpoints
    }

    // Send webhook only if S3 upload succeeded
    let webhookResult = { success: false }
    if (s3Uploaded && tenant.webhook_url && tenant.webhook_secret) {
      try {
        webhookResult = await sendWebhook(
          tenant.webhook_url,
          {
            event: 'claim.endorsed',
            claim_id: payload.claim_id,
            skill_code: payload.skill_code,
            skill_name: payload.skill_name,
            claimant_name: payload.claimant_name!,
            endorser_name: payload.endorser_name!,
            artifacts: [
              { type: 'obv3-json', s3_key: jsonKey },
              { type: 'pdf', s3_key: pdfKey }
            ],
            timestamp: new Date().toISOString()
          },
          tenant.webhook_secret
        )
      } catch (webhookError) {
        console.warn('Webhook delivery failed:', webhookError)
      }
    }

    // Build the app URL for download links
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Build query params for download endpoints (they need endorsement data)
    const downloadParams = new URLSearchParams({
      token: token,
      endorsement_text: data.endorsement_text,
      bona_fides: data.bona_fides,
      signature: data.signature
    })

    if (data.evidence_urls && data.evidence_urls.length > 0) {
      downloadParams.append('evidence_urls', JSON.stringify(data.evidence_urls))
    }

    return NextResponse.json({
      success: true,
      claim_id: payload.claim_id,
      message:
        'Endorsement submitted successfully. Download your credentials using the links below.',
      downloads: {
        json: {
          url: `${appUrl}/api/v1/endorsements/${payload.claim_id}/download/json?${downloadParams.toString()}`,
          filename: `${payload.skill_code}-${payload.claim_id}.obv3.json`,
          ready: true, // JSON is immediately available
          size_estimate: '~2 KB'
        },
        pdf: {
          url: `${appUrl}/api/v1/endorsements/${payload.claim_id}/download/pdf?${downloadParams.toString()}`,
          filename: `${payload.skill_code}-${payload.claim_id}.pdf`,
          ready: pdfBuffer !== null, // PDF is ready if generated, otherwise on-demand
          size_estimate: '~180 KB',
          note: pdfBuffer
            ? 'PDF is ready for download'
            : 'PDF will be generated when you access this URL (may take 5-10 seconds)'
        }
      },
      // Optional: include base64 JSON for immediate access if needed
      json_base64: jsonBase64,
      s3_uploaded: s3Uploaded,
      webhook_delivered: webhookResult.success
    })
  } catch (error) {
    console.error('Submit endorsement error:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'N/A')

    if (error instanceof Error) {
      if (error.message === 'TOKEN_EXPIRED') {
        return NextResponse.json({ error: 'Token expired' }, { status: 401 })
      }
      if (error.message === 'TOKEN_INVALID') {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
      }

      // Check if it's a PDF generation error
      if (error.message.includes('Failed to generate PDF')) {
        return NextResponse.json(
          {
            error: 'PDF generation failed',
            details: error.message,
            message:
              'There was an error generating the PDF certificate. Please try again or contact support.'
          },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
