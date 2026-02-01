# Scenario Calculator - "What If...?" Feature

## Overview

The Scenario Calculator provides interactive sliders that allow sellers to model different business scenarios and see real-time impact on profitability. This helps sellers make data-driven decisions by exploring "what if" scenarios before implementing changes.

## Implementation Details

### Files Created/Modified

1. **`/client/src/utils/scenarioCalculations.js`**
   - Core calculation functions for 4 scenario types
   - Handles COGS discounts, price changes, fee adjustments, and return rates
   - Provides formatted output for display

2. **`/client/src/components/analytics/ScenarioCalculator.jsx`**
   - Main interactive component with expandable interface
   - 4 individual scenario sliders with real-time calculations
   - Visual feedback with color-coded results

3. **`/client/src/components/analytics/EnhancedResultsDashboard.js`**
   - Integrated into Overview tab after secondary metrics
   - Expandable/collapsible for clean UI

## Four Scenario Types

### 1. Negotiate Lower COGS
**Slider Range:** -30% to 0%

**Shows:**
- Current COGS vs New COGS
- Current Margin vs New Margin
- Margin improvement percentage
- Annual savings at current volume
- Actionable recommendation

**Example Output:**
```
Current COGS:  €123.00
New COGS:      €110.70  (-€12.30)

Current Margin: 40.9%
New Margin:     43.4%  (+2.5%)

Annual Savings (at 500 units):
€6,150/year 💰

💡 Action: Ask supplier for volume discount at 500+ units
```

### 2. Adjust Selling Price
**Slider Range:** -€50 to +€100

**Shows:**
- Current Price vs New Price
- Current Margin vs New Margin
- Estimated demand impact (elasticity model)
- Annual profit change
- Optimal price zone assessment

**Example Output:**
```
Current Price: €543.00
New Price:     €563.00  (+€20.00)

Current Margin: 40.9%
New Margin:     42.1%  (+1.2%)

Demand Impact: 1.8% decrease
Annual Profit Change: +€8,450

💡 Action: Good balance of margin and demand
```

**Demand Impact Model:**
- Assumes 1% price increase = 0.5% demand decrease
- Calculates new volume based on elasticity
- Shows annual revenue and profit impact

### 3. Amazon Fee Change
**Slider Range:** 5% to 25%

**Shows:**
- Current Fee vs New Fee (amount and percentage)
- Current Margin vs New Margin
- Fee savings per unit
- Annual impact at current volume
- Alternative fulfillment recommendations

**Example Output:**
```
Current Fee: €64.95 (16.0%)
New Fee:     €54.30 (10.0%)  (-€10.65)

Current Margin: 40.9%
New Margin:     43.8%  (+2.9%)

Annual Impact (500 units): €5,325 💰

💡 Action: Consider FBM or alternative platforms for lower fees
```

### 4. Return Rate Impact
**Slider Range:** 0% to 50%

**Shows:**
- Return rate percentage
- Cost per return (shipping + restocking)
- Expected returns per year
- Real margin after returns
- Annual return cost
- Actionable recommendations

**Example Output:**
```
Return Rate: 15%
Cost Per Return: €17.80
Expected Returns: 75 units/year

Current Margin: 40.9%
Real Margin (after returns): 35.4%  (-5.5%)

Annual Return Cost: €1,335

💡 Action: Add sizing charts, better product photos, and detailed descriptions to reduce returns
```

## User Interface

### Expandable Section
- Collapses by default to keep Overview tab clean
- Click to expand and show all 4 sliders
- "Reset All" button to return sliders to default values

### Individual Slider Cards
- Color-coded by scenario type:
  - **Green:** COGS negotiation (positive savings)
  - **Blue:** Price adjustment (neutral/strategic)
  - **Amber:** Fee changes (external factors)
  - **Red:** Return rates (risk factors)

### Real-Time Calculations
- All calculations update instantly as sliders move
- No need to click "Calculate" button
- Smooth animations for value changes

### Actionable Insights
- Each scenario shows specific action recommendations
- Context-aware suggestions based on slider values
- Clear € impact for decision-making

## Calculation Logic

