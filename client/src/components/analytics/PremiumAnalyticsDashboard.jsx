/**
 * Premium Analytics Dashboard
 * 
 * Displays 3 interactive charts + KPI cards for bulk uploaded products:
 * 1. Inventory Aging Analysis (Line Chart)
 * 2. Profitability Distribution (Bar Chart)
 * 3. Risk vs. Profit Quadrant (Scatter Plot)
 * 
 * Features:
 * - Interactive charts with hover tooltips
 * - Cross-filtering (click chart → filter table)
 * - Export capabilities (PNG, CSV, PDF)
 * - Responsive design
 * - Professional SaaS appearance
 */

import React, { useState, useMemo } from 'react';
import { ArrowLeft, Settings, Download, FileDown, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import KPISummaryCards from './KPISummaryCards';
import InventoryAgingChart from './InventoryAgingChart';
import ProfitabilityDistributionChart from './ProfitabilityDistributionChart';
import RiskProfitScatterChart from './RiskProfitScatterChart';

export default function PremiumAnalyticsDashboard({ products = [] }) {
  const navigate = useNavigate();
  const [filterCriteria, setFilterCriteria] = useState(null);

  // Calculate risk score for each product
  const productsWithRisk = useMemo(() => {
    return products.map(product => {
      const risk = calculateRiskScore(product);
      return { ...product, riskScore: risk };
    });
  }, [products]);

  // Filter products based on current filter criteria
  const filteredProducts = useMemo(() => {
    if (!filterCriteria) return productsWithRisk;

    switch (filterCriteria.type) {
      case 'ageBucket':
        return productsWithRisk.filter(p => {
          const days = p.daysInStock || 0;
          const { min, max } = filterCriteria;
          return days >= min && (max === Infinity ? true : days <= max);
        });
      
      case 'marginBucket':
        return productsWithRisk.filter(p => {
          const margin = calculateMargin(p);
          const { min, max } = filterCriteria;
          return margin >= min && margin < max;
        });
      
      case 'quadrant':
        return productsWithRisk.filter(p => {
          const profit = calculateProfitPerUnit(p);
          const risk = p.riskScore;
          const { quadrant } = filterCriteria;
          
          // Quadrants: safe (low risk), star (high profit), risky (high risk), zombie (low profit)
          if (quadrant === 'star') return risk < 50 && profit > 10;
          if (quadrant === 'safe') return risk < 50 && profit <= 10;
          if (quadrant === 'diamond') return risk >= 50 && profit > 10;
          if (quadrant === 'zombie') return risk >= 50 && profit <= 10;
          return true;
        });
      
      default:
        return productsWithRisk;
    }
  }, [productsWithRisk, filterCriteria]);

  // Handle filter from chart click
  const handleChartFilter = (filter) => {
    setFilterCriteria(filter);
  };

  // Clear filter
  const handleClearFilter = () => {
    setFilterCriteria(null);
  };

  // Export handlers
  const handleExportPNG = () => {
    // TODO: Implement PNG export
    console.log('Export PNG');
  };

  const handleExportCSV = () => {
    // Export filtered products as CSV
    const csv = convertToCSV(filteredProducts);
    downloadCSV(csv, 'analytics-data.csv');
  };

  const handleExportPDF = () => {
    // TODO: Implement PDF export with charts
    console.log('Export PDF');
  };

  // No data state
  if (!products || products.length === 0) {
    return (
      <div className="min-h-screen bg-[#1A1C1C] text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <button
              onClick={() => navigate('/bulk-upload')}
              className="flex items-center gap-2 px-4 py-2 bg-[#262828] hover:bg-[#2d3030] rounded-lg text-sm font-medium transition-colors"
            >
              <ArrowLeft size={16} />
              Back
            </button>
          </div>
          
          <div className="bg-[#1F2121] rounded-lg border border-gray-800 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-500" />
              </div>
              <h2 className="text-xl font-semibold mb-2">No Data Available</h2>
              <p className="text-gray-400 mb-6">
                Upload products first to see analytics and insights.
              </p>
              <button
                onClick={() => navigate('/bulk-upload')}
                className="px-6 py-3 bg-[#32808D] hover:bg-[#2a6d7a] rounded-lg font-medium transition-colors"
              >
                Upload Products
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1C1C] text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
            <p className="text-gray-400">
              {filteredProducts.length} of {products.length} products
              {filterCriteria && ' (filtered)'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {filterCriteria && (
              <button
                onClick={handleClearFilter}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors"
              >
                Clear Filter
              </button>
            )}
            <button
              onClick={() => navigate('/bulk-upload')}
              className="flex items-center gap-2 px-4 py-2 bg-[#262828] hover:bg-[#2d3030] rounded-lg text-sm font-medium transition-colors"
            >
              <ArrowLeft size={16} />
              Back
            </button>
            <button
              className="flex items-center justify-center w-10 h-10 bg-[#262828] hover:bg-[#2d3030] rounded-lg transition-colors"
            >
              <Settings size={18} />
            </button>
          </div>
        </div>

        {/* KPI Summary Cards */}
        <KPISummaryCards products={productsWithRisk} />

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Chart 1: Inventory Aging */}
          <InventoryAgingChart 
            products={productsWithRisk}
            onFilter={handleChartFilter}
          />

          {/* Chart 2: Profitability Distribution */}
          <ProfitabilityDistributionChart 
            products={productsWithRisk}
            onFilter={handleChartFilter}
          />
        </div>

        {/* Chart 3: Risk vs. Profit Scatter (Full Width) */}
        <RiskProfitScatterChart 
          products={productsWithRisk}
          onFilter={handleChartFilter}
        />

        {/* Export Actions */}
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            onClick={handleExportPNG}
            className="flex items-center gap-2 px-4 py-2 bg-[#262828] hover:bg-[#2d3030] rounded-lg text-sm font-medium transition-colors"
          >
            <Download size={16} />
            Export PNG
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-[#262828] hover:bg-[#2d3030] rounded-lg text-sm font-medium transition-colors"
          >
            <FileDown size={16} />
            Export CSV
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-[#32808D] hover:bg-[#2a6d7a] rounded-lg text-sm font-medium transition-colors"
          >
            <FileText size={16} />
            Export Report (PDF)
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Calculate risk score for a product
 * Formula: (1 - margin/100) * 0.4 + (daysInStock/180) * 0.4 + ((100 - quantity)/100) * 0.2
 * Result: 0-100 (higher = more risky)
 */
function calculateRiskScore(product) {
  const margin = calculateMargin(product);
  const daysInStock = product.daysInStock || 0;
  const quantity = product.quantity || 0;

  const marginRisk = (1 - margin / 100) * 0.4;
  const ageRisk = (daysInStock / 180) * 0.4;
  const quantityRisk = ((100 - quantity) / 100) * 0.2;

  const risk = (marginRisk + ageRisk + quantityRisk) * 100;
  
  // Clamp to 0-100
  return Math.max(0, Math.min(100, risk));
}

/**
 * Calculate profit per unit
 */
function calculateProfitPerUnit(product) {
  const { sellingPrice, cost, fbaFees = 0, vatRate = 0.19 } = product;
  
  if (!sellingPrice || !cost) return 0;
  
  const profitPerUnit = sellingPrice - cost - fbaFees - (sellingPrice * vatRate);
  return parseFloat(profitPerUnit.toFixed(2));
}

/**
 * Calculate margin percentage
 */
function calculateMargin(product) {
  const { sellingPrice, cost, fbaFees = 0 } = product;
  
  if (!sellingPrice || sellingPrice <= 0) return 0;
  
  const profitPerUnit = sellingPrice - cost - fbaFees;
  const margin = (profitPerUnit / sellingPrice) * 100;
  
  return parseFloat(margin.toFixed(1));
}

/**
 * Convert products array to CSV string
 */
function convertToCSV(products) {
  if (products.length === 0) return '';

  const headers = ['ASIN', 'Category', 'Cost', 'Selling Price', 'Quantity', 'Days in Stock', 'Profit per Unit', 'Margin %', 'Risk Score'];
  const rows = products.map(p => [
    p.asin,
    p.category,
    p.cost,
    p.sellingPrice,
    p.quantity,
    p.daysInStock || 'N/A',
    calculateProfitPerUnit(p),
    calculateMargin(p),
    p.riskScore?.toFixed(1) || 'N/A'
  ]);

  const csv = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  return csv;
}

/**
 * Download CSV file
 */
function downloadCSV(csv, filename) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}
