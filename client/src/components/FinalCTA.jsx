import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Github, Mail } from 'lucide-react';

const FinalCTA = () => {
  const [ref, inView] = useInView({
    threshold: 0.2,
    triggerOnce: true
  });

  return (
    <section ref={ref} className="relative py-20 bg-gradient-to-b from-gray-800 to-gray-900 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(59, 130, 246, 0.5) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Headline */}
        <motion.h2
          className="text-4xl sm:text-5xl font-bold text-white mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          Ready to calculate your real profit?
        </motion.h2>

        <motion.p
          className="text-xl text-gray-300 mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Join sellers already making data-driven decisions
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Link
            to="/calculator"
            className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-lg transition-all hover:scale-102 hover:shadow-lg hover:shadow-blue-500/50"
            style={{ transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            Start Free Now
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
          
          <a
            href="mailto:sales@klein-os.com"
            className="inline-flex items-center justify-center px-8 py-4 border-2 border-gray-600 text-gray-200 hover:bg-gray-800 hover:border-gray-500 text-lg font-semibold rounded-lg transition-all"
          >
            <Calendar className="mr-2 w-5 h-5" />
            Schedule Demo
          </a>
        </motion.div>

        {/* Footer Links */}
        <motion.div
          className="pt-12 border-t border-gray-700"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="flex flex-wrap justify-center gap-8 mb-6">
            <Link to="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">
              Terms
            </Link>
            <a href="mailto:legal@klein-os.com" className="text-sm text-gray-400 hover:text-white transition-colors">
              Contact
            </a>
            <a href="https://status.klein-os.com" className="text-sm text-gray-400 hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">
              Status
            </a>
          </div>

          {/* Social Links */}
          <div className="flex justify-center gap-6 mb-6">
            <a
              href="https://github.com/klein-os"
              className="text-gray-400 hover:text-white transition-colors"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <Github className="w-6 h-6" />
            </a>
            <a
              href="mailto:hello@klein-os.com"
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Email"
            >
              <Mail className="w-6 h-6" />
            </a>
          </div>

          <div className="flex flex-col items-center gap-2">
            <p className="text-sm text-gray-400">
              Germany-hosted. GDPR-compliant. No data sharing.
            </p>
            <p className="text-sm text-gray-500">
              © 2026 Klein OS. Building transparent tools for Amazon sellers.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCTA;
