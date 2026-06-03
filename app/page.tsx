import Link from 'next/link';
import clientPromise from '@/lib/mongodb';
import SimulationCard from '@/components/SimulationCard';

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
    <main style={{ minHeight: '100vh', background: '#000', padding: '0' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid #222', padding: '20px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg, #00d4ff, #0066ff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700
          }}>S</div>
          <span style={{ color: '#fff', fontWeight: 600, fontSize: 18 }}>ShareOS</span>
          <span style={{ color: '#444', margin: '0 4px' }}>/</span>
          <span style={{ color: '#888', fontSize: 16 }}>Venture Simulations</span>
        </div>
        <div style={{ color: '#555', fontSize: 13 }}>Autonomous Venture Creation Engine</div>
      </div>

      {/* Hero */}
      <div style={{ padding: '80px 40px 60px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ marginBottom: 8 }}>
          <span style={{
            background: 'rgba(0, 212, 255, 0.1)', color: '#00d4ff',
            border: '1px solid rgba(0, 212, 255, 0.3)',
            padding: '4px 12px', borderRadius: 4, fontSize: 12, fontWeight: 600,
            letterSpacing: '0.1em', textTransform: 'uppercase'
          }}>ShareOS AGI</span>
        </div>
        <h1 style={{ fontSize: 56, fontWeight: 800, lineHeight: 1.1, marginBottom: 20, letterSpacing: '-0.02em' }}>
          Venture<br />
          <span style={{ color: '#00d4ff' }}>Simulation</span> Engine
        </h1>
        <p style={{ color: '#888', fontSize: 18, maxWidth: 600, lineHeight: 1.7, marginBottom: 40 }}>
          Full lifecycle simulation reports for ShareOS ventures. Each report documents how AI agents build companies
          from signal detection through exit — with real data, generated narratives, and cost accounting.
        </p>

        <div style={{ display: 'flex', gap: 40, marginBottom: 60 }}>
          {[
            { label: 'Simulations', value: simulations.length.toString() },
            { label: 'Avg Agent Work', value: '91%' },
            { label: 'Framework', value: 'ShareOS' },
          ].map((s) => (
            <div key={s.label}>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#00d4ff' }}>{s.value}</div>
              <div style={{ color: '#555', fontSize: 13 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #222', marginBottom: 60 }} />

        {/* Simulations Grid */}
        {simulations.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '80px 40px',
            border: '1px dashed #333', borderRadius: 12
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🤖</div>
            <div style={{ color: '#888', fontSize: 18, marginBottom: 8 }}>No simulations yet</div>
            <div style={{ color: '#555', fontSize: 14 }}>
              Run <code style={{ background: '#111', padding: '2px 8px', borderRadius: 4, color: '#00d4ff' }}>
                python3 scripts/generate-simulation.py share_insights
              </code> to generate your first simulation
            </div>
          </div>
        ) : (
          <div>
            <div style={{ color: '#555', fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 24 }}>
              Active Simulations
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 24 }}>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {simulations.map((sim: any) => (
                <SimulationCard key={sim.cmny_id} sim={sim} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid #111', padding: '24px 40px', marginTop: 80, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ color: '#333', fontSize: 13 }}>ShareOS Autonomous Venture Creation Engine</div>
        <div style={{ color: '#333', fontSize: 13 }}>share.vc</div>
      </div>
    </main>
  );
}


