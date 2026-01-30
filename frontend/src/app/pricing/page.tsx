import { Metadata } from 'next';
import { PricingSection, PricingFAQ } from '@/components/PricingSection';

export const metadata: Metadata = {
  title: 'Pricing - Keys',
  description: 'Start for free with our open source edition, or upgrade to managed cloud for enterprise features and peace of mind.',
  openGraph: {
    title: 'Pricing - Keys',
    description: 'Transparent pricing that scales with you. Open source forever free, or managed cloud for teams.',
  },
};

export const runtime = 'nodejs';

export default function PricingPage() {
  return (
    <main id="main-content" className="min-h-screen bg-white dark:bg-slate-950">
      <div className="pt-16 pb-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Start free and scale as you grow. No hidden fees, no surprises.
          </p>
        </div>
      </div>
      <PricingSection />
      <PricingFAQ />
    </main>
  );
}
