import Link from 'next/link';
import { Metadata } from 'next';
import { CompetitorComparison } from '@/components/Comparison/CompetitorComparison';
import { GuaranteeBadge } from '@/components/Features/GuaranteeBadge';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Keys vs Competitors - Compare AI Co-Founder Solutions',
  description: 'Compare Keys with ChatGPT, Claude, Cursor, and Jasper. See why Keys is the only AI co-founder with security guarantees, institutional memory, and holistic business support.',
};

export default function ComparePage() {
  return (
    <main id="main-content" className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-h1 font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
            Keys vs. Competitors
          </h1>
          <p className="text-body text-muted-foreground max-w-3xl mx-auto">
            See how Keys compares to ChatGPT, Claude, Cursor, and Jasper. We&apos;re the only AI co-founder with security guarantees, institutional memory, and holistic business support.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
            <div className="text-3xl mb-3">🔒</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Security & Compliance Guarantees
            </h3>
            <p className="text-sm text-muted-foreground">
              We&apos;re the only one that guarantees security and compliance. We&apos;re liable if we miss vulnerabilities. Competitors aren&apos;t.
            </p>
          </div>
          <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
            <div className="text-3xl mb-3">🧠</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Institutional Memory
            </h3>
            <p className="text-sm text-muted-foreground">
              Your failures become prevention rules. We remember what didn&apos;t work so it never happens again. Competitors don&apos;t.
            </p>
          </div>
          <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
            <div className="text-3xl mb-3">🚀</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Holistic Business Support
            </h3>
            <p className="text-sm text-muted-foreground">
              We support every step of the way—code, operations, strategy, and growth. Competitors focus on one thing.
            </p>
          </div>
        </div>

        <div className="mb-12">
          <CompetitorComparison />
        </div>

        <div className="bg-card rounded-lg p-8 border border-border mb-12">
          <h2 className="text-h2 font-bold text-center text-foreground mb-8">
            Keys&apos; Unique Guarantees
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <GuaranteeBadge type="security" />
            <GuaranteeBadge type="compliance" />
            <GuaranteeBadge type="quality" />
            <GuaranteeBadge type="sla" />
          </div>
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-sm text-foreground">
              <strong>Why Guarantees Matter:</strong> One prevented security incident saves $10K-$100K+. One prevented compliance violation saves $50K-$500K+ in fines. We&apos;re liable if we miss something. Competitors aren&apos;t.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg p-8 sm:p-12 text-white mb-12">
          <h2 className="text-h2 font-bold mb-6 text-center">
            Why Choose Keys?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div>
              <h3 className="text-lg font-semibold mb-3">✅ What Keys Offers</h3>
              <ul className="space-y-2 text-sm">
                <li>• Security & compliance guarantees</li>
                <li>• Institutional memory (failure tracking)</li>
                <li>• Holistic business support</li>
                <li>• Business co-founder positioning</li>
                <li>• IDE & CI/CD integration</li>
                <li>• Venture strategy tools (coming soon)</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">❌ What Competitors Don&apos;t</h3>
              <ul className="space-y-2 text-sm">
                <li>• No security guarantees</li>
                <li>• No institutional memory</li>
                <li>• Single-purpose focus (code OR content)</li>
                <li>• General AI assistant positioning</li>
                <li>• Limited integrations</li>
                <li>• No business strategy tools</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-h2 font-bold text-foreground mb-4">
            Ready to Experience the Difference?
          </h2>
          <p className="text-body text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of founders and teams who trust Keys as their AI co-founder. Get started with a free trial.
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
      </div>
    </main>
  );
}
