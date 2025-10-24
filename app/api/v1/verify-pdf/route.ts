import { NextRequest, NextResponse } from 'next/server'
import { verifyPdfBasic, verifyPdfSignature, extractPdfMetadata } from '@/lib/pdf-verify'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('pdf') as File

    if (!file) {
      return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 })
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'PDF file too large (max 10MB)' },
        { status: 400 }
      )
    }

    // Check file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'File must be a PDF' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Step 1: Extract metadata
    const metadata = await extractPdfMetadata(buffer)

    // Step 2: Basic verification (always run)
    const basicResult = await verifyPdfBasic(buffer)

    // Step 3: Full verification if credential data provided
    const skillCode = formData.get('skillCode') as string
    const claimantName = formData.get('claimantName') as string
    const endorserName = formData.get('endorserName') as string

    let fullVerification = null

    if (skillCode && claimantName && endorserName) {
      // Full cryptographic verification
      fullVerification = await verifyPdfSignature(
        buffer,
        skillCode,
        claimantName,
        endorserName
      )
    }

    // Return comprehensive verification result
    return NextResponse.json({
      filename: file.name,
      fileSize: file.size,
      basicVerification: basicResult,
      fullVerification: fullVerification,
      metadata: {
        title: metadata.title,
        author: metadata.author,
        subject: metadata.subject,
        creator: metadata.creator,
        producer: metadata.producer,
        creationDate: metadata.creationDate?.toISOString(),
        modificationDate: metadata.modificationDate?.toISOString(),
        keywords: metadata.keywords,
        customFields: metadata.customFields
      }
    })
  } catch (error) {
    console.error('PDF verification error:', error)
    return NextResponse.json(
      {
        error: 'Verification failed',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
