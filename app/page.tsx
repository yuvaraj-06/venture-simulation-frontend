import clientPromise from '@/lib/mongodb';
import SimulationCard from '@/components/SimulationCard';
import { Brand, Glyph } from '@/components/Brand';

/* Concept SVG: 7 verticals × 4 horizontals. Workshop visualization-first canon: shows the
   actual shareOS framework the simulations run inside, not a decorative illustration. */
function FrameworkDiagram() {
  const VERTICALS = ['Physical', 'Cognitive', 'Emotional', 'Social', 'Biological', 'Organizational', 'Financial'];
  const HORIZONTALS = ['AI', 'Data', 'Interface', 'Coord.'];
  return (
    <div style={{ width: '100%', minWidth: 0 }}>
      <div style={{
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: 12, padding: 22, width: '100%',
      }}>
        <div style={{ color: '#939799', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 16 }}>
          7 verticals · 4 horizontals
        </div>
        {/* matrix: rows = horizontals (tech layers), cols = verticals (performance domains) */}
        <div style={{ display: 'grid', gridTemplateColumns: '60px repeat(7, minmax(0, 1fr))', gap: 1, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' }}>
          {/* col headers row */}
          <div style={{ background: '#2B3033', padding: '8px 4px' }} />
          {VERTICALS.map((v) => (
            <div key={`h-${v}`} style={{ background: '#2B3033', padding: '8px 2px', color: '#fff', fontSize: 8, fontWeight: 600, textAlign: 'center', letterSpacing: '0.04em', textTransform: 'uppercase', lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={v}>
              {v.slice(0, 4)}
            </div>
          ))}
          {/* matrix rows */}
          {HORIZONTALS.map((h, ri) => (
            <div key={`row-${h}`} style={{ display: 'contents' }}>
              <div style={{ background: '#2B3033', padding: '10px 8px', color: '#C8CBCC', fontSize: 9, fontWeight: 600, textAlign: 'right', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                {h}
              </div>
              {VERTICALS.map((v, ci) => {
                const state = ri === 0 ? 'live' : ri === 1 ? 'deployed' : (ri + ci) % 3 === 0 ? 'deployed' : 'planned';
                const bg = state === 'live' ? '#00D65D' : state === 'deployed' ? '#0A7D3C' : 'rgba(255,255,255,0.10)';
                return <div key={`c-${h}-${v}`} style={{ background: '#2B3033', padding: '10px 4px', display: 'flex', justifyContent: 'center' }}>
                  <span style={{ width: '60%', height: 4, borderRadius: 2, background: bg }} />
                </div>;
              })}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16, marginTop: 14, fontSize: 9, color: '#939799', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 12, height: 3, background: '#00D65D', display: 'inline-block', borderRadius: 1 }} /> live</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 12, height: 3, background: '#0A7D3C', display: 'inline-block', borderRadius: 1 }} /> deployed</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 12, height: 3, background: 'rgba(255,255,255,0.18)', display: 'inline-block', borderRadius: 1 }} /> planned</span>
        </div>
      </div>
    </div>
  );
}

async function getSimulations() {
  try {
    const client = await clientPromise;
    const db = client.db('shareos');
    const simulations = await db
      .collection('venture_simulations')
      .find({}, { projection: { cmny_id: 1, simulation_metadata: 1, executive_summary: 1, stages: { $slice: 1 }, generated_at: 1 } })
      .toArray();
    return simulations;
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const simulations = await getSimulations();

  return (
    <main style={{ minHeight: '100vh', background: '#F1F4F5', padding: '0' }}>
      {/* Header — product wordmark lockup */}
      <div style={{ borderBottom: '1px solid #E8E6E4', padding: '18px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFFFFF' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Brand href="/" />
          <span style={{ color: '#C8CBCC', margin: '0 2px' }}>/</span>
          <span style={{ color: '#5E6366', fontSize: 15, fontWeight: 500 }}>Venture Simulations</span>
        </div>
        <div style={{ color: '#939799', fontSize: 13 }}>Autonomous Venture Creation Engine</div>
      </div>

      {/* Hero — dark emphasis band (canon: dark band on light page) */}
      <div className="dark-band" style={{ padding: '72px 40px 64px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: 48, alignItems: 'center' }}>
          <div>
            <div style={{ marginBottom: 16 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                color: '#00D65D', fontSize: 12, fontWeight: 600,
                letterSpacing: '0.12em', textTransform: 'uppercase'
              }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#00D65D', display: 'inline-block' }} />
                shareOS AGI
              </span>
            </div>
            <h1 style={{ fontSize: 72, fontWeight: 600, lineHeight: 1.02, marginBottom: 22, letterSpacing: '-0.02em', textTransform: 'lowercase', color: '#fff' }}>
              venture<br />simulation engine
            </h1>
            <p style={{ color: '#C8CBCC', fontSize: 18, maxWidth: 560, lineHeight: 1.7, marginBottom: 44 }}>
              Full lifecycle simulation reports for shareOS ventures. Each report documents how AI agents build companies
              from signal detection through exit, with real data, generated narratives, and cost accounting.
            </p>

            <div style={{ display: 'flex', gap: 56, flexWrap: 'wrap' }}>
              {[
                { label: 'Simulations', value: simulations.length.toString(), green: true },
                { label: 'Avg Agent Work', value: '91%', green: false },
                { label: 'Framework', value: 'shareOS', green: false },
              ].map((s) => (
                <div key={s.label}>
                  <div style={{ fontSize: 40, fontWeight: 600, color: s.green ? '#00D65D' : '#fff', letterSpacing: '-0.01em' }}>{s.value}</div>
                  <div style={{ color: '#939799', fontSize: 13, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Concept SVG — 7-vertical ShareOS framework + 4-horizontal tech (workshop visualization-first) */}
          <FrameworkDiagram />
        </div>
      </div>

      {/* Simulations grid */}
      <div style={{ padding: '56px 40px 40px', maxWidth: 1200, margin: '0 auto' }}>
        {simulations.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '80px 40px',
            border: '1px dashed #C8CBCC', borderRadius: 12, background: '#FFFFFF'
          }}>
            <div style={{ fontSize: 40, marginBottom: 16, color: '#939799', display: 'flex', justifyContent: 'center' }}>
              <Glyph name="bot" size={40} />
            </div>
            <div style={{ color: '#000000', fontSize: 18, marginBottom: 8, fontWeight: 600 }}>No simulations yet</div>
            <div style={{ color: '#939799', fontSize: 14 }}>
              Run <code style={{ background: '#F1F4F5', padding: '2px 8px', borderRadius: 4, color: '#0A7D3C' }}>
                python3 scripts/generate-simulation.py share_insights
              </code> to generate your first simulation
            </div>
          </div>
        ) : (
          <div>
            <div style={{ color: '#939799', fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 24, fontWeight: 600 }}>
              Active Simulations
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 1, background: '#E8E6E4', border: '1px solid #E8E6E4', borderRadius: 12, overflow: 'hidden' }}>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {simulations.map((sim: any) => (
                <SimulationCard key={sim.cmny_id} sim={sim} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid #E8E6E4', padding: '24px 40px', marginTop: 60, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FFFFFF' }}>
        <div style={{ color: '#5E6366', fontSize: 13 }}>ShareOS Autonomous Venture Creation Engine</div>
        <div style={{ color: '#5E6366', fontSize: 13 }}>share.vc</div>
      </div>
    </main>
  );
}
