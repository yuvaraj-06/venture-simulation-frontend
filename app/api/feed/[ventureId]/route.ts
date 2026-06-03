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
    
    const feed = await db
      .collection('venture_activity_feed')
      .findOne(
        { venture_id: { $regex: new RegExp(`^${ventureId}$`, 'i') } },
        { projection: { _id: 0 } }
      );

    if (!feed) {
      return NextResponse.json({ 
        venture_id: ventureId,
        feed_items: [], 
        cmo_feed: [],
        total_items: 0,
        action_count: 0,
        review_count: 0,
      });
    }

    return NextResponse.json(feed);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch feed' }, { status: 500 });
  }
}
