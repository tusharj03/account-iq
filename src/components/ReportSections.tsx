import React, { useState } from 'react';
import {
  Building2,
  Server,
  AlertTriangle,
  Radar,
  Target,
  ClipboardList,
  Users,
  FileText,
  Copy,
  Check,
  ShieldCheck,
  Download,
} from 'lucide-react';
import { AccountIntelligenceReport } from '../types';
import { Card, SectionHeader, FindingGrid, ScoreRing, Pill, SourceTag, ConfidenceBadge, EmptyNote } from './primitives';
import { Markdown } from './Markdown';

/** Shown when a section came back empty (a research sub-step didn't return usable data). */
function SectionEmpty() {
  return (
    <Card className="p-6 border-dashed">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-ibm-amber shrink-0 mt-0.5" />
        <div>
          <p className="text-gray-100 font-medium">This section didn't return data on the last run.</p>
          <p className="text-sm text-gray-60 mt-1">
            One research sub-step came back empty (the model occasionally returns an unusable response). Re-run this
            account from “New account” to regenerate it — the other sections are unaffected.
          </p>
        </div>
      </div>
    </Card>
  );
}

/* ------------------------------- Overview ------------------------------- */

export function OverviewSection({ account }: { account: AccountIntelligenceReport }) {
  const facts: [string, string][] = [
    ['Industry', account.industry],
    ['Ticker', account.ticker || '—'],
    ['Headquarters', account.headquarters],
    ['Revenue', account.revenue],
    ['Employees', account.employees],
    ['Tech leadership', account.leadership],
  ];
  const topSignals = account.buyingSignals?.signals?.slice(0, 3) || [];
  const topProducts = account.ibmOpportunityMapping?.productOpportunities?.slice(0, 4) || [];

  return (
    <div className="fade-up">
      <SectionHeader eyebrow="Account overview" title={account.companyName} />

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-5">
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
            {facts.map(([k, v]) => (
              <div key={k}>
                <div className="text-[11px] font-mono uppercase tracking-wide text-gray-50">{k}</div>
                <div className="text-sm text-gray-100 mt-0.5">{v}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <ScoreRing score={account.opportunityScore} size={84} />
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wide text-gray-50">Opportunity</div>
            <div className="text-sm font-semibold text-gray-100 mt-0.5">{account.opportunityStage}</div>
            <div className="mt-2">
              <Pill tone={account.researchMode === 'web-verified' ? 'green' : 'blue'}>
                {account.researchMode === 'web-verified' ? 'Web-verified' : 'AI analysis'}
              </Pill>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-4 flex items-start gap-2 bg-[#edf5ff] border border-[#d0e2ff] p-3 text-sm text-gray-80">
        <ShieldCheck className="w-4 h-4 text-ibm-blue mt-0.5 shrink-0" />
        <span>{account.provenanceNote}</span>
      </div>

      {account.companyStrategy?.summary && (
        <Card className="mt-4 p-5">
          <h3 className="text-sm font-mono uppercase tracking-widest text-gray-60 mb-2">Strategic snapshot</h3>
          <p className="text-gray-80 leading-relaxed">{account.companyStrategy.summary}</p>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-4 mt-4">
        <Card className="p-5">
          <h3 className="text-sm font-mono uppercase tracking-widest text-gray-60 mb-3">Top buying signals</h3>
          {topSignals.length === 0 ? (
            <EmptyNote>No signals identified.</EmptyNote>
          ) : (
            <ul className="space-y-2.5">
              {topSignals.map((s) => (
                <li key={s.id} className="flex items-start gap-2">
                  <Radar className="w-4 h-4 text-ibm-blue mt-0.5 shrink-0" />
                  <div>
                    <div className="text-sm text-gray-100 font-medium">{s.headline}</div>
                    <div className="text-xs text-gray-60">{s.signalType}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card className="p-5">
          <h3 className="text-sm font-mono uppercase tracking-widest text-gray-60 mb-3">Lead IBM plays</h3>
          {topProducts.length === 0 ? (
            <EmptyNote>No product mapping yet.</EmptyNote>
          ) : (
            <ul className="space-y-2.5">
              {topProducts.map((p, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Target className="w-4 h-4 text-ibm-blue mt-0.5 shrink-0" />
                  <div>
                    <div className="text-sm text-gray-100 font-medium">{p.productName}</div>
                    <div className="text-xs text-gray-60">{p.matchedNeed}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

/* ------------------------------- Strategy ------------------------------- */

export function StrategySection({ account }: { account: AccountIntelligenceReport }) {
  const s = account.companyStrategy;
  return (
    <div className="fade-up">
      <SectionHeader eyebrow="01 · Company strategy" title="Strategy & direction" summary={s?.summary} />
      <FindingGrid title="Business segments" findings={s?.businessSegments} />
      <FindingGrid title="Technology investments" findings={s?.techInvestments} />
      <FindingGrid title="Earnings-call commentary" findings={s?.earningsCommentary} />
      <FindingGrid title="AI & infrastructure strategy" findings={s?.aiAndInfraStrategy} />
    </div>
  );
}

/* --------------------------- Tech landscape ----------------------------- */

export function TechSection({ account }: { account: AccountIntelligenceReport }) {
  const t = account.technologyLandscape;
  const isEmpty =
    !t?.summary &&
    !(t?.cloudFootprint?.length || t?.storageComputeDb?.length || t?.existingVendors?.length || t?.technologyGaps?.length);
  return (
    <div className="fade-up">
      <SectionHeader eyebrow="02 · Technology landscape" title="Infrastructure & vendor footprint" summary={t?.summary} />
      {isEmpty && <SectionEmpty />}

      {t?.existingVendors && t.existingVendors.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-mono uppercase tracking-widest text-gray-60 mb-3">Incumbent vendor estate (inferred)</h3>
          <Card className="overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-10 border-b border-gray-20 text-left text-xs uppercase tracking-wide text-gray-60">
                  <th className="px-4 py-2.5 font-medium">Vendor</th>
                  <th className="px-4 py-2.5 font-medium">Likely products</th>
                  <th className="px-4 py-2.5 font-medium">Stage</th>
                  <th className="px-4 py-2.5 font-medium">IBM displacement angle</th>
                  <th className="px-4 py-2.5 font-medium">Conf.</th>
                </tr>
              </thead>
              <tbody>
                {t.existingVendors.map((v, i) => (
                  <tr key={i} className="border-b border-gray-10 last:border-0 align-top">
                    <td className="px-4 py-3 font-medium text-gray-100">{v.vendor}</td>
                    <td className="px-4 py-3 text-gray-70">{(v.productsLikelyInUse || []).join(', ')}</td>
                    <td className="px-4 py-3">
                      <Pill tone={v.estimatedStage === 'Legacy / exposed' ? 'red' : v.estimatedStage === 'Likely renewal window' ? 'amber' : 'neutral'}>
                        {v.estimatedStage}
                      </Pill>
                    </td>
                    <td className="px-4 py-3 text-gray-70">{v.displacementAngle}</td>
                    <td className="px-4 py-3 text-gray-60">{v.confidence}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      <FindingGrid title="Cloud & hybrid-cloud footprint" findings={t?.cloudFootprint} />
      <FindingGrid title="Storage, compute & database" findings={t?.storageComputeDb} />
      <FindingGrid title="Technology gaps" findings={t?.technologyGaps} />
    </div>
  );
}

/* ----------------------------- Challenges ------------------------------- */

export function ChallengesSection({ account }: { account: AccountIntelligenceReport }) {
  const c = account.businessChallenges;
  const isEmpty =
    !c?.summary &&
    !(c?.dataGrowthCosts?.length || c?.cybersecurityRegulatory?.length || c?.resilienceDisasterRecovery?.length || c?.aiWorkloadDemands?.length);
  return (
    <div className="fade-up">
      <SectionHeader eyebrow="03 · Business challenges" title="Pressures that create storage demand" summary={c?.summary} />
      {isEmpty && <SectionEmpty />}
      <FindingGrid title="Data growth & storage cost" findings={c?.dataGrowthCosts} />
      <FindingGrid title="Cybersecurity & regulatory" findings={c?.cybersecurityRegulatory} />
      <FindingGrid title="Resilience & disaster recovery" findings={c?.resilienceDisasterRecovery} />
      <FindingGrid title="AI workload demands" findings={c?.aiWorkloadDemands} />
    </div>
  );
}

/* ------------------------------- Signals -------------------------------- */

export function SignalsSection({ account }: { account: AccountIntelligenceReport }) {
  const sig = account.buyingSignals;
  const urgencyTone = (u: string) => (u.startsWith('Act now') ? 'red' : u.startsWith('Near-term') ? 'amber' : 'blue');
  return (
    <div className="fade-up">
      <SectionHeader eyebrow="04 · Buying signals" title="Why now" summary={sig?.summary} />
      {!sig?.signals?.length ? (
        <EmptyNote>No buying signals identified.</EmptyNote>
      ) : (
        <div className="space-y-3">
          {sig.signals.map((s) => (
            <Card key={s.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Pill tone="neutral">{s.signalType}</Pill>
                  <Pill tone={urgencyTone(s.urgency) as any}>{s.urgency}</Pill>
                </div>
                <ConfidenceBadge level={s.confidence} />
              </div>
              <h4 className="mt-3 font-semibold text-gray-100">{s.headline}</h4>
              <p className="mt-1 text-sm text-gray-80 leading-relaxed">{s.detail}</p>
              <div className="mt-3 border-l-2 border-ibm-blue pl-3">
                <span className="text-[11px] font-mono uppercase tracking-wide text-ibm-blue">Recommended action</span>
                <p className="text-sm text-gray-70 mt-0.5">{s.salesAction}</p>
              </div>
              <div className="mt-3 pt-2 border-t border-gray-10">
                <SourceTag source={s.source} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* --------------------------- IBM opportunity ---------------------------- */

export function IbmSection({ account }: { account: AccountIntelligenceReport }) {
  const m = account.ibmOpportunityMapping;
  const bandTone = (b: string) => (b.startsWith('Strategic') ? 'green' : b.startsWith('Mid') ? 'blue' : 'neutral');
  return (
    <div className="fade-up">
      <SectionHeader eyebrow="05 · IBM opportunity mapping" title="Where IBM Storage fits" summary={m?.summary} />

      <h3 className="text-sm font-mono uppercase tracking-widest text-gray-60 mb-3">Product opportunities</h3>
      <div className="grid md:grid-cols-2 gap-3 mb-6">
        {(m?.productOpportunities || []).map((p, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-semibold text-ibm-blue">{p.productName}</h4>
              <Pill tone={bandTone(p.estimatedDealBand) as any}>{p.estimatedDealBand}</Pill>
            </div>
            <div className="text-xs text-gray-50 mt-0.5">{p.productFamily}</div>
            <p className="mt-2 text-sm text-gray-80"><span className="font-medium text-gray-100">Need:</span> {p.matchedNeed}</p>
            <p className="mt-1 text-sm text-gray-80"><span className="font-medium text-gray-100">Edge:</span> {p.keyDifferentiator}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-60">
              <span>Workload: {p.targetWorkload}</span>
              {p.displacementTarget && <span>· Displaces: {p.displacementTarget}</span>}
            </div>
          </Card>
        ))}
      </div>

      {m?.businessCase && m.businessCase.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-mono uppercase tracking-widest text-gray-60 mb-3">Business case</h3>
          <Card className="overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-10 border-b border-gray-20 text-left text-xs uppercase tracking-wide text-gray-60">
                  <th className="px-4 py-2.5 font-medium">Metric</th>
                  <th className="px-4 py-2.5 font-medium">Current state</th>
                  <th className="px-4 py-2.5 font-medium">With IBM</th>
                  <th className="px-4 py-2.5 font-medium">Impact</th>
                </tr>
              </thead>
              <tbody>
                {m.businessCase.map((b, i) => (
                  <tr key={i} className="border-b border-gray-10 last:border-0 align-top">
                    <td className="px-4 py-3 font-medium text-gray-100">{b.metric}</td>
                    <td className="px-4 py-3 text-gray-70">{b.currentState}</td>
                    <td className="px-4 py-3 text-gray-70">{b.withIbm}</td>
                    <td className="px-4 py-3 text-ibm-green font-medium">{b.impact}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {m?.competitorTactics && m.competitorTactics.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-mono uppercase tracking-widest text-gray-60 mb-3">Competitive takeout</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {m.competitorTactics.map((c, i) => (
              <Card key={i} className="p-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-100">{c.competitor}</h4>
                  <Pill tone="neutral">{c.likelyInstalled}</Pill>
                </div>
                <p className="mt-2 text-sm text-gray-80"><span className="font-medium">Pain:</span> {c.painPoint}</p>
                <p className="mt-2 text-sm bg-[#fcf4d6] border border-[#f8e6a0] p-2 text-gray-80">
                  <span className="font-medium">Trap question:</span> “{c.trapQuestion}”
                </p>
                <p className="mt-2 text-sm text-gray-80"><span className="font-medium text-ibm-blue">IBM counter:</span> {c.ibmCounter}</p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {m?.wedgeQuestions && m.wedgeQuestions.length > 0 && (
        <div>
          <h3 className="text-sm font-mono uppercase tracking-widest text-gray-60 mb-3">Strategic wedge questions</h3>
          <Card className="p-5">
            <ul className="space-y-2">
              {m.wedgeQuestions.map((q, i) => (
                <li key={i} className="flex gap-3 text-sm text-gray-80">
                  <span className="font-mono text-ibm-blue">{String(i + 1).padStart(2, '0')}</span>
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
}

/* ----------------------------- Meeting prep ----------------------------- */

export function MeetingSection({ account }: { account: AccountIntelligenceReport }) {
  const m = account.meetingPreparation;
  return (
    <div className="fade-up">
      <SectionHeader eyebrow="06 · Meeting preparation" title="Walk in ready" summary={m?.summary} />

      <h3 className="text-sm font-mono uppercase tracking-widest text-gray-60 mb-3">Discovery questions</h3>
      <div className="space-y-3 mb-6">
        {(m?.discoveryQuestions || []).map((q) => (
          <Card key={q.number} className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 shrink-0 bg-ibm-blue text-white flex items-center justify-center font-mono text-sm">
                {q.number}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-100">{q.question}</p>
                <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 mt-3 text-sm">
                  <div>
                    <span className="text-[11px] font-mono uppercase text-gray-50">Intent</span>
                    <p className="text-gray-70">{q.intent}</p>
                  </div>
                  <div>
                    <span className="text-[11px] font-mono uppercase text-gray-50">Target role</span>
                    <p className="text-gray-70">{q.targetRole}</p>
                  </div>
                  {q.listenFor?.length > 0 && (
                    <div>
                      <span className="text-[11px] font-mono uppercase text-gray-50">Listen for</span>
                      <p className="text-gray-70">{q.listenFor.join('; ')}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-[11px] font-mono uppercase text-gray-50">Pivot</span>
                    <p className="text-gray-70">{q.pivot}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {m?.solutionArchitectures && m.solutionArchitectures.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-mono uppercase tracking-widest text-gray-60 mb-3">Candidate solution architectures</h3>
          <div className="grid lg:grid-cols-3 gap-3">
            {m.solutionArchitectures.map((a) => (
              <Card key={a.id} className="p-4">
                <h4 className="font-semibold text-gray-100">{a.title}</h4>
                <p className="text-sm text-gray-70 mt-1">{a.scenario}</p>
                <div className="mt-3 space-y-1.5">
                  {a.tiers.map((t, i) => (
                    <div key={i} className="border border-gray-20 bg-gray-10 px-3 py-2">
                      <div className="text-[11px] font-mono uppercase text-ibm-blue">{t.name}</div>
                      <div className="text-sm text-gray-80">{t.items.join(' · ')}</div>
                    </div>
                  ))}
                </div>
                {a.benefits?.length > 0 && (
                  <ul className="mt-3 space-y-1">
                    {a.benefits.map((b, i) => (
                      <li key={i} className="flex gap-2 text-sm text-gray-70">
                        <Check className="w-4 h-4 text-ibm-green shrink-0 mt-0.5" /> {b}
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {m?.caseStudies && m.caseStudies.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-mono uppercase tracking-widest text-gray-60 mb-3">Proof points</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {m.caseStudies.map((c, i) => (
              <Card key={i} className="p-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-100">{c.customerDescriptor}</h4>
                  <Pill tone={c.verified ? 'green' : 'amber'}>{c.verified ? 'Verified reference' : 'Illustrative'}</Pill>
                </div>
                <div className="text-xs text-gray-50">{c.industry}</div>
                <p className="mt-2 text-sm text-gray-80"><span className="font-medium">Challenge:</span> {c.challenge}</p>
                <p className="mt-1 text-sm text-gray-80"><span className="font-medium">Solution:</span> {c.solution}</p>
                {c.results?.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {c.results.map((r, j) => (
                      <li key={j} className="text-sm text-ibm-green">• {r}</li>
                    ))}
                  </ul>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {m?.objectionsAndCounters && m.objectionsAndCounters.length > 0 && (
        <div>
          <h3 className="text-sm font-mono uppercase tracking-widest text-gray-60 mb-3">Objection handling</h3>
          <div className="space-y-3">
            {m.objectionsAndCounters.map((o, i) => (
              <Card key={i} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium text-gray-100">“{o.objection}”</p>
                  <Pill tone="neutral">{o.fromRole}</Pill>
                </div>
                <p className="mt-2 text-sm text-gray-60"><span className="font-medium">Why they say it:</span> {o.whyTheySayIt}</p>
                <p className="mt-2 text-sm text-gray-80"><span className="font-medium text-ibm-blue">Response:</span> {o.response}</p>
                <p className="mt-1 text-sm text-gray-70"><span className="font-medium">Proof:</span> {o.proofPoint}</p>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------------------- Stakeholders ------------------------------ */

export function StakeholdersSection({ account }: { account: AccountIntelligenceReport }) {
  const [copied, setCopied] = useState<number | null>(null);
  // Primary target first, then by priority
  const order = { High: 0, Medium: 1, Low: 2 } as Record<string, number>;
  const people = [...(account.stakeholderMap || [])].sort((a, b) => {
    if (a.isPrimaryTarget !== b.isPrimaryTarget) return a.isPrimaryTarget ? -1 : 1;
    return (order[a.priority] ?? 3) - (order[b.priority] ?? 3);
  });
  const copy = (text: string, i: number) => {
    navigator.clipboard?.writeText(text);
    setCopied(i);
    setTimeout(() => setCopied(null), 1500);
  };
  return (
    <div className="fade-up">
      <SectionHeader
        eyebrow="07 · Stakeholder map"
        title="Who to actually contact"
        summary="The specific people who drive a storage decision at this account — named where reliably known, with the recommended first contact and how to reach them."
      />

      {account.engagementStrategy && (
        <Card className="p-5 mb-4 border-l-2 border-l-ibm-blue">
          <h3 className="text-sm font-mono uppercase tracking-widest text-ibm-blue mb-2">Engagement strategy</h3>
          <p className="text-gray-80 leading-relaxed">{account.engagementStrategy}</p>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-3">
        {people.map((p, i) => (
          <Card key={i} className={`p-4 ${p.isPrimaryTarget ? 'border-ibm-blue ring-1 ring-ibm-blue' : ''}`}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-semibold text-gray-100">{p.isNamedIndividual && p.personName ? p.personName : p.role}</h4>
                  {p.isPrimaryTarget && <Pill tone="blue">Start here</Pill>}
                </div>
                <div className="text-xs text-gray-50">
                  {p.isNamedIndividual && p.personName ? `${p.role} · ${p.typicalTitle}` : p.typicalTitle}
                </div>
              </div>
              <Pill tone={p.isNamedIndividual ? 'green' : 'neutral'}>{p.isNamedIndividual ? 'Named' : 'Role'}</Pill>
            </div>

            <div className="mt-2 flex items-center gap-2 text-xs">
              <Pill tone={p.priority === 'High' ? 'red' : p.priority === 'Medium' ? 'amber' : 'neutral'}>{p.priority} priority</Pill>
              {p.source && <SourceTag source={p.source} />}
            </div>

            <p className="mt-2 text-sm text-gray-80"><span className="font-medium">Why them:</span> {p.whyThisPerson}</p>
            <p className="mt-1 text-sm text-gray-80"><span className="font-medium">Cares about:</span> {p.risk}</p>
            <p className="mt-1 text-sm text-gray-80"><span className="font-medium text-ibm-blue">IBM hook:</span> {p.valueHook}</p>
            {p.howToReach && (
              <p className="mt-1 text-xs text-gray-60"><span className="font-medium">How to reach:</span> {p.howToReach}</p>
            )}

            <div className="mt-3 bg-gray-10 border border-gray-20 p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-mono uppercase text-gray-50">Email opener</span>
                <button onClick={() => copy(p.emailOpener, i)} className="text-xs text-ibm-blue hover:underline inline-flex items-center gap-1">
                  {copied === i ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied === i ? 'Copied' : 'Copy'}
                </button>
              </div>
              <p className="text-sm text-gray-70 italic">{p.emailOpener}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------- Briefing ------------------------------- */

export function BriefingSection({ account }: { account: AccountIntelligenceReport }) {
  const [copied, setCopied] = useState(false);
  const doc = account.executiveBriefingDoc || '';
  const copy = () => {
    navigator.clipboard?.writeText(doc);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  const download = () => {
    const blob = new Blob([doc], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${account.id}-briefing.md`;
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="fade-up">
      <div className="flex items-start justify-between gap-4 mb-6">
        <SectionHeader eyebrow="08 · Executive briefing" title="The one-pager" />
        <div className="flex gap-2 shrink-0">
          <button onClick={copy} className="inline-flex items-center gap-1.5 text-sm border border-gray-20 px-3 py-1.5 hover:border-ibm-blue text-gray-80">
            {copied ? <Check className="w-4 h-4 text-ibm-green" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button onClick={download} className="inline-flex items-center gap-1.5 text-sm bg-ibm-blue text-white px-3 py-1.5 hover:bg-ibm-blueHover">
            <Download className="w-4 h-4" /> Download
          </button>
        </div>
      </div>
      <Card className="p-6 lg:p-8">
        {doc ? <Markdown>{doc}</Markdown> : <EmptyNote>No briefing generated.</EmptyNote>}
      </Card>
      <p className="mt-3 text-xs text-gray-50">{account.provenanceNote}</p>
    </div>
  );
}

export const SECTION_ICONS = {
  overview: Building2,
  strategy: Building2,
  tech: Server,
  challenges: AlertTriangle,
  signals: Radar,
  ibm: Target,
  meeting: ClipboardList,
  stakeholders: Users,
  briefing: FileText,
};
