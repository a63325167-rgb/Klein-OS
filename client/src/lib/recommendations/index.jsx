/**
 * Recommendation Engine - Main Export
 * 
 * Provides quantified, actionable business recommendations based on product analysis.
 * Each recommendation shows specific ROI impact with clear math.
 */

import { packagingOptimization } from './packagingOptimization';

/**
 * Generates all applicable recommendations for a product
 * Returns top 3 recommendations sorted by priority
 * 
 * @param {Object} result - Calculation result
 * @returns {Array<Object>} Array of recommendation objects (max 3)
 */
export function generateRecommendations(result) {
  const allRecommendations = [];
  
  // Run all recommendation functions
  const packaging = packagingOptimization(result);
  if (packaging) allRecommendations.push(packaging);
  
  // TODO: Add priceTestingOpportunity
  // TODO: Add ppcInvestmentHeadroom
  
  // Sort by priority_score (descending)
  allRecommendations.sort((a, b) => b.priority_score - a.priority_score);
  
  // Return top 3
  return allRecommendations.slice(0, 3);
}

export { packagingOptimization };

