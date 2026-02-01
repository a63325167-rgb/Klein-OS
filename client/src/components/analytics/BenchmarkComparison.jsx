import React from 'react';
import { motion } from 'framer-motion';
import { Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

/**
 * BenchmarkComparison Component
 * Displays a metric with benchmark comparison bars and contextual information
 */
const BenchmarkComparison = ({ 
  label, 
  value, 
  valueFormatted, 
  comparison, 
  additionalInfo,
  showPercentile = true,
  reverseScale = false,
  className = ''
}) => {
  const { benchmark, percentile, status, message, color } = comparison;
  const { low, average, high, exceptional } = benchmark;
  const [avgLow, avgHigh] = average;
  
  // Calculate position on scale (0-100)
  const calculatePosition = () => {
    const min = low * 0.5; // Start scale at half of low benchmark
    const max = exceptional * 1.2; // End scale at 120% of exceptional benchmark
    const range = max - min;
    
    // Clamp value between min and max
    const clampedValue = Math.max(min, Math.min(value, max));
    
    // Calculate percentage position
    let position = ((clampedValue - min) / range) * 100;
    
    // If reverse scale (lower is better), invert the position
    if (reverseScale) {
      position = 100 - position;
    }
    
    return Math.max(0, Math.min(100, position));
  };
  
  // Get color classes based on comparison color
  const getColorClasses = () => {
    const colors = {
      emerald: {
        bg: 'bg-emerald-500',
        text: 'text-emerald-600 dark:text-emerald-400',
        light: 'bg-emerald-100 dark:bg-emerald-900/20',
        border: 'border-emerald-200 dark:border-emerald-800'
      },
      green: {
        bg: 'bg-teal-700',
        text: 'text-teal-600 dark:text-teal-500',
        light: 'bg-teal-100 dark:bg-teal-900/20',
        border: 'border-teal-200 dark:border-teal-800'
      },
      blue: {
        bg: 'bg-blue-700',
        text: 'text-blue-600 dark:text-blue-500',
        light: 'bg-blue-100 dark:bg-blue-900/20',
        border: 'border-blue-200 dark:border-blue-800'
      },
      yellow: {
        bg: 'bg-amber-500',
        text: 'text-amber-600 dark:text-amber-400',
        light: 'bg-amber-100 dark:bg-amber-900/20',
        border: 'border-amber-200 dark:border-amber-800'
      },
      red: {
        bg: 'bg-red-500',
        text: 'text-red-600 dark:text-red-400',
        light: 'bg-red-100 dark:bg-red-900/20',
        border: 'border-red-200 dark:border-red-800'
      }
    };
    
    return colors[color] || colors.blue;
  };
  
  const colorClasses = getColorClasses();
  const position = calculatePosition();

  // Select status icon based on color intent
  const StatusIcon = () => {
    if (color === 'red') return <XCircle className="w-4 h-4" />;
    if (color === 'yellow') return <AlertTriangle className="w-4 h-4" />;
    // emerald/green considered positive
    return <CheckCircle className="w-4 h-4" />;
  };
  
  // Format benchmark values
  const formatValue = (val) => {
    if (typeof valueFormatted === 'function') {
      return valueFormatted(val);
    }
    return val.toFixed(1);
  };
  
  return (
    <div className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</span>
          <div className="relative group">
            <Info className="w-4 h-4 text-slate-400 cursor-help" />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded shadow-lg text-xs w-48 hidden group-hover:block z-10">
              Benchmark data based on industry standards for similar products
            </div>
          </div>
        </div>
        <div className="text-lg font-bold text-slate-800 dark:text-white">
          {typeof valueFormatted === 'string' ? valueFormatted : formatValue(value)}
        </div>
      </div>
      
      {/* Your product vs benchmarks */}
      <div className="mb-3">
        <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mb-1">
          <span className="w-1/4">Poor</span>
          <span className="w-1/4 text-center">Below Avg</span>
          <span className="w-1/4 text-center">Average</span>
          <span className="w-1/4 text-right">Excellent</span>
        </div>
        
        <div className="relative h-6 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          {/* Benchmark zones */}
          <div className="absolute inset-0 flex">
            <div className="h-full bg-red-100 dark:bg-red-900/20" style={{ width: `${(low - (low * 0.5)) / (exceptional * 1.2 - low * 0.5) * 100}%` }} />
            <div className="h-full bg-amber-100 dark:bg-amber-900/20" style={{ width: `${(avgLow - low) / (exceptional * 1.2 - low * 0.5) * 100}%` }} />
            <div className="h-full bg-blue-100 dark:bg-blue-900/20" style={{ width: `${(avgHigh - avgLow) / (exceptional * 1.2 - low * 0.5) * 100}%` }} />
            <div className="h-full bg-green-100 dark:bg-green-900/20" style={{ width: `${(high - avgHigh) / (exceptional * 1.2 - low * 0.5) * 100}%` }} />
            <div className="h-full bg-emerald-100 dark:bg-emerald-900/20" style={{ width: `${(exceptional * 1.2 - high) / (exceptional * 1.2 - low * 0.5) * 100}%` }} />
          </div>
          
          {/* Your product marker */}
          <motion.div 
            className={`absolute top-0 h-full w-3 ${colorClasses.bg} shadow-lg`}
            style={{ left: `calc(${position}% - 6px)` }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          />
          
          {/* Benchmark markers */}
          <div className="absolute top-0 h-full w-px bg-slate-400 dark:bg-slate-500" style={{ left: `${(low - (low * 0.5)) / (exceptional * 1.2 - low * 0.5) * 100}%` }} />
          <div className="absolute top-0 h-full w-px bg-slate-400 dark:bg-slate-500" style={{ left: `${(avgLow - (low * 0.5)) / (exceptional * 1.2 - low * 0.5) * 100}%` }} />
          <div className="absolute top-0 h-full w-px bg-slate-400 dark:bg-slate-500" style={{ left: `${(avgHigh - (low * 0.5)) / (exceptional * 1.2 - low * 0.5) * 100}%` }} />
          <div className="absolute top-0 h-full w-px bg-slate-400 dark:bg-slate-500" style={{ left: `${(high - (low * 0.5)) / (exceptional * 1.2 - low * 0.5) * 100}%` }} />
        </div>
      </div>
      
      {/* Comparison details */}
      <div className="space-y-1.5">
        <div className="flex items-center text-sm">
          <span className="w-6 flex-shrink-0">└─</span>
          <span className="text-slate-600 dark:text-slate-400">Your product: {typeof valueFormatted === 'string' ? valueFormatted : formatValue(value)}</span>
          {additionalInfo && (
            <span className="ml-1 text-slate-500 dark:text-slate-400">({additionalInfo})</span>
          )}
        </div>
        
        <div className="flex items-center text-sm">
          <span className="w-6 flex-shrink-0">└─</span>
          <span className="text-slate-600 dark:text-slate-400">
            {reverseScale ? 'Target range' : 'Category average'}: {formatValue(avgLow)}-{formatValue(avgHigh)}
            {reverseScale ? '' : '%'}
          </span>
        </div>
        
        <div className="flex items-center text-sm">
          <span className="w-6 flex-shrink-0">└─</span>
          <span className={`font-medium ${colorClasses.text} inline-flex items-center gap-1`}>
            <StatusIcon /> {status} - {message}
            {showPercentile && percentile ? ` (${reverseScale ? 'bottom' : 'top'} ${reverseScale ? percentile : 100-percentile}%)` : ''}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BenchmarkComparison;
