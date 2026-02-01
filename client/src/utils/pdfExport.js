/**
 * PDF Export Utility
 * Generates professional analysis reports using jsPDF
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { calculateProductHealthScore } from './productHealthScore';
import { calculateRiskAssessment } from './riskAssessment';
import { calculateOptimalOrderQuantity } from './orderQuantityCalculator';

/**
 * Format currency for display
 */
const formatCurrency = (value) => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2
  }).format(value || 0);
};

/**
 * Format percentage for display
 */
const formatPercent = (value) => {
  return `${value.toFixed(1)}%`;
};

/**
 * Add header to page
 */
function addHeader(doc, pageNumber, totalPages) {
  const pageWidth = doc.internal.pageSize.width;
  
  // Header line
  doc.setDrawColor(59, 130, 246); // Blue
  doc.setLineWidth(2);
  doc.line(20, 15, pageWidth - 20, 15);
  
  // Page number
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // Slate gray
  doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - 20, 12, { align: 'right' });
}

/**
 * Add footer to page
 */
function addFooter(doc, userName, date) {
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
  // Footer line
  doc.setDrawColor(226, 232, 240); // Light gray
  doc.setLineWidth(0.5);
  doc.line(20, pageHeight - 20, pageWidth - 20, pageHeight - 20);
  
  // Branding
  doc.setFontSize(10);
  doc.setTextColor(59, 130, 246); // Blue
  doc.setFont(undefined, 'bold');
  doc.text('Powered by StoreHero', 20, pageHeight - 12);
  
  // User info
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.setFont(undefined, 'normal');
  doc.text(`Generated for ${userName} on ${date}`, pageWidth - 20, pageHeight - 12, { align: 'right' });
}

/**
 * Page 1: Executive Summary
 */
function generateExecutiveSummary(doc, result, healthScore, riskAssessment, userName, date) {
  const pageWidth = doc.internal.pageSize.width;
  let yPos = 30;
  
  addHeader(doc, 1, 4);
  
  // Title
  doc.setFontSize(24);
  doc.setTextColor(15, 23, 42); // Dark slate
  doc.setFont(undefined, 'bold');
  doc.text('Product Analysis Report', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 15;
  
  // Product name
  doc.setFontSize(16);
  doc.setTextColor(59, 130, 246); // Blue
  const productName = result.input.product_name || result.input.productName || 'Product Analysis';
  doc.text(productName, pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 20;
  
  // Health Score Card
  doc.setFillColor(239, 246, 255); // Light blue
  doc.roundedRect(20, yPos, 80, 50, 3, 3, 'F');
  
  doc.setFontSize(12);
  doc.setTextColor(59, 130, 246);
  doc.setFont(undefined, 'bold');
  doc.text('HEALTH SCORE', 60, yPos + 10, { align: 'center' });
  
  doc.setFontSize(32);
  doc.setTextColor(healthScore.totalScore >= 80 ? 34 : healthScore.totalScore >= 60 ? 234 : 220, 
                   healthScore.totalScore >= 80 ? 197 : healthScore.totalScore >= 60 ? 179 : 38,
                   healthScore.totalScore >= 80 ? 94 : healthScore.totalScore >= 60 ? 8 : 38);
  doc.text(`${healthScore.totalScore}/100`, 60, yPos + 30, { align: 'center' });
  
  doc.setFontSize(10);
  // Use indicator.status instead of grade.grade
  doc.text(healthScore.indicator.status, 60, yPos + 42, { align: 'center' });
  
  // Risk Score Card
  doc.setFillColor(254, 242, 242); // Light red
  if (riskAssessment.score >= 80) doc.setFillColor(240, 253, 244); // Light green
  else if (riskAssessment.score >= 65) doc.setFillColor(254, 249, 195); // Light yellow
  
  doc.roundedRect(110, yPos, 80, 50, 3, 3, 'F');
  
  doc.setFontSize(12);
  doc.setTextColor(riskAssessment.score >= 80 ? 22 : riskAssessment.score >= 65 ? 161 : 220,
                   riskAssessment.score >= 80 ? 163 : riskAssessment.score >= 65 ? 98 : 38,
                   riskAssessment.score >= 80 ? 74 : riskAssessment.score >= 65 ? 7 : 38);
  doc.setFont(undefined, 'bold');
  doc.text('RISK SCORE', 150, yPos + 10, { align: 'center' });
  
  doc.setFontSize(32);
  doc.text(`${riskAssessment.score}/100`, 150, yPos + 30, { align: 'center' });
  
  doc.setFontSize(10);
  doc.text(riskAssessment.level, 150, yPos + 42, { align: 'center' });
  
  yPos += 65;
  
  // Key Metrics
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.setFont(undefined, 'bold');
  doc.text('Key Financial Metrics', 20, yPos);
  
  yPos += 10;
  
  const metrics = [
    ['Net Profit per Unit', formatCurrency(result.totals.net_profit)],
    ['Profit Margin', formatPercent(result.totals.profit_margin)],
    ['ROI', formatPercent(result.totals.roi_percent)],
    ['Selling Price', formatCurrency(result.input.selling_price)],
    ['Total Cost', formatCurrency(result.totals.total_cost)],
    ['Break-Even Units', Math.ceil((result.input.fixed_costs || 500) / result.totals.net_profit)]
  ];
  
  autoTable(doc, {
    startY: yPos,
    head: [['Metric', 'Value']],
    body: metrics,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246], fontSize: 10, fontStyle: 'bold' },
    bodyStyles: { fontSize: 10 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 20, right: 20 }
  });
  
  yPos = doc.lastAutoTable.finalY + 15;
  
  // Go/No-Go Recommendation
  doc.setFillColor(healthScore.totalScore >= 70 && riskAssessment.score >= 50 ? 240 : 254,
                   healthScore.totalScore >= 70 && riskAssessment.score >= 50 ? 253 : 242,
                   healthScore.totalScore >= 70 && riskAssessment.score >= 50 ? 244 : 242);
  doc.roundedRect(20, yPos, pageWidth - 40, 40, 3, 3, 'F');
  
  doc.setFontSize(14);
  doc.setTextColor(healthScore.totalScore >= 70 && riskAssessment.score >= 50 ? 22 : 220,
                   healthScore.totalScore >= 70 && riskAssessment.score >= 50 ? 163 : 38,
                   healthScore.totalScore >= 70 && riskAssessment.score >= 50 ? 74 : 38);
  doc.setFont(undefined, 'bold');
  doc.text('RECOMMENDATION', pageWidth / 2, yPos + 12, { align: 'center' });
  
  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  const recommendation = healthScore.totalScore >= 70 && riskAssessment.score >= 50
    ? 'Proceed with Confidence — Strong potential. Follow the recommended order plan.'
    : healthScore.totalScore >= 60 || riskAssessment.score >= 40
    ? 'Pilot First — Test with a small batch and monitor metrics before scaling.'
    : 'Not Recommended Without Improvements — Significant risk factors identified.';
  
  doc.text(recommendation, pageWidth / 2, yPos + 25, { align: 'center', maxWidth: pageWidth - 60 });
  
  addFooter(doc, userName, date);
}

