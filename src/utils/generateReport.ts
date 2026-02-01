// src/utils/generateReport.ts

import { BulkProductResult } from '../types/upload';
import { generateAnalytics } from './exportAnalytics';
import { getCategoryStats, getHealthDistribution } from './dataTransform';

/**
 * Generate professional HTML report from products
 * 
 * Features:
 * - Executive summary with key metrics
 * - Risk distribution visualization
 * - Product details table (sortable)
 * - Category analysis
 * - Responsive design
 * - Print-friendly layout
 * 
 * @param products - Array of calculated products
 * @returns HTML string
 */
export function generateHTMLReport(products: BulkProductResult[]): string {
  if (!products || products.length === 0) {
    return generateEmptyReport();
  }

  const analytics = generateAnalytics(products);
  const categoryStats = getCategoryStats(products);
  const healthDist = getHealthDistribution(products);

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>B7 Product Analysis Report</title>
  <style>
    ${getReportStyles()}
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <header class="report-header">
      <h1>B7 Bulk Product Analysis Report</h1>
      <p class="subtitle">Generated: ${new Date().toLocaleString()}</p>
      <p class="subtitle">Total Products: ${products.length}</p>
    </header>

    <!-- Executive Summary -->
    <section class="section">
      <h2>📊 Executive Summary</h2>
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-value">€${analytics.summary.totalMonthlyProfit.toFixed(2)}</div>
          <div class="metric-label">Total Monthly Profit</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${analytics.summary.averageProfitMargin.toFixed(2)}%</div>
          <div class="metric-label">Average Profit Margin</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${analytics.summary.averageHealthScore.toFixed(0)}/100</div>
          <div class="metric-label">Average Health Score</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${analytics.profitability.profitableCount}</div>
          <div class="metric-label">Profitable Products</div>
        </div>
      </div>
    </section>

    <!-- Risk Distribution -->
    <section class="section">
      <h2>🎯 Risk Distribution</h2>
      <div class="risk-grid">
        <div class="risk-card risk-green">
          <div class="risk-icon">🟢</div>
          <div class="risk-count">${analytics.riskDistribution.green}</div>
          <div class="risk-label">Low Risk</div>
          <div class="risk-percentage">${((analytics.riskDistribution.green / products.length) * 100).toFixed(1)}%</div>
        </div>
        <div class="risk-card risk-yellow">
          <div class="risk-icon">🟡</div>
          <div class="risk-count">${analytics.riskDistribution.yellow}</div>
          <div class="risk-label">Medium Risk</div>
          <div class="risk-percentage">${((analytics.riskDistribution.yellow / products.length) * 100).toFixed(1)}%</div>
        </div>
        <div class="risk-card risk-red">
          <div class="risk-icon">🔴</div>
          <div class="risk-count">${analytics.riskDistribution.red}</div>
          <div class="risk-label">High Risk</div>
          <div class="risk-percentage">${((analytics.riskDistribution.red / products.length) * 100).toFixed(1)}%</div>
        </div>
      </div>
    </section>

    <!-- Alerts -->
    ${analytics.alerts.length > 0 ? `
    <section class="section">
      <h2>⚠️ Alerts & Warnings</h2>
      <div class="alerts">
        ${analytics.alerts.map(alert => `<div class="alert">${alert}</div>`).join('')}
      </div>
    </section>
    ` : ''}

    <!-- Top Performers -->
    <section class="section">
      <h2>🏆 Top 5 Performers</h2>
      <table class="data-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Product</th>
            <th>ASIN</th>
            <th>Profit/Unit</th>
            <th>Margin</th>
            <th>Health Score</th>
          </tr>
        </thead>
        <tbody>
          ${analytics.topPerformers.map((product, index) => `
            <tr>
              <td><strong>${index + 1}</strong></td>
              <td>${product.name}</td>
              <td>${product.asin}</td>
              <td>€${product.profitPerUnit.toFixed(2)}</td>
              <td>${product.profitMargin.toFixed(1)}%</td>
              <td><span class="health-badge health-${getHealthClass(product.healthScore)}">${product.healthScore}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </section>

    <!-- Category Analysis -->
    ${categoryStats.length > 0 ? `
    <section class="section">
      <h2>📦 Category Analysis</h2>
      <table class="data-table">
        <thead>
          <tr>
            <th>Category</th>
            <th>Products</th>
            <th>Total Profit</th>
            <th>Avg Margin</th>
            <th>Avg Health</th>
            <th>Risk Distribution</th>
          </tr>
        </thead>
        <tbody>
          ${categoryStats.map(stat => `
            <tr>
              <td><strong>${stat.category}</strong></td>
              <td>${stat.count}</td>
              <td>€${stat.totalProfit.toFixed(2)}</td>
              <td>${stat.averageMargin.toFixed(1)}%</td>
              <td>${stat.averageHealthScore.toFixed(0)}</td>
              <td>
                <span class="risk-mini risk-green">${stat.riskDistribution.green}</span>
                <span class="risk-mini risk-yellow">${stat.riskDistribution.yellow}</span>
                <span class="risk-mini risk-red">${stat.riskDistribution.red}</span>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </section>
    ` : ''}

    <!-- All Products -->
    <section class="section">
      <h2>📋 All Products</h2>
      <div class="table-controls">
        <input type="text" id="searchInput" placeholder="Search products..." class="search-input">
      </div>
      <table class="data-table" id="productsTable">
        <thead>
          <tr>
            <th onclick="sortTable(0)">ASIN ↕</th>
            <th onclick="sortTable(1)">Product Name ↕</th>
            <th onclick="sortTable(2)">Profit/Unit ↕</th>
            <th onclick="sortTable(3)">Margin % ↕</th>
            <th onclick="sortTable(4)">Health ↕</th>
            <th onclick="sortTable(5)">Risk ↕</th>
          </tr>
        </thead>
        <tbody>
          ${products.map(product => `
            <tr>
              <td>${product.asin}</td>
              <td>${product.name}</td>
              <td>€${product.profitPerUnit.toFixed(2)}</td>
              <td>${product.profitMargin.toFixed(1)}%</td>
              <td><span class="health-badge health-${getHealthClass(product.healthScore)}">${product.healthScore}</span></td>
              <td><span class="risk-badge risk-${product.profitabilityRisk}">${getRiskEmoji(product.profitabilityRisk)}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </section>

    <!-- Footer -->
    <footer class="report-footer">
      <p>B7 Bulk Upload System - Product Analysis Report</p>
      <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
    </footer>
  </div>

  <script>
    ${getReportScripts()}
  </script>
</body>
</html>
  `;

  return html;
}

/**
 * Get CSS styles for report
 */
function getReportStyles(): string {
  return `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f5f7fa;
      padding: 20px;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .report-header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #2980b9;
    }

    .report-header h1 {
      font-size: 32px;
      color: #2c3e50;
      margin-bottom: 10px;
    }

    .subtitle {
      color: #7f8c8d;
      font-size: 14px;
    }

    .section {
      margin-bottom: 40px;
    }

    h2 {
      font-size: 24px;
      color: #2c3e50;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #ecf0f1;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .metric-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 25px;
      border-radius: 8px;
      text-align: center;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }

    .metric-value {
      font-size: 32px;
      font-weight: bold;
      margin-bottom: 8px;
    }

    .metric-label {
      font-size: 14px;
      opacity: 0.9;
    }

    .risk-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }

    .risk-card {
      padding: 25px;
      border-radius: 8px;
      text-align: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .risk-green { background: #d4edda; color: #155724; }
    .risk-yellow { background: #fff3cd; color: #856404; }
    .risk-red { background: #f8d7da; color: #721c24; }

    .risk-icon {
      font-size: 48px;
      margin-bottom: 10px;
    }

    .risk-count {
      font-size: 36px;
      font-weight: bold;
      margin-bottom: 5px;
    }

    .risk-label {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 5px;
    }

    .risk-percentage {
      font-size: 14px;
      opacity: 0.8;
    }

    .alerts {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      border-radius: 4px;
    }

    .alert {
      padding: 8px 0;
      font-size: 14px;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }

    .data-table th,
    .data-table td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #ecf0f1;
    }

    .data-table th {
      background: #34495e;
      color: white;
      font-weight: 600;
      cursor: pointer;
      user-select: none;
    }

    .data-table th:hover {
      background: #2c3e50;
    }

    .data-table tbody tr:hover {
      background: #f8f9fa;
    }

    .health-badge {
      padding: 4px 12px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 12px;
    }

    .health-high { background: #d4edda; color: #155724; }
    .health-medium { background: #fff3cd; color: #856404; }
    .health-low { background: #f8d7da; color: #721c24; }

    .risk-badge {
      padding: 4px 12px;
      border-radius: 12px;
      font-weight: 600;
    }

    .risk-mini {
      display: inline-block;
      padding: 2px 8px;
      margin: 0 2px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
    }

    .table-controls {
      margin-bottom: 15px;
    }

    .search-input {
      width: 100%;
      max-width: 400px;
      padding: 10px 15px;
      border: 2px solid #ecf0f1;
      border-radius: 4px;
      font-size: 14px;
    }

    .search-input:focus {
      outline: none;
      border-color: #3498db;
    }

    .report-footer {
      margin-top: 60px;
      padding-top: 20px;
      border-top: 2px solid #ecf0f1;
      text-align: center;
      color: #7f8c8d;
      font-size: 14px;
    }

    @media print {
      body {
        background: white;
        padding: 0;
      }
      .container {
        box-shadow: none;
        padding: 20px;
      }
      .table-controls {
        display: none;
      }
    }

    @media (max-width: 768px) {
      .container {
        padding: 20px;
      }
      .metrics-grid,
      .risk-grid {
        grid-template-columns: 1fr;
      }
      .data-table {
        font-size: 12px;
      }
      .data-table th,
      .data-table td {
        padding: 8px;
      }
    }
  `;
}

/**
 * Get JavaScript for report interactivity
 */
function getReportScripts(): string {
  return `
    // Table sorting
    function sortTable(columnIndex) {
      const table = document.getElementById('productsTable');
      const tbody = table.querySelector('tbody');
      const rows = Array.from(tbody.querySelectorAll('tr'));
      
      rows.sort((a, b) => {
        const aValue = a.cells[columnIndex].textContent.trim();
        const bValue = b.cells[columnIndex].textContent.trim();
        
        // Try numeric comparison
        const aNum = parseFloat(aValue.replace(/[^0-9.-]/g, ''));
        const bNum = parseFloat(bValue.replace(/[^0-9.-]/g, ''));
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return bNum - aNum;
        }
        
        return aValue.localeCompare(bValue);
      });
      
      rows.forEach(row => tbody.appendChild(row));
    }

    // Search functionality
    document.getElementById('searchInput').addEventListener('input', function(e) {
      const searchTerm = e.target.value.toLowerCase();
      const table = document.getElementById('productsTable');
      const rows = table.querySelectorAll('tbody tr');
      
      rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
      });
    });
  `;
}

/**
 * Get health score class for styling
 */
function getHealthClass(score: number): string {
  if (score >= 60) return 'high';
  if (score >= 30) return 'medium';
  return 'low';
}

/**
 * Get risk emoji
 */
function getRiskEmoji(risk: string): string {
  switch (risk) {
    case 'red': return '🔴 High';
    case 'yellow': return '🟡 Medium';
    case 'green': return '🟢 Low';
    default: return '⚪ Unknown';
  }
}

/**
 * Generate empty report for no products
 */
function generateEmptyReport(): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>B7 Product Analysis Report</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      background: #f5f7fa;
    }
    .empty-state {
      text-align: center;
      padding: 40px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    h1 { color: #2c3e50; }
    p { color: #7f8c8d; }
  </style>
</head>
<body>
  <div class="empty-state">
    <h1>No Products to Display</h1>
    <p>Please upload a product file to generate a report.</p>
  </div>
</body>
</html>
  `;
}

/**
 * Download HTML report as file
 */
export function downloadHTMLReport(products: BulkProductResult[], filename?: string): void {
  const html = generateHTMLReport(products);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const finalFilename = filename || `report_${timestamp}.html`;
  
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = finalFilename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
