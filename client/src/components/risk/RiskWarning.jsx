import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, X, AlertCircle } from 'lucide-react';
import { Caption, BodySmall } from '../ui/Typography';

/**
 * RiskWarning Component (B5)
 * 
 * Displays individual risk warning with:
 * - Color-coded severity (red/yellow/green)
 * - Clear title and message
 * - Current metric vs target threshold
 * - Actionable steps to fix
 * - Dismiss/Accept buttons
 */
const RiskWarning = ({ warning, onDismiss, onAccept }) => {
  // Don't render if dismissed
  if (warning.dismissed) {
    return null;
  }

  // Get color classes based on risk level
  const getColorClasses = (level) => {
    switch (level) {
      case 'red':
        return {
          border: 'border-red-500 dark:border-red-600',
          bg: 'bg-red-50 dark:bg-red-900/20',
          text: 'text-red-700 dark:text-red-400',
          iconBg: 'bg-red-100 dark:bg-red-800',
          icon: 'text-red-600 dark:text-red-400',
          badge: 'bg-red-600 dark:bg-red-700 text-white'
        };
      case 'yellow':
        return {
          border: 'border-yellow-500 dark:border-yellow-600',
          bg: 'bg-yellow-50 dark:bg-yellow-900/20',
          text: 'text-yellow-700 dark:text-yellow-400',
          iconBg: 'bg-yellow-100 dark:bg-yellow-800',
          icon: 'text-yellow-600 dark:text-yellow-400',
          badge: 'bg-yellow-600 dark:bg-yellow-700 text-white'
        };
      case 'green':
        return {
          border: 'border-green-500 dark:border-green-600',
          bg: 'bg-green-50 dark:bg-green-900/20',
          text: 'text-green-700 dark:text-green-400',
          iconBg: 'bg-green-100 dark:bg-green-800',
          icon: 'text-green-600 dark:text-green-400',
          badge: 'bg-green-600 dark:bg-green-700 text-white'
        };
      default:
        return {
          border: 'border-gray-500 dark:border-gray-600',
          bg: 'bg-gray-50 dark:bg-gray-900/20',
          text: 'text-gray-700 dark:text-gray-400',
          iconBg: 'bg-gray-100 dark:bg-gray-800',
          icon: 'text-gray-600 dark:text-gray-400',
          badge: 'bg-gray-600 dark:bg-gray-700 text-white'
        };
    }
  };

  // Get icon and label based on risk level
  const getIconAndLabel = (level) => {
    switch (level) {
      case 'red':
        return {
          icon: <AlertTriangle className="w-5 h-5" />,
          emoji: '🔴',
          label: 'Critical Risk'
        };
      case 'yellow':
        return {
          icon: <AlertCircle className="w-5 h-5" />,
          emoji: '⚠️',
          label: 'Warning'
        };
      case 'green':
        return {
          icon: <CheckCircle className="w-5 h-5" />,
          emoji: '✅',
          label: 'Safe'
        };
      default:
        return {
          icon: <AlertCircle className="w-5 h-5" />,
          emoji: '●',
          label: 'Info'
        };
    }
  };

  const colors = getColorClasses(warning.level);
  const { icon, emoji, label } = getIconAndLabel(warning.level);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`border-2 rounded-lg p-4 mb-3 ${colors.border} ${colors.bg}`}
    >
      <div className="flex justify-between items-start gap-4">
        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-1.5 rounded-lg ${colors.iconBg}`}>
              <div className={colors.icon}>{icon}</div>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
              {warning.title}
            </h3>
            <span className={`text-xs font-semibold px-2 py-1 rounded ${colors.badge}`}>
              {label}
            </span>
          </div>

          {/* Message */}
          <BodySmall className={`mb-3 ${colors.text}`}>
            {warning.message}
          </BodySmall>

          {/* Metrics */}
          <div className="mb-3 p-2 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Caption className="text-slate-500 dark:text-slate-400 mb-0.5">
                  Current
                </Caption>
                <span className="text-sm font-semibold text-slate-800 dark:text-white">
                  {warning.metric}
                </span>
              </div>
              <div>
                <Caption className="text-slate-500 dark:text-slate-400 mb-0.5">
                  Target
                </Caption>
                <span className="text-sm font-semibold text-slate-800 dark:text-white">
                  {warning.threshold}
                </span>
              </div>
            </div>
          </div>

          {/* Action Items */}
          {warning.actionItems && warning.actionItems.length > 0 && (
            <div className="mb-2">
              <Caption className="font-semibold text-slate-800 dark:text-white mb-2">
                💡 What to do:
              </Caption>
              <ul className="space-y-1.5">
                {warning.actionItems.map((item, index) => (
                  <li
                    key={index}
                    className={`text-sm ${colors.text} flex items-start gap-2`}
                  >
                    <span className="mt-0.5">•</span>
                    <span className="flex-1">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={onDismiss}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            title="Dismiss warning"
          >
            <X className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </button>
          {warning.level === 'red' && onAccept && (
            <button
              onClick={onAccept}
              className="px-3 py-1.5 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
              title="Accept risk and proceed"
            >
              I Accept
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default RiskWarning;
