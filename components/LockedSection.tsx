// @ts-nocheck
'use client';

import React, { useRef, useEffect, useState } from 'react';

interface LockedSectionProps {
  isLocked: boolean;
  checkoutUrl: string | null;
  children: React.ReactNode;
  /** Height of the visible teaser area in px before the blur kicks in. Default 180 */
  teaserHeight?: number;
  /** Optional label for the unlock button */
  label?: string;
}

/**
 * Wraps a section with a glassmorphism paywall overlay.
 * Shows `teaserHeight` px of content clearly, then fades into blur + lock button.
 */
export default function LockedSection({
  isLocked,
  checkoutUrl,
  children,
  teaserHeight = 180,
  label = 'Unlock Full Analysis',
}: LockedSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(400);

  useEffect(() => {
    if (containerRef.current) {
      setContentHeight(containerRef.current.scrollHeight);
    }
  }, [children]);

  if (!isLocked) {
    return <>{children}</>;
  }

  const visibleHeight = Math.min(teaserHeight, contentHeight);
  const clampedHeight = Math.max(visibleHeight + 120, 280);

  return (
    <div style={{ position: 'relative', overflow: 'hidden', height: clampedHeight, borderRadius: 12 }}>
      {/* Content (rendered but clipped) */}
      <div
        ref={containerRef}
        style={{
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        {children}
      </div>

      {/* Gradient fade from clear to blurred */}
      <div
        style={{
          position: 'absolute',
          top: visibleHeight - 20,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 20%, rgba(0,0,0,0.85) 60%)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.04)',
          borderRadius: '0 0 12px 12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          paddingTop: 40,
        }}
      >
        {/* Lock icon */}
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: 'rgba(0,212,255,0.08)',
            border: '1px solid rgba(0,212,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
          }}
        >
          🔒
        </div>

        {/* Unlock button */}
        <button
          onClick={() => {
            if (checkoutUrl) {
              window.open(checkoutUrl, '_blank');
            }
          }}
          disabled={!checkoutUrl}
          style={{
            background: checkoutUrl
              ? 'linear-gradient(135deg, #00d4ff, #0066ff)'
              : 'rgba(255,255,255,0.05)',
            color: checkoutUrl ? '#fff' : '#555',
            border: 'none',
            borderRadius: 8,
            padding: '12px 28px',
            fontSize: 14,
            fontWeight: 700,
            cursor: checkoutUrl ? 'pointer' : 'not-allowed',
            letterSpacing: '0.02em',
            transition: 'all 0.2s',
            boxShadow: checkoutUrl ? '0 4px 20px rgba(0,212,255,0.2)' : 'none',
          }}
          onMouseOver={(e) => {
            if (checkoutUrl) {
              (e.target as HTMLButtonElement).style.transform = 'scale(1.03)';
              (e.target as HTMLButtonElement).style.boxShadow = '0 6px 30px rgba(0,212,255,0.35)';
            }
          }}
          onMouseOut={(e) => {
            (e.target as HTMLButtonElement).style.transform = 'scale(1)';
            (e.target as HTMLButtonElement).style.boxShadow = checkoutUrl ? '0 4px 20px rgba(0,212,255,0.2)' : 'none';
          }}
        >
          🔒 {checkoutUrl ? label : 'Coming Soon'}
        </button>

        <div style={{ color: '#444', fontSize: 11, marginTop: 4 }}>
          {checkoutUrl ? 'One-time payment to unlock all premium features' : 'Payment link generating...'}
        </div>
      </div>
    </div>
  );
}
