import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { v4 as uuidv4 } from 'uuid';

function generateSimulation(venture: any): any {
  const name = venture.name || 'Untitled Venture';
  const description = venture.tagline || venture.business_description || '';
  const stage = venture.stage || 'Explore';
  const vertical = venture.vertical || 'Organizational';
  const targetVal = venture.targetValuation || 500000;
  const team = venture.team || [];
  const rawAnswers = venture.raw_answers || {};

  const stageMultipliers: Record<string, number> = {
    'Explore': 0.05, 'Generate': 0.10, 'Validate': 0.20,
    'Pilot': 0.35, 'Launch': 0.50, 'Scale': 0.75, 'Exit': 1.0,
  };
  const mult = stageMultipliers[stage] || 0.05;

  const workstreams = ['Product', 'Demand', 'Operations', 'Team', 'Partnerships', 'Investors', 'Synergy'];
  const weights = venture.workstream_weights || {
    product: 0.30, demand: 0.25, team: 0.15, operations: 0.10,
    partnerships: 0.05, investors: 0.10, synergy: 0.05,
  };

  const workstreamData = workstreams.map((ws) => {
    const key = ws.toLowerCase();
    const weight = (weights as any)[key] || 0.1;
    const wsVal = targetVal * weight;
    return {
      name: ws,
      weight,
      targetValuation: Math.round(wsVal),
      currentValuation: Math.round(wsVal * mult * (0.3 + Math.random() * 0.4)),
      goals: [
        {
          name: `${ws} Foundation`,
          description: `Establish ${ws.toLowerCase()} fundamentals for ${name}`,
          status: stage === 'Explore' ? 'not_started' : 'in_progress',
          targetValuation: Math.round(wsVal * 0.5),
          currentValuation: Math.round(wsVal * 0.5 * mult * Math.random()),
          milestones: [
            { name: `Define ${ws} strategy`, status: mult > 0.1 ? 'completed' : 'in_progress' },
            { name: `Execute initial ${ws} plan`, status: 'not_started' },
          ],
        },
        {
          name: `${ws} Growth`,
          description: `Scale ${ws.toLowerCase()} capabilities`,
          status: 'not_started',
          targetValuation: Math.round(wsVal * 0.5),
          currentValuation: 0,
          milestones: [
            { name: `${ws} metrics baseline`, status: 'not_started' },
            { name: `${ws} optimization`, status: 'not_started' },
          ],
        },
      ],
    };
  });

  // Growth projections (5 years)
  const baseRevenue = stage === 'Explore' ? 0 : stage === 'Validate' ? 5000 : 50000;
  const growthRate = 2.5;
  const projections = Array.from({ length: 5 }, (_, i) => ({
    year: new Date().getFullYear() + i,
    revenue: Math.round(baseRevenue * Math.pow(growthRate, i)),
    users: Math.round(100 * Math.pow(growthRate, i)),
    valuation: Math.round(targetVal * Math.pow(1.5, i)),
  }));

  return {
    _id: uuidv4(),
    cmny_id: venture.cmny_id,
    name,
    tagline: description,
    vertical,
    stage,
    targetValuation: targetVal,
    currentValuation: Math.round(targetVal * mult),
    performanceScore: Math.round(targetVal * mult * 0.4),
    executionScore: Math.round(targetVal * mult * 0.6),
    workstreams: workstreamData,
    projections,
    team: team.map((t: any) => ({ name: t.name, role: t.role })),
    metadata: {
      source: 'deals_business',
      generatedAt: new Date().toISOString(),
      generatedBy: 'venture-simulation-api',
      rawAnswers,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ ventureId: string }> }
) {
  try {
    const { ventureId } = await params;
    const body = await request.json().catch(() => ({}));
    const source = (body as any)?.source || 'deals_internal';
    const client = await clientPromise;
    const db = client.db('shareos');

    // Check if simulation already exists
    const existing = await db.collection('venture_simulations').findOne({ cmny_id: ventureId });
    if (existing) {
      return NextResponse.json({ message: 'Simulation already exists', cmny_id: ventureId });
    }

    // Get venture data from the appropriate collection
    const collection = source === 'deals_business' ? 'deals_business' : 'deals_internal';
    const venture = await db.collection(collection).findOne({ 
      cmny_id: { $regex: new RegExp(`^${ventureId}$`, 'i') }
    });

    if (!venture) {
      // Try the other collection as fallback
      const fallbackCollection = collection === 'deals_business' ? 'deals_internal' : 'deals_business';
      const fallbackVenture = await db.collection(fallbackCollection).findOne({
        cmny_id: { $regex: new RegExp(`^${ventureId}$`, 'i') }
      });
      if (!fallbackVenture) {
        return NextResponse.json({ error: 'Venture not found', cmny_id: ventureId }, { status: 404 });
      }
      // Use fallback
      const simulation = generateSimulation(fallbackVenture);
      await db.collection('venture_simulations').insertOne(simulation);
      return NextResponse.json({ message: 'Simulation generated', cmny_id: ventureId });
    }

    // Generate simulation from venture data
    const simulation = generateSimulation(venture);
    await db.collection('venture_simulations').insertOne(simulation);

    return NextResponse.json({ 
      message: 'Simulation generated', 
      cmny_id: ventureId,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to generate simulation' }, { status: 500 });
  }
}
