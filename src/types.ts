// Shared types for AccountIQ. Keep server/types.ts and src/types.ts identical.

export type ConfidenceLevel = 'High' | 'Medium' | 'Low';

/**
 * Provenance for a single finding.
 * - verified=false  → derived from the model's general knowledge. We DO NOT invent a URL
 *   or a specific publication date in this mode. `label` describes the basis honestly.
 * - verified=true   → backed by a real web-search result; `url` and `date` are real.
 */
export interface Source {
  label: string; // e.g. "Model knowledge (not web-verified)" or "JPMorgan 2024 Annual Report"
  url?: string;
  date?: string; // ISO or human date — only when genuinely known
  verified: boolean;
}

export interface Finding {
  id: string;
  title: string;
  detail: string;
  confidence: ConfidenceLevel;
  whyItMatters: string;
  source: Source;
  tags?: string[];
}

export interface VendorFinding {
  vendor: string;
  category: string; // e.g. "Primary block storage", "Backup"
  productsLikelyInUse: string[];
  estimatedStage: 'Active / mid-cycle' | 'Likely renewal window' | 'Legacy / exposed' | 'Expanding';
  whyExposed: string;
  displacementAngle: string;
  confidence: ConfidenceLevel;
  source: Source;
}

export interface SignalFinding {
  id: string;
  signalType: 'Leadership change' | 'Hiring signal' | 'M&A / investment' | 'Data center / capex' | 'Regulatory pressure' | 'AI initiative';
  headline: string;
  detail: string;
  urgency: 'Act now (0-30 days)' | 'Near-term (this quarter)' | 'Strategic (6-12 months)';
  salesAction: string;
  confidence: ConfidenceLevel;
  source: Source;
}

export interface ProductMatch {
  productName: string;
  productFamily: string;
  matchedNeed: string;
  keyDifferentiator: string;
  targetWorkload: string;
  displacementTarget: string;
  estimatedDealBand: 'Land (<$500K)' | 'Mid ($500K-$2M)' | 'Strategic ($2M+)';
  confidence: ConfidenceLevel;
}

export interface BusinessCaseMetric {
  metric: string;
  currentState: string;
  withIbm: string;
  impact: string;
}

export interface CompetitorTactic {
  competitor: string;
  likelyInstalled: string;
  painPoint: string;
  trapQuestion: string;
  ibmCounter: string;
}

export interface DiscoveryQuestion {
  number: number;
  question: string;
  intent: string;
  listenFor: string[];
  pivot: string;
  targetRole: string;
}

export interface SolutionArchitecture {
  id: string;
  title: string;
  scenario: string;
  tiers: { name: string; items: string[] }[];
  benefits: string[];
}

export interface CaseStudy {
  customerDescriptor: string; // descriptor, not a fabricated named logo unless verified
  industry: string;
  challenge: string;
  solution: string;
  results: string[];
  verified: boolean; // true only if we have a real, citable IBM case study
}

export interface ObjectionHandling {
  objection: string;
  fromRole: string;
  whyTheySayIt: string;
  response: string;
  proofPoint: string;
}

export interface StakeholderPersona {
  role: string; // the function, e.g. "Head of Infrastructure & Storage"
  typicalTitle: string;
  personName?: string; // actual current person, when reliably known
  isNamedIndividual: boolean; // true only when a real, currently-serving named exec is known
  isPrimaryTarget: boolean; // the recommended first contact for THIS deal
  priority: string;
  risk: string;
  valueHook: string; // the IBM Storage angle that resonates with THIS person
  whyThisPerson: string; // why they are (or aren't) the right entry point for THIS specific account
  howToReach: string; // practical next step, e.g. a LinkedIn search string
  emailOpener: string; // tailored, references a specific (ideally cited) fact
  source?: Source; // where a named individual came from (web-verified)
}

export type ResearchMode = 'ai-analysis' | 'web-verified';

export interface AccountIntelligenceReport {
  id: string;
  companyName: string;
  ticker?: string | null;
  industry: string;
  headquarters: string;
  revenue: string;
  employees: string;
  leadership: string; // known CIO/CTO/infra leaders, or "Not reliably known" — never fabricated
  opportunityScore: number; // 0-100, model's qualitative propensity estimate
  opportunityStage: 'High propensity / urgent refresh' | 'Strategic expansion' | 'Competitive takeout' | 'Early / nurture';
  lastUpdated: string;

  // Provenance for the whole report
  researchMode: ResearchMode;
  provenanceNote: string;

  companyStrategy: {
    summary: string;
    businessSegments: Finding[];
    techInvestments: Finding[];
    earningsCommentary: Finding[];
    aiAndInfraStrategy: Finding[];
  };

  technologyLandscape: {
    summary: string;
    cloudFootprint: Finding[];
    storageComputeDb: Finding[];
    existingVendors: VendorFinding[];
    technologyGaps: Finding[];
  };

  businessChallenges: {
    summary: string;
    dataGrowthCosts: Finding[];
    cybersecurityRegulatory: Finding[];
    resilienceDisasterRecovery: Finding[];
    aiWorkloadDemands: Finding[];
  };

  buyingSignals: {
    summary: string;
    signals: SignalFinding[];
  };

  ibmOpportunityMapping: {
    summary: string;
    productOpportunities: ProductMatch[];
    businessCase: BusinessCaseMetric[];
    competitorTactics: CompetitorTactic[];
    wedgeQuestions: string[];
  };

  meetingPreparation: {
    summary: string;
    discoveryQuestions: DiscoveryQuestion[];
    solutionArchitectures: SolutionArchitecture[];
    caseStudies: CaseStudy[];
    objectionsAndCounters: ObjectionHandling[];
  };

  stakeholderMap: StakeholderPersona[];
  engagementStrategy: string; // who to lead with and why, and who NOT to lead with

  executiveBriefingDoc: string; // markdown
}

export interface AgentStepProgress {
  step: number;
  totalSteps: number;
  agentName: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  message: string;
  timestamp: string;
}

export interface AccountSummary {
  id: string;
  companyName: string;
  ticker?: string | null;
  industry: string;
  opportunityScore: number;
  opportunityStage: string;
  revenue: string;
  researchMode: ResearchMode;
  lastUpdated: string;
}
