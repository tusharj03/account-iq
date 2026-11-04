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

      <footer className="max-w-content mx-auto px-5 py-8 text-xs text-gray-40 border-t border-gray-20 mt-8">
        AccountIQ · IBM Storage Account Intelligence · IBM® is a trademark of International Business Machines Corp.
        Findings are {mode === 'web-verified' ? 'web-sourced where linked, otherwise AI analysis' : 'AI analysis — verify time-sensitive facts before customer meetings'}.
      </footer>
    </div>
  );
}
