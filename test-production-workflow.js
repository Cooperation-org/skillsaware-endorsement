#!/usr/bin/env node

/**
 * End-to-End Production Workflow Test
 *
 * Tests the complete endorsement workflow with S3 integration:
 * 1. Create claim
 * 2. Generate endorser link
 * 3. Submit endorsement
 * 4. Verify S3 uploads
 * 5. Verify webhook delivery (if configured)
 * 6. Verify file downloads
 *
 * Usage:
 *   node test-production-workflow.js [base_url]
 *
 * Example:
 *   node test-production-workflow.js https://your-production-domain.com
 *   node test-production-workflow.js http://localhost:3000
 */

const https = require('https')
const http = require('http')
const { URL } = require('url')

// Configuration
const BASE_URL = process.argv[2] || process.env.API_BASE_URL || 'http://localhost:3000'
const API_KEY =
  process.env.SKILLSAWARE_API_KEY ||
  '8f33e3a4fd9322e89dc15300f603d91654d7eb38802f0cef0440ca292bf2c3f5'
const AWS_REGION = process.env.AWS_REGION || 'us-east-1'
const S3_BUCKET = process.env.S3_BUCKET || 'skillsaware-artifacts-linkedtrust'
const S3_PREFIX = process.env.S3_PREFIX || 'endorsements'

// Test data
const TEST_DATA = {
  tenant_id: 'skillsaware',
  skill_code: 'TEST-PROD-' + Date.now(),
  skill_name: 'Production Test Skill',
  skill_description:
    'This is a test skill for validating the production workflow with S3 integration.',
  claimant_name: 'Test Claimant',
  claimant_email: 'test-claimant@example.com',
  claimant_narrative:
    'I have successfully demonstrated this skill through various projects and real-world applications. This narrative is part of a production workflow test.',
  endorser_name: 'Test Endorser',
  endorser_email: 'test-endorser@example.com',
  endorsement_text:
    'I can confirm that Test Claimant has demonstrated exceptional competency in this skill area. This endorsement is part of a production workflow test.',
  bona_fides: 'Senior Technical Lead at Test Company',
  signature: 'Test Endorser',
  evidence_urls: ['https://example.com/evidence1', 'https://example.com/evidence2']
}

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

// Test results
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  steps: []
}

// Helper functions
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logStep(step, status, message = '') {
  const icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️'
  const color = status === 'pass' ? 'green' : status === 'fail' ? 'red' : 'yellow'
  log(`${icon} [${step}] ${message}`, color)
  results.steps.push({ step, status, message })
  if (status === 'pass') results.passed++
  else if (status === 'fail') results.failed++
  else results.warnings++
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url)
    const isHttps = urlObj.protocol === 'https:'
    const client = isHttps ? https : http

    // Set timeout (default 60 seconds, longer for submission endpoint)
    const timeout =
      options.timeout ||
      (options.method === 'POST' && url.includes('/submit') ? 120000 : 60000)

    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      timeout: timeout
    }

    const req = client.request(requestOptions, res => {
      let data = ''
      res.on('data', chunk => {
        data += chunk
      })
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : {}
          resolve({ status: res.statusCode, headers: res.headers, data: jsonData })
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, data: data })
        }
      })
    })

    req.on('error', error => {
      // Handle timeout and connection errors more gracefully
      if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
        reject(
          new Error(
            `Request timeout or connection reset: ${error.message}. The server may be processing a long-running operation (PDF generation, S3 upload).`
          )
        )
      } else {
        reject(error)
      }
    })

    req.on('timeout', () => {
      req.destroy()
      reject(
        new Error(
          `Request timeout after ${timeout}ms. The server may be processing a long-running operation.`
        )
      )
    })

    if (options.body) {
      req.write(
        typeof options.body === 'string' ? options.body : JSON.stringify(options.body)
      )
    }

    req.end()
  })
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Test functions
async function testCreateClaim() {
  log('\n📋 Step 1: Creating claim...', 'cyan')

  try {
    const response = await makeRequest(`${BASE_URL}/api/v1/claims`, {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY
      },
      body: {
        tenant_id: TEST_DATA.tenant_id,
        skill_code: TEST_DATA.skill_code,
        skill_name: TEST_DATA.skill_name,
        skill_description: TEST_DATA.skill_description,
        claimant_name: TEST_DATA.claimant_name,
        claimant_email: TEST_DATA.claimant_email
      }
    })

    if (response.status !== 200) {
      logStep(
        'Create Claim',
        'fail',
        `Expected 200, got ${response.status}: ${JSON.stringify(response.data)}`
      )
      return null
    }

    if (!response.data.claim_id || !response.data.claimant_link) {
      logStep('Create Claim', 'fail', 'Missing claim_id or claimant_link in response')
      return null
    }

    logStep('Create Claim', 'pass', `Claim created: ${response.data.claim_id}`)
    return {
      claimId: response.data.claim_id,
      claimantToken: response.data.claimant_link.split('token=')[1] || null
    }
  } catch (error) {
    logStep('Create Claim', 'fail', `Error: ${error.message}`)
    return null
  }
}

