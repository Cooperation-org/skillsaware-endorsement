import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromRequest, verifyToken } from '@/lib/jwt';
import { getTenantConfig } from '@/lib/config';
import { generateAchievementCredential, generateEndorsementCredential } from '@/lib/obv3';
import { renderCredentialPdf } from '@/lib/pdf';
import { getPresignedPutUrl, uploadToS3 } from '@/lib/s3';
import { sendWebhook } from '@/lib/webhook';
import { SubmitEndorsementSchema } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    // Extract and verify JWT
    const token = extractTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { error: 'Missing authentication token' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);

    if (payload.role !== 'endorser') {
      return NextResponse.json(
        { error: 'Invalid token role' },
        { status: 403 }
      );
    }

    // Validate request body
    const body = await request.json();
    const result = SubmitEndorsementSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const data = result.data;

    // Get tenant config
    const tenant = getTenantConfig(payload.tenant);
    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
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
      evidence: data.evidence_urls,
    });

    const endorsementCred = generateEndorsementCredential({
      claimId: payload.claim_id,
      achievementCredentialId: achievementCred.id,
      endorserName: payload.endorser_name!,
      endorserEmail: payload.endorser_email!,
      endorsementText: data.endorsement_text,
      bonaFides: data.bona_fides,
      issuerId: tenant.issuer_id,
    });

    // Attach endorsement to achievement credential
    achievementCred.endorsement = [endorsementCred];

    // Generate PDF with metadata and signature
    const pdf = await renderCredentialPdf({
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
      jwtToken: token, // Store JWT for verification
    });

    // Prepare JSON and PDF content
    const jsonContent = JSON.stringify(achievementCred, null, 2);
    const s3Prefix = tenant.s3_prefix || 'endorsements';
    const jsonKey = `${s3Prefix}/${payload.claim_id}/claim.obv3.json`;
    const pdfKey = `${s3Prefix}/${payload.claim_id}/claim.pdf`;

    // Convert to base64 for direct download (works without S3)
    const jsonBase64 = Buffer.from(jsonContent).toString('base64');
    const pdfBase64 = pdf.toString('base64');

    // Optional: Upload to S3 if configured (for webhook/archival)
    let s3Uploaded = false;
    try {
      if (tenant.s3_bucket && tenant.s3_prefix) {
        const jsonUrl = await getPresignedPutUrl(tenant.s3_bucket, jsonKey, 'application/json');
        const pdfUrl = await getPresignedPutUrl(tenant.s3_bucket, pdfKey, 'application/pdf');

        await Promise.all([
          uploadToS3(jsonUrl, jsonContent, 'application/json'),
          uploadToS3(pdfUrl, pdf, 'application/pdf'),
        ]);
        s3Uploaded = true;
      }
    } catch (s3Error) {
      console.warn('S3 upload failed, continuing with base64 response:', s3Error);
      // Continue without S3 - files will be available via base64
    }

    // Send webhook only if S3 upload succeeded
    let webhookResult = { success: false };
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
              { type: 'pdf', s3_key: pdfKey },
            ],
            timestamp: new Date().toISOString(),
          },
          tenant.webhook_secret
        );
      } catch (webhookError) {
        console.warn('Webhook delivery failed:', webhookError);
      }
    }

    return NextResponse.json({
      success: true,
      claim_id: payload.claim_id,
      artifacts: {
        obv3_json: jsonKey,
        pdf: pdfKey,
      },
      downloads: {
        json: {
          base64: jsonBase64,
          filename: `${payload.skill_code}-${payload.claim_id}.obv3.json`,
          url: `/api/v1/endorsements/${payload.claim_id}/download/json?token=${token}`,
        },
        pdf: {
          base64: pdfBase64,
          filename: `${payload.skill_code}-${payload.claim_id}.pdf`,
          url: `/api/v1/endorsements/${payload.claim_id}/download/pdf?token=${token}`,
        },
      },
      s3_uploaded: s3Uploaded,
      webhook_delivered: webhookResult.success,
    });
  } catch (error) {
    console.error('Submit endorsement error:', error);

    if (error instanceof Error) {
      if (error.message === 'TOKEN_EXPIRED') {
        return NextResponse.json(
          { error: 'Token expired' },
          { status: 401 }
        );
      }
      if (error.message === 'TOKEN_INVALID') {
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
