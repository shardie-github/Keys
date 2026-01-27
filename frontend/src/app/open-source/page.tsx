import { MarkdownPage } from '@/components/Docs/MarkdownPage';

export const runtime = 'nodejs';

export const metadata = {
  title: 'Open Source',
  description: 'License, contribution model, and community standards for Keys.',
};

export default async function OpenSourcePage() {
return (
    <MarkdownPage
      title="Open Source"
      description="License, contribution model, and community standards."
      filePath="docs/site/OPEN_SOURCE.md"
    />
  );
}
