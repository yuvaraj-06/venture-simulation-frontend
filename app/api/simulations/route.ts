import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('shareos');
    const simulations = await db
      .collection('venture_simulations')
      .find({}, { projection: { cmny_id: 1, simulation_metadata: 1, executive_summary: 1, generated_at: 1 } })
      .toArray();

    // Also include deals_business ventures that are being generated (no simulation yet)
    const pendingVentures = await db
      .collection('deals_business')
      .find(
        { 'generation_status.overall': { $in: ['generating', 'call_completed', 'pending', 'calling'] } },
        { projection: { cmny_id: 1, name: 1, tagline: 1, stage: 1, vertical: 1, generation_status: 1, created_at: 1 } }
      )
      .toArray();

    return NextResponse.json({ simulations, pendingVentures });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch simulations' }, { status: 500 });
  }
}