/**
 * Page 2: Financial Breakdown
 */
function generateFinancialBreakdown(doc, result, userName, date) {
  const pageWidth = doc.internal.pageSize.width;
  let yPos = 30;
  
  doc.addPage();
  addHeader(doc, 2, 4);
  
  // Title
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.setFont(undefined, 'bold');
  doc.text('Financial Breakdown', 20, yPos);
  
  yPos += 15;
  
  // Cost Structure Table
  doc.setFontSize(14);
  doc.text('Cost Structure', 20, yPos);
  
  yPos += 5;
  
  const costBreakdown = [
    ['Product Cost (COGS)', formatCurrency(result.input.buying_price)],
    ['Amazon Referral Fee', formatCurrency(result.amazonFee?.amount || 0)],
    ['FBA Fee', formatCurrency(result.fbaFee?.amount || 0)],
    ['Shipping to Amazon', formatCurrency(result.shipping?.cost || 0)],
    ['VAT', formatCurrency(result.vat?.amount || 0)],
    ['', ''],
    ['Total Cost per Unit', formatCurrency(result.totals.total_cost)],
    ['Selling Price', formatCurrency(result.input.selling_price)],
    ['Net Profit per Unit', formatCurrency(result.totals.net_profit)]
  ];
  
  autoTable(doc, {
    startY: yPos,
    body: costBreakdown,
    theme: 'grid',
    bodyStyles: { fontSize: 10 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 100 },
      1: { halign: 'right', cellWidth: 60 }
    },
    didParseCell: function(data) {
      if (data.row.index === 5) {
        data.cell.styles.fillColor = [255, 255, 255];
        data.cell.styles.lineWidth = 0;
      }
      if (data.row.index >= 6) {
        data.cell.styles.fillColor = [239, 246, 255];
        data.cell.styles.fontStyle = 'bold';
      }
    },
    margin: { left: 20, right: 20 }
  });
  
  yPos = doc.lastAutoTable.finalY + 15;
  
  // Profit Projection
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.setFont(undefined, 'bold');
  doc.text('Annual Profit Projection', 20, yPos);
  
  yPos += 5;
  
  const annualVolume = parseInt(result.input.annual_volume) || 500;
  const monthlyVolume = Math.round(annualVolume / 12);
  
  const projectionData = [];
  for (let month = 1; month <= 12; month++) {
    const units = monthlyVolume * month;
    const revenue = units * result.input.selling_price;
    const costs = units * result.totals.total_cost;
    const profit = units * result.totals.net_profit - (result.input.fixed_costs || 500);
    
    projectionData.push([
      `Month ${month}`,
      units,
      formatCurrency(revenue),
      formatCurrency(costs),
      formatCurrency(profit)
    ]);
  }
  
  autoTable(doc, {
    startY: yPos,
    head: [['Period', 'Units', 'Revenue', 'Costs', 'Net Profit']],
    body: projectionData.slice(0, 6), // Show first 6 months
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246], fontSize: 9, fontStyle: 'bold' },
    bodyStyles: { fontSize: 9 },
    columnStyles: {
      1: { halign: 'center' },
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right' }
    },
    margin: { left: 20, right: 20 }
  });
  
  addFooter(doc, userName, date);
}

