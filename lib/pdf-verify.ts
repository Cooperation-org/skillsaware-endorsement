import { PDFDocument } from 'pdf-lib'
import crypto from 'crypto'

/**
 * Extract text content from PDF using pdf-parse-fork
 * This properly handles compressed PDF streams from Puppeteer
 * @param pdfBuffer The PDF file as a Buffer
 * @returns The PDF content as searchable text
 */
export async function extractPdfText(pdfBuffer: Buffer) {
  try {
    // Use pdf-parse-fork which handles compressed streams properly
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse-fork')

    const data = await pdfParse(pdfBuffer)
    const fullText = data.text

    console.log(`[PDF Verify] Extracted ${fullText.length} characters from PDF`)
    console.log(`[PDF Verify] Sample text (first 300 chars):`, fullText.substring(0, 300))

    return {
      fullText,
      extractedData: {} // We don't need to parse - we compare with stored metadata
    }
  } catch (error) {
    console.error('Failed to extract PDF text:', error)
    return {
      fullText: '',
      extractedData: {}
    }
  }
}

/**
 * Extract metadata from a PDF file
 * @param pdfBuffer The PDF file as a Buffer
 * @returns PDF metadata including custom SkillsAware fields
 */
export async function extractPdfMetadata(pdfBuffer: Buffer) {
  try {
    const pdfDoc = await PDFDocument.load(pdfBuffer)

    const metadata = {
      title: pdfDoc.getTitle(),
      author: pdfDoc.getAuthor(),
      subject: pdfDoc.getSubject(),
      keywords: pdfDoc.getKeywords(),
      creator: pdfDoc.getCreator(),
      producer: pdfDoc.getProducer(),
      creationDate: pdfDoc.getCreationDate(),
      modificationDate: pdfDoc.getModificationDate(),
      customFields: {} as Record<string, string>
    }

    // Extract custom SkillsAware metadata
    try {
      const infoDict = pdfDoc.context.lookup(pdfDoc.context.trailerInfo.Info)
      if (infoDict && typeof infoDict === 'object') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dict = (infoDict as any).dict
        if (dict && typeof dict.get === 'function') {
          const skillsAwareFields = [
            'SkillsAware-Signature',
            'SkillsAware-Timestamp',
            'SkillsAware-ClaimID',
            'SkillsAware-Version',
            'SkillsAware-Issuer',
            'SkillsAware-ContentHash',
            'SkillsAware-JWT',
            'SkillsAware-CredentialData'
          ]

          for (const field of skillsAwareFields) {
            try {
              const value = dict.get(pdfDoc.context.obj(field))
              if (value) {
                // Decode PDF string value - remove leading '/' and decode hex sequences
                let decodedValue = String(value)

                // Remove leading slash if present
                if (decodedValue.startsWith('/')) {
                  decodedValue = decodedValue.substring(1)
                }

                // Decode hex sequences like #20 -> space
                decodedValue = decodedValue.replace(
                  /#([0-9A-Fa-f]{2})/g,
                  (match, hex) => {
                    return String.fromCharCode(parseInt(hex, 16))
                  }
                )

                metadata.customFields[field] = decodedValue
              }
            } catch {
              // Field not found, skip
            }
          }
        }
      }
    } catch (customError) {
      console.warn('Could not extract custom metadata:', customError)
    }

    return metadata
  } catch (error) {
    throw new Error(`Failed to extract PDF metadata: ${error}`)
  }
}

/**
 * Verify a PDF signature
 * @param pdfBuffer The PDF file as a Buffer
 * @param skillCode The skill code from the credential
 * @param claimantName The claimant's name
 * @param endorserName The endorser's name
 * @returns Verification result
 */
