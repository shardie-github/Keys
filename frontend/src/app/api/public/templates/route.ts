import { NextResponse } from 'next/server';
import { flattenTemplateCatalog, loadTemplateCatalog } from '@/lib/templateCatalog';

export async function GET(req: Request) {
  const catalog = await loadTemplateCatalog();

  if (!catalog) {
    return NextResponse.json(
      { results: [], milestones: {}, message: 'Template catalog unavailable.' },
      { status: 200 }
    );
  }

  const url = new URL(req.url);
  const query = url.searchParams.get('query')?.toLowerCase() ?? '';
  const milestone = url.searchParams.get('milestone') ?? '';
  const tags = url.searchParams.get('tags')?.split(',').map((tag) => tag.trim().toLowerCase()).filter(Boolean) ?? [];
  const stack = url.searchParams.get('stack')?.split(',').map((item) => item.trim().toLowerCase()).filter(Boolean) ?? [];
  const priority = url.searchParams.get('priority')?.split(',').map((item) => item.trim()) ?? [];
  const security = url.searchParams.get('security_level')?.split(',').map((item) => item.trim()) ?? [];
  const optimization = url.searchParams.get('optimization_level')?.split(',').map((item) => item.trim()) ?? [];

  const flattened = flattenTemplateCatalog(catalog);

  const results = flattened.filter((template) => {
    if (milestone && template.milestone !== milestone) return false;
    if (query) {
      const haystack = `${template.name} ${template.description} ${template.tags.join(' ')} ${template.stack.join(' ')}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    if (tags.length && !tags.every((tag) => template.tags.map((t) => t.toLowerCase()).includes(tag))) return false;
    if (stack.length && !stack.every((item) => template.stack.map((s) => s.toLowerCase()).includes(item))) return false;
    if (priority.length && !priority.includes(template.priority)) return false;
    if (security.length && !security.includes(template.security_level)) return false;
    if (optimization.length && !optimization.includes(template.optimization_level)) return false;

    return true;
  });

  return NextResponse.json(
    {
      results,
      milestones: catalog.milestones,
      version: catalog.version,
      description: catalog.description,
    },
    { status: 200 }
  );
}