/**
 * Page 3: Risk & Opportunities
 */
function generateRiskAndOpportunities(doc, result, riskAssessment, userName, date) {
  const pageWidth = doc.internal.pageSize.width;
  let yPos = 30;
  
  doc.addPage();
  addHeader(doc, 3, 4);
  
  // Title
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.setFont(undefined, 'bold');
  doc.text('Risk Assessment & Opportunities', 20, yPos);
  
  yPos += 15;
  
  // Risk Factors
  doc.setFontSize(14);
  doc.text('Risk Factors', 20, yPos);
  
  yPos += 10;
  
  if (riskAssessment.factors.length > 0) {
    riskAssessment.factors.forEach((factor, index) => {
      if (yPos > 250) {
        doc.addPage();
        addHeader(doc, 3, 4);
        yPos = 30;
      }
      
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.setFont(undefined, 'bold');
      doc.text(`${factor.icon} ${factor.label}`, 25, yPos);
      
      yPos += 6;
      
      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(factor.description, 25, yPos, { maxWidth: pageWidth - 50 });
      
      yPos += 5;
      
      doc.setTextColor(100, 116, 139);
      doc.text(`Impact: ${factor.impact}`, 25, yPos, { maxWidth: pageWidth - 50 });
      
      yPos += 5;
      
      doc.setTextColor(59, 130, 246);
      doc.text(`Action: ${factor.recommendation}`, 25, yPos, { maxWidth: pageWidth - 50 });
      
      yPos += 10;
    });
  } else {
    doc.setFontSize(10);
    doc.setTextColor(34, 197, 94);
    doc.text('No significant risk factors identified.', 25, yPos);
    yPos += 10;
  }
  
  yPos += 5;
  
  // Optimization Opportunities
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.setFont(undefined, 'bold');
  doc.text('Optimization Opportunities', 20, yPos);
  
  yPos += 10;
  
  const opportunities = [
    {
      title: 'Negotiate COGS Reduction',
      impact: `Save ${formatCurrency(result.input.buying_price * 0.1)}/unit with 10% discount`,
      action: 'Contact supplier for volume pricing at 100+ units'
    },
    {
      title: 'Optimize Shipping',
      impact: result.shipping?.cost > 10 ? 'Reduce weight/dimensions to save on shipping' : 'Shipping costs are optimized',
      action: result.shipping?.cost > 10 ? 'Review packaging to reduce dimensional weight' : 'Maintain current shipping strategy'
    },
    {
      title: 'Improve Margins',
      impact: result.totals.profit_margin < 25 ? 'Increase margin to 25%+ for better buffer' : 'Margins are healthy',
      action: result.totals.profit_margin < 25 ? 'Test price increase or reduce costs' : 'Monitor and maintain current margins'
    }
  ];
  
  opportunities.forEach((opp, index) => {
    if (yPos > 250) {
      doc.addPage();
      addHeader(doc, 3, 4);
      yPos = 30;
    }
    
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.setFont(undefined, 'bold');
    doc.text(`${index + 1}. ${opp.title}`, 25, yPos);
    
    yPos += 6;
    
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Impact: ${opp.impact}`, 25, yPos, { maxWidth: pageWidth - 50 });
    
    yPos += 5;
    
    doc.setTextColor(59, 130, 246);
    doc.text(`Action: ${opp.action}`, 25, yPos, { maxWidth: pageWidth - 50 });
    
    yPos += 10;
  });
  
  addFooter(doc, userName, date);
}

/**
 * Page 4: Action Plan
 */
function generateActionPlan(doc, result, orderPlan, userName, date) {
  const pageWidth = doc.internal.pageSize.width;
  let yPos = 30;
  
  doc.addPage();
  addHeader(doc, 4, 4);
  
  // Title
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.setFont(undefined, 'bold');
  doc.text('Action Plan & Roadmap', 20, yPos);
  
  yPos += 15;
  
  // Immediate Actions
  doc.setFontSize(14);
  doc.text('Immediate Actions (Next 7 Days)', 20, yPos);
  
  yPos += 10;
  
  const immediateActions = [
    ['Order Product Sample', 'Validate quality before bulk order', 'Day 1-2'],
    ['Negotiate with Supplier', `Target ${orderPlan?.formatted.optimalQuantity || '50'} units MOQ`, 'Day 3-5'],
    ['Set Up Amazon Listing', 'Prepare product photos and description', 'Day 5-7']
  ];
  
  autoTable(doc, {
    startY: yPos,
    head: [['Action', 'Details', 'Timeline']],
    body: immediateActions,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246], fontSize: 10, fontStyle: 'bold' },
    bodyStyles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 60, fontStyle: 'bold' },
      1: { cellWidth: 80 },
      2: { cellWidth: 30, halign: 'center' }
    },
    margin: { left: 20, right: 20 }
  });
  
  yPos = doc.lastAutoTable.finalY + 15;
  
  // 90-Day Roadmap
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.setFont(undefined, 'bold');
  doc.text('90-Day Launch Roadmap', 20, yPos);
  
  yPos += 10;
  
  const roadmap = [
    ['Days 1-30', 'Product Launch', 'Order inventory, create listing, launch PPC'],
    ['Days 31-60', 'Optimization', 'Gather reviews, optimize listing, adjust PPC'],
    ['Days 61-90', 'Scale Decision', 'Analyze performance, plan reorder or pivot']
  ];
  
  autoTable(doc, {
    startY: yPos,
    head: [['Period', 'Phase', 'Key Activities']],
    body: roadmap,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246], fontSize: 10, fontStyle: 'bold' },
    bodyStyles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 35, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 45, fontStyle: 'bold' },
      2: { cellWidth: 90 }
    },
    margin: { left: 20, right: 20 }
  });
  
  yPos = doc.lastAutoTable.finalY + 15;
  
  // Key Milestones
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.setFont(undefined, 'bold');
  doc.text('Key Milestones', 20, yPos);
  
  yPos += 10;
  
  const breakEvenUnits = Math.ceil((result.input.fixed_costs || 500) / result.totals.net_profit);
  
  const milestones = [
    ['First Sale', 'Validate product-market fit', 'Week 1-2'],
    ['10 Units Sold', 'Gather initial customer feedback', 'Week 2-4'],
    [`${breakEvenUnits} Units Sold`, 'Break even on initial investment', `Week ${Math.ceil(breakEvenUnits / 10)}`],
    ['First Reorder', 'Scale with proven demand', 'Month 2-3']
  ];
  
  autoTable(doc, {
    startY: yPos,
    head: [['Milestone', 'Significance', 'Target']],
    body: milestones,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246], fontSize: 10, fontStyle: 'bold' },
    bodyStyles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 50, fontStyle: 'bold' },
      1: { cellWidth: 80 },
      2: { cellWidth: 40, halign: 'center' }
    },
    margin: { left: 20, right: 20 }
  });
  
  addFooter(doc, userName, date);
}

/**
 * Main export function
 */
export async function exportAnalysisPDF(result, userName = 'User') {
  try {
    // Create new PDF document
    const doc = new jsPDF();
    
    // Get current date
    const date = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Calculate scores
    const healthScore = calculateProductHealthScore(result);
    const riskAssessment = calculateRiskAssessment(result);
    const orderPlan = calculateOptimalOrderQuantity(result);
    
    // Generate all pages
    generateExecutiveSummary(doc, result, healthScore, riskAssessment, userName, date);
    generateFinancialBreakdown(doc, result, userName, date);
    generateRiskAndOpportunities(doc, result, riskAssessment, userName, date);
    generateActionPlan(doc, result, orderPlan, userName, date);
    
    // Generate filename
    const productName = (result.input.product_name || result.input.productName || 'Product')
      .replace(/[^a-z0-9]/gi, '_')
      .substring(0, 30);
    const filename = `${productName}_Analysis_${Date.now()}.pdf`;
    
    // Save PDF
    doc.save(filename);
    
    return { success: true, filename };
  } catch (error) {
    console.error('PDF Export Error:', error);
    return { success: false, error: error.message };
  }
}
