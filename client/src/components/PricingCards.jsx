import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';

const PricingCards = () => {
  const [ref, inView] = useInView({
    threshold: 0.2,
    triggerOnce: true
  });

  const pricingTiers = [
    {
      name: 'STARTER',
      price: '€0',
      period: 'Forever',
      tagline: 'Perfect for testing',
      features: [
        '10 products/month',
        'Basic calculator',
        'Web access only',
        'Community support'
      ],
      cta: 'Get Started Free',
      ctaLink: '/calculator',
      highlighted: false,
      delay: 0.6
    },
    {
      name: 'PROFESSIONAL',
      price: '€49',
      period: '/month',
      annualNote: 'or €470/year, save €118',
      tagline: 'For serious sellers',
      badge: 'Most Popular',
      features: [
        'Unlimited products',
        'Advanced analytics',
        'Bulk CSV/Excel upload',
        'PDF export',
        'Email support',
        '30-day free trial'
      ],
      cta: 'Start Free Trial',
      ctaLink: '/register',
      highlighted: true,
      delay: 0.5
    },
    {
      name: 'ENTERPRISE',
      price: 'Custom',
      period: 'Contact sales',
      tagline: 'For agencies & teams',
      features: [
        'Everything in Pro +',
        'API access',
        'Custom integrations',
        'Dedicated account manager',
        'Priority support',
        'SLA guarantees'
      ],
      cta: 'Get in Touch',
      ctaLink: 'mailto:sales@klein-os.com',
      highlighted: false,
      delay: 0.7
    }
  ];

  return (
    <section id="pricing" ref={ref} className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Choose the plan that fits your business
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {pricingTiers.map((tier, index) => (
            <motion.div
              key={index}
              className="relative"
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.6,
                delay: tier.delay,
                ease: [0.16, 1, 0.3, 1]
              }}
            >
              <div
                className={`relative bg-white dark:bg-gray-800 rounded-2xl h-full flex flex-col ${
                  tier.highlighted
                    ? 'border-2 border-blue-500 shadow-xl shadow-blue-500/20 lg:transform lg:scale-105 pt-12 px-6 pb-8 md:px-8'
                    : 'border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl p-6 md:p-8'
                } transition-all duration-300`}
              >
                {/* Badge */}
                {tier.badge && (
                  <motion.div
                    className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={inView ? { scale: 1, rotate: 0 } : {}}
                    transition={{ duration: 0.6, delay: tier.delay + 0.2 }}
                  >
                    <span className="inline-block bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-xl whitespace-nowrap">
                      {tier.badge}
                    </span>
                  </motion.div>
                )}

                {/* Top Border Accent for Highlighted */}
                {tier.highlighted && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-2xl" />
                )}

                {/* Header */}
                <div className="text-center mb-6">
                  <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                    {tier.name}
                  </h3>
                  <div className="mb-2">
                    <span className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white">
                      {tier.price}
                    </span>
                    {tier.period !== 'Forever' && tier.period !== 'Contact sales' && (
                      <span className="text-gray-600 dark:text-gray-400 text-lg ml-2">
                        {tier.period}
                      </span>
                    )}
                  </div>
                  {tier.period === 'Forever' && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{tier.period}</p>
                  )}
                  {tier.period === 'Contact sales' && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{tier.period}</p>
                  )}
                  {tier.annualNote && (
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium mt-1">
                      {tier.annualNote}
                    </p>
                  )}
                  <p className="text-gray-600 dark:text-gray-400 mt-2">{tier.tagline}</p>
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8 flex-1">
                  {tier.features.map((feature, featureIndex) => (
                    <motion.li
                      key={featureIndex}
                      className="flex items-start"
                      initial={{ opacity: 0, x: -10 }}
                      animate={inView ? { opacity: 1, x: 0 } : {}}
                      transition={{
                        duration: 0.4,
                        delay: tier.delay + 0.3 + featureIndex * 0.05
                      }}
                    >
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300 text-sm">{feature}</span>
                    </motion.li>
                  ))}
                </ul>

                {/* CTA Button */}
                {tier.ctaLink.startsWith('mailto:') ? (
                  <a
                    href={tier.ctaLink}
                    className={`block w-full text-center py-3.5 px-6 rounded-lg font-semibold transition-all ${
                      tier.highlighted
                        ? 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-102 hover:shadow-lg hover:shadow-blue-500/50'
                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                    }`}
                    style={{ transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
                  >
                    {tier.cta}
                  </a>
                ) : (
                  <Link
                    to={tier.ctaLink}
                    className={`block w-full text-center py-3.5 px-6 rounded-lg font-semibold transition-all ${
                      tier.highlighted
                        ? 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-102 hover:shadow-lg hover:shadow-blue-500/50'
                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                    }`}
                    style={{ transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
                  >
                    {tier.cta}
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Note */}
        <motion.p
          className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 1 }}
        >
          Pricing is final. No hidden fees. Cancel anytime.
        </motion.p>
      </div>
    </section>
  );
};

export default PricingCards;
