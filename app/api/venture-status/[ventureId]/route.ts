import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ ventureId: string }> }
) {
  try {
    const { ventureId } = await params;
    const client = await clientPromise;
    const db = client.db('shareos');

    // Check deals_business for payment status
    const bizDoc = await db.collection('deals_business').findOne(
      { cmny_id: { $regex: new RegExp(`^${ventureId}$`, 'i') } },
      { projection: { features_unlocked: 1, payment_status: 1, checkout_url: 1, 'v2_pipeline_status.checkout_url': 1, cmny_id: 1 } }
    );

    // Check if it's a deals_internal venture (portfolio companies are always unlocked)
    if (!bizDoc) {
      const internalDoc = await db.collection('deals_internal').findOne(
        { cmny_id: { $regex: new RegExp(`^${ventureId}$`, 'i') } },
        { projection: { cmny_id: 1 } }
      );
      if (internalDoc) {
        return NextResponse.json({ features_unlocked: true, checkout_url: null, source: 'internal' });
      }
      // No doc found at all — treat as unlocked (legacy)
      return NextResponse.json({ features_unlocked: true, checkout_url: null, source: 'not_found' });
    }

    // Get checkout URL from top-level or nested in v2_pipeline_status
    const checkoutUrl = bizDoc.checkout_url 
      || (bizDoc as any).v2_pipeline_status?.checkout_url 
      || null;

    return NextResponse.json({
      features_unlocked: bizDoc.features_unlocked === true || bizDoc.payment_status === 'paid',
      checkout_url: checkoutUrl,
      source: 'deals_business',
    });
  } catch (err) {
    console.error('venture-status error:', err);
    return NextResponse.json({ features_unlocked: true, checkout_url: null, source: 'error' });
  }
}
