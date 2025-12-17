import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SkillsAware Endorsement Client',
  description:
    'Admin interface for initiating endorsements. Create skill claims and generate secure magic links for claimants.'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <head>
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
