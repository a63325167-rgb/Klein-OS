import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Lightbulb, 
  TrendingUp, 
  Target, 
  Euro,
  ArrowRight,
  CheckCircle,
  BarChart3,
  DollarSign,
  Package,
  Zap
} from 'lucide-react';

const Recommendations = () => {
  const [hoveredCard, setHoveredCard] = useState(null);

  const recommendations = [
    {
      icon: TrendingUp,
      title: "Price Test +5% → +2.8pp margin",
      description: "Your 28.4% margin allows price testing. Increasing to €104.99 (+5%) improves margin to 31.2% with minimal conversion impact.",
      impact: "€2,100 additional profit/year",
      action: "A/B test ready",
      color: "green",
      gradient: "from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20",
      borderColor: "border-green-200 dark:border-green-700",
      iconColor: "text-green-600 dark:text-green-400",
      textColor: "text-green-800 dark:text-green-200",
      badge: "High Impact"
    },
    {
      icon: DollarSign,
      title: "Negotiation Opportunity: Save €2.40/unit on COGS",
      description: "Your current COGS of €45/unit has room for optimization. Negotiate with suppliers for bulk discounts or alternative suppliers.",
      impact: "€1,200 savings on 500 units",
      action: "Supplier negotiation",
      color: "blue",
      gradient: "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20",
      borderColor: "border-blue-200 dark:border-blue-700",
      iconColor: "text-blue-600 dark:text-blue-400",
      textColor: "text-blue-800 dark:text-blue-200",
      badge: "Medium Impact"
    },
    {
      icon: Zap,
      title: "PPC Headroom: Spend €12/unit for 25%+ ROAS",
      description: "With €23.68 profit/unit, you can afford €12/unit PPC while maintaining 20%+ margin. Test Amazon Sponsored Products.",
      impact: "Potential 40% sales increase",
      action: "PPC campaign setup",
      color: "purple",
      gradient: "from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20",
      borderColor: "border-purple-200 dark:border-purple-700",
      iconColor: "text-purple-600 dark:text-purple-400",
      textColor: "text-purple-800 dark:text-purple-200",
      badge: "High Impact"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <section className="py-20 bg-white dark:bg-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 rounded-full text-sm font-medium mb-6">
            <Lightbulb className="w-4 h-4 mr-2" />
            AI Recommendations
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            AI-Driven Insights
            <span className="block text-purple-600 dark:text-purple-400">
              That Actually Work
            </span>
          </h2>
          
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Get actionable recommendations with quantified impact. Our AI analyzes your data 
            to suggest specific optimizations that boost your profitability.
          </p>
        </motion.div>

        {/* Recommendations Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid lg:grid-cols-3 gap-8"
        >
          {recommendations.map((rec, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              onHoverStart={() => setHoveredCard(index)}
              onHoverEnd={() => setHoveredCard(null)}
              whileHover={{ 
                y: -12,
                scale: 1.05,
                transition: { duration: 0.3 }
              }}
              className={`relative bg-gradient-to-br ${rec.gradient} rounded-2xl p-8 border-2 ${rec.borderColor} shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group`}
            >
              {/* Badge */}
              <div className="absolute -top-3 -right-3">
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  rec.badge === 'High Impact' 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' 
                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
                }`}>
                  {rec.badge}
                </div>
              </div>

              {/* Icon */}
              <div className="flex items-center justify-center w-16 h-16 bg-white dark:bg-slate-800 rounded-xl shadow-md mb-6 group-hover:scale-110 transition-transform duration-300">
                <rec.icon className={`w-8 h-8 ${rec.iconColor}`} />
              </div>

              {/* Title */}
              <h3 className={`text-xl font-bold ${rec.textColor} mb-4`}>
                {rec.title}
              </h3>

              {/* Description */}
              <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                {rec.description}
              </p>

              {/* Impact & Action */}
              <div className="space-y-4">
                {/* Impact */}
                <div className={`bg-white dark:bg-slate-800 ${rec.borderColor} rounded-lg p-4`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Target className={`w-4 h-4 ${rec.iconColor}`} />
                    <span className={`text-sm font-medium ${rec.textColor}`}>Impact</span>
                  </div>
                  <div className={`text-lg font-bold ${rec.textColor}`}>
                    {rec.impact}
                  </div>
                </div>

                {/* Action */}
                <div className={`bg-white dark:bg-slate-800 ${rec.borderColor} rounded-lg p-4`}>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className={`w-4 h-4 ${rec.iconColor}`} />
                    <span className={`text-sm font-medium ${rec.textColor}`}>Action</span>
                  </div>
                  <div className={`text-sm ${rec.textColor}`}>
                    {rec.action}
                  </div>
                </div>
              </div>

              {/* Hover Arrow */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ 
                  opacity: hoveredCard === index ? 1 : 0,
                  x: hoveredCard === index ? 0 : -10
                }}
                className="absolute bottom-6 right-6"
              >
                <ArrowRight className={`w-5 h-5 ${rec.iconColor}`} />
              </motion.div>

              {/* Decorative Elements */}
              <div className="absolute top-6 right-6 w-2 h-2 bg-current opacity-20 rounded-full group-hover:scale-150 transition-transform duration-300"></div>
              <div className="absolute bottom-6 left-6 w-1 h-1 bg-current opacity-30 rounded-full group-hover:scale-200 transition-transform duration-300"></div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl p-8 border border-purple-200 dark:border-purple-700"
        >
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">15%</div>
              <div className="text-slate-600 dark:text-slate-300">Average Profit Increase</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">€2,100</div>
              <div className="text-slate-600 dark:text-slate-300">Avg Annual Savings</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">85%</div>
              <div className="text-slate-600 dark:text-slate-300">Recommendation Success Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 mb-2">24h</div>
              <div className="text-slate-600 dark:text-slate-300">Implementation Time</div>
            </div>
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Get Personalized Recommendations
            </h3>
            <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
              Upload your product data and receive AI-powered recommendations tailored to your 
              specific business model and market conditions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="inline-flex items-center px-6 py-3 bg-white text-purple-600 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <BarChart3 className="w-5 h-5 mr-2" />
                Get My Recommendations
              </button>
              <button className="inline-flex items-center px-6 py-3 bg-purple-700 hover:bg-purple-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <Package className="w-5 h-5 mr-2" />
                Upload Product Data
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Recommendations;
