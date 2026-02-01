import React from 'react';

/**
 * Typography System - Single Source of Truth
 * 
 * Professional typography scale following B2B SaaS standards (Stripe, Shopify, Linear)
 * All components use semantic HTML with consistent sizing, weights, and line-heights
 * Fully responsive with proper scaling across mobile, tablet, and desktop
 * WCAG AA compliant contrast ratios in both light and dark modes
 */

// ============================================================================
// HEADINGS
// ============================================================================

/**
 * H1 - Page Title
 * Usage: Main page headers, dashboard titles
 * Size: 36px desktop, 30px mobile | Weight: 700 | Line-height: 1.2
 * Example: "Business Intelligence Dashboard", "Product Portfolio"
 */
export const H1 = ({ children, className = "", ...props }) => (
  <h1 
    className={`text-3xl md:text-4xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white ${className}`}
    {...props}
  >
    {children}
  </h1>
);

/**
 * H2 - Section Header
 * Usage: Major section dividers, tab content headers
 * Size: 24px desktop, 20px mobile | Weight: 600 | Line-height: 1.375
 * Example: "Scenario Calculator", "Market Analysis", "Recommendations"
 */
export const H2 = ({ children, className = "", ...props }) => (
  <h2 
    className={`text-xl md:text-2xl font-semibold leading-snug tracking-tight text-slate-800 dark:text-white ${className}`}
    {...props}
  >
    {children}
  </h2>
);

/**
 * H3 - Subsection / Card Title
 * Usage: Card headers, component titles, KPI labels
 * Size: 20px desktop, 18px mobile | Weight: 600 | Line-height: 1.5
 * Example: "Net Profit", "Risk Assessment", "Performance Charts"
 */
export const H3 = ({ children, className = "", ...props }) => (
  <h3 
    className={`text-lg md:text-xl font-semibold leading-normal text-slate-800 dark:text-white ${className}`}
    {...props}
  >
    {children}
  </h3>
);

/**
 * H4 - Component Header
 * Usage: Smaller section headers, action titles, list headers
 * Size: 18px desktop, 16px mobile | Weight: 500 | Line-height: 1.5
 * Example: "Action Required", "Why This Quantity?", "Scale Plan"
 */
export const H4 = ({ children, className = "", ...props }) => (
  <h4 
    className={`text-base md:text-lg font-medium leading-normal text-slate-700 dark:text-slate-200 ${className}`}
    {...props}
  >
    {children}
  </h4>
);

// ============================================================================
// BODY TEXT
// ============================================================================

/**
 * BodyText - Default paragraph text
 * Usage: Main content, descriptions, explanations
 * Size: 14px all sizes | Weight: 400 | Line-height: 1.625
 * Example: Recommendation descriptions, explanatory paragraphs
 */
export const BodyText = ({ children, className = "", as: Component = "p", ...props }) => (
  <Component 
    className={`text-base font-normal leading-relaxed text-slate-600 dark:text-slate-300 ${className}`}
    {...props}
  >
    {children}
  </Component>
);

/**
 * BodySmall - Secondary text
 * Usage: Sub-descriptions, secondary information, helper text
 * Size: 13px all sizes | Weight: 400 | Line-height: 1.625
 * Example: "After all costs", "Revenue %", chart axis labels
 */
export const BodySmall = ({ children, className = "", as: Component = "p", ...props }) => (
  <Component 
    className={`text-sm font-normal leading-relaxed text-slate-600 dark:text-slate-400 ${className}`}
    {...props}
  >
    {children}
  </Component>
);

// ============================================================================
// UTILITY TEXT
// ============================================================================

/**
 * Caption - Helper text, labels, metadata
 * Usage: KPI labels, timestamps, metadata, uppercase labels
 * Size: 12px all sizes | Weight: 400 | Line-height: 1.5 | Letter-spacing: wide
 * Example: "NET PROFIT", "PROFIT MARGIN", "Last updated 5 mins ago"
 */
export const Caption = ({ children, className = "", uppercase = false, ...props }) => (
  <span 
    className={`text-xs font-normal leading-normal tracking-wide text-slate-500 dark:text-slate-400 ${uppercase ? 'uppercase' : ''} ${className}`}
    {...props}
  >
    {children}
  </span>
);

/**
 * Label - Form labels, button text, tab labels
 * Usage: Input labels, button text, navigation tabs, action labels
 * Size: 13px | Weight: 500 | Line-height: 1.5
 * Example: "Scenario COGS", tab names, button labels, form fields
 */
export const Label = ({ children, className = "", as: Component = "label", ...props }) => (
  <Component 
    className={`text-sm font-medium leading-normal text-slate-700 dark:text-slate-300 ${className}`}
    {...props}
  >
    {children}
  </Component>
);

