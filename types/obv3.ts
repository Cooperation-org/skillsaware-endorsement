export interface OBv3AchievementCredential {
  '@context': string[];
  type: string[];
  id: string;
  issuer: {
    id: string;
    type: string;
    name: string;
    url?: string;
    image?: string;
  };
  issuanceDate: string;
  credentialSubject: {
    id: string;
    type: string;
    name: string;
    narrative?: string;
    achievement: {
      id: string;
      type: string;
      name: string;
      description: string;
      criteria?: {
        narrative?: string;
      };
    };
  };
  endorsement?: OBv3EndorsementCredential[];
  evidence?: Array<{
    id: string;
    type: string;
    name?: string;
  }>;
}

export interface OBv3EndorsementCredential {
  '@context': string[];
  type: string[];
  id: string;
  issuer: {
    id: string;
    type: string;
    name: string;
  };
  issuanceDate: string;
  credentialSubject: {
    id: string;  // Reference to the achievement or credential
    type: string;
    endorsementComment: string;
    profile: {
      type: string;
      name: string;
      description?: string; // bona fides
    };
  };
}
