import { MarkdownPage } from '@/components/Docs/MarkdownPage';

export const runtime = 'nodejs';

export const metadata = {
  title: 'What is Keys',
  description: 'How to use Keys responsibly: starting points, judgment, and adaptation.',
};

export default async function WhatIsKeysPage() {
  return (
    // @ts-expect-error - Async Server Component (Next.js 13+)
    <MarkdownPage
      title="What is Keys"
      description="How to use the library responsibly and adapt artifacts to your context."
      filePath="docs/site/WHAT_IS_KEYS.md"
    />
  );
}
