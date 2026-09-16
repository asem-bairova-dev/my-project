export type BriefInput = {
  companyName: string;
  bin?: string;
  decisionMakerName?: string;
};

export type Source = {
  label: string;
  url?: string;
};

export type Field = {
  value: string;
  found: boolean;
  source?: Source;
};

export type CompanyBlock = {
  name: Field;
  industry: Field;
  foundedDate: Field;
  registrationStatus: Field;
};

export type TaxBlock = {
  debtStatus: Field;
  taxRegime: Field;
};

export type DecisionMakerBlock = {
  fullName: Field;
  position: Field;
  tenure: Field;
  responsibility: Field;
};

export type ServiceContextBlock = {
  summary: Field;
};

export type InterestsBlock = {
  hobbies: Field;
  publicAppearances: Field;
  talkingPoints: Field;
};

export type RelatedCompany = {
  name: string;
  relation: string;
  source?: Source;
};

export type RelatedCompaniesBlock = {
  found: boolean;
  companies: RelatedCompany[];
};

export type MeetingPrep = {
  summary: string;
  stopFactors: string[];
  suggestedQuestions: string[];
  recommendations: string[];
};

export type Brief = {
  input: BriefInput;
  generatedAt: string;
  meetingPrep: MeetingPrep;
  company: CompanyBlock;
  tax: TaxBlock;
  decisionMaker: DecisionMakerBlock;
  serviceContext: ServiceContextBlock;
  interests: InterestsBlock;
  relatedCompanies: RelatedCompaniesBlock;
};

export type SearchResult = {
  query: string;
  title: string;
  url: string;
  content: string;
};

export const BLOCK_KEYS = [
  "company",
  "tax",
  "decisionMaker",
  "serviceContext",
  "interests",
  "relatedCompanies",
] as const;

export type BlockKey = (typeof BLOCK_KEYS)[number];
