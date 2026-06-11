import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID || '';

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
      { projection: { features_unlocked: 1, payment_status: 1, checkout_url: 1, 'v2_pipeline_status.checkout_url': 1, cmny_id: 1, caller_email: 1, email: 1, name: 1, caller_name: 1, caller_phone: 1 } }
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

/**
 * POST: Create a new Stripe checkout session for this venture (on-demand)
 * Called when user clicks Unlock but no checkout_url exists yet.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ ventureId: string }> }
) {
  try {
    const { ventureId } = await params;

    if (!STRIPE_SECRET_KEY || !STRIPE_PRICE_ID) {
      return NextResponse.json({ error: 'Payment not configured' }, { status: 500 });
    }

    const client = await clientPromise;
    const db = client.db('shareos');

    const bizDoc = await db.collection('deals_business').findOne(
      { cmny_id: { $regex: new RegExp(`^${ventureId}$`, 'i') } },
      { projection: { cmny_id: 1, caller_email: 1, email: 1, name: 1, caller_name: 1, caller_phone: 1, features_unlocked: 1, payment_status: 1 } }
    );

    if (!bizDoc) {
      return NextResponse.json({ error: 'Venture not found' }, { status: 404 });
    }

    // Already paid
    if (bizDoc.features_unlocked === true || bizDoc.payment_status === 'paid') {
      return NextResponse.json({ features_unlocked: true, checkout_url: null });
    }

    // Create Stripe checkout
    const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2024-12-18.acacia' as any });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: STRIPE_PRICE_ID, quantity: 1 }],
      mode: 'payment',
      allow_promotion_codes: true,
      customer_email: bizDoc.caller_email || bizDoc.email || undefined,
      metadata: {
        venture_id: bizDoc.cmny_id || ventureId,
        phone: bizDoc.caller_phone || '',
        name: bizDoc.caller_name || '',
        business_name: bizDoc.name || '',
        pipeline_version: 'v2',
        source: 'dashboard_unlock',
      },
      success_url: `https://simulationos.sharelabs.ai/${ventureId}?unlocked=true`,
      cancel_url: `https://simulationos.sharelabs.ai/${ventureId}?cancelled=true`,
    });

    // Save the checkout URL to deals_business for future use
    await db.collection('deals_business').updateOne(
      { cmny_id: bizDoc.cmny_id },
      { $set: { 
        checkout_url: session.url,
        'v2_pipeline_status.checkout_url': session.url,
        updated_at: new Date().toISOString(),
      } }
    );

    return NextResponse.json({
      checkout_url: session.url,
      features_unlocked: false,
    });
  } catch (err: any) {
    console.error('venture-status POST error:', err);
    return NextResponse.json({ error: err.message || 'Failed to create checkout' }, { status: 500 });
  }
}
