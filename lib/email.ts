import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'

// Check if AWS credentials are configured
const hasAwsCredentials = Boolean(process.env.AWS_ACCESS_KEY_ID)
const isDevelopment = process.env.NODE_ENV === 'development'

const sesClient = hasAwsCredentials
  ? new SESClient({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
      }
    })
  : null

export interface EmailOptions {
  to: string
  subject: string
  htmlBody: string
  textBody?: string
  fromEmail?: string
  fromName?: string
}

/**
 * Send an email using AWS SES
 * Returns true if sent successfully, false otherwise
 * Errors are logged but don't throw to avoid breaking the request flow
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  // Development fallback: log email instead of sending
  if (!hasAwsCredentials && isDevelopment) {
    console.log('📧 [DEV] Email would be sent:')
    console.log('  To:', options.to)
    console.log('  Subject:', options.subject)
    console.log(
      '  From:',
      options.fromEmail || process.env.SES_FROM_EMAIL || 'noreply@skillsaware.com'
    )
    console.log('  Body (text):', options.textBody || 'HTML only')
    return true
  }

  if (!sesClient) {
    console.warn('⚠️  AWS SES credentials not configured. Email not sent.')
    return false
  }

  const fromEmail =
    options.fromEmail || process.env.SES_FROM_EMAIL || 'noreply@skillsaware.com'
  const fromName = options.fromName || process.env.SES_FROM_NAME || 'SkillsAware'
  const from = `${fromName} <${fromEmail}>`

  try {
    const command = new SendEmailCommand({
      Source: from,
      Destination: {
        ToAddresses: [options.to]
      },
      Message: {
        Subject: {
          Data: options.subject,
          Charset: 'UTF-8'
        },
        Body: {
          Html: {
            Data: options.htmlBody,
            Charset: 'UTF-8'
          },
          ...(options.textBody && {
            Text: {
              Data: options.textBody,
              Charset: 'UTF-8'
            }
          })
        }
      }
    })

    const response = await sesClient.send(command)
    console.log('✅ Email sent successfully:', response.MessageId)
    return true
  } catch (error) {
    console.error('❌ Failed to send email:', error)
    // Don't throw - email failures shouldn't break the request
    return false
  }
}
