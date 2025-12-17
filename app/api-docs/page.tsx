'use client'

import { swaggerSpec } from '@/lib/swagger'
import 'swagger-ui-react/swagger-ui.css'
import { SwaggerUIWrapper } from './swagger-wrapper'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function ApiDocsPage() {
  return (
    <div
      className='min-h-screen flex flex-col'
      style={{ backgroundColor: 'var(--skillsaware-bg-secondary)' }}
    >
      <Navbar />

      <main className='flex-grow' style={{ marginTop: '2rem' }}>
        <div className='api-docs-container'>
          <style jsx global>{`
            .api-docs-container {
              width: 100%;
              min-height: calc(100vh - 80px);
              background: var(--skillsaware-bg-secondary);
            }

            .swagger-ui {
              max-width: 1460px;
              margin: 0 auto;
              padding: 20px;
            }

            .swagger-ui .topbar {
              display: none;
            }

            .swagger-ui .info {
              margin: 50px 0;
            }

            .swagger-ui .info .title {
              font-size: 36px;
              margin-bottom: 10px;
              color: var(--skillsaware-text-primary);
            }

            .swagger-ui .info .description {
              font-size: 14px;
              line-height: 1.6;
              color: var(--skillsaware-text-secondary);
            }

            .swagger-ui .scheme-container {
              background: var(--skillsaware-bg-primary);
              box-shadow: var(--skillsaware-shadow-sm);
              padding: 20px;
              margin: 20px 0;
              border-radius: var(--skillsaware-radius-md);
              border: 1px solid var(--skillsaware-border);
            }

            .swagger-ui .opblock-tag {
              font-size: 24px;
              margin: 40px 0 20px;
              padding: 10px 20px;
              background: var(--skillsaware-bg-primary);
              border-left: 4px solid var(--skillsaware-primary);
              cursor: pointer;
              transition: all 0.3s ease;
              color: var(--skillsaware-text-primary);
            }

            .swagger-ui .opblock-tag:hover {
              background: var(--skillsaware-bg-hover);
            }

            .swagger-ui .opblock {
              margin: 0 0 15px;
              border-radius: var(--skillsaware-radius-md);
              box-shadow: var(--skillsaware-shadow-sm);
              border: 1px solid var(--skillsaware-border);
            }

            .swagger-ui .opblock.opblock-post {
              border-color: var(--skillsaware-success);
              background: rgba(54, 179, 126, 0.05);
            }

            .swagger-ui .opblock.opblock-get {
              border-color: var(--skillsaware-primary);
              background: rgba(19, 127, 236, 0.05);
            }

            .swagger-ui .opblock-summary-method {
              border-radius: var(--skillsaware-radius-sm);
              text-transform: uppercase;
              font-weight: 700;
              padding: 6px 15px;
              min-width: 80px;
              text-align: center;
            }

            .swagger-ui .opblock-post .opblock-summary-method {
              background: var(--skillsaware-success);
            }

            .swagger-ui .opblock-get .opblock-summary-method {
              background: var(--skillsaware-primary);
            }

            .swagger-ui .response-col_status {
              font-size: 14px;
              font-weight: 700;
            }

            .swagger-ui .response-col_status.response-200 {
              color: var(--skillsaware-success);
            }

            .swagger-ui .response-col_status.response-400,
            .swagger-ui .response-col_status.response-401,
            .swagger-ui .response-col_status.response-403,
            .swagger-ui .response-col_status.response-404,
            .swagger-ui .response-col_status.response-500 {
              color: var(--skillsaware-error);
            }

            .swagger-ui .btn.execute {
              background: var(--skillsaware-primary);
              color: var(--skillsaware-text-inverse);
              border: none;
              padding: 10px 20px;
              border-radius: var(--skillsaware-radius-md);
              font-weight: 600;
              cursor: pointer;
              transition: background 0.3s ease;
            }

            .swagger-ui .btn.execute:hover {
              background: var(--skillsaware-primary-dark);
            }

            .swagger-ui .model-box {
              background: var(--skillsaware-bg-primary);
              border-radius: var(--skillsaware-radius-md);
              padding: 10px;
              border: 1px solid var(--skillsaware-border);
            }

            .swagger-ui table thead tr th {
              font-weight: 700;
              color: var(--skillsaware-text-primary);
              border-bottom: 2px solid var(--skillsaware-border);
            }

            .swagger-ui .parameter__name {
              font-weight: 700;
              color: var(--skillsaware-text-primary);
            }

            .swagger-ui .parameter__name.required::after {
              content: ' *';
              color: var(--skillsaware-error);
            }
          `}</style>

          <div style={{ padding: '2rem 1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
            <div className='text-center mb-8' style={{ marginTop: '2rem' }}>
              <h1
                className='text-3xl md:text-4xl font-black tracking-tight mb-4'
                style={{ color: 'var(--skillsaware-text-primary)' }}
              >
                SkillsAware Endorsement API
              </h1>
              <p
                className='text-lg max-w-2xl mx-auto'
                style={{ color: 'var(--skillsaware-text-secondary)' }}
              >
                A secure, serverless API for issuing and verifying Open Badge
                v3.0-compliant skill endorsement credentials with cryptographic
                signatures.
              </p>
            </div>

            <SwaggerUIWrapper spec={swaggerSpec} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
