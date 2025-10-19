import { z } from 'zod';

export const CreateClaimSchema = z.object({
  tenant_id: z.string().min(1),
  skill_code: z.string().min(1),
  skill_name: z.string().min(1),
  skill_description: z.string().min(1),
  claimant_name: z.string().min(1),
  claimant_email: z.string().email(),
});

export const GenerateEndorserLinkSchema = z.object({
  claimant_narrative: z.string().min(10),
  endorser_name: z.string().min(1),
  endorser_email: z.string().email(),
});

export const SubmitEndorsementSchema = z.object({
  endorsement_text: z.string().min(10),
  bona_fides: z.string().min(5),
  evidence_urls: z.array(z.string().url()).optional(),
  signature: z.string().min(2),
});
