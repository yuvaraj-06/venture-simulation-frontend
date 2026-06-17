'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import IntelligenceDashboard from '@/components/IntelligenceDashboard';
import Link from 'next/link';
import { Brand, Glyph } from '@/components/Brand';

export default function SimulationPage() {
  const params = useParams();
  const ventureId = (params?.ventureId as string) || '';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [simError, setSimError] = useState(false);

  useEffect(() => {
    if (!ventureId) return;

    fetch(`/api/simulation/${ventureId}`)
      .then(r => {
        if (!r.ok) {
          setSimError(true);
          setLoading(false);
          return null;
        }
        return r.json();
      })
      .then(d => {
        if (d) {
          setData(d);
          setLoading(false);
        }
      })
      .catch(() => {
        setSimError(true);
        setLoading(false);
      });
  }, [ventureId]);

  if (loading) {
    return (
      <div style={{ background: '#F1F4F5', color: '#000000', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#0A7D3C', fontSize: 13, letterSpacing: '0.15em', fontWeight: 600 }}>LOADING</div>
          <div style={{ color: '#5E6366', fontSize: 12, marginTop: 8 }}>{ventureId}</div>
        </div>
      </div>
    );
  }

  // Full simulation dashboard if data exists
  if (data) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const SimDash = require('@/components/SimulationDashboard').default;
    return <SimDash simulation={data} ventureId={ventureId} />;
  }

  // Intelligence-only view
  return (
    <div style={{ background: '#F1F4F5', minHeight: '100vh', color: '#000000' }}>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #E8E6E4',
        display: 'flex', alignItems: 'center', height: 60, padding: '0 24px', gap: 12,
      }}>
        <Brand href="/" />
        <span style={{ color: '#C8CBCC' }}>/</span>
        <span style={{ color: '#000000', fontSize: 13, fontWeight: 600 }}>{ventureId}</span>
        <span style={{ color: '#C8CBCC', margin: '0 4px' }}>·</span>
        <span style={{
          background: 'rgba(0, 214, 93, 0.10)', color: '#0A7D3C',
          border: '1px solid rgba(0, 214, 93, 0.25)',
          padding: '3px 10px', borderRadius: 4, fontSize: 11, fontWeight: 700, letterSpacing: '0.05em'
        }}>INTELLIGENCE</span>
      </nav>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 48px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 40, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 8, textTransform: 'lowercase', lineHeight: 1.05 }}>
            agents &amp; analytics
            <span style={{ color: '#939799', fontSize: 16, fontWeight: 400, marginLeft: 16, textTransform: 'none' }}>
              {ventureId}
            </span>
          </h1>
          <p style={{ color: '#5E6366', fontSize: 14, maxWidth: 640, lineHeight: 1.6 }}>
            Live intelligence: brand DNA, SEO, competitive landscape, social analytics, investor pipeline, and activity feed.
          </p>
          {simError && (
            <div style={{ marginTop: 14, background: 'rgba(138, 109, 59, 0.08)', border: '1px solid rgba(138, 109, 59, 0.2)', borderRadius: 8, padding: '10px 16px', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#8A6D3B' }}><Glyph name="warn" /></span>
              <span style={{ color: '#8A6D3B', fontSize: 12 }}>No simulation data yet. Showing available intelligence only.</span>
            </div>
          )}
        </div>
        <IntelligenceDashboard ventureId={ventureId} />

        <div style={{ marginTop: 80, paddingTop: 32, borderTop: '1px solid #E8E6E4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ color: '#5E6366', fontSize: 13 }}>
            {ventureId} · Intelligence · ShareOS
          </div>
          <Link href="/" style={{ color: '#0A7D3C', fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>← All Simulations</Link>
        </div>
      </main>
    </div>
  );
}
