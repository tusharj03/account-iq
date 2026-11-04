import React from 'react';

/**
 * IBM 8-bar logo: the word "IBM" rendered in IBM blue and cut by horizontal white
 * stripes (the classic Paul Rand treatment). Using real letterforms behind a stripe
 * mask keeps it both legible and on-brand.
 * IBM® is a trademark of International Business Machines Corp.
 */
export function IbmLogo({ height = 22, color = '#0f62fe' }: { height?: number; color?: string }) {
  const vbW = 92;
  const vbH = 36;
  const maskId = React.useId();
  // 8 stripes across the glyph height
  const stripeCount = 8;
  const band = vbH / stripeCount; // full band (stripe + gap)
  const stripeH = band * 0.62;
  const stripes = Array.from({ length: stripeCount }, (_, i) => (
    <rect key={i} x={0} y={i * band} width={vbW} height={stripeH} fill="white" />
  ));

  return (
    <svg height={height} viewBox={`0 0 ${vbW} ${vbH}`} role="img" aria-label="IBM" style={{ display: 'block' }}>
      <defs>
        <mask id={maskId}>
          <rect x={0} y={0} width={vbW} height={vbH} fill="black" />
          {stripes}
        </mask>
      </defs>
      <text
        x={vbW / 2}
        y={vbH * 0.82}
        textAnchor="middle"
        fontFamily="'IBM Plex Sans', system-ui, sans-serif"
        fontWeight={700}
        fontSize={34}
        letterSpacing={-1}
        fill={color}
        mask={`url(#${maskId})`}
      >
        IBM
      </text>
    </svg>
  );
}
