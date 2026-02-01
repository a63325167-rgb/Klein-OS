/**
 * Inventory Aging Analysis Chart
 * 
 * Line chart showing distribution of products by days in stock
 * Buckets: 0-30, 31-60, 61-90, 91-120, 120+ days
 * 
 * Purpose: Identify which products are selling vs. sitting idle
 */

import React, { useMemo, useRef, useEffect } from 'react';
import { Info } from 'lucide-react';

export default function InventoryAgingChart({ products = [], onFilter }) {
  const canvasRef = useRef(null);

  // Process data into buckets
  const chartData = useMemo(() => {
    const buckets = [
      { label: '0-30 days', min: 0, max: 30, count: 0 },
      { label: '31-60 days', min: 31, max: 60, count: 0 },
      { label: '61-90 days', min: 61, max: 90, count: 0 },
      { label: '91-120 days', min: 91, max: 120, count: 0 },
      { label: '120+ days', min: 121, max: Infinity, count: 0 }
    ];

    products.forEach(product => {
      const days = product.daysInStock || 0;
      const bucket = buckets.find(b => days >= b.min && days <= b.max);
      if (bucket) {
        bucket.count++;
      }
    });

    return buckets;
  }, [products]);

  // Generate insight message
  const insightMessage = useMemo(() => {
    const total = products.length;
    if (total === 0) return '';

    const fresh = chartData[0].count + chartData[1].count; // 0-60 days
    const old = chartData[4].count; // 120+ days

    if (fresh / total > 0.7) {
      return '✓ Portfolio is fresh—good velocity';
    } else if (old / total > 0.3) {
      return '⚠️ Old inventory alert—consider discounting';
    } else {
      return 'Mixed age distribution across portfolio';
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

    // Draw line chart
    const points = chartData.map((d, i) => {
      const x = padding.left + (chartWidth * i / (chartData.length - 1));
      const y = padding.top + chartHeight - (chartHeight * d.count / maxCount);
      return { x, y, count: d.count };
    });

    // Draw line
    ctx.strokeStyle = '#32808D';
    ctx.lineWidth = 3;
    ctx.beginPath();
    points.forEach((point, i) => {
      if (i === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.stroke();

    // Draw markers
    points.forEach((point, i) => {
      // Outer circle
      ctx.fillStyle = '#32808D';
      ctx.beginPath();
      ctx.arc(point.x, point.y, 6, 0, 2 * Math.PI);
      ctx.fill();

      // Inner circle
      ctx.fillStyle = '#1A1C1C';
      ctx.beginPath();
      ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Draw labels
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';
    chartData.forEach((d, i) => {
      const x = padding.left + (chartWidth * i / (chartData.length - 1));
      const y = padding.top + chartHeight + 20;
      ctx.fillText(d.label, x, y);
    });

    // Draw Y-axis labels
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

    // Determine which bucket was clicked
    const bucketIndex = Math.floor((x - padding.left) / (chartWidth / chartData.length));
    
    if (bucketIndex >= 0 && bucketIndex < chartData.length) {
      const bucket = chartData[bucketIndex];
      onFilter({
        type: 'ageBucket',
        min: bucket.min,
        max: bucket.max,
        label: bucket.label
      });
    }
  };

  return (
    <div className="bg-[#1F2121] rounded-lg border border-gray-800 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">Inventory Aging Analysis</h3>
          <p className="text-sm text-gray-400">Products by days in stock</p>
        </div>
        <div className="p-2 rounded-lg bg-[#32808D]/10 text-[#32808D]">
          <Info size={18} />
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
      <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#32808D]"></div>
          <span>Product Count</span>
        </div>
      </div>
    </div>
  );
}
