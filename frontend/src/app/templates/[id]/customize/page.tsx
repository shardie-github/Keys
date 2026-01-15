import 'server-only';

// Required for `output: "export"` (static export mode).
export const dynamicParams = false;

export async function generateStaticParams() {
  // Static export requires concrete params; provide a placeholder.
  return [{ id: 'demo' }];
}

export default async function TemplateCustomizePage({ params }: { params: { id: string } }) {
  if (process.env.NEXT_OUTPUT === 'export') {
    return (
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-2">Template customization is unavailable in static export</h1>
        <p className="text-gray-600 dark:text-gray-400">
          This route requires runtime data. Use the hosted app to customize templates.
        </p>
      </div>
    );
  }
  const { default: TemplateCustomizeClient } = await import('./client');
  return <TemplateCustomizeClient id={params.id} />;
}
