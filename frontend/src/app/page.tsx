import Link from 'next/link';
import { Metadata } from 'next';
import { SocialProofWithRealMetrics } from '@/components/CRO/SocialProofWithRealMetrics';
import { UpgradePrompt } from '@/components/Upsell/UpgradePrompt';
import { FeatureAvailabilityBadge } from '@/components/Features/FeatureAvailabilityBadge';
import { WelcomingHero } from '@/components/Home/WelcomingHero';
import { SituationEntryTiles } from '@/components/Home/SituationEntryTiles';

export const metadata: Metadata = {
  title: 'KEYS - The Keyring to Modern Tools',
  description: 'You already have the tools. Here are the keys to unlock them. KEYS is a marketplace of structured assets (notebooks, prompts, workflows) that unlock practical capability in Cursor, Jupyter, GitHub, Stripe, and more.',
  openGraph: {
    title: 'KEYS - The Keyring to Modern Tools',
    description: 'Unlock practical, repeatable capability from external tools. Cursor Keys, Jupyter Keys, GitHub Keys, and more.',
  },
};

export default function Home() {
  return (
    <main id="main-content" className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Hero & Entry Section */}
      <div className="container-wide page-padding">
        <WelcomingHero />
        <SituationEntryTiles />
        
        {/* Discovery Flow Link */}
        <div className="mt-8 sm:mt-12 text-center">
          <Link
            href="/discover"
            className="inline-block px-6 py-3 bg-white dark:bg-slate-800 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-slate-900"
          >
            Not sure where to start? Take a guided tour →
          </Link>
        </div>
      </div>

      {/* Supporting Message Section */}
      <div className="w-full bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm border-t border-b border-gray-200/50 dark:border-slate-700/50">
        <div className="container-form py-12 sm:py-16">
          <div className="text-center space-y-6">
            <div>
              <h2 className="text-h2 mb-4 text-gray-900 dark:text-gray-100">
                The Toolshed Metaphor
              </h2>
              <p className="text-body text-gray-700 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
                Imagine a modern toolshed filled with powerful tools: Cursor, Jupyter, GitHub, Stripe, Supabase, and more. 
                Each tool provides raw capability—but capability alone isn&apos;t enough. You need to know how to use them effectively. 
                <strong> KEYS is the keyring.</strong>
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-standard text-left">
              <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                <div className="text-3xl mb-3">🔧</div>
                <h3 className="text-h4 text-gray-900 dark:text-gray-100 mb-2">Cursor Keys</h3>
                <p className="text-body-sm text-gray-600 dark:text-gray-400">Unlock advanced workflows, prompt patterns, and code generation strategies in Cursor</p>
              </div>
              <div className="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200/50 dark:border-purple-800/50">
                <div className="text-3xl mb-3">📊</div>
                <h3 className="text-h4 text-gray-900 dark:text-gray-100 mb-2">Jupyter Keys</h3>
                <p className="text-body-sm text-gray-600 dark:text-gray-400">Unlock data science workflows, analysis patterns, and validation harnesses in Jupyter</p>
              </div>
              <div className="p-6 bg-pink-50 dark:bg-pink-900/20 rounded-lg border border-pink-200/50 dark:border-pink-800/50">
                <div className="text-3xl mb-3">⚙️</div>
                <h3 className="text-h4 text-gray-900 dark:text-gray-100 mb-2">GitHub Keys</h3>
                <p className="text-body-sm text-gray-600 dark:text-gray-400">Unlock workflow automation, CI/CD patterns, and repository structures in GitHub</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Message */}
      <div className="container-form py-8">
        <div className="p-6 bg-green-50/50 dark:bg-green-900/10 rounded-lg border border-green-200/50 dark:border-green-800/50">
          <p className="text-body-sm text-green-800 dark:text-green-300 text-center">
            <strong>Remember:</strong> KEYS is not an AI tool. KEYS is the keyring to modern tools. 
            You already own the tools—KEYS gives you the keys to unlock them.{' '}
            <Link href="/pricing" className="underline font-semibold hover:text-green-900 dark:hover:text-green-100 transition-colors">
              See pricing
            </Link>
          </p>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="container-wide py-8">
        <div className="flex flex-col sm:flex-row gap-standard justify-center items-center">
          <Link
            href="/marketplace"
            className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 text-center"
            aria-label="Browse the keyring"
          >
            Browse Keys
          </Link>
          <Link
            href="/marketplace?demo=true"
            className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 text-center flex items-center justify-center gap-2"
            aria-label="Try demo preview"
          >
            <span>✨</span>
            <span>Try Demo</span>
          </Link>
          <Link
            href="/profile"
            className="w-full sm:w-auto px-8 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-slate-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-700 text-center"
            aria-label="Setup your profile to personalize your experience"
          >
            Setup Profile
          </Link>
        </div>
      </div>

      {/* Feature Cards - Holistic AI Capabilities */}
      <div className="container-wide py-8">
        <h2 className="text-h2 text-center text-gray-900 dark:text-gray-100 mb-8">
          Keys That Unlock Tools
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-standard mb-8">
          <Link href="/marketplace" className="group relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 rounded-lg shadow-md hover:shadow-lg transition-all border border-gray-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900">
            <div className="text-3xl mb-3" aria-hidden="true">🔧</div>
            <h3 className="text-h4 text-gray-900 dark:text-gray-100 mb-2">Cursor Keys</h3>
            <p className="text-body-sm text-gray-600 dark:text-gray-400">
              Unlock advanced workflows, prompt patterns, and code generation strategies in Cursor. Prompt packs and Composer instructions.
            </p>
          </Link>
          <Link href="/marketplace" className="group relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 rounded-lg shadow-md hover:shadow-lg transition-all border border-gray-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900">
            <div className="text-3xl mb-3" aria-hidden="true">📊</div>
            <h3 className="text-h4 text-gray-900 dark:text-gray-100 mb-2">Jupyter Keys</h3>
            <p className="text-body-sm text-gray-600 dark:text-gray-400">
              Unlock data science workflows, analysis patterns, and validation harnesses in Jupyter. Notebook packs and analysis templates.
            </p>
          </Link>
          <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 rounded-lg shadow-md border border-gray-200 dark:border-slate-700">
            <div className="absolute top-3 right-3">
              <FeatureAvailabilityBadge status="coming-soon" />
            </div>
            <div className="text-3xl mb-3" aria-hidden="true">⚙️</div>
            <h3 className="text-h4 text-gray-900 dark:text-gray-100 mb-2">GitHub Keys</h3>
            <p className="text-body-sm text-gray-600 dark:text-gray-400">
              Unlock workflow automation, CI/CD patterns, and repository structures in GitHub. Workflow templates and starter repos.
            </p>
          </div>
          <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 rounded-lg shadow-md border border-gray-200 dark:border-slate-700">
            <div className="absolute top-3 right-3">
              <FeatureAvailabilityBadge status="coming-soon" />
            </div>
            <div className="text-3xl mb-3" aria-hidden="true">💳</div>
            <h3 className="text-h4 text-gray-900 dark:text-gray-100 mb-2">Stripe Keys</h3>
            <p className="text-body-sm text-gray-600 dark:text-gray-400">
              Unlock payment flows, subscription management, and billing patterns in Stripe. Payment workflows and subscription templates.
            </p>
          </div>
        </div>
        
        {/* Additional Key Types */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-standard">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-lg shadow-md border border-blue-200 dark:border-blue-800">
            <div className="text-2xl mb-2" aria-hidden="true">🔑</div>
            <h3 className="text-h4 text-gray-900 dark:text-gray-100 mb-1">Tool-Agnostic</h3>
            <p className="text-body-sm text-gray-600 dark:text-gray-400">
              Keys work with tools you already own. No lock-in, no platform requirements.
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-lg shadow-md border border-purple-200 dark:border-purple-800">
            <div className="text-2xl mb-2" aria-hidden="true">📦</div>
            <h3 className="text-h4 text-gray-900 dark:text-gray-100 mb-1">Reusable Assets</h3>
            <p className="text-body-sm text-gray-600 dark:text-gray-400">
              Keys are structured, reusable, and updatable. Not one-off solutions—proven patterns.
            </p>
          </div>
          <div className="bg-gradient-to-br from-pink-50 to-orange-50 dark:from-pink-900/20 dark:to-orange-900/20 p-6 rounded-lg shadow-md border border-pink-200 dark:border-pink-800">
            <div className="text-2xl mb-2" aria-hidden="true">🎯</div>
            <h3 className="text-h4 text-gray-900 dark:text-gray-100 mb-1">Outcome-Driven</h3>
            <p className="text-body-sm text-gray-600 dark:text-gray-400">
              Every key unlocks a specific, practical outcome. No vague promises—tangible results.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <nav className="container-wide py-8" aria-label="Quick navigation links">
        <div className="flex flex-wrap gap-standard justify-center">
          <Link
            href="/dashboard"
            className="px-4 py-2 text-body-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/profile/settings"
            className="px-4 py-2 text-body-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg transition-colors"
          >
            Settings
          </Link>
          <Link
            href="/templates"
            className="px-4 py-2 text-body-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg transition-colors"
          >
            Templates
          </Link>
          <Link
            href="/pricing"
            className="px-4 py-2 text-body-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="/compare"
            className="px-4 py-2 text-body-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg transition-colors"
          >
            Compare
          </Link>
          <Link
            href="/features"
            className="px-4 py-2 text-body-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg transition-colors"
          >
            Features
          </Link>
          <Link
            href="/docs/TERMS_OF_SERVICE.md"
            className="px-4 py-2 text-body-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg transition-colors"
          >
            Terms
          </Link>
        </div>
      </nav>

      {/* Social Proof Section */}
      <div className="w-full bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm">
        <div className="container-wide py-12 sm:py-16">
          <SocialProofWithRealMetrics />
        </div>
      </div>

      {/* Upgrade Prompt */}
      <div className="container-form py-12 sm:py-16">
        <UpgradePrompt variant="inline" />
      </div>
    </main>
  );
}