async function testGenerateEndorserLink(claimId, claimantToken) {
  log('\n🔗 Step 2: Generating endorser link...', 'cyan')

  if (!claimantToken) {
    logStep('Generate Endorser Link', 'fail', 'Missing claimant token')
    return null
  }

  try {
    const response = await makeRequest(
      `${BASE_URL}/api/v1/claims/${claimId}/endorser-link`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${claimantToken}`
        },
        body: {
          claimant_narrative: TEST_DATA.claimant_narrative,
          endorser_name: TEST_DATA.endorser_name,
          endorser_email: TEST_DATA.endorser_email
        }
      }
    )

    if (response.status !== 200) {
      logStep(
        'Generate Endorser Link',
        'fail',
        `Expected 200, got ${response.status}: ${JSON.stringify(response.data)}`
      )
      return null
    }

    if (!response.data.endorser_link) {
      logStep('Generate Endorser Link', 'fail', 'Missing endorser_link in response')
      return null
    }

    const endorserToken = response.data.endorser_link.split('token=')[1] || null
    logStep('Generate Endorser Link', 'pass', 'Endorser link generated successfully')
    return { endorserToken }
  } catch (error) {
    logStep('Generate Endorser Link', 'fail', `Error: ${error.message}`)
    return null
  }
}

async function testSubmitEndorsement(claimId, endorserToken) {
  log('\n📝 Step 3: Submitting endorsement...', 'cyan')

  if (!endorserToken) {
    logStep('Submit Endorsement', 'fail', 'Missing endorser token')
    return null
  }

  // Retry logic for connection issues
  const maxRetries = 3
  let lastError = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 1) {
        log(`   Retry attempt ${attempt}/${maxRetries}...`, 'yellow')
        await sleep(2000) // Wait 2 seconds before retry
      } else {
        log(
          '   Note: This step may take 30-60 seconds (PDF generation + S3 upload)...',
          'yellow'
        )
      }

      const response = await makeRequest(`${BASE_URL}/api/v1/endorsements/submit`, {
        method: 'POST',
        timeout: 120000, // 2 minutes timeout for submission (PDF + S3 upload can take time)
        headers: {
          Authorization: `Bearer ${endorserToken}`
        },
        body: {
          endorsement_text: TEST_DATA.endorsement_text,
          bona_fides: TEST_DATA.bona_fides,
          signature: TEST_DATA.signature,
          evidence_urls: TEST_DATA.evidence_urls
        }
      })

      if (response.status !== 200) {
        logStep(
          'Submit Endorsement',
          'fail',
          `Expected 200, got ${response.status}: ${JSON.stringify(response.data)}`
        )
        return null
      }

      if (!response.data.success) {
        logStep('Submit Endorsement', 'fail', 'Response indicates failure')
        return null
      }

      logStep('Submit Endorsement', 'pass', 'Endorsement submitted successfully')

      // Check S3 upload status
      if (response.data.s3_uploaded === true) {
        logStep('S3 Upload', 'pass', 'Files uploaded to S3 successfully')

        // Verify S3 URLs are present
        if (response.data.downloads?.json?.s3_url) {
          logStep('S3 JSON URL', 'pass', 'S3 presigned URL for JSON provided')
          log(
            `   S3 JSON URL: ${response.data.downloads.json.s3_url.substring(0, 80)}...`,
            'blue'
          )
        } else {
          logStep(
            'S3 JSON URL',
            'warn',
            'S3 URL not provided for JSON (using fallback API URL)'
          )
        }

        if (response.data.downloads?.pdf?.s3_url) {
          logStep('S3 PDF URL', 'pass', 'S3 presigned URL for PDF provided')
          log(
            `   S3 PDF URL: ${response.data.downloads.pdf.s3_url.substring(0, 80)}...`,
            'blue'
          )
        } else {
          logStep(
            'S3 PDF URL',
            'warn',
            'S3 URL not provided for PDF (using fallback API URL)'
          )
        }

        // Check S3 keys
        if (response.data.s3_keys) {
          log(`   S3 JSON Key: ${response.data.s3_keys.json}`, 'blue')
          log(`   S3 PDF Key: ${response.data.s3_keys.pdf}`, 'blue')
        }
      } else if (response.data.s3_uploaded === false) {
        logStep('S3 Upload', 'warn', 'S3 upload not performed (may not be configured)')
      }

      // Check webhook status
      if (response.data.webhook_delivered === true) {
        logStep('Webhook Delivery', 'pass', 'Webhook delivered successfully')
      } else if (response.data.webhook_delivered === false) {
        logStep(
          'Webhook Delivery',
          'warn',
          'Webhook not delivered (may not be configured or S3 upload failed)'
        )
      }

      return {
        claimId: response.data.claim_id,
        downloads: response.data.downloads,
        jsonBase64: response.data.json_base64,
        s3Uploaded: response.data.s3_uploaded,
        s3Keys: response.data.s3_keys,
        webhookDelivered: response.data.webhook_delivered
      }
    } catch (error) {
      lastError = error
      const isConnectionError =
        error.message.includes('ECONNRESET') ||
        error.message.includes('ETIMEDOUT') ||
        error.message.includes('timeout')

      if (isConnectionError && attempt < maxRetries) {
        log(
          `   Connection error (attempt ${attempt}/${maxRetries}): ${error.message}`,
          'yellow'
        )
        continue // Retry
      } else {
        logStep('Submit Endorsement', 'fail', `Error: ${error.message}`)
        if (isConnectionError) {
          log(
            '   Tip: The server may have processed the request successfully. Check server logs.',
            'yellow'
          )
        }
        return null
      }
    }
  }

  // If we get here, all retries failed
  logStep(
    'Submit Endorsement',
    'fail',
    `Failed after ${maxRetries} attempts: ${lastError?.message}`
  )
  return null
}

async function testDownloadFiles(downloads, endorserToken) {
  log('\n📥 Step 4: Testing file downloads...', 'cyan')

  if (!downloads || !downloads.json || !downloads.pdf) {
    logStep('Download Files', 'fail', 'Missing download URLs in response')
    return false
  }

  let jsonDownloaded = false
  let pdfDownloaded = false

  // Test JSON download
  try {
    const jsonResponse = await makeRequest(downloads.json.url)
    if (jsonResponse.status === 200) {
      const jsonData =
        typeof jsonResponse.data === 'string'
          ? JSON.parse(jsonResponse.data)
          : jsonResponse.data
      if (jsonData['@context'] && jsonData.type) {
        logStep(
          'Download JSON',
          'pass',
          `JSON downloaded successfully (${JSON.stringify(jsonResponse.data).length} bytes)`
        )
        jsonDownloaded = true
      } else {
        logStep(
          'Download JSON',
          'fail',
          'Downloaded JSON does not appear to be valid OBv3 credential'
        )
      }
    } else {
      logStep(
        'Download JSON',
        'fail',
        `Download failed with status ${jsonResponse.status}`
      )
    }
  } catch (error) {
    logStep('Download JSON', 'fail', `Error downloading JSON: ${error.message}`)
  }

  // Test PDF download (may take longer)
  try {
    log('   Waiting for PDF generation...', 'yellow')
    await sleep(2000) // Give PDF time to generate if needed

    const pdfResponse = await makeRequest(downloads.pdf.url)
    if (pdfResponse.status === 200) {
      const pdfSize =
        typeof pdfResponse.data === 'string'
          ? pdfResponse.data.length
          : Buffer.isBuffer(pdfResponse.data)
            ? pdfResponse.data.length
            : 0
      if (pdfSize > 1000) {
        // PDFs should be at least 1KB
        logStep(
          'Download PDF',
          'pass',
          `PDF downloaded successfully (~${Math.round(pdfSize / 1024)} KB)`
        )
        pdfDownloaded = true
      } else {
        logStep('Download PDF', 'fail', `PDF appears too small (${pdfSize} bytes)`)
      }
    } else {
      logStep('Download PDF', 'fail', `Download failed with status ${pdfResponse.status}`)
    }
  } catch (error) {
    logStep('Download PDF', 'fail', `Error downloading PDF: ${error.message}`)
  }

  return jsonDownloaded && pdfDownloaded
}

async function testS3Verification(claimId) {
  log('\n☁️  Step 5: Verifying S3 uploads...', 'cyan')

  if (!S3_BUCKET) {
    logStep(
      'S3 Verification',
      'warn',
      'S3_BUCKET not configured, skipping S3 verification'
    )
    return false
  }

  // Note: This would require AWS SDK to actually check S3
  // For now, we'll just verify the expected keys
  const jsonKey = `${S3_PREFIX}/${claimId}/claim.obv3.json`
  const pdfKey = `${S3_PREFIX}/${claimId}/claim.pdf`

  log(`   Expected JSON key: s3://${S3_BUCKET}/${jsonKey}`, 'blue')
  log(`   Expected PDF key: s3://${S3_BUCKET}/${pdfKey}`, 'blue')
  logStep(
    'S3 Verification',
    'warn',
    'Manual verification required - check S3 bucket for files'
  )

  log('\n   To verify manually:', 'yellow')
  log(`   aws s3 ls s3://${S3_BUCKET}/${S3_PREFIX}/${claimId}/`, 'blue')

  return true
}

// Main test execution
async function runTests() {
  log('\n🚀 Starting Production Workflow Test', 'cyan')
  log(`   Base URL: ${BASE_URL}`, 'blue')
  log(`   S3 Bucket: ${S3_BUCKET || 'Not configured'}`, 'blue')
  log(`   S3 Prefix: ${S3_PREFIX}`, 'blue')
  log(`   Test Skill Code: ${TEST_DATA.skill_code}`, 'blue')

  // Step 1: Create claim
  const claimResult = await testCreateClaim()
  if (!claimResult) {
    log('\n❌ Test failed at claim creation step', 'red')
    printSummary()
    process.exit(1)
  }

  // Step 2: Generate endorser link
  const endorserResult = await testGenerateEndorserLink(
    claimResult.claimId,
    claimResult.claimantToken
  )
  if (!endorserResult) {
    log('\n❌ Test failed at endorser link generation step', 'red')
    printSummary()
    process.exit(1)
  }

  // Step 3: Submit endorsement
  const submitResult = await testSubmitEndorsement(
    claimResult.claimId,
    endorserResult.endorserToken
  )
  if (!submitResult) {
    log('\n❌ Test failed at endorsement submission step', 'red')
    printSummary()
    process.exit(1)
  }

  // Step 4: Test downloads
  await testDownloadFiles(submitResult.downloads, endorserResult.endorserToken)

  // Step 5: Verify S3 (if configured)
  await testS3Verification(submitResult.claimId)

  // Print summary
  printSummary(submitResult)
}

function printSummary(submitResult = null) {
  log('\n' + '='.repeat(60), 'cyan')
  log('📊 Test Summary', 'cyan')
  log('='.repeat(60), 'cyan')

  log(`\n✅ Passed: ${results.passed}`, 'green')
  log(`❌ Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green')
  log(`⚠️  Warnings: ${results.warnings}`, results.warnings > 0 ? 'yellow' : 'green')

  if (submitResult) {
    log('\n📋 Submission Details:', 'cyan')
    log(`   Claim ID: ${submitResult.claimId}`, 'blue')
    log(
      `   S3 Uploaded: ${submitResult.s3Uploaded ? 'Yes ✅' : 'No ⚠️'}`,
      submitResult.s3Uploaded ? 'green' : 'yellow'
    )
    log(
      `   Webhook Delivered: ${submitResult.webhookDelivered ? 'Yes ✅' : 'No ⚠️'}`,
      submitResult.webhookDelivered ? 'green' : 'yellow'
    )

    if (submitResult.downloads) {
      log('\n📥 Download URLs:', 'cyan')
      if (submitResult.downloads.json.s3_url) {
        log(
          `   JSON (S3): ${submitResult.downloads.json.s3_url.substring(0, 100)}...`,
          'green'
        )
        log(
          `   JSON (API fallback): ${submitResult.downloads.json.url.substring(0, 100)}...`,
          'blue'
        )
      } else {
        log(`   JSON: ${submitResult.downloads.json.url}`, 'blue')
      }
      if (submitResult.downloads.pdf.s3_url) {
        log(
          `   PDF (S3): ${submitResult.downloads.pdf.s3_url.substring(0, 100)}...`,
          'green'
        )
        log(
          `   PDF (API fallback): ${submitResult.downloads.pdf.url.substring(0, 100)}...`,
          'blue'
        )
      } else {
        log(`   PDF: ${submitResult.downloads.pdf.url}`, 'blue')
      }
    }
  }

  log('\n' + '='.repeat(60), 'cyan')

  if (results.failed > 0) {
    log('\n❌ Some tests failed. Please review the output above.', 'red')
    process.exit(1)
  } else if (results.warnings > 0) {
    log(
      '\n⚠️  Tests passed with warnings. Review S3 and webhook configuration.',
      'yellow'
    )
    process.exit(0)
  } else {
    log('\n✅ All tests passed successfully!', 'green')
    process.exit(0)
  }
}

// Run tests
runTests().catch(error => {
  log(`\n💥 Unexpected error: ${error.message}`, 'red')
  console.error(error)
  process.exit(1)
})
