'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import IntelligenceDashboard from '@/components/IntelligenceDashboard';
import Link from 'next/link';

export default function SimulationPage() {
  const params = useParams();
  const ventureId = (params?.ventureId as string) || '';
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [simError, setSimError] = useState(false);

  useEffect(() => {
    if (!ventureId) return;
    
    fetch(`/api/simulation/${ventureId}`)
      .then(r => {
        if (!r.ok) {
          // Simulation doesn't exist but venture might have intelligence data
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
      <div style={{background:'#000',color:'#fff',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#00d4ff', fontSize: 13, letterSpacing: '0.15em' }}>LOADING...</div>
          <div style={{ color: '#333', fontSize: 12, marginTop: 8 }}>{ventureId}</div>
        </div>
      </div>
    );
  }

  // If simulation data exists, show full dashboard
  if (data) {
    const SimDash = require('@/components/SimulationDashboard').default;
    return <SimDash simulation={data} />;
  }

  // If no simulation but venture may have intelligence data — show intelligence-only view
  return (
    <div style={{ background: '#000', minHeight: '100vh', color: '#fff' }}>
      {/* Top Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #1a1a1a',
        display: 'flex', alignItems: 'center', height: 56, padding: '0 24px',
      }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 26, height: 26, borderRadius: '50%',
            background: 'linear-gradient(135deg, #00d4ff, #0066ff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, color: '#fff'
          }}>S</div>
          <span style={{ color: '#888', fontSize: 13, fontWeight: 600 }}>ShareOS</span>
        </Link>
        <span style={{ color: '#333', margin: '0 10px' }}>/</span>
        <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{ventureId}</span>
        <span style={{ color: '#333', margin: '0 10px' }}>·</span>
        <span style={{
          background: 'rgba(0,255,136,0.08)', color: '#00ff88',
          border: '1px solid rgba(0,255,136,0.2)',
          padding: '3px 10px', borderRadius: 4, fontSize: 11, fontWeight: 700
        }}>INTELLIGENCE</span>
      </nav>

      {/* Main content */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 48px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 8 }}>
            Agents & Analytics
            <span style={{ color: '#444', fontSize: 16, fontWeight: 400, marginLeft: 16 }}>
              {ventureId}
            </span>
          </h1>
          <p style={{ color: '#666', fontSize: 14, maxWidth: 600 }}>
            Live intelligence — brand DNA, SEO, competitive landscape, social analytics, investor pipeline, and activity feed.
          </p>
          {simError && (
            <div style={{ marginTop: 12, background: 'rgba(255,136,0,0.06)', border: '1px solid rgba(255,136,0,0.15)', borderRadius: 8, padding: '10px 16px', display: 'inline-block' }}>
              <span style={{ color: '#ff8800', fontSize: 12 }}>⚠ No simulation data yet. Showing available intelligence only.</span>
            </div>
          )}
        </div>
        <IntelligenceDashboard ventureId={ventureId} />
        
        {/* Footer */}
        <div style={{ marginTop: 80, paddingTop: 32, borderTop: '1px solid #111', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ color: '#333', fontSize: 13 }}>
            {ventureId} · Intelligence · ShareOS
          </div>
          <Link href="/" style={{ color: '#555', fontSize: 13, textDecoration: 'none' }}>← All Simulations</Link>
        </div>
      </main>
    </div>
  );
}
