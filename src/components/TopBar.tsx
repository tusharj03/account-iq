import React from 'react';
import { Search, Plus, MessageSquareText } from 'lucide-react';
import { AccountIqLogo } from './Logo';
import { AccountIntelligenceReport, ResearchMode } from '../types';

export function TopBar({
  account,
  mode,
  onNewSearch,
  onOpenCopilot,
}: {
  account: AccountIntelligenceReport | null;
  mode: ResearchMode;
  onNewSearch: () => void;
  onOpenCopilot: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-20">
      <div className="h-14 px-5 flex items-center gap-4 max-w-content mx-auto">
        <div className="flex items-center gap-3">
          <AccountIqLogo height={24} />
          <div className="h-5 w-px bg-gray-20" />
          <div>
            <div className="text-[15px] font-semibold text-gray-100 leading-tight">AccountIQ</div>
            <div className="text-[11px] text-gray-50 leading-tight mt-0.5">Enterprise Storage Copilot</div>
          </div>
        </div>

        <div className="flex-1" />

        <span
          className={`hidden sm:inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 border ${
            mode === 'web-verified'
              ? 'bg-[#defbe6] text-[#0e6027] border-[#a7f0ba]'
              : 'bg-[#edf5ff] text-ibm-blue border-[#d0e2ff]'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {mode === 'web-verified' ? 'Web-verified mode' : 'AI analysis mode'}
        </span>

        {account && (
          <button
            onClick={onOpenCopilot}
            className="inline-flex items-center gap-1.5 text-sm text-gray-80 hover:text-ibm-blue px-2.5 py-1.5 border border-gray-20 hover:border-ibm-blue transition-colors"
          >
            <MessageSquareText className="w-4 h-4" />
            <span className="hidden md:inline">Ask copilot</span>
          </button>
        )}

        <button
          onClick={onNewSearch}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-ibm-blue hover:bg-ibm-blueHover px-3.5 py-1.5 transition-colors"
        >
          {account ? <Plus className="w-4 h-4" /> : <Search className="w-4 h-4" />}
          New account
        </button>
      </div>
    </header>
  );
}
