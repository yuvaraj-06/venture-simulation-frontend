import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ ventureId: string }> }
) {
  try {
    const { ventureId } = await params;
    const client = await clientPromise;
    const db = client.db('shareos');
    
    const ads = await db
      .collection('venture_ads')
      .findOne(
        { venture_id: { $regex: new RegExp(`^${ventureId}$`, 'i') } },
        { projection: { _id: 0 } }
      );

    if (!ads) {
      return NextResponse.json({ venture_id: ventureId, ads: [], spend_today: 0, daily_budget: 0 });
    }

    return NextResponse.json(ads);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch ads' }, { status: 500 });
  }
}
