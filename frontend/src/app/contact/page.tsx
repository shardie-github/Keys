import Link from 'next/link';

export const metadata = {
  title: 'Contact',
  description: 'Contact KEYS support and partnerships.',
};

export default function ContactPage() {
  return (
    <main id="main-content" className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">Contact</h1>
          <p className="mt-3 text-base sm:text-lg text-gray-600 dark:text-gray-400">
            Reach the KEYS team for support, partnerships, or security-related questions.
          </p>
        </header>

        <section className="grid gap-4 sm:gap-6">
          <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/50 p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Support</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Account access, billing, or product questions.</p>
            <p className="mt-4 text-gray-900 dark:text-gray-100 font-semibold">support@keys.dev</p>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/50 p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Partnerships</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Integrations, co-marketing, or marketplace partnerships.</p>
            <p className="mt-4 text-gray-900 dark:text-gray-100 font-semibold">partnerships@keys.com</p>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/50 p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Security</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Responsible disclosure and security inquiries.</p>
            <Link href="/security" className="mt-3 inline-block text-blue-600 dark:text-blue-400 font-semibold underline">
              Security overview
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
