import Link from 'next/link';
import { flattenTemplateCatalog, loadTemplateCatalog } from '@/lib/templateCatalog';

export const runtime = 'nodejs';

export const metadata = {
  title: 'Examples',
  description: 'Public examples and template catalog for KEYS.',
};

export default async function ExamplesPage() {
  const catalog = await loadTemplateCatalog();

  if (!catalog) {
    return (
      <main id="main-content" className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">Examples</h1>
          <p className="mt-3 text-gray-600 dark:text-gray-400">
            The template catalog is temporarily unavailable. Please check back shortly.
          </p>
        </div>
      </main>
    );
  }

  const templates = flattenTemplateCatalog(catalog);

  return (
    <main id="main-content" className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">Examples & Templates</h1>
          <p className="mt-3 text-gray-600 dark:text-gray-400">
            Explore the public template catalog and sample workflows.
          </p>
        </header>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          {templates.map((template) => (
            <div
              key={template.templateId}
              className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/50 p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{template.name}</h2>
                <span className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  {template.milestoneName}
                </span>
              </div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">{template.description}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {template.tags.slice(0, 4).map((tag) => (
                  <span key={tag} className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/80 dark:bg-blue-900/20 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Customize templates</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Sign in to customize templates, save versions, and share with your team.
          </p>
          <Link href="/templates" className="mt-4 inline-block text-blue-700 dark:text-blue-200 font-semibold underline">
            Go to Template Manager
          </Link>
        </div>
      </div>
    </main>
  );
}
