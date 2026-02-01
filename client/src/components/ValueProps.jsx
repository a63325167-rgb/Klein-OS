import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { CheckCircle, BarChart3, Shield, TrendingUp } from 'lucide-react';

const ValueProps = () => {
  const [ref, inView] = useInView({
    threshold: 0.2,
    triggerOnce: true
  });

  const valueProps = [
    {
      icon: TrendingUp,
      title: 'Accurate to the €',
      description: 'Real-time FBA fees, VAT, currency conversion. No approximations.',
      delay: 0
    },
    {
      icon: BarChart3,
      title: 'Business Intelligence',
      description: 'Track profitability across portfolio. Identify winners. Cut losers.',
      delay: 0.2
    },
    {
      icon: Shield,
      title: 'EU-Compliant',
      description: 'GDPR-ready, Germany-hosted, privacy-first. Your data is yours.',
      delay: 0.4
    }
  ];

  return (
    <section ref={ref} className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {valueProps.map((prop, index) => (
            <motion.div
              key={index}
              className="relative group"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.6,
                delay: prop.delay,
                ease: [0.16, 1, 0.3, 1]
              }}
            >
              <div className="bg-white dark:bg-gray-800 p-8 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 hover:shadow-lg">
                {/* Icon with animation */}
                <motion.div
                  className="w-14 h-14 bg-blue-100 dark:bg-blue-950 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-500 dark:group-hover:bg-blue-600 transition-colors duration-300"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={inView ? { scale: 1, rotate: 0 } : {}}
                  transition={{
                    duration: 0.8,
                    delay: prop.delay + 0.2,
                    ease: [0.16, 1, 0.3, 1]
                  }}
                >
                  <prop.icon className="w-7 h-7 text-blue-600 dark:text-blue-400 group-hover:text-white transition-colors duration-300" />
                </motion.div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {prop.title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {prop.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValueProps;
