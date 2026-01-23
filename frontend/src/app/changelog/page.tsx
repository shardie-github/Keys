import { MarkdownPage } from '@/components/Docs/MarkdownPage';

export const runtime = 'nodejs';

export const metadata = {
  title: 'Changelog',
  description: 'Product updates and release notes.',
};

export default async function ChangelogPage() {
  return (
        // @ts-expect-error - Async Server Component (Next.js 13+)
    <MarkdownPage
      title="Changelog"
      description="Release notes and product updates for KEYS."
      filePath="CHANGELOG.md"
    />
  );
}
