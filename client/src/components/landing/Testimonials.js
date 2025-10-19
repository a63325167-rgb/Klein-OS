import React from 'react';
import { motion } from 'framer-motion';
import { 
  Star, 
  Quote, 
  TrendingUp, 
  Euro,
  CheckCircle,
  Award,
  Users,
  Target
} from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Amazon FBA Seller",
      company: "TechGear Solutions",
      avatar: "SC",
      rating: 5,
      quote: "€320K revenue saved 15% in VAT errors—game changer. The EU VAT calculations are spot-on and the input-VAT reclaim feature alone paid for the subscription in the first month.",
      impact: "€48,000 saved in VAT errors",
      location: "Berlin, Germany",
      color: "blue"
    },
    {
      name: "Marcus Weber",
      role: "E-commerce Director",
      company: "EuroFulfillment",
      avatar: "MW",
      rating: 5,
      quote: "1000+ SKUs analyzed in 2 minutes. Unmatched accuracy. The AI recommendations helped us identify 12 underperforming products and optimize pricing across our entire portfolio.",
      impact: "23% profit increase",
      location: "Amsterdam, Netherlands",
      color: "green"
    },
    {
      name: "Elena Rodriguez",
      role: "Amazon FBA Specialist",
      company: "Iberian Commerce",
      avatar: "ER",
      rating: 5,
      quote: "Finally, a tool that understands EU VAT complexity. The break-even analysis and scenario planning features helped us make data-driven decisions that increased our margins by 18%.",
      impact: "€67,000 additional profit",
      location: "Madrid, Spain",
      color: "purple"
    }
  ];

  const stats = [
    { number: "1M+", label: "Products Analyzed", icon: Target },
    { number: "€2.1M", label: "Cost Savings", icon: Euro },
    { number: "98%", label: "Customer Satisfaction", icon: Star },
    { number: "15%", label: "Avg Profit Increase", icon: TrendingUp }
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

  const getColorClasses = (color) => {
    switch (color) {
      case 'blue':
        return {
          gradient: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
          border: 'border-blue-200 dark:border-blue-700',
          text: 'text-blue-800 dark:text-blue-200',
          icon: 'text-blue-600 dark:text-blue-400',
          bg: 'bg-blue-100 dark:bg-blue-900/30'
        };
      case 'green':
        return {
          gradient: 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20',
          border: 'border-green-200 dark:border-green-700',
          text: 'text-green-800 dark:text-green-200',
          icon: 'text-green-600 dark:text-green-400',
          bg: 'bg-green-100 dark:bg-green-900/30'
        };
      case 'purple':
        return {
          gradient: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20',
          border: 'border-purple-200 dark:border-purple-700',
          text: 'text-purple-800 dark:text-purple-200',
          icon: 'text-purple-600 dark:text-purple-400',
          bg: 'bg-purple-100 dark:bg-purple-900/30'
        };
      default:
        return {
          gradient: 'from-slate-50 to-slate-100 dark:from-slate-900/20 dark:to-slate-800/20',
          border: 'border-slate-200 dark:border-slate-700',
          text: 'text-slate-800 dark:text-slate-200',
          icon: 'text-slate-600 dark:text-slate-400',
          bg: 'bg-slate-100 dark:bg-slate-900/30'
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
          <div className="inline-flex items-center px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 rounded-full text-sm font-medium mb-6">
            <Star className="w-4 h-4 mr-2" />
            Customer Success
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            Trusted by 1M+ Amazon Sellers
            <span className="block text-amber-600 dark:text-amber-400">
              Worldwide
            </span>
          </h2>
          
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            See how our platform has helped Amazon sellers across Europe increase their profits 
            and optimize their operations with accurate EU VAT calculations.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid lg:grid-cols-3 gap-8 mb-16"
        >
          {testimonials.map((testimonial, index) => {
            const colors = getColorClasses(testimonial.color);
            return (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover={{ 
                  y: -8,
                  scale: 1.02,
                  transition: { duration: 0.3 }
                }}
                className={`relative bg-gradient-to-br ${colors.gradient} rounded-2xl p-8 border-2 ${colors.border} shadow-lg hover:shadow-xl transition-all duration-300`}
              >
                {/* Quote Icon */}
                <div className="absolute top-6 right-6">
                  <Quote className={`w-6 h-6 ${colors.icon} opacity-20`} />
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-amber-400 fill-current" />
                  ))}
                </div>

                {/* Quote */}
                <blockquote className={`text-lg ${colors.text} mb-6 leading-relaxed`}>
                  "{testimonial.quote}"
                </blockquote>

                {/* Impact Badge */}
                <div className={`inline-flex items-center px-3 py-2 ${colors.bg} ${colors.border} rounded-lg text-sm font-medium ${colors.text} mb-6`}>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  {testimonial.impact}
                </div>

                {/* Author */}
                <div className="flex items-center">
                  <div className={`w-12 h-12 ${colors.bg} rounded-full flex items-center justify-center mr-4`}>
                    <span className={`text-lg font-bold ${colors.text}`}>
                      {testimonial.avatar}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-300">
                      {testimonial.role}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {testimonial.company} • {testimonial.location}
                    </div>
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute bottom-4 left-4 w-2 h-2 bg-current opacity-20 rounded-full"></div>
                <div className="absolute top-4 left-4 w-1 h-1 bg-current opacity-30 rounded-full"></div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900/50 dark:to-blue-900/20 rounded-2xl p-8 border border-slate-200 dark:border-slate-700"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Trusted by Industry Leaders
            </h3>
            <p className="text-slate-600 dark:text-slate-300">
              Join thousands of successful Amazon sellers who rely on our platform for accurate profitability analysis.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-slate-600 dark:text-slate-300">
                  {stat.label}
                </div>
              </motion.div>
            ))}
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
          <div className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Ready to Join Our Success Stories?
            </h3>
            <p className="text-amber-100 mb-6 max-w-2xl mx-auto">
              Start your free analysis today and see how our platform can help you increase 
              your Amazon FBA profits with accurate EU VAT calculations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="inline-flex items-center px-6 py-3 bg-white text-amber-600 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <CheckCircle className="w-5 h-5 mr-2" />
                Start Free Analysis
              </button>
              <button className="inline-flex items-center px-6 py-3 bg-amber-700 hover:bg-amber-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <Users className="w-5 h-5 mr-2" />
                View All Testimonials
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
