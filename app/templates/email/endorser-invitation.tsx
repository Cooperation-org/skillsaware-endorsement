interface EndorserInvitationEmailProps {
  endorserName: string
  claimantName: string
  skillName: string
  skillCode: string
  endorserLink: string
  appUrl?: string
}

export function generateEndorserInvitationEmail({
  endorserName,
  claimantName,
  skillName,
  skillCode,
  endorserLink
}: EndorserInvitationEmailProps): { html: string; text: string } {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Skill Endorsement Request - SkillsAware</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f5f7;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 30px 30px 20px; text-align: center; background: linear-gradient(135deg, #0B5FFF 0%, #0052CC 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">SkillsAware</h1>
              <p style="margin: 10px 0 0; color: #ffffff; font-size: 16px; opacity: 0.9;">Skill Endorsement Request</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #172B4D;">
                Hello <strong>${endorserName}</strong>,
              </p>
              
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #172B4D;">
                <strong>${claimantName}</strong> has requested your endorsement for the following skill:
              </p>
              
              <div style="background-color: #f4f5f7; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #0B5FFF;">
                <p style="margin: 0 0 10px; font-size: 18px; font-weight: 600; color: #172B4D;">
                  ${skillName}
                </p>
                <p style="margin: 0; font-size: 14px; color: #42526E;">
                  Skill Code: <strong>${skillCode}</strong>
                </p>
              </div>
              
              <p style="margin: 20px 0; font-size: 16px; line-height: 1.6; color: #172B4D;">
                To complete this endorsement, please click the button below to access the endorsement form:
              </p>
              
              <table role="presentation" style="width: 100%; margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${endorserLink}" style="display: inline-block; padding: 14px 32px; background-color: #0B5FFF; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                      Complete Endorsement
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 20px 0 0; font-size: 14px; line-height: 1.6; color: #6B778C;">
                Or copy and paste this link into your browser:
              </p>
              <p style="margin: 10px 0 20px; font-size: 12px; word-break: break-all; color: #6B778C; background-color: #f4f5f7; padding: 12px; border-radius: 4px;">
                ${endorserLink}
              </p>
              
              <p style="margin: 30px 0 0; font-size: 14px; line-height: 1.6; color: #6B778C; border-top: 1px solid #DFE1E6; padding-top: 20px;">
                <strong>Note:</strong> This link will expire in 7 days. If you have any questions, please contact the claimant directly.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 30px; background-color: #f4f5f7; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #6B778C;">
                Powered by <strong>SkillsAware</strong> | Standards-compliant Open Badges v3.0
              </p>
              <p style="margin: 10px 0 0; font-size: 12px; color: #6B778C;">
                This is an automated message. Please do not reply to this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()

  const text = `
SkillsAware - Skill Endorsement Request

Hello ${endorserName},

${claimantName} has requested your endorsement for the following skill:

${skillName}
Skill Code: ${skillCode}

To complete this endorsement, please visit the following link:

${endorserLink}

Note: This link will expire in 7 days. If you have any questions, please contact the claimant directly.

---
Powered by SkillsAware | Standards-compliant Open Badges v3.0
This is an automated message. Please do not reply to this email.
  `.trim()

  return { html, text }
}
