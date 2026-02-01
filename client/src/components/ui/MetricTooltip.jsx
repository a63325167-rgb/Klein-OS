import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { getMetric } from '../../utils/terminologyGlossary';
import { Caption, BodySmall } from './Typography';

/**
 * MetricTooltip Component (B6)
 * 
 * Displays inline tooltip with metric definition, formula, and example.
 * Hover or click to see details.
 * 
 * Usage:
 * <MetricTooltip metricKey="profitPerUnit" />
 * OR
 * <MetricTooltip
 *   term="Custom Metric"
 *   definition="..."
 *   formula="..."
 *   example="..."
 * />
 */
const MetricTooltip = ({ 
  metricKey, 
  term, 
  definition, 
  formula, 
  example, 
  notes,
  category,
  deprecated = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // If metricKey provided, load from glossary
  const metric = metricKey ? getMetric(metricKey) : null;
  
  // Use metric data or custom props
  const displayTerm = term || metric?.name || 'Unknown Metric';
  const displayDefinition = definition || metric?.definition || 'No definition available';
  const displayFormula = formula || metric?.formula || 'No formula available';
  const displayExample = example || metric?.example || 'No example available';
  const displayNotes = notes || metric?.notes;
  const displayCategory = category || metric?.category || 'General';
  const isDeprecated = deprecated || metric?.status === 'DEPRECATED';
  const industryStandard = metric?.industryStandard;
  const amazonTerm = metric?.amazonTerm;

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Trigger Button */}
      <button
        className="inline-flex items-center gap-1 text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors cursor-help"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        aria-label={`Show definition for ${displayTerm}`}
      >
        <Info className="w-3.5 h-3.5" />
      </button>

      {/* Tooltip Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full mt-2 z-50 w-96 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-lg shadow-2xl p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Deprecated Warning */}
            {isDeprecated && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-500 dark:border-yellow-600 rounded-lg p-2 mb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                  <Caption className="font-semibold text-yellow-700 dark:text-yellow-400">
                    ⚠️ DEPRECATED - DO NOT USE
                  </Caption>
                </div>
                {metric?.reason && (
                  <BodySmall className="text-yellow-600 dark:text-yellow-300 mt-1">
                    {metric.reason}
                  </BodySmall>
                )}
                {metric?.replacement && (
                  <BodySmall className="text-yellow-600 dark:text-yellow-300 mt-1">
                    <strong>Use instead:</strong> {metric.replacement}
                  </BodySmall>
                )}
              </div>
            )}

            {/* Industry Standard Badge */}
            {industryStandard && (
              <div className="flex items-center gap-2 mb-3 p-2 bg-green-50 dark:bg-green-900/20 border border-green-500 dark:border-green-600 rounded">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                <BodySmall className="text-green-700 dark:text-green-400">
                  <strong>Industry Standard</strong>
                  {amazonTerm && amazonTerm !== 'N/A (Proprietary)' && (
                    <span className="ml-1">• Amazon: "{amazonTerm}"</span>
                  )}
                </BodySmall>
              </div>
            )}

            {/* Term Name */}
            <div className="mb-3">
              <h4 className="text-lg font-bold text-slate-800 dark:text-white">
                {displayTerm}
              </h4>
              <Caption className="text-slate-500 dark:text-slate-400">
                Category: {displayCategory}
              </Caption>
            </div>

            {/* Definition */}
            <div className="mb-3">
              <Caption className="font-semibold text-slate-600 dark:text-slate-400 mb-1">
                DEFINITION
              </Caption>
              <BodySmall className="text-slate-700 dark:text-slate-300">
                {displayDefinition}
              </BodySmall>
            </div>

            {/* Formula */}
            <div className="mb-3">
              <Caption className="font-semibold text-slate-600 dark:text-slate-400 mb-1">
                FORMULA
              </Caption>
              <code className="block text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 rounded text-blue-600 dark:text-blue-400 font-mono overflow-x-auto">
                {displayFormula}
              </code>
            </div>

            {/* Example */}
            <div className="mb-3">
              <Caption className="font-semibold text-slate-600 dark:text-slate-400 mb-1">
                EXAMPLE
              </Caption>
              <BodySmall className="text-slate-600 dark:text-slate-400">
                {displayExample}
              </BodySmall>
            </div>

            {/* Units */}
            {metric?.units && (
              <div className="mb-3">
                <Caption className="font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  UNITS
                </Caption>
                <BodySmall className="text-slate-600 dark:text-slate-400">
                  {metric.units}
                </BodySmall>
              </div>
            )}

            {/* Notes */}
            {displayNotes && (
              <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                <Caption className="font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  NOTES
                </Caption>
                <BodySmall className="text-slate-600 dark:text-slate-400 italic">
                  {displayNotes}
                </BodySmall>
              </div>
            )}

            {/* Thresholds (if available) */}
            {metric?.thresholds && (
              <div className="border-t border-slate-200 dark:border-slate-700 pt-3 mt-3">
                <Caption className="font-semibold text-slate-600 dark:text-slate-400 mb-2">
                  THRESHOLDS
                </Caption>
                <div className="space-y-1">
                  {metric.thresholds.green !== undefined && (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <BodySmall className="text-slate-600 dark:text-slate-400">
                        Green (Safe): ≥ {metric.thresholds.green}{metric.units}
                      </BodySmall>
                    </div>
                  )}
                  {metric.thresholds.yellow !== undefined && (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <BodySmall className="text-slate-600 dark:text-slate-400">
                        Yellow (Warning): {metric.thresholds.yellow}-{metric.thresholds.green}{metric.units}
                      </BodySmall>
                    </div>
                  )}
                  {metric.thresholds.red !== undefined && (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <BodySmall className="text-slate-600 dark:text-slate-400">
                        Red (Critical): &lt; {metric.thresholds.yellow || metric.thresholds.red}{metric.units}
                      </BodySmall>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Arrow pointer */}
            <div className="absolute -top-2 left-4 w-4 h-4 bg-white dark:bg-slate-900 border-l-2 border-t-2 border-slate-200 dark:border-slate-700 transform rotate-45"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MetricTooltip;
