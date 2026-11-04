import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/** Renders markdown cleanly so raw ** and # never leak into the UI. */
export function Markdown({ children, compact = false }: { children: string; compact?: boolean }) {
  return (
    <div className={`md ${compact ? 'md-compact' : ''}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ a: LinkNewTab }}>
        {children || ''}
      </ReactMarkdown>
    </div>
  );
}

function LinkNewTab(props: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a {...props} target="_blank" rel="noreferrer noopener" />;
}
