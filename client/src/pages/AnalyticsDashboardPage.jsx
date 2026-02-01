/**
 * Analytics Dashboard Page
 * 
 * Wrapper page for the Premium Analytics Dashboard
 * Displays interactive charts and KPIs for bulk uploaded products
 */

import React from 'react';
import { useProducts } from '../contexts/ProductsContext';
import PremiumAnalyticsDashboard from '../components/analytics/PremiumAnalyticsDashboard';

export default function AnalyticsDashboardPage() {
  const { products } = useProducts();

  return <PremiumAnalyticsDashboard products={products} />;
}