### COGS Discount Scenario
```javascript
newCOGS = currentCOGS × (1 - discount%)
cogsSavings = currentCOGS - newCOGS
newTotalCost = totalCost - cogsSavings
newProfit = sellingPrice - newTotalCost
newMargin = (newProfit / sellingPrice) × 100
annualSavings = cogsSavings × annualVolume
```

### Price Change Scenario
```javascript
newPrice = currentPrice + priceChange
newProfit = newPrice - totalCost
newMargin = (newProfit / newPrice) × 100

// Demand elasticity model
priceChangePercent = (priceChange / currentPrice) × 100
demandImpact = -priceChangePercent × 0.5
newVolume = annualVolume × (1 + demandImpact / 100)

annualProfitChange = (newProfit × newVolume) - (currentProfit × annualVolume)
```

### Fee Change Scenario
```javascript
newFeeAmount = (sellingPrice × newFeePercent) / 100
feeSavings = currentFeeAmount - newFeeAmount
newTotalCost = totalCost - feeSavings
newProfit = sellingPrice - newTotalCost
newMargin = (newProfit / sellingPrice) × 100
annualSavings = feeSavings × annualVolume
```

### Return Rate Scenario
```javascript
costPerReturn = shippingCost + (COGS × 0.1)
expectedReturns = annualVolume × (returnRate / 100)
totalReturnCost = expectedReturns × costPerReturn
returnCostPerUnit = totalReturnCost / annualVolume
adjustedProfit = currentProfit - returnCostPerUnit
adjustedMargin = (adjustedProfit / sellingPrice) × 100
```

## Benefits

1. **Risk-Free Exploration**
   - Test scenarios without real-world consequences
   - Understand impact before negotiating with suppliers
   - Model different pricing strategies

2. **Data-Driven Decisions**
   - See exact € impact of each change
   - Compare multiple scenarios side-by-side
   - Understand trade-offs (e.g., price vs. demand)

3. **Actionable Insights**
   - Each scenario provides specific next steps
   - Context-aware recommendations
   - Clear ROI calculations

4. **Quick Iteration**
   - Instant calculations as sliders move
   - No need to re-run full calculator
   - Easy to compare multiple scenarios

## Use Cases

### Supplier Negotiations
- Model different COGS discount scenarios
- Calculate break-even discount needed
- Show supplier the volume commitment

### Pricing Strategy
- Find optimal price point
- Balance margin vs. demand
- Test seasonal pricing strategies

### Platform Comparison
- Compare FBA vs. FBM fees
- Evaluate alternative marketplaces
- Calculate fee impact on profitability

### Risk Management
- Model high return rate scenarios
- Calculate buffer needed for returns
- Identify products with return risk

## Future Enhancements

1. **Multi-Variable Scenarios**
   - Combine multiple changes (e.g., lower COGS + higher price)
   - Show cumulative impact
   - Optimize for maximum profit

2. **Historical Comparison**
   - Save scenario results
   - Compare to actual performance
   - Track accuracy of predictions

3. **Advanced Elasticity Models**
   - Category-specific demand curves
   - Seasonal elasticity adjustments
   - Competitor pricing impact

4. **Scenario Templates**
   - Pre-configured scenarios (e.g., "Black Friday pricing")
   - Industry best practices
   - Quick-apply common scenarios

5. **Export Scenarios**
   - Generate PDF reports
   - Share with team/suppliers
   - Track scenario history

## Testing Checklist

- [ ] COGS slider: -30% to 0% range works correctly
- [ ] Price slider: -€50 to +€100 range works correctly
- [ ] Fee slider: 5% to 25% range works correctly
- [ ] Return slider: 0% to 50% range works correctly
- [ ] All calculations update in real-time
- [ ] "Reset All" button returns sliders to defaults
- [ ] Expand/collapse animation works smoothly
- [ ] Action recommendations appear when relevant
- [ ] Color coding is correct for each scenario
- [ ] All currency values formatted correctly
- [ ] Percentage values formatted correctly
- [ ] Negative values show correctly (e.g., -€12.30)
- [ ] Annual savings calculations are accurate
- [ ] Demand impact model produces reasonable results
