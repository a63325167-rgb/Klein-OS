# Risk Assessment Feature - Complete Documentation

## Overview
The Risk Assessment feature calculates a comprehensive risk score (0-100, lower = riskier) based on 6 key risk factors. It provides clear warnings and actionable recommendations.

## Risk Scoring System
Base Score: 100 points. Risk factors subtract or add points.

### Risk Levels
- 0-29: CRITICAL RISK (Red) - DO NOT PROCEED
- 30-49: HIGH RISK (Red) - Order 25-50 units max
- 50-64: MEDIUM-HIGH RISK (Orange) - Order 50-100 units
- 65-79: MEDIUM RISK (Yellow) - Order 100-200 units
- 80-89: LOW RISK (Green) - Order 200-500 units
- 90-100: VERY LOW RISK (Emerald) - Order 500+ units

## Six Risk Factors

### 1. Low Margin Risk (-30 points max)
- Under 5%: -30 points (Critical)
- 5-10%: -25 points (High)
- 10-15%: -20 points (Medium)
- 15-25%: 0 points (Acceptable)
- Over 25%: +10 points (Healthy)

### 2. High COGS Risk (-25 points max)
- Over 500 EUR: -25 points (Very High)
- 200-500 EUR: -20 points (High)
- 100-200 EUR: -5 points (Medium)
- Under 100 EUR: +5 points (Low)

### 3. Heavy Product Risk (-20 points max)
- Over 100kg: -20 points (Extremely Heavy)
- 20-100kg: -15 points (Heavy)
- 10-20kg: -10 points (Medium-Heavy)
- Under 10kg: +5 points (Light)

### 4. High Return Category (-20 points max)
- Fashion/Apparel: -20 points (35% return rate)
- Electronics: -20 points (20% return rate)
- Other: +5 points (5-10% return rate)

### 5. Seasonal Product (-10 points max)
- Seasonal keywords detected: -10 points
- Year-round: 0 points

### 6. Slow Break-Even (-30 points max)
- Unprofitable: -30 points (Critical)
- Over 50 units: -20 points (Very Slow)
- 20-50 units: -15 points (Slow)
- 10-20 units: -5 points (Medium)
- Under 10 units: +10 points (Fast)

## Implementation
Files created:
- /client/src/utils/riskAssessment.js
- /client/src/components/analytics/RiskAssessmentCard.jsx

Integrated into Overview tab as 4th card in top row.
