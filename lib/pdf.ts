import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import fs from 'fs';
import { PDFDocument } from 'pdf-lib';
import crypto from 'crypto';

// Function to find Chrome/Edge executable on Windows
function getLocalChromePath(): string | null {
  const paths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    process.env.CHROME_PATH || '',
  ].filter(Boolean);
  for (const path of paths) {
    try {
      if (fs.existsSync(path)) {
        return path;
      }
    } catch {
      // Continue to next path
    }
  }
  return null;
}

export async function generatePdfFromHtml(
  html: string,
  options: { format?: 'A4' } = {}
): Promise<Buffer> {
  let browser;

  try {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const localChromePath = getLocalChromePath();

    if (isDevelopment && localChromePath) {
      // Use local Chrome/Edge for development
      console.log('Using local Chrome/Edge for PDF generation:', localChromePath);
      browser = await puppeteer.launch({
        executablePath: localChromePath,
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    } else {
      // Use chromium for serverless/production environment
      browser = await puppeteer.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath(),
        headless: true,
      });
    }

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Generate PDF with metadata
    const pdf = await page.pdf({
      format: options.format || 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm',
      },
      displayHeaderFooter: false,
      tagged: true,
    });

    return Buffer.from(pdf);
  } catch (error) {
    console.error('PDF generation error:', error);
    // For development: return a simple buffer with HTML if Puppeteer fails
    console.warn('Falling back to HTML-only PDF generation');
    return Buffer.from(html);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Generate cryptographic signature for PDF verification
function generatePdfSignature(data: {
  skillCode: string;
  claimantName: string;
  endorserName: string;
  timestamp: string;
}): string {
  const secret = process.env.JWT_SECRET || 'default-secret';
  const payload = `${data.skillCode}:${data.claimantName}:${data.endorserName}:${data.timestamp}`;
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

export async function renderCredentialPdf(data: {
  skillName: string;
  skillCode: string;
  skillDescription: string;
  claimantName: string;
  narrative: string;
  endorserName: string;
  endorsementText: string;
  bonaFides: string;
  signature: string;
  evidence?: string[];
  logoUrl?: string;
  primaryColor?: string;
  claimId?: string;
  jwtToken?: string;
}): Promise<Buffer> {
  const primaryColor = data.primaryColor || '#0B5FFF';

  // Generate HTML directly without React
  const evidenceHtml = data.evidence && data.evidence.length > 0
    ? `
      <section style="margin-bottom: 30px;">
        <h3 style="color: #333; font-size: 16px; margin-bottom: 10px;">Supporting Evidence</h3>
        <ul style="padding-left: 20px; margin: 0;">
          ${data.evidence.map((url, index) => `
            <li key="${index}" style="font-size: 12px; margin-bottom: 5px; color: #0066cc;">
              <a href="${url}" style="color: #0066cc; text-decoration: none;">${url}</a>
            </li>
          `).join('')}
        </ul>
      </section>
    `
    : '';

  // Generate timestamp and signature
  const timestamp = new Date().toISOString();
  const pdfSignature = generatePdfSignature({
    skillCode: data.skillCode,
    claimantName: data.claimantName,
    endorserName: data.endorserName,
    timestamp,
  });

  const fullHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="author" content="SkillsAware - What's Cookin' Inc." />
        <meta name="subject" content="Skill Endorsement Certificate" />
        <meta name="keywords" content="skill,endorsement,certificate,${data.skillCode}" />
        <meta name="creator" content="SkillsAware OBv3 Endorsement System" />
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; font-size: 12pt; line-height: 1.6; }
        </style>
      </head>
      <body>
        <div style="padding: 40px; font-family: Arial, sans-serif; color: #333;">
          <!-- Header -->
          <div style="border-bottom: 4px solid ${primaryColor}; padding-bottom: 20px; margin-bottom: 30px;">
            ${data.logoUrl ? `<img src="${data.logoUrl}" alt="Logo" style="max-height: 60px; margin-bottom: 10px;" />` : ''}
            <h1 style="color: ${primaryColor}; font-size: 28px; margin: 10px 0;">
              Skill Endorsement Certificate
            </h1>
            <p style="font-size: 14px; color: #666; margin: 5px 0;">
              Issued by: What's Cookin' Inc.
            </p>
            <p style="font-size: 12px; color: #999;">
              ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <!-- Skill Information -->
          <section style="margin-bottom: 30px;">
            <h2 style="color: ${primaryColor}; font-size: 20px; margin-bottom: 10px;">
              Skill: ${data.skillName}
            </h2>
            <p style="font-size: 14px; color: #666; margin-bottom: 5px;">
              <strong>Skill Code:</strong> ${data.skillCode}
            </p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-top: 10px;">
              <p style="font-size: 13px; line-height: 1.6; margin: 0;">
                ${data.skillDescription}
              </p>
            </div>
          </section>

          <!-- Claimant Information -->
          <section style="margin-bottom: 30px;">
            <h3 style="color: #333; font-size: 16px; margin-bottom: 10px;">
              Claimant: ${data.claimantName}
            </h3>
            <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid ${primaryColor}; border-radius: 3px;">
              <p style="font-size: 14px; font-weight: bold; margin-bottom: 8px;">Skill Narrative:</p>
              <p style="font-size: 13px; line-height: 1.6; margin: 0; font-style: italic;">
                "${data.narrative}"
              </p>
            </div>
          </section>

          <!-- Endorsement -->
          <section style="margin-bottom: 30px;">
            <h3 style="color: #333; font-size: 16px; margin-bottom: 10px;">
              Endorsement by: ${data.endorserName}
            </h3>
            <div style="background-color: #f0f8ff; padding: 15px; border-left: 4px solid ${primaryColor}; border-radius: 3px;">
              <p style="font-size: 14px; font-weight: bold; margin-bottom: 8px;">Endorser Credentials:</p>
              <p style="font-size: 13px; margin-bottom: 12px; color: #555;">
                ${data.bonaFides}
              </p>
              <p style="font-size: 14px; font-weight: bold; margin-bottom: 8px;">Endorsement Statement:</p>
              <p style="font-size: 13px; line-height: 1.6; margin: 0; font-style: italic;">
                "${data.endorsementText}"
              </p>
            </div>
          </section>

          ${evidenceHtml}

          <!-- Digital Signature -->
          <section style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
            <p style="font-size: 12px; color: #666; margin-bottom: 10px;">
              <strong>Digital Signature:</strong>
            </p>
            <p style="font-size: 18px; font-family: 'Brush Script MT', cursive; color: ${primaryColor}; margin: 5px 0;">
              ${data.signature}
            </p>
            <p style="font-size: 11px; color: #999; margin-top: 15px;">
              This is a digitally verified skill endorsement certificate.
              <br />
              Certificate ID: ${Math.random().toString(36).substring(7).toUpperCase()}
            </p>
          </section>

          <!-- Footer -->
          <div style="margin-top: 50px; padding-top: 20px; border-top: 2px solid #e0e0e0; text-align: center;">
            <p style="font-size: 11px; color: #999;">
              Generated with SkillsAware OBv3 Endorsement System
              <br />
              Powered by What's Cookin' Inc. | Standards-compliant Open Badges v3.0
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  // Generate PDF from HTML
  const pdfBuffer = await generatePdfFromHtml(fullHtml);

  try {
    // Load the PDF and add metadata with signature
    const pdfDoc = await PDFDocument.load(pdfBuffer);

    // Calculate content hash BEFORE adding metadata
    // This hash is based on the actual credential data that should never change
    const contentPayload = JSON.stringify({
      skillName: data.skillName,
      skillCode: data.skillCode,
      skillDescription: data.skillDescription,
      claimantName: data.claimantName,
      narrative: data.narrative,
      endorserName: data.endorserName,
      endorsementText: data.endorsementText,
      bonaFides: data.bonaFides,
      signature: data.signature,
      evidence: data.evidence || [],
    });
    const contentHash = crypto.createHash('sha256').update(contentPayload).digest('hex');

    // Set PDF metadata
    pdfDoc.setTitle(`Skill Endorsement Certificate - ${data.skillName}`);
    pdfDoc.setSubject('Open Badges v3.0 Skill Endorsement');
    pdfDoc.setAuthor('SkillsAware - What\'s Cookin\' Inc.');
    pdfDoc.setKeywords([
      'skill-endorsement',
      'open-badges-v3',
      data.skillCode,
      `claimant:${data.claimantName}`,
      `endorser:${data.endorserName}`,
    ]);
    pdfDoc.setCreator('SkillsAware OBv3 Endorsement System');
    pdfDoc.setProducer('SkillsAware (https://skillsaware.com)');
    pdfDoc.setCreationDate(new Date());
    pdfDoc.setModificationDate(new Date());

    // Store complete credential data as JSON for verification
    const credentialData = {
      skillName: data.skillName,
      skillCode: data.skillCode,
      skillDescription: data.skillDescription,
      claimantName: data.claimantName,
      narrative: data.narrative,
      endorserName: data.endorserName,
      endorsementText: data.endorsementText,
      bonaFides: data.bonaFides,
      signature: data.signature,
      evidence: data.evidence || [],
    };
    const credentialDataJson = JSON.stringify(credentialData);

    // Add custom metadata with verification signature AND content hash
    // This creates a hidden metadata field that can be extracted for verification
    const customMetadata = {
      'SkillsAware-Signature': pdfSignature,
      'SkillsAware-Timestamp': timestamp,
      'SkillsAware-ClaimID': data.claimId || 'unknown',
      'SkillsAware-Version': 'v1.0',
      'SkillsAware-Issuer': 'What\'s Cookin\' Inc.',
      'SkillsAware-ContentHash': contentHash,
      'SkillsAware-JWT': data.jwtToken || '', // Store JWT token for verification
      'SkillsAware-CredentialData': credentialDataJson, // Store ALL credential data
    };

    // Add custom metadata to PDF info dictionary
    // We embed the verification signature in the PDF's info dictionary
    try {
      const infoDict = pdfDoc.context.lookup(pdfDoc.context.trailerInfo.Info);
      if (infoDict && typeof infoDict === 'object' && 'dict' in infoDict) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dict = (infoDict as any).dict;
        for (const [key, value] of Object.entries(customMetadata)) {
          dict.set(
            pdfDoc.context.obj(key),
            pdfDoc.context.obj(value)
          );
        }
      }
    } catch (dictError) {
      console.warn('Could not set custom metadata in PDF info dict:', dictError);
      // Continue anyway - standard metadata is still set
    }

    // Save the PDF with metadata
    // IMPORTANT: Save without compression so text can be verified
    // This makes verification easier since we can search for text strings directly
    const pdfBytes = await pdfDoc.save({
      useObjectStreams: false,  // Don't use object streams
      // Note: pdf-lib doesn't have a direct "don't compress streams" option
      // but we can work around this by embedding text in metadata
    });
    return Buffer.from(pdfBytes);
  } catch (metadataError) {
    console.error('Failed to add PDF metadata, returning original PDF:', metadataError);
    // If metadata addition fails, return the original PDF
    return pdfBuffer;
  }
}
