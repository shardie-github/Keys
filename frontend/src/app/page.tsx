import Link from 'next/link';
import { Metadata } from 'next';
import { SocialProofWithRealMetrics } from '@/components/CRO/SocialProofWithRealMetrics';
import { UpgradePrompt } from '@/components/Upsell/UpgradePrompt';

export const metadata: Metadata = {
  title: 'Keys - Your AI Co-Founder for Operational Automation',
  description: 'Your day-to-day AI co-founder that works alongside Cursor. Operational automation, business process intelligence, and institutional memory. No equity, just results.',
  openGraph: {
    title: 'Keys - Your AI Co-Founder for Operational Automation',
    description: 'Your day-to-day AI co-founder that works alongside Cursor. Operational automation and business process intelligence.',
  },
};

export default function Home() {
  return (
    <main id="main-content" className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Hero Section */}
      <div className="max-w-4xl w-full text-center space-y-6 sm:space-y-8">
        {/* Main Heading */}
        <div className="space-y-4 sm:space-y-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
            Your AI Co-Founder for Operational Automation
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed font-semibold">
            Keys works alongside Cursor as your day-to-day operational AI co-founder. Business automation, process intelligence, and institutional memory—no equity required.
          </p>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
            Automate operations, streamline workflows, and build institutional knowledge. Your AI partner for running and scaling your business operations.
          </p>
          <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 max-w-2xl mx-auto">
            <p className="text-sm text-green-800 dark:text-green-200">
              <strong>Value:</strong> $29/month gets you an AI co-founder for operational automation. <strong>No equity, just results.</strong>{' '}
              <Link href="/pricing#value-calculation" className="underline font-semibold hover:text-green-900 dark:hover:text-green-100">
                See pricing
              </Link>
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center pt-4">
          <Link
            href="/chat"
            className="group relative px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 min-w-[200px] text-center"
            aria-label="Start chatting with your AI cofounder"
          >
            <span className="relative z-10">Start Chatting</span>
            <span className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200" aria-hidden="true" />
          </Link>
          <Link
            href="/profile"
            className="px-6 sm:px-8 py-3 sm:py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold text-base sm:text-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-700 min-w-[200px] text-center"
            aria-label="Setup your profile to personalize your experience"
          >
            Setup Profile
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-12 sm:mt-16">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-slate-700">
            <div className="text-3xl mb-3" aria-hidden="true">🤖</div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">AI Co-Founder</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your day-to-day operational partner. Works alongside Cursor to automate business operations, no equity required.
            </p>
          </div>
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-slate-700">
            <div className="text-3xl mb-3" aria-hidden="true">⚙️</div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Operational Automation</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Automate workflows, streamline processes, and handle routine operational tasks. Focus on building while Keys handles operations.
            </p>
          </div>
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-slate-700">
            <div className="text-3xl mb-3" aria-hidden="true">🧠</div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Institutional Memory</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Build knowledge over time. Your processes, decisions, and patterns become reusable intelligence for smarter operations.
            </p>
          </div>
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-slate-700">
            <div className="text-3xl mb-3" aria-hidden="true">🔗</div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Cursor Integration</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Seamlessly works with Cursor. Context-aware automation that understands your codebase and operational needs.
            </p>
          </div>
        </div>

        {/* Quick Links */}
        <nav className="pt-8 sm:pt-12" aria-label="Quick navigation links">
          <div className="flex flex-wrap gap-3 sm:gap-4 justify-center">
            <Link
              href="/dashboard"
              className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/profile/settings"
              className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg transition-colors"
            >
              Settings
            </Link>
            <Link
              href="/templates"
              className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg transition-colors"
            >
              Templates
            </Link>
            <Link
              href="/pricing"
              className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/docs/TERMS_OF_SERVICE.md"
              className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg transition-colors"
            >
              Terms
            </Link>
          </div>
        </nav>
      </div>

      {/* Social Proof Section */}
      <SocialProofWithRealMetrics />

      {/* Upgrade Prompt */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
        <UpgradePrompt variant="inline" />
      </div>
    </main>
  );
}
