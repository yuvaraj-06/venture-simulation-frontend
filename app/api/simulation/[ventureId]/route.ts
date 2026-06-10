import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';


// Normalize V2 pipeline data to V1 dashboard schema
function normalizeSimulation(doc: any): any {
  const meta = doc.simulation_metadata || {};
  const name = doc.name || meta.venture_name || doc.cmny_id || 'Untitled';
  
  // Fix simulation_metadata if missing venture_name
  if (!meta.venture_name) {
    doc.simulation_metadata = {
      ...meta,
      venture_name: name,
      version: meta.version || '1.0',
      generated_date: doc.generated_at || new Date().toISOString().split('T')[0],
      vertical: doc.vertical || 'Technology',
      tam: 1000000000,
      tam_formatted: '$1B+',
    };
  }

  // Fix executive_summary if it is a string
  if (typeof doc.executive_summary === 'string') {
    doc.executive_summary = {
      current_valuation: 0,
      target_valuation: 500000,
      total_agent_cost: 2500,
      agent_cost_pct: '15%',
      avg_agent_work_share: '70%',
      timeline: '6-12 months',
      total_goals: 21,
      goals_achieved: 0,
      key_takeaways: [doc.executive_summary.slice(0, 300)],
    };
  }

  // Fix stages if they use V2 schema (stage instead of stage_name)
  if (Array.isArray(doc.stages) && doc.stages.length > 0 && doc.stages[0].stage && !doc.stages[0].stage_name) {
    const STAGE_MAP: Record<string, number> = { Explore: 1, Generate: 2, Validate: 3, Pilot: 4, Launch: 5, Scale: 6, Exit: 7 };
    doc.stages = doc.stages.map((s: any, idx: number) => ({
      stage_number: STAGE_MAP[s.stage] || (idx + 1),
      stage_name: s.stage || 'Stage ' + (idx + 1),
      headline: (s.objectives && s.objectives[0]) || s.stage + ' phase',
      description: (s.objectives || []).join(' '),
      duration: s.timeline || '8-12 weeks',
      target_valuation: Math.round(500000 * (1 + idx * 0.5)),
      goals_count: '0/' + ((s.kpis || []).length || 3),
      agent_cost: 500 * (idx + 1),
      human_time: (20 + idx * 10) + ' hours',
      human_cost: 2000 * (idx + 1),
      total_cost: 500 * (idx + 1) + 2000 * (idx + 1),
      agent_work_pct: 70 - idx * 5,
      human_work_pct: 30 + idx * 5,
      workstream_weights: [
        { workstream: 'Product', weight_pct: 30, valuation_allocation: 150000 },
        { workstream: 'Demand', weight_pct: 25, valuation_allocation: 125000 },
        { workstream: 'Team', weight_pct: 15, valuation_allocation: 75000 },
        { workstream: 'Operations', weight_pct: 10, valuation_allocation: 50000 },
        { workstream: 'Partnerships', weight_pct: 5, valuation_allocation: 25000 },
        { workstream: 'Investors', weight_pct: 10, valuation_allocation: 50000 },
        { workstream: 'Synergy', weight_pct: 5, valuation_allocation: 25000 },
      ],
      workstreams: (s.kpis || []).length > 0 ? [{
        workstream_name: 'Product',
        headline: 'Product KPIs for ' + (s.stage || 'this stage'),
        valuation: 150000,
        goals: (s.kpis || []).map((kpi: string, ki: number) => ({
          id: (s.stage || 'stage').toLowerCase() + '-kpi-' + ki,
          name: kpi,
          status: 'PENDING',
          result: 'Not started',
          target: kpi,
          target_valuation: Math.round(150000 / ((s.kpis || []).length || 1)),
          contribution: 0,
          performance_score: 0,
        })),
      }] : [],
      agent_iterations: [],
      human_touchpoints: [],
      stage_scorecard: (s.objectives || []).map((obj: string) => ({
        criterion: obj.slice(0, 80),
        result: 'Pending',
        target: 'Validated',
        status: 'FAIL',
      })),
      stage_summary: {
        performance_score: 0,
        execution_score: 0,
        agent_iwa: '0%',
        agent_cost: 500 * (idx + 1),
        human_cost: 2000 * (idx + 1),
      },
      simulated_deliverables: s.objectives || [],
    }));
  }

  // Fix signal_origin if missing or string
  if (!doc.signal_origin || typeof doc.signal_origin === 'string') {
    doc.signal_origin = {
      signal_strength_score: 60,
      threshold: 40,
      action_triggered: 'Proceed to Generate',
      vertical: doc.vertical || 'Technology',
      subdomain: '',
      tam: '$1B+',
      signals: [{ signal: 'User submitted via ShareOS', strength: 'Medium' }],
      domain_context: typeof doc.signal_origin === 'string' ? doc.signal_origin : '',
      core_scientific_thesis: '',
    };
  }

  // Fix founding_team
  if (!Array.isArray(doc.founding_team)) {
    doc.founding_team = [{ name: 'Founder', role: 'CEO', hourly_rate: 100, description: '', expertise_tags: [] }];
  }

  // Fix products
  if (!Array.isArray(doc.products)) {
    doc.products = [{ name: name, category: doc.vertical || 'Technology', outcome: '', mechanism: '', key_differentiator: '', evidence_score: 'N/A' }];
  }

  // Fix analysis
  if (!doc.analysis || typeof doc.analysis !== 'object' || !doc.analysis.human_pct_trajectory) {
    doc.analysis = {
      human_pct_trajectory: [
        { stage: 'Explore', human_pct: 30, agent_pct: 70, human_cost: '$3K', agent_cost: '$500' },
        { stage: 'Generate', human_pct: 35, agent_pct: 65, human_cost: '$8K', agent_cost: '$2K' },
        { stage: 'Validate', human_pct: 40, agent_pct: 60, human_cost: '$20K', agent_cost: '$5K' },
      ],
      agent_value_creation: [
        { value_driver: 'Market Research', amount: '$15,000' },
        { value_driver: 'Competitive Analysis', amount: '$10,000' },
      ],
      shareos_vs_traditional: { traditional: '$150,000 over 12 months', shareos: '$25,000 over 6 months' },
      proofs: [{ proof_number: 1, title: 'Cost Efficiency', description: 'AI agents reduce costs by 80%' }],
    };
  }

  return doc;
}

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
      return NextResponse.json(normalizeSimulation(simulation));
    }

    // Fallback: check deals_business and build simulation-compatible response
    // ONLY for deals_business (user-submitted), not deals_internal (portfolio companies)
    const bizVenture = await db
      .collection('deals_business')
      .findOne({ cmny_id: { $regex: new RegExp(`^${ventureId}$`, 'i') } });

    if (bizVenture) {
      return NextResponse.json(normalizeSimulation(buildSimulationFromBusiness(bizVenture)));
    }

    // Check deals_internal and build a minimal simulation shell
    const internalVenture = await db
      .collection('deals_internal')
      .findOne({ cmny_id: { $regex: new RegExp(`^${ventureId}$`, 'i') } });

    if (internalVenture) {
      // Build minimal simulation from deals_internal
      const name = internalVenture.name || internalVenture.cmny_id || ventureId;
      const stage = internalVenture.stage || 'Explore';
      const vertical = internalVenture.vertical || 'Technology';
      const osShare = internalVenture.os_share || {};
      const workstreams = osShare.workstreams || [];
      const targetVal = internalVenture.targetValuation || 1000000;

      return NextResponse.json(normalizeSimulation({
        cmny_id: internalVenture.cmny_id,
        simulation_metadata: {
          venture_name: name,
          version: '1.0',
          generated_date: new Date().toISOString().split('T')[0],
          vertical,
          subdomain: internalVenture.subdomain || '',
          tam: 1000000000,
          tam_formatted: '$1B+',
        },
        executive_summary: {
          current_valuation: internalVenture.currentValuation || 0,
          target_valuation: targetVal,
          total_agent_cost: 5000,
          agent_cost_pct: '10%',
          avg_agent_work_share: '70%',
          timeline: '12 months',
          total_goals: workstreams.reduce((acc: number, ws: any) => acc + (ws.goals?.length || 0), 0),
          goals_achieved: 0,
          key_takeaways: [
            `${name} is a ${vertical} venture currently in the ${stage} stage.`,
            internalVenture.tagline || `Building within the ShareOS framework.`,
          ],
        },
        signal_origin: {
          signal_strength_score: 65,
          threshold: 40,
          action_triggered: 'Active Portfolio Company',
          vertical,
          subdomain: internalVenture.subdomain || vertical,
          tam: '$1B+',
          signals: [{ signal: 'Portfolio company', strength: 'High' }],
          domain_context: internalVenture.tagline || '',
        },
        founding_team: (internalVenture.team || []).map((t: any) => ({
          name: t.name || 'Team Member',
          role: t.role || 'Contributor',
          hourly_rate: 100,
          description: t.role || '',
          expertise_tags: [],
        })),
        products: [],
        stages: [{
          stage_number: 1,
          stage_name: stage,
          headline: `${name} — ${stage} phase`,
          description: internalVenture.tagline || `Active ${stage.toLowerCase()} phase.`,
          duration: '12 months',
          target_valuation: targetVal,
          goals_count: `${workstreams.reduce((acc: number, ws: any) => acc + (ws.goals?.length || 0), 0)}`,
          agent_cost: 5000,
          human_time: '200 hours',
          human_cost: 20000,
          total_cost: 25000,
          agent_work_pct: 70,
          human_work_pct: 30,
          workstream_weights: workstreams.map((ws: any) => ({
            workstream: ws.name || 'Unknown',
            weight_pct: Math.round((ws.weight || 0.14) * 100),
            valuation_allocation: Math.round(targetVal * (ws.weight || 0.14)),
          })),
          workstreams: workstreams.slice(0, 7).map((ws: any) => ({
            workstream_name: ws.name || 'Workstream',
            headline: ws.name || '',
            valuation: Math.round(targetVal * (ws.weight || 0.14)),
            goals: (ws.goals || []).slice(0, 5).map((g: any) => ({
              id: g.id || g.name?.slice(0, 20) || 'goal',
              name: g.name || 'Goal',
              status: (g.performanceScore || 0) >= 80 ? 'ACHIEVED' : (g.performanceScore || 0) > 0 ? 'IN-PROGRESS' : 'PENDING',
              result: g.current_goal_metric_status || 'In progress',
              target: g.target_goal_metric || g.name || '',
              target_valuation: g.targetValuation || 0,
              contribution: g.performanceScore || 0,
              performance_score: g.performanceScore || 0,
            })),
          })),
          agent_iterations: [],
          human_touchpoints: [],
          stage_scorecard: [],
          stage_summary: {
            performance_score: 0,
            execution_score: 0,
            agent_iwa: '70%',
            agent_cost: 5000,
            human_cost: 20000,
          },
        }],
        analysis: {
          human_pct_trajectory: [
            { stage: stage, human_pct: 30, agent_pct: 70, human_cost: '$20K', agent_cost: '$5K' },
          ],
          agent_value_creation: [],
          shareos_vs_traditional: { traditional: '$200K+ over 18 months', shareos: '$25K over 6 months' },
          proofs: [],
        },
      }));
    }

    return NextResponse.json({ error: 'Simulation not found' }, { status: 404 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch simulation' }, { status: 500 });
  }
}
