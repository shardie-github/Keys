import { MarkdownPage } from '@/components/Docs/MarkdownPage';

export const runtime = 'nodejs';

export const metadata = {
  title: 'Roadmap',
  description: 'Public roadmap for KEYS.',
};

export default async function RoadmapPage() {
  return (
    <MarkdownPage
      title="Roadmap"
      description="Read-only roadmap and upcoming priorities."
      filePath="docs/roadmap/README.md"
    />
  );
}
