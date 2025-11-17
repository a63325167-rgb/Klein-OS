import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lightbulb, 
  TrendingUp, 
  Target, 
  Euro,
  ArrowRight,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  BarChart3,
  DollarSign,
  Zap
} from 'lucide-react';

const AccordionRecommendations = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const recommendations = [
    {
      icon: TrendingUp,
      title: "Price Test +5% → +2.8pp margin",
      shortDescription: "Your 28.4% margin allows price testing with minimal conversion impact",
      fullDescription: "Your current 28.4% margin provides excellent headroom for price testing. Increasing to €104.99 (+5%) improves margin to 31.2% while maintaining strong profitability. Amazon typically sees less than 5% conversion drop for price increases under 5%.",
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
      shortDescription: "Your current COGS of €45/unit has room for optimization",
      fullDescription: "Your current COGS of €45/unit presents significant optimization opportunities. Consider negotiating bulk discounts with suppliers, exploring alternative suppliers, or implementing cost-saving measures in your supply chain.",
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
      shortDescription: "With €23.68 profit/unit, you can afford significant PPC investment",
      fullDescription: "With €23.68 profit per unit, you have substantial headroom for PPC investment. You can afford €12/unit in PPC while maintaining 20%+ margin. This opens opportunities for Amazon Sponsored Products campaigns to increase sales volume.",
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
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 20
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <section className="py-20 bg-slate-50 dark:bg-slate-900">
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
          
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
            AI-Driven Insights That Actually Work
          </h2>
          
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Get actionable recommendations with quantified impact. Our AI analyzes your data 
            to suggest specific optimizations that boost your profitability.
          </p>
        </motion.div>

        {/* Accordion */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-4"
        >
          {recommendations.map((rec, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className={`bg-gradient-to-br ${rec.gradient} rounded-2xl border-2 ${rec.borderColor} shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden`}
            >
              {/* Accordion Header */}
              <button
                onClick={() => toggleAccordion(index)}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-white/50 dark:hover:bg-slate-800/50 transition-colors duration-200"
              >
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className="flex items-center justify-center w-12 h-12 bg-white dark:bg-slate-800 rounded-lg shadow-md">
                    <rec.icon className={`w-6 h-6 ${rec.iconColor}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className={`text-lg font-bold ${rec.textColor}`}>
                        {rec.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        rec.badge === 'High Impact' 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' 
                          : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
                      }`}>
                        {rec.badge}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-sm">
                      {rec.shortDescription}
                    </p>
                  </div>
                </div>

                {/* Toggle Icon */}
                <div className="ml-4">
                  {openIndex === index ? (
                    <ChevronUp className={`w-5 h-5 ${rec.iconColor}`} />
                  ) : (
                    <ChevronDown className={`w-5 h-5 ${rec.iconColor}`} />
                  )}
                </div>
              </button>

              {/* Accordion Content */}
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 border-t border-slate-200 dark:border-slate-600">
                      <div className="pt-6">
                        {/* Full Description */}
                        <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                          {rec.fullDescription}
                        </p>

                        {/* Impact & Action */}
                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                          {/* Impact */}
                          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                            <div className="flex items-center gap-2 mb-2">
                              <Target className={`w-4 h-4 ${rec.iconColor}`} />
                              <span className={`text-sm font-medium ${rec.textColor}`}>Impact</span>
                            </div>
                            <div className={`text-lg font-bold ${rec.textColor}`}>
                              {rec.impact}
                            </div>
                          </div>

                          {/* Action */}
                          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle className={`w-4 h-4 ${rec.iconColor}`} />
                              <span className={`text-sm font-medium ${rec.textColor}`}>Action</span>
                            </div>
                            <div className={`text-sm ${rec.textColor}`}>
                              {rec.action}
                            </div>
                          </div>
                        </div>

                        {/* CTA Button */}
                        <button className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                          <BarChart3 className="w-5 h-5 mr-2" />
                          Implement This Recommendation
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
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
                <Target className="w-5 h-5 mr-2" />
                Upload Product Data
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AccordionRecommendations;








