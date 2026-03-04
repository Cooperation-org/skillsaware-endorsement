#!/usr/bin/env node

/**
 * Test the SDK via the deployed endorsement-client.
 *
 * Step 1: Create claim by calling the CLIENT app (skillsaware-endorsement-client.vercel.app).
 *         The client uses skillsaware-endorsement-sdk to call the backend → tests SDK in production.
 * Steps 2–5: Complete the workflow against the BACKEND (skillsaware-endorsement.vercel.app).
 *
 * Usage:
 *   node test-sdk-via-client.js
 *   node test-sdk-via-client.js https://skillsaware-endorsement-client.vercel.app https://skillsaware-endorsement.vercel.app
 *
 * Env: CLIENT_URL, BACKEND_URL, SKILLSAWARE_API_KEY (optional)
 */

const https = require('https')
const http = require('http')
const { URL } = require('url')
const path = require('path')

const CLIENT_URL =
  process.argv[2] || process.env.CLIENT_URL || 'https://skillsaware-endorsement-client.vercel.app'
const BACKEND_URL =
  process.argv[3] || process.env.BACKEND_URL || 'https://skillsaware-endorsement.vercel.app'
const API_KEY =
  process.env.SKILLSAWARE_API_KEY ||
  '8f33e3a4fd9322e89dc15300f603d91654d7eb38802f0cef0440ca292bf2c3f5'

const TEST_DATA = {
  tenant_id: 'skillsaware',
  skill_code: 'TEST-SDK-CLIENT-' + Date.now(),
  skill_name: 'SDK via Client Test',
  skill_description: 'Test skill: SDK exercised via deployed endorsement-client.',
  claimant_name: 'SDK Client Test User',
  claimant_email: 'sdk-client@example.com',
  claimant_narrative: 'I have demonstrated this skill. SDK via client test.',
  endorser_name: 'SDK Client Endorser',
  endorser_email: 'sdk-endorser@example.com',
  endorsement_text: 'I confirm competency. SDK via client test.',
  bona_fides: 'Technical Lead',
  signature: 'SDK Client Endorser',
  evidence_urls: ['https://example.com/evidence1']
}

const colors = { reset: '\x1b[0m', green: '\x1b[32m', red: '\x1b[31m', yellow: '\x1b[33m', blue: '\x1b[34m', cyan: '\x1b[36m' }
const results = { passed: 0, failed: 0, warnings: 0 }

