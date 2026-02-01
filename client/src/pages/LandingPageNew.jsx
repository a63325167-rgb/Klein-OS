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
        <title>Klein OS - Financial Analytics for Amazon, eBay & Shopify | €0, €49, Custom</title>
        <meta name="description" content="E-commerce financial analytics for Amazon, eBay, and Shopify sellers. Calculate profit, fees, VAT, and shipping costs with precision. Used by sellers managing €100K+ revenue. Pricing: €0 Free, €49 Pro, Custom Enterprise." />
        <meta name="keywords" content="Amazon profit calculator, eBay fee calculator, Shopify analytics, e-commerce financial tools, FBA calculator, online seller tools, EU VAT calculator, Klein OS" />
        
        <meta property="og:title" content="Klein OS - E-Commerce Financial Analytics" />
        <meta property="og:description" content="Financial analytics for Amazon, eBay & Shopify. Calculate profit with precision. Real-time fees, VAT, shipping, and comprehensive analytics dashboard." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://klein-os.com" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Klein OS - E-Commerce Financial Analytics" />
        <meta name="twitter:description" content="Financial analytics for Amazon, eBay & Shopify sellers. Calculate profit with precision." />
        
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
