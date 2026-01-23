import { MarkdownPage } from '@/components/Docs/MarkdownPage';

export const runtime = 'nodejs';

export const metadata = {
  title: 'Blog',
  description: 'Long-form product story and updates from KEYS.',
};

export default async function BlogPage() {
  return (
        // @ts-expect-error - Async Server Component (Next.js 13+)
    <MarkdownPage
      title="KEYS Story"
      description="Product narrative and positioning materials."
      filePath="docs/brand/MARKET_STORY.md"
    />
  );
}