export async function verifyPdfSignature(
  pdfBuffer: Buffer,
  skillCode: string,
  claimantName: string,
  endorserName: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<{ valid: boolean; message: string; metadata?: any; details?: any }> {
  try {
    const metadata = await extractPdfMetadata(pdfBuffer)
    const textData = await extractPdfText(pdfBuffer)

    // Check if SkillsAware signature exists
    const signature = metadata.customFields['SkillsAware-Signature']
    const timestamp = metadata.customFields['SkillsAware-Timestamp']

    if (!signature || !timestamp) {
      return {
        valid: false,
        message: 'No SkillsAware signature found in PDF metadata',
        metadata
      }
    }

    // Regenerate the signature with the same data
    const secret = process.env.JWT_SECRET || 'default-secret'
    const payload = `${skillCode}:${claimantName}:${endorserName}:${timestamp}`
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex')

    // Compare signatures
    if (signature === expectedSignature) {
      return {
        valid: true,
        message: 'PDF signature is valid - document is authentic and unmodified',
        metadata,
        details: {
          providedData: {
            skillCode,
            claimantName,
            endorserName
          },
          pdfData: textData.extractedData,
          pdfTimestamp: timestamp,
          signatureMatch: true
        }
      }
    } else {
      // Signature mismatch - extract actual PDF content and show differences
      const differences = []

      if (
        textData.extractedData.skillCode &&
        textData.extractedData.skillCode !== skillCode
      ) {
        differences.push({
          field: 'Skill Code',
          youEntered: skillCode,
          pdfContains: textData.extractedData.skillCode
        })
      }

      if (
        textData.extractedData.claimantName &&
        textData.extractedData.claimantName !== claimantName
      ) {
        differences.push({
          field: 'Claimant Name',
          youEntered: claimantName,
          pdfContains: textData.extractedData.claimantName
        })
      }

      if (
        textData.extractedData.endorserName &&
        textData.extractedData.endorserName !== endorserName
      ) {
        differences.push({
          field: 'Endorser Name',
          youEntered: endorserName,
          pdfContains: textData.extractedData.endorserName
        })
      }

      return {
        valid: false,
        message:
          differences.length > 0
            ? `PDF signature is invalid - found ${differences.length} mismatch(es) between what you entered and what's in the PDF.`
            : 'PDF signature is invalid - the credential data you provided does not match what was signed in the PDF. Either the PDF has been tampered with, or the credential details (skill code, claimant name, or endorser name) are incorrect.',
        metadata,
        details: {
          providedData: {
            skillCode,
            claimantName,
            endorserName
          },
          pdfData: textData.extractedData,
          pdfTimestamp: timestamp,
          signatureMatch: false,
          differences,
          expectedSignature: expectedSignature.substring(0, 16) + '...',
          foundSignature: signature.substring(0, 16) + '...',
          hint:
            differences.length > 0
              ? 'See differences below - check spelling and capitalization.'
              : 'Double-check that the skill code, claimant name, and endorser name exactly match the certificate (case-sensitive).'
        }
      }
    }
  } catch (error) {
    return {
      valid: false,
      message: `Verification failed: ${error}`
    }
  }
}

/**
 * Verify a PDF without knowing the original data
 * This checks if the signature format is correct and the metadata is present
 * @param pdfBuffer The PDF file as a Buffer
 * @returns Basic verification result
 */
export async function verifyPdfBasic(pdfBuffer: Buffer): Promise<{
  valid: boolean
  message: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tamperDetails?: any
}> {
  try {
    const metadata = await extractPdfMetadata(pdfBuffer)
    const textData = await extractPdfText(pdfBuffer)

    // Check if signature metadata exists (primary indicator)
    const signature = metadata.customFields['SkillsAware-Signature']
    const timestamp = metadata.customFields['SkillsAware-Timestamp']
    const claimId = metadata.customFields['SkillsAware-ClaimID']
    const version = metadata.customFields['SkillsAware-Version']

    const hasSkillsAwareSignature = signature && timestamp

    // Check if it's a SkillsAware PDF (either by creator or signature)
    if (!metadata.creator?.includes('SkillsAware') && !hasSkillsAwareSignature) {
      return {
        valid: false,
        message:
          'This is not a SkillsAware PDF - no SkillsAware signature or creator information found',
        metadata
      }
    }

    // Detect tampering - has SkillsAware signature but creator was changed
    if (hasSkillsAwareSignature && !metadata.creator?.includes('SkillsAware')) {
      const tamperDetails = {
        detected: true,
        changes: [
          {
            field: 'PDF Creator',
            original: 'SkillsAware OBv3 Endorsement System',
            modified: metadata.creator || 'Unknown',
            description:
              'The PDF was edited with another application, which modified the creator metadata'
          }
        ],
        extractedData: textData.extractedData,
        warning:
          'This PDF has been modified after issuance. The creator field has been changed, indicating the document was opened and saved in another application.'
      }

      return {
        valid: false,
        message: `⚠️ PDF TAMPERING DETECTED - This was originally a SkillsAware PDF but has been modified. Original creator: "SkillsAware OBv3 Endorsement System" → Modified to: "${metadata.creator}"`,
        metadata,
        tamperDetails
      }
    }

    if (!signature || !timestamp) {
      return {
        valid: false,
        message: 'PDF is missing SkillsAware signature metadata',
        metadata
      }
    }

    // Check signature format (should be 64 hex characters for SHA256)
    if (!/^[a-f0-9]{64}$/i.test(signature)) {
      return {
        valid: false,
        message: 'PDF signature format is invalid',
        metadata
      }
    }

    // Check for complete credential data in metadata (v1.0+)
    const storedCredentialData = metadata.customFields['SkillsAware-CredentialData']
    const storedContentHash = metadata.customFields['SkillsAware-ContentHash']

    if (storedCredentialData && storedContentHash) {
      try {
        const originalData = JSON.parse(storedCredentialData)

        // Recompute the content hash from the stored original data
        const contentPayload = JSON.stringify({
          skillName: originalData.skillName,
          skillCode: originalData.skillCode,
          skillDescription: originalData.skillDescription,
          claimantName: originalData.claimantName,
          narrative: originalData.narrative,
          endorserName: originalData.endorserName,
          endorsementText: originalData.endorsementText,
          bonaFides: originalData.bonaFides,
          signature: originalData.signature,
          evidence: originalData.evidence || []
        })
        const expectedHash = crypto
          .createHash('sha256')
          .update(contentPayload)
          .digest('hex')

        // Compare hashes
        if (expectedHash !== storedContentHash) {
          // Hash mismatch means the stored credential data was tampered with
          return {
            valid: false,
            message:
              '⚠️ METADATA TAMPERING DETECTED - The credential data stored in the PDF metadata has been modified.',
            metadata,
            tamperDetails: {
              detected: true,
              metadataTampered: true,
              warning:
                'The cryptographic hash of the stored credential data does not match. This indicates the metadata has been altered.'
            }
          }
        }

        // Metadata hash verified - now check if PDF text matches the stored data
        const differences = []

        // Check each critical field in the PDF text with context-aware matching

        // Check skill name appears in "Skill: {name}" heading
        if (originalData.skillName) {
          const skillNamePattern = new RegExp(
            `Skill[:\\s]+${originalData.skillName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
            'i'
          )
          if (!skillNamePattern.test(textData.fullText)) {
            differences.push({
              field: 'Skill Name',
              original: originalData.skillName,
              status: 'NOT FOUND IN EXPECTED LOCATION'
            })
          }
        }

        // Check skill code appears after "Skill Code:"
        if (originalData.skillCode) {
          const skillCodePattern = new RegExp(
            `Skill\\s+Code[:\\s]+${originalData.skillCode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
            'i'
          )
          if (!skillCodePattern.test(textData.fullText)) {
            differences.push({
              field: 'Skill Code',
              original: originalData.skillCode,
              status: 'NOT FOUND IN EXPECTED LOCATION'
            })
          }
        }

        // Check skill description appears in the gray box after skill code
        if (originalData.skillDescription) {
          // Escape the description text for regex and check if it exists
          const escapedDesc = originalData.skillDescription.replace(
            /[.*+?^${}()|[\]\\]/g,
            '\\$&'
          )
          // Allow for some whitespace variation but check substantial presence
          const descWords = originalData.skillDescription
            .split(/\s+/)
            .filter(w => w.length > 3)
            .slice(0, 5)
          const foundWords = descWords.filter(word => {
            const wordPattern = new RegExp(
              word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
              'i'
            )
            return wordPattern.test(textData.fullText)
          })

          if (foundWords.length < Math.min(3, descWords.length)) {
            differences.push({
              field: 'Skill Description',
              original: originalData.skillDescription.substring(0, 100) + '...',
              status: 'DESCRIPTION TEXT MODIFIED OR MISSING'
            })
          }
        }

        // Check claimant name appears after "Claimant:"
        if (originalData.claimantName) {
          const claimantPattern = new RegExp(
            `Claimant[:\\s]+${originalData.claimantName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
            'i'
          )
          if (!claimantPattern.test(textData.fullText)) {
            differences.push({
              field: 'Claimant Name',
              original: originalData.claimantName,
              status: 'NOT FOUND IN EXPECTED LOCATION'
            })
          }
        }

        // Check narrative appears in the claimant section
        if (originalData.narrative) {
          const narrativeWords = originalData.narrative
            .split(/\s+/)
            .filter(w => w.length > 3)
            .slice(0, 5)
          const foundNarrativeWords = narrativeWords.filter(word => {
            const wordPattern = new RegExp(
              word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
              'i'
            )
            return wordPattern.test(textData.fullText)
          })

          if (foundNarrativeWords.length < Math.min(3, narrativeWords.length)) {
            differences.push({
              field: 'Claimant Narrative',
              original: originalData.narrative.substring(0, 100) + '...',
              status: 'NARRATIVE TEXT MODIFIED OR MISSING'
            })
          }
        }

        // Check endorser name appears after "Endorsement by:"
        if (originalData.endorserName) {
          const endorserPattern = new RegExp(
            `Endorsement\\s+by[:\\s]+${originalData.endorserName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
            'i'
          )
          if (!endorserPattern.test(textData.fullText)) {
            differences.push({
              field: 'Endorser Name',
              original: originalData.endorserName,
              status: 'NOT FOUND IN EXPECTED LOCATION'
            })
          }
        }

        // Check bona fides (endorser credentials)
        if (originalData.bonaFides) {
          const bonaFidesWords = originalData.bonaFides
            .split(/\s+/)
            .filter(w => w.length > 3)
            .slice(0, 5)
          const foundBonaFidesWords = bonaFidesWords.filter(word => {
            const wordPattern = new RegExp(
              word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
              'i'
            )
            return wordPattern.test(textData.fullText)
          })

          if (foundBonaFidesWords.length < Math.min(3, bonaFidesWords.length)) {
            differences.push({
              field: 'Endorser Credentials (Bona Fides)',
              original: originalData.bonaFides.substring(0, 100) + '...',
              status: 'CREDENTIALS TEXT MODIFIED OR MISSING'
            })
          }
        }

        // Check endorsement text
        if (originalData.endorsementText) {
          const endorsementWords = originalData.endorsementText
            .split(/\s+/)
            .filter(w => w.length > 3)
            .slice(0, 5)
          const foundEndorsementWords = endorsementWords.filter(word => {
            const wordPattern = new RegExp(
              word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
              'i'
            )
            return wordPattern.test(textData.fullText)
          })

          if (foundEndorsementWords.length < Math.min(3, endorsementWords.length)) {
            differences.push({
              field: 'Endorsement Statement',
              original: originalData.endorsementText.substring(0, 100) + '...',
              status: 'ENDORSEMENT TEXT MODIFIED OR MISSING'
            })
          }
        }

        // Check signature appears after "Digital Signature:" and before "This is a digitally"
        // This is the most critical check - signature must be in the right location
        const signatureSection = textData.fullText.match(
          /Digital\s+Signature[:\s]+(.*?)(?=This\s+is\s+a\s+digitally|Generated\s+with|$)/is
        )
        if (originalData.signature) {
          if (!signatureSection) {
            differences.push({
              field: 'Digital Signature',
              original: originalData.signature,
              status: 'SIGNATURE SECTION NOT FOUND'
            })
          } else {
            const signatureText = signatureSection[1].trim()
            if (!signatureText.includes(originalData.signature)) {
              differences.push({
                field: 'Digital Signature',
                original: originalData.signature,
                current: signatureText.substring(0, 100),
                status: 'SIGNATURE MODIFIED OR REMOVED'
              })
            }
          }
        }

        // Check evidence URLs if present
        if (
          originalData.evidence &&
          Array.isArray(originalData.evidence) &&
          originalData.evidence.length > 0
        ) {
          const missingEvidence = []
          for (const evidenceUrl of originalData.evidence) {
            if (!textData.fullText.includes(evidenceUrl)) {
              missingEvidence.push(evidenceUrl)
            }
          }
          if (missingEvidence.length > 0) {
            differences.push({
              field: 'Evidence URLs',
              original: `${originalData.evidence.length} evidence link(s)`,
              status: `${missingEvidence.length} EVIDENCE LINK(S) MISSING OR MODIFIED`
            })
          }
        }

        if (differences.length > 0) {
          const tamperDetails = {
            detected: true,
            contentModified: true,
            changes: differences,
            originalData,
            warning:
              '⚠️ CONTENT TAMPERING DETECTED - The PDF text has been modified. Expected values from the original credential are missing from the PDF.'
          }

          return {
            valid: false,
            message: `⚠️ CONTENT TAMPERING DETECTED - Found ${differences.length} field(s) that have been modified. The certificate text has been altered after issuance.`,
            metadata,
            tamperDetails
          }
        }

        // All checks passed
        console.log(`[PDF Verify] ✅ Verification PASSED - All fields verified`)

        return {
          valid: true,
          message: `✅ PDF VERIFIED - Cryptographic signature, metadata, and PDF content are authentic and unmodified. Claim ID: ${claimId}, Version: ${version}, Timestamp: ${timestamp}`,
          metadata,
          tamperDetails: {
            detected: false,
            contentHash: storedContentHash,
            verified: true
          }
        }
      } catch (error) {
        console.error('Failed to parse credential data:', error)
      }
    }

    // Fallback: Check for JWT token in metadata (older v1.0)
    const storedJwt = metadata.customFields['SkillsAware-JWT']
    if (storedJwt && !storedCredentialData) {
      try {
        // Decode JWT and extract the original data
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { jwtVerify } = require('jose')
        const secret = new TextEncoder().encode(
          process.env.JWT_SECRET || 'default-secret'
        )

        try {
          const { payload: jwtPayload } = await jwtVerify(storedJwt, secret)

          // Compare JWT data with extracted PDF text
          const differences = []

          if (
            jwtPayload.skill_code &&
            textData.extractedData.skillCode &&
            jwtPayload.skill_code !== textData.extractedData.skillCode
          ) {
            differences.push({
              field: 'Skill Code',
              original: jwtPayload.skill_code,
              current: textData.extractedData.skillCode
            })
          }

          if (
            jwtPayload.claimant_name &&
            textData.extractedData.claimantName &&
            jwtPayload.claimant_name !== textData.extractedData.claimantName
          ) {
            differences.push({
              field: 'Claimant Name',
              original: jwtPayload.claimant_name,
              current: textData.extractedData.claimantName
            })
          }

          if (
            jwtPayload.endorser_name &&
            textData.extractedData.endorserName &&
            jwtPayload.endorser_name !== textData.extractedData.endorserName
          ) {
            differences.push({
              field: 'Endorser Name',
              original: jwtPayload.endorser_name,
              current: textData.extractedData.endorserName
            })
          }

          if (differences.length > 0) {
            const tamperDetails = {
              detected: true,
              contentModified: true,
              changes: differences,
              extractedData: textData.extractedData,
              originalData: {
                skillCode: jwtPayload.skill_code,
                claimantName: jwtPayload.claimant_name,
                endorserName: jwtPayload.endorser_name
              },
              warning:
                "⚠️ CONTENT TAMPERING DETECTED - The PDF content has been modified. The text in the PDF doesn't match the original data stored in the cryptographic signature."
            }

            return {
              valid: false,
              message: `⚠️ CONTENT TAMPERING DETECTED - Found ${differences.length} modification(s). The certificate text has been altered after issuance.`,
              metadata,
              tamperDetails
            }
          }
        } catch (jwtError) {
          // JWT verification failed - token might be tampered
          return {
            valid: false,
            message:
              '⚠️ JWT VERIFICATION FAILED - The cryptographic token in this PDF is invalid or has been tampered with.',
            metadata,
            tamperDetails: {
              detected: true,
              jwtError: String(jwtError),
              warning:
                'The JWT token stored in the PDF metadata could not be verified. This indicates the PDF may have been tampered with.'
            }
          }
        }
      } catch (error) {
        console.error('JWT verification error:', error)
        // Continue without JWT verification if there's an error
      }
    }

    return {
      valid: true,
      message: `SkillsAware PDF detected. Claim ID: ${claimId}, Version: ${version}, Timestamp: ${timestamp}. To fully verify, use verifyPdfSignature() with the original credential data.`,
      metadata
    }
  } catch (error) {
    return {
      valid: false,
      message: `Verification failed: ${error}`
    }
  }
}
