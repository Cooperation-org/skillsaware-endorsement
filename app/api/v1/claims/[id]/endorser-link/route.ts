import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromRequest, verifyToken, createToken } from '@/lib/jwt';
import crypto from 'crypto';
import { GenerateEndorserLinkSchema } from '@/lib/validation';
import { GenerateEndorserLinkRequest } from '@/types/api';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: claimId } = await params;

    // Extract and verify JWT
    const token = extractTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { error: 'Missing authentication token' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);

    if (payload.role !== 'claimant') {
      return NextResponse.json(
        { error: 'Invalid token role' },
        { status: 403 }
      );
    }

    if (payload.claim_id !== claimId) {
      return NextResponse.json(
        { error: 'Claim ID mismatch' },
        { status: 403 }
      );
    }

    // Validate request body
    const body = await request.json();
    const result = GenerateEndorserLinkSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const data: GenerateEndorserLinkRequest = result.data;

    // Create JWT token for endorser with claimant narrative
    const endorserToken = await createToken({
      iss: payload.iss,
      aud: payload.aud,
      tenant: payload.tenant,
      claim_id: payload.claim_id,
      skill_code: payload.skill_code,
      skill_name: payload.skill_name,
      skill_description: payload.skill_description,
      role: 'endorser',
      claimant_name: payload.claimant_name,
      claimant_email: payload.claimant_email,
      endorser_name: data.endorser_name,
      endorser_email: data.endorser_email,
      claimant_narrative: data.claimant_narrative,
      nonce: crypto.randomUUID(),
    });

    const magicLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/form/endorser?token=${endorserToken}`;

    return NextResponse.json({
      endorser_link: magicLink,
      expires_at: new Date(
        Date.now() + parseInt(process.env.JWT_EXPIRY_DAYS || '7', 10) * 24 * 60 * 60 * 1000
      ).toISOString(),
    });
  } catch (error) {
    console.error('Generate endorser link error:', error);

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
