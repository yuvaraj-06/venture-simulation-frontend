import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

const CLAWAPI = 'https://clawapi.shareos.ai';

function extractDomain(website: string): string {
  return website.replace('https://', '').replace('http://', '').replace(/\/$/, '').split('/')[0];
}

async function fetchSafe(url: string) {
  try {
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ ventureId: string }> }
) {
  try {
    const { ventureId } = await params;

    // Get domain from MongoDB deals_internal (case-insensitive lookup)
    const client = await clientPromise;
    const db = client.db('shareos');
    // Check deals_internal first, then deals_business for user-submitted ventures
    let venture = await db.collection('deals_internal').findOne({ 
      cmny_id: { $regex: new RegExp(`^${ventureId}$`, 'i') } 
    });
    if (!venture) {
      venture = await db.collection('deals_business').findOne({ 
        cmny_id: { $regex: new RegExp(`^${ventureId}$`, 'i') } 
      });
    }

    // Use the canonical cmny_id from DB if found (preserves original casing)
    const canonicalId = venture?.cmny_id || ventureId;

    const website = venture?.website || '';
    const domain = website ? extractDomain(website) : `${canonicalId}.sharelabs.ai`;

    // Try multiple domain variants for polsia lookups (case-insensitive)
    const domainVariants = [domain, domain.toLowerCase()];
    if (!website) {
      // Also try just ventureId as domain (legacy entries) - both cases
      domainVariants.push(canonicalId, ventureId, ventureId.toLowerCase());
      // Try capitalized sharelabs variant
      if (domain !== `${ventureId}.sharelabs.ai`) {
        domainVariants.push(`${ventureId}.sharelabs.ai`);
      }
    } else {
      // Also try sharelabs.ai variant
      domainVariants.push(`${canonicalId}.sharelabs.ai`, `${ventureId}.sharelabs.ai`);
    }

    // Helper: find polsia doc by trying domain variants (case-insensitive)
    async function findPolsia(collection: string) {
      // First try exact matches for speed
      for (const d of domainVariants) {
        const doc = await db.collection(collection).findOne({ domain: d });
        if (doc) {
          const { _id, ...rest } = doc;
          return rest;
        }
      }
      // Fallback: case-insensitive regex on first domain variant
      const doc = await db.collection(collection).findOne({ 
        domain: { $regex: new RegExp(`^${domainVariants[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
      });
      if (doc) {
        const { _id, ...rest } = doc;
        return rest;
      }
      return null;
    }

    // Parallel fetch: polsia from MongoDB directly + dashboard from ClawAPI
    const [
      brandDnaDoc,
      companyInfoDoc,
      seoDataDoc,
      geoDataDoc,
      polsiaCompetitorsDoc,
      polsiaPatentsDoc,
      polsiaGrantsDoc,
      dashboardCompetitors,
      dashboardSocial,
      polsiaSocial,
      polsiaDocuments,
      dashboardInvestors,
      polsiaInvestors,
      activityFeed,
      recentUpdates,
      goals,
      metrics,
      hiring,
      partnerships,
      videosDoc,
      socialAnalyticsDoc,
    ] = await Promise.all([
      findPolsia('polsia_okara_brand_dna'),
      findPolsia('polsia_okara_companies'),
      findPolsia('polsia_okara_seo'),
      findPolsia('polsia_okara_geo'),
      findPolsia('polsia_okara_competitors'),
      findPolsia('polsia_okara_patents'),
      findPolsia('polsia_okara_grants'),
      fetchSafe(`${CLAWAPI}/api/dashboard/competitors/${canonicalId}`),
      fetchSafe(`${CLAWAPI}/api/dashboard/social/${canonicalId}`),
      fetchSafe(`${CLAWAPI}/api/polsia/social/${domain}`),
      findPolsia('polsia_okara_documents'),
      fetchSafe(`${CLAWAPI}/api/dashboard/investor-pipeline/${canonicalId}`),
      fetchSafe(`${CLAWAPI}/api/polsia/investor-leads/${domain}`),
      fetchSafe(`${CLAWAPI}/api/polsia/feed/${domain}`),
      fetchSafe(`${CLAWAPI}/api/dashboard/updates/${canonicalId}`),
      fetchSafe(`${CLAWAPI}/api/dashboard/goals/${canonicalId}`),
      fetchSafe(`${CLAWAPI}/api/dashboard/metrics/${canonicalId}`),
      fetchSafe(`${CLAWAPI}/api/dashboard/hiring/${canonicalId}`),
      fetchSafe(`${CLAWAPI}/api/dashboard/partnerships/${canonicalId}`),
      findPolsia('polsia_okara_videos'),
      findPolsia('polsia_okara_social_analytics'),
    ]);

    return NextResponse.json({
      domain,
      ventureId,
      brandDna: brandDnaDoc,
      companyInfo: companyInfoDoc,
      seoData: seoDataDoc,
      geoData: geoDataDoc,
      competitors: {
        polsia: polsiaCompetitorsDoc,
        dashboard: dashboardCompetitors,
      },
      social: {
        dashboard: dashboardSocial,
        polsia: polsiaSocial,
      },
      documents: polsiaDocuments,
      patents: polsiaPatentsDoc,
      grants: polsiaGrantsDoc,
      investors: {
        dashboard: dashboardInvestors,
        polsia: polsiaInvestors,
      },
      feed: activityFeed,
      updates: recentUpdates,
      goals,
      metrics,
      hiring,
      partnerships,
      videos: videosDoc,
      socialAnalytics: socialAnalyticsDoc,
    });
  } catch (err) {
    console.error('Intelligence API error:', err);
    return NextResponse.json({ error: 'Failed to fetch intelligence data' }, { status: 500 });
  }
}
