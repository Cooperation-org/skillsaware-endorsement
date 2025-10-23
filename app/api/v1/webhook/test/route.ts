import { NextRequest, NextResponse } from 'next/server';
import { validateTenantApiKey } from '@/lib/config';
import { sendWebhook } from '@/lib/webhook';
import crypto from 'crypto';

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

    // Check if webhook is configured
    if (!tenant.webhook_url || !tenant.webhook_secret) {
      return NextResponse.json({
        success: false,
        error: 'Webhook URL or secret not configured for this tenant',
      });
    }

    // Generate test webhook payload
    const testClaimId = crypto.randomUUID();
    const webhookResult = await sendWebhook(
      tenant.webhook_url,
      {
        event: 'claim.endorsed',
        claim_id: testClaimId,
        skill_code: 'TEST001',
        skill_name: 'Test Skill',
        claimant_name: 'Test Claimant',
        endorser_name: 'Test Endorser',
        artifacts: [
          { type: 'obv3-json', s3_key: `test/${testClaimId}/claim.obv3.json` },
          { type: 'pdf', s3_key: `test/${testClaimId}/claim.pdf` },
        ],
        timestamp: new Date().toISOString(),
      },
      tenant.webhook_secret,
      1 // Only one retry for test
    );

    return NextResponse.json({
      success: webhookResult.success,
      webhook_url: tenant.webhook_url,
      error: webhookResult.lastError,
    });
  } catch (error) {
    console.error('Test webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
