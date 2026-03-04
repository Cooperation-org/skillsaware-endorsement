/**
 * SkillsAware Endorsement Client SDK
 *
 * Integrate the SkillsAware OBv3 Endorsement flow with minimal setup:
 * create claims, open claimant/endorser flows via magic links, submit endorsements, download credentials.
 *
 * @packageDocumentation
 */

export {
  createClaim,
  generateEndorserLink,
  submitEndorsement,
  getDownloadUrl,
  verifyPdf
} from './api'
export { EndorsementClient, EndorsementApiError } from './client'
export type {
  CreateClaimPayload,
  CreateClaimResponse,
  CreateClaimConfig,
  GenerateEndorserLinkPayload,
  GenerateEndorserLinkResponse,
  GenerateEndorserLinkConfig,
  SubmitEndorsementPayload,
  SubmitEndorsementResponse,
  SubmitEndorsementConfig,
  GetDownloadUrlConfig,
  GetDownloadUrlParams,
  GetDownloadUrlResult,
  DownloadInfo,
  BaseConfig,
  VerifyPdfConfig,
  VerifyPdfOptions,
  VerifyPdfResponse,
  VerifyPdfBasicResult,
  VerifyPdfFullResult,
  VerifyPdfMetadata
} from './types'
