// @ts-nocheck
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { VentureSimulation, Stage } from '@/lib/types';
import IntelligenceDashboard from './IntelligenceDashboard';
import LockedSection from './LockedSection';
import { useVentureAccess } from '@/lib/useVentureAccess';
import React from 'react';
import { Brand, Glyph, Gauge } from './Brand';

class ErrorBoundaryIntel extends React.Component<{children: React.ReactNode}, {hasError: boolean; error?: Error}> {
  constructor(props: {children: React.ReactNode}) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, color: '#C0392B', background: '#FFFFFF', minHeight: '50vh' }}>
          <h2 style={{ fontSize: 20, marginBottom: 12 }}>Intelligence Dashboard Error</h2>
          <pre style={{ background: '#FFFFFF', padding: 16, borderRadius: 8, overflow: 'auto', fontSize: 13, color: '#8A6D3B' }}>
            {this.state.error?.message}
          </pre>
          <pre style={{ background: '#FFFFFF', padding: 16, borderRadius: 8, overflow: 'auto', fontSize: 11, color: '#5E6366', marginTop: 8, maxHeight: 200 }}>
            {this.state.error?.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const STAGE_COLORS: Record<string, string> = {
  Explore: '#0A7D3C',
  Generate: '#0A7D3C',
  Validate: '#00D65D',
  Pilot: '#8A6D3B',
  Launch: '#8A6D3B',
  Scale: '#5E6366',
  Exit: '#C9A227',
};

function fmt(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toLocaleString()}`;
}

function StatusBadge({ status }: { status: string }) {
  const s = status?.toUpperCase() || '';
  const map: Record<string, { bg: string; color: string; border: string }> = {
    ACHIEVED: { bg: 'rgba(0, 214, 93,0.1)', color: '#0A7D3C', border: 'rgba(0, 214, 93,0.3)' },
    'IN-PROGRESS': { bg: 'rgba(10, 125, 60,0.1)', color: '#0A7D3C', border: 'rgba(10, 125, 60,0.3)' },
    PENDING: { bg: 'rgba(138, 109, 59,0.1)', color: '#8A6D3B', border: 'rgba(138, 109, 59,0.3)' },
    FAILED: { bg: 'rgba(192, 57, 43,0.1)', color: '#C0392B', border: 'rgba(192, 57, 43,0.3)' },
    PASS: { bg: 'rgba(0, 214, 93,0.1)', color: '#0A7D3C', border: 'rgba(0, 214, 93,0.3)' },
    GO: { bg: 'rgba(0, 214, 93,0.1)', color: '#0A7D3C', border: 'rgba(0, 214, 93,0.3)' },
    ADVANCE: { bg: 'rgba(10, 125, 60,0.1)', color: '#0A7D3C', border: 'rgba(10, 125, 60,0.3)' },
    BONUS: { bg: 'rgba(255,204,0,0.1)', color: '#8A6D3B', border: 'rgba(255,204,0,0.3)' },
    FAIL: { bg: 'rgba(192, 57, 43,0.1)', color: '#C0392B', border: 'rgba(192, 57, 43,0.3)' },
    'NO-GO': { bg: 'rgba(192, 57, 43,0.1)', color: '#C0392B', border: 'rgba(192, 57, 43,0.3)' },
  };
  const style = map[s] || map['PENDING'];
  return (
    <span style={{
      background: style.bg, color: style.color, border: `1px solid ${style.border}`,
      padding: '2px 8px', borderRadius: 3, fontSize: 11, fontWeight: 700, letterSpacing: '0.05em',
      display: 'inline-block', whiteSpace: 'nowrap'
    }}>{s}</span>
  );
}

function SectionHeader({ id, label, children }: { id: string; label: string; children?: React.ReactNode }) {
  return (
    <div id={id} style={{ scrollMarginTop: 80, marginBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ color: '#939799', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600 }}>
          {label}
        </div>
        <div style={{ flex: 1, height: 1, background: '#F1F4F5' }} />
      </div>
      {children}
    </div>
  );
}

function MetricCard({ label, value, sub, color = '#000000' }: { label: string; value: string; sub?: string; color?: string }) {
  const c = color === '#FFFFFF' ? '#000000' : color;
  return (
    <div className="sim-metric-card" style={{ background: '#FFFFFF', border: '1px solid #E8E6E4', borderRadius: 8, padding: '22px 24px' }}>
      <div style={{ color: '#939799', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10, fontWeight: 600 }}>{label}</div>
      <div className="sim-metric-value" style={{ color: c, fontSize: 30, fontWeight: 600, lineHeight: 1.05, marginBottom: 4, letterSpacing: '-0.02em' }}>{value}</div>
      {sub && <div style={{ color: '#939799', fontSize: 12 }}>{sub}</div>}
    </div>
  );
}

function ProgressBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div style={{ height: 4, background: '#F1F4F5', borderRadius: 2, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 2, transition: 'width 1s ease' }} />
    </div>
  );
}

export default function SimulationDashboard({ simulation, ventureId }: { simulation: VentureSimulation; ventureId?: string }) {
  const [activeStage, setActiveStage] = useState(0);
  const [activeSidebarItem, setActiveSidebarItem] = useState('exec-summary');
  const [activeTab, setActiveTab] = useState<'simulation' | 'intelligence'>('simulation');
  const { isUnlocked, checkoutUrl, pipelineRunning } = useVentureAccess(ventureId || simulation?.simulation_metadata?.venture_name?.toLowerCase().replace(/[^a-z0-9]+/g, '_') || '');

  const { simulation_metadata: meta, executive_summary: summary, signal_origin: signal,
    founding_team: team, products, stages, analysis } = simulation;

  const stagesArr = stages || [];
  const currentStage = stagesArr[activeStage || 0];
  const stageColor = STAGE_COLORS[currentStage?.stage_name || 'Explore'] || '#0A7D3C';

  const simulationSections = [
    { id: 'exec-summary', label: 'Executive Summary' },
    { id: 'signal-origin', label: 'Signal Origin' },
    { id: 'founding-team', label: 'Founding Team' },
    { id: 'products', label: 'Products & Services' },
    ...((stages || []) as any[]).map((s: Stage) => ({ id: `stage-${s.stage_name.toLowerCase()}`, label: `Stage: ${s.stage_name}` })),
    { id: 'analysis', label: 'Analysis' },
  ];

  const intelligenceSections = [
    { id: 'intel-brand', label: 'Brand DNA' },
    { id: 'intel-seo', label: 'SEO & GEO' },
    { id: 'intel-competitors', label: 'Competitors' },
    { id: 'intel-social', label: 'Social Analytics' },
    { id: 'intel-goals', label: 'Goals Overview' },
    { id: 'intel-investors', label: 'Investor Pipeline' },
    { id: 'intel-feed', label: 'Activity Feed' },
    { id: 'intel-hiring', label: 'Team & Hiring' },
  ];

  const sidebarSections = activeTab === 'intelligence' ? intelligenceSections : simulationSections;

  function scrollTo(id: string) {
    setActiveSidebarItem(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div style={{ background: '#F1F4F5', minHeight: '100vh' }}>
      {/* Top Nav */}
      <nav className="sim-nav" style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #E8E6E4',
        display: 'flex', alignItems: 'center', gap: 0,
      }}>
        {/* Logo area */}
        <div className="sim-nav-logo" style={{ padding: '0 22px', borderRight: '1px solid #E8E6E4', height: 56, display: 'flex', alignItems: 'center', gap: 12, minWidth: 220 }}>
          <Brand href="/" />
          <span style={{ color: '#C8CBCC' }}>/</span>
          <span style={{ color: '#000000', fontSize: 13, fontWeight: 600 }}>{meta.venture_name}</span>
        </div>

        {/* Stage tabs + Intelligence tab */}
        <div style={{ display: 'flex', flex: 1, height: 56, overflowX: 'auto' }}>
          {((stages || []) as any[]).map((stage: Stage, idx: number) => {
            const color = STAGE_COLORS[stage.stage_name] || '#0A7D3C';
            const isActive = activeTab === 'simulation' && idx === activeStage;
            return (
              <button
                key={stage.stage_name}
                onClick={() => {
                  setActiveTab('simulation');
                  setActiveStage(idx);
                  scrollTo(`stage-${stage.stage_name.toLowerCase()}`);
                }}
                style={{
                  background: isActive ? `${color}14` : 'transparent',
                  color: isActive ? color : '#939799',
                  border: 'none',
                  borderBottom: isActive ? `2px solid ${color}` : '2px solid transparent',
                  padding: '0 20px',
                  fontSize: 13, fontWeight: isActive ? 700 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  whiteSpace: 'nowrap',
                  display: 'flex', alignItems: 'center', gap: 6,
                  height: '100%',
                }}
              >
                <span style={{ fontSize: 10, opacity: 0.6 }}>{idx + 1}</span>
                {stage.stage_name}
              </button>
            );
          })}
          {/* Intelligence tab */}
          <button
            onClick={() => { setActiveTab('intelligence'); setActiveSidebarItem('intel-brand'); }}
            style={{
              background: activeTab === 'intelligence' ? 'rgba(0, 214, 93,0.08)' : 'transparent',
              color: activeTab === 'intelligence' ? '#0A7D3C' : '#C8CBCC',
              border: 'none',
              borderBottom: activeTab === 'intelligence' ? '2px solid #00D65D' : '2px solid transparent',
              padding: '0 24px',
              fontSize: 13, fontWeight: activeTab === 'intelligence' ? 700 : 400,
              cursor: 'pointer',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
              display: 'flex', alignItems: 'center', gap: 6,
              height: '100%',
              marginLeft: 8,
              borderLeft: '1px solid #E8E6E4',
            }}
          >
            <Glyph name="bolt" size={14} />
            Agents
          </button>
        </div>

        {/* Right info */}
        <div className="sim-nav-right" style={{ padding: '0 24px', borderLeft: '1px solid #E8E6E4', height: 56, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#939799', fontSize: 12 }}>{meta.vertical}</span>
          <span style={{ color: '#2B3033' }}>|</span>
          <span style={{
            background: `${stageColor}18`, color: stageColor,
            border: `1px solid ${stageColor}44`,
            padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700
          }}>SIM {meta.version || 'V1'}</span>
        </div>
      </nav>

      <div className="sim-layout" style={{ display: 'flex' }}>
        {/* Sidebar */}
        <aside className="sim-sidebar" style={{
          width: 220, minWidth: 220, position: 'sticky', top: 56,
          height: 'calc(100vh - 56px)', overflowY: 'auto',
          borderRight: '1px solid #E8E6E4', padding: '24px 0',
          background: '#FFFFFF',
        }}>
          <div style={{ padding: '0 16px', marginBottom: 8 }}>
            <div style={{ color: '#5E6366', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600 }}>
              {activeTab === 'intelligence' ? 'Agents' : 'Navigation'}
            </div>
          </div>
          {sidebarSections.map((s) => {
            const isStage = s.id.startsWith('stage-');
            const isIntel = s.id.startsWith('intel-');
            const stageName = isStage ? s.id.replace('stage-', '') : '';
            const baseColor = isIntel ? '#00D65D' : '#0A7D3C';
            const color = isStage ? STAGE_COLORS[stageName.charAt(0).toUpperCase() + stageName.slice(1)] || '#0A7D3C' : baseColor;
            const isActive = activeSidebarItem === s.id;

            return (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                style={{
                  width: '100%', textAlign: 'left',
                  background: isActive ? `${color}0a` : 'transparent',
                  color: isActive ? color : '#939799',
                  border: 'none', borderRight: isActive ? `2px solid ${color}` : '2px solid transparent',
                  padding: isStage ? '6px 16px 6px 24px' : '7px 16px',
                  fontSize: 12, fontWeight: isActive ? 600 : 400,
                  cursor: 'pointer', transition: 'all 0.15s',
                  display: 'block',
                }}
              >
                {isStage && <span style={{ color: '#2B3033', marginRight: 6 }}>→</span>}
                {isIntel && <span style={{ color: '#5E6366', marginRight: 6 }}><Glyph name="bolt" /></span>}
                {s.label}
              </button>
            );
          })}
        </aside>

        {/* Main content */}
        <main className="sim-main" style={{ flex: 1, padding: '40px 48px', overflowX: 'hidden' }}>
          {/* Intelligence Tab */}
          {activeTab === 'intelligence' && (
            <div>
              <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 36, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 8, textTransform: 'lowercase', lineHeight: 1.05 }}>
                  agents &amp; analytics
                  <span style={{ color: '#939799', fontSize: 16, fontWeight: 400, marginLeft: 16 }}>
                    {meta.venture_name}
                  </span>
                </h1>
                <p style={{ color: '#5E6366', fontSize: 14, maxWidth: 600 }}>
                  Live intelligence: brand DNA, SEO, competitive landscape, social analytics, investor pipeline, and activity feed.
                </p>
              </div>
              <ErrorBoundaryIntel>
                <IntelligenceDashboard ventureId={ventureId || (meta.venture_name === 'Share Insights' ? 'share_insights' : meta.venture_name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, ''))} />
              </ErrorBoundaryIntel>
              {/* Footer */}
              <div style={{ marginTop: 80, paddingTop: 32, borderTop: '1px solid #E8E6E4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ color: '#5E6366', fontSize: 13 }}>
                  {meta.venture_name} · Agents · ShareOS
                </div>
                <Link href="/" style={{ color: '#939799', fontSize: 13, textDecoration: 'none' }}>← All Simulations</Link>
              </div>
            </div>
          )}

          {/* Simulation Tab */}
          {activeTab === 'simulation' && (<>

          {/* EXECUTIVE SUMMARY */}
          <SectionHeader id="exec-summary" label="Executive Summary">
            <div style={{ marginBottom: 8 }}>
              <h1 style={{ fontSize: 44, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 8, lineHeight: 1.05 }}>
                {meta.venture_name}
                <span style={{ color: '#939799', fontSize: 18, fontWeight: 400, marginLeft: 16 }}>
                  Simulation Report
                </span>
              </h1>
              <p style={{ color: '#5E6366', fontSize: 16, maxWidth: 700, lineHeight: 1.6 }}>
                {meta.subdomain && `${meta.subdomain} · `}{meta.tam_formatted} TAM · {meta.vertical} Vertical
              </p>
            </div>

            <div className="sim-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
              <MetricCard label="Current Valuation" value={fmt(summary.current_valuation)} color="#0A7D3C" />
              <MetricCard label="Target Valuation" value={fmt(summary.target_valuation)} color="#000000" />
              <MetricCard label="Total Goals" value={summary.total_goals?.toString()} sub={`${summary.goals_achieved} active`} color="#FFFFFF" />
              <MetricCard label="Avg Agent Work" value={summary.avg_agent_work_share} color="#00D65D" />
            </div>

            <div className="sim-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
              <MetricCard label="Agent Cost (All Stages)" value={fmt(summary.total_agent_cost || 0)} sub={summary.agent_cost_pct} color="#8A6D3B" />
              <MetricCard label="Timeline" value={summary.timeline} sub={`Active since stage 1`} color="#FFFFFF" />
              <MetricCard label="TAM" value={meta.tam_formatted} color="#0A7D3C" />
            </div>

            {/* Key takeaways */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E8E6E4', borderRadius: 8, padding: 24 }}>
              <div style={{ color: '#939799', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>Key Takeaways</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {summary.key_takeaways?.map((t: string, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span style={{
                      background: 'rgba(10, 125, 60,0.1)', color: '#0A7D3C',
                      border: '1px solid rgba(10, 125, 60,0.2)',
                      borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 700,
                      minWidth: 24, textAlign: 'center', flexShrink: 0
                    }}>{i + 1}</span>
                    <p style={{ color: '#5E6366', fontSize: 14, lineHeight: 1.6, margin: 0 }}>{t}</p>
                  </div>
                ))}
              </div>
            </div>
          </SectionHeader>

          <hr style={{ border: 'none', borderTop: '1px solid #E8E6E4', margin: '40px 0' }} />

          {/* SIGNAL ORIGIN */}
          <LockedSection isLocked={!isUnlocked} checkoutUrl={checkoutUrl} ventureId={ventureId} pipelineRunning={pipelineRunning} teaserHeight={160} label="Unlock Signal Analysis">
          <SectionHeader id="signal-origin" label="Signal Origin">
            <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 20 }}>Signal Origin</h2>
            <div className="sim-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
              <div>
                <div style={{ background: '#FFFFFF', border: '1px solid #E8E6E4', borderRadius: 8, padding: 24, marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div style={{ color: '#939799', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Signal Strength</div>
                    <span style={{
                      background: 'rgba(0, 214, 93,0.1)', color: '#0A7D3C',
                      border: '1px solid rgba(0, 214, 93,0.2)',
                      padding: '4px 10px', borderRadius: 4, fontSize: 12, fontWeight: 700
                    }}>THRESHOLD EXCEEDED</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
                    <span style={{ fontSize: 48, fontWeight: 800, color: '#0A7D3C' }}>
                      {(signal.signal_strength_score * 100).toFixed(0)}
                    </span>
                    <span style={{ color: '#939799', fontSize: 18 }}>/ 100</span>
                  </div>
                  <ProgressBar pct={signal.signal_strength_score * 100} color="#0A7D3C" />
                  <div style={{ color: '#939799', fontSize: 12, marginTop: 8 }}>
                    Threshold: {(signal.threshold * 100).toFixed(0)} · {signal.action_triggered}
                  </div>
                </div>

                <div style={{ background: '#FFFFFF', border: '1px solid #E8E6E4', borderRadius: 8, padding: 24 }}>
                  <div style={{ color: '#939799', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>Market Context</div>
                  <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
                    <div>
                      <div style={{ color: '#939799', fontSize: 11 }}>VERTICAL</div>
                      <div style={{ color: '#000000', fontSize: 14, fontWeight: 600 }}>{signal.vertical}</div>
                    </div>
                    <div>
                      <div style={{ color: '#939799', fontSize: 11 }}>SUBDOMAIN</div>
                      <div style={{ color: '#000000', fontSize: 14, fontWeight: 600 }}>{signal.subdomain}</div>
                    </div>
                    <div>
                      <div style={{ color: '#939799', fontSize: 11 }}>TAM</div>
                      <div style={{ color: '#0A7D3C', fontSize: 14, fontWeight: 600 }}>{signal.tam}</div>
                    </div>
                  </div>
                  <p style={{ color: '#5E6366', fontSize: 13, lineHeight: 1.6, marginBottom: 12 }}>{signal.domain_context}</p>
                  {signal.core_scientific_thesis && (
                    <div style={{ borderLeft: '3px solid #0A7D3C', paddingLeft: 12 }}>
                      <div style={{ color: '#939799', fontSize: 11, marginBottom: 4 }}>CORE THESIS</div>
                      <p style={{ color: '#5E6366', fontSize: 13, lineHeight: 1.6, margin: 0 }}>{signal.core_scientific_thesis}</p>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ background: '#FFFFFF', border: '1px solid #E8E6E4', borderRadius: 8, padding: 24 }}>
                <div style={{ color: '#939799', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
                  Detection Signals ({signal.signals?.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {signal.signals?.map((s, i) => (
                    <div key={i} style={{
                      background: '#FFFFFF', border: '1px solid #E8E6E4', borderRadius: 6,
                      padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                      <span style={{ color: '#5E6366', fontSize: 13 }}>{s.signal}</span>
                      <span style={{ color: '#0A7D3C', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', marginLeft: 12 }}>{s.strength}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SectionHeader>
          </LockedSection>

          <hr style={{ border: 'none', borderTop: '1px solid #E8E6E4', margin: '40px 0' }} />

          {/* FOUNDING TEAM */}
          <LockedSection isLocked={!isUnlocked} checkoutUrl={checkoutUrl} ventureId={ventureId} pipelineRunning={pipelineRunning} teaserHeight={140} label="Unlock Team Details">
          <SectionHeader id="founding-team" label="Founding Team">
            <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 20 }}>Founding Team</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {team?.map((member, i) => (
                <div key={i} style={{ background: '#FFFFFF', border: '1px solid #E8E6E4', borderRadius: 8, padding: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: '50%',
                      background: `linear-gradient(135deg, ${['#0A7D3C', '#00D65D', '#0A7D3C', '#8A6D3B'][i % 4]}, #F1F4F5)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16, fontWeight: 700, color: '#000000', flexShrink: 0
                    }}>{member.name[0]}</div>
                    <div>
                      <div style={{ color: '#000000', fontSize: 15, fontWeight: 700 }}>{member.name}</div>
                      <div style={{ color: '#939799', fontSize: 12 }}>{member.role}</div>
                    </div>
                  </div>
                  <p style={{ color: '#5E6366', fontSize: 13, lineHeight: 1.6, marginBottom: 12 }}>{member.description}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {member.expertise_tags?.map((tag, j) => (
                      <span key={j} style={{
                        background: '#FFFFFF', border: '1px solid #E8E6E4',
                        color: '#5E6366', padding: '2px 8px', borderRadius: 3, fontSize: 11
                      }}>{tag}</span>
                    ))}
                  </div>
                  {member.hourly_rate && (
                    <div style={{ marginTop: 12, color: '#939799', fontSize: 12 }}>
                      ${member.hourly_rate}/hr
                    </div>
                  )}
                </div>
              ))}
            </div>
          </SectionHeader>
          </LockedSection>

          <hr style={{ border: 'none', borderTop: '1px solid #E8E6E4', margin: '40px 0' }} />

          {/* PRODUCTS */}
          <LockedSection isLocked={!isUnlocked} checkoutUrl={checkoutUrl} ventureId={ventureId} pipelineRunning={pipelineRunning} teaserHeight={140} label="Unlock Products Analysis">
          <SectionHeader id="products" label="Products & Services">
            <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 20 }}>Products & Services</h2>
            {products?.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                {(products || []).map((p, i) => (
                  <div key={i} style={{ background: '#FFFFFF', border: '1px solid #E8E6E4', borderRadius: 8, padding: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <div style={{ color: '#000000', fontSize: 18, fontWeight: 700 }}>{p.name}</div>
                        <div style={{ color: '#939799', fontSize: 12 }}>{p.category}</div>
                      </div>
                      {p.evidence_score && (
                        <span style={{
                          background: 'rgba(10, 125, 60,0.1)', color: '#0A7D3C',
                          border: '1px solid rgba(10, 125, 60,0.2)',
                          padding: '3px 8px', borderRadius: 3, fontSize: 11, fontWeight: 700
                        }}>{p.evidence_score}</span>
                      )}
                    </div>
                    <p style={{ color: '#5E6366', fontSize: 13, lineHeight: 1.5, marginBottom: 10 }}>{p.outcome}</p>
                    {p.mechanism && <p style={{ color: '#939799', fontSize: 12, lineHeight: 1.5, marginBottom: 10 }}>{p.mechanism}</p>}
                    {p.key_differentiator && (
                      <div style={{ borderLeft: '3px solid #0A7D3C', paddingLeft: 10 }}>
                        <p style={{ color: '#5E6366', fontSize: 12, margin: 0 }}>{p.key_differentiator}</p>
                      </div>
                    )}
                    {p.pricing && (
                      <div style={{ marginTop: 12, color: '#0A7D3C', fontWeight: 700, fontSize: 16 }}>{p.pricing}</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ background: '#FFFFFF', border: '1px solid #E8E6E4', borderRadius: 8, padding: 24, color: '#939799' }}>
                Products defined in roadmap. Detail pending product validation stage.
              </div>
            )}
          </SectionHeader>
          </LockedSection>

          <hr style={{ border: 'none', borderTop: '1px solid #E8E6E4', margin: '40px 0' }} />

          {/* STAGE SECTIONS */}
          <LockedSection isLocked={!isUnlocked} checkoutUrl={checkoutUrl} ventureId={ventureId} pipelineRunning={pipelineRunning} teaserHeight={200} label="Unlock Stage Simulation">
          {((stages || []) as any[]).map((stage: Stage, idx: number) => (
            <StageSection key={stage.stage_name} stage={stage} isActive={idx === activeStage} />
          ))}
          </LockedSection>

          {/* ANALYSIS */}
          <LockedSection isLocked={!isUnlocked} checkoutUrl={checkoutUrl} ventureId={ventureId} pipelineRunning={pipelineRunning} teaserHeight={160} label="Unlock Full Analysis">
          <SectionHeader id="analysis" label="Analysis">
            <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Simulation Analysis</h2>

            {/* Human vs Agent trajectory */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E8E6E4', borderRadius: 8, padding: 24, marginBottom: 24 }}>
              <div style={{ color: '#939799', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>
                Human vs Agent Work Split by Stage
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${(analysis?.human_pct_trajectory || [])?.length || 1}, 1fr)`, gap: 8 }}>
                {(analysis?.human_pct_trajectory || [])?.map((row, i) => (
                  <div key={i} style={{ textAlign: 'center' }}>
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: 11, color: '#939799', marginBottom: 6 }}>{row.stage}</div>
                      <div style={{ position: 'relative', height: 80, background: '#FFFFFF', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{
                          position: 'absolute', bottom: 0, left: 0, right: 0,
                          height: `${row.agent_pct}%`,
                          background: 'linear-gradient(to top, #0A7D3C44, #0A7D3C22)',
                          borderTop: '1px solid #0A7D3C66'
                        }} />
                        <div style={{
                          position: 'absolute', top: '50%', left: '50%',
                          transform: 'translate(-50%, -50%)',
                          color: '#0A7D3C', fontSize: 14, fontWeight: 700
                        }}>{row.agent_pct}%</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 10, color: '#939799' }}>
                      <span style={{ color: '#0A7D3C' }}>A: {row.agent_cost}</span>
                      <br />
                      <span style={{ color: '#5E6366' }}>H: {row.human_cost}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Agent value creation */}
            {(analysis?.agent_value_creation || [])?.length > 0 && (
              <div style={{ background: '#FFFFFF', border: '1px solid #E8E6E4', borderRadius: 8, padding: 24, marginBottom: 24 }}>
                <div style={{ color: '#939799', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
                  Agent Value Creation
                </div>
                <div className="sim-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {(analysis?.agent_value_creation || []).map((v, i) => (
                    <div key={i} style={{ background: '#FFFFFF', border: '1px solid #E8E6E4', borderRadius: 6, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#5E6366', fontSize: 13 }}>{v.value_driver}</span>
                      <span style={{ color: '#0A7D3C', fontWeight: 700, fontSize: 14, marginLeft: 16 }}>{v.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ShareOS vs Traditional */}
            {analysis.shareos_vs_traditional && (
              <div className="sim-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <div style={{ background: '#FFFFFF', border: '1px solid #E8E6E4', borderRadius: 8, padding: 24 }}>
                  <div style={{ color: '#C0392B', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Traditional Approach</div>
                  <p style={{ color: '#5E6366', fontSize: 13, lineHeight: 1.7, margin: 0 }}>{analysis.shareos_vs_traditional.traditional}</p>
                </div>
                <div style={{ background: '#FFFFFF', border: '1px solid rgba(10, 125, 60,0.2)', borderRadius: 8, padding: 24 }}>
                  <div style={{ color: '#0A7D3C', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>ShareOS Approach</div>
                  <p style={{ color: '#5E6366', fontSize: 13, lineHeight: 1.7, margin: 0 }}>{analysis.shareos_vs_traditional.shareos}</p>
                </div>
              </div>
            )}

            {/* Proofs */}
            {(analysis?.proofs || [])?.length > 0 && (
              <div style={{ background: '#FFFFFF', border: '1px solid #E8E6E4', borderRadius: 8, padding: 24 }}>
                <div style={{ color: '#939799', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>
                  ShareOS Proofs
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {(analysis?.proofs || []).map((p, i) => (
                    <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', paddingBottom: 14, borderBottom: i < (analysis?.proofs || []).length - 1 ? '1px solid #FFFFFF' : 'none' }}>
                      <span style={{
                        background: 'rgba(10, 125, 60,0.1)', color: '#0A7D3C',
                        border: '1px solid rgba(10, 125, 60,0.2)',
                        borderRadius: 4, padding: '4px 10px', fontSize: 11, fontWeight: 700,
                        flexShrink: 0
                      }}>Proof {p.proof_number}</span>
                      <div>
                        <div style={{ color: '#000000', fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{p.title}</div>
                        <p style={{ color: '#5E6366', fontSize: 13, lineHeight: 1.6, margin: 0 }}>{p.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Master stage summary table */}
            {(analysis?.master_stage_summary || []) && (analysis?.master_stage_summary || []).length > 0 && (
              <div style={{ background: '#FFFFFF', border: '1px solid #E8E6E4', borderRadius: 8, padding: 24, marginTop: 24 }}>
                <div style={{ color: '#939799', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
                  Master Stage Summary
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table className="sim-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr>
                        {['Stage', 'Duration', 'Goals', 'Agent Cost', 'Human Time', 'Human Cost', 'Total Cost', 'Agent IWA'].map((h) => (
                          <th key={h} style={{ color: '#939799', padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid #E8E6E4', fontWeight: 600, letterSpacing: '0.05em', fontSize: 11, textTransform: 'uppercase' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(analysis?.master_stage_summary || []).map((row, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #FFFFFF' }}>
                          <td style={{ padding: '10px 12px', color: STAGE_COLORS[row.stage] || '#000000', fontWeight: 600 }}>{row.stage}</td>
                          <td style={{ padding: '10px 12px', color: '#5E6366' }}>{row.duration}</td>
                          <td style={{ padding: '10px 12px', color: '#0A7D3C' }}>{row.goals}</td>
                          <td style={{ padding: '10px 12px', color: '#8A6D3B' }}>{row.agent_cost}</td>
                          <td style={{ padding: '10px 12px', color: '#5E6366' }}>{row.human_time}</td>
                          <td style={{ padding: '10px 12px', color: '#5E6366' }}>{row.human_cost}</td>
                          <td style={{ padding: '10px 12px', color: '#000000' }}>{row.total_cost}</td>
                          <td style={{ padding: '10px 12px', color: '#0A7D3C', fontWeight: 700 }}>{row.iwa}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </SectionHeader>
          </LockedSection>

          {/* Footer */}
          <div style={{ marginTop: 80, paddingTop: 32, borderTop: '1px solid #E8E6E4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ color: '#5E6366', fontSize: 13 }}>
              {meta.venture_name} · {meta.vertical} · ShareOS Simulation {meta.version}
            </div>
            <Link href="/" style={{ color: '#939799', fontSize: 13, textDecoration: 'none' }}>← All Simulations</Link>
          </div>
          </>)}
        </main>
      </div>
    </div>
  );
}

function StageSection({ stage, isActive }: { stage: Stage; isActive: boolean }) {
  const [expanded, setExpanded] = useState(true);
  const color = STAGE_COLORS[stage.stage_name] || '#0A7D3C';

  return (
    <SectionHeader id={`stage-${stage.stage_name.toLowerCase()}`} label={`Stage ${stage.stage_number}: ${stage.stage_name}`}>
      <div style={{
        border: `1px solid ${isActive ? color + '44' : '#F1F4F5'}`,
        borderRadius: 12, overflow: 'hidden',
        background: isActive ? `${color}06` : '#FFFFFF',
        marginBottom: 40,
      }}>
        {/* Stage header */}
        <div
          style={{ padding: '20px 24px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #FFFFFF' }}
          onClick={() => setExpanded(!expanded)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{
              background: `${color}18`, color: color,
              border: `1px solid ${color}44`,
              padding: '4px 12px', borderRadius: 4, fontSize: 12, fontWeight: 700
            }}>{stage.stage_name}</span>
            <span style={{ color: '#000000', fontSize: 18, fontWeight: 700 }}>{stage.headline}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <span style={{ color: '#939799', fontSize: 13 }}>{stage.duration}</span>
            <span style={{ color: '#0A7D3C', fontSize: 13, fontWeight: 600 }}>{stage.goals_count} goals</span>
            <span style={{ color: color, fontSize: 18 }}>{expanded ? '↑' : '↓'}</span>
          </div>
        </div>

        {expanded && (
          <div style={{ padding: 24 }}>
            <p style={{ color: '#5E6366', fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>{stage.description}</p>

            {/* Stage metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 24 }}>
              {[
                { label: 'Target Valuation', value: fmt(stage.target_valuation), color: '#0A7D3C' },
                { label: 'Agent Cost', value: fmt(stage.agent_cost || 0), color: '#8A6D3B' },
                { label: 'Human Cost', value: fmt(stage.human_cost || 0), color: '#5E6366' },
                { label: 'Agent Work', value: `${stage.agent_work_pct?.toFixed(0)}%`, color: '#0A7D3C' },
                { label: 'Human Time', value: stage.human_time || 'n/a', color: '#5E6366' },
              ].map((m) => (
                <div key={m.label} style={{ background: '#FFFFFF', border: '1px solid #F7F8F9', borderRadius: 6, padding: '12px 14px' }}>
                  <div style={{ color: '#939799', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>{m.label}</div>
                  <div style={{ color: m.color, fontSize: 18, fontWeight: 700 }}>{m.value}</div>
                </div>
              ))}
            </div>

            {/* Workstream weights */}
            {stage.workstream_weights?.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ color: '#939799', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
                  Workstream Weights / Stage {stage.stage_name}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(stage.workstream_weights || []).map((w, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '200px 1fr 80px', gap: 12, alignItems: 'center' }}>
                      <span style={{ color: '#5E6366', fontSize: 12 }}>{w.workstream}</span>
                      <div style={{ height: 4, background: '#FFFFFF', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${w.weight_pct}%`, background: color, borderRadius: 2 }} />
                      </div>
                      <span style={{ color: color, fontSize: 12, fontWeight: 700, textAlign: 'right' }}>
                        {w.weight_pct}% · {fmt(w.valuation_allocation)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Workstreams goals */}
            {stage.workstreams?.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ color: '#939799', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
                  Workstreams & Goals
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {(stage.workstreams || []).map((ws, i) => (
                    <div key={i} style={{ background: '#FFFFFF', border: '1px solid #F7F8F9', borderRadius: 8, overflow: 'hidden' }}>
                      <div style={{ padding: '12px 16px', borderBottom: '1px solid #FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ color: color, fontWeight: 600, fontSize: 13 }}>{ws.workstream_name}</span>
                          <span style={{ color: '#939799', fontSize: 12, marginLeft: 8 }}>{ws.headline}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                          {ws.key_metric_label && (
                            <span style={{ color: '#939799', fontSize: 11 }}>
                              {ws.key_metric_label}: <span style={{ color: '#0A7D3C', fontWeight: 600 }}>{ws.key_metric_value}</span>
                              <span style={{ color: '#5E6366' }}> / {ws.key_metric_target}</span>
                            </span>
                          )}
                          {ws.valuation > 0 && (
                            <span style={{ color: '#939799', fontSize: 11 }}>{fmt(ws.valuation)}</span>
                          )}
                        </div>
                      </div>
                      {ws.goals?.length > 0 && (
                        <div style={{ padding: '12px 16px' }}>
                          <table className="sim-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                            <thead>
                              <tr>
                                {['Goal', 'Target', 'Result', 'Status', 'Val. Target', 'Score'].map((h) => (
                                  <th key={h} style={{ color: '#939799', padding: '4px 8px', textAlign: 'left', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, borderBottom: '1px solid #FFFFFF' }}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {(ws.goals || []).map((g, j) => (
                                <tr key={j} style={{ borderBottom: '1px solid #FFFFFF' }}>
                                  <td style={{ padding: '8px', color: '#5E6366', maxWidth: 280 }}>
                                    <div style={{ fontSize: 11, color: '#939799', marginBottom: 2 }}>{g.id}</div>
                                    {g.name}
                                  </td>
                                  <td style={{ padding: '8px', color: '#939799', whiteSpace: 'nowrap' }}>{g.target}</td>
                                  <td style={{ padding: '8px', color: '#5E6366', whiteSpace: 'nowrap' }}>{g.result}</td>
                                  <td style={{ padding: '8px' }}><StatusBadge status={g.status} /></td>
                                  <td style={{ padding: '8px', color: '#0A7D3C', fontWeight: 600 }}>{fmt(g.target_valuation)}</td>
                                  <td style={{ padding: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                      <div style={{ width: 40, height: 3, background: '#FFFFFF', borderRadius: 2, overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${g.performance_score}%`, background: g.performance_score >= 80 ? '#00D65D' : g.performance_score >= 50 ? '#8A6D3B' : '#C0392B' }} />
                                      </div>
                                      <span style={{ color: '#5E6366', fontSize: 11 }}>{g.performance_score}</span>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Agent iterations */}
            {stage.agent_iterations?.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ color: '#939799', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
                  Agent Self-Corrections ({(stage.agent_iterations || []).length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {(stage.agent_iterations || []).map((iter, i) => (
                    <div key={i} style={{ background: '#FFFFFF', border: '1px solid #F7F8F9', borderRadius: 8, padding: '14px 16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                        <div>
                          <span style={{ color: '#939799', fontSize: 10, marginRight: 8 }}>#{iter.iteration_number}</span>
                          <span style={{ color: color, fontWeight: 600, fontSize: 13 }}>{iter.agent_name}</span>
                          <span style={{ color: '#939799', fontSize: 11, marginLeft: 8 }}>{iter.agent_role}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          {iter.human_required
                            ? <span style={{ background: 'rgba(138, 109, 59,0.1)', color: '#8A6D3B', border: '1px solid rgba(138, 109, 59,0.3)', padding: '2px 8px', borderRadius: 3, fontSize: 10, fontWeight: 700 }}>HUMAN REQUIRED</span>
                            : <span style={{ background: 'rgba(0, 214, 93,0.1)', color: '#0A7D3C', border: '1px solid rgba(0, 214, 93,0.3)', padding: '2px 8px', borderRadius: 3, fontSize: 10, fontWeight: 700 }}>AUTO-FIXED</span>
                          }
                          <span style={{ color: '#939799', fontSize: 11 }}>At risk: {iter.valuation_at_risk}</span>
                        </div>
                      </div>
                      <p style={{ color: '#777', fontSize: 12, lineHeight: 1.5, marginBottom: 8 }}>
                        <span style={{ color: '#C0392B', marginRight: 4 }}><Glyph name="cross" /></span>{iter.failure_description}
                      </p>
                      <p style={{ color: '#5E6366', fontSize: 12, lineHeight: 1.5, marginBottom: 8 }}>
                        <span style={{ color: '#0A7D3C', marginRight: 4 }}><Glyph name="check" /></span>{iter.fix_description}
                      </p>
                      <div style={{ display: 'flex', gap: 16, fontSize: 11 }}>
                        <span style={{ color: '#C0392B' }}>Before: {iter.before_state}</span>
                        <span style={{ color: '#939799' }}>→</span>
                        <span style={{ color: '#0A7D3C' }}>After: {iter.after_state}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Human touchpoints */}
            {stage.human_touchpoints?.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ color: '#939799', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
                  Human Touchpoints
                </div>
                {(stage.human_touchpoints || []).map((tp, i) => (
                  <div key={i} style={{ background: '#FFFFFF', border: '1px solid #F7F8F9', borderRadius: 8, padding: '14px 16px', marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ color: '#000000', fontWeight: 600, fontSize: 13 }}>#{tp.touchpoint_number} / {tp.person}</span>
                      <div style={{ display: 'flex', gap: 12, color: '#939799', fontSize: 12 }}>
                        <span>{tp.time_spent}</span>
                        <span style={{ color: '#8A6D3B' }}>{fmt(tp.cost)}</span>
                      </div>
                    </div>
                    <p style={{ color: '#5E6366', fontSize: 13, lineHeight: 1.5, marginBottom: 6 }}>{tp.description}</p>
                    <div style={{ borderLeft: '3px solid #00D65D', paddingLeft: 10 }}>
                      <p style={{ color: '#5E6366', fontSize: 12, margin: 0 }}>{tp.decision_made}</p>
                    </div>
                    {tp.agent_preparation && (
                      <p style={{ color: '#939799', fontSize: 12, marginTop: 8 }}>Agent prep: {tp.agent_preparation}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Stage scorecard */}
            {stage.stage_scorecard?.length > 0 && (
              <div>
                <div style={{ color: '#939799', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
                  Stage Scorecard
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table className="sim-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #E8E6E4' }}>
                        {['Criterion', 'Result', 'Target', 'Status', 'Valuation Impact'].map((h) => (
                          <th key={h} style={{ color: '#939799', padding: '8px 12px', textAlign: 'left', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(stage.stage_scorecard || []).map((row, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #FFFFFF' }}>
                          <td style={{ padding: '10px 12px', color: '#5E6366', fontWeight: i === (stage.stage_scorecard || []).length - 1 ? 700 : 400 }}>{row.criterion}</td>
                          <td style={{ padding: '10px 12px', color: '#000000', fontWeight: 600 }}>{row.result}</td>
                          <td style={{ padding: '10px 12px', color: '#939799' }}>{row.target}</td>
                          <td style={{ padding: '10px 12px' }}><StatusBadge status={row.status} /></td>
                          <td style={{ padding: '10px 12px', color: '#0A7D3C' }}>{row.valuation_impact || 'n/a'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Stage summary */}
            <div style={{ marginTop: 20, background: '#FFFFFF', border: `1px solid ${color}22`, borderRadius: 8, padding: '14px 16px', display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
              <div>
                <div style={{ color: '#939799', fontSize: 10, textTransform: 'uppercase' }}>Performance</div>
                <div style={{ color: '#0A7D3C', fontWeight: 700, fontSize: 18 }}>{stage.stage_summary?.performance_score}</div>
              </div>
              <div>
                <div style={{ color: '#939799', fontSize: 10, textTransform: 'uppercase' }}>Execution</div>
                <div style={{ color: '#0A7D3C', fontWeight: 700, fontSize: 18 }}>{stage.stage_summary?.execution_score}</div>
              </div>
              <div>
                <div style={{ color: '#939799', fontSize: 10, textTransform: 'uppercase' }}>Agent IWA</div>
                <div style={{ color: color, fontWeight: 700, fontSize: 18 }}>{stage.stage_summary?.agent_iwa}</div>
              </div>
              <div>
                <div style={{ color: '#939799', fontSize: 10, textTransform: 'uppercase' }}>Agent Cost</div>
                <div style={{ color: '#8A6D3B', fontWeight: 700, fontSize: 18 }}>{fmt(stage.stage_summary?.agent_cost || 0)}</div>
              </div>
              <div>
                <div style={{ color: '#939799', fontSize: 10, textTransform: 'uppercase' }}>Human Cost</div>
                <div style={{ color: '#5E6366', fontWeight: 700, fontSize: 18 }}>{fmt(stage.stage_summary?.human_cost || 0)}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SectionHeader>
  );
}
