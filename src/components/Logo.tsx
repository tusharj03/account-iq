import React from 'react';

/**
 * AccountIQ Brand Logo
 * An original geometric intelligence lens icon combining multi-tier data layers
 * with analytical focus. Fully original SVG; no third-party trademarked assets.
 */
export function AccountIqLogo({ height = 24 }: { height?: number }) {
  const vbSize = 32;

  return (
    <svg
      height={height}
      viewBox={`0 0 ${vbSize} ${vbSize}`}
      role="img"
      aria-label="AccountIQ"
      style={{ display: 'block' }}
      className="shrink-0"
    >
      <defs>
        <linearGradient id="aiq-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0f62fe" />
          <stop offset="100%" stopColor="#0043ce" />
        </linearGradient>
      </defs>
      {/* Outer rounded container */}
      <rect x="1" y="1" width="30" height="30" rx="7" fill="url(#aiq-grad)" />
      {/* Multi-tier architectural layers */}
      <path
        d="M8 11.5L16 7.5L24 11.5L16 15.5L8 11.5Z"
        fill="white"
        fillOpacity="0.95"
      />
      <path
        d="M8 16.5L16 20.5L24 16.5"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        strokeOpacity="0.85"
      />
      <path
        d="M8 21.5L16 25.5L24 21.5"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        strokeOpacity="0.6"
      />
    </svg>
  );
}

// Backward-compatible alias so any other import doesn't break
export const IbmLogo = AccountIqLogo;
