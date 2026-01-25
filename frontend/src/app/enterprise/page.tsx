import { MarkdownPage } from '@/components/Docs/MarkdownPage';

export const runtime = 'nodejs';

export const metadata = {
  title: 'Enterprise',
  description: 'Managed distribution and support for organizations that want Keys on their terms.',
};

export default async function EnterprisePage() {
  return (
    // @ts-expect-error - Async Server Component (Next.js 13+)
    <MarkdownPage
      title="Enterprise"
      description="Managed distribution and support for organizations."
      filePath="docs/site/ENTERPRISE.md"
    />
  );
}
