import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Package,
  DollarSign,
  TrendingUp,
  Rocket,
  CheckCircle2,
  ChevronDown,
  Lightbulb,
  ExternalLink,
  Warehouse,
  BarChart3,
  Clock8,
  Compass
} from 'lucide-react';
import OrderPlanningCard from './OrderPlanningCard';

/**
 * ActionsPanel - Trigger-based Recommendation Engine
 * 
 * Evaluates 5 trigger rules and displays actionable recommendations
 * sorted by annual savings impact. Shows max 3 actions.
 */

const ActionsPanel = ({ result }) => {
  const [startedActions, setStartedActions] = useState([]);
  
  // Feature flag: Hide future API features until integration is complete
  const SHOW_FUTURE_API_FEATURES = false;
  
  // Safety check: Ensure result exists
  if (!result) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl p-8 text-center">
        <p className="text-red-600 dark:text-red-400">Error: No calculation result available</p>
      </div>
    );
  }
  
  // Extract calculation data with safety defaults
  const totals = result.totals || {};
  const input = result.input || {};
  const amazonFee = result.amazonFee || { amount: 0 };
  const shipping = result.shipping || { cost: 0 };
  const smallPackageCheck = result.smallPackageCheck || { isEligible: false, failures: [] };
  
  const margin = totals.profit_margin || 0;
  const roi = totals.roi_percent || 0;
  const netProfit = totals.net_profit || 0;
  const totalCost = totals.total_cost || 0;
  const price = parseFloat(input.selling_price) || 0;
  const cogs = parseFloat(input.buying_price) || 0;
  const volume = parseInt(input.annual_volume) || 500;
  const weight_kg = parseFloat(input.weight_kg) || 0;
  const height_cm = parseFloat(input.height_cm) || 0;
  const feeAmount = amazonFee.amount || 0;
  const feePercent = totalCost > 0 ? (feeAmount / totalCost) * 100 : 0;
  const dimensionalWeight = shipping.dimensionalWeight || ((input.length_cm || 0) * (input.width_cm || 0) * (input.height_cm || 0)) / 5000 || 0;
  const productVolumeLiters = ((input.length_cm || 0) * (input.width_cm || 0) * (input.height_cm || 0)) / 1000;
  const netProfitPerUnit = netProfit || 0;
  const defaultDeadline = (days) => {
    const targetDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    return targetDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  };
  const toEuro = (value) => `€${Number(value || 0).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  
  // Evaluate all trigger rules
  const triggeredActions = [];
  
  // ========== RULE 1: MARGIN RISK ==========
  if (margin < 18) {
    const marginBuffer = netProfit;
    const annualExposure = (marginBuffer * volume).toFixed(0);
    const targetCogsReduction = (cogs * 0.10).toFixed(2);
    const cogsReductionSavings = (parseFloat(targetCogsReduction) * volume).toFixed(0);
    const shippingLockSavings = (shipping.cost * 0.10 * volume).toFixed(0);
    const targetPrice = (price * 1.04).toFixed(2);
    const priceIncreaseSavings = ((parseFloat(targetPrice) - price) * volume * 0.9).toFixed(0); // 90% volume retention
    
    const totalPotentialSavings = Math.max(
      parseFloat(cogsReductionSavings),
      parseFloat(shippingLockSavings),
      parseFloat(priceIncreaseSavings)
    );
    
    triggeredActions.push({
      id: 'margin-risk',
      title: 'Margin Risk: Below Safe Threshold',
      priority: 'HIGH',
      priorityColor: 'red',
      icon: AlertTriangle,
      iconBg: 'bg-red-100 dark:bg-red-900/30',
      iconColor: 'text-red-600 dark:text-red-400',
      badge: '🔴 HIGH',
      badgeBg: 'bg-red-100 dark:bg-red-900/40',
      badgeText: 'text-red-700 dark:text-red-300',
      summary: `At current costs, a 5% increase (supplier, shipping) drops you to break-even. Current margin: ${margin.toFixed(1)}% (target: 18%+)`,
      impact: `Annual exposure: €${parseInt(annualExposure).toLocaleString('de-DE')} at risk`,
      annualSavings: totalPotentialSavings,
      actions: [
        {
          id: 'negotiate-supplier',
          label: 'Renegotiate Supplier',
          detail: `Target 8-10% COGS reduction (€${cogs.toFixed(2)} → €${(cogs * 0.9).toFixed(2)}) = €${parseInt(cogsReductionSavings).toLocaleString('de-DE')}/year savings`,
          template: 'Email template: "We\'re increasing order volume to {volume} units/year. Can you offer volume discount to €{target_cogs}/unit?"'
        },
        {
          id: 'lock-shipping',
          label: 'Lock Shipping Rate',
          detail: `12-month agreement with DHL/DPD protects against 10% inflation = €${parseInt(shippingLockSavings).toLocaleString('de-DE')}/year protection`,
          template: 'Checklist: Get quotes from 3 carriers, negotiate volume discount, request 12-month rate lock clause'
        },
        {
          id: 'increase-price',
          label: 'Increase Price by 3-5%',
          detail: `Test €${targetPrice} (+4%) with 10% of inventory. If conversion drops <10%, net gain €${parseInt(priceIncreaseSavings).toLocaleString('de-DE')}/year`,
          template: 'A/B test setup: 90% at €{current_price}, 10% at €{new_price} for 2 weeks. Monitor conversion rate.'
        }
      ]
    });
  }

  // ========== RULE 4: STORAGE COST WARNING ==========
  if (dimensionalWeight > 10) {
    const monthlyStorageCost = dimensionalWeight * 15; // €15 per kg of dim weight
    const storageHorizonMonths = 2;
    const storageProfitErosion = monthlyStorageCost * storageHorizonMonths;
    triggeredActions.push({
      id: 'storage-warning',
      title: "You're Losing Money on Storage",
      priority: 'HIGH',
      priorityColor: 'red',
      icon: Warehouse,
      iconBg: 'bg-rose-100 dark:bg-rose-900/30',
      iconColor: 'text-rose-600 dark:text-rose-400',
      badge: '🔴 STORAGE ALERT',
      badgeBg: 'bg-rose-100 dark:bg-rose-900/40',
      badgeText: 'text-rose-700 dark:text-rose-300',
      summary: `Bulky item (${dimensionalWeight.toFixed(1)}kg dimensional weight) costs ${toEuro(monthlyStorageCost)} per month in Amazon storage fees.`,
      impact: `Lose ${toEuro(storageProfitErosion)} every ${storageHorizonMonths} months if inventory lingers.`,
      annualSavings: storageProfitErosion * (12 / storageHorizonMonths),
      actions: [
        {
          id: 'sell-fast',
          label: 'Move Inventory in <60 Days',
          detail: `Run 10% discount + coupon stack to accelerate sell-through. Target sell-out date: ${defaultDeadline(60)}.`,
          template: 'Promo checklist: 10% coupon, 5% PPC boost, send email to repeat buyers.'
        },
        {
          id: 'optimize-packaging',
          label: 'Reduce Dimensional Weight',
          detail: `Cut packaging volume by 15% to drop storage cost below ${toEuro((dimensionalWeight * 0.85) * 15)}.`,
          template: 'Ask supplier for flat-pack or vacuum-pack option; verify FBA acceptance.'
        }
      ],
      deadline: `Act before ${defaultDeadline(30)} to protect Q${Math.ceil((new Date().getMonth() + 1) / 3)} profit.`
    });
  }

  // ========== RULE 5: CATEGORY RETURN RATE WARNING ==========
  const categoryReturnRates = {
    fashion: [30, 40],
    apparel: [30, 40],
    clothing: [30, 40],
    electronics: [15, 25],
    tech: [15, 25],
    health: [5, 10],
    beauty: [5, 10],
    books: [2, 5]
  };
  const categoryKey = (input.category || '').toLowerCase();
  const matchedCategory = Object.keys(categoryReturnRates).find((key) => categoryKey.includes(key));
  if (matchedCategory && price > 0) {
    const [minRate, maxRate] = categoryReturnRates[matchedCategory];
    const avgReturnRate = (minRate + maxRate) / 2;
    const costPerReturn = (shipping.cost || 0) + (cogs * 0.1);
    const adjustedMarginPercent = ((netProfitPerUnit - ((avgReturnRate / 100) * costPerReturn)) / price) * 100;
    triggeredActions.push({
      id: 'return-rate-warning',
      title: "You're Losing Margin to Returns",
      priority: 'MEDIUM',
      priorityColor: 'yellow',
      icon: BarChart3,
      iconBg: 'bg-amber-100 dark:bg-amber-900/30',
      iconColor: 'text-amber-600 dark:text-amber-400',
      badge: '🟡 RETURN ALERT',
      badgeBg: 'bg-amber-100 dark:bg-amber-900/40',
      badgeText: 'text-amber-700 dark:text-amber-300',
      summary: `${input.category} averages ${avgReturnRate.toFixed(0)}% returns. Each return costs ~${toEuro(costPerReturn)} (shipping + restocking).`,
      impact: `Real profit margin drops from ${margin.toFixed(1)}% → ${adjustedMarginPercent.toFixed(1)}% after returns.`,
      annualSavings: (avgReturnRate / 100) * costPerReturn * volume,
      actions: [
        {
          id: 'quality-checklist',
          label: 'Cut Returns by 20%',
          detail: 'Add sizing chart + unboxing video to PDP. Expect 6-8% return reduction.',
          template: 'Checklist: Update PDP media, add A+ content module, include “fit true-to-size” badge.'
        },
        {
          id: 'returns-automation',
          label: 'Automate Inspection Fee',
          detail: `Charge €${(costPerReturn * 0.5).toFixed(2)} restocking fee for “buyer remorse” reasons to offset loss.`,
          template: 'Policy update: Enable “restocking fee” in Amazon Seller Central → Settings → Return settings.'
        }
      ],
      deadline: `Implement before ${defaultDeadline(14)} to stabilize Q${Math.ceil((new Date().getMonth() + 1) / 3)} margin.`
    });
  }

  // ========== RULE 6: SEASONAL DEMAND WARNING ==========
  const seasonalCatalog = [
    { keywords: ['christmas', 'xmas', 'holiday', 'advent'], peak: 'Oct-Dec', orderBy: '15 Sep', offSeason: 'Jan-Sep' },
    { keywords: ['summer', 'pool', 'beach', 'inflatable'], peak: 'May-Aug', orderBy: '15 Apr', offSeason: 'Sep-Apr' },
    { keywords: ['halloween'], peak: 'Aug-Oct', orderBy: '15 Jul', offSeason: 'Nov-Jul' }
  ];
  const productName = (input.product_name || input.productName || '').toLowerCase();
  const seasonalMatch = seasonalCatalog.find((entry) => entry.keywords.some((kw) => productName.includes(kw)));
  if (seasonalMatch) {
    const offSeasonMonthlyStorage = dimensionalWeight * 15;
    triggeredActions.push({
      id: 'seasonal-alert',
      title: 'Seasonal Demand Window Approaching',
      priority: 'MEDIUM',
      priorityColor: 'yellow',
      icon: Clock8,
      iconBg: 'bg-sky-100 dark:bg-sky-900/30',
      iconColor: 'text-sky-600 dark:text-sky-400',
      badge: '🟡 SEASONAL',
      badgeBg: 'bg-sky-100 dark:bg-sky-900/40',
      badgeText: 'text-sky-700 dark:text-sky-300',
      summary: `Peak demand ${seasonalMatch.peak}. Capture 80% of sales by ordering ${volume.toLocaleString('de-DE')} units before ${seasonalMatch.orderBy}.`,
      impact: `Off-season storage drains ${toEuro(offSeasonMonthlyStorage)} per month (${seasonalMatch.offSeason}).`,
      annualSavings: offSeasonMonthlyStorage * 6,
      actions: [
        {
          id: 'order-deadline',
          label: 'Lock Purchase Order Now',
          detail: `Place PO by ${seasonalMatch.orderBy} with 30-day lead time to arrive before peak.`,
          template: 'Supplier email: “We project peak demand in ${seasonalMatch.peak}. Please confirm ship date before ${seasonalMatch.orderBy}.”'
        },
        {
          id: 'offseason-clearance',
          label: 'Plan Off-Season Clearance',
          detail: `Run “warehouse deal” campaign starting ${seasonalMatch.offSeason.split('-')[0]} to avoid storage fees.`,
          template: 'Set up Amazon Outlet deal + email list for seasonal close-out.'
        }
      ],
      deadline: `Finalize order plan by ${defaultDeadline(7)}.`
    });
  }

  // ========== RULE 7: COMPETITOR PRICE ALERT (PLACEHOLDER) ==========
  // TODO: Integrate Rainforest API for real-time market pricing
  // Expected launch: When API key and data pipeline are ready
  // Blocked by: API integration, competitor data source
  if (SHOW_FUTURE_API_FEATURES) {
    const marketPriceWindow = {
      low: price * 0.9,
      high: price * 1.1
    };
    triggeredActions.push({
      id: 'competitor-price',
      title: 'Market Price Alignment Needed',
      priority: 'LOW',
      priorityColor: 'blue',
      icon: Compass,
      iconBg: 'bg-indigo-100 dark:bg-indigo-900/30',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      badge: 'MARKET INSIGHTS',
      badgeBg: 'bg-indigo-100 dark:bg-indigo-900/40',
      badgeText: 'text-indigo-700 dark:text-indigo-300',
      summary: `Market range (est): ${toEuro(marketPriceWindow.low)} - ${toEuro(marketPriceWindow.high)}. Your price: ${toEuro(price)}.`,
      impact: `Target ${toEuro(price * 0.75)} selling price for 25% margin with competitive pricing data.`,
      annualSavings: (price - price * 0.75) * volume,
      actions: [
        {
          id: 'collect-competitor-data',
          label: 'Collect Live Competitor Prices',
          detail: 'Connect market data API or export Keepa data to validate target price band.',
          template: 'Task: Create API key → configure cron job → store price history in database.'
        },
        {
          id: 'price-test',
          label: 'Run Price Elasticity Test',
          detail: `Test ${toEuro(price * 0.95)} and ${toEuro(price * 1.05)} for 7 days each. Track conversion + profit.`,
          template: 'Experiment plan: Split weeks by price, monitor session %, conversion, ordered revenue.'
        }
      ],
      deadline: `Prep data integration by ${defaultDeadline(21)}.`
    });
  }
  
  // ========== RULE 2: SMALL PACKAGE REDESIGN ==========
  const MAX_HEIGHT = 8;
  const MAX_WEIGHT = 1.0;
  const MAX_PRICE = 60;
  
  const heightExcess = height_cm - MAX_HEIGHT;
  const weightExcess = weight_kg - MAX_WEIGHT;
  const priceExcess = price - MAX_PRICE;
  
  // Check if near-eligible (fails by < 30%)
  const heightNearMiss = heightExcess > 0 && heightExcess <= MAX_HEIGHT * 0.3;
  const weightNearMiss = weightExcess > 0 && weightExcess <= MAX_WEIGHT * 0.3;
  const priceNearMiss = priceExcess > 0 && priceExcess <= MAX_PRICE * 0.3;
  
  const isNearEligible = (heightNearMiss || weightNearMiss || priceNearMiss) && !smallPackageCheck.isEligible;
  
  if (isNearEligible) {
    const smallPackageSavings = 1.71; // €5.50 - €3.79
    const annualSavings = (smallPackageSavings * volume).toFixed(0);
    
    let failedDimension = '';
    let targetReduction = '';
    
    if (heightNearMiss) {
      failedDimension = 'height';
      targetReduction = `${heightExcess.toFixed(1)}cm (${height_cm}cm → ${MAX_HEIGHT}cm)`;
    } else if (weightNearMiss) {
      failedDimension = 'weight';
      targetReduction = `${(weightExcess * 1000).toFixed(0)}g (${weight_kg}kg → ${MAX_WEIGHT}kg)`;
    } else if (priceNearMiss) {
      failedDimension = 'price';
      targetReduction = `€${priceExcess.toFixed(2)} (€${price} → €${MAX_PRICE})`;
    }
    
    triggeredActions.push({
      id: 'small-package-redesign',
      title: 'Redesign Opportunity: Near-Eligible for Small Package',
      priority: 'MEDIUM',
      priorityColor: 'yellow',
      icon: Package,
      iconBg: 'bg-amber-100 dark:bg-amber-900/30',
      iconColor: 'text-amber-600 dark:text-amber-400',
      badge: '🟡 MEDIUM',
      badgeBg: 'bg-amber-100 dark:bg-amber-900/40',
      badgeText: 'text-amber-700 dark:text-amber-300',
      summary: `Reduce ${failedDimension} by ${targetReduction} → Save €${smallPackageSavings.toFixed(2)}/unit`,
      impact: `Annual savings at ${volume.toLocaleString('de-DE')} units/year: €${parseInt(annualSavings).toLocaleString('de-DE')}`,
      annualSavings: parseFloat(annualSavings),
      actions: [
        {
          id: 'contact-vendor',
          label: 'Contact Packaging Vendor',
          detail: `Request ${failedDimension} reduction. Payback period: ${(annualSavings / 1000).toFixed(1)} months if redesign costs €1,000`,
          template: `Email: "We need packaging for {product} with max ${failedDimension} ${failedDimension === 'height' ? MAX_HEIGHT + 'cm' : failedDimension === 'weight' ? MAX_WEIGHT + 'kg' : '€' + MAX_PRICE}. Current: {current_value}. Can you achieve this?"`
        },
        {
          id: 'test-redesign',
          label: 'Test Redesign',
          detail: `Order 100 units with new packaging. Test cost: ~€${((cogs + 0.5) * 100).toFixed(0)}. Validate before full production`,
          template: 'Validation checklist: Measure 10 random units, test drop test, verify Amazon FBA acceptance'
        },
        {
          id: 'measure-verify',
          label: 'Measure & Verify',
          detail: `Post-packaging measurement critical. Small Package rejection wastes €${smallPackageSavings.toFixed(2)}/unit`,
          template: 'Measurement protocol: Use calibrated scale, measure in packaging, photograph for supplier verification'
        }
      ]
    });
  }
  
  // ========== RULE 3: HIGH FEE STRUCTURE ==========
  if (feePercent > 20) {
    const fbmSavings = (feeAmount * 0.4).toFixed(2); // 40% savings
    const fbmAnnualSavings = (parseFloat(fbmSavings) * volume).toFixed(0);
    const categorySavings = (price * 0.05).toFixed(2); // 5% fee reduction
    const categoryAnnualSavings = (parseFloat(categorySavings) * volume).toFixed(0);
    const volumeDiscount = (feeAmount * 0.025 * volume).toFixed(0); // 2.5% discount
    
    const savingsRange = Math.max(
      parseFloat(fbmAnnualSavings),
      parseFloat(categoryAnnualSavings),
      parseFloat(volumeDiscount)
    );
    
    const optionCount = 3;
    
    triggeredActions.push({
      id: 'high-fee-structure',
      title: 'High Amazon Fees: Explore Alternatives',
      priority: 'MEDIUM',
      priorityColor: 'yellow',
      icon: DollarSign,
      iconBg: 'bg-amber-100 dark:bg-amber-900/30',
      iconColor: 'text-amber-600 dark:text-amber-400',
      badge: '🟡 MEDIUM',
      badgeBg: 'bg-amber-100 dark:bg-amber-900/40',
      badgeText: 'text-amber-700 dark:text-amber-300',
      summary: `Amazon fees €${feeAmount.toFixed(2)}/unit (${feePercent.toFixed(1)}% of costs). You have ${optionCount} options to reduce`,
      impact: `Potential annual savings: €${parseInt(Math.min(savingsRange, savingsRange * 1.5)).toLocaleString('de-DE')}-€${parseInt(savingsRange).toLocaleString('de-DE')}/year`,
      annualSavings: savingsRange,
      actions: [
        {
          id: 'review-category',
          label: 'Review Category',
          detail: `Check if product qualifies for lower-fee category. Current: ${input.category || 'Electronics'} (15%) → Possible: Alternative (8-10%) = €${parseInt(categoryAnnualSavings).toLocaleString('de-DE')}/year`,
          template: 'Category checklist: Review Amazon category tree, verify product attributes, submit recategorization request if eligible'
        },
        {
          id: 'test-fbm',
          label: 'Test FBM',
          detail: `Get DHL/DPD quote for ${weight_kg}kg shipment. Potential €${fbmSavings}/unit savings = €${parseInt(fbmAnnualSavings).toLocaleString('de-DE')}/year. Labor: ${((volume / 52) * 3 / 60).toFixed(1)}h/week`,
          template: 'FBM setup: Get carrier quotes, calculate warehouse costs, compare total cost vs FBA, pilot with 10% of inventory'
        },
        {
          id: 'volume-negotiation',
          label: 'Volume Negotiation',
          detail: `At ${Math.ceil(volume / 12)} units/month, request Account Manager. Target 2-3% fee reduction = €${parseInt(volumeDiscount).toLocaleString('de-DE')}/year`,
          template: 'Negotiation script: "We sell {volume}/month. Can Amazon offer fee discount to support growth? Target: {fee_reduction}%"'
        }
      ]
    });
  }
  
  // ========== RULE 4: LOW ROI / UNDERPERFORMING ==========
  if (roi < 30 && margin > 18) {
    const currentProfit = (netProfit * volume).toFixed(0);
    const projectedProfit2x = (netProfit * volume * 2).toFixed(0);
    const additional2x = (parseFloat(projectedProfit2x) - parseFloat(currentProfit)).toFixed(0);
    const requiredCapital = (cogs * volume).toFixed(0);
    const volumeIncrease = 15; // Assume 15% volume increase with 5% price reduction
    const priceReduced = (price * 0.95).toFixed(2);
    const priceTestProfit = ((netProfit - (price * 0.05)) * volume * (1 + volumeIncrease / 100)).toFixed(0);
    
    triggeredActions.push({
      id: 'low-roi-volume',
      title: 'Low ROI: Volume Problem, Not Cost',
      priority: 'MEDIUM',
      priorityColor: 'yellow',
      icon: TrendingUp,
      iconBg: 'bg-amber-100 dark:bg-amber-900/30',
      iconColor: 'text-amber-600 dark:text-amber-400',
      badge: '🟡 MEDIUM',
      badgeBg: 'bg-amber-100 dark:bg-amber-900/40',
      badgeText: 'text-amber-700 dark:text-amber-300',
      summary: `ROI ${roi.toFixed(1)}% is below 25-35% industry benchmark. Your costs are fine (${margin.toFixed(1)}% margin) - you need more volume`,
      impact: `At current volume ${volume.toLocaleString('de-DE')}: €${parseInt(currentProfit).toLocaleString('de-DE')}/year. At 2x volume: €${parseInt(projectedProfit2x).toLocaleString('de-DE')}/year (+€${parseInt(additional2x).toLocaleString('de-DE')})`,
      annualSavings: parseFloat(additional2x),
      actions: [
        {
          id: 'increase-inventory',
          label: 'Increase Inventory',
          detail: `Order 2x current quantity (${(volume * 2).toLocaleString('de-DE')} units). Requires €${parseInt(requiredCapital).toLocaleString('de-DE')} upfront capital`,
          template: 'Capital planning: Calculate cash flow, check supplier lead time, negotiate payment terms (Net-30/60)'
        },
        {
          id: 'optimize-price',
          label: 'Optimize Price',
          detail: `Test price elasticity: reduce to €${priceReduced} (-5%). Project +${volumeIncrease}% volume = €${parseInt(priceTestProfit).toLocaleString('de-DE')}/year profit`,
          template: 'Elasticity test: Run 2-week promotion at -5%, measure conversion lift, calculate breakeven volume increase'
        },
        {
          id: 'run-promotion',
          label: 'Run Promotion',
          detail: `Limited-time 10% discount (2-week sprint). Clear ${(volume * 0.3).toFixed(0)} units fast stock, generate cash for reorder`,
          template: 'Promotion setup: Create coupon code, set 2-week timer, advertise in listing title, monitor daily sales velocity'
        }
      ]
    });
  }
  
  // ========== RULE 5: EXCEPTIONAL ROI / SCALE SIGNAL ==========
  if (roi > 60 && margin > 35) {
    const profit1x = (netProfit * volume).toFixed(0);
    const profit2x = (netProfit * volume * 2).toFixed(0);
    const additional2x = (parseFloat(profit2x) - parseFloat(profit1x)).toFixed(0);
    const profit5x = (netProfit * volume * 5).toFixed(0);
    const additional5x = (parseFloat(profit5x) - parseFloat(profit1x)).toFixed(0);
    const requiredCapital2x = (cogs * volume * 2).toFixed(0);
    const volumeDiscountTarget = 8; // 8% COGS reduction at 2x volume
    const volumeDiscountSavings = (cogs * 0.08 * volume * 2).toFixed(0);
    const multiMarketplaceRevenue = 25; // 25% revenue increase
    const multiMarketplaceProfit = (parseFloat(profit1x) * 0.25).toFixed(0);
    
    triggeredActions.push({
      id: 'scale-exceptional-roi',
      title: 'Scale Now: Exceptional Profitability',
      priority: 'HIGH OPPORTUNITY',
      priorityColor: 'green',
      icon: Rocket,
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-600 dark:text-green-400',
      badge: '🟢 HIGH OPPORTUNITY',
      badgeBg: 'bg-green-100 dark:bg-green-900/40',
      badgeText: 'text-green-700 dark:text-green-300',
      summary: `Your product is a cash-generating machine (${roi.toFixed(1)}% ROI, ${margin.toFixed(1)}% margin). Increase inventory to capture demand.`,
      impact: `Scale to 2x volume → €${parseInt(profit2x).toLocaleString('de-DE')}/year (+€${parseInt(additional2x).toLocaleString('de-DE')}). Scale to 5x → €${parseInt(profit5x).toLocaleString('de-DE')}/year (+€${parseInt(additional5x).toLocaleString('de-DE')})`,
      annualSavings: parseFloat(additional2x),
      actions: [
        {
          id: 'increase-order-quantity',
          label: 'Increase Order Quantity',
          detail: `Place 2x order with current supplier (${(volume * 2).toLocaleString('de-DE')} units). Required capital: €${parseInt(requiredCapital2x).toLocaleString('de-DE')}. At this ROI, payback in ${(1 / (roi / 100)).toFixed(1)} months`,
          template: 'Supplier email: "Based on strong performance, increasing order to {2x_volume} units. Can you offer volume discount?"'
        },
        {
          id: 'negotiate-volume-discount',
          label: 'Negotiate Volume Discount',
          detail: `At ${(volume * 2).toLocaleString('de-DE')} units/year, request ${volumeDiscountTarget}% COGS reduction (€${cogs.toFixed(2)} → €${(cogs * (1 - volumeDiscountTarget / 100)).toFixed(2)}) = €${parseInt(volumeDiscountSavings).toLocaleString('de-DE')}/year`,
          template: 'Negotiation leverage: "We\'re scaling to {2x_volume}/year. To sustain growth, need {discount_target}% discount. Otherwise exploring 2nd supplier"'
        },
        {
          id: 'expand-marketplace',
          label: 'Expand to 2nd Marketplace',
          detail: `Launch on eBay or alternate EU marketplaces (UK, France, Italy). Estimated +${multiMarketplaceRevenue}% revenue = €${parseInt(multiMarketplaceProfit).toLocaleString('de-DE')}/year additional profit`,
          template: 'Multi-marketplace setup: Register seller account, sync inventory, localize listing, test with 20% of stock'
        }
      ]
    });
  }
  
  // Sort by annual savings (descending) and take top 3
  const sortedActions = triggeredActions
    .sort((a, b) => b.annualSavings - a.annualSavings)
    .slice(0, 3);
  
  // Handle action tracking
  const handleMarkAsStarted = (actionId) => {
    if (startedActions.includes(actionId)) {
      setStartedActions(startedActions.filter(id => id !== actionId));
    } else {
      setStartedActions([...startedActions, actionId]);
    }
    
    // TODO: In production, send to API
    // POST /api/user/actions-started
    // { action_id: actionId, timestamp: Date.now(), product_id: input.product_name }
  };
  
  return (
    <div className="space-y-6">
      {/* Order Planning Card */}
      <OrderPlanningCard result={result} />
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <Lightbulb className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
          Recommended Actions
        </h3>
      </motion.div>
      
      {sortedActions.length === 0 ? (
        // No triggers - all healthy
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-xl p-8 text-center"
        >
          <CheckCircle2 className="w-16 h-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
          <h4 className="text-xl font-bold text-green-700 dark:text-green-300 mb-2">
            ✓ All Key Metrics Healthy
          </h4>
          <p className="text-slate-600 dark:text-slate-400">
            No immediate actions required. Your product performance is within optimal ranges.
            Continue monitoring and maintain current strategy.
          </p>
        </motion.div>
      ) : (
        // Display triggered actions
        <div className="space-y-4">
          {sortedActions.map((action, index) => (
            <ActionCard
              key={action.id}
              action={action}
              index={index}
              isStarted={startedActions.includes(action.id)}
              onToggleStarted={() => handleMarkAsStarted(action.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * ActionCard Component - Individual action recommendation card
 */
const ActionCard = ({ action, index, isStarted, onToggleStarted }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const Icon = action.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: index * 0.1,
        duration: 0.4,
        ease: 'easeOut'
      }}
      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden"
    >
      {/* Header */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1">
            <div className={`w-12 h-12 ${action.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-6 h-6 ${action.iconColor}`} />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-1">
                {action.title}
              </h4>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${action.badgeBg} ${action.badgeText}`}>
                {action.badge}
              </span>
            </div>
          </div>
        </div>
        
        {/* Summary */}
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
          {action.summary}
        </p>
        
        {/* Impact Box */}
        <div className={`${action.iconBg} rounded-lg p-4 mb-4`}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {action.priority === 'HIGH OPPORTUNITY' ? 'Potential Profit Increase' : 'Annual Savings'}
            </span>
            <span className={`text-xl font-bold ${action.iconColor}`}>
              {action.impact}
            </span>
          </div>
        </div>
        
        {/* Action Steps Toggle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
        >
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {action.actions.length} Action Steps
          </span>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </motion.div>
        </button>
      </div>
      
      {/* Expandable Action Steps */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-t border-slate-200 dark:border-slate-700"
          >
            <div className="p-6 space-y-4 bg-slate-50 dark:bg-slate-900/30">
              {action.actions.map((step, idx) => (
                <div key={step.id} className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                        {idx + 1}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h5 className="text-sm font-bold text-slate-800 dark:text-white mb-1">
                        {step.label}
                      </h5>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-2">
                        {step.detail}
                      </p>
                      {step.template && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-md p-2 border border-blue-200 dark:border-blue-800">
                          <div className="flex items-start gap-2">
                            <ExternalLink className="w-3 h-3 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-blue-700 dark:text-blue-300 font-mono leading-relaxed">
                              {step.template}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Mark As Started Checkbox */}
      <div className="px-5 py-4 bg-slate-50 dark:bg-slate-900/30 border-t border-slate-200 dark:border-slate-700">
        <button
          onClick={onToggleStarted}
          className="flex items-center gap-3 w-full"
        >
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            isStarted 
              ? 'bg-green-600 border-green-600' 
              : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600'
          }`}>
            {isStarted && <CheckCircle2 className="w-4 h-4 text-white" />}
          </div>
          <span className={`text-sm font-semibold ${
            isStarted 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-slate-600 dark:text-slate-400'
          }`}>
            {isStarted ? '✓ In Progress' : 'Mark As Started'}
          </span>
        </button>
      </div>
    </motion.div>
  );
};

export default ActionsPanel;

