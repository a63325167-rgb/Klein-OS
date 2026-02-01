# Optimal Order Quantity Calculator

## Overview

The Optimal Order Quantity Calculator helps sellers determine the right order size based on cash flow constraints, storage capacity, demand forecasts, and supplier requirements. It provides a data-driven recommendation with detailed reasoning and a scale plan.

## Implementation Details

### Files Created/Modified

1. **`/client/src/utils/orderQuantityCalculator.js`**
   - Core calculation engine for optimal order quantity
   - Evaluates 4 key constraints
   - Generates scale plan and reorder triggers

2. **`/client/src/components/analytics/OrderPlanningCard.jsx`**
   - Visual display of order recommendation
   - Interactive cash input for scenario testing
   - Detailed breakdown of constraints and reasoning

3. **`/client/src/components/analytics/ActionsPanel.jsx`**
   - Integrated as first card in Actions tab
   - Positioned before action recommendations

## Calculation Formula

```javascript
optimalQuantity = min(
  cashAvailable / buyingPrice,        // Cash constraint
  monthlySales * 3,                   // Storage constraint (3-month ideal)
  annualForecast * 0.25               // Demand constraint (25% for first order)
)

// But not less than supplier MOQ
optimalQuantity = max(optimalQuantity, supplierMOQ)
```

## Four Key Constraints

### 1. Cash Flow Constraint
**Formula:** `maxByCash = floor(cashAvailable / buyingPrice)`

**Purpose:** Ensures you don't over-commit capital

**Example:**
- Available cash: €6,150
- Buying price: €123/unit
- Max units: 50 units

**Risk Levels:**
- >80% cash utilization: HIGH RISK
- 60-80% cash utilization: MEDIUM RISK
- <60% cash utilization: LOW RISK

### 2. Storage Capacity Constraint
**Formula:** `idealByStorage = monthlySales * 3`

**Purpose:** Maintains optimal 3-month inventory turnover

**Why 3 months?**
- Balances availability with storage costs
- Reduces risk of dead stock
- Allows for demand fluctuations

**Storage Cost Estimation:**
- Small items (<1kg): €0.30/unit/month
- Medium items (1-5kg): €0.60/unit/month
- Large items (5-10kg): €1.00/unit/month
- Very large items (10-20kg): €1.50/unit/month
- Oversized (>20kg): €2.50/unit/month

### 3. Demand Forecast Constraint
**Formula:** `maxByDemand = annualForecast * 0.25`

**Purpose:** Conservative first order (25% of annual forecast)

**Why 25%?**
- Reduces risk on unproven products
- Allows for demand validation
- Leaves room for scaling if successful

**Example:**
- Annual forecast: 500 units
- First order max: 125 units

### 4. Supplier MOQ Constraint
**Formula:** `minBySupplier = supplierMOQ`

**Purpose:** Meets supplier minimum order requirements

**Common MOQs:**
- Small suppliers: 25-50 units
- Medium suppliers: 100-200 units
- Large manufacturers: 500-1000 units

## Reorder Trigger

**Formula:** `reorderPoint = ceil(monthlySales / 2)`

**Purpose:** Trigger reorder with 2 weeks of supply remaining

**Why 2 weeks?**
- Accounts for supplier lead time
- Prevents stockouts
- Maintains consistent availability

**Example:**
- Monthly sales: 40 units
- Reorder trigger: 20 units remaining

## Scale Plan

The calculator generates a 3-stage scale plan:

### Stage 1: Proven Demand
**Trigger:** After initial order sells
**Action:** Order 1.5x initial quantity
**Benefit:** Proven demand reduces per-unit risk

**Example:**
- Initial order: 50 units
- Next order: 75 units

### Stage 2: Volume Discount
**Trigger:** At 100+ units (or 2x initial order)
**Action:** Negotiate 5-10% volume discount
**Benefit:** Reduce COGS, improve margins

**Example:**
- At 100 units: Negotiate 7.5% discount
- Savings: €9.23/unit → €4,615/year at 500 units

### Stage 3: Bulk Ordering
**Trigger:** After 3 months of consistent sales
**Action:** Order 6-month supply
**Benefit:** Reduce order frequency, better cash flow

**Example:**
- Monthly sales: 40 units
- 6-month order: 240 units

## Risk Assessment

The calculator evaluates cash utilization risk:

### HIGH RISK (>80% cash utilization)
- **Warning:** Using >80% of available cash
- **Impact:** No buffer for unexpected costs
- **Recommendation:** Reduce order size or secure additional capital

