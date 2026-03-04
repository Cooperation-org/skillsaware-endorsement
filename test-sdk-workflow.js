#!/usr/bin/env node

/**
 * End-to-End SDK Workflow Test
 *
 * Runs the full endorsement workflow using skillsaware-endorsement-sdk:
 * 1. Create claim (createClaim)
 * 2. Generate endorser link (generateEndorserLink)
 * 3. Submit endorsement (submitEndorsement)
 * 4. Test JSON/PDF download URLs from response
 * 5. Verify PDF via verifyPdf() (basic + full signature)
 *
 * Usage:
 *   node test-sdk-workflow.js [base_url]
 *
 * Example:
 *   node test-sdk-workflow.js https://your-production-domain.com
 *   node test-sdk-workflow.js http://localhost:3000
 *
 * Env: API_BASE_URL, SKILLSAWARE_API_KEY (optional)
 */

const path = require('path')

// Load SDK from local package (built CJS)
const sdkPath = path.join(__dirname, 'packages', 'endorsement-sdk', 'dist', 'index.cjs')
const {
  createClaim,
  generateEndorserLink,
  submitEndorsement,
  getDownloadUrl,
  verifyPdf,
  EndorsementApiError
} = require(sdkPath)

const https = require('https')
const http = require('http')
const { URL } = require('url')

// Configuration
const BASE_URL =
  process.argv[2] || process.env.API_BASE_URL || 'http://localhost:3000'
const API_KEY =
  process.env.SKILLSAWARE_API_KEY ||
  '8f33e3a4fd9322e89dc15300f603d91654d7eb38802f0cef0440ca292bf2c3f5'

const TEST_DATA = {
  tenant_id: 'skillsaware',
  skill_code: 'TEST-SDK-' + Date.now(),
  skill_name: 'SDK Workflow Test Skill',
  skill_description:
    'Test skill for validating the endorsement workflow via skillsaware-endorsement-sdk.',
  claimant_name: 'SDK Test Claimant',
  claimant_email: 'sdk-claimant@example.com',
  claimant_narrative:
    'I have demonstrated this skill through projects. This is an SDK workflow test.',
  endorser_name: 'SDK Test Endorser',
  endorser_email: 'sdk-endorser@example.com',
  endorsement_text:
    'I confirm the claimant has demonstrated competency. SDK workflow test.',
  bona_fides: 'Technical Lead at Test Co',
  signature: 'SDK Test Endorser',
  evidence_urls: ['https://example.com/evidence1']
}

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

const results = { passed: 0, failed: 0, warnings: 0, steps: [] }

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

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url)
    const isHttps = urlObj.protocol === 'https:'
    const client = isHttps ? https : http
    const timeout = 60000

    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      timeout
    }

    const req = client.request(requestOptions, res => {
      const chunks = []
      res.on('data', chunk => chunks.push(chunk))
      res.on('end', () => {
        const data = Buffer.concat(chunks)
        const contentType = res.headers['content-type'] || ''
        if (contentType.includes('application/json')) {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data.toString()) })
          } catch {
            resolve({ status: res.statusCode, data: data.toString() })
          }
        } else {
          resolve({ status: res.statusCode, data })
        }
      })
    })
    req.on('error', reject)
    req.on('timeout', () => {
      req.destroy()
      reject(new Error(`Request timeout after ${timeout}ms`))
    })
    req.end()
  })
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

