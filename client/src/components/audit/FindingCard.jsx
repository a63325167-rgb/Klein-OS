/**
 * Finding Card Component
 * 
 * Displays individual audit findings with expand/collapse details.
 * Shows affected products, financial impact, and context.
 */

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, TrendingUp, AlertTriangle } from 'lucide-react';

export default function FindingCard({ finding }) {
  const [expanded, setExpanded] = useState(false);

  if (!finding) return null;

  const getSeverityStyles = () => {
    switch (finding.severity) {
      case 'critical':
        return {
          bg: 'bg-red-500/10',
          border: 'border-red-500/30',
          text: 'text-red-400',
          badge: 'bg-red-500/20 text-red-300'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-500/10',
          border: 'border-yellow-500/30',
          text: 'text-yellow-400',
          badge: 'bg-yellow-500/20 text-yellow-300'
        };
      case 'opportunity':
        return {
          bg: 'bg-green-500/10',
          border: 'border-green-500/30',
          text: 'text-green-400',
          badge: 'bg-green-500/20 text-green-300'
        };
      default:
        return {
          bg: 'bg-gray-500/10',
          border: 'border-gray-500/30',
          text: 'text-gray-400',
          badge: 'bg-gray-500/20 text-gray-300'
        };
    }
  };

  const styles = getSeverityStyles();

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return 'N/A';
    return `€${Math.abs(value).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

  const renderImpactSummary = () => {
    const { impact } = finding;
    
    switch (finding.type) {
      case 'dead_inventory':
        return (
          <div className="text-sm text-gray-300 space-y-1">
            <div>Annual profit loss: <span className="font-mono text-red-400 font-semibold">{formatCurrency(impact.annualProfitLoss)}</span></div>
            <div>Capital tied up: <span className="font-mono text-gray-300">{formatCurrency(impact.capitalTiedUp)}</span></div>
          </div>
        );
      
      case 'unsustainable_margin':
        return (
          <div className="text-sm text-gray-300 space-y-1">
            <div>Total revenue at risk: <span className="font-mono text-red-400 font-semibold">{formatCurrency(impact.totalRevenue)}</span></div>
            <div>Average margin: <span className="font-mono text-red-400">{impact.avgMargin.toFixed(1)}%</span></div>
          </div>
        );
      
      case 'slow_velocity':
        return (
          <div className="text-sm text-gray-300 space-y-1">
            <div>Total annual profit: <span className="font-mono text-yellow-400">{formatCurrency(impact.totalAnnualProfit)}</span></div>
            <div>Capital tied up: <span className="font-mono text-gray-300">{formatCurrency(impact.capitalTiedUp)}</span></div>
          </div>
        );
      
      case 'concentration_risk':
        return (
          <div className="text-sm text-gray-300 space-y-1">
            <div>Concentration: <span className="font-mono text-yellow-400 font-semibold">{impact.concentrationPercentage.toFixed(0)}%</span> in top 3 categories</div>
            <div>Portfolio value: <span className="font-mono text-gray-300">{formatCurrency(impact.totalValue)}</span></div>
          </div>
        );
      
      case 'scaling_opportunity':
        return (
          <div className="text-sm text-gray-300 space-y-1">
            <div>Current profit: <span className="font-mono text-green-400">{formatCurrency(impact.currentAnnualProfit)}/yr</span></div>
            <div>Potential increase: <span className="font-mono text-green-400 font-semibold">+{formatCurrency(impact.potentialIncrease)}/yr</span></div>
          </div>
        );
      
      case 'pricing_gap':
        return (
          <div className="text-sm text-gray-300 space-y-1">
            <div>Potential revenue: <span className="font-mono text-green-400 font-semibold">+{formatCurrency(impact.potentialRevenue)}</span></div>
            <div>Avg price gap: <span className="font-mono text-green-400">{formatCurrency(impact.avgPriceGap)}</span></div>
          </div>
        );
      
      case 'low_volume_risk':
        return (
          <div className="text-sm text-gray-300 space-y-1">
            <div>Products affected: <span className="font-mono text-yellow-400">{impact.totalProducts}</span></div>
            <div>Average margin: <span className="font-mono text-yellow-400">{impact.avgMargin.toFixed(1)}%</span></div>
          </div>
        );
      
      default:
        return null;
    }
  };

  const renderExpandedDetails = () => {
    if (!expanded) return null;

    return (
      <div className="mt-4 pt-4 border-t border-gray-800 space-y-4">
        {/* Affected Products */}
        <div>
          <h4 className="text-sm font-semibold text-gray-300 mb-2">Affected Products:</h4>
          <div className="space-y-2">
            {finding.affectedProducts.slice(0, 5).map((product, idx) => (
              <div key={idx} className="bg-[#1A1C1C] rounded p-3 text-sm">
                {renderProductDetails(product)}
              </div>
            ))}
            {finding.affectedProducts.length > 5 && (
              <div className="text-xs text-gray-500 italic">
                ... and {finding.affectedProducts.length - 5} more products
              </div>
            )}
          </div>
        </div>

        {/* Why This Matters */}
        <div>
          <h4 className="text-sm font-semibold text-gray-300 mb-2">Why This Matters:</h4>
          <ul className="space-y-1 text-sm text-gray-400">
            {finding.details.whyItMatters.map((point, idx) => (
              <li key={idx} className="flex gap-2">
                <span className="text-gray-600">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Financial Impact Details */}
        {renderDetailedImpact()}
      </div>
    );
  };

  const renderProductDetails = (product) => {
    switch (finding.type) {
      case 'dead_inventory':
        return (
          <div className="grid grid-cols-2 gap-2">
            <div><span className="text-gray-500">ASIN:</span> <span className="font-mono text-gray-300">{product.asin}</span></div>
            <div><span className="text-gray-500">Category:</span> <span className="text-gray-300">{product.category}</span></div>
            <div><span className="text-gray-500">Days in stock:</span> <span className="font-mono text-red-400">{product.daysInStock}</span></div>
            <div><span className="text-gray-500">Margin:</span> <span className="font-mono text-red-400">{product.margin.toFixed(1)}%</span></div>
            <div><span className="text-gray-500">Quantity:</span> <span className="font-mono text-gray-300">{product.quantity}</span></div>
            <div><span className="text-gray-500">Total value:</span> <span className="font-mono text-gray-300">{formatCurrency(product.totalValue)}</span></div>
          </div>
        );
      
      case 'unsustainable_margin':
        return (
          <div className="grid grid-cols-2 gap-2">
            <div><span className="text-gray-500">ASIN:</span> <span className="font-mono text-gray-300">{product.asin}</span></div>
            <div><span className="text-gray-500">Category:</span> <span className="text-gray-300">{product.category}</span></div>
            <div><span className="text-gray-500">Margin:</span> <span className="font-mono text-red-400">{product.margin.toFixed(1)}%</span></div>
            <div><span className="text-gray-500">Profit/unit:</span> <span className="font-mono text-red-400">{formatCurrency(product.profitPerUnit)}</span></div>
          </div>
        );
      
      case 'slow_velocity':
        return (
          <div className="grid grid-cols-2 gap-2">
            <div><span className="text-gray-500">ASIN:</span> <span className="font-mono text-gray-300">{product.asin}</span></div>
            <div><span className="text-gray-500">Category:</span> <span className="text-gray-300">{product.category}</span></div>
            <div><span className="text-gray-500">Annual profit:</span> <span className="font-mono text-yellow-400">{formatCurrency(product.annualProfit)}/yr</span></div>
            <div><span className="text-gray-500">Days in stock:</span> <span className="font-mono text-yellow-400">{product.daysInStock}</span></div>
          </div>
        );
      
      case 'concentration_risk':
        return (
          <div className="grid grid-cols-2 gap-2">
            <div><span className="text-gray-500">Category:</span> <span className="text-gray-300">{product.category}</span></div>
            <div><span className="text-gray-500">Value:</span> <span className="font-mono text-gray-300">{formatCurrency(product.value)}</span></div>
            <div><span className="text-gray-500">Percentage:</span> <span className="font-mono text-yellow-400">{product.percentage}%</span></div>
          </div>
        );
      
      case 'scaling_opportunity':
        return (
          <div className="grid grid-cols-2 gap-2">
            <div><span className="text-gray-500">ASIN:</span> <span className="font-mono text-gray-300">{product.asin}</span></div>
            <div><span className="text-gray-500">Category:</span> <span className="text-gray-300">{product.category}</span></div>
            <div><span className="text-gray-500">Margin:</span> <span className="font-mono text-green-400">{product.margin.toFixed(1)}%</span></div>
            <div><span className="text-gray-500">Days in stock:</span> <span className="font-mono text-green-400">{product.daysInStock ?? 'N/A'}</span></div>
            <div><span className="text-gray-500">Annual profit:</span> <span className="font-mono text-green-400">{formatCurrency(product.annualProfit)}/yr</span></div>
          </div>
        );
      
      case 'pricing_gap':
        return (
          <div className="grid grid-cols-2 gap-2">
            <div><span className="text-gray-500">ASIN:</span> <span className="font-mono text-gray-300">{product.asin}</span></div>
            <div><span className="text-gray-500">Category:</span> <span className="text-gray-300">{product.category}</span></div>
            <div><span className="text-gray-500">Current price:</span> <span className="font-mono text-gray-300">{formatCurrency(product.currentPrice)}</span></div>
            <div><span className="text-gray-500">Category median:</span> <span className="font-mono text-green-400">{formatCurrency(product.categoryMedian)}</span></div>
            <div><span className="text-gray-500">Margin:</span> <span className="font-mono text-green-400">{product.margin.toFixed(1)}%</span></div>
          </div>
        );
      
      case 'low_volume_risk':
        return (
          <div className="grid grid-cols-2 gap-2">
            <div><span className="text-gray-500">ASIN:</span> <span className="font-mono text-gray-300">{product.asin}</span></div>
            <div><span className="text-gray-500">Category:</span> <span className="text-gray-300">{product.category}</span></div>
            <div><span className="text-gray-500">Quantity:</span> <span className="font-mono text-yellow-400">{product.quantity}</span></div>
            <div><span className="text-gray-500">Margin:</span> <span className="font-mono text-yellow-400">{product.margin.toFixed(1)}%</span></div>
          </div>
        );
      
      default:
        return <div className="text-gray-400">Product details</div>;
    }
  };

  const renderDetailedImpact = () => {
    const { impact } = finding;
    
    switch (finding.type) {
      case 'dead_inventory':
        return (
          <div>
            <h4 className="text-sm font-semibold text-gray-300 mb-2">Financial Impact:</h4>
            <div className="bg-[#1A1C1C] rounded p-3 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Annual profit loss:</span>
                <span className="font-mono text-red-400 font-semibold">{formatCurrency(impact.annualProfitLoss)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Capital tied up:</span>
                <span className="font-mono text-gray-300">{formatCurrency(impact.capitalTiedUp)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Monthly opportunity cost:</span>
                <span className="font-mono text-yellow-400">{formatCurrency(impact.monthlyOpportunityCost)}</span>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  const getSeverityBadge = () => {
    const badges = {
      critical: 'Act This Week',
      warning: 'Act This Month',
      opportunity: 'Consider for Growth'
    };
    return badges[finding.severity] || 'Review';
  };

  return (
    <div className={`rounded-lg border ${styles.border} ${styles.bg} p-4 transition-all`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          <span className="text-2xl">{finding.icon}</span>
          <div className="flex-1">
            <h3 className={`text-lg font-semibold ${styles.text} mb-1`}>
              {finding.title}
            </h3>
            <p className="text-sm text-gray-400">
              {finding.description}
            </p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-medium ${styles.badge} whitespace-nowrap`}>
          {getSeverityBadge()}
        </span>
      </div>

      {/* Impact Summary */}
      <div className="mb-3">
        {renderImpactSummary()}
      </div>

      {/* Expand/Collapse Button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-300 transition-colors"
      >
        <span>More Details</span>
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {/* Expanded Details */}
      {renderExpandedDetails()}
    </div>
  );
}
