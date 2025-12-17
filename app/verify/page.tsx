import type { Metadata } from 'next'
import VerifyPdfClient from './client'

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL || 'https://skillsaware-endorsement.vercel.app'

export const metadata: Metadata = {
  title: 'Verify Certificate',
  description:
    'Verify SkillsAware skill endorsement certificates. Upload a PDF certificate to check its authenticity and cryptographic signatures.',
  openGraph: {
    title: 'Verify Certificate | SkillsAware',
    description:
      'Verify SkillsAware skill endorsement certificates. Upload a PDF certificate to check its authenticity and cryptographic signatures.',
    images: [
      {
        url: '/logo/og-images/default.png',
        width: 1200,
        height: 630,
        alt: 'SkillsAware Certificate Verification'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Verify Certificate | SkillsAware',
    description:
      'Verify SkillsAware skill endorsement certificates. Upload a PDF certificate to check its authenticity and cryptographic signatures.',
    images: ['/logo/og-images/default.png']
  }
}

export default function VerifyPdfPage() {
  return <VerifyPdfClient />
}
