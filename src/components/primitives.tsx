import React from 'react';
import { ShieldCheck, Sparkles, ExternalLink } from 'lucide-react';
import { ConfidenceLevel, Finding, Source } from '../types';

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white border border-gray-20 ${className}`}>{children}</div>;
}

export function SectionHeader({ eyebrow, title, summary }: { eyebrow: string; title: string; summary?: string }) {
  return (
    <div className="mb-6">
      <div className="text-xs font-mono uppercase tracking-widest text-ibm-blue mb-1.5">{eyebrow}</div>
      <h2 className="text-2xl font-semibold text-gray-100 leading-tight">{title}</h2>
      {summary && <p className="mt-2 text-gray-70 max-w-3xl leading-relaxed">{summary}</p>}
    </div>
  );
}

const CONF_STYLES: Record<ConfidenceLevel, string> = {
  High: 'bg-[#defbe6] text-[#0e6027] border-[#a7f0ba]',
  Medium: 'bg-[#fcf4d6] text-[#684e00] border-[#f8e6a0]',
  Low: 'bg-gray-10 text-gray-70 border-gray-20',
};

export function ConfidenceBadge({ level }: { level: ConfidenceLevel }) {
  return (
    <span className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 border ${CONF_STYLES[level] || CONF_STYLES.Low}`}>
      {level} confidence
    </span>
  );
}

/** Only show a date if it's complete and plausible (hide "2026-??-??", "n/a", etc.). */
export function cleanDate(date?: string): string | null {
  if (!date) return null;
  const d = date.trim();
  if (!d || d.includes('?') || /n\/?a|unknown|null|undefined/i.test(d)) return null;
  // require at least a 4-digit year somewhere
  if (!/\d{4}/.test(d)) return null;
  return d;
}

export function SourceTag({ source }: { source: Source }) {
  if (source.verified && source.url) {
    const date = cleanDate(source.date);
    return (
      <a
        href={source.url}
        target="_blank"
        rel="noreferrer noopener"
        className="inline-flex items-center gap-1 text-[11px] font-medium text-ibm-green hover:underline"
      >
        <ShieldCheck className="w-3.5 h-3.5" />
        {source.label}
        {date ? ` · ${date}` : ''}
        <ExternalLink className="w-3 h-3" />
      </a>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#8a6a00]">
      <Sparkles className="w-3.5 h-3.5" />
      AI analysis · not web-verified
    </span>
  );
}

export function FindingCard({ finding }: { finding: Finding }) {
  return (
    <div className="border border-gray-20 bg-white p-4 hover:border-gray-30 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <h4 className="font-semibold text-gray-100 leading-snug">{finding.title}</h4>
        <ConfidenceBadge level={finding.confidence} />
      </div>
      <p className="mt-2 text-sm text-gray-80 leading-relaxed">{finding.detail}</p>
      {finding.whyItMatters && (
        <div className="mt-3 border-l-2 border-ibm-blue pl-3">
          <span className="text-[11px] font-mono uppercase tracking-wide text-ibm-blue">Why it matters</span>
          <p className="text-sm text-gray-70 mt-0.5 leading-relaxed">{finding.whyItMatters}</p>
        </div>
      )}
      <div className="mt-3 pt-2 border-t border-gray-10">
        <SourceTag source={finding.source} />
      </div>
    </div>
  );
}

export function FindingGrid({ title, findings }: { title: string; findings?: Finding[] }) {
  if (!findings || findings.length === 0) return null;
  return (
    <div className="mb-6">
      <h3 className="text-sm font-mono uppercase tracking-widest text-gray-60 mb-3">{title}</h3>
      <div className="grid md:grid-cols-2 gap-3">
        {findings.map((f) => (
          <FindingCard key={f.id} finding={f} />
        ))}
      </div>
    </div>
  );
}

export function ScoreRing({ score, size = 72 }: { score: number; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  const color = score >= 75 ? '#24a148' : score >= 50 ? '#0f62fe' : '#f1c21b';
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e0e0e0" strokeWidth="6" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="butt"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-semibold text-gray-100 leading-none">{score}</span>
        <span className="text-[9px] text-gray-50 uppercase tracking-wide">/ 100</span>
      </div>
    </div>
  );
}

export function Pill({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'blue' | 'green' | 'amber' | 'red' | 'neutral' }) {
  const tones: Record<string, string> = {
    blue: 'bg-[#edf5ff] text-ibm-blue border-[#d0e2ff]',
    green: 'bg-[#defbe6] text-[#0e6027] border-[#a7f0ba]',
    amber: 'bg-[#fcf4d6] text-[#684e00] border-[#f8e6a0]',
    red: 'bg-[#fff1f1] text-ibm-red border-[#ffd7d9]',
    neutral: 'bg-gray-10 text-gray-70 border-gray-20',
  };
  return <span className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 border ${tones[tone]}`}>{children}</span>;
}

export function EmptyNote({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-gray-50 italic">{children}</p>;
}
