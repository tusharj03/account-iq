import React from 'react';
import { Check, Loader2, AlertTriangle } from 'lucide-react';
import { AgentStepProgress } from '../types';

const STEP_LABELS = [
  'Profile & strategy',
  'Technology & challenges',
  'Signals & IBM mapping',
  'Meeting preparation',
  'Executive briefing',
];

export function ResearchProgress({
  companyName,
  steps,
  error,
}: {
  companyName: string;
  steps: AgentStepProgress[];
  error?: string | null;
}) {
  const latest = steps[steps.length - 1];
  const currentStep = latest?.step ?? 1;

  return (
    <div className="max-w-2xl mx-auto px-5 py-16">
      <div className="text-xs font-mono uppercase tracking-widest text-ibm-blue mb-2">Researching</div>
      <h1 className="text-2xl font-semibold text-gray-100 mb-1">{companyName}</h1>
      <p className="text-gray-60 mb-8">The agent is running a multi-stage investigation. This takes ~30–90 seconds.</p>

      <div className="space-y-1">
        {STEP_LABELS.map((label, i) => {
          const stepNum = i + 1;
          const done = error ? false : stepNum < currentStep || latest?.agentName === 'Complete';
          const active = !error && stepNum === currentStep && latest?.agentName !== 'Complete';
          return (
            <div
              key={label}
              className={`flex items-center gap-3 p-3 border ${
                active ? 'border-ibm-blue bg-[#edf5ff]' : done ? 'border-gray-20 bg-white' : 'border-gray-20 bg-gray-10'
              }`}
            >
              <div
                className={`w-7 h-7 shrink-0 flex items-center justify-center ${
                  done ? 'bg-ibm-green text-white' : active ? 'bg-ibm-blue text-white' : 'bg-gray-20 text-gray-50'
                }`}
              >
                {done ? <Check className="w-4 h-4" /> : active ? <Loader2 className="w-4 h-4 animate-spin" /> : stepNum}
              </div>
              <div className="min-w-0">
                <div className={`text-sm font-medium ${active || done ? 'text-gray-100' : 'text-gray-50'}`}>{label}</div>
                {active && latest?.message && <div className="text-xs text-gray-60 mt-0.5 truncate">{latest.message}</div>}
              </div>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="mt-6 flex items-start gap-2 bg-[#fff1f1] border border-[#ffd7d9] text-ibm-red p-4">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold">Research failed</div>
            <div className="text-sm mt-0.5 text-gray-80">{error}</div>
          </div>
        </div>
      )}
    </div>
  );
}
