import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AnalyticsDemo = () => {
  const [animationProgress, setAnimationProgress] = useState(0);
  const [ref, inView] = useInView({
    threshold: 0.2,
    triggerOnce: true
  });

  useEffect(() => {
    if (inView && animationProgress < 100) {
      const timer = setTimeout(() => {
        setAnimationProgress(prev => Math.min(prev + 2, 100));
      }, 20);
      return () => clearTimeout(timer);
    }
  }, [inView, animationProgress]);

  const profitData = [
    { name: 'SKU-001', profit: 450 * (animationProgress / 100) },
    { name: 'SKU-002', profit: 320 * (animationProgress / 100) },
    { name: 'SKU-003', profit: 580 * (animationProgress / 100) },
    { name: 'SKU-004', profit: 290 * (animationProgress / 100) },
    { name: 'SKU-005', profit: 410 * (animationProgress / 100) }
  ];

  const roiData = [
    { name: '15-20% ROI', value: 45, color: '#3b82f6' },
    { name: '20-30% ROI', value: 35, color: '#06b6d4' },
    { name: '30%+ ROI', value: 20, color: '#10b981' }
  ];

  const trendData = [
    { month: 'Jan', profit: 1800 },
    { month: 'Feb', profit: 2100 },
    { month: 'Mar', profit: 2450 },
    { month: 'Apr', profit: 3200 },
    { month: 'May', profit: 3800 },
    { month: 'Jun', profit: 4500 }
  ];

  return (
    <section ref={ref} className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            See What You Get
          </h2>
          <p className="text-xl text-gray-400">
            Real-time analytics dashboard preview
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Bar Chart */}
          <motion.div
            className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg hover:border-blue-500 transition-all duration-300"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h3 className="text-lg font-bold text-white mb-4">Profit by Product</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={profitData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                  itemStyle={{ color: '#10b981' }}
                />
                <Bar dataKey="profit" fill="#10b981" radius={[8, 8, 0, 0]} animationDuration={1500} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Pie Chart */}
          <motion.div
            className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg hover:border-blue-500 transition-all duration-300"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-lg font-bold text-white mb-4">ROI Distribution</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={roiData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  animationDuration={1500}
                >
                  {roiData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {roiData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                    <span className="text-gray-300">{item.name}</span>
                  </div>
                  <span className="font-medium text-white">{item.value}%</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Line Chart */}
          <motion.div
            className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg hover:border-blue-500 transition-all duration-300"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h3 className="text-lg font-bold text-white mb-4">Monthly Trend</h3>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                  itemStyle={{ color: '#3b82f6' }}
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fill="url(#colorProfit)"
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AnalyticsDemo;