async function runTests() {
  log('\n🚀 SDK Workflow Test (skillsaware-endorsement-sdk)', 'cyan')
  log(`   Base URL: ${BASE_URL}`, 'blue')
  log(`   Skill Code: ${TEST_DATA.skill_code}`, 'blue')

  let claimId, claimantToken, endorserToken, submitResult

  // Step 1: Create claim via SDK
  log('\n📋 Step 1: createClaim()...', 'cyan')
  try {
    const createResult = await createClaim(
      { baseUrl: BASE_URL, apiKey: API_KEY },
      {
        tenant_id: TEST_DATA.tenant_id,
        skill_code: TEST_DATA.skill_code,
        skill_name: TEST_DATA.skill_name,
        skill_description: TEST_DATA.skill_description,
        claimant_name: TEST_DATA.claimant_name,
        claimant_email: TEST_DATA.claimant_email
      }
    )
    if (!createResult.claim_id || !createResult.claimant_link) {
      logStep('Create Claim', 'fail', 'Missing claim_id or claimant_link')
      printSummary()
      process.exit(1)
    }
    claimId = createResult.claim_id
    claimantToken = createResult.claimant_link.split('token=')[1] || null
    logStep('Create Claim', 'pass', `Claim created: ${claimId}`)
  } catch (e) {
    const msg = e instanceof EndorsementApiError ? `${e.message} (${e.status})` : e.message
    logStep('Create Claim', 'fail', msg)
    printSummary()
    process.exit(1)
  }

  // Step 2: Generate endorser link via SDK
  log('\n🔗 Step 2: generateEndorserLink()...', 'cyan')
  if (!claimantToken) {
    logStep('Generate Endorser Link', 'fail', 'No claimant token')
    printSummary()
    process.exit(1)
  }
  try {
    const linkResult = await generateEndorserLink(
      { baseUrl: BASE_URL, claimantToken },
      {
        claimId,
        claimant_narrative: TEST_DATA.claimant_narrative,
        endorser_name: TEST_DATA.endorser_name,
        endorser_email: TEST_DATA.endorser_email
      }
    )
    if (!linkResult.endorser_link) {
      logStep('Generate Endorser Link', 'fail', 'Missing endorser_link')
      printSummary()
      process.exit(1)
    }
    endorserToken = linkResult.endorser_link.split('token=')[1] || null
    logStep('Generate Endorser Link', 'pass', 'Endorser link generated')
  } catch (e) {
    const msg = e instanceof EndorsementApiError ? `${e.message} (${e.status})` : e.message
    logStep('Generate Endorser Link', 'fail', msg)
    printSummary()
    process.exit(1)
  }

  // Step 3: Submit endorsement via SDK
  log('\n📝 Step 3: submitEndorsement()...', 'cyan')
  if (!endorserToken) {
    logStep('Submit Endorsement', 'fail', 'No endorser token')
    printSummary()
    process.exit(1)
  }
  try {
    log('   (May take 30–60s for PDF generation...)', 'yellow')
    submitResult = await submitEndorsement(
      { baseUrl: BASE_URL, endorserToken },
      {
        endorsement_text: TEST_DATA.endorsement_text,
        bona_fides: TEST_DATA.bona_fides,
        signature: TEST_DATA.signature,
        evidence_urls: TEST_DATA.evidence_urls
      }
    )
    if (!submitResult.success || !submitResult.downloads) {
      logStep('Submit Endorsement', 'fail', 'Response missing success or downloads')
      printSummary()
      process.exit(1)
    }
    logStep('Submit Endorsement', 'pass', 'Endorsement submitted')
    if (submitResult.s3_uploaded) {
      logStep('S3 Upload', 'pass', 'Files uploaded to S3')
    } else {
      logStep('S3 Upload', 'warn', 'S3 not configured or upload skipped')
    }
  } catch (e) {
    const msg = e instanceof EndorsementApiError ? `${e.message} (${e.status})` : e.message
    logStep('Submit Endorsement', 'fail', msg)
    printSummary()
    process.exit(1)
  }

  // Step 4: getDownloadUrl() and verify download URLs work
  log('\n📥 Step 4: getDownloadUrl() and download check...', 'cyan')
  const { getDownloadUrl: getUrl } = require(sdkPath)
  const jsonUrlResult = getUrl(
    { baseUrl: BASE_URL, token: endorserToken },
    { claimId, type: 'json' }
  )
  const pdfUrlResult = getUrl(
    { baseUrl: BASE_URL, token: endorserToken },
    { claimId, type: 'pdf' }
  )
  if (!jsonUrlResult.url || !pdfUrlResult.url) {
    logStep('getDownloadUrl', 'fail', 'Missing URL in result')
  } else {
    logStep('getDownloadUrl', 'pass', 'JSON and PDF URLs built')
  }

  // Hit the URLs from submit response (they include token/params)
  const downloads = submitResult.downloads
  if (downloads.json?.url) {
    try {
      const jsonRes = await makeRequest(downloads.json.url)
      if (jsonRes.status === 200) {
        const data = typeof jsonRes.data === 'object' ? jsonRes.data : JSON.parse(jsonRes.data)
        if (data['@context'] || data.type) {
          logStep('Download JSON', 'pass', 'JSON downloaded and valid')
        } else {
          logStep('Download JSON', 'fail', 'Response not valid OBv3 JSON')
        }
      } else {
        logStep('Download JSON', 'fail', `Status ${jsonRes.status}`)
      }
    } catch (e) {
      logStep('Download JSON', 'fail', e.message)
    }
  } else {
    logStep('Download JSON', 'fail', 'No JSON URL in response')
  }

  let pdfBuffer = null
  if (downloads.pdf?.url) {
    await sleep(2000)
    try {
      const pdfRes = await makeRequest(downloads.pdf.url)
      if (pdfRes.status === 200) {
        const size = Buffer.isBuffer(pdfRes.data) ? pdfRes.data.length : (pdfRes.data && pdfRes.data.length) || 0
        if (size > 1000) {
          logStep('Download PDF', 'pass', `PDF downloaded (~${Math.round(size / 1024)} KB)`)
          pdfBuffer = Buffer.isBuffer(pdfRes.data) ? pdfRes.data : Buffer.from(pdfRes.data)
        } else {
          logStep('Download PDF', 'fail', `PDF too small (${size} bytes)`)
        }
      } else {
        logStep('Download PDF', 'fail', `Status ${pdfRes.status}`)
      }
    } catch (e) {
      logStep('Download PDF', 'fail', e.message)
    }
  } else {
    logStep('Download PDF', 'fail', 'No PDF URL in response')
  }

  // Step 5: verifyPdf() – basic + full signature verification
  if (pdfBuffer) {
    log('\n🔍 Step 5: verifyPdf()...', 'cyan')
    try {
      const verification = await verifyPdf(
        { baseUrl: BASE_URL },
        pdfBuffer,
        {
          skillCode: TEST_DATA.skill_code,
          claimantName: TEST_DATA.claimant_name,
          endorserName: TEST_DATA.endorser_name
        }
      )
      if (verification.basicVerification?.valid) {
        logStep('Verify PDF (basic)', 'pass', verification.basicVerification.message)
      } else {
        logStep('Verify PDF (basic)', 'fail', verification.basicVerification?.message || 'Invalid')
      }
      if (verification.fullVerification) {
        if (verification.fullVerification.valid) {
          logStep('Verify PDF (signature)', 'pass', verification.fullVerification.message)
        } else {
          logStep('Verify PDF (signature)', 'fail', verification.fullVerification.message || 'Invalid')
        }
      } else {
        logStep('Verify PDF (signature)', 'warn', 'Full verification not returned')
      }
    } catch (e) {
      const msg = e instanceof EndorsementApiError ? `${e.message} (${e.status})` : e.message
      logStep('Verify PDF', 'fail', msg)
    }
  } else {
    log('\n🔍 Step 5: verifyPdf()...', 'cyan')
    logStep('Verify PDF', 'warn', 'Skipped (no PDF buffer)')
  }

  printSummary(submitResult)
}

function printSummary(submitResult = null) {
  log('\n' + '='.repeat(60), 'cyan')
  log('📊 SDK Test Summary', 'cyan')
  log('='.repeat(60), 'cyan')
  log(`\n✅ Passed: ${results.passed}`, 'green')
  log(`❌ Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green')
  log(`⚠️  Warnings: ${results.warnings}`, results.warnings > 0 ? 'yellow' : 'green')
  if (submitResult) {
    log('\n📋 Submission', 'cyan')
    log(`   Claim ID: ${submitResult.claim_id}`, 'blue')
    log(`   S3 Uploaded: ${submitResult.s3_uploaded ? 'Yes' : 'No'}`, 'blue')
  }
  log('\n' + '='.repeat(60), 'cyan')
  if (results.failed > 0) {
    log('\n❌ Some tests failed.', 'red')
    process.exit(1)
  }
  log('\n✅ All SDK workflow tests passed.', 'green')
  process.exit(0)
}

runTests().catch(err => {
  log(`\n💥 Error: ${err.message}`, 'red')
  console.error(err)
  process.exit(1)
})
