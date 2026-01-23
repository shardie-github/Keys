import { MarkdownPage } from '@/components/Docs/MarkdownPage';

export const runtime = 'nodejs';

export const metadata = {
  title: 'About',
  description: 'Learn about the KEYS mission and product positioning.',
};

export default async function AboutPage() {
  return (
    // @ts-expect-error - Async Server Component (Next.js 13+)
    <MarkdownPage
      title="About KEYS"
      description="Mission, positioning, and brand overview."
      filePath="docs/brand/BRAND_SUMMARY.md"
    />
  );
}
