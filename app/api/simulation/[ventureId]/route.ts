import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

function buildSimulationFromBusiness(venture: any): any {
  const name = venture.name || 'Untitled Venture';
  const desc = venture.tagline || venture.raw_answers?.business_description || '';
  const stage = venture.stage || 'Explore';
  const vertical = venture.vertical || 'Organizational';
  const targetVal = venture.targetValuation || 500000;
  const team = venture.team || [];
  const rawAnswers = venture.raw_answers || {};
  const weights = venture.workstream_weights || {
    product: 0.30, demand: 0.25, team: 0.15, operations: 0.10,
    partnerships: 0.05, investors: 0.10, synergy: 0.05,
  };

  const stageMap: Record<string, number> = {
    'Explore': 1, 'Generate': 2, 'Validate': 3,
    'Pilot': 4, 'Launch': 5, 'Scale': 6, 'Exit': 7,
  };
  const stageNum = stageMap[stage] || 1;

  const workstreamNames = ['Product', 'Demand', 'Operations', 'Team', 'Partnerships', 'Investors', 'Synergy'];

  // Build workstream data for this stage
  const workstreams = workstreamNames.map((ws) => {
    const key = ws.toLowerCase();
    const w = (weights as any)[key] || 0.1;
    const wsVal = Math.round(targetVal * w);
    return {
      workstream_name: ws,
      headline: `${ws} strategy for ${name}`,
      key_metric_label: `${ws} readiness`,
      key_metric_value: 'Not started',
      key_metric_target: 'Defined',
      valuation: wsVal,
      goals: [
        {
          id: `${key}-g1`,
          name: `Define ${ws} Strategy`,
          status: 'PENDING' as const,
          result: 'Not yet started',
          target: `${ws} strategy document completed`,
          target_valuation: Math.round(wsVal * 0.4),
          contribution: 0,
          performance_score: 0,
        },
        {
          id: `${key}-g2`,
          name: `${ws} Market Research`,
          status: 'PENDING' as const,
          result: 'Not yet started',
          target: 'Research completed with findings',
          target_valuation: Math.round(wsVal * 0.3),
          contribution: 0,
          performance_score: 0,
        },
        {
          id: `${key}-g3`,
          name: `${ws} Initial Setup`,
          status: 'PENDING' as const,
          result: 'Not yet started',
          target: 'Initial infrastructure in place',
          target_valuation: Math.round(wsVal * 0.3),
          contribution: 0,
          performance_score: 0,
        },
      ],
    };
  });

  const wsWeights = workstreamNames.map((ws) => {
    const key = ws.toLowerCase();
    const w = (weights as any)[key] || 0.1;
    return {
      workstream: ws,
      weight_pct: Math.round(w * 100),
      valuation_allocation: Math.round(targetVal * w),
    };
  });

  // Build a single stage
  const stageData = {
    stage_number: stageNum,
    stage_name: stage,
    headline: `${stage} phase for ${name}`,
    description: desc || `Initial ${stage.toLowerCase()} phase to validate the venture concept.`,
    duration: stage === 'Explore' ? '4-8 weeks' : '8-16 weeks',
    target_valuation: targetVal,
    goals_count: `0/${workstreams.reduce((a, ws) => a + ws.goals.length, 0)}`,
    agent_cost: 500,
    human_time: '40 hours',
    human_cost: 4000,
    total_cost: 4500,
    agent_work_pct: 65,
    human_work_pct: 35,
    workstream_weights: wsWeights,
    workstreams,
    agent_iterations: [
      {
        iteration_number: 1,
        agent_name: 'Market Research Agent',
        agent_role: 'Discovery & Competitive Research',
        failure_description: 'Initial market scan incomplete',
        fix_description: 'Expanded search parameters and added alternative data sources',
        before_state: 'No market data',
        after_state: 'Basic market landscape mapped',
        human_required: false,
        valuation_at_risk: '$25,000',
      },
    ],
    human_touchpoints: [
      {
        touchpoint_number: 1,
        person: team[0]?.name || 'Founder',
        time_spent: '2 hours',
        cost: 200,
        description: 'Initial venture concept review and direction setting',
        decision_made: 'Proceed with concept exploration',
      },
    ],
    stage_scorecard: [
      { criterion: 'Problem Validated', result: 'Pending', target: 'Validated', status: 'FAIL' as const },
      { criterion: 'ICP Defined', result: 'Pending', target: 'Defined', status: 'FAIL' as const },
      { criterion: 'TAM Estimated', result: 'Pending', target: '>$1B', status: 'FAIL' as const },
    ],
    stage_summary: {
      performance_score: 0,
      execution_score: 0,
      agent_iwa: '0%',
      agent_cost: 500,
      human_cost: 4000,
    },
    simulated_deliverables: [
      'Market research report',
      'Competitive landscape analysis',
      'Initial product concept document',
      'Target customer profile',
    ],
  };

  return {
    cmny_id: venture.cmny_id,
    simulation_metadata: {
      venture_name: name,
      version: '1.0',
      generated_date: new Date().toISOString().split('T')[0],
      vertical,
      subdomain: rawAnswers.industry || '',
      tam: 1000000000,
      tam_formatted: '$1B+',
      simulation_purpose: `Autonomous venture simulation for ${name}`,
    },
    executive_summary: {
      current_valuation: 0,
      target_valuation: targetVal,
      total_agent_cost: 500,
      agent_cost_pct: '11%',
      avg_agent_work_share: '65%',
      timeline: '6-12 months',
      total_goals: workstreams.reduce((a, ws) => a + ws.goals.length, 0),
      goals_achieved: 0,
      key_takeaways: [
        `${name} is in the ${stage} phase, focusing on concept validation.`,
        desc ? `Core concept: ${desc}` : 'Business description pending.',
        `Target market: ${rawAnswers.target_market || 'To be defined'}`,
        `Revenue model: ${rawAnswers.revenue_model || 'To be defined'}`,
        `Team: ${team.map((t: any) => t.name).join(', ') || 'Founder-led'}`,
      ],
    },
    signal_origin: {
      signal_strength_score: 45,
      threshold: 40,
      action_triggered: 'Proceed to Generate',
      vertical,
      subdomain: rawAnswers.industry || 'Technology',
      tam: '$1B+',
      signals: [
        { signal: 'User submitted via ShareOS onboarding', strength: 'Medium' },
        { signal: `${stage} stage venture`, strength: stage === 'Explore' ? 'Low' : 'Medium' },
      ],
      domain_context: desc,
      core_scientific_thesis: rawAnswers.business_description || desc,
    },
    founding_team: team.map((t: any) => ({
      name: t.name || 'Founder',
      role: t.role || 'Founder',
      hourly_rate: 100,
      description: `${t.role || 'Founder'} of ${name}`,
      expertise_tags: [rawAnswers.industry || 'Technology', 'Entrepreneurship'],
    })),
    products: [
      {
        name: name !== 'Undecided' ? name : 'Core Product',
        category: rawAnswers.industry || vertical,
        outcome: desc,
        mechanism: rawAnswers.business_description || 'To be defined',
        key_differentiator: 'To be defined through validation',
        evidence_score: 'N/A',
      },
    ],
    stages: [stageData],
    analysis: {
      human_pct_trajectory: [
        { stage: 'Explore', human_pct: 35, agent_pct: 65, human_cost: '$4K', agent_cost: '$500' },
        { stage: 'Generate', human_pct: 30, agent_pct: 70, human_cost: '$8K', agent_cost: '$2K' },
        { stage: 'Validate', human_pct: 40, agent_pct: 60, human_cost: '$20K', agent_cost: '$5K' },
      ],
      agent_value_creation: [
        { value_driver: 'Market Research Automation', amount: '$15,000' },
        { value_driver: 'Competitive Analysis', amount: '$10,000' },
        { value_driver: 'Content Generation', amount: '$8,000' },
      ],
      shareos_vs_traditional: {
        traditional: '$150,000 over 12 months',
        shareos: '$25,000 over 6 months with agent automation',
      },
      proofs: [
        { proof_number: 1, title: 'Cost Efficiency', description: 'AI agents reduce venture exploration costs by 80%' },
        { proof_number: 2, title: 'Speed', description: 'Automated research completes in hours vs weeks' },
      ],
    },
    generated_at: new Date().toISOString(),
    metadata: {
      source: 'deals_business',
      auto_generated: true,
    },
  };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ ventureId: string }> }
) {
  try {
    const { ventureId } = await params;
    const client = await clientPromise;
    const db = client.db('shareos');

    // First check venture_simulations
    const simulation = await db
      .collection('venture_simulations')
      .findOne({ cmny_id: { $regex: new RegExp(`^${ventureId}$`, 'i') } });

    if (simulation) {
      return NextResponse.json(simulation);
    }

    // Fallback: check deals_business and build simulation-compatible response
    // ONLY for deals_business (user-submitted), not deals_internal (portfolio companies)
    const bizVenture = await db
      .collection('deals_business')
      .findOne({ cmny_id: { $regex: new RegExp(`^${ventureId}$`, 'i') } });

    if (bizVenture) {
      return NextResponse.json(buildSimulationFromBusiness(bizVenture));
    }

    // deals_internal ventures without a simulation get 404 (they need generate.py to create one)
    return NextResponse.json({ error: 'Simulation not found' }, { status: 404 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch simulation' }, { status: 500 });
  }
}
