import { NextRequest, NextResponse } from 'next/server'
import { createToken } from '@/lib/jwt'
import crypto from 'crypto'

/**
 * Test endpoint to generate JWT tokens for API testing
 * Only available in development mode
 */
export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development mode' },
      { status: 403 }
    )
  }

  try {
    const body = await request.json()
    const { role = 'claimant', claim_id, tenant_id = 'skillsaware' } = body

    // Generate a claim_id if not provided
    const testClaimId = claim_id || crypto.randomUUID()

    // Create a test token based on role
    if (role === 'claimant') {
      const token = await createToken({
        iss: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        aud: tenant_id,
        tenant: tenant_id,
        claim_id: testClaimId,
        skill_code: body.skill_code || 'TEST001',
        skill_name: body.skill_name || 'Test Skill',
        skill_description: body.skill_description || 'A test skill for API testing',
        role: 'claimant',
        claimant_name: body.claimant_name || 'Test Claimant',
        claimant_email: body.claimant_email || 'test@example.com',
        nonce: crypto.randomUUID()
      })

      return NextResponse.json({
        token,
        claim_id: testClaimId,
        role: 'claimant',
        message: 'Use this token in the Authorization header: Bearer <token>',
        usage: {
          endpoint: `/api/v1/claims/${testClaimId}/endorser-link`,
          header: 'Authorization: Bearer ' + token.substring(0, 50) + '...'
        }
      })
    } else if (role === 'endorser') {
      const token = await createToken({
        iss: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        aud: tenant_id,
        tenant: tenant_id,
        claim_id: testClaimId,
        skill_code: body.skill_code || 'TEST001',
        skill_name: body.skill_name || 'Test Skill',
        skill_description: body.skill_description || 'A test skill for API testing',
        role: 'endorser',
        claimant_name: body.claimant_name || 'Test Claimant',
        claimant_email: body.claimant_email || 'claimant@example.com',
        endorser_name: body.endorser_name || 'Test Endorser',
        endorser_email: body.endorser_email || 'endorser@example.com',
        claimant_narrative: body.claimant_narrative || 'Test narrative',
        nonce: crypto.randomUUID()
      })

      return NextResponse.json({
        token,
        claim_id: testClaimId,
        role: 'endorser',
        message: 'Use this token in the Authorization header: Bearer <token>',
        usage: {
          endpoint: '/api/v1/endorsements/submit',
          header: 'Authorization: Bearer ' + token.substring(0, 50) + '...'
        }
      })
    } else {
      return NextResponse.json(
        { error: 'Invalid role. Must be "claimant" or "endorser"' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Test token generation error:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate test token',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
