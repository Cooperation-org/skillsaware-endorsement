import { NextRequest, NextResponse } from 'next/server';
import { validateTenantApiKey } from '@/lib/config';
import { createToken } from '@/lib/jwt';
import { CreateClaimRequest } from '@/types/api';
import crypto from 'crypto';
import { CreateClaimSchema } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    // Validate API key
    const apiKey = request.headers.get('x-api-key');
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing API key' },
        { status: 401 }
      );
    }

    const tenant = validateTenantApiKey(apiKey);
    if (!tenant) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const result = CreateClaimSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const data: CreateClaimRequest = result.data;

    // Generate claim ID
    const claimId = crypto.randomUUID();

    // Create JWT token for claimant
    const token = await createToken({
      iss: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      aud: tenant.id,
      tenant: tenant.id,
      claim_id: claimId,
      skill_code: data.skill_code,
      skill_name: data.skill_name,
      skill_description: data.skill_description,
      role: 'claimant',
      claimant_name: data.claimant_name,
      claimant_email: data.claimant_email,
      nonce: crypto.randomUUID(),
    });

    const magicLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/form/claimant?token=${token}`;

    return NextResponse.json({
      claim_id: claimId,
      claimant_link: magicLink,
      expires_at: new Date(
        Date.now() + parseInt(process.env.JWT_EXPIRY_DAYS || '7', 10) * 24 * 60 * 60 * 1000
      ).toISOString(),
    });
  } catch (error) {
    console.error('Create claim error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
