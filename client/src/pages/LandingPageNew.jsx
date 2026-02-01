import React from 'react';
import { Helmet } from 'react-helmet-async';
import Hero from '../components/Hero';
import ValueProps from '../components/ValueProps';
import HowItWorks from '../components/HowItWorks';
import AnalyticsDemo from '../components/AnalyticsDemo';
import PricingCards from '../components/PricingCards';
import FAQ from '../components/FAQ';
import FinalCTA from '../components/FinalCTA';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Helmet>
        <title>Klein OS - Professional Amazon FBA Analytics | €0, €49, Custom Pricing</title>
        <meta name="description" content="Professional Amazon FBA analytics for serious sellers. Calculate profit with precision. Used by sellers managing €100K+ in annual revenue. Honest pricing: €0 Free, €49 Pro, Custom Enterprise." />
        <meta name="keywords" content="Amazon FBA calculator, FBA profit calculator, Amazon analytics, EU VAT calculator, FBA fees calculator, Klein OS, professional FBA tools" />
        
        <meta property="og:title" content="Klein OS - Professional Amazon FBA Analytics" />
        <meta property="og:description" content="Stop guessing. Calculate profit with precision. Real-time FBA fees, VAT, and comprehensive analytics dashboard." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://klein-os.com" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Klein OS - Amazon FBA Analytics" />
        <meta name="twitter:description" content="Professional Amazon FBA analytics for serious sellers." />
        
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Klein OS",
            "applicationCategory": "BusinessApplication",
            "offers": [{
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "EUR"
            }, {
              "@type": "Offer",
              "price": "49",
              "priceCurrency": "EUR"
            }]
          })}
        </script>
      </Helmet>

      <Hero />
      <ValueProps />
      <HowItWorks />
      <AnalyticsDemo />
      <PricingCards />
      <FAQ />
      <FinalCTA />
    </div>
  );
};

export default LandingPage;
