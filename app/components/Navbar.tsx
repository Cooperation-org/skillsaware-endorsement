'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header
      className='sticky top-0 z-50 w-full backdrop-blur-sm border-b'
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: 'var(--skillsaware-border)'
      }}
    >
      <div
        className='flex items-center justify-between'
        style={{ padding: '0.75rem 1.5rem', maxWidth: '1400px', margin: '0 auto' }}
      >
        <Link href='/' className='flex items-center gap-4'>
          <Image
            src='/logo/skillsaware-nav.svg'
            alt='SkillsAware Logo'
            width={120}
            height={30}
            className='skillsaware-logo'
            style={{
              width: '6.25vw',
              minHeight: '20px',
              height: 'auto',
              minWidth: '75px'
            }}
          />
        </Link>

        {/* Desktop Navigation - Hidden when hamburger button is visible (on screens smaller than lg) */}
        <nav className='desktop-nav items-center gap-8'>
          <Link
            href='/'
            className='text-sm font-medium transition-colors'
            style={{ color: 'var(--skillsaware-text-secondary)' }}
          >
            Overview
          </Link>
          <Link
            href='/verify'
            className='text-sm font-medium transition-colors'
            style={{ color: 'var(--skillsaware-text-secondary)' }}
          >
            Verify
          </Link>
          <Link
            href='/api-docs'
            className='text-sm font-medium transition-colors'
            style={{ color: 'var(--skillsaware-text-secondary)' }}
          >
            API Reference
          </Link>
          <Link
            href='https://skillsaware-endorsement-client.vercel.app/'
            target='_blank'
            rel='noopener noreferrer'
            className='text-sm font-medium transition-colors'
            style={{ color: 'var(--skillsaware-text-secondary)' }}
          >
            Prod-Workflow
          </Link>
        </nav>

        <div className='flex items-center gap-4'>
          {/* Status Indicator - Desktop Only */}
          <div
            className='desktop-nav items-center gap-2 px-3 py-1 rounded-full border'
            style={{
              backgroundColor: 'rgba(54, 179, 126, 0.1)',
              borderColor: 'rgba(54, 179, 126, 0.2)'
            }}
          >
            <span
              className='relative flex h-2 w-2'
              style={{ flexShrink: 0, minWidth: '8px', minHeight: '8px' }}
            >
              <span
                className='animate-ping absolute inline-flex h-full w-full rounded-full'
                style={{
                  backgroundColor: '#36b37e',
                  top: 0,
                  left: 0,
                  zIndex: 0,
                  opacity: 0.75
                }}
              ></span>
              <span
                className='relative inline-flex rounded-full h-2 w-2 z-10'
                style={{
                  backgroundColor: '#36b37e',
                  minWidth: '8px',
                  minHeight: '8px'
                }}
              ></span>
            </span>
            <span
              className='text-xs font-semibold'
              style={{ color: 'var(--skillsaware-success)' }}
            >
              All Systems Normal
            </span>
          </div>

          {/* Mobile Menu Button - Visible on screens smaller than lg (tablets and mobile) */}
          <button
            className='mobile-menu-button p-2'
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label='Toggle menu'
            style={{ color: 'var(--skillsaware-text-primary)' }}
          >
            <span className='material-symbols-outlined'>
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          className='mobile-menu-button border-t'
          style={{
            borderColor: 'var(--skillsaware-border)',
            backgroundColor: 'var(--skillsaware-bg-primary)'
          }}
        >
          <nav className='flex flex-col py-4 px-4 space-y-4'>
            <Link
              href='/'
              className='text-sm font-medium transition-colors py-2'
              style={{ color: 'var(--skillsaware-text-secondary)' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              Overview
            </Link>
            <Link
              href='/verify'
              className='text-sm font-medium transition-colors py-2'
              style={{ color: 'var(--skillsaware-text-secondary)' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              Verify
            </Link>
            <Link
              href='/api-docs'
              className='text-sm font-medium transition-colors py-2'
              style={{ color: 'var(--skillsaware-text-secondary)' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              API Reference
            </Link>
            <Link
              href='https://skillsaware-endorsement-client.vercel.app/'
              target='_blank'
              rel='noopener noreferrer'
              className='text-sm font-medium transition-colors py-2'
              style={{ color: 'var(--skillsaware-text-secondary)' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              Prod-Workflow
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
