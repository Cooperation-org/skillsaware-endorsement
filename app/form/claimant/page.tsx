import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/jwt'
import ClaimantFormClient from './client'

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL || 'https://skillsaware-endorsement.vercel.app'

export const metadata: Metadata = {
  title: 'Claimant Form',
  description:
    'Complete your skill endorsement claim. Verify your identity and accept the skill endorsement credential.',
  robots: {
    index: false,
    follow: false
  },
  openGraph: {
    title: 'Claimant Form | SkillsAware',
    description:
      'Complete your skill endorsement claim. Verify your identity and accept the skill endorsement credential.',
    images: [
      {
        url: '/logo/og-images/default.png',
        width: 1200,
        height: 630,
        alt: 'SkillsAware Claimant Form'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Claimant Form | SkillsAware',
    description:
      'Complete your skill endorsement claim. Verify your identity and accept the skill endorsement credential.',
    images: ['/logo/og-images/default.png']
  }
}

export default async function ClaimantFormPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value

  if (!token) {
    redirect('/error/invalid-token')
  }

  try {
    const payload = await verifyToken(token)

    if (payload.role !== 'claimant') {
      redirect('/error/invalid-token')
    }

    // Pass payload and token to client component
    return <ClaimantFormClient payload={payload} token={token} />
  } catch (error) {
    if (error instanceof Error && error.message === 'TOKEN_EXPIRED') {
      redirect('/error/token-expired')
    }
    redirect('/error/invalid-token')
  }
}
