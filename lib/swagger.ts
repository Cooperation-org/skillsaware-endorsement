export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'SkillsAware Endorsement API',
    version: '1.0.0',
    description: `

A secure, serverless API for issuing and verifying Open Badge v3.0-compliant skill endorsement credentials.

## Features

- 🎓 Open Badges v3.0 compliant credentials (OpenBadgeCredential with Ed25519Signature2020 proofs)
- 🔐 JWT-based magic link authentication
- 📄 PDF and JSON credential generation with cryptographic signatures
- ✅ Built-in PDF verification and tamper detection
- 🚀 Zero-database architecture (stateless)
- 🔒 HMAC-SHA256 webhook signatures
- 📱 Mobile-friendly credential downloads

## Authentication

### API Key (x-api-key)
Required for creating claims. Include in request headers:
\`\`\`
x-api-key: your-api-key-here
\`\`\`

### JWT Bearer Token
Required for endorser and claim operations. Include in request headers:
\`\`\`
Authorization: Bearer <token>
\`\`\`

Tokens are issued via magic links and expire after 7 days (configurable).

## Workflow

1. **Create Claim** - Organization creates a skill claim for a claimant
2. **Generate Endorser Link** - Claimant provides endorser details to generate a secure link
3. **Submit Endorsement** - Endorser submits their endorsement via the secure link
4. **Download Credentials** - Verifiable PDF and JSON credentials are available for download
5. **Verify PDF** - Anyone can verify the authenticity of a PDF credential

## Security Features

- Cryptographic signatures using HMAC-SHA256
- Content integrity verification via hash comparison
- JWT tokens with role-based access control
- Tamper detection in PDF verification
- Stateless authentication (no session storage)
    `,
    contact: {
      name: 'SkillsAware Support',
      url: 'https://skillsaware.com',
      email: 'support@skillsaware.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server'
    },
    {
      url: 'https://skillsaware-endorsement.vercel.app',
      description: 'Production server (Vercel)'
    }
  ],
  tags: [
    {
      name: 'Claims',
      description: 'Skill claim creation and management'
    },
    {
      name: 'Endorsements',
      description: 'Endorsement submission and credential downloads'
    },
    {
      name: 'Verification',
      description: 'PDF credential verification'
    }
  ],
  components: {
    securitySchemes: {
      ApiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'x-api-key',
        description: 'API key for tenant authentication'
      },
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token from magic links'
      }
    },
    schemas: {
      CreateClaimRequest: {
        type: 'object',
        required: [
          'tenant_id',
          'skill_code',
          'skill_name',
          'skill_description',
          'claimant_name',
          'claimant_email'
        ],
        properties: {
          tenant_id: {
            type: 'string',
            description: 'Tenant identifier',
            example: 'skillsaware'
          },
          skill_code: {
            type: 'string',
            description: 'Unique skill code',
            example: 'ICTDSN403'
          },
          skill_name: {
            type: 'string',
            description: 'Human-readable skill name',
            example: 'Apply innovative thinking and practices in digital environments'
          },
          skill_description: {
            type: 'string',
            description: 'Detailed skill description',
            example:
              'Demonstrates the ability to apply innovative thinking and practices in digital environments'
          },
          claimant_name: {
            type: 'string',
            description: 'Full name of the person claiming the skill',
            example: 'Alice Johnson'
          },
          claimant_email: {
            type: 'string',
            format: 'email',
            description: 'Email address of the claimant',
            example: 'alice.johnson@example.com'
          },
          claimant_narrative: {
            type: 'string',
            description: 'Optional narrative describing skill demonstration',
            example:
              'I have successfully applied innovative thinking in multiple digital transformation projects...'
          }
        }
      },
      CreateClaimResponse: {
        type: 'object',
        properties: {
          claim_id: {
            type: 'string',
            format: 'uuid',
            description: 'Unique claim identifier',
            example: '123e4567-e89b-12d3-a456-426614174000'
          },
          claimant_link: {
            type: 'string',
            format: 'uri',
            description: 'Magic link for claimant to access their claim',
            example: 'http://localhost:3000/form/claimant?token=eyJhbGc...'
          },
          expires_at: {
            type: 'string',
            format: 'date-time',
            description: 'Token expiration timestamp',
            example: '2025-11-03T10:30:00.000Z'
          }
        }
      },
      GenerateEndorserLinkRequest: {
        type: 'object',
        required: ['endorser_name', 'endorser_email'],
        properties: {
          endorser_name: {
            type: 'string',
            description: 'Full name of the endorser',
            example: 'Dr. Sarah Martinez'
          },
          endorser_email: {
            type: 'string',
            format: 'email',
            description: 'Email address of the endorser',
            example: 'sarah.martinez@example.com'
          },
          claimant_narrative: {
            type: 'string',
            description: "Claimant's skill narrative (if not provided earlier)",
            example: 'I have successfully applied innovative thinking...'
          }
        }
      },
      GenerateEndorserLinkResponse: {
        type: 'object',
        properties: {
          endorser_link: {
            type: 'string',
            format: 'uri',
            description: 'Magic link for endorser to submit endorsement',
            example: 'http://localhost:3000/form/endorser?token=eyJhbGc...'
          },
          expires_at: {
            type: 'string',
            format: 'date-time',
            description: 'Token expiration timestamp',
            example: '2025-11-03T10:30:00.000Z'
          },
          email_sent: {
            type: 'boolean',
            description: 'Whether the invitation email was successfully sent to the endorser',
            example: true
          },
          email_error: {
            type: 'string',
            description: 'Error message if email sending failed (only present if email_sent is false)',
            example: 'AccessDenied: User is not authorized to perform ses:SendEmail'
          }
        }
      },
      SubmitEndorsementRequest: {
        type: 'object',
        required: ['endorsement_text', 'bona_fides', 'signature'],
        properties: {
          endorsement_text: {
            type: 'string',
            description: 'Detailed endorsement statement',
            example: 'I have worked closely with Alice Johnson for 3 years...'
          },
          bona_fides: {
            type: 'string',
            description: 'Endorser credentials and qualifications',
            example:
              'PhD in Computer Science, Senior Engineering Director at TechCorp, 18 years of industry experience'
          },
          signature: {
            type: 'string',
            description: 'Endorser digital signature (name)',
            example: 'Dr. Sarah Martinez'
          },
          evidence_urls: {
            type: 'array',
            items: {
              type: 'string',
              format: 'uri'
            },
            description: 'Optional URLs to evidence supporting the endorsement',
            example: ['https://github.com/project', 'https://example.com/portfolio']
          }
        }
      },
      SubmitEndorsementResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true
          },
          message: {
            type: 'string',
            example:
              'Endorsement submitted successfully. Download your credentials using the links below.'
          },
          claim_id: {
            type: 'string',
            format: 'uuid',
            example: '123e4567-e89b-12d3-a456-426614174000'
          },
          downloads: {
            type: 'object',
            properties: {
              json: {
                type: 'object',
                properties: {
                  url: {
                    type: 'string',
                    format: 'uri',
                    description:
                      'Download URL (S3 presigned URL if S3 is configured, otherwise API endpoint URL)',
                    example:
                      'https://s3.amazonaws.com/bucket/endorsements/123e4567-e89b-12d3-a456-426614174000/claim.obv3.json?X-Amz-Algorithm=...'
                  },
                  s3_url: {
                    type: 'string',
                    format: 'uri',
                    description:
                      'Direct S3 presigned URL (7 days expiration). Use this for long-term storage. Only present if S3 is configured.',
                    example:
                      'https://s3.amazonaws.com/bucket/endorsements/123e4567-e89b-12d3-a456-426614174000/claim.obv3.json?X-Amz-Algorithm=...'
                  },
                  filename: {
                    type: 'string',
                    example: 'ICTDSN403-123e4567-e89b-12d3-a456-426614174000.obv3.json'
                  },
                  ready: {
                    type: 'boolean',
                    example: true
                  },
                  size_estimate: {
                    type: 'string',
                    example: '~2 KB'
                  },
                  source: {
                    type: 'string',
                    enum: ['s3', 'api'],
                    description:
                      'Source of the download URL (s3 for S3 presigned URL, api for API endpoint)',
                    example: 's3'
                  },
                  expires_in: {
                    type: 'string',
                    description: 'Expiration time for the URL',
                    example: '7 days'
                  }
                }
              },
              pdf: {
                type: 'object',
                properties: {
                  url: {
                    type: 'string',
                    format: 'uri',
                    description:
                      'Download URL (S3 presigned URL if S3 is configured, otherwise API endpoint URL)',
                    example:
                      'https://s3.amazonaws.com/bucket/endorsements/123e4567-e89b-12d3-a456-426614174000/claim.pdf?X-Amz-Algorithm=...'
                  },
                  s3_url: {
                    type: 'string',
                    format: 'uri',
                    description:
                      'Direct S3 presigned URL (7 days expiration). Use this for long-term storage. Only present if S3 is configured.',
                    example:
                      'https://s3.amazonaws.com/bucket/endorsements/123e4567-e89b-12d3-a456-426614174000/claim.pdf?X-Amz-Algorithm=...'
                  },
                  filename: {
                    type: 'string',
                    example: 'ICTDSN403-123e4567-e89b-12d3-a456-426614174000.pdf'
                  },
                  ready: {
                    type: 'boolean',
                    example: true
                  },
                  size_estimate: {
                    type: 'string',
                    example: '~180 KB'
                  },
                  source: {
                    type: 'string',
                    enum: ['s3', 'api'],
                    description:
                      'Source of the download URL (s3 for S3 presigned URL, api for API endpoint)',
                    example: 's3'
                  },
                  expires_in: {
                    type: 'string',
                    description: 'Expiration time for the URL',
                    example: '7 days'
                  },
                  note: {
                    type: 'string',
                    example:
                      'PDF is ready for download (or will be generated when you access this URL, which may take a few seconds).'
                  }
                }
              }
            }
          },
          json_base64: {
            type: 'string',
            description:
              'Base64-encoded OBv3 JSON credential (OpenBadgeCredential with validFrom, credentialSchema, and Ed25519Signature2020 proof) for immediate access',
            example: 'eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvbnMv...'
          },
          s3_uploaded: {
            type: 'boolean',
            description: 'Whether JSON/PDF were uploaded to S3 (if configured)',
            example: true
          },
          s3_keys: {
            type: 'object',
            description:
              'S3 object keys for the uploaded files. Only present if S3 upload succeeded.',
            properties: {
              json: {
                type: 'string',
                description: 'S3 key for the JSON credential file',
                example:
                  'endorsements/123e4567-e89b-12d3-a456-426614174000/claim.obv3.json'
              },
              pdf: {
                type: 'string',
                description: 'S3 key for the PDF certificate file',
                example: 'endorsements/123e4567-e89b-12d3-a456-426614174000/claim.pdf'
              }
            },
            example: {
              json: 'endorsements/123e4567-e89b-12d3-a456-426614174000/claim.obv3.json',
              pdf: 'endorsements/123e4567-e89b-12d3-a456-426614174000/claim.pdf'
            }
          },
          webhook_delivered: {
            type: 'boolean',
            description: 'Whether the webhook notification was delivered successfully',
            example: true
          }
        }
      },
      VerifyPdfRequest: {
        type: 'object',
        required: ['pdf'],
        properties: {
          pdf: {
            type: 'string',
            format: 'binary',
            description: 'PDF file to verify'
          },
          skillCode: {
            type: 'string',
            description: 'Optional: Expected skill code for additional validation',
            example: 'ICTDSN403'
          },
          claimantName: {
            type: 'string',
            description: 'Optional: Expected claimant name for additional validation',
            example: 'Alice Johnson'
          },
          endorserName: {
            type: 'string',
            description: 'Optional: Expected endorser name for additional validation',
            example: 'Dr. Sarah Martinez'
          }
        }
      },
      VerifyPdfResponse: {
        type: 'object',
        properties: {
          filename: {
            type: 'string',
            example: 'credential.pdf'
          },
          fileSize: {
            type: 'integer',
            example: 186240
          },
          basicVerification: {
            type: 'object',
            properties: {
              valid: {
                type: 'boolean',
                description: 'Whether basic text-based verification passed',
                example: true
              },
              message: {
                type: 'string',
                example: 'Certificate verified successfully'
              },
              tamperDetails: {
                type: 'object',
                properties: {
                  changes: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        field: {
                          type: 'string',
                          example: 'Skill Name'
                        },
                        status: {
                          type: 'string',
                          example: 'NOT FOUND IN EXPECTED LOCATION'
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          fullVerification: {
            type: 'object',
            properties: {
              valid: {
                type: 'boolean',
                description: 'Whether cryptographic verification passed',
                example: true
              },
              message: {
                type: 'string',
                example:
                  'Cryptographic signature verified - certificate is authentic and unmodified'
              },
              signatureValid: {
                type: 'boolean',
                example: true
              },
              contentHashValid: {
                type: 'boolean',
                example: true
              }
            }
          },
          metadata: {
            type: 'object',
            properties: {
              title: {
                type: 'string',
                example: 'Skill Endorsement Certificate'
              },
              author: {
                type: 'string',
                example: 'SkillsAware'
              },
              customFields: {
                type: 'object',
                properties: {
                  'SkillsAware-JWT': {
                    type: 'string',
                    description: 'Embedded JWT token'
                  },
                  'SkillsAware-Signature': {
                    type: 'string',
                    description: 'HMAC-SHA256 cryptographic signature'
                  },
                  'SkillsAware-ContentHash': {
                    type: 'string',
                    description: 'SHA256 hash of original content'
                  }
                }
              }
            }
          }
        }
      },
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            description: 'Error message',
            example: 'Invalid request'
          },
          details: {
            type: 'object',
            description: 'Additional error details (optional)'
          }
        }
      }
    }
  },
  paths: {
    '/api/v1/claims': {
      post: {
        tags: ['Claims'],
        summary: 'Create a new skill claim',
        description:
          'Creates a new skill claim and generates a magic link for the claimant. This endpoint requires API key authentication.',
        operationId: 'createClaim',
        security: [{ ApiKeyAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CreateClaimRequest'
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Claim created successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/CreateClaimResponse'
                }
              }
            }
          },
          '400': {
            description: 'Invalid request',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '401': {
            description: 'Missing or invalid API key',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                },
                example: {
                  error: 'Missing API key'
                }
              }
            }
          },
          '500': {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/api/v1/claims/{id}/endorser-link': {
      post: {
        tags: ['Claims'],
        summary: 'Generate endorser link',
        description:
          'Generates a secure magic link for a single endorser. Client applications can call this endpoint multiple times concurrently to send bulk invitations. Requires claimant JWT token authentication.',
        operationId: 'generateEndorserLink',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Claim ID',
            schema: {
              type: 'string',
              format: 'uuid'
            }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/GenerateEndorserLinkRequest'
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Endorser link generated successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/GenerateEndorserLinkResponse'
                }
              }
            }
          },
          '400': {
            description: 'Invalid request',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '401': {
            description: 'Missing or invalid authentication token',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '403': {
            description: 'Invalid token role or claim ID mismatch',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/api/v1/endorsements/submit': {
      post: {
        tags: ['Endorsements'],
        summary: 'Submit endorsement',
        description:
          'Submit an endorsement for a skill claim. Requires endorser JWT token authentication. Generates verifiable PDF and OBv3-compliant JSON credentials (OpenBadgeCredential with validFrom, credentialSchema, and Ed25519Signature2020 proof if issuer keys are configured).',
        operationId: 'submitEndorsement',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/SubmitEndorsementRequest'
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Endorsement submitted successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SubmitEndorsementResponse'
                }
              }
            }
          },
          '400': {
            description: 'Invalid request',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '401': {
            description: 'Missing or invalid authentication token',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '403': {
            description: 'Invalid token role',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '404': {
            description: 'Tenant not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/api/v1/endorsements/{id}/download/{type}': {
      get: {
        tags: ['Endorsements'],
        summary: 'Download credential (OBv3 JSON or PDF)',
        description:
          'Download a PDF or OBv3 JSON credential. The JSON credential is OpenBadgeCredential-compliant with validFrom, credentialSchema, and Ed25519Signature2020 proof (if issuer keys configured). The PDF includes cryptographic signatures and embedded JWT token for verification.',
        operationId: 'downloadCredential',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Claim ID',
            schema: {
              type: 'string',
              format: 'uuid'
            }
          },
          {
            name: 'type',
            in: 'path',
            required: true,
            description: 'Credential format',
            schema: {
              type: 'string',
              enum: ['pdf', 'json']
            }
          },
          {
            name: 'token',
            in: 'query',
            required: true,
            description: 'JWT token from endorsement submission',
            schema: {
              type: 'string'
            }
          },
          {
            name: 'endorsement_text',
            in: 'query',
            required: true,
            description: 'Endorsement statement text',
            schema: {
              type: 'string'
            }
          },
          {
            name: 'bona_fides',
            in: 'query',
            required: true,
            description: 'Endorser credentials',
            schema: {
              type: 'string'
            }
          },
          {
            name: 'signature',
            in: 'query',
            required: true,
            description: 'Endorser signature',
            schema: {
              type: 'string'
            }
          },
          {
            name: 'evidence_urls',
            in: 'query',
            required: false,
            description: 'JSON array of evidence URLs',
            schema: {
              type: 'string'
            },
            example: '["https://github.com/project"]'
          }
        ],
        responses: {
          '200': {
            description: 'Credential file',
            content: {
              'application/pdf': {
                schema: {
                  type: 'string',
                  format: 'binary'
                }
              },
              'application/json': {
                schema: {
                  type: 'object',
                  description:
                    'Open Badges v3.0 compliant credential (OpenBadgeCredential with Ed25519Signature2020 proof)',
                  example: {
                    '@context': [
                      'https://www.w3.org/ns/credentials/v2',
                      'https://purl.imsglobal.org/spec/ob/v3p0/context-3.0.3.json'
                    ],
                    type: ['VerifiableCredential', 'OpenBadgeCredential'],
                    id: 'urn:uuid:550e8400-e29b-41d4-a716-446655440000',
                    name: 'Design Skills Certificate',
                    issuer: {
                      id: 'https://skillsaware-endorsement.vercel.app/issuers/whatscookin',
                      type: 'Profile',
                      name: 'SkillsAware'
                    },
                    validFrom: '2025-01-19T12:00:00.000Z',
                    credentialSchema: [
                      {
                        id: 'https://purl.imsglobal.org/spec/ob/v3p0/schema/json/ob_v3p0_achievementcredential_schema.json',
                        type: '1EdTechJsonSchemaValidator2019'
                      }
                    ],
                    credentialSubject: {
                      id: 'did:web:skillsaware-endorsement.vercel.app:users:amFuZS5kb2VAZXhhbXBsZS5jb20',
                      type: 'AchievementSubject',
                      name: 'Jane Doe',
                      narrative: 'I have demonstrated this skill through...',
                      achievement: {
                        id: 'https://skillsaware-endorsement.vercel.app/achievements/ICTDSN403',
                        type: 'Achievement',
                        name: 'Design Skills',
                        description: 'Demonstrates advanced design capabilities',
                        criteria: {
                          narrative: 'Demonstrated competency through peer endorsement'
                        }
                      }
                    },
                    evidence: [
                      {
                        id: 'https://github.com/example/project',
                        type: 'Evidence',
                        name: 'Evidence 1'
                      }
                    ],
                    endorsement: [
                      {
                        '@context': [
                          'https://www.w3.org/ns/credentials/v2',
                          'https://purl.imsglobal.org/spec/ob/v3p0/context-3.0.3.json'
                        ],
                        type: ['VerifiableCredential', 'EndorsementCredential'],
                        id: 'urn:uuid:660e8400-e29b-41d4-a716-446655440001',
                        name: 'Peer Endorsement for Design Skills',
                        issuer: {
                          id: 'did:web:skillsaware.com:users:am9obi5tYW5hZ2VyQGV4YW1wbGUuY29t',
                          type: 'Profile',
                          name: 'John Manager'
                        },
                        validFrom: '2025-01-19T12:00:00.000Z',
                        credentialSchema: [
                          {
                            id: 'https://purl.imsglobal.org/spec/ob/v3p0/schema/json/ob_v3p0_endorsementcredential_schema.json',
                            type: '1EdTechJsonSchemaValidator2019'
                          }
                        ],
                        credentialSubject: {
                          id: 'urn:uuid:550e8400-e29b-41d4-a716-446655440000',
                          type: 'EndorsementSubject',
                          endorsementComment:
                            'Jane has demonstrated exceptional skills...',
                          profile: {
                            type: 'Profile',
                            name: 'John Manager',
                            description: 'Senior Technical Lead at TechCorp'
                          }
                        },
                        proof: {
                          type: 'Ed25519Signature2020',
                          created: '2025-01-19T12:00:00.000Z',
                          verificationMethod: 'did:key:z6Mk...#z6Mk...',
                          proofPurpose: 'assertionMethod',
                          proofValue:
                            'z4grD6Hc9p7cHtDvv9Ai3pmToAn6k4dMGA19Nj7TvAzE9ffKCjaZ4i4A2qBSRanwVcz38swaKaYPFffHqJ2swHnSj'
                        }
                      }
                    ],
                    proof: {
                      type: 'Ed25519Signature2020',
                      created: '2025-01-19T12:00:00.000Z',
                      verificationMethod: 'did:key:z6Mk...#z6Mk...',
                      proofPurpose: 'assertionMethod',
                      proofValue:
                        'z4grD6Hc9p7cHtDvv9Ai3pmToAn6k4dMGA19Nj7TvAzE9ffKCjaZ4i4A2qBSRanwVcz38swaKaYPFffHqJ2swHnSj'
                    }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Invalid request',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '401': {
            description: 'Invalid or expired token',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/api/v1/verify-pdf': {
      post: {
        tags: ['Verification'],
        summary: 'Verify PDF credential',
        description: `Verifies the authenticity of a PDF credential using both text-based and cryptographic verification.
        
**Two-Level Verification:**
1. **Basic Verification:** Checks if PDF content and embedded metadata look like a genuine SkillsAware certificate, and detects obvious tampering.
2. **Full Verification (optional):** Validates cryptographic signature using HMAC-SHA256 when you also provide expected skill code, claimant name, and endorser name.

**What is checked:**
- SkillsAware-specific metadata and signature fields
- Cryptographic content hash integrity
- Text content matching (skill code, names, descriptions, endorsement text) where extractable
- Evidence URL presence

**Tamper Detection:**
If any content or metadata has been modified after issuance, the verification will fail and report specific changes where possible.`,
        operationId: 'verifyPdf',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                $ref: '#/components/schemas/VerifyPdfRequest'
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Verification results',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/VerifyPdfResponse'
                }
              }
            }
          },
          '400': {
            description: 'Invalid request (e.g., no PDF file provided)',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '500': {
            description: 'Verification error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/api/v1/webhook/test': {
      post: {
        tags: ['Endorsements'],
        summary: 'Send test webhook event',
        description:
          'Sends a test `claim.endorsed` webhook event to the configured tenant webhook URL. Useful for validating webhook receivers and HMAC verification.',
        operationId: 'testWebhook',
        security: [{ ApiKeyAuth: [] }],
        responses: {
          '200': {
            description: 'Webhook test executed',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true
                    },
                    webhook_url: {
                      type: 'string',
                      format: 'uri',
                      example: 'https://your-webhook-endpoint.com/webhook'
                    },
                    error: {
                      type: 'string',
                      nullable: true,
                      example: null
                    }
                  }
                }
              }
            }
          },
          '401': {
            description: 'Missing or invalid API key',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '500': {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/api/v1/test-token': {
      post: {
        tags: ['Claims'],
        summary: 'Generate test JWT token (Development only)',
        description: `
**Development Only** - This endpoint generates test JWT tokens for API testing.

**How to use:**
1. Call this endpoint to generate a test token
2. Copy the \`token\` from the response
3. In Swagger UI, click the "Authorize" button (top right)
4. Paste the token into the "BearerAuth" field (without "Bearer " prefix)
5. Click "Authorize" and "Close"
6. Now you can test endpoints that require authentication

**Example Request:**
\`\`\`json
{
  "role": "claimant",
  "claim_id": "123e4567-e89b-12d3-a456-426614174000",
  "skill_code": "TEST001",
  "skill_name": "Test Skill",
  "claimant_name": "Test User",
  "claimant_email": "test@example.com"
}
\`\`\`

**For endorser tokens:**
\`\`\`json
{
  "role": "endorser",
  "claim_id": "123e4567-e89b-12d3-a456-426614174000",
  "endorser_name": "Test Endorser",
  "endorser_email": "endorser@example.com"
}
\`\`\`
        `,
        operationId: 'generateTestToken',
        requestBody: {
          required: false,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  role: {
                    type: 'string',
                    enum: ['claimant', 'endorser'],
                    default: 'claimant',
                    description: 'Token role'
                  },
                  claim_id: {
                    type: 'string',
                    format: 'uuid',
                    description: 'Claim ID (will be generated if not provided)'
                  },
                  tenant_id: {
                    type: 'string',
                    default: 'skillsaware',
                    description: 'Tenant ID'
                  },
                  skill_code: {
                    type: 'string',
                    default: 'TEST001',
                    description: 'Skill code'
                  },
                  skill_name: {
                    type: 'string',
                    default: 'Test Skill',
                    description: 'Skill name'
                  },
                  skill_description: {
                    type: 'string',
                    default: 'A test skill for API testing',
                    description: 'Skill description'
                  },
                  claimant_name: {
                    type: 'string',
                    default: 'Test Claimant',
                    description: 'Claimant name'
                  },
                  claimant_email: {
                    type: 'string',
                    default: 'test@example.com',
                    description: 'Claimant email'
                  },
                  endorser_name: {
                    type: 'string',
                    default: 'Test Endorser',
                    description: 'Endorser name (for endorser tokens)'
                  },
                  endorser_email: {
                    type: 'string',
                    default: 'endorser@example.com',
                    description: 'Endorser email (for endorser tokens)'
                  },
                  claimant_narrative: {
                    type: 'string',
                    default: 'Test narrative',
                    description: 'Claimant narrative (for endorser tokens)'
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Test token generated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    token: {
                      type: 'string',
                      description: 'JWT token to use in Authorization header'
                    },
                    claim_id: {
                      type: 'string',
                      format: 'uuid',
                      description: 'Claim ID associated with the token'
                    },
                    role: {
                      type: 'string',
                      enum: ['claimant', 'endorser']
                    },
                    message: {
                      type: 'string',
                      example:
                        'Use this token in the Authorization header: Bearer <token>'
                    },
                    usage: {
                      type: 'object',
                      properties: {
                        endpoint: {
                          type: 'string',
                          description: 'Endpoint this token can be used with'
                        },
                        header: {
                          type: 'string',
                          description: 'Example Authorization header'
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Invalid request',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '403': {
            description: 'Endpoint only available in development mode',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '500': {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    }
  }
}
