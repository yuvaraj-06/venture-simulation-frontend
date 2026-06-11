// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import LockedSection from './LockedSection';
import { useVentureAccess as __useVentureAccess } from '@/lib/useVentureAccess';

// Safe render helper: ensures a value is always a string for JSX rendering
function safeStr(val: any): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (Array.isArray(val)) return val.filter(v => typeof v === 'string').join(', ');
  if (typeof val === 'object') {
    // Try common string fields
    const s = val.position_statement || val.statement || val.description || val.summary || val.text || val.message || val.name || val.title || val.primary_font || val.primary || '';
    if (s) return String(s);
    // Fallback to JSON
    try { return JSON.stringify(val); } catch { return '[complex object]'; }
  }
  return String(val);
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface IntelligenceData {
  domain: string;
  ventureId: string;
  brandDna: Record<string, unknown> | null;
  companyInfo: Record<string, unknown> | null;
  seoData: Record<string, unknown> | null;
  geoData: Record<string, unknown> | null;
  competitors: {
    polsia: Record<string, unknown> | null;
    dashboard: { competitors: Competitor[]; total: number } | null;
  };
  social: {
    dashboard: SocialData | null;
    polsia: Record<string, unknown> | null;
  };
  documents: Record<string, unknown> | null;
  patents: Record<string, unknown> | null;
  grants: Record<string, unknown> | null;
  investors: {
    dashboard: InvestorPipeline | null;
    polsia: Record<string, unknown> | null;
  };
  feed: FeedData | null;
  updates: UpdatesData | null;
  goals: GoalsData | null;
  metrics: MetricsData | null;
  hiring: HiringData | null;
  partnerships: Record<string, unknown> | null;
}

interface Competitor {
  name: string;
  domain?: string;
  description?: string;
  strengths?: string[];
  weaknesses?: string[];
  market_position?: string;
  funding?: string;
}

interface SocialData {
  semrush?: {
    monthly_visits?: string;
    global_rank?: string;
    monthly_growth?: number;
    traffic_source?: Record<string, number>;
    top_country?: string;
  };
  social?: {
    instagram?: string;
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
  social_stats?: Record<string, unknown>;
  icons?: Record<string, string>;
}

interface InvestorPipeline {
  pipeline: InvestorLead[];
  co_investors?: { name: string; is_lead: boolean; type: string }[];
  total_updates?: number;
}

interface InvestorLead {
  name?: string;
  firm?: string;
  status?: string;
  email?: string;
  stage?: string;
  amount?: string;
}

interface FeedData {
  company?: { name: string; stage: string; blurb?: string; tagline?: string };
  agents?: { items: AgentItem[] };
}

interface AgentItem {
  name: string;
  workstream: string;
  lastStatus: string;
  output: string;
  dateId: string;
  metrics?: Record<string, unknown>;
}

interface UpdatesData {
  updates: Record<string, WorkstreamUpdate[]>;
}

interface WorkstreamUpdate {
  update: string;
  date_id: string;
  stage: string;
  goal_count?: number;
  goals_complete?: number;
  goals_summary?: { name: string; status: string; performance_score: string; execution_score: string }[];
}

interface GoalsData {
  workstreams: { name: string; goals: { name: string; performanceScore: number; executionScore: number }[] }[];
}

interface MetricsData {
  currentValuation?: number;
  targetValuation?: number;
  semrush?: Record<string, unknown>;
  social?: Record<string, string>;
  roi?: string;
  total_investment?: string;
  total_spent?: string;
}

interface HiringData {
  employees?: { name: string; title: string; image_id?: string; link?: string }[];
  hiring_tasks?: { title: string; status?: string; description?: string }[];
  org_chart_size?: number;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function IntelCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: '#080808', border: '1px solid #1a1a1a', borderRadius: 8, padding: 20,
      ...style
    }}>
      {children}
    </div>
  );
}

function IntelLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ color: '#444', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 10 }}>
      {children}
    </div>
  );
}

function ScoreBar({ value, max = 100, color = '#00d4ff' }: { value: number; max?: number; color?: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ height: 4, background: '#1a1a1a', borderRadius: 2, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 2 }} />
    </div>
  );
}

