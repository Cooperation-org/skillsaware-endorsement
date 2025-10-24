import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/jwt'
import ClaimantFormClient from './client'

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
