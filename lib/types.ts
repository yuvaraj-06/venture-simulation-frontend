export interface SimulationMetadata {
  venture_name: string;
  version: string;
  generated_date: string;
  vertical: string;
  subdomain?: string;
  tam: number;
  tam_formatted: string;
  simulation_purpose?: string;
}

export interface ExecutiveSummary {
  current_valuation: number;
  target_valuation: number;
  total_agent_cost: number;
  agent_cost_pct: string;
  avg_agent_work_share: string;
  timeline: string;
  total_goals: number;
  goals_achieved: number;
  key_takeaways: string[];
}

export interface SignalOrigin {
  signal_strength_score: number;
  threshold: number;
  action_triggered: string;
  vertical: string;
  subdomain: string;
  tam: string;
  signals: { signal: string; strength: string }[];
  domain_context: string;
  core_scientific_thesis: string;
}

export interface TeamMember {
  name: string;
  role: string;
  hourly_rate: number;
  description: string;
  expertise_tags: string[];
}

export interface Product {
  name: string;
  category: string;
  outcome: string;
  mechanism: string;
  key_differentiator: string;
  evidence_score: string;
  pricing?: string;
}

export interface WorkstreamWeight {
  workstream: string;
  weight_pct: number;
  valuation_allocation: number;
}

export interface Goal {
  id: string;
  name: string;
  status: 'ACHIEVED' | 'IN-PROGRESS' | 'PENDING' | 'FAILED';
  result: string;
  target: string;
  target_valuation: number;
  contribution: number;
  performance_score: number;
  weight_in_stage?: string;
}

export interface WorkstreamData {
  workstream_name: string;
  headline: string;
  key_metric_label?: string;
  key_metric_value?: string;
  key_metric_target?: string;
  valuation: number;
  goals: Goal[];
}

export interface AgentIteration {
  iteration_number: number;
  agent_name: string;
  agent_role: string;
  failure_description: string;
  fix_description: string;
  before_state: string;
  after_state: string;
  human_required: boolean;
  valuation_at_risk: string;
  value_recovered?: string;
}

export interface HumanTouchpoint {
  touchpoint_number: number;
  person: string;
  time_spent: string;
  cost: number;
  description: string;
  decision_made: string;
  agent_preparation?: string;
}

export interface ScorecardItem {
  criterion: string;
  result: string;
  target: string;
  status: 'PASS' | 'FAIL' | 'GO' | 'NO-GO' | 'ADVANCE' | 'BONUS';
  valuation_impact?: string;
}

export interface StageSummary {
  performance_score: number;
  execution_score: number;
  agent_iwa: string;
  agent_cost: number;
  human_cost: number;
}

export interface Stage {
  stage_number: number;
  stage_name: string;
  headline: string;
  description: string;
  duration: string;
  target_valuation: number;
  goals_count: string;
  agent_cost: number;
  human_time: string;
  human_cost: number;
  total_cost: number;
  agent_work_pct: number;
  human_work_pct: number;
  workstream_weights: WorkstreamWeight[];
  workstreams: WorkstreamData[];
  agent_iterations: AgentIteration[];
  human_touchpoints: HumanTouchpoint[];
  stage_scorecard: ScorecardItem[];
  stage_summary: StageSummary;
  simulated_deliverables: string[];
}

export interface Analysis {
  human_pct_trajectory: {
    stage: string;
    human_pct: number;
    agent_pct: number;
    human_cost: string;
    agent_cost: string;
  }[];
  agent_value_creation: { value_driver: string; amount: string }[];
  shareos_vs_traditional: { traditional: string; shareos: string };
  proofs: { proof_number: number; title: string; description: string }[];
  master_stage_summary?: {
    stage: string;
    duration: string;
    goals: string;
    agent_cost: string;
    human_time: string;
    human_cost: string;
    total_cost: string;
    iwa: string;
  }[];
}

export interface VentureSimulation {
  _id?: string;
  cmny_id: string;
  simulation_metadata: Partial<SimulationMetadata> & { venture_name: string };
  executive_summary: Partial<ExecutiveSummary>;
  signal_origin?: Partial<SignalOrigin>;
  founding_team?: Partial<TeamMember>[];
  products?: Partial<Product>[];
  stages?: Partial<Stage>[];
  analysis?: Partial<Analysis>;
  generated_at?: string;
}
