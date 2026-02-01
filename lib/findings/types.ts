/**
 * Shared Types for Findings Detection Engines
 * 
 * These types define the structure for product data and findings output.
 * All findings must conform to these interfaces for consistency.
 */

/**
 * Product input data structure
 * Represents a single product in the seller's inventory
 */
export interface Product {
  asin: string;
  product_name: string;
  cost_per_unit: number;
  selling_price: number;
  quantity_in_stock: number;
  days_in_stock: number;
  category: string;
  size_tier?: "standard" | "oversize";
  estimated_monthly_sales?: number;
}

/**
 * Recommended action structure
 * Each action includes effort, timeline, and expected financial impact
 */
export interface Action {
  title: string;
  effort_hours: number;
  effort_level: "trivial" | "quick" | "moderate" | "significant";
  timeline: string;
  estimated_gain_eur: number | null;
  estimated_gain_description: string;
  cost_eur?: number;
  cost_monthly_eur?: number;
  roi_months?: number | null;
  risk_level?: "very low" | "low" | "medium" | "high";
  revert_timeline?: string;
}

/**
 * Finding output structure
 * Standardized format for all finding types
 * Contains problem description, financial metrics, and recommended actions
 */
export interface Finding {
  finding_type: "dead_inventory" | "low_margin" | "slow_velocity";
  severity: "critical" | "opportunity";
  asin: string;
  product_name: string;
  problem_headline: string;
  problem_description: string;
  financial_impact_annual_eur: number;
  impact_priority: number;  // 1-100, where 100 is highest priority
  recommended_actions: Action[];
  
  // Allow additional type-specific fields
  [key: string]: any;
}

/**
 * Dead Inventory Finding (extends Finding)
 * Specific fields for dead inventory detection
 */
export interface DeadInventoryFinding extends Finding {
  finding_type: "dead_inventory";
  severity: "critical";
  
  // Problem metrics
  days_in_stock: number;
  net_margin_percent: number;
  
  // Financial impact breakdown
  capital_tied_up_eur: number;
  monthly_storage_cost_eur: number;
  annual_storage_cost_eur: number;
  annual_opportunity_cost_eur: number;
  total_annual_cost_eur: number;
  monthly_bleed_eur: number;
}

/**
 * Low Margin Finding (extends Finding)
 * Specific fields for low margin detection
 */
export interface LowMarginFinding extends Finding {
  finding_type: "low_margin";
  severity: "critical";
  
  // Current state
  current_price_eur: number;
  cost_per_unit_eur: number;
  current_net_margin_percent: number;
  current_profit_per_unit_eur: number;
  estimated_monthly_sales: number;
  current_monthly_profit_eur: number;
  current_annual_profit_eur: number;
  
  // Recommended repricing scenario
  recommended_price_eur: number;
  price_increase_percent: number;
  price_increase_absolute_eur: number;
  estimated_volume_change_percent: number;
  estimated_new_monthly_sales: number;
  new_profit_per_unit_eur: number;
  new_monthly_profit_eur: number;
  new_annual_profit_eur: number;
  
  // Impact metrics
  monthly_gain_eur: number;
  annual_gain_eur: number;
  monthly_gain_percentage: number;
  roi_payback_days: number;
}

/**
 * Slow Velocity Finding (extends Finding)
 * Specific fields for slow velocity detection
 */
export interface SlowVelocityFinding extends Finding {
  finding_type: "slow_velocity";
  severity: "opportunity";
  
  // Current state
  current_net_margin_percent: number;
  estimated_daily_sales: number;
  estimated_monthly_sales: number;
  capital_deployed_eur: number;
  profit_per_unit_eur: number;
  current_monthly_profit_eur: number;
  current_annual_profit_eur: number;
  days_in_stock: number;
  
  // 2x velocity scenario (inspiration)
  velocity_2x_monthly_sales: number;
  velocity_2x_monthly_profit_eur: number;
  velocity_2x_annual_profit_eur: number;
  velocity_2x_monthly_gain_eur: number;
  
  // Growth path A: PPC Ads
  ppc_monthly_budget_eur: number;
  ppc_expected_sales_lift_percent: number;
  ppc_new_monthly_sales: number;
  ppc_new_monthly_profit_eur: number;
  ppc_monthly_cost_eur: number;
  ppc_net_gain_monthly_eur: number;
  ppc_effort_hours: number;
  ppc_effort_level: string;
  ppc_timeline: string;
  ppc_payback_period_weeks: number;
  ppc_risk_level: string;
  ppc_roi_percentage: number;
  
  // Growth path B: Listing Optimization
  listing_optimization_effort_hours: number;
  listing_optimization_effort_level: string;
  listing_optimization_expected_lift: number;
  listing_optimization_new_monthly_sales: number;
  listing_optimization_new_monthly_profit_eur: number;
  listing_optimization_cost: number;
  listing_optimization_net_gain_monthly_eur: number;
  listing_optimization_timeline: string;
  listing_optimization_risk_level: string;
}
