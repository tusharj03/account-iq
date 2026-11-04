import React, { useState } from 'react';
import { Building2, Server, AlertTriangle, Radar, Target, ClipboardList, Users, FileText, LayoutDashboard } from 'lucide-react';
import { AccountIntelligenceReport } from '../types';
import {
  OverviewSection,
  StrategySection,
  TechSection,
  ChallengesSection,
  SignalsSection,
  IbmSection,
  MeetingSection,
  StakeholdersSection,
  BriefingSection,
} from './ReportSections';

type SectionKey =
  | 'overview'
  | 'strategy'
  | 'tech'
  | 'challenges'
  | 'signals'
  | 'ibm'
  | 'meeting'
  | 'stakeholders'
  | 'briefing';

const NAV: { key: SectionKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'strategy', label: 'Company strategy', icon: Building2 },
  { key: 'tech', label: 'Technology landscape', icon: Server },
  { key: 'challenges', label: 'Business challenges', icon: AlertTriangle },
  { key: 'signals', label: 'Buying signals', icon: Radar },
  { key: 'ibm', label: 'IBM opportunity', icon: Target },
  { key: 'meeting', label: 'Meeting prep', icon: ClipboardList },
  { key: 'stakeholders', label: 'Stakeholders', icon: Users },
  { key: 'briefing', label: 'Executive briefing', icon: FileText },
];

export function Report({ account }: { account: AccountIntelligenceReport }) {
  const [active, setActive] = useState<SectionKey>('overview');

  const render = () => {
    switch (active) {
      case 'overview':
        return <OverviewSection account={account} />;
      case 'strategy':
        return <StrategySection account={account} />;
      case 'tech':
        return <TechSection account={account} />;
      case 'challenges':
        return <ChallengesSection account={account} />;
      case 'signals':
        return <SignalsSection account={account} />;
      case 'ibm':
        return <IbmSection account={account} />;
      case 'meeting':
        return <MeetingSection account={account} />;
      case 'stakeholders':
        return <StakeholdersSection account={account} />;
      case 'briefing':
        return <BriefingSection account={account} />;
    }
  };

  return (
    <div className="max-w-content mx-auto px-5 flex gap-6 py-6">
      <aside className="w-56 shrink-0 hidden lg:block">
        <div className="sticky top-20">
          <nav className="space-y-0.5">
            {NAV.map((n) => {
              const Icon = n.icon;
              const isActive = active === n.key;
              return (
                <button
                  key={n.key}
                  onClick={() => setActive(n.key)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left border-l-2 transition-colors ${
                    isActive
                      ? 'border-ibm-blue bg-white text-ibm-blue font-medium'
                      : 'border-transparent text-gray-70 hover:bg-white hover:text-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {n.label}
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Mobile section selector */}
      <div className="lg:hidden w-full">
        <select
          value={active}
          onChange={(e) => setActive(e.target.value as SectionKey)}
          className="w-full mb-4 border border-gray-20 bg-white px-3 py-2 text-sm"
        >
          {NAV.map((n) => (
            <option key={n.key} value={n.key}>
              {n.label}
            </option>
          ))}
        </select>
        <div className="min-w-0">{render()}</div>
      </div>

      <main className="flex-1 min-w-0 hidden lg:block">{render()}</main>
    </div>
  );
}
