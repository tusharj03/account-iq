import React, { useState } from 'react';
import { Search, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';
import { ResearchMode, AccountSummary } from '../types';
import { AccountIqLogo } from './Logo';

const EXAMPLES = ['JPMorgan Chase', 'UnitedHealth Group', 'Walmart', 'Delta Air Lines', 'Pfizer'];

export function SearchPanel({
  mode,
  recents,
  onSearch,
  onOpenAccount,
  onCancel,
  canCancel,
}: {
  mode: ResearchMode;
  recents: AccountSummary[];
  onSearch: (name: string) => void;
  onOpenAccount: (id: string) => void;
  onCancel: () => void;
  canCancel: boolean;
}) {
  const [value, setValue] = useState('');
  const submit = (v: string) => {
    const name = v.trim();
    if (name) onSearch(name);
  };

  return (
    <div className="max-w-content mx-auto px-5 py-10">
      {canCancel && (
        <button onClick={onCancel} className="text-sm text-gray-60 hover:text-ibm-blue mb-6">
          ← Back to current account
        </button>
      )}

      <div className="max-w-2xl">
        <div className="flex items-center gap-2.5 mb-5">
          <AccountIqLogo height={24} />
          <span className="text-xs font-mono uppercase tracking-widest text-gray-50">AccountIQ · Storage Intelligence</span>
        </div>
        <h1 className="text-3xl font-semibold text-gray-100 leading-tight">
          Research any enterprise account in minutes, not hours.
        </h1>
        <p className="mt-3 text-gray-70 leading-relaxed">
          Enter a company. The agent builds a storage-focused intelligence dossier — strategy, infrastructure
          footprint, buying signals, and a mapped IBM Storage opportunity with discovery questions for your meeting.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(value);
          }}
          className="mt-7 flex"
        >
          <div className="flex-1 flex items-center bg-white border border-gray-30 focus-within:border-ibm-blue">
            <Search className="w-5 h-5 text-gray-50 ml-4" />
            <input
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Company name, e.g. JPMorgan Chase"
              className="flex-1 px-3 py-3.5 bg-transparent outline-none text-gray-100 placeholder:text-gray-40"
            />
          </div>
          <button
            type="submit"
            disabled={!value.trim()}
            className="px-5 bg-ibm-blue hover:bg-ibm-blueHover disabled:bg-gray-30 text-white font-medium inline-flex items-center gap-2 transition-colors"
          >
            Research <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-50">Try:</span>
          {EXAMPLES.map((e) => (
            <button
              key={e}
              onClick={() => submit(e)}
              className="text-xs text-gray-70 border border-gray-20 px-2.5 py-1 hover:border-ibm-blue hover:text-ibm-blue transition-colors"
            >
              {e}
            </button>
          ))}
        </div>

        <div className="mt-6 flex items-start gap-2 text-sm bg-gray-10 border border-gray-20 p-3">
          {mode === 'web-verified' ? (
            <ShieldCheck className="w-4 h-4 text-ibm-green mt-0.5 shrink-0" />
          ) : (
            <Sparkles className="w-4 h-4 text-ibm-blue mt-0.5 shrink-0" />
          )}
          <p className="text-gray-70 leading-relaxed">
            {mode === 'web-verified' ? (
              <>
                <strong className="text-gray-100">Web-verified mode is on.</strong> Findings backed by a live source
                carry a clickable link; anything the model asserts from its own knowledge is clearly flagged.
              </>
            ) : (
              <>
                <strong className="text-gray-100">AI-analysis mode.</strong> This runs on the model's own knowledge —
                every finding is labeled with a confidence level and marked <em>not web-verified</em>. Nothing is
                fabricated with fake citations. Set a <code className="font-mono text-xs">SEARCH_API_KEY</code> to switch
                on live web sourcing.
              </>
            )}
          </p>
        </div>
      </div>

      {recents.length > 0 && (
        <div className="mt-12">
          <h2 className="text-sm font-mono uppercase tracking-widest text-gray-60 mb-3">Previously researched</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recents.map((r) => (
              <button
                key={r.id}
                onClick={() => onOpenAccount(r.id)}
                className="text-left bg-white border border-gray-20 p-4 hover:border-ibm-blue transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-100 group-hover:text-ibm-blue">{r.companyName}</span>
                  <span className="text-sm font-mono text-gray-50">{r.opportunityScore}</span>
                </div>
                <div className="text-xs text-gray-50 mt-1">{r.industry}</div>
                <div className="text-[11px] text-gray-40 mt-2">{r.opportunityStage}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
