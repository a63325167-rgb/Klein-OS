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
  Info
} from 'lucide-react';

const ResultsDashboard = ({ result, onReset, onReRun }) => {
  const [selectedShipping, setSelectedShipping] = useState(result.shipping?.chosen || 'smallPackage');
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

  const getAnalysisColor = (category) => {
    const colors = {
      'EXCEPTIONAL': 'text-green-600 dark:text-green-400',
      'GOOD': 'text-green-600 dark:text-green-400',
      'MODERATE': 'text-yellow-600 dark:text-yellow-400',
      'POOR': 'text-orange-600 dark:text-orange-400',
      'CRITICAL': 'text-red-600 dark:text-red-400'
    };
    return colors[category] || 'text-gray-600 dark:text-gray-400';
  };

  const getAnalysisBgColor = (category) => {
    const colors = {
      'EXCEPTIONAL': 'bg-green-50 dark:bg-green-900/20',
      'GOOD': 'bg-green-50 dark:bg-green-900/20',
      'MODERATE': 'bg-yellow-50 dark:bg-yellow-900/20',
      'POOR': 'bg-orange-50 dark:bg-orange-900/20',
      'CRITICAL': 'bg-red-50 dark:bg-red-900/20'
    };
    return colors[category] || 'bg-gray-50 dark:bg-gray-800';
  };

  const getAnalysisBorderColor = (category) => {
    const colors = {
      'EXCEPTIONAL': 'border-green-200 dark:border-green-800',
      'GOOD': 'border-green-200 dark:border-green-800',
      'MODERATE': 'border-yellow-200 dark:border-yellow-800',
      'POOR': 'border-orange-200 dark:border-orange-800',
      'CRITICAL': 'border-red-200 dark:border-red-800'
    };
    return colors[category] || 'border-gray-200 dark:border-gray-700';
  };

  return (
    <div className="space-y-6">
      {/* Eligibility Result */}
      <div className={`rounded-lg border-2 p-6 ${
        result.eligibility 
          ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
          : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
      }`}>
        <div className="flex items-start">
          {result.eligibility ? (
            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 mr-3 flex-shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-6 h-6 text-red-600 dark:text-red-400 mr-3 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <h3 className={`text-lg font-semibold ${
              result.eligibility 
                ? 'text-green-800 dark:text-green-200'
                : 'text-red-800 dark:text-red-200'
            }`}>
              {result.eligibility_message}
            </h3>
            {result.failed_conditions && result.failed_conditions.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-2">
                  Failed conditions:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  {result.failed_conditions.map((condition, index) => (
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

      {/* Summary Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          <span className="w-6 h-6 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mr-3">
            <span className="text-sm">📦</span>
          </span>
          Product Summary
        </h3>
        
        {/* Product Basic Info */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-md font-medium text-gray-900 dark:text-white">Basic Information</h4>
            <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">
              {result.input?.category || 'Uncategorized'}
            </span>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h5 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">
              {result.input?.product_name || 'Unnamed Product'}
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Destination Country:</span>
                <p className="font-medium text-gray-900 dark:text-white">{result.input?.destination_country || 'Not specified'}</p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Weight:</span>
                <p className="font-medium text-gray-900 dark:text-white">{result.input?.weight_kg || 0} kg</p>
              </div>
            </div>
          </div>
        </div>

        {/* Dimensions */}
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Dimensions</h4>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Length</div>
                <div className="font-semibold text-gray-900 dark:text-white">{result.input?.length_cm || 0} cm</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Width</div>
                <div className="font-semibold text-gray-900 dark:text-white">{result.input?.width_cm || 0} cm</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Height</div>
                <div className="font-semibold text-gray-900 dark:text-white">{result.input?.height_cm || 0} cm</div>
              </div>
            </div>
            <div className="mt-3 text-center">
              <span className="text-xs text-gray-500 dark:text-gray-400">Total Volume: </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {((result.input?.length_cm || 0) * (result.input?.width_cm || 0) * (result.input?.height_cm || 0) / 1000).toFixed(2)} L
              </span>
            </div>
          </div>
        </div>

        {/* Pricing Information */}
        <div>
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Pricing Information</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="text-xs text-green-600 dark:text-green-400 mb-1">Buying Price</div>
              <div className="text-xl font-bold text-green-800 dark:text-green-200">
                {formatCurrency(result.input?.buying_price || 0)}
              </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="text-xs text-blue-600 dark:text-blue-400 mb-1">Selling Price</div>
              <div className="text-xl font-bold text-blue-800 dark:text-blue-200">
                {formatCurrency(result.input?.selling_price || 0)}
              </div>
            </div>
          </div>
          
          {/* Price Difference */}
          <div className="mt-4 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Price Difference:</span>
              <span className={`font-semibold ${
                (result.input?.selling_price || 0) > (result.input?.buying_price || 0)
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {formatCurrency((result.input?.selling_price || 0) - (result.input?.buying_price || 0))}
              </span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">Margin:</span>
              <span className={`text-sm font-medium ${
                (result.input?.selling_price || 0) > (result.input?.buying_price || 0)
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {result.input?.buying_price && result.input?.selling_price 
                  ? (((result.input.selling_price - result.input.buying_price) / result.input.buying_price) * 100).toFixed(1)
                  : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Shipping Options */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Truck className="w-5 h-5 mr-2" />
          Shipping Options
        </h3>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {result.shipping?.intelligence}
          </p>
        </div>

        <div className="space-y-3">
          {result.shipping?.alternatives?.map((option, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedShipping === option.type.toLowerCase()
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              onClick={() => setSelectedShipping(option.type.toLowerCase())}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {option.type}
                    </span>
                    {option.savings && (
                      <span className="ml-2 px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full">
                        Save {formatCurrency(option.savings)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {option.description}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(option.cost)}
                  </div>
                  {option.speed && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {option.speed}
                    </div>
                  )}
                  {option.tag && (
                    <div className="text-xs text-primary-600 dark:text-primary-400">
                      {option.tag}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fees & Costs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Euro className="w-5 h-5 mr-2" />
          Fees & Costs
        </h3>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Shipping Cost:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatCurrency(result.totals?.shipping_cost || 0)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Amazon Fee ({result.fees?.amazon_fee_percent}%):</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatCurrency(result.fees?.amazon_fee || 0)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">VAT ({result.fees?.vat_rate}%):</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatCurrency(result.fees?.vat_amount || 0)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Return Buffer:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatCurrency(result.fees?.return_buffer || 0)}
            </span>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
            <div className="flex justify-between text-lg font-semibold">
              <span className="text-gray-900 dark:text-white">Total Cost:</span>
              <span className="text-gray-900 dark:text-white">
                {formatCurrency(result.totals?.total_cost || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Profit Analysis */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          Profit Analysis
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(result.totals?.net_profit || 0)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Net Profit</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {result.totals?.roi_percent?.toFixed(1) || 0}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">ROI</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(result.totals?.profit_per_unit || 0)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Profit per Unit</div>
          </div>
        </div>
      </div>

      {/* Analysis & Insights */}
      {result.analysis && (
        <div className={`rounded-lg border-2 p-6 ${getAnalysisBgColor(result.analysis.category)} ${getAnalysisBorderColor(result.analysis.category)}`}>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <Info className="w-5 h-5 mr-2" />
            Analysis & Insights
          </h3>
          <div className={`text-sm ${getAnalysisColor(result.analysis.category)}`}>
            {result.analysis.text}
          </div>
        </div>
      )}

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

export default ResultsDashboard;

