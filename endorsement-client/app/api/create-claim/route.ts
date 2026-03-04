import { NextRequest, NextResponse } from 'next/server'
import { createClaim } from 'skillsaware-endorsement-sdk'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const baseUrl = process.env.ENDORSEMENT_API_URL
    const apiKey = process.env.ENDORSEMENT_API_KEY

    if (!baseUrl || !apiKey) {
      return NextResponse.json(
        { error: 'Missing ENDORSEMENT_API_URL or ENDORSEMENT_API_KEY' },
        { status: 500 }
      )
    }

    const data = await createClaim(
      { baseUrl, apiKey },
      {
        tenant_id: body.tenant_id,
        skill_code: body.skill_code,
        skill_name: body.skill_name,
        skill_description: body.skill_description,
        claimant_name: body.claimant_name,
        claimant_email: body.claimant_email
      }
    )

    return NextResponse.json(data)
  } catch (error: unknown) {
    console.error('Create claim error:', error)
    const message =
      error && typeof error === 'object' && 'message' in error
        ? String((error as { message: string }).message)
        : 'Internal server error'
    const status = error && typeof error === 'object' && 'status' in error
      ? Number((error as { status: number }).status)
      : 500
    return NextResponse.json({ error: message }, { status: status >= 400 ? status : 500 })
  }
}
