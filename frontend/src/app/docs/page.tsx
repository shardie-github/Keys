import { MarkdownPage } from '@/components/Docs/MarkdownPage';

export const runtime = 'nodejs';

export const metadata = {
  title: 'Docs',
  description: 'Documentation index for KEYS.',
};

export default async function DocsPage() {
  return (
    <MarkdownPage
      title="Docs"
      description="Documentation and reference materials for KEYS."
      filePath="docs/INDEX.md"
    />
  );
}
