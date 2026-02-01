import React, { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AnalyticsDemo = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    const element = document.getElementById('analytics-demo');
    if (element) observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, []);

  useEffect(() => {
    if (isVisible && animationProgress < 100) {
      const timer = setTimeout(() => {
        setAnimationProgress(prev => Math.min(prev + 2, 100));
      }, 20);
      return () => clearTimeout(timer);
    }
  }, [isVisible, animationProgress]);

  // Sample data for profit by product
  const profitData = [
    { name: 'SKU-001', profit: 450 * (animationProgress / 100) },
    { name: 'SKU-002', profit: 320 * (animationProgress / 100) },
    { name: 'SKU-003', profit: 580 * (animationProgress / 100) },
    { name: 'SKU-004', profit: 290 * (animationProgress / 100) },
    { name: 'SKU-005', profit: 410 * (animationProgress / 100) }
  ];

  // ROI distribution data
  const roiData = [
    { name: '15-20% ROI', value: 45, color: '#3b82f6' },
    { name: '20-30% ROI', value: 35, color: '#06b6d4' },
    { name: '30%+ ROI', value: 20, color: '#10b981' }
  ];

  // Monthly trend data
  const trendData = [
    { month: 'Jan', profit: 2400 },
    { month: 'Feb', profit: 2800 },
    { month: 'Mar', profit: 3200 },
    { month: 'Apr', profit: 3600 },
    { month: 'May', profit: 4100 },
    { month: 'Jun', profit: 4500 }
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {payload[0].payload.name || payload[0].payload.month}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            €{Math.round(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <section id="analytics-demo" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div 
          className={`text-center mb-16 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            See Your Data in Action
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Real-time analytics dashboard preview
          </p>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 1. Profit by Product - Bar Chart */}
          <div 
            className={`bg-white dark:bg-gray-950 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-lg transition-all duration-700 delay-100 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '100ms' }}
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Profit by Product
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={profitData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  axisLine={{ stroke: '#374151' }}
                />
                <YAxis 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  axisLine={{ stroke: '#374151' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="profit" 
                  fill="#10b981"
                  radius={[8, 8, 0, 0]}
                  animationDuration={1500}
                  animationEasing="ease-out"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 2. ROI Distribution - Pie Chart */}
          <div 
            className={`bg-white dark:bg-gray-950 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-lg transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '200ms' }}
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              ROI Distribution
            </h3>
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
                  animationBegin={0}
                  animationDuration={1500}
                  animationEasing="ease-out"
                >
                  {roiData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {payload[0].name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {payload[0].value}%
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {roiData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-gray-700 dark:text-gray-300">{item.name}</span>
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Monthly Trend - Line Chart */}
          <div 
            className={`bg-white dark:bg-gray-950 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-lg transition-all duration-700 delay-300 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '300ms' }}
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Monthly Trend
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  axisLine={{ stroke: '#374151' }}
                />
                <YAxis 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  axisLine={{ stroke: '#374151' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="profit"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fill="url(#colorProfit)"
                  animationDuration={2000}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CTA below charts */}
        <div 
          className={`text-center mt-12 transition-all duration-700 delay-400 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            This is what you can track with Klein OS analytics
          </p>
          <a
            href="/register"
            className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-102"
          >
            Explore Dashboard
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default AnalyticsDemo;
