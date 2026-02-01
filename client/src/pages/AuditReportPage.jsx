/**
 * Audit Report Page - Phase 2
 * 
 * Professional audit report with:
 * - Executive summary dashboard with KPIs
 * - Findings grouped by severity
 * - Detailed analysis with expand/collapse
 * - Portfolio health summary
 * - No recommendations (Phase 3)
 */

import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, TrendingUp, AlertTriangle, Target, CheckCircle } from 'lucide-react';
import { useProducts } from '../contexts/ProductsContext';
import { runAuditAnalysis, getOpportunityScoreLabel } from '../utils/auditEngine';
import { generateFindings } from '../utils/findingsAdapter';
import FindingCard from '../components/audit/FindingCard';
import OpportunitySummaryCard from '../components/audit/OpportunitySummaryCard';

export default function AuditReportPage() {
  const navigate = useNavigate();
  const { products } = useProducts();

  // Calculate enhanced products with metrics
  const enhancedProducts = useMemo(() => {
    return products.map(product => {
      const cost = product.cost || 0;
      const sellingPrice = product.sellingPrice || 0;
      const quantity = product.quantity || 0;
      const daysInStock = product.daysInStock;

      const profitPerUnit = sellingPrice - cost;
      const margin = sellingPrice > 0 ? ((profitPerUnit / sellingPrice) * 100) : 0;

      let annualProfit = null;
      if (daysInStock && daysInStock > 0) {
        annualProfit = (profitPerUnit * quantity * 365) / daysInStock;
      }

      let riskLevel = 'green';
      if ((daysInStock > 180 && margin < 15) || margin < 10) {
        riskLevel = 'red';
      } else if ((daysInStock > 90 && margin < 20) || (annualProfit !== null && annualProfit < 500)) {
        riskLevel = 'yellow';
      }

      return {
        ...product,
        profitPerUnit,
        margin,
        annualProfit,
        riskLevel
      };
    });
  }, [products]);

  // Run audit analysis (legacy)
  const auditResults = useMemo(() => {
    return runAuditAnalysis(enhancedProducts);
  }, [enhancedProducts]);

  // Run new findings detection engines
  const findingsResults = useMemo(() => {
    return generateFindings(products);
  }, [products]);

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return '€0';
    return `€${Math.abs(value).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // No data state
  if (!products || products.length === 0) {
    return (
      <div className="min-h-screen bg-[#1A1C1C] text-white">
        <div className="max-w-7xl mx-auto p-8">
          <div className="bg-[#1F2121] rounded-lg border border-gray-800 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-500" />
              </div>
              <h2 className="text-xl font-semibold mb-2">No Products to Analyze</h2>
              <p className="text-gray-400 mb-6">
                To generate your audit report:
              </p>
              <ol className="text-left space-y-2 text-sm text-gray-400 mb-6">
                <li className="flex gap-2">
                  <span className="text-[#32808D]">1.</span>
                  <span>Go back to the main page</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#32808D]">2.</span>
                  <span>Upload your product data</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#32808D]">3.</span>
                  <span>Click "View Audit Report"</span>
                </li>
              </ol>
              <button
                onClick={() => navigate('/bulk-upload')}
                className="flex items-center gap-2 px-4 py-2 bg-[#32808D] hover:bg-[#2a6d7a] rounded-lg text-sm font-medium transition-colors mx-auto"
              >
                <ArrowLeft size={16} />
                Back to Upload
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { kpis, summary, critical, warning, opportunity } = auditResults;
  const scoreInfo = getOpportunityScoreLabel(kpis.opportunityScore);

  return (
    <div className="min-h-screen bg-[#1A1C1C] text-white">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/bulk-upload')}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 hover:text-gray-300 transition-colors mb-4"
          >
            <ArrowLeft size={16} />
            Back to Products
          </button>
          
          <div className="bg-[#1F2121] rounded-lg border border-gray-800 p-8 text-center">
            <h1 className="text-3xl font-bold mb-2">AUDIT REPORT</h1>
            <p className="text-lg text-gray-400 mb-4">Your E-Commerce Health Analysis</p>
            <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
              <div>
                Generated: <span className="text-gray-300">{formatDate(auditResults.generatedAt)}</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-gray-600"></div>
              <div>
                <span className="text-gray-300 font-semibold">{kpis.totalProducts}</span> products analyzed
              </div>
              <div className="w-1 h-1 rounded-full bg-gray-600"></div>
              <div>
                Portfolio Value: <span className="text-gray-300 font-semibold">{formatCurrency(kpis.portfolioValue)}</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-gray-600"></div>
              <div>
                Avg Margin: <span className="text-gray-300 font-semibold">{kpis.averageMargin.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Executive Summary - KPI Cards */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-[#32808D]" />
            Executive Summary
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Annual Profit */}
            <div className="bg-[#1F2121] rounded-lg border border-gray-800 p-6">
              <div className="text-sm text-gray-400 mb-1">Total Annual Profit</div>
              <div className="text-2xl font-bold text-white mb-1">
                {formatCurrency(kpis.totalAnnualProfit)}
              </div>
              <div className="text-xs text-gray-500">Across all products</div>
            </div>

            {/* Average Margin */}
            <div className="bg-[#1F2121] rounded-lg border border-gray-800 p-6">
              <div className="text-sm text-gray-400 mb-1">Average Margin</div>
              <div className="text-2xl font-bold text-white mb-1">
                {kpis.averageMargin.toFixed(1)}%
              </div>
              <div className={`text-xs flex items-center gap-1 ${kpis.averageMargin >= 25 ? 'text-green-400' : 'text-yellow-400'}`}>
                {kpis.averageMargin >= 25 ? (
                  <>
                    <CheckCircle size={12} />
                    <span>Target met</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle size={12} />
                    <span>Below target (25%)</span>
                  </>
                )}
              </div>
            </div>

            {/* Products at Risk */}
            <div className="bg-[#1F2121] rounded-lg border border-gray-800 p-6">
              <div className="text-sm text-gray-400 mb-1">Products at Risk</div>
              <div className="text-2xl font-bold text-white mb-1">
                {kpis.productsAtRisk} <span className="text-base text-gray-400">({((kpis.productsAtRisk / kpis.totalProducts) * 100).toFixed(0)}%)</span>
              </div>
              <div className={`text-xs flex items-center gap-1 ${kpis.productsAtRisk > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                {kpis.productsAtRisk > 0 ? (
                  <>
                    <AlertTriangle size={12} />
                    <span>Action needed</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={12} />
                    <span>All healthy</span>
                  </>
                )}
              </div>
            </div>

            {/* Opportunity Score */}
            <div className="bg-[#1F2121] rounded-lg border border-gray-800 p-6">
              <div className="text-sm text-gray-400 mb-1">Opportunity Score</div>
              <div className="text-2xl font-bold text-white mb-1">
                {kpis.opportunityScore.toFixed(1)}<span className="text-base text-gray-400">/10</span>
              </div>
              <div className={`text-xs font-medium ${
                scoreInfo.color === 'green' ? 'text-green-400' :
                scoreInfo.color === 'teal' ? 'text-[#32808D]' :
                scoreInfo.color === 'yellow' ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                {scoreInfo.label}
              </div>
            </div>
          </div>
        </div>

        {/* Findings by Severity */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Target size={20} className="text-[#32808D]" />
            Findings by Severity
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">🔴</span>
                <span className="text-lg font-semibold text-red-400">CRITICAL</span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">{critical.length} finding{critical.length !== 1 ? 's' : ''}</div>
              <div className="text-xs text-red-300">Act This Week</div>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">🟡</span>
                <span className="text-lg font-semibold text-yellow-400">WARNING</span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">{warning.length} finding{warning.length !== 1 ? 's' : ''}</div>
              <div className="text-xs text-yellow-300">Act This Month</div>
            </div>

            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">🟢</span>
                <span className="text-lg font-semibold text-green-400">OPPORTUNITIES</span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">{opportunity.length} finding{opportunity.length !== 1 ? 's' : ''}</div>
              <div className="text-xs text-green-300">Consider for Growth</div>
            </div>
          </div>
        </div>

        {/* Opportunity Summary Card */}
        {findingsResults.summary.total_annual_opportunity_eur > 0 && (
          <OpportunitySummaryCard summary={findingsResults.summary} />
        )}

        {/* Detailed Findings */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Detailed Findings</h2>
          
          {auditResults.findings.length === 0 ? (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-8 text-center">
              <div className="text-4xl mb-2">✅</div>
              <h3 className="text-lg font-semibold text-green-400 mb-2">No Issues Found</h3>
              <p className="text-sm text-gray-400">
                Your portfolio is healthy! All products meet performance thresholds.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {auditResults.findings.map((finding, index) => (
                <FindingCard key={index} finding={finding} />
              ))}
            </div>
          )}
        </div>

        {/* Portfolio Health Summary */}
        {summary && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Portfolio Health Summary</h2>
            
            <div className="bg-[#1F2121] rounded-lg border border-gray-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Overall Score</div>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold">
                      {summary.score.toFixed(1)}<span className="text-xl text-gray-400">/10</span>
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      summary.scoreLabel.color === 'green' ? 'bg-green-500/20 text-green-400' :
                      summary.scoreLabel.color === 'teal' ? 'bg-[#32808D]/20 text-[#32808D]' :
                      summary.scoreLabel.color === 'yellow' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {summary.scoreLabel.label}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strengths */}
                {summary.strengths.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-green-400 mb-3 flex items-center gap-2">
                      <CheckCircle size={16} />
                      Strengths
                    </h3>
                    <ul className="space-y-2">
                      {summary.strengths.map((strength, idx) => (
                        <li key={idx} className="flex gap-2 text-sm text-gray-300">
                          <span className="text-green-400">•</span>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Concerns */}
                {summary.concerns.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-yellow-400 mb-3 flex items-center gap-2">
                      <AlertTriangle size={16} />
                      Concerns
                    </h3>
                    <ul className="space-y-2">
                      {summary.concerns.map((concern, idx) => (
                        <li key={idx} className="flex gap-2 text-sm text-gray-300">
                          <span className="text-yellow-400">•</span>
                          <span>{concern}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => navigate('/bulk-upload')}
            className="flex items-center gap-2 px-6 py-3 bg-[#262828] hover:bg-[#2d3030] rounded-lg font-medium transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Products
          </button>
        </div>
      </div>
    </div>
  );
}
