/**
 * KPI Summary Cards
 * 
 * Displays 4 key performance indicators:
 * 1. Total Profit
 * 2. Average Margin
 * 3. Products at Risk
 * 4. Estimated Days to Sell All
 */

import React, { useMemo } from 'react';
import { TrendingUp, Percent, AlertTriangle, Clock } from 'lucide-react';

export default function KPISummaryCards({ products = [] }) {
  // Calculate KPIs
  const kpis = useMemo(() => {
    if (products.length === 0) {
      return {
        totalProfit: 0,
        avgMargin: 0,
        productsAtRisk: 0,
        daysToSellAll: 0
      };
    }

    // Total Profit: Sum of all profit per unit * quantity
    const totalProfit = products.reduce((sum, p) => {
      const profitPerUnit = calculateProfitPerUnit(p);
      return sum + (profitPerUnit * (p.quantity || 0));
    }, 0);

    // Average Margin
    const margins = products.map(p => calculateMargin(p));
    const avgMargin = margins.reduce((sum, m) => sum + m, 0) / margins.length;

    // Products at Risk: High risk (score > 65) OR low margin (< 15%)
    const productsAtRisk = products.filter(p => {
      const margin = calculateMargin(p);
      const risk = p.riskScore || 0;
      return risk > 65 || margin < 15;
    }).length;

    // Estimated Days to Sell All
    // Average velocity = total quantity / average days in stock
    const totalQuantity = products.reduce((sum, p) => sum + (p.quantity || 0), 0);
    const avgDaysInStock = products.reduce((sum, p) => sum + (p.daysInStock || 0), 0) / products.length;
    const avgVelocity = avgDaysInStock > 0 ? totalQuantity / avgDaysInStock : 0;
    const daysToSellAll = avgVelocity > 0 ? totalQuantity / avgVelocity : 0;

    return {
      totalProfit: totalProfit.toFixed(2),
      avgMargin: avgMargin.toFixed(1),
      productsAtRisk,
      daysToSellAll: Math.round(daysToSellAll)
    };
  }, [products]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total Profit */}
      <KPICard
        icon={<TrendingUp className="w-6 h-6" />}
        label="Total Profit"
        value={`€${parseFloat(kpis.totalProfit).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        subtitle="Across all products"
        color="teal"
      />

      {/* Average Margin */}
      <KPICard
        icon={<Percent className="w-6 h-6" />}
        label="Avg Margin"
        value={`${kpis.avgMargin}%`}
        subtitle={kpis.avgMargin >= 25 ? 'Target met ✓' : 'Target: 25%+'}
        color="teal"
        status={kpis.avgMargin >= 25 ? 'good' : 'warning'}
      />

      {/* Products at Risk */}
      <KPICard
        icon={<AlertTriangle className="w-6 h-6" />}
        label="At Risk"
        value={`${kpis.productsAtRisk} ${kpis.productsAtRisk === 1 ? 'product' : 'products'}`}
        subtitle={kpis.productsAtRisk > 0 ? 'Action: Review' : 'All clear ✓'}
        color="red"
        status={kpis.productsAtRisk > 0 ? 'danger' : 'good'}
      />

      {/* Days to Sell All */}
      <KPICard
        icon={<Clock className="w-6 h-6" />}
        label="Est. Days to Sell All"
        value={`${kpis.daysToSellAll} days`}
        subtitle="At current pace"
        color="orange"
      />
    </div>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

function KPICard({ icon, label, value, subtitle, color = 'teal', status = 'neutral' }) {
  const colorClasses = {
    teal: 'bg-[#32808D]/10 text-[#32808D]',
    red: 'bg-red-600/10 text-red-500',
    orange: 'bg-orange-600/10 text-orange-500',
    green: 'bg-green-600/10 text-green-500'
  };

  const statusColors = {
    good: 'text-green-400',
    warning: 'text-orange-400',
    danger: 'text-red-400',
    neutral: 'text-gray-400'
  };

  return (
    <div className="bg-[#1F2121] rounded-lg border border-gray-800 p-6 hover:border-gray-700 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      
      <div className="space-y-1">
        <p className="text-sm text-gray-400">{label}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className={`text-xs ${statusColors[status]}`}>{subtitle}</p>
      </div>
    </div>
  );
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function calculateProfitPerUnit(product) {
  const { sellingPrice, cost, fbaFees = 0, vatRate = 0.19 } = product;
  
  if (!sellingPrice || !cost) return 0;
  
  const profitPerUnit = sellingPrice - cost - fbaFees - (sellingPrice * vatRate);
  return parseFloat(profitPerUnit.toFixed(2));
}

function calculateMargin(product) {
  const { sellingPrice, cost, fbaFees = 0 } = product;
  
  if (!sellingPrice || sellingPrice <= 0) return 0;
  
  const profitPerUnit = sellingPrice - cost - fbaFees;
  const margin = (profitPerUnit / sellingPrice) * 100;
  
  return parseFloat(margin.toFixed(1));
}
