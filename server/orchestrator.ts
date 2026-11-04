import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import bundledCache from './data/account_cache.json';
import { callRorkJson, callRorkLlm } from './rorkClient';
import { portfolioContextForPrompt, competitorContextForPrompt } from './knowledgeBase';
import { isWebSearchEnabled, webSearch, formatResultsForPrompt, SearchResult } from './researchProvider';
import { AccountIntelligenceReport, AgentStepProgress, ResearchMode } from './types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CACHE_FILE = path.join(__dirname, 'data', 'account_cache.json');

/**
 * Cache of GENUINELY GENERATED reports only. Starts with pre-generated accounts.
 * This is purely a performance cache so re-opening an account you already researched is instant.
 */
const accountCache = new Map<string, AccountIntelligenceReport>();

// Seed from bundled cache (works seamlessly in serverless / Vercel bundles)
if (bundledCache && typeof bundledCache === 'object') {
  Object.values(bundledCache as unknown as Record<string, AccountIntelligenceReport>).forEach((acc) => {
    if (acc?.id) accountCache.set(acc.id, acc);
  });
}

(function loadDiskCache() {
  try {
    const targetFile = fs.existsSync(CACHE_FILE)
      ? CACHE_FILE
      : (process.env.VERCEL && fs.existsSync(path.join('/tmp', 'account_cache.json'))
        ? path.join('/tmp', 'account_cache.json')
        : null);

    if (targetFile) {
      const parsed = JSON.parse(fs.readFileSync(targetFile, 'utf-8'));
      Object.values(parsed).forEach((acc: any) => {
        if (acc?.id) accountCache.set(acc.id, acc);
      });
    }
  } catch (e) {
    console.warn('[orchestrator] could not read disk cache:', e);
  }
})();

function saveDiskCache() {
  try {
    const obj: Record<string, AccountIntelligenceReport> = {};
    for (const acc of accountCache.values()) obj[acc.id] = acc;
    const targetFile = process.env.VERCEL ? path.join('/tmp', 'account_cache.json') : CACHE_FILE;
    fs.mkdirSync(path.dirname(targetFile), { recursive: true });
    fs.writeFileSync(targetFile, JSON.stringify(obj, null, 2), 'utf-8');
  } catch (e) {
    console.warn('[orchestrator] failed saving cache:', e);
  }
}

