// @ts-nocheck
'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Glyph } from './Brand';

interface LockedSectionProps {
  isLocked: boolean;
  checkoutUrl: string | null;
  children: React.ReactNode;
  /** Height of the visible teaser area in px before the blur kicks in. Default 180 */
  teaserHeight?: number;
  /** Optional label for the unlock button */
  label?: string;
  /** ventureId for on-demand checkout creation */
  ventureId?: string;
  /** Pipeline is still processing — show Coming Soon instead of Unlock */
  pipelineRunning?: boolean;
}

/**
 * Wraps a section with a glassmorphism paywall overlay.
 * Shows `teaserHeight` px of content clearly, then fades into blur + lock button.
 * If no checkoutUrl exists, clicking Unlock creates one on-demand via POST.
 */
export default function LockedSection({
  isLocked,
  checkoutUrl,
  children,
  teaserHeight = 180,
  label = 'Unlock Full Analysis',
  ventureId,
  pipelineRunning = false,
}: LockedSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(400);
  const [creating, setCreating] = useState(false);
  const [localCheckoutUrl, setLocalCheckoutUrl] = useState<string | null>(checkoutUrl);

  useEffect(() => {
    setLocalCheckoutUrl(checkoutUrl);
  }, [checkoutUrl]);

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

  async function handleUnlock() {
    // If we have a URL, just open it
    if (localCheckoutUrl) {
      window.open(localCheckoutUrl, '_blank');
      return;
    }

    // No URL — create one on-demand
    if (!ventureId || creating) return;
    setCreating(true);

    try {
      const res = await fetch(`/api/venture-status/${ventureId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();

      if (data.checkout_url) {
        setLocalCheckoutUrl(data.checkout_url);
        window.open(data.checkout_url, '_blank');
      } else if (data.features_unlocked) {
        // Already unlocked — reload
        window.location.reload();
      }
    } catch (err) {
      console.error('Failed to create checkout:', err);
    } finally {
      setCreating(false);
    }
  }

  const hasUrl = !!localCheckoutUrl;
  const buttonReady = !pipelineRunning && (hasUrl || !!ventureId);

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
          background: 'linear-gradient(to bottom, transparent 0%, rgba(247,248,249,0.6) 20%, rgba(247,248,249,0.94) 55%)',
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
            background: pipelineRunning ? 'rgba(138, 109, 59,0.08)' : 'rgba(10, 125, 60,0.08)',
            border: `1px solid ${pipelineRunning ? 'rgba(138, 109, 59,0.2)' : 'rgba(10, 125, 60,0.2)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
          }}
        >
          <span style={{ color: pipelineRunning ? '#8A6D3B' : '#0A7D3C' }}><Glyph name={pipelineRunning ? 'hourglass' : 'lock'} size={20} /></span>
        </div>

        {/* Unlock button or Coming Soon */}
        {pipelineRunning ? (
          <div style={{
            background: 'rgba(138, 109, 59,0.08)',
            color: '#8A6D3B',
            border: '1px solid rgba(138, 109, 59,0.2)',
            borderRadius: 8,
            padding: '12px 28px',
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: '0.02em',
          }}>
            <Glyph name="hourglass" /> Coming Soon
          </div>
        ) : (
          <button
            onClick={handleUnlock}
            disabled={!buttonReady || creating}
            style={{
              background: buttonReady
                ? '#00D65D'
                : 'rgba(0,0,0,0.04)',
              color: buttonReady ? '#000000' : '#C8CBCC',
              border: 'none',
              borderRadius: 8,
              padding: '12px 28px',
              fontSize: 14,
              fontWeight: 700,
              cursor: buttonReady && !creating ? 'pointer' : 'not-allowed',
              letterSpacing: '0.02em',
              transition: 'all 0.2s',
              boxShadow: buttonReady ? '0 4px 20px rgba(10, 125, 60,0.2)' : 'none',
              opacity: creating ? 0.7 : 1,
            }}
            onMouseOver={(e) => {
              if (buttonReady && !creating) {
                (e.target as HTMLButtonElement).style.transform = 'scale(1.03)';
                (e.target as HTMLButtonElement).style.boxShadow = '0 6px 30px rgba(10, 125, 60,0.35)';
              }
            }}
            onMouseOut={(e) => {
              (e.target as HTMLButtonElement).style.transform = 'scale(1)';
              (e.target as HTMLButtonElement).style.boxShadow = buttonReady ? '0 4px 20px rgba(10, 125, 60,0.2)' : 'none';
            }}
          >
            {creating ? <><Glyph name="hourglass" /> Creating checkout...</> : <><Glyph name="lock" /> {label}</>}
          </button>
        )}

        <div style={{ color: '#939799', fontSize: 11, marginTop: 4 }}>
          {pipelineRunning
            ? 'Your venture is being analyzed. Unlock will be available shortly.'
            : 'One-time payment to unlock all premium features'}
        </div>
      </div>
    </div>
  );
}
