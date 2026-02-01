import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Upload, Calculator, LineChart } from 'lucide-react';

const HowItWorks = () => {
  const [ref, inView] = useInView({
    threshold: 0.2,
    triggerOnce: true
  });

  const steps = [
    {
      number: '01',
      icon: Upload,
      title: 'Add Products',
      description: 'Upload products or enter details manually',
      delay: 0
    },
    {
      number: '02',
      icon: Calculator,
      title: 'Calculate Profitability',
      description: 'Our engine processes all costs in real-time',
      delay: 0.3
    },
    {
      number: '03',
      icon: LineChart,
      title: 'Make Decisions',
      description: 'Export analysis, compare products, scale fast',
      delay: 0.6
    }
  ];

  return (
    <section ref={ref} className="py-20 bg-white dark:bg-gray-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            How It Works
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400">
            Simple, straightforward, no hype
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <motion.div
                className="flex items-start gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12 last:mb-0"
                initial={{ opacity: 0, x: -30 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{
                  duration: 0.6,
                  delay: step.delay,
                  ease: [0.16, 1, 0.3, 1]
                }}
              >
                {/* Icon + Number */}
                <div className="flex-shrink-0">
                  <motion.div
                    className="relative w-16 h-16 sm:w-20 sm:h-20 bg-blue-600 rounded-xl flex items-center justify-center"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={inView ? { scale: 1, rotate: 0 } : {}}
                    transition={{
                      duration: 0.8,
                      delay: step.delay + 0.2,
                      ease: [0.16, 1, 0.3, 1]
                    }}
                  >
                    <step.icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-900 dark:bg-white rounded-full flex items-center justify-center text-xs font-bold text-white dark:text-gray-900">
                      {step.number}
                    </div>
                  </motion.div>
                </div>

                {/* Content */}
                <div className="flex-1 pt-2">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
                    {step.description}
                  </p>
                </div>
              </motion.div>

              {/* Connector Line (SVG) */}
              {index < steps.length - 1 && (
                <motion.div
                  className="absolute left-8 sm:left-10 top-16 sm:top-20 w-0.5 h-12 sm:h-16 bg-gradient-to-b from-blue-600 to-blue-400 origin-top"
                  initial={{ scaleY: 0 }}
                  animate={inView ? { scaleY: 1 } : {}}
                  transition={{
                    duration: 0.6,
                    delay: step.delay + 0.5,
                    ease: "easeOut"
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