function slugify(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function getAllCachedAccounts(): AccountIntelligenceReport[] {
  return Array.from(accountCache.values());
}

export function getAccountByIdOrName(query: string): AccountIntelligenceReport | undefined {
  const q = query.toLowerCase().trim();
  if (accountCache.has(q)) return accountCache.get(q);
  for (const acc of accountCache.values()) {
    if (acc.id === q || acc.companyName.toLowerCase() === q) return acc;
  }
  for (const acc of accountCache.values()) {
    if (acc.companyName.toLowerCase().includes(q)) return acc;
  }
  return undefined;
}

export function deleteAccount(id: string): boolean {
  const existing = getAccountByIdOrName(id);
  if (!existing) return false;
  accountCache.delete(existing.id);
  saveDiskCache();
  return true;
}

// ---------------------------------------------------------------------------
// Prompt building
// ---------------------------------------------------------------------------

function baseSystemPrompt(mode: ResearchMode): string {
  const sourcingRules =
    mode === 'web-verified'
      ? `SOURCING (web-verified mode): You are given real web search results, each numbered [n] with a URL and sometimes a date.
- Base factual claims ONLY on those results. For each finding's "source", set verified=true, label=the publication/source name, url=the real URL from the result, and date=the real date if present.
- If a specific claim is NOT supported by any provided result, set source.verified=false and label="Model knowledge (not web-verified)" and OMIT url/date. Never attach a URL you were not given.`
      : `SOURCING (AI-analysis mode): You have NO web access. This is critical and non-negotiable:
- NEVER invent a URL. NEVER invent a specific publication date or document name.
- For EVERY finding's "source": set verified=false, label="Model knowledge (not web-verified)", and OMIT url and date entirely.
- Express how well-established each claim is via the "confidence" field (High = widely known/stable fact; Medium = reasonable inference; Low = speculative/time-sensitive).
- Prefer durable, structural facts over anything that changes month-to-month.`;

  return `You are AccountIQ, an elite enterprise-storage Solutions Engineer and equity analyst rolled into one. You prepare IBM Storage SEs for executive meetings with large enterprises.

You reason like a Principal Storage & Cloud Architect who also reads 10-Ks and earnings calls. You are specific, quantitative where defensible, and you connect findings to concrete IBM Storage capabilities — never generic fluff.

Accuracy over bravado:
- Do NOT fabricate facts, names, numbers, customer logos, or sources.
- If you don't reliably know something (e.g. the current CIO's name), say so plainly rather than guessing.
- When you infer rather than know, say it's an inference and lower the confidence.

BE SPECIFIC, NOT GENERIC (this is the difference between a useful dossier and ChatGPT fluff):
- Every finding, question, and email opener MUST anchor to something concrete about THIS company — a named initiative or product, a specific facility or region, a regulation it actually faces, a real figure, or a named executive.
- Before writing any sentence, ask: "Could I paste this into a report about a different company and have it still read fine?" If yes, it is too generic — rewrite it with a specific detail or cut it.
- Do not default to boilerplate like "they face data growth and cybersecurity challenges." Say what KIND of data, from which workload, under which regulation, at what scale for THIS company.
- Well-known public firmographics (headquarters city, approximate annual revenue, approximate employee count) for large/public companies ARE established facts — state them with High confidence. Reserve "not reliably known" for things that genuinely change and that you are actually unsure of (like a current individual's name when you lack a source).

INDUSTRY-AUTHENTIC WORKLOAD FIDELITY (CRITICAL):
- Ground all findings and storage workloads strictly in the target company's ACTUAL industry:
  * Electric / Gas / Water Utilities: SCADA/EMS systems, AMI/smart meter telemetry ingestion, GIS geospatial networks, grid sensor time-series data, NERC CIP compliance, substation edge data, operational DR and clean-room isolation. NEVER suggest medical imaging, hospital PACS, retail POS, or algorithmic trading for a utility!
  * Managed Service Providers (MSPs) & Hosting Providers (e.g. Ensono, Kyndryl, DXC): Identify whether they manage or host **Mainframe (IBM Z / zSystems / z/OS / LinuxONE / MIPS)** environments. Ensono in particular is a premier Mainframe MSP managing massive MIPS fleets alongside hybrid cloud. For mainframe-centric MSPs like Ensono, anchor storage plays in **IBM Storage DS8A00 (DS8000 G10)** (tier-1 zSystems flash with zHyperLink) and **IBM TS7700** (mainframe virtual tape grid) alongside **IBM Storage Defender** (for Cyber Vault resilience) and **IBM Storage Fusion** (for OpenShift/container modernization). Do NOT mischaracterize them as an open-cloud-only company!
  * Healthcare / Life Sciences: PACS / VNA medical imaging, Epic / Cerner EHR, HIPAA/HITECH compliance, genomic sequencing, clinical AI inference.
  * Financial Services: Core banking OLTP, payment settlement, fraud detection, algorithmic trading, SEC 17a-4 compliance, DORA compliance.
  * Manufacturing / Logistics: MES, IoT sensor telematics, supply chain ERP, warehouse automation, computer vision QA.
  * Technology / SaaS: Multi-tenant Kubernetes clusters, CI/CD telemetry, real-time analytics data pipelines, customer-facing microservices.
- Never map an industry-inappropriate workload to the target company.

BALANCED MULTI-PRODUCT RECOMMENDATIONS (DO NOT DEFAULT TO FLASHSYSTEM):
- IBM Storage is a rich, multi-tiered portfolio. DO NOT recommend FlashSystem for every opportunity! You must match the right tool to the right problem:
  * IBM Storage DS8A00 (DS8000 G10): The current Generation 10 flagship tier-1 storage platform co-engineered for IBM zSystems / LinuxONE with sub-20µs zHyperLink latency, seven-9s availability, IBM Z Cyber Vault integration, and Transparent Cloud Tiering (TCT). Highlight for any enterprise or MSP running or hosting mainframes (e.g. Ensono, Kyndryl, DXC, core banking, insurance).
  * IBM TS7700: High-performance virtual tape server and active-active grid for IBM Z mainframe backup, batch processing, and DFSMShsm dataset migration.
  * IBM Storage Fusion (HCI & Software): IBM's PRIMARY STRATEGIC platform for container data services, stateful Kubernetes apps, Red Hat OpenShift modernization, and multi-cluster backup/DR. Lead with Fusion for all containerized, cloud-native, and OpenShift modernization initiatives.
  * IBM Storage Defender: Highlight for enterprise cyber resilience, ransomware detection, clean-room recovery orchestration, and regulatory compliance (NERC CIP for utilities, DORA for finance, SEC for public companies).
  * IBM Storage Scale: Highlight for high-throughput AI GPU clusters (GPUDirect), HPC simulation, genomics, and global parallel file data platforms.
  * IBM Tape (Diamondback / TS4500): Highlight for air-gapped immutable compliance archive, lowest $/TB, and lowest carbon footprint.
  * IBM FlashSystem (5600/7600/9600 & C200): Highlight for core primary transactional databases, OLTP, low-latency block consolidation, and capacity flash.
  * IBM Storage Ceph: Position strictly for standalone bulk S3 object repositories and raw telemetry archives on commodity hardware (do NOT position Ceph for OpenShift/container apps where Fusion is the strategic path).
- Ensure your recommendations across the dossier actively utilize this diverse portfolio rather than over-indexing on FlashSystem alone.

PRODUCT-NAMING PRECISION (the model's training data is stale — these are the CURRENT names):
- The mainframe tier-1 flagship is "IBM Storage DS8A00 (DS8000 G10)". NEVER write "DS8900F", "DS8950F", or "DS8880" — those are superseded generations. Always say DS8A00.
- The primary block family is "FlashSystem 5600 / 7600 / 9600" with "FCM5". NEVER write "FlashSystem 9500", "9200", "7300", "5300", or "FCM4" — those are the prior generation. Always use the 5600/7600/9600 + FCM5 names.
- For OpenShift / Kubernetes / container / cloud-native application data, lead with "IBM Storage Fusion". Position "IBM Storage Ceph" ONLY for standalone raw bulk S3 object repositories and uncurated telemetry archives — NEVER for container apps, stateful microservices, or edge app platforms (that is Fusion's job).
- If you are about to name any product, verify it exists in the CURRENT portfolio list below. Do not invent model numbers or carry over an older name from memory.

SELF-AUDIT BEFORE YOU RETURN (do this silently, then fix violations):
1. Count your product recommendations. If more than TWO come from the FlashSystem family, replace the weakest FlashSystem pick with the correct product for that workload (DS8A00/TS7700 for mainframe, Fusion for containers, Scale for AI/GPU, Defender for cyber-recovery, Ceph for bulk object, Tape for archive).
2. Re-read every targetWorkload. If any workload would not realistically run at a company in THIS exact industry, delete or rewrite it. (A utility does not run hospital PACS; an MSP does not run algorithmic trading; a SaaS firm does not run DFSMShsm batch unless it demonstrably hosts mainframes.)
3. Confirm you span at least THREE distinct IBM product families across the dossier.

${sourcingRules}

OUTPUT FORMAT:
- Respond with STRICT JSON only. No prose before or after. No markdown code fences.
- Inside string values, write clean prose. Do NOT use markdown asterisks (** **), bullet characters, or headers inside JSON string fields — just plain sentences. (The executiveBriefingDoc field is the ONLY place you may use markdown.)

CURRENT IBM STORAGE PORTFOLIO (use exact product names — this is the Feb 2026 lineup):
${portfolioContextForPrompt()}

COMPETITOR BATTLECARDS:
${competitorContextForPrompt()}`;
}

const FINDING_SCHEMA = `Finding = {
  "id": string,
  "title": string,
  "detail": string (2-4 substantive sentences, specific to THIS company),
  "confidence": "High" | "Medium" | "Low",
  "whyItMatters": string (why an IBM Storage SE should care),
  "source": { "label": string, "verified": boolean, "url"?: string, "date"?: string }
}`;

interface PipelineContext {
  companyName: string;
  mode: ResearchMode;
  searchResults: Record<string, SearchResult[]>;
}

/**
 * Compact digest of what Agents 1 & 2 actually discovered, injected into Agents 3 & 4
 * so product matching / architectures are grounded in THIS company's real industry,
 * tech stack, incumbents, and challenges — instead of being guessed from the name alone.
 */
function groundingDigest(companyName: string, a1: any, a2: any): string {
  const tech = a2?.technologyLandscape || {};
  const ch = a2?.businessChallenges || {};
  const titles = (arr: any[], n = 3) =>
    (arr || [])
      .slice(0, n)
      .map((f: any) => (typeof f === 'object' ? f.title : null))
      .filter(Boolean)
      .join('; ') || 'n/a';
  const vendors =
    (tech.existingVendors || [])
      .slice(0, 4)
      .map((v: any) => `${v.vendor} (${v.category || '?'}; ${v.estimatedStage || '?'})`)
      .join('; ') || 'n/a';

  return `GROUNDED RESEARCH ON ${companyName} — these are the verified/analyzed facts from the earlier research agents. Every product match, workload, and architecture you produce MUST be consistent with them. Do NOT introduce a different industry or an implausible workload.
- Industry (specific sub-industry): ${a1?.profile?.industry || 'unknown'}
- Strategy: ${a1?.companyStrategy?.summary || 'n/a'}
- Tech landscape: ${tech.summary || 'n/a'}
- Likely incumbent storage/infra vendors: ${vendors}
- Storage / compute / DB footprint: ${titles(tech.storageComputeDb)}
- Cloud footprint: ${titles(tech.cloudFootprint)}
- Technology gaps: ${titles(tech.technologyGaps)}
- Data growth & cost pressures: ${titles(ch.dataGrowthCosts, 2)}
- Cyber / regulatory exposure: ${titles(ch.cybersecurityRegulatory, 2)}
- Resilience / DR needs: ${titles(ch.resilienceDisasterRecovery, 2)}
- AI / workload demands: ${titles(ch.aiWorkloadDemands, 2)}`;
}

function searchBlock(ctx: PipelineContext, keys: string[]): string {
  if (ctx.mode !== 'web-verified') return '';
  const merged: SearchResult[] = [];
  keys.forEach((k) => (ctx.searchResults[k] || []).forEach((r) => merged.push(r)));
  if (merged.length === 0) return '\n\n(No web results available for this section — fall back to AI-analysis sourcing rules for any unsupported claim.)';
  return `\n\nWEB SEARCH RESULTS (cite these with real URLs):\n${formatResultsForPrompt(merged)}`;
}

// ---------------------------------------------------------------------------
// Pipeline
// ---------------------------------------------------------------------------

export async function runResearchPipeline(
  companyName: string,
  onProgress?: (p: AgentStepProgress) => void
): Promise<AccountIntelligenceReport> {
  const id = slugify(companyName);
  const existing = accountCache.get(id);
  if (existing) {
    onProgress?.(step(5, 'Cache', 'completed', `Loaded existing dossier for ${existing.companyName}.`));
    return existing;
  }

  const mode: ResearchMode = isWebSearchEnabled() ? 'web-verified' : 'ai-analysis';
  const sys = baseSystemPrompt(mode);

  // Optional: run real searches up front (only when enabled)
  const searchResults: Record<string, SearchResult[]> = {};
  if (mode === 'web-verified') {
    onProgress?.(step(1, 'Web research', 'in_progress', `Searching public sources for ${companyName}...`));
    const queries: Record<string, string> = {
      firmographics: `${companyName} headquarters annual revenue number of employees company profile`,
      people: `${companyName} CIO CTO "chief information officer" "chief technology officer" head of infrastructure VP infrastructure 2026`,
      strategy: `${companyName} strategy earnings technology investments 2026`,
      tech: `${companyName} infrastructure data center storage mainframe IBM Z zSystems cloud vendors`,
      signals: `${companyName} CIO CTO appointment data center AI investment 2026`,
    };
    await Promise.all(
      Object.entries(queries).map(async ([k, q]) => {
        searchResults[k] = await webSearch(q, 5);
      })
    );
  }
  const ctx: PipelineContext = { companyName, mode, searchResults };

  // NOTE: Rork caps output near ~4K tokens, so each call requests ONE bounded chunk.
  // Each section is wrapped by safe() — a single failed section yields an empty default
  // rather than killing the whole report.

  // Launch Agents 1-4 concurrently in a parallel research swarm
  onProgress?.(step(1, 'Agent Swarm', 'in_progress', `Investigating ${companyName} across all intelligence dimensions in parallel...`));

  const completedSteps = new Set<number>();
  const reportProgress = (completedStep: number, label: string, detail: string) => {
    completedSteps.add(completedStep);
    let nextActive = 1;
    while (nextActive <= 4 && completedSteps.has(nextActive)) {
      nextActive++;
    }
    onProgress?.(step(Math.min(nextActive, 4), label, 'in_progress', detail));
  };

  // Agent 1: Profile & Strategy
  const runAgent1 = async () => {
    const [profile, companyStrategy] = await Promise.all([
      safe(
        'profile',
        () =>
          callRorkJson<any>(
            sys,
            `Give the firmographic profile of "${companyName}". Return JSON ONLY:
{
  "companyName": string (official legal name),
  "ticker": string | null (stock ticker if public, else null),
  "industry": string (specific sub-industry, not just "Technology"),
  "headquarters": string (City, State/Country — this is a known public fact for major companies; provide it),
  "revenue": string (most recent annual revenue as a clean figure like "$25.1B (FY2024)"; for large public companies this is known — provide it, mark (est.) only if estimating),
  "employees": string (approximate headcount as a clean figure like "~33,000"; provide it for major companies),
  "leadership": string (name the CURRENT CIO/CTO/top infrastructure leader ONLY if you are confident or it appears in the sources below; otherwise exactly "See stakeholder map")
}
Do NOT answer "Unknown" or "Not reliably known" for headquarters, revenue, or employees of a well-known company — those are established facts.${searchBlock(ctx, ['firmographics', 'people'])}`,
            { timeoutMs: 60000 }
          ),
        { companyName }
      ),
      safe(
        'companyStrategy',
        () =>
          callRorkJson<any>(
            sys,
            `Analyze the strategy of "${companyName}". Return JSON ONLY:
{
  "summary": string (3-5 sentences, plain prose, specific to this company),
  "businessSegments": Finding[] (3-4),
  "techInvestments": Finding[] (2-3),
  "earningsCommentary": Finding[] (2),
  "aiAndInfraStrategy": Finding[] (2-3)
}
Keep each "detail" to 2-3 sentences, each anchored to a specific ${companyName} detail. ${FINDING_SCHEMA}${searchBlock(ctx, ['strategy'])}`,
            { timeoutMs: 90000 }
          ),
        emptyStrategy()
      ),
    ]);
    reportProgress(1, 'Agent 1 Complete', `Established firmographics and strategy for ${companyName}.`);
    return { profile: unwrap(profile, 'profile'), companyStrategy: unwrap(companyStrategy, 'companyStrategy') };
  };

  // Agent 2: Technology Landscape & Business Challenges
  const runAgent2 = async () => {
    const [techLandscape, challenges] = await Promise.all([
      safe(
        'technologyLandscape',
        () =>
          callRorkJson<any>(
            sys,
            `For "${companyName}", analyze the technology landscape. Return JSON:
{
  "summary": string,
  "cloudFootprint": Finding[] (2-3),
  "storageComputeDb": Finding[] (2-3),
  "existingVendors": VendorFinding[] (3-4),
  "technologyGaps": Finding[] (2-3)
}
Keep each "detail" to 2 sentences. ${FINDING_SCHEMA}
VendorFinding = { "vendor": string, "category": string, "productsLikelyInUse": string[], "estimatedStage": "Active / mid-cycle"|"Likely renewal window"|"Legacy / exposed"|"Expanding", "whyExposed": string, "displacementAngle": string, "confidence": "High"|"Medium"|"Low", "source": {"label":string,"verified":boolean} }
Be concrete about likely incumbents (Dell, Pure, NetApp, HPE, hyperscalers) but mark confidence honestly — you are inferring.${searchBlock(ctx, ['tech'])}`,
            { timeoutMs: 90000 }
          ),
        emptyTech()
      ),
      safe(
        'businessChallenges',
        () =>
          callRorkJson<any>(
            sys,
            `For "${companyName}", analyze storage-relevant business challenges. Return JSON:
{
  "summary": string,
  "dataGrowthCosts": Finding[] (2),
  "cybersecurityRegulatory": Finding[] (2),
  "resilienceDisasterRecovery": Finding[] (2),
  "aiWorkloadDemands": Finding[] (2)
}
Keep each "detail" to 2 sentences. ${FINDING_SCHEMA}`,
            { timeoutMs: 90000 }
          ),
        emptyChallenges()
      ),
    ]);
    reportProgress(2, 'Agent 2 Complete', 'Mapped infrastructure footprint and storage challenges.');
    return {
      technologyLandscape: unwrap(techLandscape, 'technologyLandscape'),
      businessChallenges: unwrap(challenges, 'businessChallenges'),
    };
  };

  // Agent 3: Buying Signals & IBM Opportunity Mapping
  const runAgent3 = async (digest: string) => {
    const [buyingSignals, ibmMapping] = await Promise.all([
      safe(
        'buyingSignals',
        () =>
          callRorkJson<any>(
            sys,
            `For "${companyName}", identify buying signals relevant to an enterprise storage refresh. Return JSON:
{
  "summary": string,
  "signals": SignalFinding[] (4-6)
}
SignalFinding = { "id": string, "signalType": "Leadership change"|"Hiring signal"|"M&A / investment"|"Data center / capex"|"Regulatory pressure"|"AI initiative", "headline": string, "detail": string (2 sentences), "urgency": "Act now (0-30 days)"|"Near-term (this quarter)"|"Strategic (6-12 months)", "salesAction": string, "confidence": "High"|"Medium"|"Low", "source": {"label":string,"verified":boolean,"url"?:string,"date"?:string} }

${digest}${searchBlock(ctx, ['signals'])}`,
            { timeoutMs: 90000 }
          ),
        { summary: '', signals: [] }
      ),
      safe(
        'ibmOpportunityMapping',
        () =>
          callRorkJson<any>(
            sys,
            `For "${companyName}", map opportunities to the CURRENT IBM Storage portfolio (IBM Storage DS8A00, IBM TS7700, IBM Storage Fusion, IBM Storage Defender, IBM Storage Scale, FlashSystem 5600/7600/9600 with FCM5, FlashSystem.ai, C200, IBM Storage Ceph, Tape).

${digest}

Return JSON:
{
  "summary": string,
  "productOpportunities": ProductMatch[] (3-5),
  "businessCase": BusinessCaseMetric[] (3-4),
  "competitorTactics": CompetitorTactic[] (2-3),
  "wedgeQuestions": string[] (3-5)
}
ProductMatch = { "productName": string (exact IBM product), "productFamily": string, "matchedNeed": string, "keyDifferentiator": string, "targetWorkload": string, "displacementTarget": string, "estimatedDealBand": "Land (<$500K)"|"Mid ($500K-$2M)"|"Strategic ($2M+)", "confidence": "High"|"Medium"|"Low" }
BusinessCaseMetric = { "metric": string, "currentState": string, "withIbm": string, "impact": string }
CompetitorTactic = { "competitor": string, "likelyInstalled": string, "painPoint": string, "trapQuestion": string, "ibmCounter": string }

STRICT REQUIREMENTS FOR PRODUCT MATCHING:
1. Workload authenticity: Every targetWorkload MUST belong to THIS company's actual industry operations (e.g. for an MSP like Ensono: mainframe hosting/MIPS management, hybrid cloud DR, backup as a service; for a utility: smart meter data, SCADA telemetry, outage management, NERC CIP compliance; NEVER suggest hospital PACS or medical imaging for an MSP or utility!).
2. Diverse portfolio balance: DO NOT default to FlashSystem for every opportunity! You MUST span at least 3 distinct IBM Storage product families. For example:
   - IBM Storage DS8A00 (DS8000 G10) & IBM TS7700 for IBM Z mainframe estates, z/OS transactional cores, and Mainframe MSPs (like Ensono, Kyndryl)
   - IBM Storage Fusion (HCI & Software) as the PRIMARY STRATEGIC choice for containerized apps, Red Hat OpenShift, Kubernetes backup/DR, and modern hybrid cloud (prefer Fusion over Ceph for application modernization)
   - IBM Storage Defender for automated cyber recovery & compliance (including IBM Z Cyber Vault)
   - IBM Storage Scale for high-throughput AI GPU clusters & parallel files
   - IBM Tape for air-gapped deep compliance archive
   - IBM FlashSystem for core latency-sensitive databases / transactional block storage
   - IBM Storage Ceph strictly for secondary bulk S3 object repositories / uncurated telemetry
   At most TWO recommendations may be from FlashSystem.${searchBlock(ctx, ['tech', 'strategy'])}`,
            { timeoutMs: 90000 }
          ),
        emptyIbm()
      ),
    ]);
    reportProgress(3, 'Agent 3 Complete', 'Identified buying signals and matched IBM Storage portfolio.');
    return {
      buyingSignals: unwrap(buyingSignals, 'buyingSignals'),
      ibmOpportunityMapping: unwrap(ibmMapping, 'ibmOpportunityMapping'),
    };
  };

  // Agent 4: Discovery, Architectures & Stakeholders
  const runAgent4 = async (digest: string) => {
    const [meetingCore, meetingExtra, stakeholders] = await Promise.all([
      safe(
        'discovery+objections',
        () =>
          callRorkJson<any>(
            sys,
            `For "${companyName}", produce discovery questions and objection handling for an IBM Storage SE.

${digest}

Return JSON:
{
  "summary": string,
  "discoveryQuestions": DiscoveryQuestion[] (exactly 5),
  "objectionsAndCounters": ObjectionHandling[] (3)
}
DiscoveryQuestion = { "number": number, "question": string, "intent": string, "listenFor": string[], "pivot": string, "targetRole": string }
ObjectionHandling = { "objection": string, "fromRole": string, "whyTheySayIt": string, "response": string, "proofPoint": string }${searchBlock(ctx, ['tech'])}`,
            { timeoutMs: 90000 }
          ),
        { summary: '', discoveryQuestions: [], objectionsAndCounters: [] }
      ),
      safe(
        'architectures+cases',
        () =>
          callRorkJson<any>(
            sys,
            `For "${companyName}", produce solution architectures and proof points mapped to IBM Storage.

${digest}

Return JSON:
{
  "solutionArchitectures": SolutionArchitecture[] (3),
  "caseStudies": CaseStudy[] (2)
}
SolutionArchitecture = { "id": string, "title": string, "scenario": string, "tiers": [{"name": string, "items": string[]}] (3 tiers), "benefits": string[] }
CaseStudy = { "customerDescriptor": string, "industry": string, "challenge": string, "solution": string, "results": string[], "verified": boolean }
All 3 SolutionArchitectures MUST reflect this company's actual industry (e.g. for a utility: Smart Grid Telemetry Lake with Ceph, Substation & OT Clean-Room Resilience with Defender, and Core Grid Analytics with FlashSystem; NEVER generate medical imaging or banking trading architectures for a utility!). For CaseStudy: set verified=true with a real named customer ONLY if you are genuinely confident it is a real public IBM reference; otherwise use an anonymized descriptor (e.g. "A major regional electric utility") and verified=false.${searchBlock(ctx, ['tech', 'strategy'])}`,
            { timeoutMs: 90000 }
          ),
        { solutionArchitectures: [], caseStudies: [] }
      ),
      safe(
        'stakeholders',
        () =>
          callRorkJson<any>(
            sys,
            `For "${companyName}", determine WHO an IBM Storage SE should actually engage — the specific right people, not a generic list. Return JSON ONLY:
{
  "engagementStrategy": string (3-4 sentences: who to lead with FIRST and why, the sequence to work the account, and who NOT to lead with. Be specific to THIS company's situation — e.g. if they are AI-heavy, the Head of AI/ML Platforms may matter more than a generic CIO.),
  "stakeholderMap": StakeholderPersona[] (4-5, chosen for THIS account's situation)
}
StakeholderPersona = {
  "role": string (the function that matters here, e.g. "Head of Infrastructure & Storage", "Chief Data/AI Officer", "Head of Site Reliability", "CISO" — pick the roles that actually drive a storage decision at THIS company),
  "typicalTitle": string,
  "personName": string | null (the ACTUAL current person if named in the sources below or you are confident; else null),
  "isNamedIndividual": boolean (true only with a real current name),
  "isPrimaryTarget": boolean (true for exactly ONE — the single best first contact),
  "priority": "High" | "Medium" | "Low",
  "risk": string (their top concern that storage touches),
  "valueHook": string (the specific IBM Storage angle that lands with THIS person, naming a product),
  "whyThisPerson": string (why they are, or are not, the right entry point for THIS deal specifically),
  "howToReach": string (a practical next step, e.g. a LinkedIn search string like 'VP Infrastructure ${companyName}'),
  "emailOpener": string (2-3 sentences, references a SPECIFIC ${companyName} fact),
  "source": { "label": string, "verified": boolean, "url"?: string } (only when a name comes from a source below; else omit)
}
Name real individuals when the sources below support it. Exactly one persona must have isPrimaryTarget=true.${searchBlock(ctx, ['people'])}`,
            { timeoutMs: 90000 }
          ),
        { engagementStrategy: '', stakeholderMap: [] }
      ),
    ]);
    reportProgress(4, 'Agent 4 Complete', 'Synthesized discovery questions, architectures, and stakeholder map.');
    const mCore = unwrap(meetingCore, 'meetingPreparation');
    const mExtra = unwrap(meetingExtra, 'meetingPreparation');
    const stk = unwrap(stakeholders, 'stakeholders');
    const stakeholderMap = Array.isArray(stk) ? stk : stk?.stakeholderMap || [];
    const engagementStrategy = (Array.isArray(stk) ? '' : stk?.engagementStrategy) || '';
    return {
      meetingPreparation: {
        summary: mCore.summary || '',
        discoveryQuestions: mCore.discoveryQuestions || [],
        objectionsAndCounters: mCore.objectionsAndCounters || [],
        solutionArchitectures: mExtra.solutionArchitectures || [],
        caseStudies: mExtra.caseStudies || [],
      },
      stakeholderMap,
      engagementStrategy,
    };
  };

  // Grounding strategy depends on whether we have live web results:
  // - web-verified: the up-front searches already ran, so Agents 3 & 4 are grounded
  //   directly on those live results (via searchBlock). We can run ALL agents in a single
  //   parallel wave — fast, and still anchored to real company facts.
  // - ai-analysis (no search key): there are no live results, so we fall back to a two-wave
  //   pipeline where Agents 3 & 4 are grounded on a digest synthesized by Agents 1 & 2.
  let a1: any, a2: any, a3: any, a4: any;
  if (mode === 'web-verified') {
    [a1, a2, a3, a4] = await Promise.all([runAgent1(), runAgent2(), runAgent3(''), runAgent4('')]);
  } else {
    [a1, a2] = await Promise.all([runAgent1(), runAgent2()]);
    const digest = groundingDigest(companyName, a1, a2);
    [a3, a4] = await Promise.all([runAgent3(digest), runAgent4(digest)]);
  }

  // Agent 5 — Executive Briefing + scoring
  onProgress?.(step(5, 'Agent 5 · Executive Briefing', 'in_progress', 'Synthesizing the full executive briefing and scoring the opportunity...'));
  const summaryContext = JSON.stringify({
    profile: a1.profile,
    strategy: a1.companyStrategy?.summary,
    tech: a2.technologyLandscape?.summary,
    incumbentVendors: (a2.technologyLandscape?.existingVendors || []).map((v: any) => `${v.vendor} (${v.category}; ${v.estimatedStage})`),
    challenges: a2.businessChallenges?.summary,
    signals: (a3.buyingSignals?.signals || []).map((s: any) => s.headline),
    ibm: (a3.ibmOpportunityMapping?.productOpportunities || []).map((p: any) => `${p.productName} -> ${p.matchedNeed}`),
    competitorTactics: (a3.ibmOpportunityMapping?.competitorTactics || []).map((c: any) => `${c.competitor}: ${c.ibmCounter}`),
  });
  const a5 = await safe(
    'executiveBriefing',
    () =>
      callRorkJson<any>(
        sys,
        `Using the research below for "${companyName}", produce the final synthesis. Return JSON:
{
  "opportunityScore": number (0-100, your honest propensity-to-buy IBM Storage estimate),
  "opportunityStage": "High propensity / urgent refresh" | "Strategic expansion" | "Competitive takeout" | "Early / nurture",
  "executiveBriefingDoc": string
}
The executiveBriefingDoc MUST be a thorough, well-structured MARKDOWN document (this is the ONE field where markdown is required). Aim for 450-650 words with crisp, punchy SE prose and bullet points under each ## heading:
## Executive Summary (the one-paragraph "why this account, why now")
## Where IBM Storage Fits (3-5 specific plays mapped to their situation across DS8A00, TS7700, Fusion, Defender, Scale, and FlashSystem)
## The Numbers That Matter (business-case framing)
## Competitive Landscape (who is likely incumbent and how to displace)
## Recommended Meeting Plan (how to run the first exec conversation)
## Key Risks & Unknowns (what to verify before the meeting — be honest about what is inferred)
Write in crisp SE prose. Ground all workloads strictly in this company's actual industry. Real IBM product names only. Frame estimates as estimates.

RESEARCH CONTEXT:
${summaryContext}`,
        { timeoutMs: 90000 }
      ),
    { opportunityScore: 50, opportunityStage: 'Early / nurture', executiveBriefingDoc: '' }
  );

  const report: AccountIntelligenceReport = {
    id,
    companyName: a1.profile?.companyName || companyName,
    ticker: a1.profile?.ticker ?? null,
    industry: a1.profile?.industry || 'Unknown',
    headquarters: a1.profile?.headquarters || 'Unknown',
    revenue: a1.profile?.revenue || 'Unknown',
    employees: a1.profile?.employees || 'Unknown',
    leadership: a1.profile?.leadership || 'See stakeholder map',
    opportunityScore: clampScore(a5.opportunityScore),
    opportunityStage: a5.opportunityStage || 'Early / nurture',
    lastUpdated: new Date().toISOString(),
    researchMode: mode,
    provenanceNote:
      mode === 'web-verified'
        ? 'Findings backed by live web search carry a verified source link. Unlinked findings are AI analysis.'
        : "This report is AI analysis generated from the model's knowledge. It is NOT web-verified — confirm time-sensitive facts before your meeting.",
    companyStrategy: a1.companyStrategy || emptyStrategy(),
    technologyLandscape: a2.technologyLandscape || emptyTech(),
    businessChallenges: a2.businessChallenges || emptyChallenges(),
    buyingSignals: a3.buyingSignals || { summary: '', signals: [] },
    ibmOpportunityMapping: a3.ibmOpportunityMapping || emptyIbm(),
    meetingPreparation: a4.meetingPreparation || emptyMeeting(),
    stakeholderMap: a4.stakeholderMap || [],
    engagementStrategy: a4.engagementStrategy || '',
    executiveBriefingDoc: a5.executiveBriefingDoc || '',
  };

  try {
    normalizeSources(report, mode);
  } catch (e) {
    console.warn('[orchestrator] normalizeSources failed (non-fatal):', e);
  }

  accountCache.set(id, report);
  saveDiskCache();
  onProgress?.(step(5, 'Complete', 'completed', `Dossier for ${report.companyName} ready.`));
  return report;
}

// ---------------------------------------------------------------------------
// Chat copilot
// ---------------------------------------------------------------------------

export async function askAccountCopilot(
  account: AccountIntelligenceReport,
  question: string,
  history: { role: 'user' | 'assistant'; content: string }[]
): Promise<string> {
  const sys = `You are AccountIQ's meeting-prep copilot for an IBM Storage Solutions Engineer. You answer questions about the account "${account.companyName}" grounded in the dossier below and in current IBM Storage product knowledge.

Rules:
- Be concise, specific, and practical. Answer in clean markdown (short paragraphs, bold for emphasis, bullets where helpful).
- Use exact IBM product names (FlashSystem 5600/7600/9600, FCM5, FlashSystem.ai, Storage Scale, Defender, Ceph, Fusion).
- Do NOT fabricate facts, customer names, or sources. If something isn't in the dossier and you're unsure, say so and suggest how to verify.

DOSSIER (JSON):
${JSON.stringify({
    profile: {
      companyName: account.companyName,
      industry: account.industry,
      revenue: account.revenue,
      leadership: account.leadership,
      stage: account.opportunityStage,
    },
    strategy: account.companyStrategy?.summary,
    tech: account.technologyLandscape,
    challenges: account.businessChallenges?.summary,
    signals: account.buyingSignals?.signals,
    ibm: account.ibmOpportunityMapping,
  }).slice(0, 9000)}

IBM PORTFOLIO:
${portfolioContextForPrompt()}`;

  const messages = [
    { role: 'system' as const, content: sys },
    ...history.slice(-6).map((h) => ({ role: h.role, content: h.content })),
    { role: 'user' as const, content: question },
  ];
  return callRorkLlm(messages, { timeoutMs: 60000 });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function step(n: number, agentName: string, status: AgentStepProgress['status'], message: string): AgentStepProgress {
  return { step: n, totalSteps: 5, agentName, status, message, timestamp: new Date().toISOString() };
}

/** Run a section call; on failure, log and return the fallback so the report still renders. */
async function safe<T>(label: string, fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (e: any) {
    console.warn(`[orchestrator] section "${label}" failed: ${e?.message || e}`);
    return fallback;
  }
}

function clampScore(v: any): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return 50;
  return Math.max(0, Math.min(100, Math.round(n)));
}

/**
 * The model sometimes wraps a section under a key (e.g. returns {"companyStrategy": {...}}
 * instead of the flat object we asked for). Unwrap that so data isn't silently lost.
 */
function unwrap(obj: any, key: string): any {
  if (obj && typeof obj === 'object' && !Array.isArray(obj) && obj[key] && typeof obj[key] === 'object') {
    return obj[key];
  }
  return obj;
}

/** Enforce sourcing honesty server-side regardless of what the model returned. */
function normalizeSources(report: AccountIntelligenceReport, mode: ResearchMode) {
  const fix = (src: any) => {
    if (!src || typeof src !== 'object') return { label: 'Model knowledge (not web-verified)', verified: false };
    if (mode === 'ai-analysis' || !src.verified) {
      return { label: src.label || 'Model knowledge (not web-verified)', verified: false };
    }
    if (!src.url) return { label: 'Model knowledge (not web-verified)', verified: false };
    return { label: src.label || 'Web source', verified: true, url: src.url, date: src.date };
  };

  // Defensive: the model sometimes emits an array element as a JSON string (double-encoded);
  // recover it when possible, and never assign onto a non-object.
  const fixFindings = (arr: any) => {
    if (!Array.isArray(arr)) return;
    for (let i = 0; i < arr.length; i++) {
      let f = arr[i];
      if (typeof f === 'string') {
        try {
          f = JSON.parse(f);
          arr[i] = f;
        } catch {
          continue;
        }
      }
      if (f && typeof f === 'object') f.source = fix(f.source);
    }
  };
  const s = report;
  [s.companyStrategy.businessSegments, s.companyStrategy.techInvestments, s.companyStrategy.earningsCommentary, s.companyStrategy.aiAndInfraStrategy].forEach(fixFindings);
  [s.technologyLandscape.cloudFootprint, s.technologyLandscape.storageComputeDb, s.technologyLandscape.technologyGaps].forEach(fixFindings);
  fixFindings(s.technologyLandscape.existingVendors);
  [s.businessChallenges.dataGrowthCosts, s.businessChallenges.cybersecurityRegulatory, s.businessChallenges.resilienceDisasterRecovery, s.businessChallenges.aiWorkloadDemands].forEach(fixFindings);
  fixFindings(s.buyingSignals.signals);

  // Stakeholders: a persona source is optional; only keep a verified one, and never claim a
  // named individual as verified without a real URL.
  (s.stakeholderMap || []).forEach((p: any) => {
    if (!p || typeof p !== 'object') return;
    if (p.source) {
      const fixed = fix(p.source);
      if (fixed.verified) p.source = fixed;
      else delete p.source;
    }
    if (p.isNamedIndividual && (!p.personName || (mode === 'web-verified' && !p.source))) {
      // keep the name but be honest it's not source-backed
      if (mode === 'web-verified' && !p.source) p.isNamedIndividual = p.isNamedIndividual && Boolean(p.personName);
    }
    if (!p.personName) p.isNamedIndividual = false;
  });
}

const emptyStrategy = () => ({ summary: '', businessSegments: [], techInvestments: [], earningsCommentary: [], aiAndInfraStrategy: [] });
const emptyTech = () => ({ summary: '', cloudFootprint: [], storageComputeDb: [], existingVendors: [], technologyGaps: [] });
const emptyChallenges = () => ({ summary: '', dataGrowthCosts: [], cybersecurityRegulatory: [], resilienceDisasterRecovery: [], aiWorkloadDemands: [] });
const emptyIbm = () => ({ summary: '', productOpportunities: [], businessCase: [], competitorTactics: [], wedgeQuestions: [] });
const emptyMeeting = () => ({ summary: '', discoveryQuestions: [], solutionArchitectures: [], caseStudies: [], objectionsAndCounters: [] });
