/**
 * Profitability Distribution Chart
 * 
 * Bar chart showing distribution of products by profit margin %
 * Buckets: 0-10%, 11-20%, 21-30%, 31-40%, 40%+
 * 
 * Purpose: Show spread of profit margins across portfolio
 */

import React, { useMemo, useRef, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';

export default function ProfitabilityDistributionChart({ products = [], onFilter }) {
  const canvasRef = useRef(null);

  // Calculate margin for a product
  const calculateMargin = (product) => {
    const { sellingPrice, cost, fbaFees = 0 } = product;
    
    if (!sellingPrice || sellingPrice <= 0) return 0;
    
    const profitPerUnit = sellingPrice - cost - fbaFees;
    const margin = (profitPerUnit / sellingPrice) * 100;
    
    return parseFloat(margin.toFixed(1));
  };

  // Calculate profit per unit
  const calculateProfitPerUnit = (product) => {
    const { sellingPrice, cost, fbaFees = 0, vatRate = 0.19 } = product;
    
    if (!sellingPrice || !cost) return 0;
    
    const profitPerUnit = sellingPrice - cost - fbaFees - (sellingPrice * vatRate);
    return parseFloat(profitPerUnit.toFixed(2));
  };

  // Process data into buckets
  const chartData = useMemo(() => {
    const buckets = [
      { label: '0-10%', min: 0, max: 10, count: 0, totalProfit: 0, color: '#EF4444' }, // Red
      { label: '11-20%', min: 11, max: 20, count: 0, totalProfit: 0, color: '#F97316' }, // Orange
      { label: '21-30%', min: 21, max: 30, count: 0, totalProfit: 0, color: '#EAB308' }, // Yellow
      { label: '31-40%', min: 31, max: 40, count: 0, totalProfit: 0, color: '#32808D' }, // Teal
      { label: '40%+', min: 41, max: Infinity, count: 0, totalProfit: 0, color: '#22C55E' } // Green
    ];

    products.forEach(product => {
      const margin = calculateMargin(product);
      const profit = calculateProfitPerUnit(product);
      
      const bucket = buckets.find(b => margin >= b.min && margin <= b.max);
      if (bucket) {
        bucket.count++;
        bucket.totalProfit += profit;
      }
    });

    // Calculate average profit per bucket
    buckets.forEach(bucket => {
      bucket.avgProfit = bucket.count > 0 ? bucket.totalProfit / bucket.count : 0;
    });

    return buckets;
  }, [products]);

  // Generate insight message
  const insightMessage = useMemo(() => {
    const total = products.length;
    if (total === 0) return '';

    const lowMargin = chartData[0].count + chartData[1].count; // 0-20%
    const highMargin = chartData[3].count + chartData[4].count; // 31%+

    if (lowMargin / total > 0.8) {
      return '⚠️ 80% of products under 20% margin—consider sourcing differently';
    } else if (highMargin / total > 0.5) {
      return '🎯 Premium segment performing well';
    } else {
      return '✓ Healthy mix of products across margins';
    }
  }, [chartData, products.length]);

  // Draw chart
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    // Set canvas size
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Chart dimensions
    const padding = { top: 20, right: 20, bottom: 60, left: 50 };
    const chartWidth = rect.width - padding.left - padding.right;
    const chartHeight = rect.height - padding.top - padding.bottom;

    // Find max count for scaling
    const maxCount = Math.max(...chartData.map(d => d.count), 1);

    // Draw grid lines
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (chartHeight * i / 5);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartWidth, y);
      ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = '#4B5563';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, padding.top + chartHeight);
    ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight);
    ctx.stroke();

    // Draw bars
    const barWidth = chartWidth / (chartData.length * 1.5);
    const barSpacing = barWidth * 0.5;

    chartData.forEach((d, i) => {
      const x = padding.left + (i * (barWidth + barSpacing)) + barSpacing / 2;
      const barHeight = (chartHeight * d.count) / maxCount;
      const y = padding.top + chartHeight - barHeight;

      // Draw bar
      ctx.fillStyle = d.color;
      ctx.fillRect(x, y, barWidth, barHeight);

      // Draw count label on top of bar
      if (d.count > 0) {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(d.count.toString(), x + barWidth / 2, y - 5);
      }
    });

    // Draw X-axis labels
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';
    chartData.forEach((d, i) => {
      const x = padding.left + (i * (barWidth + barSpacing)) + barSpacing / 2 + barWidth / 2;
      const y = padding.top + chartHeight + 20;
      ctx.fillText(d.label, x, y);
      
      // Draw average profit below
      if (d.avgProfit > 0) {
        ctx.font = '10px Inter, sans-serif';
        ctx.fillStyle = '#6B7280';
        ctx.fillText(`Avg: €${d.avgProfit.toFixed(2)}`, x, y + 15);
      }
    });

    // Draw Y-axis labels
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const value = Math.round((maxCount * (5 - i)) / 5);
      const y = padding.top + (chartHeight * i / 5) + 4;
      ctx.fillText(value.toString(), padding.left - 10, y);
    }

  }, [chartData]);

  // Handle click on chart
  const handleChartClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas || !onFilter) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const padding = { left: 50, right: 20 };
    const chartWidth = rect.width - padding.left - padding.right;
    const barWidth = chartWidth / (chartData.length * 1.5);
    const barSpacing = barWidth * 0.5;

    // Determine which bar was clicked
    const clickedIndex = Math.floor((x - padding.left - barSpacing / 2) / (barWidth + barSpacing));
    
    if (clickedIndex >= 0 && clickedIndex < chartData.length) {
      const bucket = chartData[clickedIndex];
      onFilter({
        type: 'marginBucket',
        min: bucket.min,
        max: bucket.max === Infinity ? 100 : bucket.max,
        label: bucket.label
      });
    }
  };

  return (
    <div className="bg-[#1F2121] rounded-lg border border-gray-800 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">Profitability Distribution</h3>
          <p className="text-sm text-gray-400">Products by profit margin %</p>
        </div>
        <div className="p-2 rounded-lg bg-[#32808D]/10 text-[#32808D]">
          <TrendingUp size={18} />
        </div>
      </div>

      {/* Chart */}
      <div className="relative" style={{ height: '250px' }}>
        <canvas
          ref={canvasRef}
          onClick={handleChartClick}
          className="w-full h-full cursor-pointer"
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* Insight Message */}
      {insightMessage && (
        <div className="mt-4 p-3 rounded-lg bg-gray-800/50 border border-gray-700">
          <p className="text-sm text-gray-300">{insightMessage}</p>
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-400">
        {chartData.map((bucket, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: bucket.color }}></div>
            <span>{bucket.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
