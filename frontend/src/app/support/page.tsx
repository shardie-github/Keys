import Link from 'next/link';

export const metadata = {
  title: 'Support',
  description: 'Get help, documentation, and support for KEYS.',
};

export default function SupportPage() {
  return (
    <main id="main-content" className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">Support</h1>
          <p className="mt-3 text-base sm:text-lg text-gray-600 dark:text-gray-400">
            Find answers, guides, and direct support channels for KEYS.
          </p>
        </header>

        <section className="grid gap-4 sm:gap-6">
          <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/50 p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Self-Serve Resources</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Browse documentation, FAQs, and roadmap updates for the latest guidance.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/docs" className="text-blue-600 dark:text-blue-400 font-semibold underline">
                Docs
              </Link>
              <Link href="/faq" className="text-blue-600 dark:text-blue-400 font-semibold underline">
                FAQ
              </Link>
              <Link href="/roadmap" className="text-blue-600 dark:text-blue-400 font-semibold underline">
                Roadmap
              </Link>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/50 p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Contact Support</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              For account issues or critical questions, reach out directly and include any relevant context.
            </p>
            <p className="mt-4 text-gray-900 dark:text-gray-100 font-semibold">support@keys.dev</p>
            <Link href="/contact" className="mt-3 inline-block text-blue-600 dark:text-blue-400 font-semibold underline">
              Contact page
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
