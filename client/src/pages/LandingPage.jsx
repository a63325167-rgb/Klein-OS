import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  BarChart3, 
  Calculator, 
  Shield, 
  Globe, 
  CheckCircle,
  Menu,
  X,
  Sun,
  Moon,
  Github,
  Mail,
  ChevronDown,
  Database,
  Lock,
  Download,
  FileText,
  HelpCircle,
  Zap
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [activeFaq, setActiveFaq] = useState(null);
  const { theme, toggleTheme } = useTheme();

  // Value propositions - honest, no fake numbers
  const valueProps = [
    {
      icon: Calculator,
      title: 'Accurate Calculator',
      description: 'Real-time FBA fees, VAT calculations, and currency conversions for EU markets.'
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Track profitability across your product portfolio with detailed breakdowns.'
    },
    {
      icon: Globe,
      title: 'Built for EU Sellers',
      description: 'GDPR-compliant, Germany-hosted infrastructure built for European Amazon sellers.'
    }
  ];

  // How it works - simple 3-step process
  const steps = [
    {
      number: '01',
      title: 'Add Product Data',
      description: 'Enter your product details or upload via CSV for bulk analysis.'
    },
    {
      number: '02',
      title: 'Calculate Profitability',
      description: 'Our engine processes FBA fees, VAT, shipping, and all costs in real-time.'
    },
    {
      number: '03',
      title: 'Make Informed Decisions',
      description: 'Review detailed breakdowns and export your analysis for further planning.'
    }
  ];

  // Honest pricing - early-stage, subject to change
  const pricingTiers = [
    {
      name: 'FREE',
      price: '€0',
      period: 'forever',
      description: 'Perfect for testing the waters',
      features: [
        'Basic calculator',
        '5 products per month',
        'Web access only',
        'Community support'
      ],
      cta: 'Try Free Calculator',
      ctaLink: '/calculator',
      highlighted: false
    },
    {
      name: 'PRO',
      price: '€29',
      period: 'month',
      description: 'For serious sellers',
      features: [
        'Unlimited products',
        'Advanced analytics',
        'Bulk upload (CSV/Excel)',
        'Export functionality',
        'Email support',
        '30-day free trial'
      ],
      cta: 'Start Free Trial',
      ctaLink: '/register',
      highlighted: true
    },
    {
      name: 'ENTERPRISE',
      price: 'Custom',
      period: 'contact us',
      description: 'For teams and agencies',
      features: [
        'Everything in Pro',
        'Custom integration',
        'Priority support',
        'Dedicated account manager',
        'SLA guarantees'
      ],
      cta: 'Contact Sales',
      ctaLink: 'mailto:sales@klein-os.com',
      highlighted: false
    }
  ];

  // FAQ - address real concerns
  const faqs = [
    {
      question: 'How accurate are the calculations?',
      answer: 'We use official Amazon FBA fee structures and real-time VAT rates for EU countries. Our calculations are based on publicly available Amazon fee schedules and are updated regularly. However, always verify critical business decisions with your own accounting.'
    },
    {
      question: 'Do you store my product data?',
      answer: 'Yes, if you create an account. We store your product data securely in Germany-based servers (GDPR-compliant). You can export or delete your data at any time. Free calculator usage doesn\'t require an account or store data.'
    },
    {
      question: 'Can I export my analysis?',
      answer: 'Pro and Enterprise plans include CSV/Excel export functionality. This allows you to integrate our analysis into your existing workflows and share with team members.'
    },
    {
      question: 'How is this different from spreadsheet calculators?',
      answer: 'We automate the complex formulas and keep fee structures up-to-date. Our analytics dashboard also provides visual insights and portfolio-level tracking that spreadsheets can\'t easily provide.'
    },
    {
      question: 'What about privacy and GDPR compliance?',
      answer: 'We\'re hosted in Germany, fully GDPR-compliant, and built with privacy-first principles. We don\'t sell your data, we don\'t use tracking pixels, and you control your data with full export and deletion rights.'
    },
    {
      question: 'Is this ready for production use?',
      answer: 'We\'re in early-stage MVP. The calculator works and calculations are accurate, but we\'re actively building and improving. Expect bugs, missing features, and changes. We\'re transparent about our development progress on GitHub.'
    }
  ];

  const handleEarlyAccessSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement early access signup
    console.log('Early access signup:', emailInput);
    alert('Thank you! We\'ll notify you when new features launch.');
    setEmailInput('');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* SEO Meta Tags */}
      <title>Amazon FBA Profit Calculator | Klein-OS</title>
      
      {/* 1. HEADER/NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <div className="text-2xl font-bold tracking-tight">
                <span className="text-gray-900 dark:text-white">klein</span>
                <span className="text-blue-600 dark:text-blue-500">-os</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                Home
              </Link>
              <Link to="/calculator" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                Calculator
              </Link>
              <a href="#faq" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                Docs
              </a>
              <Link to="/register" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                Demo
              </Link>
              <Link to="/register" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
                Sign Up
              </Link>
              
              {/* Dark/Light toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-800">
              <div className="space-y-3">
                <Link to="/" className="block text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white" onClick={() => setIsMenuOpen(false)}>
                  Home
                </Link>
                <Link to="/calculator" className="block text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white" onClick={() => setIsMenuOpen(false)}>
                  Calculator
                </Link>
                <a href="#faq" className="block text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white" onClick={() => setIsMenuOpen(false)}>
                  Docs
                </a>
                <Link to="/register" className="block text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white" onClick={() => setIsMenuOpen(false)}>
                  Demo
                </Link>
                <Link to="/register" className="block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg text-center" onClick={() => setIsMenuOpen(false)}>
                  Sign Up
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-white dark:from-blue-950/20 dark:to-gray-950"></div>
        
        <div className="relative max-w-5xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
            Professional Amazon FBA<br />
            <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
              Analytics for Serious Sellers
            </span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
            Calculate profitability with precision. No guessing.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link
              to="/calculator"
              className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
            >
              Try Free Calculator
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center px-8 py-4 border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-600 text-lg font-semibold rounded-lg transition-all"
            >
              Book Demo
            </Link>
          </div>

          {/* Clean illustration placeholder - no stock photos */}
          <div className="relative max-w-4xl mx-auto">
            <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex items-center justify-center">
              <div className="text-gray-400 dark:text-gray-600">
                <Calculator className="w-24 h-24" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. VALUE PROP (3 COLUMNS - NO FAKE NUMBERS) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {valueProps.map((prop, index) => (
              <div key={index} className="bg-white dark:bg-gray-950 p-8 rounded-xl border border-gray-200 dark:border-gray-800">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950 rounded-lg flex items-center justify-center mb-6">
                  <prop.icon className="w-6 h-6 text-blue-600 dark:text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {prop.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {prop.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS (3-STEP) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Simple, straightforward, no hype
            </p>
          </div>

          <div className="space-y-12">
            {steps.map((step, index) => (
              <div key={index} className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-blue-600 text-white rounded-lg flex items-center justify-center text-2xl font-bold">
                    {step.number}
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. PRICING SECTION (3 TIERS - HONEST) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">
              Choose what works for you
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 italic">
              Early-stage pricing. Subject to change.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingTiers.map((tier, index) => (
              <div
                key={index}
                className={`relative bg-white dark:bg-gray-950 rounded-xl border-2 p-8 ${
                  tier.highlighted
                    ? 'border-blue-600 dark:border-blue-500 shadow-xl'
                    : 'border-gray-200 dark:border-gray-800'
                }`}
              >
                {tier.highlighted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                    {tier.name}
                  </h3>
                  <div className="flex items-baseline justify-center mb-2">
                    <span className="text-5xl font-bold text-gray-900 dark:text-white">
                      {tier.price}
                    </span>
                    {tier.price !== 'Custom' && (
                      <span className="text-gray-600 dark:text-gray-400 ml-2">
                        /{tier.period}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    {tier.description}
                  </p>
                </div>

                <ul className="space-y-4 mb-8">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to={tier.ctaLink}
                  className={`block w-full text-center py-3 px-6 rounded-lg font-semibold transition-all ${
                    tier.highlighted
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FAQ (ADDRESS REAL CONCERNS) */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Honest answers to real concerns
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                >
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-500 transition-transform ${
                      activeFaq === index ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>
                {activeFaq === index && (
                  <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. EARLY ACCESS CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 to-blue-700">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Join Our Early-Access List
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Get notified when new features launch
          </p>
          
          <form onSubmit={handleEarlyAccessSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="your@email.com"
              required
              className="flex-1 px-6 py-4 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button
              type="submit"
              className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Notify Me
            </button>
          </form>
          
          <p className="text-sm text-blue-200 mt-4">
            No spam. Unsubscribe anytime.
          </p>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="bg-gray-900 dark:bg-black text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><Link to="/calculator" className="hover:text-white transition-colors">Calculator</Link></li>
                <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">Terms</Link></li>
                <li><a href="mailto:legal@klein-os.com" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="https://status.klein-os.com" className="hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">Status</a></li>
                <li><a href="https://github.com/klein-os" className="hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">GitHub</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Connect</h3>
              <div className="flex space-x-4">
                <a href="https://github.com/klein-os" className="hover:text-white transition-colors" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                  <Github className="w-6 h-6" />
                </a>
                <a href="mailto:hello@klein-os.com" className="hover:text-white transition-colors" aria-label="Email">
                  <Mail className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-sm mb-4 sm:mb-0">
              © 2026 Klein-OS. Hosted in Germany. GDPR-compliant.
            </p>
            <p className="text-sm text-gray-500">
              Building transparent tools for Amazon sellers.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
