import Link from 'next/link';
import { Metadata } from 'next';
import { Badge } from '@/components/ui/badge';
import { GuaranteeBadge } from '@/components/Features/GuaranteeBadge';

export const metadata: Metadata = {
  title: 'Pricing - Keys: Your AI Co-Founder for Operational Automation',
  description: 'Choose the plan that fits your operational needs. Your AI co-founder for business automation, process intelligence, and institutional memory.',
};

export default function PricingPage() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Try Keys risk-free. Build your institutional memory.',
      features: [
        '50 AI runs per month',
        '50K tokens per month',
        '5 custom templates',
        '2 exports per month',
        'Community support',
        'Basic analytics',
        '✅ Failure pattern tracking (unlimited)',
        '✅ Basic safety checks',
        '✅ Pattern matching (unlimited)',
      ],
      guarantees: [],
      cta: 'Get Started',
      ctaLink: '/signup',
      popular: false,
    },
    {
      name: 'Pro',
      price: '$29',
      period: 'per month',
      description: 'Your operational AI co-founder. Automate workflows and build institutional memory.',
      features: [
        '1,000 AI runs per month',
        '1M tokens per month',
        '100 custom templates',
        '50 exports per month',
        'Priority support',
        'Advanced analytics',
        'Template sharing',
        'Background suggestions',
        '✅ Unlimited operational automation',
        '✅ Unlimited institutional memory',
      ],
      guarantees: ['security', 'compliance', 'quality'],
      cta: 'Start Free Trial',
      ctaLink: '/signup?plan=pro',
      popular: true,
    },
    {
      name: 'Pro+',
      price: '$79',
      period: 'per month',
      description: 'Power users running daily operations. Full Cursor integration included.',
      features: [
        'Everything in Pro',
        '5,000 AI runs per month',
        '5M tokens per month',
        'Unlimited templates',
        'Unlimited exports',
        '✅ Cursor Integration (VS Code/Cursor)',
        '✅ CI/CD Integration (GitHub Actions)',
        '✅ Advanced operational intelligence',
        '✅ Cross-project learning',
      ],
      guarantees: ['security', 'compliance', 'quality'],
      cta: 'Upgrade to Pro+',
      ctaLink: '/signup?plan=pro-plus',
      popular: false,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'Teams that need scale, SLAs, and dedicated support.',
      features: [
        'Everything in Pro+',
        'Unlimited AI runs',
        'Unlimited tokens',
        'Unlimited templates',
        'Unlimited exports',
        'Multi-user organizations',
        'Dedicated support',
        'Custom integrations',
        '✅ SLA Guarantee (99.9% uptime)',
        '✅ Advanced operational analytics',
        '✅ Custom workflow automation',
        '✅ Audit Logs',
        '✅ SSO (enterprise security)',
        '💰 Usage-based pricing available',
      ],
      guarantees: ['security', 'compliance', 'quality', 'sla'],
      cta: 'Contact Sales',
      ctaLink: '/profile/settings?contact=sales',
      popular: false,
    },
  ];

  return (
    <main id="main-content" className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container-wide page-padding">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-h1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Your AI Co-Founder for Operational Automation
          </h1>
          <p className="text-body text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-6">
            Choose the plan that fits your operational needs. Your AI co-founder works alongside Cursor to automate business operations and build institutional memory.
          </p>
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 max-w-2xl mx-auto">
            <p className="text-body-sm text-green-800 dark:text-green-200">
              <strong>Value:</strong> $29/month gets you an AI co-founder for operational automation. <strong>No equity, just results.</strong> See{' '}
              <Link href="#value-calculation" className="underline font-semibold hover:text-green-900 dark:hover:text-green-100 transition-colors">
                value calculation
              </Link>
              .
            </p>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-standard mb-12">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-lg shadow-md transition-all ${
                plan.popular
                  ? 'ring-2 ring-blue-500 scale-105 sm:scale-100 bg-white dark:bg-slate-800'
                  : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:shadow-lg'
              }`}
            >
              {/* Badge for popular plan */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge variant="success" size="default">
                    Most Popular
                  </Badge>
                </div>
              )}

              {/* Plan Content */}
              <div className="p-6 sm:p-8 flex flex-col flex-grow">
                {/* Plan Header */}
                <div className="text-center mb-6">
                  <h3 className="text-h4 font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline justify-center mb-2">
                    <span className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-body-sm text-gray-600 dark:text-gray-400 ml-2">
                        /{plan.period}
                      </span>
                    )}
                  </div>
                  <p className="text-body-sm text-gray-600 dark:text-gray-400">{plan.description}</p>
                </div>

                {/* Features List */}
                <ul className="space-y-3 mb-6 flex-grow">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <svg
                        className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                      >
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-body-sm text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Guarantees */}
                {plan.guarantees && plan.guarantees.length > 0 && (
                  <div className="mb-6 space-y-2 border-t border-gray-200 dark:border-slate-700 pt-6">
                    <h4 className="text-h4 text-gray-900 dark:text-gray-100 mb-3 text-sm font-semibold">
                      Included Guarantees
                    </h4>
                    <div className="space-y-2">
                      {plan.guarantees.map((guarantee) => (
                        <GuaranteeBadge
                          key={guarantee}
                          type={guarantee as 'security' | 'compliance' | 'sla' | 'quality'}
                          className="!p-2 inline-block text-xs"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* CTA Button */}
                <Link
                  href={plan.ctaLink}
                  className={`w-full text-center px-6 py-3 rounded-lg font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 focus:ring-blue-500'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-slate-600 focus:ring-gray-400'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-h2 text-center mb-8 text-gray-900 dark:text-gray-100">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-slate-700">
              <h3 className="text-h4 mb-2 text-gray-900 dark:text-gray-100">
                Can I change plans later?
              </h3>
              <p className="text-body-sm text-gray-600 dark:text-gray-400">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we&apos;ll prorate any charges.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-slate-700">
              <h3 className="text-h4 mb-2 text-gray-900 dark:text-gray-100">
                What happens if I exceed my limits?
              </h3>
              <p className="text-body-sm text-gray-600 dark:text-gray-400">
                You&apos;ll receive a notification when you&apos;re approaching your limits. Once exceeded, you&apos;ll need to upgrade to continue using the feature.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-slate-700">
              <h3 className="text-h4 mb-2 text-gray-900 dark:text-gray-100">
                Do you offer refunds?
              </h3>
              <p className="text-body-sm text-gray-600 dark:text-gray-400">
                Yes, we offer a 14-day money-back guarantee for Pro plans. Enterprise plans are custom and refunds are handled on a case-by-case basis.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-slate-700">
              <h3 className="text-h4 mb-2 text-gray-900 dark:text-gray-100">
                What payment methods do you accept?
              </h3>
              <p className="text-body-sm text-gray-600 dark:text-gray-400">
                We accept all major credit cards via Stripe. Enterprise customers can arrange invoicing.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-slate-700">
              <h3 className="text-h4 mb-2 text-gray-900 dark:text-gray-100">
                What are your guarantees?
              </h3>
              <p className="text-body-sm text-gray-600 dark:text-gray-400 mb-4">
                Pro and Pro+ plans include security, compliance, and quality guarantees. Enterprise plans add SLA guarantees. See our{' '}
                <Link href="/docs/TERMS_OF_SERVICE.md" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Terms of Service
                </Link>
                {' '}for details.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <GuaranteeBadge type="security" className="!p-2 text-xs" />
                <GuaranteeBadge type="compliance" className="!p-2 text-xs" />
                <GuaranteeBadge type="quality" className="!p-2 text-xs" />
                <GuaranteeBadge type="sla" className="!p-2 text-xs" />
              </div>
            </div>
            <div id="value-calculation" className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-slate-700">
              <h3 className="text-h4 mb-2 text-gray-900 dark:text-gray-100">
                What value does Keys provide?
              </h3>
              <p className="text-body-sm text-gray-600 dark:text-gray-400 mb-3">
                $29/month gets you an AI co-founder for operational automation:
              </p>
              <ul className="list-disc list-inside space-y-1 text-body-sm text-gray-600 dark:text-gray-400">
                <li>Operational automation: Automate workflows and routine tasks</li>
                <li>Institutional memory: Build knowledge that scales with your business</li>
                <li>Process intelligence: Learn from your operations to improve efficiency</li>
                <li>Cursor integration: Works seamlessly with your development workflow</li>
              </ul>
              <p className="text-body-sm text-gray-600 dark:text-gray-400 mt-3">
                <strong>Value:</strong> Focus on building while Keys handles operational automation. <strong>No equity, just results.</strong>
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-12 text-center">
          <p className="text-body-sm text-gray-600 dark:text-gray-400 mb-4">
            Still have questions?{' '}
            <Link href="/profile/settings" className="text-blue-600 dark:text-blue-400 hover:underline">
              Contact our support team
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
