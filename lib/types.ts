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

export type Brief = {
  input: BriefInput;
  generatedAt: string;
  company: CompanyBlock;
  tax: TaxBlock;
  decisionMaker: DecisionMakerBlock;
  serviceContext: ServiceContextBlock;
  interests: InterestsBlock;
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
] as const;

export type BlockKey = (typeof BLOCK_KEYS)[number];
