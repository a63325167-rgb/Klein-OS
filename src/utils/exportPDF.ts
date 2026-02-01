// src/utils/exportPDF.ts

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BulkProductResult } from '../types/upload';
import { generateAnalytics } from './exportAnalytics';

// TypeScript declaration to extend jsPDF with autoTable
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: {
      finalY: number;
    };
  }
}

/**
 * Export products to professional PDF report
 * 
 * Features:
 * - Cover page with summary
 * - Executive summary with key metrics
 * - Risk distribution visualization
 * - Detailed product table
 * - Color-coded risk indicators
 * - Page numbers and headers
 * 
 * @param products - Array of calculated products
 * @param filename - Optional custom filename
 */
export async function exportToPDF(products: BulkProductResult[], filename?: string): Promise<void> {
  if (!products || products.length === 0) {
    throw new Error('No products to export');
  }

  const doc = new jsPDF();
  const analytics = generateAnalytics(products);
  
  // ============================================
  // COVER PAGE
  // ============================================
  
  createCoverPage(doc, products.length);
  
  // ============================================
  // EXECUTIVE SUMMARY
  // ============================================
  
  addExecutiveSummary(doc, analytics);
  
  let yPosition = (doc as any).lastAutoTable.finalY + 15;
  
  // ============================================
  // RISK DISTRIBUTION
  // ============================================
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Risk Distribution', 20, yPosition);
  
  yPosition += 10;
  
  const riskData = [
    ['🔴 High Risk (Red)', analytics.riskDistribution.red.toString(), `${((analytics.riskDistribution.red / products.length) * 100).toFixed(1)}%`],
    ['🟡 Medium Risk (Yellow)', analytics.riskDistribution.yellow.toString(), `${((analytics.riskDistribution.yellow / products.length) * 100).toFixed(1)}%`],
    ['🟢 Low Risk (Green)', analytics.riskDistribution.green.toString(), `${((analytics.riskDistribution.green / products.length) * 100).toFixed(1)}%`]
  ];
  
  autoTable(doc, {
    startY: yPosition,
    head: [['Risk Level', 'Count', 'Percentage']],
    body: riskData,
    theme: 'grid',
    headStyles: { fillColor: [52, 73, 94], textColor: 255 },
    margin: { left: 20, right: 20 }
  });
  
  yPosition = (doc as any).lastAutoTable.finalY + 15;
  
  // ============================================
  // ALERTS
  // ============================================
  
  if (analytics.alerts.length > 0) {
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Alerts & Warnings', 20, yPosition);
    
    yPosition += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    analytics.alerts.forEach((alert, index) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(`• ${alert}`, 25, yPosition);
      yPosition += 7;
    });
    
    yPosition += 10;
  }
  
  // ============================================
  // NEW PAGE: PRODUCT DETAILS
  // ============================================
  
  doc.addPage();
  yPosition = 20;
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Product Details', 20, yPosition);
  
  yPosition += 10;
  
  // Prepare product table data
  const productTableData = products.map(product => [
    product.asin,
    product.name.length > 30 ? product.name.substring(0, 27) + '...' : product.name,
    `€${product.profitPerUnit.toFixed(2)}`,
    `${product.profitMargin.toFixed(1)}%`,
    product.healthScore.toString(),
    getRiskEmoji(product.profitabilityRisk)
  ]);
  
  autoTable(doc, {
    startY: yPosition,
    head: [['ASIN', 'Product Name', 'Profit/Unit', 'Margin %', 'Health', 'Risk']],
    body: productTableData,
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    styles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 60 },
      2: { cellWidth: 25 },
      3: { cellWidth: 20 },
      4: { cellWidth: 20 },
      5: { cellWidth: 20 }
    },
    margin: { left: 20, right: 20 },
    didDrawPage: (data: any) => {
      // Add page numbers
      const pageCount = doc.getNumberOfPages();
      doc.setFontSize(10);
      doc.text(`Page ${doc.getCurrentPageInfo().pageNumber} of ${pageCount}`, 105, 285, { align: 'center' });
    }
  });
  
  // ============================================
  // TOP PERFORMERS
  // ============================================
  
  if (analytics.topPerformers.length > 0) {
    doc.addPage();
    yPosition = 20;
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Top 5 Performers', 20, yPosition);
    
    yPosition += 10;
    
    const topPerformersData = analytics.topPerformers.map((product, index) => [
      (index + 1).toString(),
      product.name.length > 35 ? product.name.substring(0, 32) + '...' : product.name,
      `€${product.profitPerUnit.toFixed(2)}`,
      `${product.profitMargin.toFixed(1)}%`,
      `€${product.totalMonthlyProfit.toFixed(2)}`
    ]);
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Rank', 'Product', 'Profit/Unit', 'Margin', 'Monthly Profit']],
      body: topPerformersData,
      theme: 'grid',
      headStyles: { fillColor: [39, 174, 96], textColor: 255 },
      styles: { fontSize: 9 },
      margin: { left: 20, right: 20 }
    });
  }
  
  // ============================================
  // SAVE PDF
  // ============================================
  
  const finalFilename = filename || `products-analysis-${formatDate()}-${Date.now()}.pdf`;
  doc.save(finalFilename);
}

