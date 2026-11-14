export interface Campaign {
  id: number;
  product_id: number;
  title: string;
  channel_type: string;
  budget: number;
  target_cpa: number;
  projected_lift_pct: number;
  status: string;
  tactic: string;
  timeline: string;
  created_at?: string;
}

export interface ProductPlan {
  id: number;
  product_id: number;
  tier_name: string;
  price: number;
  billing_frequency: string;
  is_hero_tier: boolean;
  features: string[];
  target_buyer: string;
  roadmap_phase: string;
  status: string;
}

export interface ReportSection {
  id: number;
  report_id: number;
  section_order: number;
  title: string;
  content: string;
}

export interface GTMReport {
  id: number;
  product_id: number;
  title: string;
  status: string;
  view_count: number;
  last_viewed_at?: string | null;
  is_implemented: boolean;
  created_at: string;
  sections: ReportSection[];
}

export interface Product {
  id: number;
  name: string;
  industry: string;
  stage: string;
  is_existing_product: boolean;
  currency: string;
  hook: string;
  retail_price: number;
  unit_cost: number;
  projected_margin: number;
  active_sales: number;
  product_revenue: number;
  units_sold: number;
  conversion_rate: number;
  health_score: number;
  monthly_curve: number[];
  created_at: string;
  campaigns: Campaign[];
  plans: ProductPlan[];
  reports: GTMReport[];
}
