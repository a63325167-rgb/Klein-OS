import React from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp, AlertTriangle } from 'lucide-react';

const statusColors = {
  invest: {
    dot: 'bg-red-500',
    text: 'text-red-600 dark:text-red-400',
    label: 'INVEST'
  },
  waiting: {
    dot: 'bg-amber-500',
    text: 'text-amber-600 dark:text-amber-400',
    label: 'WAITING'
  },
  breakeven: {
    dot: 'bg-green-500',
    text: 'text-green-600 dark:text-green-400',
    label: 'BREAK-EVEN'
  },
  profit: {
    dot: 'bg-emerald-500',
    text: 'text-emerald-600 dark:text-emerald-400',
    label: 'PROFIT'
  }
};

const CashFlowTimeline = ({ projection }) => {
  if (!projection || projection.months.length === 0) {
    return null;
  }

  const negativeMonths = projection.months.filter((m) => m.cumulative < 0);
  const needsReserve = projection.needsReserve;

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">Cash Flow Projection (6 Months)</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Plan inventory and cash reserves to survive the ramp-up.</p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase text-slate-400">Reserve Needed</p>
          <p className="text-lg font-semibold text-slate-800 dark:text-white">{projection.reserveNeededFormatted}</p>
        </div>
      </div>

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          {projection.months.map((month, index) => {
            const status = statusColors[month.status] || statusColors.profit;
            return (
              <div key={month.label} className="flex flex-col items-center gap-2 flex-1">
                <span className="text-xs font-semibold text-slate-500 uppercase">{month.label}</span>
                <div className="flex items-center gap-2">
                  {index === 0 ? (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  ) : (
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                  )}
                  <span className={`font-mono text-sm ${status.text}`}>{month.cashFlowFormatted}</span>
                </div>
                <div className="h-3 flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${status.dot}`} />
                  <span className="text-[10px] font-semibold text-slate-500 uppercase">{status.label}</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="hidden md:block absolute top-1/2 left-11 right-11 border-t-2 border-dashed border-slate-200 dark:border-slate-700" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {projection.months.map((month) => (
          <motion.div
            key={month.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: month.index * 0.05 }}
            className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-slate-50/70 dark:bg-slate-900/40"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-500 uppercase">{month.label}</span>
              <span className="text-xs px-2 py-1 rounded-full bg-white/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300">
                {month.phase}
              </span>
            </div>
            <p className={`text-lg font-bold ${month.cumulative >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {month.cumulativeFormatted}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{month.summary}</p>
          </motion.div>
        ))}
      </div>

      {needsReserve && (
        <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800 dark:text-amber-200">Cash Flow Risk</p>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              You will need at least {projection.reserveNeededFormatted} in reserve to survive the first {projection.negativeMonthCount} months of negative cash flow.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashFlowTimeline;
