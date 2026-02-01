/**
 * Audit Product Table - Phase 1 E-Commerce Audit Agent
 * 
 * Transforms basic product table into an intelligent audit hub with:
 * - Calculated columns (Profit/Unit, Margin%, Annual Profit, Risk Level)
 * - Sortable headers with visual indicators
 * - Filter bar (At Risk, Healthy, Opportunities)
 * - Bulk selection and actions
 * - Color-coded risk indicators
 * - Row expansion for detailed view
 * - Responsive layout
 */

import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Download, Tag, Target, Check, X } from 'lucide-react';

export default function AuditProductTable({ products = [] }) {
  const [sortConfig, setSortConfig] = useState({ key: 'margin', direction: 'desc' });
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'at-risk', 'healthy', 'opportunities'
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [expandedRow, setExpandedRow] = useState(null);

  // Calculate enhanced product data with audit metrics
  const enhancedProducts = useMemo(() => {
    return products.map(product => {
      const cost = product.cost || 0;
      const sellingPrice = product.sellingPrice || 0;
      const quantity = product.quantity || 0;
      const daysInStock = product.daysInStock;

      // Profit per Unit
      const profitPerUnit = sellingPrice - cost;

      // Margin %
      const margin = sellingPrice > 0 ? ((profitPerUnit / sellingPrice) * 100) : 0;

      // Annual Profit Potential
      let annualProfit = null;
      if (daysInStock && daysInStock > 0) {
        annualProfit = (profitPerUnit * quantity * 365) / daysInStock;
      }

      // Risk Level Logic
      let riskLevel = 'green'; // Default: Healthy
      let riskLabel = 'Healthy';
      
      if ((daysInStock > 180 && margin < 15) || margin < 10) {
        riskLevel = 'red';
        riskLabel = 'At Risk';
      } else if ((daysInStock > 90 && margin < 20) || (annualProfit !== null && annualProfit < 500)) {
        riskLevel = 'yellow';
        riskLabel = 'Monitor';
      }

      // Opportunity flag
      const isOpportunity = margin > 30 && (daysInStock === null || daysInStock < 90);

      return {
        ...product,
        profitPerUnit,
        margin,
        annualProfit,
        riskLevel,
        riskLabel,
        isOpportunity
      };
    });
  }, [products]);

  // Filter products based on selected filter
  const filteredProducts = useMemo(() => {
    switch (filterMode) {
      case 'at-risk':
        return enhancedProducts.filter(p => p.riskLevel === 'red');
      case 'healthy':
        return enhancedProducts.filter(p => p.riskLevel === 'green');
      case 'opportunities':
        return enhancedProducts.filter(p => p.isOpportunity);
      default:
        return enhancedProducts;
    }
  }, [enhancedProducts, filterMode]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    
    sorted.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Handle null/undefined values
      if (aValue === null || aValue === undefined) aValue = -Infinity;
      if (bValue === null || bValue === undefined) bValue = -Infinity;

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredProducts, sortConfig]);

  // Handle sort
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Handle select all
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedProducts(new Set(sortedProducts.map(p => p.asin)));
    } else {
      setSelectedProducts(new Set());
    }
  };

  // Handle select product
  const handleSelectProduct = (asin) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(asin)) {
      newSelected.delete(asin);
    } else {
      newSelected.add(asin);
    }
    setSelectedProducts(newSelected);
  };

  // Handle export selected
  const handleExportSelected = () => {
    const selectedData = sortedProducts.filter(p => selectedProducts.has(p.asin));
    const csv = convertToCSV(selectedData);
    downloadCSV(csv, 'selected-products.csv');
  };

  // Get margin color
  const getMarginColor = (margin) => {
    if (margin > 30) return 'text-green-400';
    if (margin >= 20) return 'text-gray-300';
    if (margin >= 10) return 'text-orange-400';
    return 'text-red-400';
  };

  // Get risk badge
  const getRiskBadge = (riskLevel, riskLabel) => {
    const colors = {
      green: 'bg-green-500/10 text-green-400 border-green-500/20',
      yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      red: 'bg-red-500/10 text-red-400 border-red-500/20'
    };

    const icons = {
      green: '🟢',
      yellow: '🟡',
      red: '🔴'
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${colors[riskLevel]}`}>
        <span>{icons[riskLevel]}</span>
        <span>{riskLabel}</span>
      </span>
    );
  };

  // Count by filter
  const counts = useMemo(() => ({
    atRisk: enhancedProducts.filter(p => p.riskLevel === 'red').length,
    healthy: enhancedProducts.filter(p => p.riskLevel === 'green').length,
    opportunities: enhancedProducts.filter(p => p.isOpportunity).length
  }), [enhancedProducts]);

  // Sortable header component
  const SortableHeader = ({ label, sortKey, align = 'left', className = '' }) => {
    const isActive = sortConfig.key === sortKey;
    const alignClass = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';
    
    return (
      <th
        onClick={() => handleSort(sortKey)}
        className={`py-3 px-4 text-sm font-medium text-gray-400 cursor-pointer hover:text-gray-300 transition-colors ${alignClass} ${className}`}
      >
        <div className={`flex items-center gap-1 ${align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : ''}`}>
          <span>{label}</span>
          {isActive && (
            sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
          )}
        </div>
      </th>
    );
  };

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-gray-400">Filter:</span>
        <button
          onClick={() => setFilterMode('all')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            filterMode === 'all'
              ? 'bg-[#32808D] text-white'
              : 'bg-[#262828] text-gray-400 hover:bg-[#2d3030]'
          }`}
        >
          Show All ({enhancedProducts.length})
        </button>
        <button
          onClick={() => setFilterMode('at-risk')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            filterMode === 'at-risk'
              ? 'bg-red-600 text-white'
              : 'bg-[#262828] text-gray-400 hover:bg-[#2d3030]'
          }`}
        >
          At Risk ({counts.atRisk})
        </button>
        <button
          onClick={() => setFilterMode('healthy')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            filterMode === 'healthy'
              ? 'bg-green-600 text-white'
              : 'bg-[#262828] text-gray-400 hover:bg-[#2d3030]'
          }`}
        >
          Healthy ({counts.healthy})
        </button>
        <button
          onClick={() => setFilterMode('opportunities')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            filterMode === 'opportunities'
              ? 'bg-[#32808D] text-white'
              : 'bg-[#262828] text-gray-400 hover:bg-[#2d3030]'
          }`}
        >
          Opportunities ({counts.opportunities})
        </button>
      </div>

      {/* Bulk Actions Bar */}
      {selectedProducts.size > 0 && (
        <div className="bg-[#262828] rounded-lg p-4 flex items-center justify-between">
          <span className="text-sm text-gray-300">
            {selectedProducts.size} product{selectedProducts.size > 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-3 py-1.5 bg-[#1F2121] hover:bg-[#2d3030] rounded-lg text-sm font-medium transition-colors">
              <Tag size={14} />
              Tag as...
            </button>
            <button
              onClick={handleExportSelected}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#1F2121] hover:bg-[#2d3030] rounded-lg text-sm font-medium transition-colors"
            >
              <Download size={14} />
              Export Selected
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-[#32808D] hover:bg-[#2a6d7a] rounded-lg text-sm font-medium transition-colors">
              <Target size={14} />
              Audit Focus
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="py-3 px-4 text-left">
                <input
                  type="checkbox"
                  checked={selectedProducts.size === sortedProducts.length && sortedProducts.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-[#32808D] focus:ring-[#32808D] focus:ring-offset-gray-900"
                />
              </th>
              <SortableHeader label="ASIN" sortKey="asin" className="hidden md:table-cell" />
              <SortableHeader label="Category" sortKey="category" className="hidden lg:table-cell" />
              <SortableHeader label="Cost (€)" sortKey="cost" align="right" className="hidden lg:table-cell" />
              <SortableHeader label="Price (€)" sortKey="sellingPrice" align="right" className="hidden lg:table-cell" />
              <SortableHeader label="Qty" sortKey="quantity" align="right" className="hidden md:table-cell" />
              <SortableHeader label="Profit/Unit" sortKey="profitPerUnit" align="right" />
              <SortableHeader label="Margin %" sortKey="margin" align="right" />
              <SortableHeader label="Days in Stock" sortKey="daysInStock" align="right" className="hidden xl:table-cell" />
              <SortableHeader label="Annual Profit" sortKey="annualProfit" align="right" className="hidden xl:table-cell" />
              <SortableHeader label="Status" sortKey="riskLevel" align="center" className="hidden md:table-cell" />
              <SortableHeader label="Risk" sortKey="riskLevel" align="center" />
            </tr>
          </thead>
          <tbody>
            {sortedProducts.map((product, index) => (
              <React.Fragment key={product.asin || index}>
                <tr
                  className={`border-b border-gray-800 hover:bg-[#262828] transition-colors cursor-pointer ${
                    selectedProducts.has(product.asin) ? 'bg-[#262828]' : ''
                  }`}
                  onClick={() => setExpandedRow(expandedRow === product.asin ? null : product.asin)}
                >
                  <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedProducts.has(product.asin)}
                      onChange={() => handleSelectProduct(product.asin)}
                      className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-[#32808D] focus:ring-[#32808D] focus:ring-offset-gray-900"
                    />
                  </td>
                  <td className="py-3 px-4 text-sm font-mono text-gray-400 hidden md:table-cell">{product.asin}</td>
                  <td className="py-3 px-4 text-sm text-gray-400 hidden lg:table-cell">{product.category}</td>
                  <td className="py-3 px-4 text-sm text-right font-mono hidden lg:table-cell">€{product.cost?.toFixed(2) || '0.00'}</td>
                  <td className="py-3 px-4 text-sm text-right font-mono hidden lg:table-cell">€{product.sellingPrice?.toFixed(2) || '0.00'}</td>
                  <td className="py-3 px-4 text-sm text-right font-mono hidden md:table-cell">{product.quantity || 0}</td>
                  <td className="py-3 px-4 text-sm text-right font-mono text-white font-semibold">
                    €{product.profitPerUnit.toFixed(2)}
                  </td>
                  <td className={`py-3 px-4 text-sm text-right font-mono font-semibold ${getMarginColor(product.margin)}`}>
                    {product.margin.toFixed(1)}%
                  </td>
                  <td className="py-3 px-4 text-sm text-right font-mono text-gray-400 hidden xl:table-cell">
                    {product.daysInStock !== null && product.daysInStock !== undefined 
                      ? `${product.daysInStock} days` 
                      : 'N/A'}
                  </td>
                  <td className="py-3 px-4 text-sm text-right font-mono text-gray-400 hidden xl:table-cell">
                    {product.annualProfit !== null 
                      ? `€${product.annualProfit.toFixed(0)}/yr` 
                      : 'N/A'}
                  </td>
                  <td className="py-3 px-4 text-center hidden md:table-cell">
                    <span className="inline-flex items-center gap-1 text-sm text-green-400">
                      <Check size={14} />
                      <span>Valid</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {getRiskBadge(product.riskLevel, product.riskLabel)}
                  </td>
                </tr>

                {/* Expanded Row Details */}
                {expandedRow === product.asin && (
                  <tr className="bg-[#1A1C1C] border-b border-gray-800">
                    <td colSpan="12" className="py-4 px-6">
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">ASIN:</span>
                          <p className="font-mono text-white">{product.asin}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Category:</span>
                          <p className="text-white">{product.category}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Cost:</span>
                          <p className="font-mono text-white">€{product.cost?.toFixed(2)}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Selling Price:</span>
                          <p className="font-mono text-white">€{product.sellingPrice?.toFixed(2)}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Quantity:</span>
                          <p className="font-mono text-white">{product.quantity}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Days in Stock:</span>
                          <p className="font-mono text-white">
                            {product.daysInStock !== null && product.daysInStock !== undefined 
                              ? product.daysInStock 
                              : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-400">Profit/Unit:</span>
                          <p className="font-mono text-green-400 font-semibold">€{product.profitPerUnit.toFixed(2)}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Margin:</span>
                          <p className={`font-mono font-semibold ${getMarginColor(product.margin)}`}>
                            {product.margin.toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-400">Annual Profit:</span>
                          <p className="font-mono text-white">
                            {product.annualProfit !== null 
                              ? `€${product.annualProfit.toFixed(0)}` 
                              : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-400">Inventory Value:</span>
                          <p className="font-mono text-white">
                            €{((product.cost || 0) * (product.quantity || 0)).toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-3">
                        <button className="px-3 py-1.5 bg-[#32808D] hover:bg-[#2a6d7a] rounded text-xs font-medium transition-colors">
                          Review
                        </button>
                        <button className="px-3 py-1.5 bg-[#262828] hover:bg-[#2d3030] rounded text-xs font-medium transition-colors">
                          Optimize
                        </button>
                        <button className="px-3 py-1.5 bg-[#262828] hover:bg-[#2d3030] rounded text-xs font-medium transition-colors">
                          Monitor
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Results Summary */}
      <div className="text-sm text-gray-400 text-center">
        Showing {sortedProducts.length} of {enhancedProducts.length} products
      </div>
    </div>
  );
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function convertToCSV(products) {
  const headers = [
    'ASIN', 'Category', 'Cost', 'Selling Price', 'Quantity', 
    'Days in Stock', 'Profit per Unit', 'Margin %', 'Annual Profit', 
    'Risk Level', 'Status'
  ];
  
  const rows = products.map(p => [
    p.asin,
    p.category,
    p.cost?.toFixed(2) || '0.00',
    p.sellingPrice?.toFixed(2) || '0.00',
    p.quantity || 0,
    p.daysInStock !== null && p.daysInStock !== undefined ? p.daysInStock : 'N/A',
    p.profitPerUnit.toFixed(2),
    p.margin.toFixed(1),
    p.annualProfit !== null ? p.annualProfit.toFixed(0) : 'N/A',
    p.riskLabel,
    'Valid'
  ]);

  return [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
}

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
