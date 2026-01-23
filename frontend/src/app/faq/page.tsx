import { MarkdownPage } from '@/components/Docs/MarkdownPage';

export const runtime = 'nodejs';

export const metadata = {
  title: 'FAQ',
  description: 'Frequently asked questions about KEYS.',
};

export default async function FaqPage() {
  return (
        // @ts-expect-error - Async Server Component (Next.js 13+)
    <MarkdownPage
      title="FAQ"
      description="Answers to common questions about KEYS."
      filePath="docs/sales/FAQ.md"
    />
  );
}
