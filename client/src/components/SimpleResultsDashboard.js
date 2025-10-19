import React, { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Truck, 
  Euro, 
  TrendingUp, 
  RotateCcw,
  Copy,
  Info
} from 'lucide-react';

const SimpleResultsDashboard = ({ result, onReset, onReRun }) => {
  const [copied, setCopied] = useState(false);

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '€0,00';
    }
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

  const getProfitColor = (margin) => {
    if (margin >= 20) return 'text-green-600 dark:text-green-400';
    if (margin >= 10) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getProfitBgColor = (margin) => {
    if (margin >= 20) return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
    if (margin >= 10) return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
    return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
  };

  if (!result) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📦</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Ready for Analysis?
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Enter your product details to get comprehensive pricing analysis.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Small Package Eligibility */}
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
            {!result.smallPackageCheck.isEligible && result.smallPackageCheck.failures.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-2">
                  Issues to resolve:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  {result.smallPackageCheck.failures.map((failure, index) => (
                    <li key={index} className="text-sm text-red-600 dark:text-red-400">
                      {failure}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Performance Overview */}
      <div className={`rounded-lg border-2 p-6 ${getProfitBgColor(result.totals.profit_margin)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-2xl mr-3">{result.performance.emoji}</span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {result.performance.tier} Performance
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Profit Margin: {result.totals.profit_margin?.toFixed(1)}%
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${getProfitColor(result.totals.profit_margin)}`}>
              {formatCurrency(result.totals.net_profit)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Net Profit</div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">ROI</p>
              <p className={`text-xl font-bold ${getProfitColor(result.totals.roi_percent)}`}>
                {result.totals.roi_percent?.toFixed(1)}%
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Costs</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(result.totals.total_cost)}
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
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="font-medium text-gray-900 dark:text-white">
              {result.shipping.type} Shipping
            </span>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {result.shipping.reason}
            </p>
          </div>
          <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
            {formatCurrency(result.shipping.cost)}
          </span>
        </div>

        {result.smallPackageCheck.isEligible && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
              <span className="text-sm text-green-800 dark:text-green-200">
                Small Package eligible - Save €1.71 vs Standard shipping
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Cost Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Cost Breakdown
        </h3>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Buying Price:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatCurrency(result.input.buying_price)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Amazon Fee ({result.amazonFee.rate}%):</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatCurrency(result.amazonFee.amount)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Shipping Cost:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatCurrency(result.shipping.cost)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">VAT ({result.vat.rate}%):</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatCurrency(result.vat.amount)}
            </span>
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
                {formatCurrency(result.totals.total_cost)}
              </span>
            </div>
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

export default SimpleResultsDashboard;
