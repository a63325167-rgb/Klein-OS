# Actions Tab - Test Cases & Validation

## 🎯 Overview
The Actions tab is a trigger-based recommendation engine that evaluates 5 business rules and displays up to 3 actionable recommendations sorted by annual savings impact.

---

## 📋 Test Case 1: Margin Risk (Trigger: margin < 18%)

### Input Data
```javascript
{
  selling_price: 50,
  buying_price: 45,
  weight_kg: 0.5,
  height_cm: 5,
  annual_volume: 1000,
  category: "Electronics"
}
```

### Expected Metrics
- **Margin**: ~8-10% (Low)
- **Trigger**: ✅ YES (margin < 18%)

### Expected Output

**Card Title**: "Margin Risk: Below Safe Threshold"  
**Priority Badge**: 🔴 HIGH  
**Summary**: "At current costs, a 5% increase (supplier, shipping) drops you to break-even. Current margin: 8.5% (target: 18%+)"  
**Impact**: "Annual exposure: €X,XXX at risk"

**Actions** (3):
1. **Renegotiate Supplier**
   - Target 8-10% COGS reduction
   - €X,XXX/year savings
   - Template: Email script for volume discount

2. **Lock Shipping Rate**
   - 12-month agreement protection
   - €XXX/year protection
   - Template: Carrier negotiation checklist

3. **Increase Price by 3-5%**
   - Test with 10% inventory
   - €X,XXX/year potential gain
   - Template: A/B test setup guide

