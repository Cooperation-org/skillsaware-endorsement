import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as fs from 'fs/promises';
import * as path from 'path';

// Check if AWS credentials are configured
const hasAwsCredentials = Boolean(process.env.AWS_ACCESS_KEY_ID);
const isDevelopment = process.env.NODE_ENV === 'development';

const s3Client = hasAwsCredentials ? new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
}) : null;

export async function getPresignedPutUrl(
  bucket: string,
  key: string,
  contentType: string,
  expiresIn = 3600
): Promise<string> {
  // Development fallback: return a mock URL
  if (!hasAwsCredentials && isDevelopment) {
    console.warn('⚠️  AWS credentials not configured. Using local file storage for development.');
    return `mock://localhost/s3/${key}`;
  }

  if (!s3Client) {
    throw new Error('AWS credentials not configured');
  }

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn });
  return url;
}

export async function uploadToS3(
  presignedUrl: string,
  content: string | Buffer,
  contentType: string
): Promise<void> {
  // Development fallback: save to local file
  if (presignedUrl.startsWith('mock://') && isDevelopment) {
    const key = presignedUrl.replace('mock://localhost/s3/', '');
    const localPath = path.join(process.cwd(), '.artifacts', key);

    // Create directory if it doesn't exist
    await fs.mkdir(path.dirname(localPath), { recursive: true });

    // Write file
    const buffer = typeof content === 'string' ? Buffer.from(content) : content;
    await fs.writeFile(localPath, buffer);

    console.log(`✅ Saved artifact locally: ${localPath}`);
    return;
  }

  // Production: use actual S3
  const body = typeof content === 'string'
    ? content
    : new Uint8Array(content.buffer, content.byteOffset, content.byteLength);

  const response = await fetch(presignedUrl, {
    method: 'PUT',
    body: body as BodyInit,
    headers: {
      'Content-Type': contentType,
    },
  });

  if (!response.ok) {
    throw new Error(`S3 upload failed: ${response.statusText}`);
  }
}

export function generateS3Key(
  tenantId: string,
  claimId: string,
  fileType: 'json' | 'pdf'
): string {
  const extension = fileType === 'json' ? 'obv3.json' : 'pdf';
  return `${tenantId}/endorsements/${claimId}/claim.${extension}`;
}
