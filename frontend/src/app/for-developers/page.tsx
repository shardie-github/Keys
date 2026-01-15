import Link from 'next/link';
import { Metadata } from 'next';
import { GuaranteeBadge } from '@/components/Features/GuaranteeBadge';
import { FeatureAvailabilityBadge } from '@/components/Features/FeatureAvailabilityBadge';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'For Developers - AI Co-Founder with Code Integration | Keys',
  description: 'Keys integrates seamlessly with Cursor and VS Code. Get AI-powered code assistance, operational automation, and institutional memory for your development workflow.',
};

export default function ForDevelopersPage() {
  return (
    <main id="main-content" className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-h1 font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
            AI Co-Founder for Developers
          </h1>
          <p className="text-body text-muted-foreground max-w-3xl mx-auto mb-8">
            Keys integrates seamlessly with Cursor and VS Code. Get AI-powered code assistance, operational automation, and institutional memory—all in your development workflow.
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-card rounded-lg p-8 border border-border shadow-sm">
            <div className="text-4xl mb-4">🔗</div>
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Cursor Integration
            </h2>
            <p className="text-muted-foreground mb-4">
              Keys works seamlessly with Cursor. Get context-aware automation that understands your codebase and operational needs.
            </p>
            <FeatureAvailabilityBadge status="available" />
          </div>
          <div className="bg-card rounded-lg p-8 border border-border shadow-sm">
            <div className="text-4xl mb-4">⚙️</div>
            <h2 className="text-2xl font-bold text-foreground mb-3">
              CI/CD Integration
            </h2>
            <p className="text-muted-foreground mb-4">
              GitHub Actions integration for automated code reviews, security checks, and deployment workflows.
            </p>
            <FeatureAvailabilityBadge status="available" />
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-h2 font-bold text-center text-foreground mb-8">
            Features Built for Developers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
              <div className="text-3xl mb-3">💻</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Code Assistance
              </h3>
              <p className="text-sm text-muted-foreground">
                Get AI-powered code suggestions, reviews, and optimizations. Context-aware assistance that understands your stack.
              </p>
            </div>
            <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
              <div className="text-3xl mb-3">🔒</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Security Scanning
              </h3>
              <p className="text-sm text-muted-foreground">
                Automatic security scanning of all code outputs. We guarantee security—we&apos;re liable if we miss vulnerabilities.
              </p>
            </div>
            <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
              <div className="text-3xl mb-3">🧠</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Institutional Memory
              </h3>
              <p className="text-sm text-muted-foreground">
                Remember what didn&apos;t work. Your failures become prevention rules. Never repeat the same mistakes.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-8 border border-border mb-12">
          <h2 className="text-h2 font-bold text-center text-foreground mb-8">
            Guarantees You Can Trust
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <GuaranteeBadge type="security" />
            <GuaranteeBadge type="compliance" />
            <GuaranteeBadge type="quality" />
            <GuaranteeBadge type="sla" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg p-8 sm:p-12 text-white text-center">
          <h2 className="text-h2 font-bold mb-4">
            Ready to Level Up Your Development?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
            Join thousands of developers who trust Keys for AI-powered code assistance and operational automation.
          </p>
          <Button asChild variant="secondary" size="lg">
            <Link href="/signup">Start Free Trial</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
