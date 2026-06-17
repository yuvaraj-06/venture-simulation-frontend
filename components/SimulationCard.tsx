'use client';

import Link from 'next/link';
import { Gauge } from './Brand';

const stageColors: Record<string, string> = {
  Explore: '#5E6366',
  Generate: '#5E6366',
  Validate: '#0A7D3C',
  Pilot: '#8A6D3B',
  Launch: '#8A6D3B',
  Scale: '#0A7D3C',
  Exit: '#000000',
};

const STAGES = ['Explore', 'Generate', 'Validate', 'Pilot', 'Launch', 'Scale', 'Exit'];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function SimulationCard({ sim }: { sim: any }) {
  const meta = sim.simulation_metadata || {};
  const summary = sim.executive_summary || {};
  const stages = sim.stages || [];

  const latestStage = stages[stages.length - 1]?.stage_name || 'Explore';
  const stageColor = stageColors[latestStage] || '#0A7D3C';
  const stageIdx = STAGES.indexOf(latestStage);
  const stageProgress = stageIdx >= 0 ? (stageIdx + 1) / STAGES.length : 0;
  const valuationM = (summary.current_valuation || 0) / 1000000;
  const valuationDisplay = valuationM.toFixed(1);
  const hasValuation = parseFloat(valuationDisplay) > 0; // green only when the shown number is non-zero

  return (
    <Link href={`/${sim.cmny_id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{
        background: '#FFFFFF',
        padding: 24,
        cursor: 'pointer',
        transition: 'background 0.15s',
        height: '100%',
      }}
        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = '#F7F8F9'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = '#FFFFFF'; }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, gap: 16 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 19, fontWeight: 600, color: '#000000', marginBottom: 4, letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {meta.venture_name || sim.cmny_id}
            </div>
            <div style={{ color: '#5E6366', fontSize: 13 }}>{meta.vertical || 'ShareOS'} Vertical</div>
          </div>
          {/* Stage gauge — circular workshop motif */}
          <Gauge value={stageProgress} size={56} label={String(stageIdx + 1)} sub={`/ ${STAGES.length}`} />
        </div>

        {/* Stat row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: '#E8E6E4', border: '1px solid #E8E6E4', borderRadius: 6, marginBottom: 18 }}>
          <div style={{ background: '#FFFFFF', padding: '12px 14px' }}>
            <div style={{ color: '#939799', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Current Valuation</div>
            <div style={{ color: hasValuation ? '#0A7D3C' : '#939799', fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em', marginTop: 2 }}>
              ${valuationDisplay}M
            </div>
          </div>
          <div style={{ background: '#FFFFFF', padding: '12px 14px' }}>
            <div style={{ color: '#939799', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Goals Active</div>
            <div style={{ color: '#000000', fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em', marginTop: 2 }}>{summary.total_goals || 0}</div>
          </div>
        </div>

        {/* 7-stage journey strip with labels (workshop visual notes pattern) */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
            {STAGES.map((st) => {
              const reached = stages.some((s: { stage_name: string }) => s.stage_name === st);
              const current = st === latestStage;
              return (
                <div key={st} style={{
                  flex: 1,
                  height: 4,
                  borderRadius: 2,
                  background: current ? '#00D65D' : reached ? '#0A7D3C' : '#E8E6E4',
                }} title={st} />
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#C8CBCC', fontSize: 9, fontWeight: 500, letterSpacing: '0.02em' }}>
            <span style={{ color: stageIdx === 0 ? '#0A7D3C' : '#C8CBCC' }}>Explore</span>
            <span>Generate</span>
            <span>Validate</span>
            <span>Pilot</span>
            <span>Launch</span>
            <span>Scale</span>
            <span>Exit</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, paddingTop: 14, borderTop: '1px solid #F1F4F5' }}>
          <span style={{ color: '#939799', fontSize: 12 }}>
            Stage: <span style={{ color: stageColor, fontWeight: 600 }}>{latestStage}</span>
            <span style={{ color: '#C8CBCC', margin: '0 8px' }}>·</span>
            {new Date(sim.generated_at || Date.now()).toLocaleDateString()}
          </span>
          <span style={{ color: '#0A7D3C', fontSize: 12, fontWeight: 600 }}>View →</span>
        </div>
      </div>
    </Link>
  );
}
