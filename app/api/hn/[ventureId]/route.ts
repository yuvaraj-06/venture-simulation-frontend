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
    
    const hn = await db
      .collection('venture_hn_feed')
      .findOne(
        { venture_id: { $regex: new RegExp(`^${ventureId}$`, 'i') } },
        { projection: { _id: 0 } }
      );

    return NextResponse.json(hn || { venture_id: ventureId, items: [] });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch HN feed' }, { status: 500 });
  }
}
