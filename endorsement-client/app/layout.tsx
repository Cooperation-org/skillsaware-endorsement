import type { Metadata } from 'next'
import './globals.css'

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL || 'https://skillsaware-endorsement.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'SkillsAware Endorsement Client',
    template: '%s | SkillsAware Client'
  },
  description:
    'Admin interface for initiating endorsements. Create skill claims and generate secure magic links for claimants.',
  robots: {
    index: false,
    follow: false
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: `${baseUrl}/endorsement-client`,
    siteName: 'SkillsAware Endorsement Client',
    title: 'SkillsAware Endorsement Client',
    description:
      'Admin interface for initiating endorsements. Create skill claims and generate secure magic links for claimants.',
    images: [
      {
        url: '/logo/og-images/default.png',
        width: 1200,
        height: 630,
        alt: 'SkillsAware Endorsement Client'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SkillsAware Endorsement Client',
    description:
      'Admin interface for initiating endorsements. Create skill claims and generate secure magic links for claimants.',
    images: ['/logo/og-images/default.png']
  }
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href='https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap'
          rel='stylesheet'
        />
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link rel='preconnect' href='https://fonts.gstatic.com' crossOrigin='anonymous' />
      </head>
      <body>{children}</body>
    </html>
  )
}
