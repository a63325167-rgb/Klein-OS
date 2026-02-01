import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, AlertCircle, Info, XCircle } from 'lucide-react';
import { SEVERITY } from '../utils/inputValidation';

/**
 * ValidationWarnings Component
 * Displays input validation warnings and errors
 */
const ValidationWarnings = ({ warnings, className = '' }) => {
  if (!warnings || warnings.length === 0) {
    return null;
  }

  const getIcon = (severity) => {
    switch (severity) {
      case SEVERITY.ERROR:
        return <XCircle className="w-5 h-5" />;
      case SEVERITY.WARNING:
        return <AlertTriangle className="w-5 h-5" />;
      case SEVERITY.INFO:
        return <Info className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getStyles = (severity) => {
    switch (severity) {
      case SEVERITY.ERROR:
        return {
          container: 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700',
          icon: 'text-red-600 dark:text-red-400',
          text: 'text-red-800 dark:text-red-200',
          badge: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
        };
      case SEVERITY.WARNING:
        return {
          container: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700',
          icon: 'text-yellow-600 dark:text-yellow-400',
          text: 'text-yellow-800 dark:text-yellow-200',
          badge: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300'
        };
      case SEVERITY.INFO:
        return {
          container: 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700',
          icon: 'text-blue-600 dark:text-blue-400',
          text: 'text-blue-800 dark:text-blue-200',
          badge: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
        };
      default:
        return {
          container: 'bg-gray-50 dark:bg-gray-900/20 border-gray-300 dark:border-gray-700',
          icon: 'text-gray-600 dark:text-gray-400',
          text: 'text-gray-800 dark:text-gray-200',
          badge: 'bg-gray-100 dark:bg-gray-900/40 text-gray-700 dark:text-gray-300'
        };
    }
  };

  // Group by severity
  const errors = warnings.filter(w => w.severity === SEVERITY.ERROR);
  const warningsList = warnings.filter(w => w.severity === SEVERITY.WARNING);
  const infoList = warnings.filter(w => w.severity === SEVERITY.INFO);

  return (
    <div className={`space-y-3 ${className}`}>
      <AnimatePresence>
        {/* Errors - Always show first */}
        {errors.map((warning, index) => {
          const styles = getStyles(warning.severity);
          return (
            <motion.div
              key={`error-${index}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: index * 0.05 }}
              className={`border-2 rounded-xl p-4 ${styles.container}`}
            >
              <div className="flex items-start gap-3">
                <div className={styles.icon}>
                  {getIcon(warning.severity)}
                </div>
                <div className="flex-1">
                  {warning.badge && (
                    <span className={`inline-block px-2 py-1 rounded text-xs font-bold mb-2 ${styles.badge}`}>
                      {warning.badge}
                    </span>
                  )}
                  <p className={`text-sm font-semibold ${styles.text}`}>
                    {warning.message}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Warnings */}
        {warningsList.map((warning, index) => {
          const styles = getStyles(warning.severity);
          return (
            <motion.div
              key={`warning-${index}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: (errors.length + index) * 0.05 }}
              className={`border rounded-lg p-3 ${styles.container}`}
            >
              <div className="flex items-start gap-3">
                <div className={styles.icon}>
                  {getIcon(warning.severity)}
                </div>
                <div className="flex-1">
                  {warning.badge && (
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold mb-1 ${styles.badge}`}>
                      {warning.badge}
                    </span>
                  )}
                  <p className={`text-sm ${styles.text}`}>
                    {warning.message}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Info - Only show if no errors */}
        {errors.length === 0 && infoList.map((warning, index) => {
          const styles = getStyles(warning.severity);
          return (
            <motion.div
              key={`info-${index}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: (errors.length + warningsList.length + index) * 0.05 }}
              className={`border rounded-lg p-3 ${styles.container}`}
            >
              <div className="flex items-start gap-3">
                <div className={styles.icon}>
                  {getIcon(warning.severity)}
                </div>
                <div className="flex-1">
                  {warning.badge && (
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold mb-1 ${styles.badge}`}>
                      {warning.badge}
                    </span>
                  )}
                  <p className={`text-sm ${styles.text}`}>
                    {warning.message}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default ValidationWarnings;
