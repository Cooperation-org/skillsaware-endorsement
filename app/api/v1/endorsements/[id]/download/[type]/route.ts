import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromRequest, verifyToken } from '@/lib/jwt';
import { getTenantConfig } from '@/lib/config';
import { generateAchievementCredential, generateEndorsementCredential } from '@/lib/obv3';
import { renderCredentialPdf } from '@/lib/pdf';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; type: string }> }
) {
  try {
    const { id: claimId, type } = await params;

    // Validate type parameter
    if (type !== 'json' && type !== 'pdf') {
      return NextResponse.json(
        { error: 'Invalid file type. Must be "json" or "pdf"' },
        { status: 400 }
      );
    }

    // Extract and verify JWT
    const token = extractTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { error: 'Missing authentication token' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);

    // Verify claim ID matches
    if (payload.claim_id !== claimId) {
      return NextResponse.json(
        { error: 'Claim ID mismatch' },
        { status: 403 }
      );
    }

    // Verify this is an endorser token (only endorsers can download completed credentials)
    if (payload.role !== 'endorser') {
      return NextResponse.json(
        { error: 'Invalid token role. Only endorsers can download credentials.' },
        { status: 403 }
      );
    }

    // Get tenant config
    const tenant = getTenantConfig(payload.tenant);
    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    // Get evidence URLs and endorsement data from query params (passed from success page)
    const searchParams = request.nextUrl.searchParams;
    const evidenceUrlsParam = searchParams.get('evidence_urls');
    const evidenceUrls = evidenceUrlsParam ? JSON.parse(evidenceUrlsParam) : undefined;
    const endorsementText = searchParams.get('endorsement_text') || '';
    const bonaFides = searchParams.get('bona_fides') || '';
    const signature = searchParams.get('signature') || '';

    if (type === 'json') {
      // Regenerate JSON credential
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
        evidence: evidenceUrls,
      });

      const endorsementCred = generateEndorsementCredential({
        claimId: payload.claim_id,
        achievementCredentialId: achievementCred.id,
        endorserName: payload.endorser_name!,
        endorserEmail: payload.endorser_email!,
        endorsementText: endorsementText,
        bonaFides: bonaFides,
        issuerId: tenant.issuer_id,
      });

      // Attach endorsement to achievement credential
      achievementCred.endorsement = [endorsementCred];

      const jsonContent = JSON.stringify(achievementCred, null, 2);
      const filename = `${payload.skill_code}-${payload.claim_id}.obv3.json`;

      return new Response(jsonContent, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'private, max-age=3600',
        },
      });
    } else {
      // Regenerate PDF with metadata and signature
      const pdf = await renderCredentialPdf({
        skillName: payload.skill_name,
        skillCode: payload.skill_code,
        skillDescription: payload.skill_description,
        claimantName: payload.claimant_name!,
        narrative: payload.claimant_narrative!,
        endorserName: payload.endorser_name!,
        endorsementText: endorsementText,
        bonaFides: bonaFides,
        signature: signature,
        evidence: evidenceUrls,
        logoUrl: tenant.brand_logo_url,
        primaryColor: tenant.brand_primary_color,
        claimId: payload.claim_id,
      });

      const filename = `${payload.skill_code}-${payload.claim_id}.pdf`;

      // Create a proper Uint8Array from the Buffer for Response body
      const uint8Array = new Uint8Array(pdf);

      return new Response(uint8Array, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="${filename}"`,
          'Cache-Control': 'private, max-age=3600',
        },
      });
    }
  } catch (error) {
    console.error('Download error:', error);

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
