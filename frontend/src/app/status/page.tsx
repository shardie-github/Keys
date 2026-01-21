export const metadata = {
  title: 'Status',
  description: 'Current platform status for KEYS.',
};

const statusItems = [
  { label: 'Marketplace', status: 'Operational', detail: 'Catalog browsing and downloads are available.' },
  { label: 'Template Manager', status: 'Operational', detail: 'Templates and customization tools are running.' },
  { label: 'Authentication', status: 'Operational', detail: 'Sign-in and account access are available.' },
];

export default function StatusPage() {
  return (
    <main id="main-content" className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">Status</h1>
          <p className="mt-3 text-base sm:text-lg text-gray-600 dark:text-gray-400">
            Live status for KEYS services and public infrastructure.
          </p>
        </header>

        <div className="space-y-4">
          {statusItems.map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/50 p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{item.label}</h2>
                <span className="inline-flex items-center gap-2 text-green-700 dark:text-green-300 font-semibold">
                  <span className="h-2 w-2 rounded-full bg-green-500" aria-hidden="true" />
                  {item.status}
                </span>
              </div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">{item.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
