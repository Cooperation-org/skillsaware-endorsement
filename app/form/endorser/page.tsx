import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/jwt'
import EndorserFormClient from './client'

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL || 'https://skillsaware-endorsement.vercel.app'

export const metadata: Metadata = {
  title: 'Endorser Form',
  description:
    'Review and endorse skill claims. Verify claimant information and provide your endorsement signature.',
  robots: {
    index: false,
    follow: false
  },
  openGraph: {
    title: 'Endorser Form | SkillsAware',
    description:
      'Review and endorse skill claims. Verify claimant information and provide your endorsement signature.',
    images: [
      {
        url: '/logo/og-images/default.png',
        width: 1200,
        height: 630,
        alt: 'SkillsAware Endorser Form'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Endorser Form | SkillsAware',
    description:
      'Review and endorse skill claims. Verify claimant information and provide your endorsement signature.',
    images: ['/logo/og-images/default.png']
  }
}

export default async function EndorserFormPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value

  if (!token) {
    redirect('/error/invalid-token')
  }

  try {
    const payload = await verifyToken(token)

    if (payload.role !== 'endorser') {
      redirect('/error/invalid-token')
    }

    // Pass payload and token to client component
    return <EndorserFormClient payload={payload} token={token} />
  } catch (error) {
    if (error instanceof Error && error.message === 'TOKEN_EXPIRED') {
      redirect('/error/token-expired')
    }
    redirect('/error/invalid-token')
  }
}