/**
 * Get emoji representation of risk level
 * 
 * @param risk - Risk level
 * @returns Emoji string
 */
function getRiskEmoji(risk: string): string {
  switch (risk) {
    case 'red':
      return '🔴';
    case 'yellow':
      return '🟡';
    case 'green':
      return '🟢';
    default:
      return '⚪';
  }
}

/**
 * Export products to PDF as Blob (for batch export)
 * 
 * @param products - Array of calculated products
 * @returns Promise resolving to PDF Blob
 */
export async function exportToPDFBlob(products: BulkProductResult[]): Promise<Blob> {
  if (!products || products.length === 0) {
    throw new Error('No products to export');
  }

  const doc = new jsPDF();
  const analytics = generateAnalytics(products);
  
  // Use helper functions
  createCoverPage(doc, products.length);
  addExecutiveSummary(doc, analytics);
  addProductTable(doc, products);
  
  return doc.output('blob');
}

/**
 * Format current date as DD.MM.YYYY
 * 
 * @returns Formatted date string
 */
function formatDate(): string {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  return `${day}.${month}.${year}`;
}

/**
 * Create cover page with StoreHero branding
 * 
 * @param doc - jsPDF document
 * @param totalProducts - Total number of products
 */
function createCoverPage(doc: jsPDF, totalProducts: number): void {
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('StoreHero - Product Analysis Report', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Date: ${formatDate()}`, 105, 35, { align: 'center' });
  doc.text(`Total Products: ${totalProducts}`, 105, 45, { align: 'center' });
}

/**
 * Add executive summary table
 * 
 * @param doc - jsPDF document
 * @param analytics - Analytics report
 */
function addExecutiveSummary(doc: jsPDF, analytics: any): void {
  const yPos = 65;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Executive Summary', 20, yPos);
  
  const summaryData = [
    ['Total Monthly Profit', `€${analytics.summary.totalMonthlyProfit.toFixed(2)}`],
    ['Average Profit Margin', `${analytics.summary.averageProfitMargin.toFixed(2)}%`],
    ['Average Health Score', `${analytics.summary.averageHealthScore.toFixed(0)}/100`],
    ['Risk Distribution', `${analytics.riskDistribution.red} red, ${analytics.riskDistribution.yellow} yellow, ${analytics.riskDistribution.green} green`]
  ];
  
  autoTable(doc, {
    startY: yPos + 10,
    head: [['Metric', 'Value']],
    body: summaryData,
    theme: 'grid',
    headStyles: { fillColor: [52, 73, 94], textColor: 255 },
    margin: { left: 20, right: 20 }
  });
}

/**
 * Add product details table
 * 
 * @param doc - jsPDF document
 * @param products - Array of products
 */
function addProductTable(doc: jsPDF, products: BulkProductResult[]): void {
  doc.addPage();
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Product Details', 20, 20);
  
  const productData = products.map(p => [
    p.name.length > 30 ? p.name.substring(0, 27) + '...' : p.name,
    p.asin,
    `€${p.profitPerUnit.toFixed(2)}`,
    `${p.profitMargin.toFixed(1)}%`,
    p.healthScore.toString(),
    getRiskBadge(p)
  ]);
  
  autoTable(doc, {
    startY: 30,
    head: [['Name', 'ASIN', 'Profit/Unit (€)', 'Margin (%)', 'Health', 'Risk']],
    body: productData,
    theme: 'striped',
    headStyles: { fillColor: [52, 73, 94], textColor: 255 },
    styles: { fontSize: 8 },
    margin: { left: 20, right: 20 }
  });
}

/**
 * Add footer with page number
 * 
 * @param doc - jsPDF document
 * @param pageNum - Current page number
 */
function addFooter(doc: jsPDF, pageNum: number): void {
  const pageCount = doc.getNumberOfPages();
  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128);
  doc.text(`Page ${pageNum} of ${pageCount}`, 105, 285, { align: 'center' });
  doc.text('Generated by StoreHero', 105, 290, { align: 'center' });
}

/**
 * Get risk badge for product (considers all 5 dimensions)
 * 
 * @param product - Product result
 * @returns Risk badge string
 */
function getRiskBadge(product: BulkProductResult): string {
  const risks = [
    product.profitabilityRisk,
    product.breakEvenRisk,
    product.cashFlowRisk,
    product.competitionRisk,
    product.inventoryRisk
  ];
  
  const redCount = risks.filter(r => r === 'red').length;
  const yellowCount = risks.filter(r => r === 'yellow').length;
  
  if (redCount >= 3) return '🔴 Red';
  if (redCount >= 1 || yellowCount >= 3) return '🟡 Yellow';
  return '🟢 Green';
}
