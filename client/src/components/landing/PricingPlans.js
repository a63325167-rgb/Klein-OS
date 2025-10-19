import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  Star, 
  Zap, 
  Crown,
  Euro,
  Target,
  BarChart3,
  Lightbulb,
  FileSpreadsheet,
  Globe,
  Users,
  ArrowRight,
  Award
} from 'lucide-react';

const PricingPlans = () => {
  const [isYearly, setIsYearly] = useState(false);

  const plans = [
    {
      name: "Free",
      price: { monthly: 0, yearly: 0 },
      description: "Perfect for getting started",
      icon: Target,
      color: "gray",
      gradient: "from-slate-50 to-slate-100 dark:from-slate-900/20 dark:to-slate-800/20",
      borderColor: "border-slate-200 dark:border-slate-700",
      textColor: "text-slate-800 dark:text-slate-200",
      iconColor: "text-slate-600 dark:text-slate-400",
      features: [
        "5 product analyses per month",
        "Basic EU VAT calculations",
        "Standard break-even analysis",
        "Email support",
        "Basic analytics dashboard"
      ],
      limitations: [
        "Limited to 5 analyses",
        "No bulk upload",
        "No AI recommendations"
      ],
      cta: "Start Free",
      popular: false
    },
    {
      name: "Pro",
      price: { monthly: 29, yearly: 290 },
      description: "Most popular for growing businesses",
      icon: Zap,
      color: "blue",
      gradient: "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20",
      borderColor: "border-blue-200 dark:border-blue-700",
      textColor: "text-blue-800 dark:text-blue-200",
      iconColor: "text-blue-600 dark:text-blue-400",
      features: [
        "Unlimited product analyses",
        "Advanced EU VAT calculations",
        "Input-VAT reclaim analysis",
        "Bulk upload (500+ SKUs)",
        "AI-powered recommendations",
        "Break-even scenario planning",
        "Priority support",
        "Advanced analytics dashboard",
        "Export to Excel/PDF",
        "API access"
      ],
      limitations: [],
      cta: "Start Pro Trial",
      popular: true
    },
    {
      name: "Enterprise",
      price: { monthly: 99, yearly: 990 },
      description: "For large-scale operations",
      icon: Crown,
      color: "purple",
      gradient: "from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20",
      borderColor: "border-purple-200 dark:border-purple-700",
      textColor: "text-purple-800 dark:text-purple-200",
      iconColor: "text-purple-600 dark:text-purple-400",
      features: [
        "Everything in Pro",
        "Unlimited team members",
        "Custom VAT rate configurations",
        "White-label dashboard",
        "Dedicated account manager",
        "Custom integrations",
        "Advanced reporting",
        "Priority feature requests",
        "SLA guarantee",
        "Training sessions"
      ],
      limitations: [],
      cta: "Contact Sales",
      popular: false
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

  const getPlanColor = (color) => {
    switch (color) {
      case 'blue':
        return {
          bg: 'bg-blue-600 hover:bg-blue-700',
          text: 'text-blue-600 dark:text-blue-400',
          border: 'border-blue-200 dark:border-blue-700'
        };
      case 'purple':
        return {
          bg: 'bg-purple-600 hover:bg-purple-700',
          text: 'text-purple-600 dark:text-purple-400',
          border: 'border-purple-200 dark:border-purple-700'
        };
      default:
        return {
          bg: 'bg-slate-600 hover:bg-slate-700',
          text: 'text-slate-600 dark:text-slate-400',
          border: 'border-slate-200 dark:border-slate-700'
        };
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
          <div className="inline-flex items-center px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full text-sm font-medium mb-6">
            <Euro className="w-4 h-4 mr-2" />
            Pricing Plans
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            Choose Your Plan
            <span className="block text-green-600 dark:text-green-400">
              Start Free, Scale Up
            </span>
          </h2>
          
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Start with our free plan and upgrade as your business grows. All plans include 
            accurate EU VAT calculations and profit optimization features.
          </p>
        </motion.div>

        {/* Billing Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="flex items-center justify-center mb-12"
        >
          <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-1 flex">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                !isYearly
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                isYearly
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Yearly
              <span className="ml-2 inline-flex items-center px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full text-xs font-medium">
                Save 17%
              </span>
            </button>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid lg:grid-cols-3 gap-8"
        >
          {plans.map((plan, index) => {
            const colors = getPlanColor(plan.color);
            const currentPrice = isYearly ? plan.price.yearly : plan.price.monthly;
            const monthlyPrice = isYearly ? plan.price.yearly / 12 : plan.price.monthly;
            
            return (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover={{ 
                  y: plan.popular ? -12 : -8,
                  scale: plan.popular ? 1.05 : 1.02,
                  transition: { duration: 0.3 }
                }}
                className={`relative bg-gradient-to-br ${plan.gradient} rounded-2xl p-8 border-2 ${plan.borderColor} shadow-lg hover:shadow-xl transition-all duration-300 ${
                  plan.popular ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium">
                      <Star className="w-4 h-4 mr-2" />
                      Most Popular
                    </div>
                  </div>
                )}

                {/* Plan Header */}
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center w-16 h-16 bg-white dark:bg-slate-800 rounded-xl shadow-md mb-4 mx-auto">
                    <plan.icon className={`w-8 h-8 ${plan.iconColor}`} />
                  </div>
                  
                  <h3 className={`text-2xl font-bold ${plan.textColor} mb-2`}>
                    {plan.name}
                  </h3>
                  
                  <p className="text-slate-600 dark:text-slate-300 mb-4">
                    {plan.description}
                  </p>
                  
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-slate-900 dark:text-white">
                      €{currentPrice}
                    </span>
                    <span className="text-slate-600 dark:text-slate-300">
                      {isYearly ? '/year' : '/month'}
                    </span>
                    {isYearly && plan.price.monthly > 0 && (
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        €{Math.round(monthlyPrice)}/month
                      </div>
                    )}
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-slate-600 dark:text-slate-300">
                        {feature}
                      </span>
                    </div>
                  ))}
                  
                  {plan.limitations.map((limitation, limitIndex) => (
                    <div key={limitIndex} className="flex items-start">
                      <div className="w-5 h-5 text-slate-400 mr-3 mt-0.5 flex-shrink-0">•</div>
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {limitation}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <button className={`w-full py-3 px-6 ${colors.bg} text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
                  {plan.cta}
                </button>

                {/* Decorative Elements */}
                <div className="absolute top-6 right-6 w-2 h-2 bg-current opacity-20 rounded-full"></div>
                <div className="absolute bottom-6 left-6 w-1 h-1 bg-current opacity-30 rounded-full"></div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Ready to Start Your Free Trial?
            </h3>
            <p className="text-green-100 mb-6 max-w-2xl mx-auto">
              Join thousands of Amazon sellers who trust our platform for accurate 
              EU VAT calculations and profit optimization.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="inline-flex items-center px-6 py-3 bg-white text-green-600 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <Target className="w-5 h-5 mr-2" />
                Start Free Trial
              </button>
              <button className="inline-flex items-center px-6 py-3 bg-green-700 hover:bg-green-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <Users className="w-5 h-5 mr-2" />
                Contact Sales
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingPlans;