### Validation Checklist
- [ ] Card displays with red accent (#FF4444)
- [ ] Priority badge shows "🔴 HIGH"
- [ ] All 3 actions present
- [ ] Templates expand on click
- [ ] "Mark As Started" checkbox functional
- [ ] Annual savings calculated correctly

---

## 📋 Test Case 2: Small Package Redesign (Near-Miss)

### Input Data
```javascript
{
  selling_price: 35,
  buying_price: 15,
  weight_kg: 0.5,
  height_cm: 9.5, // Just above 8cm threshold
  annual_volume: 500,
  category: "Home"
}
```

### Expected Metrics
- **Height**: 9.5cm (exceeds 8cm by 1.5cm = 18.75% over)
- **Weight**: 0.5kg (within limit)
- **Trigger**: ✅ YES (single dimension fails by < 30%)

### Expected Output

**Card Title**: "Redesign Opportunity: Near-Eligible for Small Package"  
**Priority Badge**: 🟡 MEDIUM  
**Summary**: "Reduce height by 1.5cm (9.5cm → 8cm) → Save €1.71/unit"  
**Impact**: "Annual savings at 500 units/year: €855"

**Actions** (3):
1. **Contact Packaging Vendor**
   - Request height reduction
   - Payback period shown
   - Template: Vendor email script

2. **Test Redesign**
   - Order 100 units
   - Validation before full production
   - Template: Testing checklist

3. **Measure & Verify**
   - Post-packaging measurement
   - Critical for acceptance
   - Template: Measurement protocol

### Validation Checklist
- [ ] Card displays with yellow/amber accent
- [ ] Correctly identifies "height" as failed dimension
- [ ] Shows exact excess (1.5cm)
- [ ] Calculates €1.71/unit × 500 = €855/year
- [ ] All 3 actions specific to packaging redesign
- [ ] Templates relevant to physical product optimization

---

## 📋 Test Case 3: High Fee Structure (Trigger: fees > 20% of costs)

### Input Data
```javascript
{
  selling_price: 100,
  buying_price: 30,
  weight_kg: 1.5,
  height_cm: 12,
  annual_volume: 800,
  category: "Electronics" // 15% referral fee
}
```

### Expected Metrics
- **Amazon Fee**: €15 (15% of €100)
- **Total Cost**: ~€50-60
- **Fee %**: ~25-30% of costs
- **Trigger**: ✅ YES (feePercent > 20%)

### Expected Output

**Card Title**: "High Amazon Fees: Explore Alternatives"  
**Priority Badge**: 🟡 MEDIUM  
**Summary**: "Amazon fees €15.00/unit (25.0% of costs). You have 3 options to reduce"  
**Impact**: "Potential annual savings: €X,XXX-€Y,YYY/year"

**Actions** (3):
1. **Review Category**
   - Check alternative categories
   - 15% → 8-10% possible
   - €X,XXX/year savings

2. **Test FBM**
   - DHL/DPD quote for 1.5kg
   - Labor impact shown
   - FBM setup guide

3. **Volume Negotiation**
   - Request Account Manager
   - 2-3% fee reduction target
   - Negotiation script provided

### Validation Checklist
- [ ] Detects high fee % correctly
- [ ] Shows 3 distinct cost reduction options
- [ ] FBM labor calculation accurate
- [ ] Volume discount threshold shown
- [ ] Category optimization benefit quantified

---

## 📋 Test Case 4: Low ROI with Good Margin (Volume Problem)

### Input Data
```javascript
{
  selling_price: 80,
  buying_price: 40,
  weight_kg: 0.8,
  height_cm: 7,
  annual_volume: 200, // Low volume
  category: "Sports"
}
```

### Expected Metrics
- **Margin**: ~25% (Good)
- **ROI**: ~20-25% (Below 30% target)
- **Trigger**: ✅ YES (roi < 30 AND margin > 18%)

### Expected Output

**Card Title**: "Low ROI: Volume Problem, Not Cost"  
**Priority Badge**: 🟡 MEDIUM  
**Summary**: "ROI 22.5% is below 25-35% industry benchmark. Your costs are fine (25.0% margin) - you need more volume"  
**Impact**: "At current volume 200: €X,XXX/year. At 2x volume: €Y,YYY/year (+€Z,ZZZ)"

**Actions** (3):
1. **Increase Inventory**
   - Order 2x (400 units)
   - Capital required shown
   - Payback analysis

2. **Optimize Price**
   - Test -5% price reduction
   - Volume increase projection
   - Elasticity calculator

3. **Run Promotion**
   - 10% discount, 2-week sprint
   - Clear fast stock
   - Promotion templates

### Validation Checklist
- [ ] Distinguishes margin vs ROI problem
- [ ] Correctly diagnoses volume issue
- [ ] Shows 2x scaling projection
- [ ] Capital requirements calculated
- [ ] Price elasticity test parameters
- [ ] Promotion strategy detailed

---

## 📋 Test Case 5: Exceptional ROI - Scale Signal

### Input Data (From User's Example)
```javascript
{
  selling_price: 431,
  buying_price: 200,
  weight_kg: 233.97,
  height_cm: 50,
  annual_volume: 500,
  category: "Electronics"
}
```

### Expected Metrics
- **Margin**: 40.7% (Exceptional)
- **ROI**: 68.7% (Exceptional)
- **Trigger**: ✅ YES (roi > 60 AND margin > 35)

### Expected Output

**Card Title**: "Scale Now: Exceptional Profitability"  
**Priority Badge**: 🟢 HIGH OPPORTUNITY  
**Summary**: "Your product is a cash-generating machine (68.7% ROI, 40.7% margin). Increase inventory to capture demand."  
**Impact**: "Scale to 2x volume → €175,420/year (+€87,710). Scale to 5x → €438,550/year (+€350,840)"

**Actions** (3):
1. **Increase Order Quantity**
   - Place 2x order (1,000 units)
   - €200,000 capital required
   - Payback: 1.5 months
   - Supplier email template

2. **Negotiate Volume Discount**
   - At 1,000 units/year
   - Target 8% COGS reduction
   - €X,XXX/year savings
   - Negotiation leverage script

3. **Expand to 2nd Marketplace**
   - eBay / EU marketplaces
   - +25% revenue estimate
   - €X,XXX/year additional profit
   - Multi-marketplace setup guide

### Validation Checklist
- [ ] Card displays with green accent (#00D084)
- [ ] Priority badge shows "🟢 HIGH OPPORTUNITY"
- [ ] 2x and 5x scaling projections shown
- [ ] Payback period accurate (1.5 months)
- [ ] Volume discount calculations correct
- [ ] Multi-marketplace benefit quantified

---

## 📋 Test Case 6: All Metrics Healthy (No Triggers)

### Input Data
```javascript
{
  selling_price: 75,
  buying_price: 35,
  weight_kg: 0.7,
  height_cm: 6,
  annual_volume: 600,
  category: "Home"
}
```

### Expected Metrics
- **Margin**: ~30% (Healthy)
- **ROI**: ~50% (Healthy)
- **Small Package**: Eligible
- **Fees**: <20% of costs
- **Trigger**: ❌ NONE

### Expected Output

**Banner Display**:
```
┌────────────────────────────────────────────────────┐
│        ✓ All Key Metrics Healthy                   │
│                                                     │
│   No immediate actions required. Your product      │
│   performance is within optimal ranges.            │
│   Continue monitoring and maintain current         │
│   strategy.                                         │
└────────────────────────────────────────────────────┘
```

### Validation Checklist
- [ ] No action cards displayed
- [ ] Green success banner shown
- [ ] Checkmark icon displayed
- [ ] Positive message encouraging
- [ ] Professional B2B tone maintained

---

## 🎨 UI/UX Validation

### Card Layout
- [ ] Icon in colored background box (left)
- [ ] Title + Priority badge (top)
- [ ] Summary paragraph (below title)
- [ ] Impact box with colored background
- [ ] "3 Action Steps" toggle button
- [ ] Expandable action steps section
- [ ] "Mark As Started" checkbox (bottom)

### Colors (B2B Professional)
- [ ] 🔴 HIGH: Red (#FF4444) - Margin Risk
- [ ] 🟡 MEDIUM: Yellow (#FFB800) - Redesign, Fees, Low ROI
- [ ] 🟢 OPPORTUNITY: Green (#00D084) - Scale Signal

### Dark Mode
- [ ] All cards readable in dark mode
- [ ] Color accents maintain visibility
- [ ] Text contrast WCAG AA compliant
- [ ] Toggle animations smooth

### Mobile Responsive
- [ ] Cards stack vertically on mobile
- [ ] Touch targets ≥44px
- [ ] Text readable at small sizes
- [ ] No horizontal scroll

### Performance
- [ ] Rendering <200ms for 3 cards
- [ ] Animations smooth (60fps)
- [ ] No layout shift on expand/collapse
- [ ] State persists on re-render

---

## 🔧 Functional Testing

### Trigger Logic
```javascript
// Test each trigger independently
const triggers = {
  marginRisk: margin < 18,
  smallPackageNearMiss: (heightNearMiss || weightNearMiss || priceNearMiss) && !isEligible,
  highFees: (feeAmount / totalCost) * 100 > 20,
  lowROIVolume: roi < 30 && margin > 18,
  exceptionalScale: roi > 60 && margin > 35
};
```

### Sorting Logic
- [ ] Actions sorted by annualSavings (descending)
- [ ] Top 3 displayed (if >3 triggered)
- [ ] Correct order: Highest savings first

### State Management
- [ ] "Mark As Started" toggles correctly
- [ ] State persists during session
- [ ] Multiple actions can be marked
- [ ] Visual feedback immediate

### Templates Expansion
- [ ] Templates show on "Learn More" click
- [ ] Collapse works correctly
- [ ] Scroll to expanded section
- [ ] Icons rotate smoothly

---

## 📊 Calculation Validation

### Annual Savings Formulas

**Margin Risk (COGS Reduction)**:
```javascript
savingsPerUnit = cogs * 0.10
annualSavings = savingsPerUnit * annualVolume
```

**Small Package Redesign**:
```javascript
savingsPerUnit = 1.71 // €5.50 - €3.79
annualSavings = 1.71 * annualVolume
```

**High Fees (FBM)**:
```javascript
fbmSavingsPerUnit = feeAmount * 0.40
annualSavings = fbmSavingsPerUnit * annualVolume
```

**Low ROI (2x Scaling)**:
```javascript
current = netProfit * annualVolume
projected2x = netProfit * annualVolume * 2
additionalProfit = projected2x - current
```

**Exceptional ROI (Volume Discount)**:
```javascript
cogsReduction = cogs * 0.08
savingsPerUnit = cogsReduction
annualSavings = savingsPerUnit * annualVolume * 2
```

---

## ✅ Final Acceptance Criteria

### Core Functionality
- [ ] All 5 trigger rules evaluate correctly
- [ ] Max 3 actions displayed
- [ ] Sorted by annual savings (descending)
- [ ] "No triggers" state handled gracefully

### Data Quality
- [ ] All calculations accurate (±€10)
- [ ] References exact user input values
- [ ] Annual impact always shown
- [ ] Templates specific to action type

### User Experience
- [ ] Professional B2B design
- [ ] Clear call-to-action
- [ ] Actionable steps (not theoretical)
- [ ] Templates provide real value

### Technical Excellence
- [ ] No linting errors
- [ ] TypeScript-safe parsing
- [ ] Dark mode compatible
- [ ] Mobile responsive
- [ ] Performance <200ms render

---

## 🚀 Testing Commands

### Manual Testing
1. Start dev server: `npm start`
2. Navigate to Calculator
3. Enter test case data
4. Click "Calculate"
5. Navigate to "Actions" tab
6. Verify expected output

### Automated Testing (Future)
```javascript
// Integration test example
describe('ActionsPanel', () => {
  it('triggers margin risk for margin < 18%', () => {
    const result = calculateProductAnalysis(testCase1);
    const actions = evaluateTriggers(result);
    expect(actions).toContainEqual(
      expect.objectContaining({ id: 'margin-risk' })
    );
  });
});
```

---

## 📝 Known Limitations

1. **Templates**: Placeholders for Phase 2 (no actual file downloads)
2. **Persistence**: "Mark As Started" state not saved to backend yet
3. **Localization**: EUR only (no multi-currency support)
4. **Historical Data**: No tracking of past actions/outcomes
5. **Multi-product**: Each calculation independent (no portfolio view)

---

## 🎯 Success Metrics

### Before Actions Tab
- Users ask: "What should I do next?"
- Generic recommendations (not quantified)
- No clear prioritization

### After Actions Tab
- Clear priority ranking (HIGH/MEDIUM/OPPORTUNITY)
- Every action quantified (€X,XXX/year savings)
- Specific templates and scripts
- Track progress with checkboxes

**Impact**: Reduce time-to-action from days to minutes.

---

**Status**: ✅ Implementation Complete  
**Test Coverage**: 6 test cases (all triggers + no-trigger state)  
**Ready For**: Manual UI testing + User feedback  