// ============================================================================
// METRIC DISPLAY (Special case for KPI values)
// ============================================================================

/**
 * MetricDisplay - Large numbers for KPIs
 * Usage: Profit values, percentages, scores, large metrics
 * Size: 36-48px | Weight: 700 | Line-height: 1.2
 * Example: "€10.01", "6.3%", "40/100", health scores
 */
export const MetricDisplay = ({ children, className = "", size = "default", ...props }) => {
  const sizeClasses = {
    small: "text-3xl md:text-4xl",
    default: "text-4xl md:text-5xl",
    large: "text-5xl md:text-6xl"
  };
  
  return (
    <div 
      className={`${sizeClasses[size]} font-bold leading-tight tracking-tight ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// ============================================================================
// UTILITY COMPONENTS
// ============================================================================

/**
 * SectionTitle - Combines icon + heading for section headers
 * Usage: Section headers with icons
 */
export const SectionTitle = ({ icon: Icon, children, className = "", ...props }) => (
  <div className={`flex items-center gap-2 ${className}`} {...props}>
    {Icon && <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
    <H3 className="mb-0">{children}</H3>
  </div>
);

/**
 * CardTitle - Optimized for card headers with optional badge
 * Usage: Card component headers
 */
export const CardTitle = ({ children, badge, className = "", ...props }) => (
  <div className={`flex items-center justify-between ${className}`} {...props}>
    <H3 className="mb-0">{children}</H3>
    {badge && <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">{badge}</span>}
  </div>
);

// ============================================================================
// TYPOGRAPHY SCALE REFERENCE
// ============================================================================

/**
 * MASTER TYPOGRAPHY SCALE
 * 
 * H1 (Page Title):
 *   Desktop: 36px (text-4xl) | Mobile: 30px (text-3xl)
 *   Weight: 700 (font-bold) | Line-height: 1.2 (leading-tight)
 *   Letter-spacing: -0.02em (tracking-tight)
 *   Color: slate-900 / white
 * 
 * H2 (Section Header):
 *   Desktop: 24px (text-2xl) | Mobile: 20px (text-xl)
 *   Weight: 600 (font-semibold) | Line-height: 1.375 (leading-snug)
 *   Letter-spacing: -0.01em (tracking-tight)
 *   Color: slate-800 / white
 * 
 * H3 (Subsection / Card Title):
 *   Desktop: 20px (text-xl) | Mobile: 18px (text-lg)
 *   Weight: 600 (font-semibold) | Line-height: 1.5 (leading-normal)
 *   Letter-spacing: 0 (tracking-normal)
 *   Color: slate-800 / white
 * 
 * H4 (Component Header):
 *   Desktop: 18px (text-lg) | Mobile: 16px (text-base)
 *   Weight: 500 (font-medium) | Line-height: 1.5 (leading-normal)
 *   Letter-spacing: 0 (tracking-normal)
 *   Color: slate-700 / slate-200
 * 
 * BodyText (Default paragraph):
 *   All sizes: 14px (text-base)
 *   Weight: 400 (font-normal) | Line-height: 1.625 (leading-relaxed)
 *   Letter-spacing: 0 (tracking-normal)
 *   Color: slate-600 / slate-300
 * 
 * BodySmall (Secondary text):
 *   All sizes: 13px (text-sm)
 *   Weight: 400 (font-normal) | Line-height: 1.625 (leading-relaxed)
 *   Letter-spacing: 0 (tracking-normal)
 *   Color: slate-600 / slate-400
 * 
 * Caption (Helper text):
 *   All sizes: 12px (text-xs)
 *   Weight: 400 (font-normal) | Line-height: 1.5 (leading-normal)
 *   Letter-spacing: 0.05em (tracking-wide)
 *   Color: slate-500 / slate-400
 * 
 * Label (Form labels, buttons):
 *   All sizes: 13px (text-sm)
 *   Weight: 500 (font-medium) | Line-height: 1.5 (leading-normal)
 *   Letter-spacing: 0 (tracking-normal)
 *   Color: slate-700 / slate-300
 * 
 * MetricDisplay (Large KPI values):
 *   Small: 36px (text-4xl) | Default: 48px (text-5xl) | Large: 60px (text-6xl)
 *   Weight: 700 (font-bold) | Line-height: 1.2 (leading-tight)
 *   Letter-spacing: -0.02em (tracking-tight)
 *   Color: Context-dependent (green-600, red-600, blue-600, etc.)
 * 
 * WCAG AA COMPLIANCE:
 * - All text meets 4.5:1 contrast ratio minimum for normal text
 * - Large text (18px+) meets 3:1 contrast ratio minimum
 * - Tested in both light and dark modes
 * - Special colors (green, red, orange) verified for sufficient contrast
 */
