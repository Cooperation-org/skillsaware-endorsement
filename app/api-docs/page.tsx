'use client'

import dynamic from 'next/dynamic'
import { swaggerSpec } from '@/lib/swagger'
import 'swagger-ui-react/swagger-ui.css'

// Dynamically import SwaggerUI to avoid SSR issues
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false })

export default function ApiDocsPage() {
  return (
    <div className='api-docs-container'>
      <style jsx global>{`
        .api-docs-container {
          width: 100%;
          min-height: 100vh;
          background: #fafafa;
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
        }

        .swagger-ui .info .description {
          font-size: 14px;
          line-height: 1.6;
        }

        .swagger-ui .scheme-container {
          background: #fff;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          padding: 20px;
          margin: 20px 0;
          border-radius: 4px;
        }

        .swagger-ui .opblock-tag {
          font-size: 24px;
          margin: 40px 0 20px;
          padding: 10px 20px;
          background: #fff;
          border-left: 4px solid #0b5fff;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .swagger-ui .opblock-tag:hover {
          background: #f0f7ff;
        }

        .swagger-ui .opblock {
          margin: 0 0 15px;
          border-radius: 4px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .swagger-ui .opblock.opblock-post {
          border-color: #49cc90;
          background: rgba(73, 204, 144, 0.1);
        }

        .swagger-ui .opblock.opblock-get {
          border-color: #61affe;
          background: rgba(97, 175, 254, 0.1);
        }

        .swagger-ui .opblock-summary-method {
          border-radius: 3px;
          text-transform: uppercase;
          font-weight: 700;
          padding: 6px 15px;
          min-width: 80px;
          text-align: center;
        }

        .swagger-ui .opblock-post .opblock-summary-method {
          background: #49cc90;
        }

        .swagger-ui .opblock-get .opblock-summary-method {
          background: #61affe;
        }

        .swagger-ui .response-col_status {
          font-size: 14px;
          font-weight: 700;
        }

        .swagger-ui .response-col_status.response-200 {
          color: #49cc90;
        }

        .swagger-ui .response-col_status.response-400,
        .swagger-ui .response-col_status.response-401,
        .swagger-ui .response-col_status.response-403,
        .swagger-ui .response-col_status.response-404,
        .swagger-ui .response-col_status.response-500 {
          color: #f93e3e;
        }

        .swagger-ui .btn.execute {
          background: #0b5fff;
          color: #fff;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.3s ease;
        }

        .swagger-ui .btn.execute:hover {
          background: #0949cc;
        }

        .swagger-ui .model-box {
          background: #fff;
          border-radius: 4px;
          padding: 10px;
        }

        .swagger-ui table thead tr th {
          font-weight: 700;
          color: #3b4151;
          border-bottom: 2px solid #e8e8e8;
        }

        .swagger-ui .parameter__name {
          font-weight: 700;
          color: #3b4151;
        }

        .swagger-ui .parameter__name.required::after {
          content: ' *';
          color: #f93e3e;
        }

        /* Custom branding */
        .api-docs-header {
          background: linear-gradient(135deg, #0b5fff 0%, #0949cc 100%);
          color: white;
          padding: 60px 20px;
          text-align: center;
          margin-bottom: 40px;
        }

        .api-docs-header h1 {
          font-size: 48px;
          margin: 0 0 20px;
          font-weight: 700;
        }

        .api-docs-header p {
          font-size: 18px;
          opacity: 0.9;
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .api-docs-links {
          margin-top: 30px;
          display: flex;
          gap: 15px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .api-docs-link {
          background: rgba(255, 255, 255, 0.2);
          padding: 10px 20px;
          border-radius: 6px;
          text-decoration: none;
          color: white;
          font-weight: 600;
          transition: background 0.3s ease;
          border: 2px solid rgba(255, 255, 255, 0.3);
        }

        .api-docs-link:hover {
          background: rgba(255, 255, 255, 0.3);
          border-color: rgba(255, 255, 255, 0.5);
        }
      `}</style>

      <div className='api-docs-header'>
        <h1>🚀 SkillsAware Endorsement API</h1>
        <p>
          A secure, serverless API for issuing and verifying Open Badge v3.0-compliant
          skill endorsement credentials with cryptographic signatures.
        </p>
        <div className='api-docs-links'>
          <a href='/' className='api-docs-link'>
            ← Back to Home
          </a>
          <a href='/form/claimant' className='api-docs-link'>
            Claimant Form
          </a>
          <a href='/form/endorser' className='api-docs-link'>
            Endorser Form
          </a>
        </div>
      </div>

      <SwaggerUI spec={swaggerSpec} />
    </div>
  )
}
