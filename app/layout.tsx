import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
})

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL || 'https://skillsaware-endorsement.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'SkillsAware - Skill Endorsement System',
    template: '%s | SkillsAware'
  },
  description:
    'SkillsAware OBv3 Endorsement System - Create, validate, and issue standards-compliant skill credentials',
  keywords: ['SkillsAware', 'skill endorsement', 'OBv3', 'Open Badges', 'credentials'],
  authors: [{ name: 'SkillsAware' }],
  creator: 'SkillsAware',
  publisher: 'SkillsAware',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: baseUrl,
    siteName: 'SkillsAware',
    title: 'SkillsAware - Skill Endorsement System',
    description:
      'SkillsAware OBv3 Endorsement System - Create, validate, and issue standards-compliant skill credentials',
    images: [
      {
        url: '/logo/og-images/default.png',
        width: 1200,
        height: 630,
        alt: 'SkillsAware - Skill Endorsement System'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SkillsAware - Skill Endorsement System',
    description:
      'SkillsAware OBv3 Endorsement System - Create, validate, and issue standards-compliant skill credentials',
    images: ['/logo/og-images/default.png']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
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
        <link rel='manifest' href='/logo/manifest.json' />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href='https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap'
          rel='stylesheet'
        />
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link rel='preconnect' href='https://fonts.gstatic.com' crossOrigin='anonymous' />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body>
    </html>
  )
}