function BrandDNASection({ data }: { data: Record<string, unknown> | null }) {
  if (!data || (data as { detail?: string }).detail) {
    return (
      <IntelCard>
        <IntelLabel>Brand DNA</IntelLabel>
        <p style={{ color: '#444', fontSize: 13 }}>No brand DNA data available yet. Run a brand analysis to populate this section.</p>
      </IntelCard>
    );
  }

  const raw = data as Record<string, unknown>;
  // Support multiple nesting levels: data.brand_dna.brand_dna (OS gen) or data.brand_dna (flat)
  const outerBd = (raw.brand_dna as Record<string, unknown>) || raw;
  const innerBd = (outerBd.brand_dna as Record<string, unknown>) || {};
  // Merge: prefer inner (OS-generated) over outer (API scrape)
  const bd = { ...outerBd, ...innerBd };
  const vi = (bd.visual_identity as Record<string, unknown>) || (outerBd.visual_identity as Record<string, unknown>) || {};
  const bv = (bd.brand_voice as Record<string, unknown>) || (outerBd.brand_voice as Record<string, unknown>) || {};
  const messaging = (bd.messaging as Record<string, unknown>) || {};
  const toneKw = Array.isArray(bv.tone_keywords) ? (bv.tone_keywords as string[]) : [];
  const bdValues = Array.isArray(bd.values) ? (bd.values as string[]) : toneKw;
  // Key messages: try bd.key_messages, then messaging.key_messages, then build from messaging.primary/secondary/value_props
  let keyMessages: string[] = [];
  if (Array.isArray(bd.key_messages)) {
    keyMessages = bd.key_messages as string[];
  } else if (Array.isArray(messaging.key_messages)) {
    keyMessages = messaging.key_messages as string[];
  } else {
    // Build from messaging object fields
    const msgParts: string[] = [];
    if (messaging.primary && typeof messaging.primary === 'string') msgParts.push(messaging.primary as string);
    if (messaging.secondary && typeof messaging.secondary === 'string') msgParts.push(messaging.secondary as string);
    if (Array.isArray(messaging.value_props)) {
      msgParts.push(...(messaging.value_props as any[]).map((v: any) => typeof v === 'string' ? v : safeStr(v)));
    }
    if (msgParts.length > 0) keyMessages = msgParts;
  }
  // USPs: try bd.usps, then messaging.value_props
  let usps: string[] = [];
  if (Array.isArray(bd.usps)) {
    usps = bd.usps as string[];
  } else if (Array.isArray(messaging.value_props) && keyMessages.length === 0) {
    // Only use value_props as USPs if they weren't already used as key messages
    usps = (messaging.value_props as any[]).map((v: any) => typeof v === 'string' ? v : safeStr(v));
  }
  // Personas can be array or dict
  let personas: any[] = [];
  if (Array.isArray(bd.target_personas)) {
    personas = bd.target_personas as any[];
  } else if (bd.target_personas && typeof bd.target_personas === 'object') {
    personas = Object.entries(bd.target_personas as Record<string, any>).map(([key, val]) => ({
      name: val?.title || key.replace(/_/g, ' '),
      description: val?.pain_point || val?.description || val?.company_type || JSON.stringify(val).slice(0, 150),
    }));
  }
  const themesRaw = Array.isArray(bd.content_themes) ? (bd.content_themes as any[]) : [];
  const themes: string[] = themesRaw.map((t: any) => typeof t === 'string' ? t : (t?.theme || t?.name || t?.title || safeStr(t)));
  const rawPalette = vi.color_palette;
  let colors: string[] = [];
  if (Array.isArray(rawPalette)) {
    colors = rawPalette as string[];
  } else if (rawPalette && typeof rawPalette === 'object') {
    // Extract color values from palette object
    colors = Object.values(rawPalette as Record<string, string>).filter(v => typeof v === 'string' && v.startsWith('#')).slice(0, 6);
  } else if (Array.isArray(vi.primary_colors) || Array.isArray(vi.secondary_colors)) {
    // Handle primary_colors + secondary_colors format
    const primary = Array.isArray(vi.primary_colors) ? (vi.primary_colors as string[]) : [];
    const secondary = Array.isArray(vi.secondary_colors) ? (vi.secondary_colors as string[]) : [];
    colors = [...primary, ...secondary].filter(v => typeof v === 'string' && (v.startsWith('#') || v.startsWith('rgb'))).slice(0, 8);
  } else {
    colors = [vi.primary_color, vi.secondary_color, vi.accent_color].filter(Boolean) as string[];
  }

  return (
    <div className="sim-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      {/* Visual Identity */}
      {colors.length > 0 && (
        <IntelCard>
          <IntelLabel>Visual Identity</IntelLabel>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            {colors.map((c: string, i: number) => (
              <div key={i} style={{ width: 32, height: 32, borderRadius: 6, background: c, border: '1px solid rgba(255,255,255,0.1)' }} title={c} />
            ))}
          </div>
          {vi.typography && <p style={{ color: '#888', fontSize: 12, lineHeight: 1.5 }}>{safeStr(vi.typography)}</p>}
        </IntelCard>
      )}

      {/* Brand Voice */}
      {(bv.description || bv.tone || bd.voice) && (
        <IntelCard>
          <IntelLabel>Brand Voice</IntelLabel>
          <p style={{ color: '#aaa', fontSize: 13, lineHeight: 1.6 }}>{safeStr(bv.description || bv.tone || bd.voice)}</p>
          {bv.personality && (
            <div style={{ marginTop: 8 }}>
              <span style={{ color: '#555', fontSize: 11 }}>Personality: </span>
              <span style={{ color: '#ccc', fontSize: 13 }}>{safeStr(bv.personality)}</span>
            </div>
          )}
          {bv.language_style && (
            <div style={{ marginTop: 6 }}>
              <span style={{ color: '#555', fontSize: 11 }}>Style: </span>
              <span style={{ color: '#ccc', fontSize: 13 }}>{safeStr(bv.language_style)}</span>
            </div>
          )}
          {bdValues.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
              {bdValues.map((v: string, i: number) => (
                <span key={i} style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', color: '#00d4ff', padding: '3px 10px', borderRadius: 20, fontSize: 12 }}>{v}</span>
              ))}
            </div>
          )}
        </IntelCard>
      )}

      {/* Key Messages */}
      {keyMessages.length > 0 && (
        <IntelCard>
          <IntelLabel>Key Messages</IntelLabel>
          {keyMessages.map((m: string, i: number) => (
            <div key={i} style={{ display: 'flex', gap: 8, padding: '6px 0', borderBottom: i < keyMessages.length - 1 ? '1px solid #1a1a1a' : 'none' }}>
              <span style={{ color: '#00d4ff', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
              <span style={{ color: '#aaa', fontSize: 13, lineHeight: 1.5 }}>{m}</span>
            </div>
          ))}
        </IntelCard>
      )}

      {/* USPs */}
      {usps.length > 0 && (
        <IntelCard>
          <IntelLabel>Unique Selling Points</IntelLabel>
          {usps.map((u: string, i: number) => (
            <div key={i} style={{ display: 'flex', gap: 8, padding: '6px 0' }}>
              <span style={{ color: '#00ff88', fontSize: 12 }}>✓</span>
              <span style={{ color: '#aaa', fontSize: 13, lineHeight: 1.5 }}>{u}</span>
            </div>
          ))}
        </IntelCard>
      )}

      {/* Target Personas */}
      {personas.length > 0 && (
        <IntelCard style={{ gridColumn: '1/-1' }}>
          <IntelLabel>Target Personas</IntelLabel>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {personas.map((p: any, i: number) => (
              <div key={i} style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 8, padding: 16, flex: '1 1 250px', minWidth: 200 }}>
                <div style={{ color: '#fff', fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{safeStr(p.name || '')}</div>
                <div style={{ color: '#888', fontSize: 12, lineHeight: 1.5 }}>{safeStr(p.description || '')}</div>
              </div>
            ))}
          </div>
        </IntelCard>
      )}

      {/* Competitive Positioning */}
      {bd.competitive_positioning && (
        <IntelCard style={{ gridColumn: '1/-1' }}>
          <IntelLabel>Competitive Positioning</IntelLabel>
          {typeof bd.competitive_positioning === 'object' && !Array.isArray(bd.competitive_positioning) ? (
            <div>
              {(bd.competitive_positioning as any).position_statement && <p style={{ color: '#aaa', fontSize: 13, lineHeight: 1.6, marginBottom: 10 }}>{String((bd.competitive_positioning as any).position_statement)}</p>}
              {(bd.competitive_positioning as any).category && <span style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', color: '#00d4ff', padding: '3px 10px', borderRadius: 20, fontSize: 11, marginRight: 8 }}>{String((bd.competitive_positioning as any).category)}</span>}
              {Array.isArray((bd.competitive_positioning as any).differentiators) && (
                <div style={{ marginTop: 10 }}>
                  {((bd.competitive_positioning as any).differentiators as any[]).slice(0, 5).map((d: any, i: number) => (
                    <div key={i} style={{ display: 'flex', gap: 8, padding: '4px 0' }}>
                      <span style={{ color: '#00ff88', fontSize: 12 }}>✓</span>
                      <span style={{ color: '#888', fontSize: 12 }}>{typeof d === 'string' ? d : (d?.feature || d?.name || d?.title || safeStr(d))}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p style={{ color: '#aaa', fontSize: 13, lineHeight: 1.6 }}>{safeStr(bd.competitive_positioning)}</p>
          )}
        </IntelCard>
      )}

      {/* Content Themes */}
      {themes.length > 0 && (
        <IntelCard>
          <IntelLabel>Content Themes</IntelLabel>
          {themes.map((t: string, i: number) => (
            <div key={i} style={{ color: '#aaa', fontSize: 13, padding: '4px 0', borderBottom: i < themes.length - 1 ? '1px solid #1a1a1a' : 'none' }}>{t}</div>
          ))}
        </IntelCard>
      )}

      {/* Brand Archetypes */}
      {bd.brand_archetypes && (
        <IntelCard style={{ gridColumn: '1/-1' }}>
          <IntelLabel>Brand Archetypes</IntelLabel>
          {Array.isArray(bd.brand_archetypes) ? (
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {(bd.brand_archetypes as any[]).map((arch: any, i: number) => {
                const isString = typeof arch === 'string';
                const name = isString ? arch : (arch.name || arch.archetype || 'Archetype');
                const desc = isString ? '' : (arch.description || arch.fit || '');
                return (
                  <div key={i} style={{ background: '#0d0d0d', border: `1px solid ${i === 0 ? 'rgba(0,212,255,0.3)' : '#1a1a1a'}`, borderRadius: 8, padding: 16, flex: '1 1 280px', minWidth: 240 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: desc ? 8 : 0 }}>
                      <div style={{ color: '#fff', fontSize: 15, fontWeight: 700 }}>{name}</div>
                      <span style={{ background: i === 0 ? 'rgba(0,212,255,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${i === 0 ? 'rgba(0,212,255,0.3)' : '#1a1a1a'}`, color: i === 0 ? '#00d4ff' : '#666', padding: '2px 10px', borderRadius: 20, fontSize: 10, fontWeight: 600 }}>
                        {i === 0 ? 'Primary' : 'Secondary'}
                      </span>
                    </div>
                    {desc && <p style={{ color: '#888', fontSize: 12, lineHeight: 1.6, margin: 0 }}>{desc}</p>}
                  </div>
                );
              })}
            </div>
          ) : typeof bd.brand_archetypes === 'object' ? (
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {(bd.brand_archetypes as any).primary && (
                <div style={{ background: '#0d0d0d', border: '1px solid rgba(0,212,255,0.3)', borderRadius: 8, padding: 16, flex: '1 1 280px', minWidth: 240 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ color: '#fff', fontSize: 15, fontWeight: 700 }}>{String((bd.brand_archetypes as any).primary)}</div>
                    <span style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', color: '#00d4ff', padding: '2px 10px', borderRadius: 20, fontSize: 10, fontWeight: 600 }}>Primary</span>
                  </div>
                </div>
              )}
              {(bd.brand_archetypes as any).secondary && (
                <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 8, padding: 16, flex: '1 1 280px', minWidth: 240 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ color: '#fff', fontSize: 15, fontWeight: 700 }}>{String((bd.brand_archetypes as any).secondary)}</div>
                    <span style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1a1a1a', color: '#666', padding: '2px 10px', borderRadius: 20, fontSize: 10, fontWeight: 600 }}>Secondary</span>
                  </div>
                </div>
              )}
              {(bd.brand_archetypes as any).rationale && (
                <p style={{ color: '#888', fontSize: 12, lineHeight: 1.6, width: '100%' }}>{String((bd.brand_archetypes as any).rationale)}</p>
              )}
            </div>
          ) : null}
        </IntelCard>
      )}

      {/* Legacy flat format fallback */}
      {bd.personality && !bv.description && !bv.tone ? (
        <IntelCard>
          <IntelLabel>Personality</IntelLabel>
          <p style={{ color: '#aaa', fontSize: 13, lineHeight: 1.6 }}>{safeStr(bd.personality)}</p>
        </IntelCard>
      ) : null}
      {bd.positioning && !bd.competitive_positioning ? (
        <IntelCard>
          <IntelLabel>Market Positioning</IntelLabel>
          <p style={{ color: '#aaa', fontSize: 13, lineHeight: 1.6 }}>{safeStr(bd.positioning)}</p>
        </IntelCard>
      ) : null}
      {(bd.tagline || messaging.tagline || (messaging.primary && typeof messaging.primary === 'string')) ? (
        <IntelCard style={{ gridColumn: '1/-1' }}>
          <IntelLabel>Tagline</IntelLabel>
          <p style={{ color: '#fff', fontSize: 18, fontWeight: 700, fontStyle: 'italic' }}>&ldquo;{safeStr(bd.tagline || messaging.tagline || messaging.primary)}&rdquo;</p>
        </IntelCard>
      ) : null}
    </div>
  );
}

function SEOGEOSection({ seo, geo }: { seo: Record<string, unknown> | null; geo: Record<string, unknown> | null }) {
  const seoScore = Number(seo?.overall_score || seo?.domain_authority || 0);
  const issues = Array.isArray(seo?.issues) ? (seo.issues as any[]) : [];
  // keywords can be: string[], {detected: [...]}, or [{keyword, volume, ...}]
  const rawKw = seo?.keywords;
  const keywordsRaw: any[] = Array.isArray(rawKw) ? rawKw : (rawKw as any)?.detected || [];
  const keywords: string[] = keywordsRaw.map((kw: any) => typeof kw === 'string' ? kw : (kw?.keyword || kw?.term || String(kw)));
  const recommendationsRaw = Array.isArray(seo?.recommendations) ? (seo.recommendations as any[]) : [];
  const recommendations: string[] = recommendationsRaw.map((r: any) => typeof r === 'string' ? r : (r?.recommendation || r?.description || r?.message || JSON.stringify(r)));
  const geoScore = Number(geo?.overall_score || geo?.score || 0);
  const platforms = Array.isArray(geo?.platforms) ? (geo.platforms as any[]) : [];
  const geoRecsRaw = Array.isArray(geo?.recommendations) ? (geo.recommendations as any[]) : [];
  const geoRecs: string[] = geoRecsRaw.map((r: any) => typeof r === 'string' ? r : (r?.recommendation || r?.description || r?.message || JSON.stringify(r)));

  return (
    <div className="sim-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <IntelCard>
        <IntelLabel>SEO Audit</IntelLabel>
        {!seo || seoScore === 0 ? (
          <p style={{ color: '#444', fontSize: 13 }}>No SEO data available.</p>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', border: `3px solid ${seoScore >= 70 ? '#00ff88' : seoScore >= 40 ? '#ff8800' : '#ff3333'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 22, fontWeight: 800, color: seoScore >= 70 ? '#00ff88' : seoScore >= 40 ? '#ff8800' : '#ff3333' }}>{seoScore}</span>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>Overall Score</div>
                <div style={{ fontSize: 12, color: '#666' }}>{seoScore >= 70 ? 'Good' : seoScore >= 40 ? 'Needs Work' : 'Critical Issues'}</div>
              </div>
            </div>
            {/* Score breakdown */}
            {[
              { label: 'Content', val: seo?.content_score },
              { label: 'On-Page', val: seo?.on_page_score },
              { label: 'Mobile', val: seo?.mobile_score },
              { label: 'Page Speed', val: seo?.page_speed },
            ].filter(s => s.val && typeof s.val !== 'object').map((s, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #1a1a1a' }}>
                <span style={{ color: '#888', fontSize: 12 }}>{s.label}</span>
                <span style={{ color: '#aaa', fontSize: 12, fontWeight: 600 }}>{String(s.val)}</span>
              </div>
            ))}
            {issues.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ color: '#666', fontSize: 11, textTransform: 'uppercase', marginBottom: 6 }}>Issues ({issues.length})</div>
                {issues.slice(0, 5).map((issue: any, i: number) => (
                  <div key={i} style={{ fontSize: 12, color: '#aaa', padding: '4px 0', borderBottom: '1px solid #111', display: 'flex', gap: 6 }}>
                    <span style={{ color: issue?.severity === 'critical' ? '#ff3333' : '#ff8800', flexShrink: 0 }}>●</span>
                    <span>{typeof issue === 'string' ? issue : String(issue?.issue || issue?.description || issue?.message || '')}</span>
                  </div>
                ))}
              </div>
            )}
            {keywords.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ color: '#666', fontSize: 11, textTransform: 'uppercase', marginBottom: 6 }}>Keywords</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {keywords.slice(0, 10).map((kw: string, i: number) => (
                    <span key={i} style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', color: '#666', padding: '2px 8px', borderRadius: 3, fontSize: 11 }}>{kw}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </IntelCard>
      <IntelCard>
        <IntelLabel>GEO / AI Search Visibility</IntelLabel>
        {!geo || geoScore === 0 ? (
          <p style={{ color: '#444', fontSize: 13 }}>No GEO data available.</p>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', border: `3px solid ${geoScore >= 50 ? '#00ff88' : geoScore >= 20 ? '#ff8800' : '#ff3333'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 22, fontWeight: 800, color: geoScore >= 50 ? '#00ff88' : geoScore >= 20 ? '#ff8800' : '#ff3333' }}>{geoScore}</span>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>AI Visibility Score</div>
                <div style={{ fontSize: 12, color: '#666' }}>{geoScore >= 50 ? 'Visible' : geoScore >= 20 ? 'Low Visibility' : 'Not Visible'}</div>
              </div>
            </div>
            {platforms.map((p: any, i: number) => (
              <div key={i} style={{ padding: '10px 0', borderBottom: i < platforms.length - 1 ? '1px solid #1a1a1a' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{p.name}</span>
                  <span style={{ color: p.score >= 50 ? '#00ff88' : p.score >= 20 ? '#ff8800' : '#ff3333', fontSize: 13, fontWeight: 700 }}>{p.score}/100</span>
                </div>
                <p style={{ color: '#666', fontSize: 11, lineHeight: 1.4, margin: 0 }}>{p.summary?.slice(0, 150)}{p.summary?.length > 150 ? '...' : ''}</p>
              </div>
            ))}
            {geoRecs.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ color: '#666', fontSize: 11, textTransform: 'uppercase', marginBottom: 6 }}>Recommendations</div>
                {geoRecs.slice(0, 3).map((r: string, i: number) => (
                  <div key={i} style={{ fontSize: 12, color: '#aaa', padding: '4px 0', display: 'flex', gap: 6 }}>
                    <span style={{ color: '#00d4ff', flexShrink: 0 }}>→</span><span>{r}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </IntelCard>
    </div>
  );
}

function CompetitorsSection({ competitors }: { competitors: IntelligenceData['competitors'] }) {
  const list: Competitor[] = [
    ...((competitors.dashboard?.competitors) || []),
    ...((competitors.polsia as { competitors?: Competitor[] })?.competitors || []),
  ];

  if (list.length === 0) {
    return (
      <IntelCard>
        <IntelLabel>Competitive Landscape</IntelLabel>
        <p style={{ color: '#444', fontSize: 13 }}>No competitor data found. Run a competitor analysis to populate.</p>
      </IntelCard>
    );
  }

  // Competitive gaps from polsia
  const polsiaData = competitors.polsia as any;
  const competitiveAdvantages = Array.isArray(polsiaData?.competitive_advantages) ? polsiaData.competitive_advantages : [];
  const gaps = Array.isArray(polsiaData?.gaps) ? polsiaData.gaps : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Competitive Advantages & Gaps */}
      {(competitiveAdvantages.length > 0 || gaps.length > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {competitiveAdvantages.length > 0 && (
            <IntelCard>
              <IntelLabel>Competitive Advantages</IntelLabel>
              {competitiveAdvantages.map((a: string, i: number) => (
                <div key={i} style={{ color: '#aaa', fontSize: 12, padding: '5px 0', display: 'flex', gap: 6, borderBottom: i < competitiveAdvantages.length - 1 ? '1px solid #111' : 'none' }}>
                  <span style={{ color: '#00ff88', flexShrink: 0 }}>✓</span><span>{a}</span>
                </div>
              ))}
            </IntelCard>
          )}
          {gaps.length > 0 && (
            <IntelCard>
              <IntelLabel>Competitive Gaps</IntelLabel>
              {gaps.map((g: string, i: number) => (
                <div key={i} style={{ color: '#aaa', fontSize: 12, padding: '5px 0', display: 'flex', gap: 6, borderBottom: i < gaps.length - 1 ? '1px solid #111' : 'none' }}>
                  <span style={{ color: '#ff4444', flexShrink: 0 }}>!</span><span>{g}</span>
                </div>
              ))}
            </IntelCard>
          )}
        </div>
      )}
      {/* Competitor Cards */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
      {list.map((c: any, i: number) => {
        const domain = c.domain || c.website || '';
        const desc = c.description || c.features || '';
        const strengths = c.strengths || c.pros || [];
        const weaknesses = c.weaknesses || c.cons || [];
        const threat = c.threat_level || c.market_position || '';
        const similarity = c.similarity_score || c.similarity || 0;
        const threatColor = threat === 'high' ? '#ff3333' : threat === 'medium' ? '#ff8800' : '#00ff88';
        return (
          <IntelCard key={i}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>{c.name}</div>
                {domain && <a href={domain.startsWith('http') ? domain : `https://${domain}`} target="_blank" rel="noopener noreferrer" style={{ color: '#444', fontSize: 11, textDecoration: 'none' }}>{domain} ↗</a>}
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                {similarity > 0 && <span style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', color: '#00d4ff', padding: '2px 8px', borderRadius: 3, fontSize: 10 }}>{similarity}% similar</span>}
                {threat && <span style={{ background: `${threatColor}15`, border: `1px solid ${threatColor}44`, color: threatColor, padding: '2px 8px', borderRadius: 3, fontSize: 10 }}>{threat}</span>}
              </div>
            </div>
            {desc && <p style={{ color: '#888', fontSize: 12, lineHeight: 1.5, marginBottom: 10 }}>{desc}</p>}
            {Array.isArray(strengths) && strengths.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                <div style={{ color: '#00ff88', fontSize: 10, letterSpacing: '0.1em', marginBottom: 4 }}>STRENGTHS</div>
                {strengths.slice(0, 3).map((s: string, j: number) => (
                  <div key={j} style={{ color: '#888', fontSize: 12, padding: '2px 0 2px 8px', borderLeft: '2px solid #00ff8833' }}>{s}</div>
                ))}
              </div>
            )}
            {Array.isArray(weaknesses) && weaknesses.length > 0 && (
              <div>
                <div style={{ color: '#ff4444', fontSize: 10, letterSpacing: '0.1em', marginBottom: 4 }}>WEAKNESSES</div>
                {weaknesses.slice(0, 3).map((w: string, j: number) => (
                  <div key={j} style={{ color: '#888', fontSize: 12, padding: '2px 0 2px 8px', borderLeft: '2px solid #ff444433' }}>{w}</div>
                ))}
              </div>
            )}
            {c.pricing && <div style={{ marginTop: 8, color: '#666', fontSize: 11 }}>Pricing: {typeof c.pricing === 'string' ? c.pricing : `${c.pricing.model || ''} ${c.pricing.details ? '— ' + c.pricing.details : ''}`.trim()}</div>}
            {c.funding && <div style={{ marginTop: 4, color: '#00d4ff', fontSize: 12 }}>{c.funding}</div>}
          </IntelCard>
        );
      })}
    </div>
    </div>
  );
}

function PatentsGrantsSection({ patents, grants }: { patents: Record<string, unknown> | null; grants: Record<string, unknown> | null }) {
  const patentList = Array.isArray((patents as any)?.patents) ? (patents as any).patents : [];
  const grantList = Array.isArray((grants as any)?.grants) ? (grants as any).grants : [];
  const whitespaces = Array.isArray((patents as any)?.white_spaces) ? (patents as any).white_spaces : [];
  const landscape = (patents as any)?.technology_landscape;
  const [showAllPatents, setShowAllPatents] = useState(false);
  const [showAllGrants, setShowAllGrants] = useState(false);
  const INITIAL_SHOW = 5;

  const visiblePatents = showAllPatents ? patentList : patentList.slice(0, INITIAL_SHOW);
  const visibleGrants = showAllGrants ? grantList : grantList.slice(0, INITIAL_SHOW);

  return (
    <div className="sim-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      {/* Patents */}
      <IntelCard>
        <IntelLabel>Patents ({patentList.length})</IntelLabel>
        {patentList.length === 0 ? (
          <p style={{ color: '#444', fontSize: 13 }}>No patent data available.</p>
        ) : (
          <div>
            {landscape && typeof landscape === 'string' && <p style={{ color: '#888', fontSize: 12, marginBottom: 12, lineHeight: 1.5 }}>{landscape.slice(0, 200)}</p>}
            {visiblePatents.map((p: any, i: number) => (
              <div key={i} style={{ padding: '10px 0', borderBottom: i < visiblePatents.length - 1 ? '1px solid #1a1a1a' : 'none' }}>
                <div style={{ color: '#fff', fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{p.title || 'Untitled Patent'}</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                  {p.patent_number && <span style={{ color: '#00d4ff', fontSize: 11 }}>{p.patent_number}</span>}
                  {p.assignee && p.assignee !== 'Not specified' && <span style={{ color: '#666', fontSize: 11 }}>· {p.assignee}</span>}
                  {p.filing_date && <span style={{ color: '#444', fontSize: 11 }}>· Filed {p.filing_date}</span>}
                </div>
                {p.abstract && <p style={{ color: '#666', fontSize: 11, lineHeight: 1.4, margin: 0 }}>{String(p.abstract).slice(0, 120)}...</p>}
                {p.url && <a href={p.url} target="_blank" rel="noopener noreferrer" style={{ color: '#3B82F6', fontSize: 11, textDecoration: 'none' }}>View patent ↗</a>}
              </div>
            ))}
            {patentList.length > INITIAL_SHOW && (
              <button
                onClick={() => setShowAllPatents(!showAllPatents)}
                style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.15)', color: '#00d4ff', padding: '8px 16px', borderRadius: 6, fontSize: 12, cursor: 'pointer', width: '100%', marginTop: 10, fontWeight: 500 }}
              >
                {showAllPatents ? 'Show less' : `View all ${patentList.length} patents ↓`}
              </button>
            )}
          </div>
        )}
        {whitespaces.length > 0 && (
          <div style={{ marginTop: 12, borderTop: '1px solid #1a1a1a', paddingTop: 12 }}>
            <div style={{ color: '#00ff88', fontSize: 10, letterSpacing: '0.1em', marginBottom: 6 }}>WHITE SPACES (IP Opportunities)</div>
            {whitespaces.slice(0, 5).map((ws: any, i: number) => (
              <div key={i} style={{ color: '#888', fontSize: 12, padding: '3px 0', display: 'flex', gap: 6 }}>
                <span style={{ color: '#00ff88', flexShrink: 0 }}>◇</span>
                <span>{typeof ws === 'string' ? ws : ws.area || ws.description || JSON.stringify(ws)}</span>
              </div>
            ))}
          </div>
        )}
      </IntelCard>

      {/* Grants */}
      <IntelCard>
        <IntelLabel>Open Grants ({grantList.length})</IntelLabel>
        {grantList.length === 0 ? (
          <p style={{ color: '#444', fontSize: 13 }}>No grant data available.</p>
        ) : (
          <div>
            {visibleGrants.map((g: any, i: number) => (
              <div key={i} style={{ padding: '12px 0', borderBottom: i < visibleGrants.length - 1 ? '1px solid #1a1a1a' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <div style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{g.name || 'Unnamed Grant'}</div>
                  {g.url && (
                    <a href={g.url} target="_blank" rel="noopener noreferrer"
                      style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', color: '#3B82F6', padding: '3px 10px', borderRadius: 4, fontSize: 11, textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>
                      Apply ↗
                    </a>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 6 }}>
                  {g.agency && <span style={{ color: '#00d4ff', fontSize: 11 }}>{g.agency}</span>}
                  {g.amount && <span style={{ color: '#00ff88', fontSize: 11, fontWeight: 600 }}>{g.amount}</span>}
                  {g.deadline && (
                    <span style={{ color: new Date(g.deadline) < new Date() ? '#ff3333' : '#ff8800', fontSize: 11 }}>
                      Deadline: {safeStr(g.deadline)}
                    </span>
                  )}
                  {g.category && <span style={{ background: 'rgba(255,255,255,0.04)', color: '#666', padding: '1px 6px', borderRadius: 3, fontSize: 10 }}>{g.category}</span>}
                </div>
                {g.description && <p style={{ color: '#888', fontSize: 12, lineHeight: 1.4, margin: 0 }}>{String(g.description).slice(0, 150)}{g.description.length > 150 ? '...' : ''}</p>}
                {g.eligibility && <p style={{ color: '#555', fontSize: 11, lineHeight: 1.4, margin: '4px 0 0' }}>Eligibility: {String(g.eligibility).slice(0, 100)}</p>}
                {g.relevance_score && <div style={{ marginTop: 4 }}><span style={{ background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.2)', color: '#00ff88', padding: '1px 6px', borderRadius: 3, fontSize: 10 }}>{g.relevance_score}% relevant</span></div>}
              </div>
            ))}
            {grantList.length > INITIAL_SHOW && (
              <button
                onClick={() => setShowAllGrants(!showAllGrants)}
                style={{ background: 'rgba(255,204,0,0.06)', border: '1px solid rgba(255,204,0,0.15)', color: '#ffcc00', padding: '8px 16px', borderRadius: 6, fontSize: 12, cursor: 'pointer', width: '100%', marginTop: 10, fontWeight: 500 }}
              >
                {showAllGrants ? 'Show less' : `View all ${grantList.length} grants ↓`}
              </button>
            )}
          </div>
        )}
      </IntelCard>
    </div>
  );
}

function SocialSection({ social }: { social: IntelligenceData['social'] }) {
  const dashboard = social?.dashboard as any;
  const polsia = social?.polsia as any;
  // Only show data if there's REAL social stats (not just icons/empty objects)
  const hasRealDashboard = dashboard?.semrush?.monthly_visits || dashboard?.social_stats?.instagram || dashboard?.social_stats?.twitter;
  const hasRealPolsia = polsia?.platforms?.length > 0 || (polsia?.posts?.length > 0);
  const data = hasRealPolsia ? polsia : (hasRealDashboard ? dashboard : null);
  if (!data) {
    return (
      <IntelCard>
        <IntelLabel>Social Analytics</IntelLabel>
        <p style={{ color: '#444', fontSize: 13 }}>No social analytics data available. Run social analysis to populate.</p>
      </IntelCard>
    );
  }

  const semrush = data.semrush;
  const links = data.social || {};
  const trafficSource = semrush?.traffic_source || {};

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      {semrush && (
        <IntelCard>
          <IntelLabel>Web Traffic (SemRush)</IntelLabel>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            {[
              { label: 'Monthly Visits', value: semrush.monthly_visits, color: '#00d4ff' },
              { label: 'Global Rank', value: semrush.global_rank ? `#${semrush.global_rank}` : '--', color: '#00ff88' },
              { label: 'MoM Growth', value: `${semrush.monthly_growth || 0}%`, color: '#ff8800' },
              { label: 'Top Country', value: semrush.top_country || '--', color: '#fff' },
            ].map((m) => (
              <div key={m.label} style={{ background: '#0d0d0d', border: '1px solid #151515', borderRadius: 6, padding: '10px 12px' }}>
                <div style={{ color: '#444', fontSize: 10, marginBottom: 4 }}>{m.label}</div>
                <div style={{ color: m.color, fontWeight: 700, fontSize: 16 }}>{String(m.value)}</div>
              </div>
            ))}
          </div>
          {Object.keys(trafficSource).length > 0 && (
            <div>
              <div style={{ color: '#444', fontSize: 10, marginBottom: 8 }}>TRAFFIC SOURCES</div>
              {Object.entries(trafficSource).sort((a, b) => b[1] - a[1]).map(([src, pct]) => (
                <div key={src} style={{ display: 'grid', gridTemplateColumns: '90px 1fr 32px', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ color: '#666', fontSize: 11, textTransform: 'capitalize' }}>{src}</span>
                  <div style={{ height: 3, background: '#111', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: '#00d4ff' }} />
                  </div>
                  <span style={{ color: '#00d4ff', fontSize: 11, textAlign: 'right' }}>{pct}%</span>
                </div>
              ))}
            </div>
          )}
        </IntelCard>
      )}
      <IntelCard>
        <IntelLabel>Social Profiles</IntelLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {Object.entries(links).filter(([, v]) => v).map(([platform, url]) => (
            <a key={platform} href={url} target="_blank" rel="noopener noreferrer" style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 6, padding: '10px 14px',
              textDecoration: 'none', transition: 'border-color 0.15s',
            }}>
              <span style={{ color: '#00d4ff', fontSize: 13, fontWeight: 600, textTransform: 'capitalize', width: 80 }}>{platform}</span>
              <span style={{ color: '#555', fontSize: 12, wordBreak: 'break-all' }}>{url}</span>
            </a>
          ))}
          {Object.values(links).filter(Boolean).length === 0 && (
            <p style={{ color: '#444', fontSize: 13 }}>No social profiles configured.</p>
          )}
        </div>
      </IntelCard>
    </div>
  );
}

function GoalsSection({ goals }: { goals: GoalsData | null }) {
  if (!goals?.workstreams) {
    return (
      <IntelCard>
        <IntelLabel>Goals Overview</IntelLabel>
        <p style={{ color: '#444', fontSize: 13 }}>No goals data available.</p>
      </IntelCard>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {goals.workstreams.map((ws, i) => (
        <IntelCard key={i}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <IntelLabel>{ws.name}</IntelLabel>
            <span style={{ color: '#555', fontSize: 12 }}>{ws.goals?.length || 0} goals</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {(ws.goals || []).slice(0, 5).map((g, j) => (
              <div key={j} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px', gap: 8, alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #111' }}>
                <span style={{ color: '#888', fontSize: 12 }}>{g.name}</span>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#444', fontSize: 10 }}>PERF</div>
                  <div style={{ color: g.performanceScore >= 60 ? '#00ff88' : g.performanceScore >= 30 ? '#ff8800' : '#ff4444', fontSize: 12, fontWeight: 700 }}>{g.performanceScore}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#444', fontSize: 10 }}>EXEC</div>
                  <div style={{ color: '#00d4ff', fontSize: 12, fontWeight: 700 }}>{g.executionScore}</div>
                </div>
              </div>
            ))}
          </div>
        </IntelCard>
      ))}
    </div>
  );
}

function InvestorSection({ investors }: { investors: IntelligenceData['investors'] }) {
  const pipeline = investors.dashboard?.pipeline || [];
  const coInvestors = investors.dashboard?.co_investors || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {coInvestors.length > 0 && (
        <IntelCard>
          <IntelLabel>Current Investors</IntelLabel>
          <div style={{ display: 'flex', flex: 1, gap: 10, flexWrap: 'wrap' }}>
            {coInvestors.map((inv, i) => (
              <div key={i} style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 6, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                {inv.is_lead && <span style={{ background: 'rgba(0,212,255,0.1)', color: '#00d4ff', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 3, padding: '1px 6px', fontSize: 9, fontWeight: 700 }}>LEAD</span>}
                <span style={{ color: '#aaa', fontSize: 13 }}>{inv.name}</span>
              </div>
            ))}
          </div>
        </IntelCard>
      )}

      {pipeline.length > 0 ? (
        <IntelCard>
          <IntelLabel>Investor Pipeline</IntelLabel>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1a1a1a' }}>
                  {['Name', 'Firm', 'Stage', 'Amount', 'Status'].map(h => (
                    <th key={h} style={{ color: '#444', padding: '6px 10px', textAlign: 'left', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pipeline.map((lead, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #0d0d0d' }}>
                    <td style={{ padding: '8px 10px', color: '#aaa' }}>{lead.name || '--'}</td>
                    <td style={{ padding: '8px 10px', color: '#666' }}>{lead.firm || '--'}</td>
                    <td style={{ padding: '8px 10px', color: '#888' }}>{lead.stage || '--'}</td>
                    <td style={{ padding: '8px 10px', color: '#00d4ff' }}>{lead.amount || '--'}</td>
                    <td style={{ padding: '8px 10px' }}>
                      <span style={{
                        background: lead.status === 'committed' ? 'rgba(0,255,136,0.1)' : 'rgba(255,136,0,0.1)',
                        color: lead.status === 'committed' ? '#00ff88' : '#ff8800',
                        border: `1px solid ${lead.status === 'committed' ? 'rgba(0,255,136,0.3)' : 'rgba(255,136,0,0.3)'}`,
                        padding: '2px 8px', borderRadius: 3, fontSize: 10, fontWeight: 700
                      }}>{lead.status || 'active'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </IntelCard>
      ) : (
        <IntelCard>
          <IntelLabel>Investor Pipeline</IntelLabel>
          <p style={{ color: '#444', fontSize: 13 }}>No investor pipeline data. Leads will appear here as they are added.</p>
        </IntelCard>
      )}
    </div>
  );
}

function ActionChatPanel({ item, onClose, ventureId }: { item: any; onClose: () => void; ventureId?: string }) {
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = { current: null as HTMLDivElement | null };

  // Build context-aware initial message and pre-filled input
  useEffect(() => {
    const action = item.actionLabel || item.action || 'Review';
    const title = item.title || item.goalName || item.headline?.split(':')[0] || item.subject || item.avatar_name || item.source || '';
    const desc = item.description || item.script || item.content || item.preview || '';
    const section = item.chatSection || item.source || '';

    let greeting = '';
    let prefill = '';
    const quickActions: string[] = [];

    if (action === 'Fix' || action === 'Fix Now') {
      const sev = item.severity || 'High';
      const cat = item.category || 'SEO';
      greeting = `🔧 **${sev} ${cat} Issue**\n\n${title}\n\n${desc ? desc + '\n\n' : ''}I can fix this issue on the ${ventureId || ''} website. Hit Send to proceed or edit the instruction.`;
      prefill = `Fix this ${sev.toLowerCase()} ${cat} issue on ${ventureId}'s website: "${title}". Update the code/content to resolve this and verify the fix.`;
      quickActions.push('Fix it now', 'Show me what needs to change', 'Fix all critical issues', 'Skip this one');
    } else if (action === 'Post') {
      if (section === 'LinkedIn' || item.chatSection === 'linkedin') {
        greeting = `📝 **LinkedIn Post Ready**\n\nAuthor: ${item.author || 'CEO'}\n\n"${desc?.slice(0, 300)}"\n\nI'll publish this to the ${item.author || 'CEO'}'s LinkedIn profile.`;
        prefill = `Publish this LinkedIn post to ${item.author || 'CEO'}'s profile for ${ventureId}:\n\n"${desc?.slice(0, 250)}"`;
        quickActions.push('Publish now', 'Schedule for tomorrow 9am', 'Rewrite for more engagement', 'Add relevant hashtags');
      } else if (item.chatSection === 'hn') {
        greeting = `🟧 **Hacker News Comment**\n\nPost: "${title}"\nURL: ${item.url || ''}\n\nI'll draft a thoughtful comment on this HN thread that subtly positions ${ventureId} as relevant to the discussion.`;
        prefill = `Write a helpful, non-promotional comment on this Hacker News post: "${title}" (${item.url || ''}). The comment should add genuine value to the discussion while naturally mentioning ${ventureId}'s approach to this problem. Keep it authentic, no hard sell.`;
        quickActions.push('Write the comment', 'Make it more technical', 'Make it shorter', 'Draft a Show HN post instead');
      } else if (item.chatSection === 'reddit') {
        greeting = `🟠 **Reddit Reply**\n\nPost: "${title}"\nSubreddit: ${item.subreddit || 'r/startup'} | ▲${item.upvotes || 0} | 💬${item.comments || 0}\n\nI'll draft a reply that adds value while positioning ${ventureId}.`;
        prefill = `Write a helpful Reddit reply for ${item.subreddit || 'the thread'} post: "${title}". The reply should genuinely answer the question or add to the discussion. Mention ${ventureId} naturally only if relevant. Do not sound like an ad. Match the subreddit's tone.`;
        quickActions.push('Write helpful reply', 'Write technical reply', 'Just observe, skip posting', 'Find similar threads');
      } else if (item.chatSection === 'x') {
        greeting = `𝕏 **Tweet Draft**\n\n"${item.text || desc}"\n\nI'll post this tweet from ${ventureId}'s X account.`;
        prefill = `Post this tweet from ${ventureId}'s X account:\n\n"${item.text || desc?.slice(0, 250)}"\n\nOptimize for engagement. Add relevant hashtags if appropriate.`;
        quickActions.push('Post as-is', 'Make it punchier', 'Add a thread (3 tweets)', 'Generate 3 variations to A/B test');
      } else {
        greeting = `📋 **Content Ready**\n\n"${title}"\n\nReady to publish.`;
        prefill = `Publish this content for ${ventureId}: "${title}"`;
        quickActions.push('Publish now', 'Edit first', 'Schedule for later');
      }
    } else if (action === 'Write') {
      greeting = `✏️ **Article Brief**\n\nTopic: "${title}"\nCategory: ${item.topic || 'Growth'}\n\nI'll write a full SEO-optimized article targeting this topic for ${ventureId}'s blog.`;
      prefill = `Write a 1000-word SEO-optimized blog article for ${ventureId} about: "${title}". Target keyword: "${title.split(' ').slice(0, 4).join(' ')}". Include: compelling intro, 3-4 subheadings, actionable takeaways, and a CTA to try ${ventureId}. Category: ${item.topic || 'Growth'}.`;
      quickActions.push('Write full article', 'Create outline first', 'Generate 5 headline options', 'Write as a listicle instead');
    } else if (action === 'Send') {
      greeting = `✉️ **Email Ready to Send**\n\nTo: ${item.to || 'recipients'}\nSubject: ${item.subject || title}\n\n"${desc?.slice(0, 300)}"\n\nI'll send this email through the configured email provider.`;
      prefill = `Send this email for ${ventureId}:\nTo: ${item.to || 'recipients'}\nSubject: "${item.subject || title}"\nBody: "${desc?.slice(0, 300)}"\n\nPersonalize the [Name] and [domain] placeholders before sending.`;
      quickActions.push('Send now', 'Personalize and send', 'A/B test subject line', 'Schedule for 9am tomorrow');
    } else if (action === 'Edit') {
      greeting = `✏️ **Edit Draft**\n\n"${desc?.slice(0, 300)}"\n\nI'll update this draft based on your feedback.`;
      prefill = `Edit this draft for ${ventureId}: "${desc?.slice(0, 200)}". Make it more ${item.chatSection === 'email' ? 'personal and compelling' : item.chatSection === 'linkedin' ? 'engaging with a stronger hook' : 'concise and impactful'}.`;
      quickActions.push('Make it shorter', 'Make it more compelling', 'Change the tone', 'Rewrite completely');
    } else if (action === 'Publish') {
      greeting = `📤 **LinkedIn Post**\n\nAuthor: ${item.author || 'CEO'}\n\n"${desc?.slice(0, 300)}"\n\nI'll publish this to LinkedIn.`;
      prefill = `Publish this LinkedIn post as ${item.author || 'CEO'} for ${ventureId}:\n\n"${desc?.slice(0, 250)}"\n\nOptimize posting time for maximum reach.`;
      quickActions.push('Publish now', 'Schedule for peak hours (Tue/Wed 8-10am)', 'Add an image/carousel', 'Rewrite the hook');
    } else if (action === 'Kickoff') {
      const details = (item.details || []).filter((d: string) => !d?.startsWith('Attributed'));
      greeting = `🚀 **Goal Kickoff: ${title}**\n\nThis goal hasn't started yet. Here's the recommended plan:\n\n${details.map((d: string, i: number) => `${i + 1}. ${d}`).join('\n')}\n\nShould I proceed?`;
      prefill = `Kickoff goal "${title}" for ${ventureId}. Create the first milestone, assign tasks, set deadlines for the next 2 weeks, and begin execution. Report back with the plan.`;
      quickActions.push('Yes, start now', 'Show me the full timeline first', 'Who should own this goal?', 'Deprioritize this');
    } else if (action === 'Intervene') {
      const details = (item.details || []).filter((d: string) => !d?.startsWith('Attributed'));
      greeting = `⚠️ **Goal Behind Target: ${title}**\n\nPerformance: ${item.performanceScore || 0}% | Execution: ${item.executionScore || 0}%\n\n${details.map((d: string, i: number) => `${i + 1}. ${d}`).join('\n')}\n\nWhat should I prioritize?`;
      prefill = `Intervene on "${title}" for ${ventureId}. Current performance is ${item.performanceScore || 0}%. Identify the top 3 blockers, propose fixes for each, and reallocate resources to get this goal back on track within 2 weeks.`;
      quickActions.push('Identify and fix blockers', 'Extend the deadline', 'Reassign to a different agent', 'Deprioritize this goal');
    } else if (action === 'Review') {
      greeting = `📋 **Review: ${title}**\n\n${desc || 'Ready for your review.'}\n\nWhat would you like me to do with this?`;
      prefill = `Review "${title}" for ${ventureId}. Summarize the current status, highlight what needs attention, and recommend next steps.`;
      quickActions.push('Approve as-is', 'Suggest improvements', 'Escalate to team', 'Mark as done');
    } else {
      greeting = `📋 **${title}**\n\n${desc || 'Ready for action.'}\n\nWhat would you like me to do?`;
      prefill = `Act on "${title}" for ${ventureId}. Provide details and execute.`;
      quickActions.push('Proceed', 'Tell me more', 'Skip', 'Assign to someone');
    }

    setMessages([{ role: 'agent', text: greeting }]);
    setInput(prefill);
    // Store quick actions on item for rendering
    item._quickActions = quickActions;
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend() {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const body: any = { message: userMsg };
      if (ventureId) body.venture_id = ventureId;
      if (sessionId) body.session_id = sessionId;

      const resp = await fetch('https://clawapi.shareos.ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await resp.json();
      if (data.session_id) setSessionId(data.session_id);
      setMessages(prev => [...prev, { role: 'agent', text: data.response || data.message || 'Done.' }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'agent', text: '⚠️ Failed to connect to agent. Please try again.' }]);
    }
    setLoading(false);
  }

  const quickActions = item._quickActions || ['Yes, proceed', 'Show details', 'Skip'];

  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, bottom: 0, width: 440,
      background: '#0a0a0a', borderLeft: '1px solid #1a1a1a',
      zIndex: 10000, display: 'flex', flexDirection: 'column',
      boxShadow: '-8px 0 30px rgba(0,0,0,0.6)',
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 20px', borderBottom: '1px solid #1a1a1a',
        display: 'flex', alignItems: 'center', gap: 12, background: '#080808',
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: `${item.sourceColor || '#00d4ff'}15`,
          border: `1px solid ${item.sourceColor || '#00d4ff'}33`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
        }}>{item.sourceIcon || item.icon || '🤖'}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: '#fff', fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.goalName || item.title || item.headline?.split(':')[0] || item.subject || item.source || 'Agent Chat'}
          </div>
          <div style={{ color: '#555', fontSize: 11 }}>
            {item.source || item.chatSection || ''}{item.workstream ? ` · ${item.workstream}` : ''}{sessionId ? ` · ${sessionId.slice(0, 12)}` : ' · ClawAPI'}
          </div>
        </div>
        <button onClick={onClose} style={{
          background: '#111', border: '1px solid #222', color: '#888',
          width: 28, height: 28, borderRadius: 6, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
        }}>✕</button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
            <div className={msg.role === 'agent' ? 'chat-md' : ''} style={{
              background: msg.role === 'user' ? '#00d4ff' : '#151515',
              color: msg.role === 'user' ? '#000' : '#ccc',
              padding: '10px 14px', borderRadius: msg.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
              fontSize: 13, lineHeight: 1.6,
            }}>
              {msg.role === 'agent' ? (
                <ReactMarkdown components={{
                  p: ({children}) => <p style={{margin: '6px 0'}}>{children}</p>,
                  strong: ({children}) => <strong style={{color: '#fff'}}>{children}</strong>,
                  em: ({children}) => <em style={{color: '#aaa'}}>{children}</em>,
                  h1: ({children}) => <div style={{fontSize: 16, fontWeight: 700, color: '#fff', margin: '10px 0 6px'}}>{children}</div>,
                  h2: ({children}) => <div style={{fontSize: 15, fontWeight: 700, color: '#fff', margin: '8px 0 4px'}}>{children}</div>,
                  h3: ({children}) => <div style={{fontSize: 14, fontWeight: 600, color: '#ddd', margin: '6px 0 4px'}}>{children}</div>,
                  ul: ({children}) => <ul style={{paddingLeft: 18, margin: '6px 0'}}>{children}</ul>,
                  ol: ({children}) => <ol style={{paddingLeft: 18, margin: '6px 0'}}>{children}</ol>,
                  li: ({children}) => <li style={{margin: '3px 0', color: '#ccc'}}>{children}</li>,
                  code: ({children, className}) => className ? (
                    <pre style={{background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 6, padding: '10px 12px', margin: '6px 0', overflowX: 'auto', fontSize: 12, color: '#aaa'}}><code>{children}</code></pre>
                  ) : (
                    <code style={{background: '#1a1a1a', padding: '1px 5px', borderRadius: 3, fontSize: 12, color: '#00d4ff'}}>{children}</code>
                  ),
                  hr: () => <hr style={{border: 'none', borderTop: '1px solid #1a1a1a', margin: '10px 0'}} />,
                  a: ({href, children}) => <a href={href} target="_blank" rel="noopener noreferrer" style={{color: '#00d4ff', textDecoration: 'underline'}}>{children}</a>,
                  table: ({children}) => <div style={{overflowX: 'auto', margin: '8px 0'}}><table style={{width: '100%', borderCollapse: 'collapse', fontSize: 12}}>{children}</table></div>,
                  th: ({children}) => <th style={{background: '#1a1a1a', color: '#888', padding: '6px 10px', textAlign: 'left', border: '1px solid #222', fontSize: 11, fontWeight: 600}}>{children}</th>,
                  td: ({children}) => <td style={{padding: '6px 10px', border: '1px solid #1a1a1a', color: '#ccc'}}>{children}</td>,
                  blockquote: ({children}) => <blockquote style={{borderLeft: '3px solid #00d4ff', paddingLeft: 12, margin: '8px 0', color: '#888'}}>{children}</blockquote>,
                }}>{msg.text}</ReactMarkdown>
              ) : msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ alignSelf: 'flex-start' }}>
            <div style={{ background: '#151515', color: '#00d4ff', padding: '10px 14px', borderRadius: '12px 12px 12px 4px', fontSize: 13, display: 'flex', gap: 4 }}>
              <span className="dot-pulse">●</span> OS is thinking...
            </div>
          </div>
        )}
        <div ref={(el) => { messagesEndRef.current = el; }} />
      </div>

      {/* Input */}
      <div style={{ padding: '12px 20px', borderTop: '1px solid #1a1a1a', display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="Give instructions to the agent..."
          style={{
            flex: 1, background: '#111', border: '1px solid #222', color: '#fff',
            padding: '10px 14px', borderRadius: 8, fontSize: 13, outline: 'none',
          }}
        />
        <button onClick={handleSend} disabled={loading} style={{
          background: loading ? '#333' : '#00d4ff', color: '#000', border: 'none',
          padding: '10px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700,
          cursor: loading ? 'wait' : 'pointer', flexShrink: 0,
        }}>Send</button>
      </div>

      {/* Quick actions */}
      <div style={{ padding: '8px 20px 16px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {quickActions.map((q: string) => (
          <button key={q} onClick={() => { setInput(q); }} style={{
            background: '#111', border: '1px solid #1a1a1a', color: '#888',
            padding: '5px 12px', borderRadius: 6, fontSize: 11, cursor: 'pointer',
            transition: 'all 0.15s',
          }}>{q}</button>
        ))}
      </div>
    </div>
  );
}

// ─── ClawOS Updates Section (replicates os.sharelabs.ai Updates UI) ───────────
function ClawOSUpdatesSection({ updates }: { updates: UpdatesData | null }) {
  const [expandedWorkstreams, setExpandedWorkstreams] = useState<Set<string>>(new Set(['Product']));

  if (!updates?.updates || Object.keys(updates.updates).length === 0) {
    return (
      <div style={{ color: '#444', fontSize: 13, padding: '24px 0', textAlign: 'center' }}>
        No updates available
      </div>
    );
  }

  const workstreamColors: Record<string, string> = {
    Product: '#00d4ff',
    Demand: '#00ff88',
    Operations: '#ff8800',
    Team: '#aa44ff',
    Partnerships: '#ff4488',
    Investors: '#ffcc00',
    Synergy: '#44ffcc',
  };

  const toggleWs = (ws: string) => {
    setExpandedWorkstreams(prev => {
      const next = new Set(prev);
      if (next.has(ws)) next.delete(ws);
      else next.add(ws);
      return next;
    });
  };

  const totalUpdates = Object.values(updates.updates).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ color: '#555', fontSize: 11, fontFamily: 'monospace' }}>
          {totalUpdates} total updates across {Object.keys(updates.updates).length} workstreams
        </div>
        <button
          onClick={() => {
            const allWs = Object.keys(updates.updates);
            const allExpanded = allWs.every(ws => expandedWorkstreams.has(ws));
            if (allExpanded) setExpandedWorkstreams(new Set());
            else setExpandedWorkstreams(new Set(allWs));
          }}
          style={{
            background: 'none', border: '1px solid #222', borderRadius: 4, color: '#555',
            fontSize: 10, padding: '3px 8px', cursor: 'pointer', fontFamily: 'monospace', letterSpacing: '0.08em'
          }}
        >
          {Object.keys(updates.updates).every(ws => expandedWorkstreams.has(ws)) ? 'COLLAPSE ALL' : 'EXPAND ALL'}
        </button>
      </div>

      {Object.entries(updates.updates).map(([workstream, items]) => {
        const color = workstreamColors[workstream] || '#00d4ff';
        const isExpanded = expandedWorkstreams.has(workstream);

        return (
          <div key={workstream} style={{ marginBottom: 4 }}>
            {/* Workstream header row */}
            <div
              onClick={() => toggleWs(workstream)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 16px',
                background: '#080808',
                border: '1px solid #1a1a1a',
                borderRadius: isExpanded ? '8px 8px 0 0' : 8,
                cursor: 'pointer',
                transition: 'all 0.15s',
                userSelect: 'none',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = '#0d0d0d'}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = '#080808'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 3, height: 16, background: color, borderRadius: 2 }} />
                <span style={{ color, fontSize: 11, fontFamily: 'monospace', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600 }}>
                  {workstream}
                </span>
                <span style={{ color: '#555', fontSize: 10, fontFamily: 'monospace' }}>· {items.length} update{items.length !== 1 ? 's' : ''}</span>
              </div>
              <span style={{ color: '#444', fontSize: 12, transition: 'transform 0.15s', transform: isExpanded ? 'rotate(180deg)' : 'none', display: 'inline-block' }}>
                ▾
              </span>
            </div>

            {/* Updates list */}
            {isExpanded && (
              <div style={{
                border: '1px solid #1a1a1a',
                borderTop: 'none',
                borderRadius: '0 0 8px 8px',
                overflow: 'hidden',
              }}>
                {items.map((item: any, i: number) => {
                  const gmt = item.goal_milestone_task_info || {};
                  const goalName = gmt.goal?.name;
                  const msName = gmt.milestone?.name;
                  const taskName = gmt.task?.name;
                  const images = item.demo_images || [];
                  const links = item.links || [];

                  return (
                    <div
                      key={i}
                      style={{
                        padding: '16px 20px',
                        borderBottom: i < items.length - 1 ? '1px solid #111' : 'none',
                        background: i % 2 === 0 ? '#060606' : '#050505',
                      }}
                    >
                      {/* Tags row */}
                      {(goalName || msName || taskName) && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                          {goalName && (
                            <span style={{
                              background: 'rgba(0,212,255,0.08)', color: '#00d4ff',
                              border: '1px solid rgba(0,212,255,0.2)',
                              borderRadius: 4, padding: '3px 8px', fontSize: 10,
                              fontFamily: 'monospace', letterSpacing: '0.04em', maxWidth: 280,
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }} title={goalName}>
                              Goal: {goalName}
                            </span>
                          )}
                          {msName && (
                            <span style={{
                              background: 'rgba(255,200,0,0.08)', color: '#ffcc44',
                              border: '1px solid rgba(255,200,0,0.2)',
                              borderRadius: 4, padding: '3px 8px', fontSize: 10,
                              fontFamily: 'monospace', letterSpacing: '0.04em', maxWidth: 240,
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }} title={msName}>
                              MS: {msName}
                            </span>
                          )}
                          {taskName && (
                            <span style={{
                              background: 'rgba(0,255,136,0.08)', color: '#00ff88',
                              border: '1px solid rgba(0,255,136,0.2)',
                              borderRadius: 4, padding: '3px 8px', fontSize: 10,
                              fontFamily: 'monospace', letterSpacing: '0.04em', maxWidth: 240,
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }} title={taskName}>
                              Task: {taskName}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Update text */}
                      <div style={{ color: '#bbb', fontSize: 13, lineHeight: 1.6, marginBottom: 8 }}>
                        {safeStr(item.update)}
                      </div>

                      {/* Images */}
                      {images.length > 0 && (
                        <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                          {images.map((img: string, j: number) => (
                            <a key={j} href={img} target="_blank" rel="noreferrer">
                              <img
                                src={img}
                                alt="screenshot"
                                style={{ height: 60, width: 'auto', borderRadius: 4, border: '1px solid #1a1a1a', objectFit: 'cover' }}
                                onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                              />
                            </a>
                          ))}
                        </div>
                      )}

                      {/* Bottom row: links + date */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {links.map((link: string, j: number) => {
                            let displayUrl = link;
                            try { displayUrl = new URL(link).hostname; } catch {/* */}
                            return (
                              <a key={j} href={link} target="_blank" rel="noreferrer" style={{
                                display: 'inline-flex', alignItems: 'center', gap: 4,
                                background: '#0d0d0d', border: '1px solid #222', borderRadius: 4,
                                color: '#00d4ff', fontSize: 10, padding: '3px 8px',
                                textDecoration: 'none', fontFamily: 'monospace',
                              }}>
                                ↗ {displayUrl}
                              </a>
                            );
                          })}
                        </div>
                        {item.date_id && (
                          <span style={{ color: '#444', fontSize: 10, fontFamily: 'monospace' }}>
                            {item.date_id}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ActivityFeedSection({ feed, updates, goals, seo, geo, storedFeed, onAction }: { feed: FeedData | null; updates: UpdatesData | null; goals?: GoalsData | null; seo?: Record<string, unknown> | null; geo?: Record<string, unknown> | null; storedFeed?: any[]; onAction?: (item: any) => void }) {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set())
  const [activeFilter, setActiveFilter] = useState<'all' | 'action' | 'review' | 'info'>('all');

  // Build actionable feed items from all data sources
  const actionItems: {
    id: number;
    source: string;
    sourceIcon: string;
    sourceColor: string;
    headline: string;
    description: string;
    actionType: 'action' | 'review' | 'info';
    actionLabel: string;
    urgency: 'high' | 'medium' | 'low';
    workstream?: string;
    date?: string;
    details?: string[];
    goalImpact?: string;
    valuationAtStake?: string;
  }[] = [];

  let itemId = 0;

  // If stored feed data from MongoDB exists, use it directly
  if (storedFeed && storedFeed.length > 0) {
    storedFeed.forEach((item: any) => {
      actionItems.push({ ...item, id: itemId++ });
    });
  }

  // Only build from live data if no stored feed
  if (actionItems.length === 0) {

  // Convert polsia feed events into actionable items
  const polsiaFeed = (feed as any)?.feed || (feed as any)?.events || [];
  polsiaFeed.forEach((evt: any) => {
    const typeMap: Record<string, { icon: string; color: string; label: string }> = {
      brand_dna: { icon: '🎨', color: '#00d4ff', label: 'Brand' },
      seo_audit: { icon: '🔍', color: '#ff8800', label: 'SEO' },
      geo_check: { icon: '🌐', color: '#00ff88', label: 'GEO' },
      competitors: { icon: '⚔️', color: '#ff4400', label: 'Competitive Intel' },
      patents: { icon: '📜', color: '#aa44ff', label: 'IP/Patents' },
      grants: { icon: '💰', color: '#ffcc00', label: 'Grants' },
      scrape: { icon: '🔄', color: '#666', label: 'Data Collection' },
      simulation: { icon: '🧪', color: '#3B82F6', label: 'Simulation' },
    };
    const meta = typeMap[evt.type] || { icon: '📋', color: '#00d4ff', label: evt.type?.replace(/_/g, ' ') || 'Update' };
    const isActionable = evt.status !== 'complete' || evt.type === 'competitors' || evt.type === 'grants';
    actionItems.push({
      id: itemId++,
      source: meta.label,
      sourceIcon: meta.icon,
      sourceColor: meta.color,
      headline: deriveHeadline(evt),
      description: String(evt.message || ''),
      actionType: isActionable ? 'action' : 'review',
      actionLabel: isActionable ? 'Act' : 'Review',
      urgency: evt.status !== 'complete' ? 'high' : 'medium',
      date: evt.created_at ? new Date(evt.created_at).toLocaleDateString() : undefined,
      details: deriveActions(evt),
    });
  });

  // Convert agent outputs into actionable items
  const agents = polsiaFeed.length > 0 ? [] : (feed?.agents?.items || []);
  agents.forEach((agent) => {
    const parsed = parseAgentOutput(agent);
    actionItems.push({
      id: itemId++,
      source: agent.name?.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) || 'Agent',
      sourceIcon: getWorkstreamIcon(agent.workstream),
      sourceColor: getWorkstreamColor(agent.workstream),
      headline: parsed.headline,
      description: parsed.summary,
      actionType: parsed.needsAction ? 'action' : parsed.needsReview ? 'review' : 'info',
      actionLabel: parsed.needsAction ? 'Act Now' : parsed.needsReview ? 'Review' : 'Read',
      urgency: parsed.needsAction ? 'high' : parsed.needsReview ? 'medium' : 'low',
      workstream: agent.workstream,
      date: agent.dateId,
      details: parsed.actions,
      goalImpact: parsed.goalImpact,
      valuationAtStake: parsed.valuationAtStake,
    });
  });

  // Convert workstream updates into actionable items
  if (updates?.updates) {
    Object.entries(updates.updates).forEach(([ws, items]) => {
      if (Array.isArray(items)) {
        items.slice(0, 2).forEach(item => {
          const parsed = parseWorkstreamUpdate(ws, item);
          actionItems.push({
            id: itemId++,
            source: ws.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
            sourceIcon: getWorkstreamIcon(ws),
            sourceColor: getWorkstreamColor(ws),
            headline: parsed.headline,
            description: parsed.summary,
            actionType: parsed.needsAction ? 'action' : 'review',
            actionLabel: parsed.needsAction ? 'Decide' : 'Review',
            urgency: parsed.needsAction ? 'high' : 'medium',
            workstream: ws,
            date: item.date_id,
            details: parsed.actions,
            goalImpact: parsed.goalImpact,
          });
        });
      }
    });
  }

  // Generate goal-level actionable items from goals data (real goal names, real metrics)
  if (goals?.workstreams) {
    goals.workstreams.forEach(ws => {
      const wsName = ws.name || '';
      (ws.goals || []).forEach(goal => {
        const perf = goal.performanceScore || 0;
        const exec = goal.executionScore || 0;
        const goalName = goal.name || '';
        const isCritical = perf === 0 && exec === 0;
        const isBehind = perf < 30 && perf > 0;
        const isOnTrack = perf >= 50;

        // Only show goals that need attention (skip high-performing ones)
        if (isOnTrack) return;

        const goalData = goal as any;
        const milestones = goalData?.milestones || [];
        const notStartedTasks: string[] = [];
        milestones.forEach((m: any) => {
          (m.tasks || []).filter((t: any) => t.status === 'not_started').slice(0, 2).forEach((t: any) => {
            notStartedTasks.push(t.name);
          });
        });

        const actionDetails: string[] = [];
        if (isCritical) {
          actionDetails.push(`Goal "${goalName}" has 0% performance and 0% execution. No work has started.`);
          if (milestones.length > 0) {
            actionDetails.push(`First milestone: "${milestones[0]?.name}". Assign an owner and set a deadline.`);
          }
          if (notStartedTasks.length > 0) {
            actionDetails.push(`Start with: ${notStartedTasks.slice(0, 2).join(', ')}`);
          }
        } else if (isBehind) {
          actionDetails.push(`Goal "${goalName}" is at ${perf}% performance (execution: ${exec}%). Behind target.`);
          if (goalData?.current_goal_metric_status) {
            actionDetails.push(`Current metric: ${goalData.current_goal_metric_status}. Target: ${goalData.target_goal_metric || 'not set'}`);
          }
          if (notStartedTasks.length > 0) {
            actionDetails.push(`Unstarted tasks: ${notStartedTasks.slice(0, 2).join(', ')}`);
          }
          actionDetails.push('Review blockers and reassign resources if needed.');
        } else {
          actionDetails.push(`Goal "${goalName}" at ${perf}% performance, ${exec}% execution.`);
          if (notStartedTasks.length > 0) {
            actionDetails.push(`Next tasks to unblock: ${notStartedTasks.slice(0, 2).join(', ')}`);
          }
        }

        // Add attributed agent info
        if (goalData?.attributed_agents?.length > 0) {
          const agentName = goalData.attributed_agents[0].agent_name?.replace(/-/g, ' ');
          actionDetails.push(`Attributed agent: ${agentName}`);
        }

        actionItems.push({
          id: itemId++,
          source: wsName,
          sourceIcon: getWorkstreamIcon(wsName.toLowerCase()),
          sourceColor: getWorkstreamColor(wsName.toLowerCase()),
          headline: isCritical
            ? `${goalName}: Not started. Needs kickoff.`
            : isBehind
              ? `${goalName}: ${perf}% performance. Falling behind.`
              : `${goalName}: ${perf}% performance. Needs push.`,
          description: goalData?.goal_description || goalData?.description || `${goalName} in ${wsName} workstream.`,
          actionType: isCritical ? 'action' : isBehind ? 'action' : 'review',
          actionLabel: isCritical ? 'Kickoff' : isBehind ? 'Intervene' : 'Review',
          urgency: isCritical ? 'high' : isBehind ? 'high' : 'medium',
          workstream: wsName,
          details: actionDetails,
          goalImpact: goalData?.targetValuation ? `$${(goalData.targetValuation / 1000).toFixed(0)}K target` : undefined,
          valuationAtStake: goalData?.targetValuation ? `$${(goalData.targetValuation / 1000).toFixed(0)}K` : undefined,
        });
      });
    });
  }

  // Add SEO/GEO-specific action items if data available
  const seoScoreVal = Number(seo?.overall_score || 0);
  const geoScoreVal = Number((geo as any)?.overall_score || 0);
  if (seoScoreVal > 0 && seoScoreVal < 50) {
    const seoIssues = Array.isArray(seo?.issues) ? (seo.issues as any[]) : [];
    const criticalCount = seoIssues.filter((i: any) => i?.severity === 'critical').length;
    actionItems.push({
      id: itemId++,
      source: 'SEO',
      sourceIcon: '🔍',
      sourceColor: '#ff8800',
      headline: `SEO score ${seoScoreVal}/100 with ${criticalCount} critical issues. Revenue at risk.`,
      description: `The website has ${seoIssues.length} SEO issues, ${criticalCount} critical. This directly impacts organic discovery and CAC.`,
      actionType: 'action',
      actionLabel: 'Fix Now',
      urgency: criticalCount > 3 ? 'high' : 'medium',
      details: seoIssues.slice(0, 3).map((i: any) => `[${(i?.severity || 'issue').toUpperCase()}] ${typeof i === 'string' ? i : i?.issue || i?.description || ''}`),
      goalImpact: 'Demand > Organic Traffic',
    });
  }
  if (geoScoreVal > 0 && geoScoreVal < 30) {
    const geoPlats = Array.isArray((geo as any)?.platforms) ? (geo as any).platforms : [];
    actionItems.push({
      id: itemId++,
      source: 'GEO',
      sourceIcon: '🌐',
      sourceColor: '#00ff88',
      headline: `AI visibility score ${geoScoreVal}/100. Invisible to ChatGPT, Claude, Gemini.`,
      description: 'The venture is not being cited by any major AI platform. This is a critical gap for discovery.',
      actionType: 'action',
      actionLabel: 'Fix Now',
      urgency: 'high',
      details: geoPlats.slice(0, 3).map((p: any) => `${p.name}: ${p.score}/100. ${(p.summary || '').slice(0, 100)}`),
      goalImpact: 'Demand > AI Discovery',
    });
  }

  } // end if (actionItems.length === 0) — stored feed bypass

  // If no items at all, show empty state
  if (actionItems.length === 0) {
    return (
      <IntelCard>
        <IntelLabel>CEO Action Feed</IntelLabel>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>✅</div>
          <div style={{ color: '#00ff88', fontSize: 15, fontWeight: 600, marginBottom: 4 }}>All Clear</div>
          <p style={{ color: '#555', fontSize: 13 }}>No pending actions or decisions required right now.</p>
        </div>
      </IntelCard>
    );
  }

  // Sort: actions first, then reviews, then info. Within each group, high urgency first
  const urgencyOrder = { high: 0, medium: 1, low: 2 };
  const typeOrder = { action: 0, review: 1, info: 2 };
  actionItems.sort((a, b) => typeOrder[a.actionType] - typeOrder[b.actionType] || urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);

  const filtered = activeFilter === 'all' ? actionItems : actionItems.filter(i => i.actionType === activeFilter);

  const actionCount = actionItems.filter(i => i.actionType === 'action').length;
  const reviewCount = actionItems.filter(i => i.actionType === 'review').length;
  const infoCount = actionItems.filter(i => i.actionType === 'info').length;

  function toggleExpand(id: number) {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Summary bar */}
      <div style={{ display: 'flex', gap: 12 }}>
        {[
          { key: 'all' as const, label: 'All', count: actionItems.length, color: '#fff' },
          { key: 'action' as const, label: '🔴 Needs Action', count: actionCount, color: '#ff4444' },
          { key: 'review' as const, label: '🟡 Review', count: reviewCount, color: '#ff8800' },
          { key: 'info' as const, label: '🟢 Info', count: infoCount, color: '#00ff88' },
        ].map(f => (
          <button key={f.key} onClick={() => setActiveFilter(f.key)} style={{
            background: activeFilter === f.key ? `${f.color}12` : '#080808',
            border: `1px solid ${activeFilter === f.key ? `${f.color}44` : '#1a1a1a'}`,
            color: activeFilter === f.key ? f.color : '#555',
            padding: '8px 16px', borderRadius: 8, fontSize: 12, cursor: 'pointer',
            fontWeight: activeFilter === f.key ? 700 : 400,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            {f.label}
            <span style={{
              background: `${f.color}18`, color: f.color,
              padding: '1px 8px', borderRadius: 10, fontSize: 11, fontWeight: 700,
            }}>{f.count}</span>
          </button>
        ))}
      </div>

      {/* Action items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map((item) => {
          const isExpanded = expandedItems.has(item.id);
          const urgencyColors = { high: '#ff4444', medium: '#ff8800', low: '#00ff88' };
          const urgencyBg = { high: 'rgba(255,68,68,0.06)', medium: 'rgba(255,136,0,0.06)', low: 'rgba(0,255,136,0.04)' };
          const actionBtnColors = { action: { bg: '#ff4444', text: '#fff' }, review: { bg: '#1a1a1a', text: '#ff8800' }, info: { bg: '#111', text: '#888' } };
          const btnStyle = actionBtnColors[item.actionType];

          return (
            <div key={item.id} style={{
              background: '#080808',
              border: `1px solid ${item.actionType === 'action' ? 'rgba(255,68,68,0.2)' : '#1a1a1a'}`,
              borderRadius: 10,
              overflow: 'hidden',
              transition: 'border-color 0.15s',
            }}>
              {/* Header row - always visible */}
              <div
                onClick={() => toggleExpand(item.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 18px', cursor: 'pointer',
                  background: isExpanded ? urgencyBg[item.urgency] : 'transparent',
                }}
              >
                {/* Source icon */}
                <div style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: `${item.sourceColor}15`,
                  border: `1px solid ${item.sourceColor}33`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, flexShrink: 0,
                }}>{item.sourceIcon}</div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <span style={{ color: item.sourceColor, fontSize: 12, fontWeight: 600 }}>{item.source}</span>
                    {item.workstream && <span style={{ color: '#333', fontSize: 11 }}>· {item.workstream}</span>}
                    {item.date && <span style={{ color: '#222', fontSize: 10, marginLeft: 'auto', flexShrink: 0 }}>{item.date}</span>}
                  </div>
                  <div style={{ color: '#ddd', fontSize: 14, fontWeight: 600, lineHeight: 1.3 }}>{item.headline}</div>
                </div>

                {/* Status + action */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  {item.urgency === 'high' && (
                    <span style={{
                      background: 'rgba(255,68,68,0.1)', color: '#ff4444',
                      border: '1px solid rgba(255,68,68,0.3)',
                      padding: '3px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700,
                    }}>Urgent</span>
                  )}
                  <button onClick={(e) => { e.stopPropagation(); onAction?.(item); }} style={{
                    background: btnStyle.bg, color: btnStyle.text,
                    border: item.actionType === 'action' ? 'none' : `1px solid ${btnStyle.text}33`,
                    padding: '6px 16px', borderRadius: 6, fontSize: 12, fontWeight: 700,
                    cursor: 'pointer', whiteSpace: 'nowrap',
                  }}>{item.actionLabel}</button>
                  <span style={{ color: '#333', fontSize: 16, transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>▾</span>
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div style={{
                  padding: '0 18px 18px 68px',
                  borderTop: '1px solid #111',
                  background: urgencyBg[item.urgency],
                }}>
                  {/* Description */}
                  <p style={{ color: '#888', fontSize: 13, lineHeight: 1.6, margin: '14px 0' }}>
                    {safeStr(item.description)}
                  </p>

                  {/* Actionable steps */}
                  {item.details && item.details.length > 0 && (
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ color: '#555', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8, fontWeight: 600 }}>
                        {item.actionType === 'action' ? 'REQUIRED ACTIONS' : item.actionType === 'review' ? 'KEY POINTS TO REVIEW' : 'SUMMARY'}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {item.details.map((action, i) => (
                          <div key={i} style={{
                            display: 'flex', gap: 10, alignItems: 'flex-start',
                            background: '#0a0a0a', border: '1px solid #151515',
                            borderRadius: 6, padding: '10px 14px',
                          }}>
                            <span style={{
                              background: item.actionType === 'action' ? 'rgba(255,68,68,0.12)' : 'rgba(0,212,255,0.08)',
                              color: item.actionType === 'action' ? '#ff4444' : '#00d4ff',
                              border: `1px solid ${item.actionType === 'action' ? 'rgba(255,68,68,0.25)' : 'rgba(0,212,255,0.2)'}`,
                              borderRadius: 4, padding: '1px 7px', fontSize: 11, fontWeight: 700,
                              flexShrink: 0, minWidth: 22, textAlign: 'center',
                            }}>{i + 1}</span>
                            <span style={{ color: '#aaa', fontSize: 13, lineHeight: 1.5 }}>{action}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Impact row */}
                  {(item.goalImpact || item.valuationAtStake) && (
                    <div style={{
                      display: 'flex', gap: 16, padding: '10px 14px',
                      background: '#0a0a0a', border: '1px solid #151515', borderRadius: 6,
                    }}>
                      {item.goalImpact && (
                        <div>
                          <div style={{ color: '#444', fontSize: 10, letterSpacing: '0.05em' }}>GOAL IMPACT</div>
                          <div style={{ color: '#00d4ff', fontSize: 13, fontWeight: 600, marginTop: 2 }}>{item.goalImpact}</div>
                        </div>
                      )}
                      {item.valuationAtStake && (
                        <div>
                          <div style={{ color: '#444', fontSize: 10, letterSpacing: '0.05em' }}>VALUATION AT STAKE</div>
                          <div style={{ color: '#ff8800', fontSize: 13, fontWeight: 600, marginTop: 2 }}>{item.valuationAtStake}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Feed Helper Functions ───────────────────────────────────────────────────

function deriveHeadline(evt: any): string {
  const type = evt.type || '';
  const msg = String(evt.message || '');
  const isComplete = evt.status === 'complete';
  
  if (type === 'competitors') return isComplete ? 'Competitive landscape updated. Review new threats.' : 'Competitor analysis in progress. New entrant detected.';
  if (type === 'seo_audit') return isComplete ? 'SEO audit complete. Critical issues need your call.' : 'SEO audit running. Issues flagged so far.';
  if (type === 'grants') return 'New grant opportunities matched. Deadline approaching.';
  if (type === 'brand_dna') return isComplete ? 'Brand DNA analysis ready for review.' : 'Brand analysis in progress.';
  if (type === 'geo_check') return isComplete ? 'AI search visibility report ready.' : 'GEO check running.';
  if (type === 'patents') return 'Patent landscape scan complete. White spaces identified.';
  if (type === 'simulation') return 'Venture simulation updated with latest data.';
  
  // Fallback: extract first meaningful sentence
  const firstSentence = msg.split(/[.!?]/)[0]?.trim();
  return firstSentence?.length > 10 ? firstSentence : msg.slice(0, 80) || 'New update available';
}

function deriveActions(evt: any): string[] {
  const type = evt.type || '';
  const msg = String(evt.message || '');
  
  if (type === 'competitors') return [
    'Review updated competitive positioning matrix',
    'Validate pricing strategy against new entrants',
    'Approve messaging differentiation for sales team',
  ];
  if (type === 'seo_audit') return [
    'Review critical SEO issues flagged by the audit',
    'Approve recommended keyword strategy changes',
    'Decide on budget allocation for content fixes',
  ];
  if (type === 'grants') return [
    'Review matched grant opportunities and eligibility',
    'Decide which grants to pursue (deadline sensitive)',
    'Assign team member to prepare grant applications',
  ];
  if (type === 'brand_dna') return [
    'Review brand voice and visual identity recommendations',
    'Approve or adjust brand archetype positioning',
  ];
  if (type === 'patents') return [
    'Review identified patent white spaces',
    'Decide on provisional patent filing priorities',
  ];
  
  // Generic: extract action-like sentences from message
  const actions = msg.split(/[.!]/).filter((s: string) => 
    s.trim().length > 15 && /\b(need|should|must|review|approve|decide|update|action|fix|address)\b/i.test(s)
  ).map((s: string) => s.trim()).slice(0, 3);
  
  return actions.length > 0 ? actions : [msg.slice(0, 120) || 'Review this update'];
}

function parseAgentOutput(agent: AgentItem): {
  headline: string; summary: string; needsAction: boolean; needsReview: boolean;
  actions: string[]; goalImpact?: string; valuationAtStake?: string;
} {
  const output = agent.output || '';
  const name = agent.name || '';
  const status = agent.lastStatus || '';
  
  const isError = status !== 'ok' && status !== 'success';
  const hasMetrics = agent.metrics && Object.keys(agent.metrics).length > 0;
  
  // Extract headline from first line or generate one
  const firstLine = output.split('\n')[0]?.replace(/^#+\s*/, '').trim() || '';
  const headline = isError
    ? `${name.replace(/-/g, ' ')} failed. Needs attention.`
    : firstLine.length > 15 && firstLine.length < 100
      ? firstLine
      : `${name.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())} report ready`;

  // Extract meaningful summary (skip headers and metadata)
  const lines = output.split('\n').filter((l: string) => l.trim() && !l.startsWith('#') && !l.startsWith('---'));
  const summary = lines.slice(0, 3).join(' ').slice(0, 250) || 'Agent completed its run. See details below.';

  // Extract action items from output
  const actionLines = output.split('\n').filter((l: string) =>
    /^\s*[-*]\s/.test(l) || /\b(TODO|ACTION|DECISION|BLOCKED|NEEDS)\b/i.test(l)
  ).map((l: string) => l.replace(/^\s*[-*]\s*/, '').trim()).filter((l: string) => l.length > 10);

  const actions = actionLines.length > 0
    ? actionLines.slice(0, 5)
    : isError
      ? ['Investigate failure cause and restart agent', 'Check if dependencies are available', 'Review error logs for root cause']
      : ['Review agent output and validate findings', 'Integrate insights into current strategy'];

  // Goal/valuation extraction
  const goalMatch = output.match(/goal[s]?\s*(?:impacted?|affected|touched)\s*:?\s*([^\n]+)/i);
  const valMatch = output.match(/valuation\s*(?:at\s*(?:risk|stake))?\s*:?\s*\$?([\d,.]+[KMB]?)/i);

  return {
    headline,
    summary,
    needsAction: isError || /\b(BLOCKED|NEEDS|URGENT|DECISION|HUMAN)\b/i.test(output),
    needsReview: !isError && status === 'ok',
    actions,
    goalImpact: goalMatch?.[1]?.trim(),
    valuationAtStake: valMatch ? `$${valMatch[1]}` : undefined,
  };
}

function parseWorkstreamUpdate(ws: string, item: WorkstreamUpdate): {
  headline: string; summary: string; needsAction: boolean; actions: string[]; goalImpact?: string;
} {
  const update = item.update || '';
  const goalCount = item.goal_count || 0;
  const goalsComplete = item.goals_complete || 0;
  const completionRate = goalCount > 0 ? Math.round((goalsComplete / goalCount) * 100) : 0;

  const wsName = ws.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
  const needsAction = completionRate < 50 || /\b(blocked|risk|behind|delay|miss)\b/i.test(update);

  const headline = needsAction
    ? `${wsName}: ${completionRate}% goal completion. Behind target.`
    : `${wsName}: ${completionRate}% goal completion. On track.`;

  const summary = update.slice(0, 250) || `${goalsComplete} of ${goalCount} goals completed in ${wsName}.`;

  // Generate contextual actions
  const actions: string[] = [];
  if (needsAction) {
    actions.push(`Review blocked goals in ${wsName} workstream`);
    actions.push('Reallocate resources or adjust timelines');
    actions.push('Schedule sync with workstream lead');
  } else {
    actions.push(`${goalsComplete}/${goalCount} goals on track. No action needed.`);
    if (item.goals_summary?.length) {
      item.goals_summary.slice(0, 3).forEach(g => {
        actions.push(`${g.name}: Performance ${g.performance_score}, Execution ${g.execution_score}`);
      });
    }
  }

  return {
    headline,
    summary,
    needsAction,
    actions,
    goalImpact: goalCount > 0 ? `${goalsComplete}/${goalCount} goals` : undefined,
  };
}

function getWorkstreamIcon(ws?: string): string {
  const map: Record<string, string> = {
    product: '🔧', demand: '📣', operations: '⚙️', team: '👥',
    partnerships: '🤝', investors: '💼', synergy: '🔗',
    Product: '🔧', Demand: '📣', Operations: '⚙️', Team: '👥',
    Partnerships: '🤝', Investors: '💼', Synergy: '🔗',
  };
  return map[ws || ''] || '📋';
}

function getWorkstreamColor(ws?: string): string {
  const map: Record<string, string> = {
    product: '#00d4ff', demand: '#ff8800', operations: '#00ff88', team: '#aa44ff',
    partnerships: '#ffcc00', investors: '#3B82F6', synergy: '#ff4400',
    Product: '#00d4ff', Demand: '#ff8800', Operations: '#00ff88', Team: '#aa44ff',
    Partnerships: '#ffcc00', Investors: '#3B82F6', Synergy: '#ff4400',
  };
  return map[ws || ''] || '#00d4ff';
}

function HiringSection({ hiring }: { hiring: HiringData | null }) {
  if (!hiring) {
    return (
      <IntelCard>
        <IntelLabel>Team & Hiring</IntelLabel>
        <p style={{ color: '#444', fontSize: 13 }}>No hiring data available.</p>
      </IntelCard>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <IntelCard>
        <IntelLabel>Team ({hiring.employees?.length || 0} members)</IntelLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(hiring.employees || []).map((emp, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #111' }}>
              {emp.image_id && emp.image_id.startsWith('http') && (
                <img src={emp.image_id} alt={emp.name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '1px solid #1a1a1a' }} />
              )}
              {(!emp.image_id || !emp.image_id.startsWith('http')) && (
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #00d4ff, #0066ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14 }}>
                  {emp.name?.[0]}
                </div>
              )}
              <div>
                <div style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{emp.name}</div>
                <div style={{ color: '#555', fontSize: 11 }}>{emp.title}</div>
              </div>
              {emp.link && (
                <a href={emp.link} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 'auto', color: '#00d4ff', fontSize: 11 }}>LinkedIn</a>
              )}
            </div>
          ))}
        </div>
      </IntelCard>

      <IntelCard>
        <IntelLabel>Open Roles ({hiring.hiring_tasks?.length || 0})</IntelLabel>
        {!hiring.hiring_tasks?.length ? (
          <p style={{ color: '#444', fontSize: 13 }}>No open positions at this time.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {hiring.hiring_tasks.map((task, i) => (
              <div key={i} style={{ background: '#0d0d0d', border: '1px solid #151515', borderRadius: 6, padding: '10px 14px' }}>
                <div style={{ color: '#fff', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{task.title}</div>
                {task.description && <p style={{ color: '#666', fontSize: 12, margin: 0 }}>{task.description}</p>}
              </div>
            ))}
          </div>
        )}
      </IntelCard>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

// ─── Company Overview ────────────────────────────────────────────────────────

function CompanyOverviewSection({ companyInfo, domain }: { companyInfo: Record<string, unknown> | null; domain: string }) {
  if (!companyInfo) {
    return (
      <IntelCard>
        <IntelLabel>Company Overview</IntelLabel>
        <p style={{ color: '#444', fontSize: 13 }}>No company data available.</p>
      </IntelCard>
    );
  }
  const ci = companyInfo as any;
  const products = Array.isArray(ci.products) ? ci.products : [];
  const techStack = Array.isArray(ci.tech_stack) ? ci.tech_stack : [];
  const socialLinks = ci.social_links || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <IntelCard>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <div style={{ color: '#fff', fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{ci.name || domain}</div>
            {ci.tagline && <div style={{ color: '#00d4ff', fontSize: 14, fontStyle: 'italic', marginBottom: 8 }}>&ldquo;{ci.tagline}&rdquo;</div>}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
              {ci.industry && <span style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', color: '#00d4ff', padding: '3px 10px', borderRadius: 20, fontSize: 11 }}>{ci.industry}</span>}
              {ci.location && <span style={{ color: '#666', fontSize: 12 }}>📍 {ci.location}</span>}
              {ci.founded && <span style={{ color: '#666', fontSize: 12 }}>Est. {ci.founded}</span>}
              {ci.team_size && <span style={{ color: '#666', fontSize: 12 }}>👥 {ci.team_size}</span>}
            </div>
          </div>
          {ci.url && (
            <a href={ci.url} target="_blank" rel="noopener noreferrer" style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', color: '#00d4ff', padding: '6px 16px', borderRadius: 6, fontSize: 12, textDecoration: 'none', whiteSpace: 'nowrap' }}>
              Visit ↗
            </a>
          )}
        </div>
        {ci.description && <p style={{ color: '#aaa', fontSize: 13, lineHeight: 1.7, marginBottom: 16 }}>{ci.description}</p>}
        {ci.value_proposition && (
          <div style={{ background: '#0d0d0d', borderLeft: '3px solid #00d4ff', padding: '12px 16px', borderRadius: '0 6px 6px 0', marginBottom: 16 }}>
            <div style={{ color: '#444', fontSize: 10, letterSpacing: '0.1em', marginBottom: 4 }}>VALUE PROPOSITION</div>
            <p style={{ color: '#aaa', fontSize: 13, lineHeight: 1.6, margin: 0 }}>{ci.value_proposition}</p>
          </div>
        )}
        {ci.target_audience && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ color: '#444', fontSize: 10, letterSpacing: '0.1em', marginBottom: 6 }}>TARGET AUDIENCE</div>
            <p style={{ color: '#888', fontSize: 12, lineHeight: 1.5 }}>{ci.target_audience}</p>
          </div>
        )}
      </IntelCard>

      {/* Products */}
      {products.length > 0 && (
        <IntelCard>
          <IntelLabel>Products ({products.length})</IntelLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
            {products.map((p: any, i: number) => (
              <div key={i} style={{ background: '#0d0d0d', border: '1px solid #151515', borderRadius: 8, padding: 14 }}>
                <div style={{ color: '#fff', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{typeof p === 'string' ? p : (p.name || p.title || 'Product')}</div>
                {p.category && <span style={{ background: 'rgba(255,255,255,0.04)', color: '#555', padding: '2px 8px', borderRadius: 3, fontSize: 10 }}>{p.category}</span>}
                {p.description && <p style={{ color: '#666', fontSize: 12, lineHeight: 1.4, margin: '6px 0 0' }}>{String(p.description).slice(0, 100)}</p>}
                {p.pricing && <div style={{ color: '#00ff88', fontSize: 11, marginTop: 6 }}>{typeof p.pricing === 'string' ? p.pricing : p.pricing.amount || ''}</div>}
              </div>
            ))}
          </div>
        </IntelCard>
      )}

      {/* Tech Stack */}
      {techStack.length > 0 && (
        <IntelCard>
          <IntelLabel>Tech Stack</IntelLabel>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {techStack.map((t: string, i: number) => (
              <span key={i} style={{ background: 'rgba(0,255,136,0.06)', border: '1px solid rgba(0,255,136,0.15)', color: '#00ff88', padding: '5px 14px', borderRadius: 20, fontSize: 12 }}>{t}</span>
            ))}
          </div>
        </IntelCard>
      )}

      {/* Social Links */}
      {Object.keys(socialLinks).length > 0 && (
        <IntelCard>
          <IntelLabel>Social Profiles</IntelLabel>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {Object.entries(socialLinks).filter(([, v]) => v).map(([platform, url]) => (
              <a key={platform} href={String(url)} target="_blank" rel="noopener noreferrer" style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', color: '#00d4ff', padding: '6px 14px', borderRadius: 6, fontSize: 12, textDecoration: 'none', textTransform: 'capitalize' }}>
                {platform.replace(/_/g, ' ')} ↗
              </a>
            ))}
          </div>
        </IntelCard>
      )}
    </div>
  );
}

// ─── Market & Metrics ────────────────────────────────────────────────────────

function MarketMetricsSection({ competitors, metrics }: { competitors: any; metrics: any }) {
  const polsia = competitors?.polsia as any;
  const market = polsia?.market_overview || {};
  const advantages = Array.isArray(polsia?.competitive_advantages) ? polsia.competitive_advantages : [];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      {/* Market Overview */}
      <IntelCard>
        <IntelLabel>Market Overview</IntelLabel>
        {market.market_size || market.tam ? (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              {[
                { label: 'Market Size', value: market.market_size || market.tam || '--', color: '#00d4ff' },
                { label: 'CAGR', value: market.cagr || market.growth_rate || '--', color: '#00ff88' },
              ].map(m => (
                <div key={m.label} style={{ background: '#0d0d0d', border: '1px solid #151515', borderRadius: 6, padding: '12px 14px', textAlign: 'center' }}>
                  <div style={{ color: m.color, fontSize: 24, fontWeight: 800, marginBottom: 4 }}>{m.value}</div>
                  <div style={{ color: '#444', fontSize: 10, letterSpacing: '0.1em' }}>{m.label}</div>
                </div>
              ))}
            </div>
            {Array.isArray(market.trends) && market.trends.length > 0 && (
              <div>
                <div style={{ color: '#555', fontSize: 10, letterSpacing: '0.1em', marginBottom: 8 }}>MARKET TRENDS</div>
                {market.trends.map((t: string, i: number) => (
                  <div key={i} style={{ color: '#888', fontSize: 12, padding: '4px 0', display: 'flex', gap: 6 }}>
                    <span style={{ color: '#00d4ff' }}>→</span><span>{t}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <p style={{ color: '#444', fontSize: 13 }}>No market data available.</p>
        )}
        {advantages.length > 0 && (
          <div style={{ marginTop: 16, borderTop: '1px solid #1a1a1a', paddingTop: 12 }}>
            <div style={{ color: '#00ff88', fontSize: 10, letterSpacing: '0.1em', marginBottom: 8 }}>COMPETITIVE ADVANTAGES</div>
            {advantages.map((a: string, i: number) => (
              <div key={i} style={{ color: '#aaa', fontSize: 12, padding: '4px 0', display: 'flex', gap: 6 }}>
                <span style={{ color: '#00ff88' }}>✓</span><span>{a}</span>
              </div>
            ))}
          </div>
        )}
      </IntelCard>

      {/* Metrics */}
      <IntelCard>
        <IntelLabel>Key Metrics</IntelLabel>
        {metrics ? (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'Current Valuation', value: metrics.current_valuation ? `$${(Number(metrics.current_valuation) / 1e6).toFixed(1)}M` : '--', color: '#00ff88' },
                { label: 'Target Valuation', value: metrics.target_valuation ? `$${(Number(metrics.target_valuation) / 1e6).toFixed(1)}M` : '--', color: '#00d4ff' },
                { label: 'ROI', value: metrics.roi || '--', color: '#ff8800' },
                { label: 'Total Investment', value: metrics.total_investment || '--', color: '#fff' },
              ].filter(m => m.value !== '--').map(m => (
                <div key={m.label} style={{ background: '#0d0d0d', border: '1px solid #151515', borderRadius: 6, padding: '10px 12px' }}>
                  <div style={{ color: '#444', fontSize: 10, marginBottom: 4 }}>{m.label}</div>
                  <div style={{ color: m.color, fontWeight: 700, fontSize: 16 }}>{m.value}</div>
                </div>
              ))}
            </div>
            {metrics.burn && (
              <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(255,68,68,0.06)', border: '1px solid rgba(255,68,68,0.15)', borderRadius: 6 }}>
                <span style={{ color: '#ff4444', fontSize: 12 }}>🔥 Monthly Burn: {metrics.burn}</span>
              </div>
            )}
          </div>
        ) : (
          <p style={{ color: '#444', fontSize: 13 }}>No metrics data available.</p>
        )}
      </IntelCard>
    </div>
  );
}

// ─── Markdown Viewer Popup ───────────────────────────────────────────────────

function MarkdownPopup({ url, title, onClose }: { url: string; title: string; onClose: () => void }) {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(url)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      })
      .then(text => { setContent(text); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [url]);

  // Simple markdown to HTML renderer with table support
  function renderMarkdown(md: string): string {
    let html = md
      // Tables
      .replace(/^(\|.+\|)\n(\|[-| :]+\|)\n((?:\|.+\|\n?)*)/gm, (match, header, sep, body) => {
        const headers = header.split('|').filter((c: string) => c.trim()).map((c: string) => `<th>${c.trim()}</th>`).join('');
        const rows = body.trim().split('\n').map((row: string) => {
          const cells = row.split('|').filter((c: string) => c.trim()).map((c: string) => `<td>${c.trim()}</td>`).join('');
          return `<tr>${cells}</tr>`;
        }).join('');
        return `<table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
      })
      // Headers
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      // Bold
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      // Unordered lists
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      // Horizontal rules
      .replace(/^---$/gm, '<hr/>')
      // Paragraphs (lines not already tagged)
      .replace(/^(?!<[hltua]|<\/|<hr)(.+)$/gm, '<p>$1</p>');

    // Wrap consecutive <li> in <ul>
    html = html.replace(/(<li>.*?<\/li>\n?)+/g, '<ul>$&</ul>');

    return html;
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.85)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }} onClick={onClose}>
      <div style={{
        background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 12,
        width: '100%', maxWidth: 900, maxHeight: '90vh',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '14px 20px', borderBottom: '1px solid #1a1a1a', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18 }}>📄</span>
            <span style={{ color: '#fff', fontSize: 15, fontWeight: 700 }}>{title}</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <a href={url} target="_blank" rel="noopener noreferrer" style={{
              background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)',
              color: '#00d4ff', padding: '5px 14px', borderRadius: 6, fontSize: 11, textDecoration: 'none',
            }}>Download ↓</a>
            <button onClick={onClose} style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid #1a1a1a',
              color: '#888', padding: '5px 12px', borderRadius: 6, fontSize: 14, cursor: 'pointer',
            }}>✕</button>
          </div>
        </div>
        {/* Content */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '24px 32px',
        }}>
          {loading && <div style={{ color: '#00d4ff', fontSize: 13, textAlign: 'center', padding: 40 }}>Loading document...</div>}
          {error && <div style={{ color: '#ff4444', fontSize: 13, textAlign: 'center', padding: 40 }}>Failed to load: {error}</div>}
          {!loading && !error && (
            <div
              className="md-viewer"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
              style={{ color: '#ccc', fontSize: 14, lineHeight: 1.8 }}
            />
          )}
        </div>
      </div>
      <style>{`
        .md-viewer h1 { color: #fff; font-size: 24px; font-weight: 800; margin: 0 0 16px; border-bottom: 1px solid #1a1a1a; padding-bottom: 12px; }
        .md-viewer h2 { color: #fff; font-size: 18px; font-weight: 700; margin: 28px 0 12px; }
        .md-viewer h3 { color: #ddd; font-size: 15px; font-weight: 600; margin: 20px 0 8px; }
        .md-viewer p { margin: 8px 0; }
        .md-viewer strong { color: #fff; }
        .md-viewer em { color: #aaa; }
        .md-viewer a { color: #00d4ff; text-decoration: underline; text-decoration-color: rgba(0,212,255,0.3); }
        .md-viewer code { background: #1a1a1a; padding: 2px 6px; border-radius: 4px; font-size: 13px; color: #aaa; font-family: monospace; }
        .md-viewer ul { padding-left: 20px; margin: 8px 0; }
        .md-viewer li { margin: 4px 0; color: #aaa; }
        .md-viewer li::marker { color: #00d4ff; }
        .md-viewer hr { border: none; border-top: 1px solid #1a1a1a; margin: 20px 0; }
        .md-viewer table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 13px; }
        .md-viewer th { background: #111; color: #888; padding: 8px 12px; text-align: left; border: 1px solid #1a1a1a; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; }
        .md-viewer td { padding: 8px 12px; border: 1px solid #151515; color: #aaa; }
        .md-viewer tr:hover td { background: rgba(0,212,255,0.03); }
        .md-viewer blockquote { border-left: 3px solid #00d4ff; padding: 8px 16px; margin: 12px 0; color: #888; background: rgba(0,212,255,0.03); border-radius: 0 6px 6px 0; }
      `}</style>
    </div>
  );
}

// ─── Documents Section ───────────────────────────────────────────────────────

function DocumentsSection({ documents }: { documents: any }) {
  const [filter, setFilter] = useState('all');
  const [viewingDoc, setViewingDoc] = useState<{ url: string; title: string } | null>(null);

  // Handle multiple nesting levels: documents.documents[] or documents.documents[0].documents[]
  let docs: any[] = [];
  const rawDocs = documents?.documents;
  if (Array.isArray(rawDocs)) {
    if (rawDocs.length > 0 && rawDocs[0]?.documents && Array.isArray(rawDocs[0].documents)) {
      // Double-nested: unwrap inner documents
      docs = rawDocs.flatMap((d: any) => Array.isArray(d.documents) ? d.documents : [d]);
    } else {
      docs = rawDocs;
    }
  }

  const workstreams = ['all', ...Array.from(new Set(docs.map((d: any) => d.workstream || d.category || 'Other').filter(Boolean)))];
  const filtered = filter === 'all' ? docs : docs.filter((d: any) => (d.workstream || d.category || 'Other') === filter);

  const isMdFile = (doc: any) => {
    const url = doc.url || doc.link || '';
    return url.endsWith('.md') || doc.type === 'md';
  };

  return (
    <>
      {viewingDoc && <MarkdownPopup url={viewingDoc.url} title={viewingDoc.title} onClose={() => setViewingDoc(null)} />}
      <IntelCard>
        <IntelLabel>Documents ({docs.length})</IntelLabel>
        {docs.length === 0 ? (
          <p style={{ color: '#444', fontSize: 13 }}>No documents available.</p>
        ) : (
          <div>
            {/* Workstream filter buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
              {workstreams.map((ws: string) => (
                <button key={ws} onClick={() => setFilter(ws)} style={{
                  background: filter === ws ? 'rgba(0,212,255,0.12)' : '#0d0d0d',
                  border: `1px solid ${filter === ws ? 'rgba(0,212,255,0.3)' : '#1a1a1a'}`,
                  color: filter === ws ? '#00d4ff' : '#555',
                  padding: '5px 14px', borderRadius: 6, fontSize: 11, cursor: 'pointer',
                  textTransform: 'capitalize', fontWeight: filter === ws ? 600 : 400,
                }}>
                  {ws} {ws !== 'all' ? `(${docs.filter((d: any) => (d.workstream || d.category || 'Other') === ws).length})` : ''}
                </button>
              ))}
            </div>
            {/* Document grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
              {filtered.slice(0, 20).map((doc: any, i: number) => {
                const docUrl = doc.url || doc.link || '#';
                const docTitle = doc.title || doc.name || 'Document';
                const handleClick = (e: React.MouseEvent) => {
                  if (isMdFile(doc)) {
                    e.preventDefault();
                    setViewingDoc({ url: docUrl, title: docTitle });
                  }
                };
                return (
                  <a key={i} href={docUrl} target="_blank" rel="noopener noreferrer" onClick={handleClick} style={{
                    background: '#0d0d0d', border: '1px solid #151515', borderRadius: 8, padding: '12px 14px',
                    textDecoration: 'none', display: 'flex', gap: 10, alignItems: 'flex-start', transition: 'border-color 0.15s', cursor: 'pointer',
                  }}>
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{doc.type === 'md' ? '📝' : doc.type === 'pdf' ? '📄' : doc.type === 'spreadsheet' ? '📊' : doc.source?.includes('notion') ? '📝' : '📁'}</span>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{docTitle}</div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                        {doc.source && <span style={{ color: '#555', fontSize: 10 }}>{doc.source}</span>}
                        {(doc.workstream || doc.category) && <span style={{ color: '#00d4ff', fontSize: 10 }}>{doc.workstream || doc.category}</span>}
                        {isMdFile(doc) && <span style={{ background: 'rgba(0,255,136,0.08)', color: '#00ff88', padding: '0 6px', borderRadius: 3, fontSize: 9, fontWeight: 600 }}>VIEW</span>}
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
            {filtered.length > 20 && <p style={{ color: '#555', fontSize: 12, marginTop: 12 }}>+ {filtered.length - 20} more documents</p>}
          </div>
        )}
      </IntelCard>
    </>
  );
}

// ─── Videos Section ──────────────────────────────────────────────────────────

function VideosSection({ videos }: { videos: any }) {
  const videoList = Array.isArray(videos?.videos) ? videos.videos : [];

  return (
    <IntelCard>
      <IntelLabel>Videos ({videoList.length})</IntelLabel>
      {videoList.length === 0 ? (
        <p style={{ color: '#444', fontSize: 13 }}>No video data available.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {videoList.map((v: any, i: number) => (
            <a key={i} href={v.url || v.link || '#'} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <div style={{ background: '#0d0d0d', border: '1px solid #151515', borderRadius: 8, overflow: 'hidden' }}>
                {v.thumbnail ? (
                  <img src={v.thumbnail} alt={v.title || ''} style={{ width: '100%', height: 120, objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: 120, background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 32 }}>🎬</span>
                  </div>
                )}
                <div style={{ padding: '10px 12px' }}>
                  <div style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>{v.title || v.name || 'Video'}</div>
                  {v.duration && <div style={{ color: '#555', fontSize: 10, marginTop: 4 }}>{v.duration}</div>}
                  {v.views && <div style={{ color: '#00d4ff', fontSize: 10, marginTop: 2 }}>{v.views} views</div>}
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </IntelCard>
  );
}

// ─── Analytics Overview (Tabbed: Health / Links / AI-GEO / Passed) ───────────

function AnalyticsOverviewSection({ seo, geo }: { seo: Record<string, unknown> | null; geo: Record<string, unknown> | null }) {
  const [tab, setTab] = useState<'health' | 'links' | 'ai-geo' | 'passed'>('health');

  const seoScore = Number(seo?.overall_score || seo?.domain_authority || 0);
  const issues = Array.isArray(seo?.issues) ? (seo.issues as any[]) : [];
  const geoScore = Number(geo?.overall_score || geo?.score || 0);
  const platforms = Array.isArray(geo?.platforms) ? (geo.platforms as any[]) : [];
  const recommendationsRaw = Array.isArray(seo?.recommendations) ? (seo.recommendations as any[]) : [];
  const recommendations: string[] = recommendationsRaw.map((r: any) => typeof r === 'string' ? r : (r?.recommendation || r?.description || r?.message || JSON.stringify(r)));

  const tabs = [
    { key: 'health' as const, label: 'Health' },
    { key: 'links' as const, label: 'Links' },
    { key: 'ai-geo' as const, label: 'AI/GEO' },
    { key: 'passed' as const, label: 'Passed' },
  ];

  // Derive link data from seo
  const da = Number(seo?.domain_authority || seo?.overall_score || 0);
  const referringDomains = Number((seo as any)?.referring_domains || (seo as any)?.backlinks?.referring_domains || 0);
  const linkVelocity = Number((seo as any)?.link_velocity || (seo as any)?.backlinks?.link_velocity || 0);
  const topDomains = Array.isArray((seo as any)?.top_referring_domains) ? (seo as any).top_referring_domains : [];

  // Passed checks
  const passedChecks = [
    { label: 'Content Score', val: seo?.content_score, pass: Number(seo?.content_score || 0) >= 50 },
    { label: 'On-Page', val: seo?.on_page_score, pass: Number(seo?.on_page_score || 0) >= 50 },
    { label: 'Mobile', val: seo?.mobile_score, pass: Number(seo?.mobile_score || 0) >= 50 },
    { label: 'Page Speed', val: seo?.page_speed, pass: Number(seo?.page_speed || 0) >= 50 },
  ].filter(c => c.val !== undefined && c.val !== null);

  return (
    <IntelCard>
      <IntelLabel>Analytics Overview</IntelLabel>
      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #1a1a1a', marginBottom: 20 }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            background: 'transparent', border: 'none',
            borderBottom: tab === t.key ? '2px solid #00d4ff' : '2px solid transparent',
            color: tab === t.key ? '#00d4ff' : '#555',
            padding: '8px 20px', fontSize: 13, fontWeight: tab === t.key ? 700 : 400,
            cursor: 'pointer', transition: 'all 0.15s',
          }}>{t.label}</button>
        ))}
      </div>

      {/* Health tab */}
      {tab === 'health' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', border: `3px solid ${seoScore >= 70 ? '#00ff88' : seoScore >= 40 ? '#ff8800' : '#ff3333'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: seoScore >= 70 ? '#00ff88' : seoScore >= 40 ? '#ff8800' : '#ff3333' }}>{seoScore}</span>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>Overall Score</div>
              <div style={{ fontSize: 12, color: '#666' }}>{seoScore >= 70 ? 'Good' : seoScore >= 40 ? 'Needs Work' : 'Critical Issues'}</div>
            </div>
          </div>
          {[
            { label: 'Content', val: seo?.content_score },
            { label: 'On-Page', val: seo?.on_page_score },
            { label: 'Mobile', val: seo?.mobile_score },
            { label: 'Page Speed', val: seo?.page_speed },
          ].filter(s => s.val && typeof s.val !== 'object').map((s, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #1a1a1a' }}>
              <span style={{ color: '#888', fontSize: 12 }}>{s.label}</span>
              <span style={{ color: '#aaa', fontSize: 12, fontWeight: 600 }}>{String(s.val)}</span>
            </div>
          ))}
          {issues.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ color: '#666', fontSize: 11, textTransform: 'uppercase', marginBottom: 8 }}>Issues ({issues.length})</div>
              {issues.slice(0, 6).map((issue: any, i: number) => (
                <div key={i} style={{ fontSize: 12, color: '#aaa', padding: '5px 0', borderBottom: '1px solid #111', display: 'flex', gap: 6 }}>
                  <span style={{ color: issue?.severity === 'critical' ? '#ff3333' : '#ff8800', flexShrink: 0 }}>●</span>
                  <span>{typeof issue === 'string' ? issue : String(issue?.issue || issue?.description || issue?.message || '')}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Links tab */}
      {tab === 'links' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
            <div style={{ background: '#0d0d0d', border: '1px solid #151515', borderRadius: 6, padding: '12px 14px', textAlign: 'center' }}>
              <div style={{ color: '#fff', fontSize: 22, fontWeight: 800 }}>{da || '--'}</div>
              <div style={{ color: '#555', fontSize: 10, letterSpacing: '0.05em' }}>Domain Authority</div>
            </div>
            <div style={{ background: '#0d0d0d', border: '1px solid #151515', borderRadius: 6, padding: '12px 14px', textAlign: 'center' }}>
              <div style={{ color: '#fff', fontSize: 22, fontWeight: 800 }}>{referringDomains || '--'}</div>
              <div style={{ color: '#555', fontSize: 10, letterSpacing: '0.05em' }}>Referring Domains</div>
            </div>
            <div style={{ background: '#0d0d0d', border: '1px solid #151515', borderRadius: 6, padding: '12px 14px', textAlign: 'center' }}>
              <div style={{ color: '#00ff88', fontSize: 22, fontWeight: 800 }}>{linkVelocity ? `+${linkVelocity}` : '--'}</div>
              <div style={{ color: '#555', fontSize: 10, letterSpacing: '0.05em' }}>Links/Month</div>
            </div>
          </div>
          {topDomains.length > 0 ? (
            <div>
              <div style={{ color: '#555', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Top Referring Domains</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1a1a1a' }}>
                    <th style={{ color: '#444', padding: '6px 10px', textAlign: 'left', fontSize: 10, textTransform: 'uppercase' }}>Domain</th>
                    <th style={{ color: '#444', padding: '6px 10px', textAlign: 'right', fontSize: 10, textTransform: 'uppercase' }}>Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {topDomains.slice(0, 8).map((d: any, i: number) => (
                    <tr key={i} style={{ borderBottom: '1px solid #111' }}>
                      <td style={{ padding: '8px 10px', color: '#aaa', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 20, height: 20, borderRadius: 4, background: ['#22c55e','#f97316','#000','#333','#ff4500'][i%5], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#fff', fontWeight: 700 }}>
                          {(d.domain || d.name || '?').slice(0,2).toUpperCase()}
                        </div>
                        {d.domain || d.name}
                      </td>
                      <td style={{ padding: '8px 10px', color: '#00d4ff', textAlign: 'right', fontWeight: 600 }}>{d.rating || d.authority || '--'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ color: '#444', fontSize: 13 }}>No backlink data available yet.</p>
          )}
        </div>
      )}

      {/* AI/GEO tab */}
      {tab === 'ai-geo' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            <div style={{ background: '#0d0d0d', border: '1px solid #151515', borderRadius: 6, padding: '14px', textAlign: 'center' }}>
              <div style={{ color: geoScore >= 50 ? '#00ff88' : '#ff4444', fontSize: 28, fontWeight: 800 }}>{geoScore}</div>
              <div style={{ color: '#555', fontSize: 10, letterSpacing: '0.05em' }}>GEO Score</div>
            </div>
            <div style={{ background: '#0d0d0d', border: '1px solid #151515', borderRadius: 6, padding: '14px', textAlign: 'center' }}>
              <div style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>{geoScore >= 60 ? 'High' : geoScore >= 30 ? 'Medium' : 'Low'}</div>
              <div style={{ color: '#555', fontSize: 10, letterSpacing: '0.05em' }}>Citation Potential</div>
            </div>
          </div>
          {/* Overall Visibility grid */}
          <div style={{ color: '#555', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Overall Visibility</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
            {[
              { label: 'Visibility', value: geoScore || 0, color: geoScore >= 50 ? '#00ff88' : '#ff4444' },
              { label: 'Sentiment', value: ((geo as any)?.sentiment || 0).toFixed ? Number((geo as any)?.sentiment || 0).toFixed(2) : '0.00', color: '#fff' },
              { label: 'Avg Position', value: (geo as any)?.avg_position || '--', color: '#ff4444' },
              { label: 'Mentions', value: (geo as any)?.mentions || (geo as any)?.total_mentions || 0, color: '#fff' },
            ].map((m, i) => (
              <div key={i} style={{ background: '#0a0a0a', border: '1px solid #151515', borderRadius: 6, padding: '10px 12px' }}>
                <div style={{ color: m.color, fontSize: 18, fontWeight: 700 }}>{m.value}</div>
                <div style={{ color: '#444', fontSize: 10 }}>{m.label}</div>
              </div>
            ))}
          </div>
          {/* Platform status */}
          {platforms.length > 0 && (
            <div>
              <div style={{ color: '#555', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Platform Status</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1a1a1a' }}>
                    <th style={{ color: '#444', padding: '6px 10px', textAlign: 'left', fontSize: 10, textTransform: 'uppercase' }}>Platform</th>
                    <th style={{ color: '#444', padding: '6px 10px', textAlign: 'left', fontSize: 10, textTransform: 'uppercase' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {platforms.map((p: any, i: number) => {
                    const icons: Record<string, string> = { chatgpt: '🤖', perplexity: '🔮', claude: '🟠', gemini: '✦', 'google ai': '✦' };
                    const pName = (p.name || '').toLowerCase();
                    const icon = Object.entries(icons).find(([k]) => pName.includes(k))?.[1] || '🌐';
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid #111' }}>
                        <td style={{ padding: '10px', color: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 16 }}>{icon}</span> {p.name}
                          <span style={{ color: p.score >= 50 ? '#00ff88' : p.score >= 20 ? '#ff8800' : '#ff3333', fontSize: 11, marginLeft: 'auto', fontWeight: 700 }}>{p.score}/100</span>
                        </td>
                        <td style={{ padding: '10px', color: '#666', fontSize: 11, lineHeight: 1.5 }}>{p.summary}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Passed tab */}
      {tab === 'passed' && (
        <div>
          {passedChecks.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {passedChecks.map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#0a0a0a', border: '1px solid #151515', borderRadius: 6 }}>
                  <span style={{ color: c.pass ? '#00ff88' : '#ff4444', fontSize: 16 }}>{c.pass ? '✓' : '✗'}</span>
                  <span style={{ color: '#aaa', fontSize: 13, flex: 1 }}>{c.label}</span>
                  <span style={{ color: c.pass ? '#00ff88' : '#ff4444', fontSize: 13, fontWeight: 600 }}>{String(c.val)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#444', fontSize: 13 }}>No pass/fail data available.</p>
          )}
          {recommendations.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ color: '#555', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Recommendations</div>
              {recommendations.slice(0, 5).map((r, i) => (
                <div key={i} style={{ fontSize: 12, color: '#aaa', padding: '5px 0', display: 'flex', gap: 6 }}>
                  <span style={{ color: '#00d4ff', flexShrink: 0 }}>→</span><span>{r}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </IntelCard>
  );
}

// ─── Competitor Chips Grid ───────────────────────────────────────────────────

function CompetitorChipsSection({ competitors, onAction }: { competitors: IntelligenceData['competitors']; onAction?: (item: any) => void }) {
  const [selectedComp, setSelectedComp] = useState<any>(null);
  const list: any[] = [
    ...((competitors.dashboard?.competitors) || []),
    ...((competitors.polsia as { competitors?: any[] })?.competitors || []),
  ];

  const chipColors = ['#ff4400', '#ff8800', '#aa44ff', '#333', '#00d4ff', '#00ff88', '#ffcc00', '#3B82F6', '#666', '#ff3333'];

  if (list.length === 0) {
    return (
      <IntelCard>
        <IntelLabel>Competitors</IntelLabel>
        <p style={{ color: '#444', fontSize: 13 }}>No competitor data found.</p>
      </IntelCard>
    );
  }

  return (
    <IntelCard>
      <IntelLabel>Competitors</IntelLabel>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {list.map((c: any, i: number) => {
          const domain = c.domain || c.website || c.name || '';
          const displayName = domain.replace(/^https?:\/\//, '').replace(/\/$/, '') || c.name;
          const initials = (c.name || displayName).slice(0, 2).toUpperCase();
          const isSelected = selectedComp === i;
          return (
            <div key={i}>
              <div onClick={() => setSelectedComp(isSelected ? null : i)} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: isSelected ? '#111' : '#0d0d0d', border: `1px solid ${isSelected ? '#00d4ff33' : '#1a1a1a'}`, borderRadius: 8,
                padding: '10px 14px', cursor: 'pointer', transition: 'all 0.15s',
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 6,
                  background: chipColors[i % chipColors.length],
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0,
                }}>{initials}</div>
                <span style={{ color: '#aaa', fontSize: 13, flex: 1 }}>{displayName}</span>
                <span onClick={(e) => { e.stopPropagation(); onAction?.({ actionLabel: 'Review', title: `Remove competitor: ${c.name || displayName}`, description: `Remove ${c.name || displayName} from the competitive landscape tracking.`, source: 'Competitors', sourceIcon: '⚔️', sourceColor: '#ff4400', chatSection: 'competitors' }); }} style={{ color: '#333', fontSize: 14, cursor: 'pointer', flexShrink: 0 }}>×</span>
              </div>
              {/* Expanded competitor info */}
              {isSelected && (
                <div style={{ background: '#0a0a0a', border: '1px solid #1a1a1a', borderTop: 'none', borderRadius: '0 0 8px 8px', padding: '12px 14px', marginTop: -4 }}>
                  <div style={{ color: '#fff', fontSize: 14, fontWeight: 700, marginBottom: 6 }}>{c.name || displayName}</div>
                  {c.description && <p style={{ color: '#888', fontSize: 12, lineHeight: 1.5, margin: '0 0 8px' }}>{c.description}</p>}
                  {c.features && <p style={{ color: '#888', fontSize: 12, lineHeight: 1.5, margin: '0 0 8px' }}>{c.features}</p>}
                  {(c.strengths || c.pros) && Array.isArray(c.strengths || c.pros) && (
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ color: '#00ff88', fontSize: 10, letterSpacing: '0.1em', marginBottom: 4 }}>STRENGTHS</div>
                      {(c.strengths || c.pros).slice(0, 3).map((s: string, j: number) => (
                        <div key={j} style={{ color: '#888', fontSize: 11, padding: '2px 0 2px 8px', borderLeft: '2px solid #00ff8833' }}>{s}</div>
                      ))}
                    </div>
                  )}
                  {(c.weaknesses || c.cons) && Array.isArray(c.weaknesses || c.cons) && (
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ color: '#ff4444', fontSize: 10, letterSpacing: '0.1em', marginBottom: 4 }}>WEAKNESSES</div>
                      {(c.weaknesses || c.cons).slice(0, 3).map((w: string, j: number) => (
                        <div key={j} style={{ color: '#888', fontSize: 11, padding: '2px 0 2px 8px', borderLeft: '2px solid #ff444433' }}>{w}</div>
                      ))}
                    </div>
                  )}
                  {c.funding && <div style={{ color: '#00d4ff', fontSize: 11, marginBottom: 6 }}>{c.funding}</div>}
                  {c.pricing && <div style={{ color: '#666', fontSize: 11, marginBottom: 6 }}>Pricing: {typeof c.pricing === 'string' ? c.pricing : c.pricing?.model || ''}</div>}
                  {(c.similarity_score || c.similarity) > 0 && <span style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', color: '#00d4ff', padding: '2px 8px', borderRadius: 3, fontSize: 10, marginRight: 6 }}>{c.similarity_score || c.similarity}% similar</span>}
                  {(c.threat_level || c.market_position) && <span style={{ background: 'rgba(255,136,0,0.08)', border: '1px solid rgba(255,136,0,0.2)', color: '#ff8800', padding: '2px 8px', borderRadius: 3, fontSize: 10 }}>{c.threat_level || c.market_position}</span>}
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    {domain && <a href={domain.startsWith('http') ? domain : `https://${domain}`} target="_blank" rel="noopener noreferrer" style={{ background: '#111', border: '1px solid #222', color: '#00d4ff', padding: '4px 12px', borderRadius: 6, fontSize: 11, textDecoration: 'none', cursor: 'pointer' }}>Visit ↗</a>}
                    <button onClick={() => onAction?.({ actionLabel: 'Review', title: `Analyze competitor: ${c.name || displayName}`, description: `Deep dive into ${c.name || displayName}. Compare their product, pricing, positioning, and market share against ours. Identify opportunities to differentiate.`, source: 'Competitors', sourceIcon: '⚔️', sourceColor: '#ff4400', chatSection: 'competitors' })} style={{ background: '#111', border: '1px solid #222', color: '#888', padding: '4px 12px', borderRadius: 6, fontSize: 11, cursor: 'pointer' }}>Analyze</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {/* Add button */}
        <div onClick={() => onAction?.({ actionLabel: 'Post', title: 'Add a new competitor to track', description: 'Add a new competitor to the competitive landscape. Provide the company name or domain and I will research them.', source: 'Competitors', sourceIcon: '⚔️', sourceColor: '#ff4400', chatSection: 'competitors' })} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: '#0a0a0a', border: '1px dashed #222', borderRadius: 8,
          padding: '10px 14px', cursor: 'pointer', transition: 'all 0.15s',
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6,
            background: '#111', border: '1px solid #222',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, color: '#555',
          }}>+</div>
          <span style={{ color: '#555', fontSize: 13 }}>Add</span>
        </div>
      </div>
    </IntelCard>
  );
}

// ─── Ads Performance Section ─────────────────────────────────────────────────

function AdsSection({ ads }: { ads: any }) {
  const adsList = Array.isArray(ads?.ads) ? ads.ads : [];
  const spendToday = ads?.spend_today || 0;
  const dailyBudget = ads?.daily_budget || 0;
  const adsCreated = ads?.ads_created_24h || adsList.length;

  if (!ads || adsList.length === 0) {
    return (
      <IntelCard>
        <IntelLabel>Ads</IntelLabel>
        <p style={{ color: '#444', fontSize: 13 }}>No ads data available. Connect Meta/Google Ads to populate.</p>
      </IntelCard>
    );
  }

  return (
    <IntelCard>
      <div style={{ borderBottom: '2px solid #fff', paddingBottom: 12, marginBottom: 16 }}>
        <div style={{ color: '#fff', fontSize: 18, fontWeight: 800 }}>Ads</div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <span style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>Spend Today: ${Number(spendToday).toFixed(2)}</span>
        {dailyBudget > 0 && <span style={{ color: '#555', fontSize: 13, marginLeft: 8 }}>(${Number(dailyBudget).toFixed(2)}/day budget)</span>}
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1a1a1a' }}>
              {['Ad', 'Spend', 'Impr.', 'Clicks', 'CTR', 'CPC'].map(h => (
                <th key={h} style={{ color: '#444', padding: '6px 10px', textAlign: h === 'Ad' ? 'left' : 'right', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {adsList.slice(0, 8).map((ad: any, i: number) => (
              <tr key={i} style={{ borderBottom: '1px solid #111' }}>
                <td style={{ padding: '8px 10px' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 4, background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {ad.thumbnail ? <img src={ad.thumbnail} style={{ width: 32, height: 32, borderRadius: 4, objectFit: 'cover' }} /> : <span style={{ fontSize: 14 }}>📷</span>}
                  </div>
                </td>
                <td style={{ padding: '8px 10px', color: '#aaa', textAlign: 'right' }}>${Number(ad.spend || 0).toFixed(2)}</td>
                <td style={{ padding: '8px 10px', color: '#888', textAlign: 'right' }}>{ad.impressions || 0}</td>
                <td style={{ padding: '8px 10px', color: '#888', textAlign: 'right' }}>{ad.clicks || 0}</td>
                <td style={{ padding: '8px 10px', color: '#888', textAlign: 'right' }}>{Number(ad.ctr || 0).toFixed(2)}%</td>
                <td style={{ padding: '8px 10px', color: '#00d4ff', textAlign: 'right', fontWeight: 600 }}>${Number(ad.cpc || 0).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 12, color: '#444', fontSize: 12 }}>+ {adsCreated} ads created in the past 24h</div>
    </IntelCard>
  );
}

// ─── AI CMO Feed (Accordion) ─────────────────────────────────────────────────

function AICMOFeedSection({ feed, seo, geo, goals, storedCmo, onAction, companyInfo, brandDna, storedHn, storedReddit }: { feed: FeedData | null; seo: Record<string, unknown> | null; geo: Record<string, unknown> | null; goals: GoalsData | null; storedCmo?: any[]; onAction?: (item: any) => void; companyInfo?: any; brandDna?: any; storedHn?: any[]; storedReddit?: any[] }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ seo: true });

  // Use stored CMO data from MongoDB if available
  const storedSeoGeo = (storedCmo || []).filter((c: any) => c.section === 'seo_geo');

  // SEO + GEO: Build real actionable items from issues + geo recs + geo platforms
  const issues = Array.isArray(seo?.issues) ? (seo.issues as any[]) : [];
  const geoRecs = Array.isArray(geo?.recommendations) ? (geo.recommendations as any[]) : [];
  const seoRecs = Array.isArray(seo?.recommendations) ? (seo.recommendations as any[]) : [];
  const geoPlatforms = Array.isArray(geo?.platforms) ? (geo.platforms as any[]) : [];
  const allRecs = storedSeoGeo.length > 0 ? storedSeoGeo : [
    ...issues.map((iss: any) => ({
      title: typeof iss === 'string' ? iss : String(iss?.issue || iss?.description || iss?.message || ''),
      severity: (iss?.severity === 'critical' || String(iss?.severity).toLowerCase() === 'critical') ? 'Critical' : 'High',
      category: iss?.category || 'On-Page',
    })),
    ...geoRecs.map((r: any) => ({
      title: typeof r === 'string' ? r : String(r?.recommendation || r?.description || ''),
      severity: 'High',
      category: 'GEO',
    })),
    ...geoPlatforms.filter((p: any) => p.score < 20).map((p: any) => ({
      title: `${p.name}: Score ${p.score}/100. ${(p.summary || '').slice(0, 100)}`,
      severity: p.score < 5 ? 'Critical' : 'High',
      category: 'AI Visibility',
    })),
  ];

  // Reddit: use stored data from venture_reddit_feed collection
  const polsiaFeed = (feed as any)?.feed || (feed as any)?.events || [];
  const seoKeywords = Array.isArray((seo as any)?.keywords?.detected) ? (seo as any).keywords.detected : [];
  const redditOpportunities = (storedReddit || []).map((r: any) => ({
    title: r.title || '',
    subreddit: r.subreddit || 'r/startups',
    upvotes: r.upvotes || 0,
    comments: r.comments || 0,
    url: r.url || '',
  }));

  // X Ideas: generate from goals with low performance or brand positioning
  const xItems = polsiaFeed.filter((e: any) => e.type === 'twitter' || e.type === 'x' || e.platform === 'x');
  const lowPerfGoals = (goals?.workstreams || []).flatMap(ws => (ws.goals || []).filter(g => g.performanceScore < 30 && g.performanceScore > 0));
  const xIdeas = xItems.length > 0 ? xItems.map((x: any) => ({
    text: x.message || x.content || x.idea || '',
    topic: 'Social',
  })) : [
    ...(seoKeywords.length > 0 ? [{ text: `Thread idea: "Why ${seoKeywords[0]?.keyword || seoKeywords[0] || 'AI matching'} is broken and how we fix it" — position as thought leader`, topic: 'Thought Leadership' }] : []),
    ...(lowPerfGoals.length > 0 ? [{ text: `Share progress update: "${lowPerfGoals[0].name}" — transparency builds trust with early adopters`, topic: 'Building in Public' }] : []),
    ...((geo as any)?.overall_score < 50 ? [{ text: `Reply to AI tool comparison threads — increase brand mentions for GEO visibility (current score: ${(geo as any)?.overall_score || 0}/100)`, topic: 'GEO Strategy' }] : []),
  ].filter(x => x.text);

  // Articles: generate from SEO weaknesses and goal topics
  const articleItems = polsiaFeed.filter((e: any) => e.type === 'article' || e.type === 'content');
  const seoScore = Number(seo?.overall_score || 0);
  const articles = articleItems.length > 0 ? articleItems.map((a: any) => ({
    title: a.title || a.message || '',
    topic: a.topic || a.category || 'Growth',
  })) : [
    ...(seoScore > 0 && seoScore < 50 ? [{ title: `SEO score is ${seoScore}/100. Publish a comparison article targeting "${seoKeywords[0]?.keyword || seoKeywords[0] || 'AI expert matching'}" to build indexable content`, topic: 'SEO Recovery' }] : []),
    ...(issues.length > 3 ? [{ title: `Create FAQ page addressing ${issues.length} SEO issues — structured data will boost AI citation potential`, topic: 'Technical SEO' }] : []),
    ...((goals?.workstreams || []).some(ws => ws.name?.toLowerCase().includes('demand')) ? [{ title: `Write case study on expert matching ROI — target "how to find domain experts" search intent`, topic: 'Demand Generation' }] : []),
  ].filter(a => a.title);

  // Hacker News: use stored data from venture_hn_feed collection
  const hnItems = (storedHn || []).map((h: any) => ({
    title: h.title || '',
    url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
    points: h.points || 0,
    comments: h.comments || 0,
    objectID: h.objectID || '',
  }));
  const hnLoading = false;

  const sections = [
    { key: 'hn', icon: '🟧', label: 'Hacker News', count: hnItems.length, color: '#ff6600', isHn: true },
    { key: 'reddit', icon: '🟠', label: 'Reddit Opportunities', count: redditOpportunities.length, color: '#ff4500' },
    { key: 'seo', icon: '🌐', label: 'SEO + GEO Recommendations', count: allRecs.length, color: '#00d4ff' },
    { key: 'x', icon: '𝕏', label: 'X Ideas', count: xIdeas.length, color: '#fff' },
    { key: 'articles', icon: '✏️', label: 'Articles', count: articles.length, color: '#aa44ff' },
  ];

  function toggle(key: string) {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <IntelCard>
      <IntelLabel>AI CMO Feed</IntelLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {sections.map(s => (
          <div key={s.key}>
            {/* Accordion header */}
            <div onClick={() => toggle(s.key)} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
              cursor: 'pointer', borderBottom: '1px solid #111',
              background: expanded[s.key] ? '#0a0a0a' : 'transparent',
            }}>
              <span style={{ fontSize: 16 }}>{s.icon}</span>
              <span style={{ color: '#fff', fontSize: 14, fontWeight: 600, flex: 1 }}>{s.label}</span>
              <span style={{ color: '#555', fontSize: 11, whiteSpace: 'nowrap', flexShrink: 0 }}>
                {s.count > 0 ? (s.key === 'seo' ? `Found ${s.count} issues` : s.key === 'reddit' ? `Found ${s.count} mentions` : s.key === 'hn' ? `${s.count} posts` : s.key === 'x' ? `Generated ${s.count} idea${s.count !== 1 ? 's' : ''}` : `Generated ${s.count} topic${s.count !== 1 ? 's' : ''}`) : 'None yet'}
              </span>
              <span style={{ color: '#333', fontSize: 14, transform: expanded[s.key] ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>▾</span>
            </div>

            {/* Accordion content */}
            {expanded[s.key] && (
              <div style={{ padding: '8px 14px 14px 14px' }}>
                {/* Reddit */}
                {/* Hacker News */}
                {s.key === 'hn' && (hnLoading ? (
                  <p style={{ color: '#555', fontSize: 12 }}>Searching Hacker News...</p>
                ) : hnItems.length > 0 ? hnItems.map((h, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < hnItems.length - 1 ? '1px solid #111' : 'none' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: '#ddd', fontSize: 13, fontWeight: 500 }}>{h.title}</div>
                      <div style={{ display: 'flex', gap: 10, marginTop: 4, alignItems: 'center' }}>
                        <span style={{ background: 'rgba(255,102,0,0.12)', border: '1px solid rgba(255,102,0,0.3)', color: '#ff6600', padding: '1px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600 }}>HN</span>
                        <span style={{ color: '#555', fontSize: 11 }}>▲ {h.points}</span>
                        <span style={{ color: '#555', fontSize: 11 }}>💬 {h.comments}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <a href={h.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                        <button style={{ background: '#fff', color: '#000', border: 'none', padding: '6px 16px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Read</button>
                      </a>
                      <a href={`https://news.ycombinator.com/item?id=${h.objectID}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                        <button onClick={(e) => { e.preventDefault(); onAction?.({ actionLabel: 'Post', title: h.title, source: 'Hacker News', sourceIcon: '🟧', sourceColor: '#ff6600', chatSection: 'hn', url: h.url }); }} style={{ background: '#1a1a1a', color: '#ff6600', border: '1px solid #ff660033', padding: '6px 16px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Post</button>
                      </a>
                    </div>
                  </div>
                )) : <p style={{ color: '#444', fontSize: 12 }}>No relevant Hacker News posts found.</p>)}

                {/* Reddit */}
                {s.key === 'reddit' && (redditOpportunities.length > 0 ? redditOpportunities.map((r: any, i: number) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < redditOpportunities.length - 1 ? '1px solid #111' : 'none' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: '#ddd', fontSize: 13, fontWeight: 500, lineHeight: 1.5 }}>{r.title}</div>
                      <div style={{ display: 'flex', gap: 10, marginTop: 4, alignItems: 'center' }}>
                        <span style={{ background: 'rgba(255,69,0,0.12)', border: '1px solid rgba(255,69,0,0.3)', color: '#ff4500', padding: '1px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600 }}>{r.subreddit}</span>
                        <span style={{ color: '#555', fontSize: 11 }}>▲ {r.upvotes}</span>
                        <span style={{ color: '#555', fontSize: 11 }}>💬 {r.comments}</span>
                      </div>
                    </div>
                    <button onClick={() => onAction?.({ actionLabel: 'Post', title: r.title, source: 'Reddit', sourceIcon: '🟠', sourceColor: '#ff4500', chatSection: 'reddit', subreddit: r.subreddit, upvotes: r.upvotes, comments: r.comments })} style={{ background: '#fff', color: '#000', border: 'none', padding: '6px 16px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>Post</button>
                  </div>
                )) : <p style={{ color: '#444', fontSize: 12 }}>No Reddit opportunities detected yet.</p>)}

                {/* SEO + GEO */}
                {s.key === 'seo' && (allRecs.length > 0 ? allRecs.map((r, i) => (
                  <div key={i} style={{ padding: '10px 0', borderBottom: i < allRecs.length - 1 ? '1px solid #111' : 'none' }}>
                    <div style={{ color: '#ddd', fontSize: 13, fontWeight: 500, lineHeight: 1.5, wordBreak: 'break-word', marginBottom: 6 }}>{r.title}</div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{
                        background: r.severity === 'Critical' ? 'rgba(255,51,51,0.1)' : 'rgba(255,136,0,0.1)',
                        border: `1px solid ${r.severity === 'Critical' ? 'rgba(255,51,51,0.3)' : 'rgba(255,136,0,0.3)'}`,
                        color: r.severity === 'Critical' ? '#ff3333' : '#ff8800',
                        padding: '1px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700,
                      }}>{r.severity}</span>
                      <span style={{ color: '#555', fontSize: 11 }}>{r.category}</span>
                      <button onClick={() => onAction?.({ actionLabel: 'Fix', title: r.title, description: r.title, source: 'SEO/GEO', sourceIcon: '🔧', sourceColor: '#ff8800', chatSection: 'seo', category: r.category, severity: r.severity })} style={{ background: '#fff', color: '#000', border: 'none', padding: '4px 14px', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Fix</button>
                    </div>
                  </div>
                )) : <p style={{ color: '#444', fontSize: 12 }}>No SEO/GEO issues to fix.</p>)}

                {/* X Ideas */}
                {s.key === 'x' && (xIdeas.length > 0 ? xIdeas.map((x, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < xIdeas.length - 1 ? '1px solid #111' : 'none' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#ddd', fontSize: 13 }}>{x.text}</div>
                    </div>
                    <button onClick={() => onAction?.({ actionLabel: 'Post', text: x.text, source: 'X', sourceIcon: '𝕏', sourceColor: '#fff', chatSection: 'x' })} style={{ background: '#fff', color: '#000', border: 'none', padding: '6px 16px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>Post</button>
                  </div>
                )) : <p style={{ color: '#444', fontSize: 12 }}>No tweet ideas generated yet.</p>)}

                {/* Articles */}
                {s.key === 'articles' && (articles.length > 0 ? articles.map((a, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < articles.length - 1 ? '1px solid #111' : 'none' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#ddd', fontSize: 13 }}>{a.title}</div>
                      <span style={{ color: '#555', fontSize: 11 }}>{a.topic}</span>
                    </div>
                    <button onClick={() => onAction?.({ actionLabel: 'Write', title: a.title, topic: a.topic, source: 'Articles', sourceIcon: '✏️', sourceColor: '#aa44ff', chatSection: 'articles' })} style={{ background: '#fff', color: '#000', border: 'none', padding: '6px 16px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>Write</button>
                  </div>
                )) : <p style={{ color: '#444', fontSize: 12 }}>No article topics generated yet.</p>)}
              </div>
            )}
          </div>
        ))}
      </div>
    </IntelCard>
  );
}

// ─── Emails Drafted Section ──────────────────────────────────────────────────

function EmailsDraftedSection({ brandDna, companyInfo, onAction }: { brandDna: any; companyInfo: any; onAction?: (item: any) => void }) {
  const companyName = companyInfo?.name || brandDna?.brand_name || 'the venture';
  const tagline = companyInfo?.tagline || (brandDna?.brand_dna || brandDna)?.tagline || '';
  const vp = companyInfo?.value_proposition || '';
  const bd = (brandDna?.brand_dna || brandDna) || {};
  const innerBd = bd.brand_dna || {};
  const usps = innerBd.usps || bd.usps || [];
  const keyMsgs = innerBd.key_messages || bd.key_messages || [];
  const industry = companyInfo?.industry || '';
  const audience = companyInfo?.target_audience || '';
  const desc = companyInfo?.description || '';

  // Build persona-aware emails
  const personas = innerBd.target_personas || bd.target_personas || {};
  const personaList = Array.isArray(personas) ? personas : Object.values(personas);
  const firstPersona = personaList[0] || {};
  const personaName = firstPersona?.name || firstPersona?.title || '';
  const personaPain = firstPersona?.pain_point || firstPersona?.description || '';

  const emails = [
    {
      to: personaName ? `${personaName}s` : 'Design Partners',
      subject: `Quick question about ${industry || 'your workflow'}`,
      preview: `Hi [Name],\n\nI noticed ${personaPain ? `you might be dealing with: ${personaPain.slice(0, 100)}` : `your work in ${industry || 'this space'}`}.\n\nWe built ${companyName}${vp ? ` to ${vp.slice(0, 80).toLowerCase()}` : ''}. ${usps[0] ? usps[0].slice(0, 120) : ''}\n\nWould you be open to a 15-min demo? We're onboarding our first 10 design partners and I think there's a strong fit.`,
      status: 'ready',
      type: 'Outreach',
    },
    {
      to: 'Seed Investors',
      subject: `${companyName}: ${industry ? industry + ' — ' : ''}Pre-seed opportunity`,
      preview: `Hi [Name],\n\n${desc ? desc.slice(0, 150) : `${companyName} is ${vp || tagline || 'solving a critical problem in this space'}`}.\n\n${keyMsgs[0] ? 'Our core insight: ' + keyMsgs[0].slice(0, 120) : ''}\n\nWe're raising a pre-seed round. ${usps[0] ? 'Key differentiator: ' + usps[0].slice(0, 100) : ''}\n\nWould love 20 minutes to walk you through the opportunity.`,
      status: 'ready',
      type: 'Fundraising',
    },
    {
      to: 'Waitlist Signups',
      subject: `You're in, [Name]. Here's what to do first.`,
      preview: `Hey [Name],\n\nWelcome to ${companyName}. You're one of the first people to get access.\n\n${keyMsgs[1] ? keyMsgs[1].slice(0, 120) : `Here's what makes ${companyName} different from everything else you've tried`}.\n\nYour first step: ${usps[1] ? usps[1].slice(0, 100) : 'Complete your profile and run your first session'}.\n\nQuestions? Reply to this email directly.`,
      status: 'draft',
      type: 'Nurture',
    },
  ];

  return (
    <IntelCard>
      <IntelLabel>Emails Drafted ({emails.length})</IntelLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {emails.map((e, i) => (
          <div key={i} style={{ background: '#0d0d0d', border: '1px solid #151515', borderRadius: 8, padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14 }}>✉️</span>
                <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{e.subject}</span>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <span style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', color: '#00d4ff', padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600 }}>{e.type}</span>
                <span style={{
                  background: e.status === 'ready' ? 'rgba(0,255,136,0.08)' : 'rgba(255,136,0,0.08)',
                  border: `1px solid ${e.status === 'ready' ? 'rgba(0,255,136,0.2)' : 'rgba(255,136,0,0.2)'}`,
                  color: e.status === 'ready' ? '#00ff88' : '#ff8800',
                  padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600,
                }}>{e.status === 'ready' ? 'Ready' : 'Draft'}</span>
              </div>
            </div>
            <div style={{ color: '#555', fontSize: 11, marginBottom: 6 }}>To: {e.to}</div>
            <p style={{ color: '#888', fontSize: 12, lineHeight: 1.5, margin: 0 }}>{e.preview}</p>
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button onClick={() => onAction?.({ actionLabel: e.status === 'ready' ? 'Send' : 'Edit', subject: e.subject, to: e.to, description: e.preview, source: 'Email', sourceIcon: '✉️', sourceColor: '#00d4ff', chatSection: 'email' })} style={{ background: e.status === 'ready' ? '#fff' : '#1a1a1a', color: e.status === 'ready' ? '#000' : '#888', border: 'none', padding: '6px 16px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                {e.status === 'ready' ? 'Send' : 'Edit'}
              </button>
              <button onClick={() => onAction?.({ actionLabel: 'Review', subject: e.subject, to: e.to, description: e.preview, source: 'Email', sourceIcon: '✉️', sourceColor: '#00d4ff', chatSection: 'email' })} style={{ background: '#111', color: '#555', border: '1px solid #222', padding: '6px 16px', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>Preview</button>
            </div>
          </div>
        ))}
      </div>
    </IntelCard>
  );
}

// ─── LinkedIn Posts Drafted Section ──────────────────────────────────────────

function LinkedInDraftedSection({ brandDna, companyInfo, goals, onAction }: { brandDna: any; companyInfo: any; goals: GoalsData | null; onAction?: (item: any) => void }) {
  const companyName = companyInfo?.name || brandDna?.brand_name || 'Our venture';
  const bd = (brandDna?.brand_dna || brandDna) || {};
  const innerBd = bd.brand_dna || {};
  const themes = innerBd.content_themes || bd.content_themes || [];
  const keyMsgs = innerBd.key_messages || bd.key_messages || [];
  const usps = innerBd.usps || bd.usps || [];
  const positioning = innerBd.competitive_positioning || bd.competitive_positioning || '';
  const vp = companyInfo?.value_proposition || '';
  const industry = companyInfo?.industry || '';
  const desc = companyInfo?.description || '';
  const tagline = companyInfo?.tagline || innerBd.tagline || bd.tagline || '';

  const posts = [
    {
      author: 'CEO',
      content: themes[0]
        ? `${themes[0]}\n\n${keyMsgs[0] ? keyMsgs[0] : ''}\n\n${usps[0] ? `At ${companyName}, we took a different approach: ${usps[0].slice(0, 150)}` : `That's why we built ${companyName}.`}\n\nWe're in early access now. DM me if you want in.`
        : `The ${industry || 'industry'} is broken. Here's why.\n\n${desc ? desc.slice(0, 200) : `Most solutions in this space are built for the wrong user.`}\n\n${vp ? `${companyName}: ${vp.slice(0, 120)}` : `We built ${companyName} to fix this.`}\n\nThoughts? 👇`,
      type: 'Thought Leadership',
      status: 'ready',
      engagement: '~2.5K impressions',
    },
    {
      author: 'Company Page',
      content: `Introducing ${companyName}${tagline ? `: ${tagline}` : ''}.\n\n${keyMsgs.length > 0 ? keyMsgs.slice(0, 2).map((m: string, i: number) => `${i === 0 ? '→' : '→'} ${m}`).join('\n') : `→ ${vp || desc?.slice(0, 120) || 'A new approach to an old problem.'}`}\n\n${usps.length > 0 ? `What makes us different:\n${usps.slice(0, 2).map((u: string) => `✓ ${u.slice(0, 100)}`).join('\n')}` : ''}\n\nJoin the waitlist → Link in comments`,
      type: 'Brand Awareness',
      status: 'ready',
      engagement: '~1.2K impressions',
    },
    {
      author: 'CEO',
      content: positioning
        ? `Where does ${companyName} sit in the market?\n\n${typeof positioning === 'string' ? positioning.slice(0, 300) : JSON.stringify(positioning).slice(0, 300)}\n\nWe're not trying to be everything to everyone. We're building for the people who need this most.`
        : `I spent the last 6 months talking to ${industry ? industry.toLowerCase() + ' professionals' : 'users'} about what's broken.\n\nThe #1 complaint: "${keyMsgs[0] ? keyMsgs[0].slice(0, 100) : 'existing tools don\'t solve the real problem'}."\n\nThat's exactly what ${companyName} addresses.\n\nWhat's your biggest pain point? 👇`,
      type: 'Engagement',
      status: 'draft',
      engagement: '~800 impressions',
    },
  ];

  return (
    <IntelCard>
      <IntelLabel>LinkedIn Posts Drafted ({posts.length})</IntelLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {posts.map((p, i) => (
          <div key={i} style={{ background: '#0d0d0d', border: '1px solid #151515', borderRadius: 8, padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 24, height: 24, borderRadius: 4, background: '#0077B5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#fff', fontWeight: 700 }}>in</div>
                <span style={{ color: '#aaa', fontSize: 12, fontWeight: 600 }}>{p.author}</span>
                <span style={{ color: '#333', fontSize: 11 }}>· {p.engagement}</span>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <span style={{ background: 'rgba(0,119,181,0.1)', border: '1px solid rgba(0,119,181,0.2)', color: '#0077B5', padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600 }}>{p.type}</span>
                <span style={{
                  background: p.status === 'ready' ? 'rgba(0,255,136,0.08)' : 'rgba(255,136,0,0.08)',
                  border: `1px solid ${p.status === 'ready' ? 'rgba(0,255,136,0.2)' : 'rgba(255,136,0,0.2)'}`,
                  color: p.status === 'ready' ? '#00ff88' : '#ff8800',
                  padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600,
                }}>{p.status === 'ready' ? 'Ready' : 'Draft'}</span>
              </div>
            </div>
            <p style={{ color: '#ccc', fontSize: 13, lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>{p.content}</p>
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button onClick={() => onAction?.({ actionLabel: p.status === 'ready' ? 'Publish' : 'Edit', content: p.content, author: p.author, description: p.content, source: 'LinkedIn', sourceIcon: 'in', sourceColor: '#0077B5', chatSection: 'linkedin' })} style={{ background: p.status === 'ready' ? '#0077B5' : '#1a1a1a', color: '#fff', border: 'none', padding: '6px 16px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                {p.status === 'ready' ? 'Publish' : 'Edit'}
              </button>
              <button onClick={() => onAction?.({ actionLabel: 'Post', content: p.content, author: p.author, description: p.content, source: 'LinkedIn', sourceIcon: 'in', sourceColor: '#0077B5', chatSection: 'linkedin', title: 'Schedule LinkedIn Post' })} style={{ background: '#111', color: '#555', border: '1px solid #222', padding: '6px 16px', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>Schedule</button>
            </div>
          </div>
        ))}
      </div>
    </IntelCard>
  );
}

// ─── Ads From DB (venture_ads collection) ────────────────────────────────────

function AdsFromDBSection({ ads, onAction }: { ads: any; onAction?: (item: any) => void }) {
  const [expandedAd, setExpandedAd] = useState<number | null>(null);
  const adsList = Array.isArray(ads?.ads) ? ads.ads : [];
  const spendToday = ads?.spend_today || 0;
  const dailyBudget = ads?.daily_budget || 0;
  const adsCreated = ads?.ads_created_24h || adsList.length;

  if (adsList.length === 0) {
    return (
      <IntelCard>
        <IntelLabel>Ads</IntelLabel>
        <p style={{ color: '#444', fontSize: 13 }}>No ads data. Connect ad accounts or generate HeyGen avatar ads.</p>
      </IntelCard>
    );
  }

  return (
    <IntelCard>
      {/* Header with line */}
      <div style={{ borderBottom: '2px solid #fff', paddingBottom: 10, marginBottom: 14 }}>
        <div style={{ color: '#fff', fontSize: 18, fontWeight: 800 }}>Ads</div>
      </div>

      {/* Spend summary */}
      <div style={{ marginBottom: 16 }}>
        <span style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>Spend Today: ${Number(spendToday).toFixed(2)}</span>
        {dailyBudget > 0 && <span style={{ color: '#555', fontSize: 13, marginLeft: 8 }}>(${Number(dailyBudget).toFixed(2)}/day budget)</span>}
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1a1a1a' }}>
              {['Ad', 'Spend', 'Impr.', 'Clicks', 'CTR', 'CPC'].map(h => (
                <th key={h} style={{ color: '#555', padding: '8px 12px', textAlign: h === 'Ad' ? 'left' : 'right', fontSize: 11, fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {adsList.map((ad: any, i: number) => (
              <>
                <tr key={i} onClick={() => setExpandedAd(expandedAd === i ? null : i)} style={{ borderBottom: '1px solid #111', cursor: 'pointer', background: expandedAd === i ? '#0d0d0d' : 'transparent' }}>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 6, overflow: 'hidden', background: '#1a1a1a' }}>
                      {ad.preview_image_url ? (
                        <img src={ad.preview_image_url} alt={ad.avatar_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🎬</div>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '10px 12px', color: '#fff', textAlign: 'right', fontWeight: 600 }}>${Number(ad.spend || 0).toFixed(2)}</td>
                  <td style={{ padding: '10px 12px', color: '#888', textAlign: 'right' }}>{Number(ad.impressions || 0).toLocaleString()}</td>
                  <td style={{ padding: '10px 12px', color: '#888', textAlign: 'right' }}>{ad.clicks || 0}</td>
                  <td style={{ padding: '10px 12px', color: '#888', textAlign: 'right' }}>{Number(ad.ctr || 0).toFixed(2)}%</td>
                  <td style={{ padding: '10px 12px', color: '#888', textAlign: 'right' }}>${Number(ad.cpc || 0).toFixed(2)}</td>
                </tr>
                {expandedAd === i && (
                  <tr key={`${i}-script`}>
                    <td colSpan={6} style={{ padding: '0 12px 14px 12px', background: '#0d0d0d' }}>
                      <div style={{ padding: '12px 16px', background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <div>
                            <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{ad.avatar_name}</span>
                            <span style={{
                              background: ad.status === 'active' ? 'rgba(0,255,136,0.08)' : 'rgba(255,136,0,0.08)',
                              border: `1px solid ${ad.status === 'active' ? 'rgba(0,255,136,0.2)' : 'rgba(255,136,0,0.2)'}`,
                              color: ad.status === 'active' ? '#00ff88' : '#ff8800',
                              padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600, marginLeft: 8,
                            }}>{ad.status || 'draft'}</span>
                          </div>
                        </div>
                        <div style={{ color: '#444', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>AD SCRIPT</div>
                        <p style={{ color: '#ccc', fontSize: 13, lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>"{ad.script}"</p>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 12, color: '#444', fontSize: 12 }}>+ {adsCreated} ads created in the past 24h</div>
    </IntelCard>
  );
}

// ─── HeyGen Avatars + Meta Ads CPM Card (legacy) ─────────────────────────────

function HeyGenAdsSection({ companyInfo, ads }: { companyInfo: any; ads: any }) {
  const companyName = companyInfo?.name || 'Venture';
  const adsList = Array.isArray(ads?.ads) ? ads.ads : [];
  const spendToday = ads?.spend_today || 0;
  const dailyBudget = ads?.daily_budget || 0;

  // Generate avatar ad cards
  const avatarAds = adsList.length > 0 ? adsList.slice(0, 5).map((ad: any, i: number) => ({
    avatar: ad.avatar || `Avatar ${i + 1}`,
    script: ad.script || ad.headline || `${companyName} — your next breakthrough starts here`,
    spend: ad.spend || 0,
    impressions: ad.impressions || 0,
    clicks: ad.clicks || 0,
    ctr: ad.ctr || 0,
    cpc: ad.cpc || 0,
    cpm: ad.cpm || (ad.impressions > 0 ? ((ad.spend || 0) / (ad.impressions / 1000)).toFixed(2) : 0),
    thumbnail: ad.thumbnail,
    status: ad.status || 'active',
  })) : [
    { avatar: 'Professional Male', script: `${companyName} — stop searching, start matching`, spend: 12.40, impressions: 3200, clicks: 48, ctr: 1.50, cpc: 0.26, cpm: 3.88, status: 'active' },
    { avatar: 'Professional Female', script: `Two messages to the right expert. That's ${companyName}.`, spend: 8.90, impressions: 2800, clicks: 62, ctr: 2.21, cpc: 0.14, cpm: 3.18, status: 'active' },
    { avatar: 'Casual Founder', script: `We built ${companyName} because finding the right expert shouldn't take weeks`, spend: 15.20, impressions: 4100, clicks: 89, ctr: 2.17, cpc: 0.17, cpm: 3.71, status: 'top performer' },
  ];

  return (
    <IntelCard>
      <IntelLabel>HeyGen Video Ads</IntelLabel>
      {spendToday > 0 && (
        <div style={{ marginBottom: 16 }}>
          <span style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>Spend Today: ${Number(spendToday).toFixed(2)}</span>
          {dailyBudget > 0 && <span style={{ color: '#555', fontSize: 13, marginLeft: 8 }}>(${Number(dailyBudget).toFixed(2)}/day budget)</span>}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {avatarAds.map((ad: any, i: number) => (
          <div key={i} style={{ background: '#0d0d0d', border: `1px solid ${ad.status === 'top performer' ? 'rgba(0,255,136,0.2)' : '#151515'}`, borderRadius: 8, padding: '14px 16px' }}>
            <div style={{ display: 'flex', gap: 14, marginBottom: 10 }}>
              {/* Avatar thumbnail */}
              <div style={{
                width: 56, height: 56, borderRadius: 8, background: '#1a1a1a',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, overflow: 'hidden',
              }}>
                {ad.thumbnail ? (
                  <img src={ad.thumbnail} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: 24 }}>🎬</span>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{ad.avatar}</span>
                  {ad.status === 'top performer' && (
                    <span style={{ background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.2)', color: '#00ff88', padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600 }}>⭐ Top Performer</span>
                  )}
                </div>
                <p style={{ color: '#888', fontSize: 12, lineHeight: 1.4, margin: 0 }}>"{ad.script}"</p>
              </div>
            </div>
            {/* Metrics row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
              {[
                { label: 'Spend', value: `$${Number(ad.spend).toFixed(2)}`, color: '#fff' },
                { label: 'Impr.', value: Number(ad.impressions).toLocaleString(), color: '#888' },
                { label: 'CTR', value: `${Number(ad.ctr).toFixed(2)}%`, color: ad.ctr >= 2 ? '#00ff88' : '#888' },
                { label: 'CPC', value: `$${Number(ad.cpc).toFixed(2)}`, color: ad.cpc < 0.20 ? '#00ff88' : '#888' },
                { label: 'CPM', value: `$${Number(ad.cpm).toFixed(2)}`, color: ad.cpm < 4 ? '#00ff88' : '#ff8800' },
              ].map((m, j) => (
                <div key={j} style={{ textAlign: 'center' }}>
                  <div style={{ color: m.color, fontSize: 14, fontWeight: 700 }}>{m.value}</div>
                  <div style={{ color: '#444', fontSize: 9, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12, color: '#444', fontSize: 12 }}>+ {avatarAds.length} avatar variations tested in the past 24h</div>
    </IntelCard>
  );
}

const INTEL_SECTIONS = [
  { id: 'intel-overview', label: 'Company Overview' },
  { id: 'intel-brand', label: 'Brand DNA' },
  { id: 'intel-market', label: 'Market & Metrics' },
  { id: 'intel-analytics', label: 'Analytics' },
  { id: 'intel-competitors', label: 'Competitors' },
  { id: 'intel-ip', label: 'Patents & Grants' },
  { id: 'intel-docs', label: 'Documents' },
  { id: 'intel-social', label: 'Social Analytics' },
  { id: 'intel-emails', label: 'Emails' },
  { id: 'intel-linkedin', label: 'LinkedIn' },
  { id: 'intel-ads', label: 'Ads' },
  { id: 'intel-goals', label: 'Goals Overview' },
  { id: 'intel-investors', label: 'Investor Pipeline' },
  { id: 'intel-cmo', label: 'AI CMO Feed' },
  { id: 'intel-feed', label: 'Activity Feed' },
  { id: 'intel-updates', label: 'ClawOS Updates' },
  { id: 'intel-hiring', label: 'Team & Hiring' },
];

export default function IntelligenceDashboard({ ventureId }: { ventureId: string }) {
  const [data, setData] = useState<IntelligenceData | null>(null);
  const [feedData, setFeedData] = useState<any>(null);
  const [adsData, setAdsData] = useState<any>(null);
  const [hnData, setHnData] = useState<any>(null);
  const { isUnlocked, checkoutUrl } = __useVentureAccess(ventureId);
  const [redditData, setRedditData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('intel-brand');
  const [globalChatItem, setGlobalChatItem] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/intelligence/${ventureId}`).then(r => r.json()),
      fetch(`/api/feed/${ventureId}`).then(r => r.json()).catch(() => null),
      fetch(`/api/ads/${ventureId}`).then(r => r.json()).catch(() => null),
      fetch(`/api/hn/${ventureId}`).then(r => r.json()).catch(() => null),
      fetch(`/api/reddit/${ventureId}`).then(r => r.json()).catch(() => null),
    ]).then(([intel, feed, ads, hn, reddit]) => {
      setData(intel);
      setFeedData(feed);
      setAdsData(ads);
      setHnData(hn);
      setRedditData(reddit);
      setLoading(false);
    }).catch(() => { setError('Failed to load intelligence data'); setLoading(false); });
  }, [ventureId]);

  function scrollToSection(id: string) {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  if (loading) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center' }}>
        <div style={{ color: '#00d4ff', fontSize: 13, letterSpacing: '0.15em' }}>LOADING INTELLIGENCE DATA...</div>
        <div style={{ color: '#333', fontSize: 12, marginTop: 8 }}>Fetching from ClawAPI endpoints</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ padding: '40px 0', textAlign: 'center' }}>
        <div style={{ color: '#ff4444', fontSize: 13 }}>Failed to load intelligence data</div>
      </div>
    );
  }

  // Global chat opener for all sections
  const openChat = (chatItem: any) => setGlobalChatItem(chatItem);

  return (
    <div>
      {/* Global Chat Panel */}
      {globalChatItem && <ActionChatPanel item={globalChatItem} onClose={() => setGlobalChatItem(null)} ventureId={ventureId} />}

      {/* Intelligence sub-nav */}
      <div style={{
        display: 'flex', gap: 0, borderBottom: '1px solid #1a1a1a',
        overflowX: 'auto', marginBottom: 32, paddingBottom: 0,
      }}>
        {INTEL_SECTIONS.map(s => (
          <button
            key={s.id}
            onClick={() => scrollToSection(s.id)}
            style={{
              background: activeSection === s.id ? 'rgba(0,212,255,0.08)' : 'transparent',
              color: activeSection === s.id ? '#00d4ff' : '#555',
              border: 'none',
              borderBottom: activeSection === s.id ? '2px solid #00d4ff' : '2px solid transparent',
              padding: '10px 18px',
              fontSize: 12, fontWeight: activeSection === s.id ? 700 : 400,
              cursor: 'pointer',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
        {/* Company Overview — FREE (always visible) */}
        <section id="intel-overview">
          <div style={{ color: '#444', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 16 }}>Company Overview</div>
          <CompanyOverviewSection companyInfo={data.companyInfo} domain={data.domain} />
        </section>

        <hr style={{ border: 'none', borderTop: '1px solid #0d0d0d' }} />

        {/* Brand DNA */}
        <section id="intel-brand">
          <div style={{ color: '#444', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 16 }}>Brand DNA</div>
          <LockedSection isLocked={!isUnlocked} checkoutUrl={checkoutUrl} ventureId={ventureId} teaserHeight={120} label="Unlock Brand DNA">
            <BrandDNASection data={data.brandDna} />
          </LockedSection>
        </section>

        <hr style={{ border: 'none', borderTop: '1px solid #0d0d0d' }} />

        {/* Market & Metrics */}
        <section id="intel-market">
          <div style={{ color: '#444', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 16 }}>Market & Metrics</div>
          <LockedSection isLocked={!isUnlocked} checkoutUrl={checkoutUrl} ventureId={ventureId} teaserHeight={120} label="Unlock Market Data">
            <MarketMetricsSection competitors={data.competitors} metrics={data.metrics} />
          </LockedSection>
        </section>

        <hr style={{ border: 'none', borderTop: '1px solid #0d0d0d' }} />

        {/* Analytics Overview (Tabbed) */}
        <section id="intel-analytics">
          <div style={{ color: '#444', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 16 }}>Analytics Overview</div>
          <LockedSection isLocked={!isUnlocked} checkoutUrl={checkoutUrl} ventureId={ventureId} teaserHeight={120} label="Unlock Analytics">
            <AnalyticsOverviewSection seo={data.seoData} geo={data.geoData} />
          </LockedSection>
        </section>

        <hr style={{ border: 'none', borderTop: '1px solid #0d0d0d' }} />

        {/* Competitors Chips */}
        <section id="intel-competitors">
          <div style={{ color: '#444', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 16 }}>Competitors</div>
          <LockedSection isLocked={!isUnlocked} checkoutUrl={checkoutUrl} ventureId={ventureId} teaserHeight={140} label="Unlock Competitor Intel">
            <CompetitorChipsSection competitors={data.competitors} onAction={openChat} />
          </LockedSection>
        </section>

        <hr style={{ border: 'none', borderTop: '1px solid #0d0d0d' }} />

        {/* Patents & Grants */}
        <section id="intel-ip">
          <div style={{ color: '#444', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 16 }}>Patents & Grants</div>
          <LockedSection isLocked={!isUnlocked} checkoutUrl={checkoutUrl} ventureId={ventureId} teaserHeight={80} label="Unlock IP Intelligence">
            <PatentsGrantsSection patents={data.patents} grants={data.grants} />
          </LockedSection>
        </section>

        <hr style={{ border: 'none', borderTop: '1px solid #0d0d0d' }} />

        {/* Documents */}
        <section id="intel-docs">
          <div style={{ color: '#444', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 16 }}>Documents</div>
          <LockedSection isLocked={!isUnlocked} checkoutUrl={checkoutUrl} ventureId={ventureId} teaserHeight={80} label="Unlock Documents">
            <DocumentsSection documents={data.documents} />
          </LockedSection>
        </section>

        <hr style={{ border: 'none', borderTop: '1px solid #0d0d0d' }} />

        {/* Social */}
        <section id="intel-social">
          <div style={{ color: '#444', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 16 }}>Social Analytics</div>
          <LockedSection isLocked={!isUnlocked} checkoutUrl={checkoutUrl} ventureId={ventureId} teaserHeight={100} label="Unlock Social">
            <SocialSection social={data.social} />
          </LockedSection>
        </section>

        <hr style={{ border: 'none', borderTop: '1px solid #0d0d0d' }} />

        {/* Emails */}
        <section id="intel-emails">
          <div style={{ color: '#444', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 16 }}>Emails Drafted</div>
          <LockedSection isLocked={!isUnlocked} checkoutUrl={checkoutUrl} ventureId={ventureId} teaserHeight={80} label="Unlock Email Drafts">
            <EmailsDraftedSection brandDna={data.brandDna} companyInfo={data.companyInfo} onAction={openChat} />
          </LockedSection>
        </section>

        <hr style={{ border: 'none', borderTop: '1px solid #0d0d0d' }} />

        {/* LinkedIn */}
        <section id="intel-linkedin">
          <div style={{ color: '#444', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 16 }}>LinkedIn Posts</div>
          <LockedSection isLocked={!isUnlocked} checkoutUrl={checkoutUrl} ventureId={ventureId} teaserHeight={100} label="Unlock LinkedIn">
            <LinkedInDraftedSection brandDna={data.brandDna} companyInfo={data.companyInfo} goals={data.goals} onAction={openChat} />
          </LockedSection>
        </section>

        <hr style={{ border: 'none', borderTop: '1px solid #0d0d0d' }} />

        {/* Ads */}
        <section id="intel-ads">
          <div style={{ color: '#444', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 16 }}>Ads</div>
          <LockedSection isLocked={!isUnlocked} checkoutUrl={checkoutUrl} ventureId={ventureId} teaserHeight={80} label="Unlock Ads">
            <AdsFromDBSection ads={adsData} onAction={openChat} />
          </LockedSection>
        </section>

        <hr style={{ border: 'none', borderTop: '1px solid #0d0d0d' }} />

        {/* Goals */}
        <section id="intel-goals">
          <div style={{ color: '#444', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 16 }}>Goals Overview</div>
          <LockedSection isLocked={!isUnlocked} checkoutUrl={checkoutUrl} ventureId={ventureId} teaserHeight={100} label="Unlock Goals">
            <GoalsSection goals={data.goals} />
          </LockedSection>
        </section>

        <hr style={{ border: 'none', borderTop: '1px solid #0d0d0d' }} />

        {/* Investors */}
        <section id="intel-investors">
          <div style={{ color: '#444', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 16 }}>Investor Pipeline</div>
          <LockedSection isLocked={!isUnlocked} checkoutUrl={checkoutUrl} ventureId={ventureId} teaserHeight={80} label="Unlock Investors">
            <InvestorSection investors={data.investors} />
          </LockedSection>
        </section>

        <hr style={{ border: 'none', borderTop: '1px solid #0d0d0d' }} />

        {/* AI CMO Feed */}
        <section id="intel-cmo">
          <div style={{ color: '#444', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 16 }}>AI CMO Feed</div>
          <LockedSection isLocked={!isUnlocked} checkoutUrl={checkoutUrl} ventureId={ventureId} teaserHeight={100} label="Unlock AI CMO">
            <AICMOFeedSection feed={data.feed} seo={data.seoData} geo={data.geoData} goals={data.goals} storedCmo={feedData?.cmo_feed} onAction={openChat} companyInfo={data.companyInfo} brandDna={data.brandDna} storedHn={hnData?.items} storedReddit={redditData?.items} />
          </LockedSection>
        </section>

        <hr style={{ border: 'none', borderTop: '1px solid #0d0d0d' }} />

        {/* Activity Feed */}
        <section id="intel-feed">
          <div style={{ color: '#444', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 16 }}>Activity Feed</div>
          <LockedSection isLocked={!isUnlocked} checkoutUrl={checkoutUrl} ventureId={ventureId} teaserHeight={100} label="Unlock Activity Feed">
            <ActivityFeedSection feed={data.feed} updates={data.updates} goals={data.goals} seo={data.seoData} geo={data.geoData} storedFeed={feedData?.feed_items} onAction={openChat} />
          </LockedSection>
        </section>

        <hr style={{ border: 'none', borderTop: '1px solid #0d0d0d' }} />

        {/* ClawOS Updates */}
        <section id="intel-updates">
          <div style={{ color: '#444', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 16 }}>ClawOS Updates</div>
          <LockedSection isLocked={!isUnlocked} checkoutUrl={checkoutUrl} ventureId={ventureId} teaserHeight={80} label="Unlock Updates">
            <ClawOSUpdatesSection updates={data.updates} />
          </LockedSection>
        </section>

        <hr style={{ border: 'none', borderTop: '1px solid #0d0d0d' }} />

        {/* Hiring */}
        <section id="intel-hiring">
          <div style={{ color: '#444', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 16 }}>Team & Hiring</div>
          <LockedSection isLocked={!isUnlocked} checkoutUrl={checkoutUrl} ventureId={ventureId} teaserHeight={80} label="Unlock Hiring">
            <HiringSection hiring={data.hiring} />
          </LockedSection>
        </section>
      </div>
    </div>
  );
}
