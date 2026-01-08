import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'API Documentation',
  description:
    'SkillsAware Endorsement API documentation. A secure, serverless API for issuing and verifying Open Badge v3.0-compliant skill endorsement credentials with cryptographic signatures.',
  openGraph: {
    title: 'API Documentation | SkillsAware',
    description:
      'SkillsAware Endorsement API documentation. A secure, serverless API for issuing and verifying Open Badge v3.0-compliant skill endorsement credentials with cryptographic signatures.',
    images: [
      {
        url: '/logo/og-images/api-docs.png',
        width: 1200,
        height: 630,
        alt: 'SkillsAware API Documentation'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'API Documentation | SkillsAware',
    description:
      'SkillsAware Endorsement API documentation. A secure, serverless API for issuing and verifying Open Badge v3.0-compliant skill endorsement credentials with cryptographic signatures.',
    images: ['/logo/og-images/api-docs.png']
  }
}

export default function ApiDocsLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return <>{children}</>
}
