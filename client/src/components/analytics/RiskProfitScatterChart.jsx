/**
 * Risk vs. Profit Quadrant Chart
 * 
 * Scatter plot showing risk score vs. profit per unit
 * X-axis: Risk Score (0-100)
 * Y-axis: Profit per Unit (€)
 * Bubble size: Quantity
 * Color: Category
 * 
 * Quadrants:
 * - Top-Left: SAFE (low risk, low profit)
 * - Top-Right: STAR (low risk, high profit) ⭐
 * - Bottom-Left: ZOMBIE (high risk, low profit) 🚨
 * - Bottom-Right: DIAMOND (high risk, high profit) ⚠️
 * 
 * Purpose: Visual portfolio strategy view (classic risk/reward scatter)
 */

import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Target } from 'lucide-react';

export default function RiskProfitScatterChart({ products = [], onFilter }) {
  const canvasRef = useRef(null);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Calculate profit per unit
  const calculateProfitPerUnit = (product) => {
    const { sellingPrice, cost, fbaFees = 0, vatRate = 0.19 } = product;
    
    if (!sellingPrice || !cost) return 0;
    
    const profitPerUnit = sellingPrice - cost - fbaFees - (sellingPrice * vatRate);
    return parseFloat(profitPerUnit.toFixed(2));
  };

  // Get category colors
  const categoryColors = useMemo(() => {
    const categories = [...new Set(products.map(p => p.category))];
    const colors = ['#32808D', '#F97316', '#22C55E', '#EAB308', '#8B5CF6'];
    const colorMap = {};
    
    categories.forEach((cat, i) => {
      colorMap[cat] = i < colors.length ? colors[i] : '#6B7280';
    });
    
    return colorMap;
  }, [products]);

  // Prepare scatter data
  const scatterData = useMemo(() => {
    return products.map(product => ({
      ...product,
      profit: calculateProfitPerUnit(product),
      risk: product.riskScore || 0,
      color: categoryColors[product.category] || '#6B7280'
    }));
  }, [products, categoryColors]);

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
    const padding = { top: 40, right: 40, bottom: 60, left: 60 };
    const chartWidth = rect.width - padding.left - padding.right;
    const chartHeight = rect.height - padding.top - padding.bottom;

    // Find data ranges
    const maxProfit = Math.max(...scatterData.map(d => d.profit), 20);
    const minProfit = Math.min(...scatterData.map(d => d.profit), 0);
    const maxQuantity = Math.max(...scatterData.map(d => d.quantity || 1), 1);

    // Draw grid lines
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;
    
    // Vertical grid lines
    for (let i = 0; i <= 4; i++) {
      const x = padding.left + (chartWidth * i / 4);
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, padding.top + chartHeight);
      ctx.stroke();
    }
    
    // Horizontal grid lines
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartHeight * i / 4);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartWidth, y);
      ctx.stroke();
    }

    // Draw quadrant lines (thicker)
    ctx.strokeStyle = '#4B5563';
    ctx.lineWidth = 2;
    
    // Vertical center line (risk = 50)
    const centerX = padding.left + chartWidth / 2;
    ctx.beginPath();
    ctx.moveTo(centerX, padding.top);
    ctx.lineTo(centerX, padding.top + chartHeight);
    ctx.stroke();
    
    // Horizontal center line (profit = 10)
    const centerY = padding.top + chartHeight - ((10 - minProfit) / (maxProfit - minProfit) * chartHeight);
    ctx.beginPath();
    ctx.moveTo(padding.left, centerY);
    ctx.lineTo(padding.left + chartWidth, centerY);
    ctx.stroke();

    // Draw quadrant labels
    ctx.fillStyle = '#6B7280';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    
    // Top-Left: STEADY SELLERS
    ctx.fillText('STEADY SELLERS', padding.left + chartWidth / 4, padding.top + 20);
    
    // Top-Right: STARS
    ctx.fillStyle = '#22C55E';
    ctx.fillText('⭐ STARS', padding.left + (chartWidth * 3 / 4), padding.top + 20);
    
    // Bottom-Left: ZOMBIES
    ctx.fillStyle = '#EF4444';
    ctx.fillText('🚨 ZOMBIES', padding.left + chartWidth / 4, padding.top + chartHeight - 10);
    
    // Bottom-Right: DIAMONDS
    ctx.fillStyle = '#F97316';
    ctx.fillText('⚠️ DIAMONDS', padding.left + (chartWidth * 3 / 4), padding.top + chartHeight - 10);

    // Draw axes
    ctx.strokeStyle = '#4B5563';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, padding.top + chartHeight);
    ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight);
    ctx.stroke();

    // Draw scatter points
    scatterData.forEach((point, i) => {
      const x = padding.left + (point.risk / 100) * chartWidth;
      const y = padding.top + chartHeight - ((point.profit - minProfit) / (maxProfit - minProfit) * chartHeight);
      const radius = 4 + ((point.quantity || 1) / maxQuantity) * 12; // 4-16px radius

      // Draw bubble
      ctx.fillStyle = point.color;
      ctx.globalAlpha = 0.7;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.fill();
      
      // Draw border
      ctx.strokeStyle = point.color;
      ctx.globalAlpha = 1;
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    ctx.globalAlpha = 1;

    // Draw axis labels
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '12px Inter, sans-serif';
    
    // X-axis label
    ctx.textAlign = 'center';
    ctx.fillText('Risk Score →', padding.left + chartWidth / 2, rect.height - 20);
    
    // Y-axis label
    ctx.save();
    ctx.translate(20, padding.top + chartHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Profit per Unit (€) →', 0, 0);
    ctx.restore();

    // Draw X-axis tick labels
    ctx.textAlign = 'center';
    for (let i = 0; i <= 4; i++) {
      const value = (i * 25).toString();
      const x = padding.left + (chartWidth * i / 4);
      ctx.fillText(value, x, padding.top + chartHeight + 20);
    }

    // Draw Y-axis tick labels
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const value = (minProfit + (maxProfit - minProfit) * (4 - i) / 4).toFixed(1);
      const y = padding.top + (chartHeight * i / 4) + 4;
      ctx.fillText(value, padding.left - 10, y);
    }

  }, [scatterData]);

  // Handle mouse move for tooltip
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setMousePos({ x: e.clientX, y: e.clientY });

    const padding = { top: 40, right: 40, bottom: 60, left: 60 };
    const chartWidth = rect.width - padding.left - padding.right;
    const chartHeight = rect.height - padding.top - padding.bottom;

    const maxProfit = Math.max(...scatterData.map(d => d.profit), 20);
    const minProfit = Math.min(...scatterData.map(d => d.profit), 0);
    const maxQuantity = Math.max(...scatterData.map(d => d.quantity || 1), 1);

    // Find closest product
    let closest = null;
    let minDistance = Infinity;

    scatterData.forEach(point => {
      const x = padding.left + (point.risk / 100) * chartWidth;
      const y = padding.top + chartHeight - ((point.profit - minProfit) / (maxProfit - minProfit) * chartHeight);
      const radius = 4 + ((point.quantity || 1) / maxQuantity) * 12;
      
      const distance = Math.sqrt(Math.pow(mouseX - x, 2) + Math.pow(mouseY - y, 2));
      
      if (distance < radius && distance < minDistance) {
        minDistance = distance;
        closest = point;
      }
    });

    setHoveredProduct(closest);
  };

  const handleMouseLeave = () => {
    setHoveredProduct(null);
  };

  // Get quadrant for a product
  const getQuadrant = (product) => {
    if (product.risk < 50 && product.profit > 10) return 'STAR';
    if (product.risk < 50 && product.profit <= 10) return 'STEADY SELLER';
    if (product.risk >= 50 && product.profit > 10) return 'DIAMOND';
    return 'ZOMBIE';
  };

  // Get risk status
  const getRiskStatus = (risk) => {
    if (risk < 35) return 'Low';
    if (risk < 65) return 'Medium';
    return 'High';
  };

  return (
    <div className="bg-[#1F2121] rounded-lg border border-gray-800 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">Risk vs. Profit Quadrant</h3>
          <p className="text-sm text-gray-400">Bubble size = Inventory quantity • Color = Category</p>
        </div>
        <div className="p-2 rounded-lg bg-[#32808D]/10 text-[#32808D]">
          <Target size={18} />
        </div>
      </div>

      {/* Chart */}
      <div className="relative" style={{ height: '400px' }}>
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="w-full h-full cursor-crosshair"
          style={{ width: '100%', height: '100%' }}
        />
        
        {/* Tooltip */}
        {hoveredProduct && (
          <div
            className="fixed z-50 bg-[#1F2121] border border-gray-700 rounded-lg p-3 shadow-xl pointer-events-none"
            style={{
              left: mousePos.x + 15,
              top: mousePos.y + 15,
              minWidth: '200px'
            }}
          >
            <div className="space-y-1 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">ASIN:</span>
                <span className="font-mono text-white">{hoveredProduct.asin}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Category:</span>
                <span className="text-white">{hoveredProduct.category}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Profit/Unit:</span>
                <span className="font-semibold text-green-400">€{hoveredProduct.profit.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Quantity:</span>
                <span className="text-white">{hoveredProduct.quantity}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Days in Stock:</span>
                <span className="text-white">{hoveredProduct.daysInStock || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-gray-700">
                <span className="text-gray-400">Risk:</span>
                <span className={`font-semibold ${
                  hoveredProduct.risk < 35 ? 'text-green-400' : 
                  hoveredProduct.risk < 65 ? 'text-orange-400' : 'text-red-400'
                }`}>
                  {getRiskStatus(hoveredProduct.risk)} ({hoveredProduct.risk.toFixed(0)}/100)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Status:</span>
                <span className="font-semibold text-white">{getQuadrant(hoveredProduct)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Category Legend */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-400">
        {Object.entries(categoryColors).map(([category, color]) => (
          <div key={category} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
            <span>{category}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
