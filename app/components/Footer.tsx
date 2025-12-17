import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer
      className='border-t pt-16 pb-8'
      style={{
        backgroundColor: '#ffffff',
        borderColor: '#e5e7eb'
      }}
    >
      <div className='footer-container max-w-[1400px] mx-auto'>
        <div className='flex flex-col md:flex-row justify-between gap-10 mb-12'>
          {/* Logo and Description */}
          <div className='flex flex-col gap-4 max-w-sm'>
            <div className='flex items-center gap-2'>
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
            </div>
            <p className='text-sm' style={{ color: '#617589' }}>
              The leading stateless endorsement verification system. Empowering trust
              across the digital landscape through open standards.
            </p>
          </div>

          {/* Navigation Links */}
          <div className='flex gap-16 flex-wrap'>
            {/* Product Column */}
            <div className='flex flex-col gap-3'>
              <h4 className='font-bold text-sm' style={{ color: '#111418' }}>
                Product
              </h4>
              <Link
                href='/'
                className='footer-link text-sm transition-colors'
                style={{ color: '#617589' }}
              >
                Overview
              </Link>
              <Link
                href='/api-docs'
                className='footer-link text-sm transition-colors'
                style={{ color: '#617589' }}
              >
                API
              </Link>
            </div>

            {/* Legal Column */}
            <div className='flex flex-col gap-3'>
              <h4 className='font-bold text-sm' style={{ color: '#111418' }}>
                Legal
              </h4>
              <Link
                href='/terms'
                className='footer-link text-sm transition-colors'
                style={{ color: '#617589' }}
              >
                Terms
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          className='border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4'
          style={{ borderColor: '#e5e7eb' }}
        >
          <p className='text-sm' style={{ color: '#617589' }}>
            © 2025 SkillsAware Inc. All rights reserved.
          </p>
          <div className='flex items-center gap-4'>
            <a
              href='https://github.com/Cooperation-org/skillsaware-endorsement'
              target='_blank'
              rel='noopener noreferrer'
              className='footer-icon transition-colors'
              title='View Repository'
              style={{ color: '#617589', fontSize: '1.25rem' }}
            >
              <span className='material-symbols-outlined'>code</span>
            </a>
            <a
              href='https://github.com/Cooperation-org/skillsaware-endorsement/issues'
              target='_blank'
              rel='noopener noreferrer'
              className='footer-icon transition-colors'
              title='Report Issue'
              style={{ color: '#617589', fontSize: '1.25rem' }}
            >
              <span className='material-symbols-outlined'>bug_report</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
