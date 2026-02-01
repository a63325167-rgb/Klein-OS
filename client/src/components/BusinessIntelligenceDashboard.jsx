import React, { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Truck, 
  Euro, 
  TrendingUp, 
  Download, 
  RotateCcw,
  Copy,
  AlertTriangle,
  Info,
  Star,
  Target,
  Shield,
  Clock,
  BarChart3,
  Lightbulb,
  Save,
  FileText
} from 'lucide-react';

const BusinessIntelligenceDashboard = ({ result, onReset, onReRun }) => {
  const [copied, setCopied] = useState(false);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getPerformanceColor = (tier) => {
    const colors = {
      'EXCEPTIONAL': 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20',
      'EXCELLENT': 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20',
      'GOOD': 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
      'FAIR': 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20',
      'POOR': 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20',
      'CRITICAL': 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
    };
    return colors[tier] || 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800';
  };

  const getMarginColor = (margin) => {
    if (margin >= 30) return 'text-green-600 dark:text-green-400';
    if (margin >= 25) return 'text-green-600 dark:text-green-400';
    if (margin >= 18) return 'text-blue-600 dark:text-blue-400';
    if (margin >= 12) return 'text-yellow-600 dark:text-yellow-400';
    if (margin >= 0) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Small Package Eligibility Status */}
      <div className={`rounded-lg border-2 p-6 ${
        result.smallPackageCheck.isEligible 
          ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
          : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
      }`}>
        <div className="flex items-start">
          {result.smallPackageCheck.isEligible ? (
            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 mr-3 flex-shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-6 h-6 text-red-600 dark:text-red-400 mr-3 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <h3 className={`text-lg font-semibold ${
              result.smallPackageCheck.isEligible 
                ? 'text-green-800 dark:text-green-200'
                : 'text-red-800 dark:text-red-200'
            }`}>
              {result.smallPackageCheck.message}
            </h3>
            {!result.smallPackageCheck.isEligible && result.smallPackageCheck.failedConditions.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-2">
                  Issues to resolve:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  {result.smallPackageCheck.failedConditions.map((condition, index) => (
                    <li key={index} className="text-sm text-red-600 dark:text-red-400">
                      {condition}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Performance Tier */}
      <div className={`rounded-lg border-2 p-6 ${getPerformanceColor(result.performanceTier.tier)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-2xl mr-3">{result.performanceTier.emoji}</span>
            <div>
              <h3 className="text-lg font-semibold">
                {result.performanceTier.tier} Performance
              </h3>
              <p className="text-sm opacity-75">
                {result.businessIntelligence.marketPosition} market positioning
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${getMarginColor(result.profitability.profitMargin)}`}>
              {result.profitability.profitMargin.toFixed(1)}%
            </div>
            <div className="text-sm opacity-75">Profit Margin</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                result.profitability.profitMargin >= 30 ? 'bg-green-500' :
                result.profitability.profitMargin >= 25 ? 'bg-green-400' :
                result.profitability.profitMargin >= 18 ? 'bg-blue-500' :
                result.profitability.profitMargin >= 12 ? 'bg-yellow-500' :
                result.profitability.profitMargin >= 0 ? 'bg-orange-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(Math.max(result.profitability.profitMargin, 0), 50)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Net Profit</p>
              <p className={`text-xl font-bold ${getMarginColor(result.profitability.netProfit)}`}>
                {formatCurrency(result.profitability.netProfit)}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">ROI</p>
              <p className={`text-xl font-bold ${getMarginColor(result.profitability.roi)}`}>
                {result.profitability.roi.toFixed(1)}%
              </p>
            </div>
            <Target className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Cost</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(result.calculations.totalCost)}
              </p>
            </div>
            <Euro className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Shipping</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(result.shipping.cost)}
              </p>
            </div>
            <Truck className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>
        </div>
      </div>

      {/* Shipping Analysis */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Truck className="w-5 h-5 mr-2" />
          Shipping Analysis
        </h3>
        
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-gray-900 dark:text-white">
              Recommended: {result.shipping.type}
            </span>
            <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
              {formatCurrency(result.shipping.cost)}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {result.shipping.reason}
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-gray-900 dark:text-white">Cost Breakdown:</h4>
          {result.shipping.breakdown.map((item, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">{item.item}</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatCurrency(item.cost)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2" />
          Cost Breakdown
        </h3>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Amazon Fee ({result.amazonFee.rate}%):</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatCurrency(result.amazonFee.amount)}
            </span>
          </div>
          
          {/* VAT Breakdown - EU Methodology */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              VAT Breakdown ({result.vat.rate}%)
            </div>
            <div className="space-y-2 pl-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Output VAT (collected)</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatCurrency(result.vat.outputVAT || 0)}
            </span>
          </div>
          <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Input VAT (reclaimable)</span>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  -{formatCurrency(result.vat.inputVAT || 0)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Net VAT Liability</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {formatCurrency(result.vat.netVATLiability || result.vat.amount || 0)}
            </span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Return Buffer:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatCurrency(result.returnBuffer)}
            </span>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
            <div className="flex justify-between text-lg font-semibold">
              <span className="text-gray-900 dark:text-white">Total Costs:</span>
              <span className="text-gray-900 dark:text-white">
                {formatCurrency(result.calculations?.totalCost || result.totals?.total_cost || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Business Intelligence */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Lightbulb className="w-5 h-5 mr-2" />
          Business Intelligence
        </h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Insights:</h4>
            <ul className="space-y-1">
              {result.businessIntelligence.insights.map((insight, index) => (
                <li key={index} className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                  <Info className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  {insight}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Recommendations:</h4>
            <ul className="space-y-1">
              {result.businessIntelligence.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                  <Target className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  {recommendation}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={onReRun}
          className="btn-primary flex items-center"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Re-run Analysis
        </button>
        
        <button
          onClick={() => copyToClipboard(JSON.stringify(result, null, 2))}
          className="btn-secondary flex items-center"
        >
          <Copy className="w-4 h-4 mr-2" />
          {copied ? 'Copied!' : 'Copy Results'}
        </button>
        
        <button
          className="btn-secondary flex items-center"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Analysis
        </button>
        
        <button
          className="btn-secondary flex items-center"
        >
          <FileText className="w-4 h-4 mr-2" />
          Export PDF
        </button>
        
        <button
          onClick={onReset}
          className="btn-secondary flex items-center"
        >
          <XCircle className="w-4 h-4 mr-2" />
          Reset Form
        </button>
      </div>
    </div>
  );
};

export default BusinessIntelligenceDashboard;
