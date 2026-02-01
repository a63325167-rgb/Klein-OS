// src/types/upload.ts

/**
 * Raw input row from CSV/Excel file upload
 * This is what the user uploads BEFORE any calculations are performed
 * 
 * REQUIRED fields: Must be present or row is rejected
 * OPTIONAL fields: Have default values applied by parser if missing
 */
export interface UploadRow {
  // ============================================
  // REQUIRED FIELDS (no defaults, row rejected if missing)
  // ============================================
  
  /** 1-indexed row number from source file (row 1 = headers, row 2 = first data row) */
  rowIndex: number;
  
  /** Amazon ASIN identifier (exactly 10 characters, alphanumeric) */
  asin: string;
  
  /** Product name/title (1-200 characters) */
  name: string;
  
  /** Selling price per unit in EUR (minimum €0.01) */
  price: number;
  
  /** Cost of goods sold per unit in EUR (minimum €0.01) */
  cogs: number;
  
  /** Monthly sales velocity in units (minimum 0, can be 0 for new products) */
  velocity: number;

  // ============================================
  // OPTIONAL FIELDS (have defaults if missing)
  // ============================================
  
  /** Return rate as percentage 0-100 (default: 5%) */
  returnRate: number;
  
  /** Amazon referral fee as percentage 0-100 (default: 15%) */
  referralFee: number;
  
  /** FBA fulfillment fee as percentage 0-100 (default: 8%) */
  fbaFee: number;
  
  /** VAT tax rate as percentage 0-100 (default: 19%) */
  vat: number;
  
  /** Shipping cost per unit in EUR (default: €2.00) */
  shippingCost: number;
  
  /** Initial inventory order quantity in units (default: velocity × 2) */
  initialOrder: number;
  
  /** Starting cash available in EUR (default: €5,000) */
  initialCash: number;
  
  /** Number of competing sellers (default: 0) */
  competitorCount: number;
  
  /** Average customer rating 0-5 stars (default: 3.5) */
  rating: number;
  
  /** Product category name (default: "Uncategorized") */
  category: string;
}

/**
 * Risk level classification using traffic light system
 * - red: High risk / danger zone
 * - yellow: Medium risk / warning zone
 * - green: Low risk / healthy zone
 */
export type RiskLevel = 'red' | 'yellow' | 'green';

/**
 * Calculated product results with financial metrics and risk analysis
 * Extends UploadRow with all calculated fields (read-only, auto-generated)
 * 
 * This is what gets displayed in tables, charts, and dashboards
 * All calculations are DETERMINISTIC (same input = same output)
 */
export interface BulkProductResult extends UploadRow {
  // ============================================
  // FINANCIAL METRICS
  // ============================================
  
  /** Net profit per unit sold in EUR (revenue - all fees - COGS) */
  profitPerUnit: number;
  
  /** Profit margin as percentage (profitPerUnit / price × 100) */
  profitMargin: number;
  
  /** Total monthly profit in EUR (profitPerUnit × velocity) */
  totalMonthlyProfit: number;

  // ============================================
  // TIMING METRICS
  // ============================================
  
  /** Days required to recoup initial inventory investment */
  breakEvenDays: number;
  
  /** Months of sustainable operation with available cash (0-12 range) */
  cashRunway: number;
  
  /** Days to sell through initial inventory order */
  turnoverDays: number;

  // ============================================
  // HEALTH & RISK METRICS
  // ============================================
  
  /** 
   * Overall product health score 0-100
   * Weighted average: 25% margin + 25% break-even + 25% cashflow + 15% competition + 10% inventory
   */
  healthScore: number;
  
  /** Profitability risk level (based on profit margin thresholds) */
  profitabilityRisk: RiskLevel;
  
  /** Break-even risk level (based on break-even days thresholds) */
  breakEvenRisk: RiskLevel;
  
  /** Cash flow risk level (based on cash runway thresholds) */
  cashFlowRisk: RiskLevel;
  
  /** Competition risk level (based on competitor count thresholds) */
  competitionRisk: RiskLevel;
  
  /** Inventory risk level (based on turnover days thresholds) */
  inventoryRisk: RiskLevel;
}

/**
 * A single validation error encountered during file parsing
 * Errors are NOT thrown - they are collected and returned in ParseResult
 */
export interface ParseError {
  /** Row number where error occurred (1-indexed, matches source file) */
  rowIndex: number;
  
  /** Field name that caused the validation error */
  field: string;
  
  /** The problematic value as string (original input) */
  value: string;
  
  /** Human-readable error message explaining what went wrong */
  error: string;
  
  /** 
   * Whether parser can auto-correct this issue
   * - true: Parser can apply default or fix automatically (becomes warning)
   * - false: Row must be rejected, user must fix manually
   */
  fixable: boolean;
}

/**
 * Result container from parsing CSV/Excel upload file
 * Contains valid rows, errors, warnings, and metadata
 * 
 * Success condition: rows.length + errors.length = totalRows
 */
export interface ParseResult {
  /** Valid rows ready for calculation (defaults already applied) */
  rows: UploadRow[];
  
  /** Non-fixable errors - these rows are rejected and excluded from processing */
  errors: ParseError[];
  
  /** Fixable issues or cautionary messages (e.g., "zero velocity", "low rating") */
  warnings: string[];
  
  /** Total number of data rows in source file (excluding header row) */
  totalRows: number;
}
