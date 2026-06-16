'use client';

import Link from 'next/link';

const stageColors: Record<string, string> = {
  Explore: '#0A7D3C',
  Generate: '#0A7D3C',
  Validate: '#00D65D',
  Pilot: '#8A6D3B',
  Launch: '#8A6D3B',
  Scale: '#5E6366',
  Exit: '#C9A227',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function SimulationCard({ sim }: { sim: any }) {
  const meta = sim.simulation_metadata || {};
  const summary = sim.executive_summary || {};
  const stages = sim.stages || [];

  const latestStage = stages[stages.length - 1]?.stage_name || 'Explore';
  const stageColor = stageColors[latestStage] || '#0A7D3C';

  return (
    <Link href={`/${sim.cmny_id}`} style={{ textDecoration: 'none' }}>
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #E8E6E4',
          borderRadius: 12,
          padding: 28,
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.borderColor = '#E8E6E4';
          (e.currentTarget as HTMLDivElement).style.background = '#FFFFFF';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.borderColor = '#E8E6E4';
          (e.currentTarget as HTMLDivElement).style.background = '#FFFFFF';
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#111111', marginBottom: 4 }}>
              {meta.venture_name || sim.cmny_id}
            </div>
            <div style={{ color: '#5E6366', fontSize: 14 }}>{meta.vertical} Vertical</div>
          </div>
          <span style={{
            background: `${stageColor}18`,
            color: stageColor,
            border: `1px solid ${stageColor}44`,
            padding: '4px 10px', borderRadius: 4, fontSize: 11,
            fontWeight: 700, letterSpacing: '0.05em'
          }}>{latestStage}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          <div style={{ background: '#FFFFFF', borderRadius: 8, padding: '12px 14px' }}>
            <div style={{ color: '#939799', fontSize: 11, marginBottom: 4 }}>CURRENT VALUATION</div>
            <div style={{ color: '#0A7D3C', fontSize: 18, fontWeight: 700 }}>
              ${((summary.current_valuation || 0) / 1000000).toFixed(1)}M
            </div>
          </div>
          <div style={{ background: '#FFFFFF', borderRadius: 8, padding: '12px 14px' }}>
            <div style={{ color: '#939799', fontSize: 11, marginBottom: 4 }}>GOALS ACTIVE</div>
            <div style={{ color: '#111111', fontSize: 18, fontWeight: 700 }}>{summary.total_goals || 0}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {stages.map((stage: { stage_name: string }) => (
            <span key={stage.stage_name} style={{
              background: `${stageColors[stage.stage_name] || '#0A7D3C'}18`,
              color: stageColors[stage.stage_name] || '#0A7D3C',
              border: `1px solid ${stageColors[stage.stage_name] || '#0A7D3C'}33`,
              padding: '2px 8px', borderRadius: 3, fontSize: 11, fontWeight: 600
            }}>{stage.stage_name}</span>
          ))}
        </div>

        <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #F1F4F5', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#939799', fontSize: 12 }}>
            Generated {new Date(sim.generated_at || Date.now()).toLocaleDateString()}
          </span>
          <span style={{ color: '#0A7D3C', fontSize: 12 }}>View Simulation →</span>
        </div>
      </div>
    </Link>
  );
}
