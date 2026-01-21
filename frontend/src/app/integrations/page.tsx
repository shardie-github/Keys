import Link from 'next/link';

export const metadata = {
  title: 'Integrations',
  description: 'Tools and platforms supported by KEYS.',
};

const integrations = [
  { name: 'Cursor', description: 'Prompt packs, workflows, and Composer instructions for Cursor.' },
  { name: 'Jupyter', description: 'Notebook-based templates and data workflows for Jupyter.' },
  { name: 'GitHub', description: 'CI/CD workflows, automation patterns, and repository structures.' },
  { name: 'Stripe', description: 'Billing flows, subscriptions, and payment integration keys.' },
  { name: 'Supabase', description: 'RLS policy patterns, database schemas, and auth foundations.' },
];

export default function IntegrationsPage() {
  return (
    <main id="main-content" className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">Integrations</h1>
          <p className="mt-3 text-base sm:text-lg text-gray-600 dark:text-gray-400">
            KEYS unlocks workflows across the tools you already use.
          </p>
        </header>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          {integrations.map((integration) => (
            <div
              key={integration.name}
              className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/50 p-6 shadow-sm"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{integration.name}</h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">{integration.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/80 dark:bg-blue-900/20 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Explore the catalog</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Browse integrations and templates tailored to your stack.
          </p>
          <Link href="/marketplace" className="mt-4 inline-block text-blue-700 dark:text-blue-200 font-semibold underline">
            Visit Marketplace
          </Link>
        </div>
      </div>
    </main>
  );
}
