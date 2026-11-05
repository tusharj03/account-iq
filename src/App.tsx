import React, { useState, useEffect, useCallback } from 'react';
import { TopBar } from './components/TopBar';
import { SearchPanel } from './components/SearchPanel';
import { ResearchProgress } from './components/ResearchProgress';
import { Report } from './components/Report';
import { CopilotDrawer } from './components/CopilotDrawer';
import { AccountIntelligenceReport, AgentStepProgress, AccountSummary, ResearchMode } from './types';
import { fetchAccounts, fetchAccount, streamResearch, fetchResearchMode } from './lib/api';

type View = 'search' | 'researching' | 'report';

export default function App() {
  const [view, setView] = useState<View>('search');
  const [mode, setMode] = useState<ResearchMode>('ai-analysis');
  const [account, setAccount] = useState<AccountIntelligenceReport | null>(null);
  const [recents, setRecents] = useState<AccountSummary[]>([]);
  const [researchingName, setResearchingName] = useState('');
  const [steps, setSteps] = useState<AgentStepProgress[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copilotOpen, setCopilotOpen] = useState(false);

  const refreshRecents = useCallback(async () => {
    setRecents(await fetchAccounts());
  }, []);

  useEffect(() => {
    fetchResearchMode().then(setMode);
    refreshRecents();
  }, [refreshRecents]);

  const openAccount = async (id: string) => {
    try {
      const data = await fetchAccount(id);
      setAccount(data);
      setView('report');
    } catch {
      setError('Could not open that account.');
    }
  };

  const research = async (name: string) => {
    setResearchingName(name);
    setSteps([]);
    setError(null);
    setView('researching');
    await streamResearch(name, {
      onProgress: (p) => setSteps((prev) => [...prev, p]),
      onComplete: (report) => {
        setAccount(report);
        setView('report');
        refreshRecents();
      },
      onError: (msg) => setError(msg),
    });
  };

  return (
    <div className="min-h-screen bg-gray-10">
      <TopBar
        account={view === 'report' ? account : null}
        mode={mode}
        onNewSearch={() => setView('search')}
        onOpenCopilot={() => setCopilotOpen(true)}
      />

      {view === 'search' && (
        <SearchPanel
          mode={mode}
          recents={recents}
          onSearch={research}
          onOpenAccount={openAccount}
          onCancel={() => setView('report')}
          canCancel={!!account}
        />
      )}

      {view === 'researching' && <ResearchProgress companyName={researchingName} steps={steps} error={error} />}

      {view === 'report' && account && <Report account={account} />}

      <CopilotDrawer open={copilotOpen} account={account} onClose={() => setCopilotOpen(false)} />

      <footer className="max-w-content mx-auto px-5 py-8 text-xs text-gray-50 border-t border-gray-20 mt-8 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="font-medium text-gray-70">
            AccountIQ · Autonomous Enterprise Storage Intelligence Copilot
          </div>
          <div className="text-gray-50">
            Findings are {mode === 'web-verified' ? 'web-sourced where linked, otherwise AI analysis' : 'AI analysis — verify time-sensitive facts before customer meetings'}.
          </div>
        </div>
        <p className="text-[11px] text-gray-40 leading-relaxed">
          Disclaimer: AccountIQ is an independent analytical tool for solutions engineers. It is not affiliated with, sponsored by, or endorsed by International Business Machines Corporation (IBM) or any other vendor. IBM, FlashSystem, DS8000, and other IBM product names are trademarks of IBM Corp. Dell, Pure Storage, NetApp, and HPE are trademarks of their respective owners, referenced strictly under nominative fair use for descriptive and comparative purposes.
        </p>
      </footer>
    </div>
  );
}