### MEDIUM RISK (60-80% cash utilization)
- **Warning:** Moderate cash utilization
- **Impact:** Limited buffer for reorders
- **Recommendation:** Ensure reserve for unexpected costs

### LOW RISK (<60% cash utilization)
- **Status:** Conservative cash utilization
- **Impact:** Good buffer for unexpected costs
- **Recommendation:** Safe to proceed

## Interactive Features

### Custom Cash Input
Users can input their actual available cash to see how it affects the recommendation:

1. Check "Customize available cash"
2. Enter amount (e.g., €10,000)
3. Recommendation updates in real-time

**Use Cases:**
- Testing different funding scenarios
- Planning for seasonal cash flow
- Evaluating investment requirements

## Display Components

### Main Recommendation
- **Large number:** Optimal quantity (e.g., "50 units")
- **Total investment:** Total cost (e.g., "€6,150")

### Why This Quantity?
Three constraint cards showing:
1. **Cash:** Available vs. utilized
2. **Demand:** Annual forecast vs. weeks of supply
3. **Storage:** Monthly cost and turnover

### Risk Assessment
Color-coded box showing:
- Risk level (LOW/MEDIUM/HIGH)
- Cash utilization percentage
- Risk message and recommendation

### Reorder Trigger
When to place next order:
- Units remaining threshold
- Weeks of supply remaining

### Scale Plan
3-stage roadmap showing:
1. Milestone (when to act)
2. Action (what to do)
3. Benefit (why it matters)

## Example Scenarios

### Scenario 1: Cash-Constrained Seller
**Inputs:**
- Available cash: €3,000
- Buying price: €123/unit
- Annual forecast: 500 units
- Monthly sales: 42 units

**Calculation:**
- Cash constraint: 24 units
- Storage constraint: 126 units (3 months)
- Demand constraint: 125 units (25%)
- **Optimal:** 24 units (limited by cash)

**Output:**
- First order: 25 units (rounded to MOQ)
- Total cost: €3,075
- Risk: HIGH (>80% cash utilization)
- Recommendation: Secure additional €3k for reorders

### Scenario 2: Well-Funded Seller
**Inputs:**
- Available cash: €20,000
- Buying price: €123/unit
- Annual forecast: 500 units
- Monthly sales: 42 units

**Calculation:**
- Cash constraint: 162 units
- Storage constraint: 126 units (3 months)
- Demand constraint: 125 units (25%)
- **Optimal:** 125 units (limited by demand)

**Output:**
- First order: 125 units
- Total cost: €15,375
- Risk: LOW (77% cash utilization)
- Recommendation: Conservative first order, scale after validation

### Scenario 3: High-Demand Product
**Inputs:**
- Available cash: €15,000
- Buying price: €50/unit
- Annual forecast: 2,000 units
- Monthly sales: 167 units

**Calculation:**
- Cash constraint: 300 units
- Storage constraint: 501 units (3 months)
- Demand constraint: 500 units (25%)
- **Optimal:** 300 units (limited by cash)

**Output:**
- First order: 300 units
- Total cost: €15,000
- Risk: HIGH (100% cash utilization)
- Recommendation: Order 200 units to maintain buffer

## Benefits

1. **Data-Driven Decisions**
   - Removes guesswork from order sizing
   - Balances multiple constraints
   - Provides clear reasoning

2. **Risk Management**
   - Prevents over-ordering
   - Ensures cash flow buffer
   - Optimizes storage costs

3. **Scale Planning**
   - Clear roadmap for growth
   - Volume discount opportunities
   - Demand validation checkpoints

4. **Scenario Testing**
   - Test different cash levels
   - Plan for various outcomes
   - Make informed funding decisions

## Future Enhancements

1. **Lead Time Integration**
   - Factor in supplier lead times
   - Adjust reorder triggers accordingly
   - Account for shipping delays

2. **Seasonality Adjustments**
   - Increase orders before peak season
   - Reduce orders in slow periods
   - Dynamic reorder triggers

3. **Multi-SKU Planning**
   - Optimize across product portfolio
   - Shared cash pool allocation
   - Cross-SKU storage optimization

4. **Supplier Comparison**
   - Compare MOQs from different suppliers
   - Factor in volume discount tiers
   - Optimize for total cost

5. **Historical Data Integration**
   - Use actual sales data for forecasting
   - Adjust recommendations based on performance
   - Learn from past orders
