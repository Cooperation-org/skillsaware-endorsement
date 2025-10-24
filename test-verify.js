const fs = require('fs');
const pdf = require('pdf-parse-fork');

async function test() {
  console.log('=== TESTING ORIGINAL PDF ===');
  const original = fs.readFileSync('E:/skillsaware-endorsement/public/ICTDSN403-91ff17dc-2b54-45dc-9079-3d439acdad47.pdf');
  const originalText = (await pdf(original)).text;

  const signature = 'Muhammad Hany';
  const signatureSection = originalText.match(/Digital\s+Signature[:\s]+(.*?)(?=This\s+is\s+a\s+digitally|Generated\s+with|$)/is);

  console.log('Signature section found:', signatureSection != null);
  if (signatureSection) {
    console.log('Signature section content:', JSON.stringify(signatureSection[1].trim()));
    console.log('Contains original signature?', signatureSection[1].includes(signature));
  }

  console.log('');
  console.log('=== TESTING EDITED PDF ===');
  const edited = fs.readFileSync('E:/skillsaware-endorsement/public/ICTDSN403-91ff17dc-2b54-45dc-9079-3d439acdad47 (1).pdf');
  const editedText = (await pdf(edited)).text;

  const editedSignatureSection = editedText.match(/Digital\s+Signature[:\s]+(.*?)(?=This\s+is\s+a\s+digitally|Generated\s+with|$)/is);

  console.log('Signature section found:', editedSignatureSection != null);
  if (editedSignatureSection) {
    console.log('Signature section content:', JSON.stringify(editedSignatureSection[1].trim()));
    console.log('Contains original signature?', editedSignatureSection[1].includes(signature));
  }

  console.log('\n=== RESULT ===');
  console.log('Original PASSES:', signatureSection && signatureSection[1].includes(signature));
  console.log('Edited FAILS:', !editedSignatureSection || !editedSignatureSection[1].includes(signature));
}

test().catch(console.error);