function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`)
}

function logStep(step, status, message = '') {
  const icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️'
  const c = status === 'pass' ? 'green' : status === 'fail' ? 'red' : 'yellow'
  log(`${icon} [${step}] ${message}`, c)
  if (status === 'pass') results.passed++
  else if (status === 'fail') results.failed++
  else results.warnings++
}

function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url)
    const isHttps = u.protocol === 'https:'
    const client = isHttps ? https : http
    const opts = {
      hostname: u.hostname,
      port: u.port || (isHttps ? 443 : 80),
      path: u.pathname + u.search,
      method: options.method || 'GET',
      headers: { 'Content-Type': 'application/json', ...options.headers },
      timeout: options.timeout || 60000
    }
    const req = client.request(opts, res => {
      const chunks = []
      res.on('data', c => chunks.push(c))
      res.on('end', () => {
        const data = Buffer.concat(chunks)
        const ct = res.headers['content-type'] || ''
        let body = ct.includes('application/json')
          ? (() => { try { return JSON.parse(data.toString()) } catch (_) { return data } })()
          : data
        resolve({ status: res.statusCode, data: body })
      })
    })
    req.on('error', reject)
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')) })
    if (options.body) req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body))
    req.end()
  })
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

async function run() {
  log('\n🚀 SDK test via endorsement-client (create claim on client, rest on backend)', 'cyan')
  log(`   Client:  ${CLIENT_URL}`, 'blue')
  log(`   Backend: ${BACKEND_URL}`, 'blue')
  log(`   Skill:   ${TEST_DATA.skill_code}\n`, 'blue')

  let claimId, claimantToken, endorserToken, submitResult

  // --- Step 1: Create claim via CLIENT (this uses the SDK in production) ---
  log('📋 Step 1: Create claim via client (SDK in production)...', 'cyan')
  try {
    const createUrl = `${CLIENT_URL.replace(/\/+$/, '')}/api/create-claim`
    const res = await request(createUrl, {
      method: 'POST',
      body: {
        tenant_id: TEST_DATA.tenant_id,
        skill_code: TEST_DATA.skill_code,
        skill_name: TEST_DATA.skill_name,
        skill_description: TEST_DATA.skill_description,
        claimant_name: TEST_DATA.claimant_name,
        claimant_email: TEST_DATA.claimant_email
      }
    })
    if (res.status !== 200) {
      logStep('Create claim (via client)', 'fail', `Status ${res.status}: ${JSON.stringify(res.data)}`)
      printSummary()
      process.exit(1)
    }
    const data = res.data && typeof res.data === 'object' ? res.data : {}
    if (!data.claim_id || !data.claimant_link) {
      logStep('Create claim (via client)', 'fail', 'Missing claim_id or claimant_link')
      printSummary()
      process.exit(1)
    }
    claimId = data.claim_id
    claimantToken = (data.claimant_link || '').split('token=')[1] || null
    logStep('Create claim (via client)', 'pass', `Claim created: ${claimId} (SDK used by client)`)
  } catch (e) {
    logStep('Create claim (via client)', 'fail', e.message)
    printSummary()
    process.exit(1)
  }

  // --- Step 2: Generate endorser link (backend) ---
  log('\n🔗 Step 2: Generate endorser link (backend)...', 'cyan')
  if (!claimantToken) {
    logStep('Endorser link', 'fail', 'No claimant token')
    process.exit(1)
  }
  try {
    const res = await request(
      `${BACKEND_URL.replace(/\/+$/, '')}/api/v1/claims/${encodeURIComponent(claimId)}/endorser-link`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${claimantToken}` },
        body: {
          claimant_narrative: TEST_DATA.claimant_narrative,
          endorser_name: TEST_DATA.endorser_name,
          endorser_email: TEST_DATA.endorser_email
        }
      }
    )
    if (res.status !== 200) {
      logStep('Endorser link', 'fail', `Status ${res.status}: ${JSON.stringify(res.data)}`)
      process.exit(1)
    }
    const linkData = res.data && typeof res.data === 'object' ? res.data : {}
    const el = (linkData.endorser_link || '').split('token=')[1]
    if (!el) {
      logStep('Endorser link', 'fail', 'Missing endorser_link')
      process.exit(1)
    }
    endorserToken = el
    logStep('Endorser link', 'pass', 'Generated')
  } catch (e) {
    logStep('Endorser link', 'fail', e.message)
    process.exit(1)
  }

  // --- Step 3: Submit endorsement (backend) ---
  log('\n📝 Step 3: Submit endorsement (backend)...', 'cyan')
  try {
    log('   (May take 30–60s for PDF...)', 'yellow')
    const res = await request(`${BACKEND_URL.replace(/\/+$/, '')}/api/v1/endorsements/submit`, {
      method: 'POST',
      timeout: 120000,
      headers: { Authorization: `Bearer ${endorserToken}` },
      body: {
        endorsement_text: TEST_DATA.endorsement_text,
        bona_fides: TEST_DATA.bona_fides,
        signature: TEST_DATA.signature,
        evidence_urls: TEST_DATA.evidence_urls
      }
    })
    if (res.status !== 200) {
      logStep('Submit endorsement', 'fail', `Status ${res.status}: ${JSON.stringify(res.data)}`)
      process.exit(1)
    }
    submitResult = res.data && typeof res.data === 'object' ? res.data : {}
    if (!submitResult.success || !submitResult.downloads) {
      logStep('Submit endorsement', 'fail', 'Missing success or downloads')
      process.exit(1)
    }
    logStep('Submit endorsement', 'pass', 'Submitted')
    if (submitResult.s3_uploaded) logStep('S3 upload', 'pass', 'Files uploaded')
    else logStep('S3 upload', 'warn', 'Not configured')
  } catch (e) {
    logStep('Submit endorsement', 'fail', e.message)
    process.exit(1)
  }

  // --- Step 4: Download JSON/PDF (backend) ---
  log('\n📥 Step 4: Download JSON & PDF...', 'cyan')
  const downloads = submitResult.downloads || {}
  if (downloads.json && downloads.json.url) {
    try {
      const r = await request(downloads.json.url)
      if (r.status === 200) {
        const d = typeof r.data === 'object' ? r.data : {}
        if (d['@context'] || d.type) logStep('Download JSON', 'pass', 'Valid OBv3')
        else logStep('Download JSON', 'fail', 'Invalid JSON')
      } else logStep('Download JSON', 'fail', `Status ${r.status}`)
    } catch (e) {
      logStep('Download JSON', 'fail', e.message)
    }
  } else logStep('Download JSON', 'fail', 'No URL')

  await sleep(2000)
  if (downloads.pdf && downloads.pdf.url) {
    try {
      const r = await request(downloads.pdf.url)
      if (r.status === 200) {
        const size = Buffer.isBuffer(r.data) ? r.data.length : (r.data && r.data.length) || 0
        logStep('Download PDF', 'pass', size > 1000 ? `~${Math.round(size / 1024)} KB` : 'OK')
      } else logStep('Download PDF', 'fail', `Status ${r.status}`)
    } catch (e) {
      logStep('Download PDF', 'fail', e.message)
    }
  } else logStep('Download PDF', 'fail', 'No URL')

  // --- Step 5: Verify PDF with SDK (optional - load SDK and verify) ---
  log('\n🔍 Step 5: Verify PDF (SDK verifyPdf)...', 'cyan')
  let pdfBuffer = null
  if (downloads.pdf && downloads.pdf.url) {
    try {
      const r = await request(downloads.pdf.url)
      if (r.status === 200 && Buffer.isBuffer(r.data)) pdfBuffer = r.data
      else if (r.status === 200 && r.data) pdfBuffer = Buffer.from(r.data)
    } catch (_) {}
  }
  if (pdfBuffer) {
    try {
      const sdkPath = path.join(__dirname, 'packages', 'endorsement-sdk', 'dist', 'index.cjs')
      const { verifyPdf } = require(sdkPath)
      const verification = await verifyPdf(
        { baseUrl: BACKEND_URL },
        pdfBuffer,
        {
          skillCode: TEST_DATA.skill_code,
          claimantName: TEST_DATA.claimant_name,
          endorserName: TEST_DATA.endorser_name
        }
      )
      if (verification.basicVerification && verification.basicVerification.valid) {
        logStep('Verify PDF (basic)', 'pass', verification.basicVerification.message)
      } else {
        logStep('Verify PDF (basic)', 'fail', (verification.basicVerification && verification.basicVerification.message) || 'Invalid')
      }
      if (verification.fullVerification && verification.fullVerification.valid) {
        logStep('Verify PDF (signature)', 'pass', verification.fullVerification.message)
      } else if (verification.fullVerification) {
        logStep('Verify PDF (signature)', 'fail', verification.fullVerification.message || 'Invalid')
      }
    } catch (e) {
      logStep('Verify PDF', 'fail', e.message)
    }
  } else {
    logStep('Verify PDF', 'warn', 'No PDF buffer')
  }

  printSummary(submitResult)
}

function printSummary(submitResult = null) {
  log('\n' + '='.repeat(60), 'cyan')
  log('📊 SDK-via-Client Test Summary', 'cyan')
  log('='.repeat(60), 'cyan')
  log(`\n✅ Passed: ${results.passed}`, 'green')
  log(`❌ Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green')
  log(`⚠️  Warnings: ${results.warnings}`, results.warnings > 0 ? 'yellow' : 'green')
  if (submitResult && submitResult.claim_id) {
    log(`\n   Claim ID: ${submitResult.claim_id}`, 'blue')
    log(`   S3: ${submitResult.s3_uploaded ? 'Yes' : 'No'}`, 'blue')
  }
  log('\n' + '='.repeat(60), 'cyan')
  if (results.failed > 0) {
    log('\n❌ Some tests failed.', 'red')
    process.exit(1)
  }
  log('\n✅ SDK test via client passed.', 'green')
  process.exit(0)
}

run().catch(err => {
  log(`\n💥 Error: ${err.message}`, 'red')
  console.error(err)
  process.exit(1)
})
