import Link from 'next/link';
import { Metadata } from 'next';
import { GuaranteeBadge } from '@/components/Features/GuaranteeBadge';
import { FeatureAvailabilityBadge } from '@/components/Features/FeatureAvailabilityBadge';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'For Founders - Your AI Co-Founder for New Ventures | Keys',
  description: 'Keys is your AI co-founder for new ventures. Get strategic support, business automation, and venture planning—all without giving up equity.',
};

export default function ForFoundersPage() {
  return (
    <main id="main-content" className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-h1 font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
            Your AI Co-Founder for New Ventures
          </h1>
          <p className="text-body text-muted-foreground max-w-3xl mx-auto mb-8">
            Building a new venture? Keys is your operational AI co-founder that handles business automation, strategic planning, and operational intelligence—all without giving up equity.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="default" size="lg">
              <Link href="/signup">Start Free Trial</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </div>
        </div>

        <div className="bg-card rounded-lg p-8 border border-border mb-12">
          <h2 className="text-h2 font-bold text-foreground mb-8 text-center">
            Why Founders Choose Keys
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-3">💼</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No Equity Required
              </h3>
              <p className="text-sm text-muted-foreground">
                Get co-founder-level support for $29/month. No equity, no dilution, just results.
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🚀</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Strategic Support
              </h3>
              <p className="text-sm text-muted-foreground">
                Get help with business planning, market analysis, and growth strategy. <FeatureAvailabilityBadge status="coming-soon" className="ml-2" />
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">⚙️</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Operational Automation
              </h3>
              <p className="text-sm text-muted-foreground">
                Automate workflows, streamline processes, and focus on building while Keys handles operations.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-h2 font-bold text-center text-foreground mb-8">
            Features Built for Founders
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Business Planning
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Generate business plans, market analysis, and financial models. Get strategic insights for your venture.
              </p>
              <FeatureAvailabilityBadge status="coming-soon" />
            </div>
            <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Investor Pitch Decks
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Create compelling investor pitch decks with data-driven insights and professional formatting.
              </p>
              <FeatureAvailabilityBadge status="coming-soon" />
            </div>
            <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
              <div className="text-3xl mb-3">📈</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Market Analysis
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Get competitive analysis, market sizing, and growth opportunity identification.
              </p>
              <FeatureAvailabilityBadge status="coming-soon" />
            </div>
            <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
              <div className="text-3xl mb-3">🤖</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Operational Automation
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Automate workflows, streamline processes, and build institutional memory that scales with your venture.
              </p>
              <FeatureAvailabilityBadge status="available" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-8 border border-border mb-12">
          <h2 className="text-h2 font-bold text-center text-foreground mb-8">
            Guarantees You Can Trust
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <GuaranteeBadge type="security" />
            <GuaranteeBadge type="compliance" />
            <GuaranteeBadge type="quality" />
            <GuaranteeBadge type="sla" />
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-800 dark:text-green-200">
              <strong>Why Guarantees Matter:</strong> As a founder, you can&apos;t afford security incidents or compliance violations. We&apos;re liable if we miss something. One prevented incident saves $10K-$100K+.
            </p>
          </div>
        </div>

        <div className="text-center mb-12">
          <h2 className="text-h2 font-bold text-foreground mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-body text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start with our Pro plan at $29/month. Get co-founder-level support without giving up equity.
          </p>
          <Button asChild variant="default" size="lg">
            <Link href="/pricing">View Pricing Plans</Link>
          </Button>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg p-8 sm:p-12 text-white text-center">
          <h2 className="text-h2 font-bold mb-4">
            Ready to Build Your Venture?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
            Join thousands of founders who trust Keys as their AI co-founder. Start your free trial today.
          </p>
          <Button asChild variant="secondary" size="lg">
            <Link href="/signup">Start Free Trial</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
