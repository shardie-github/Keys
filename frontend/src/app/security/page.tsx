import { MarkdownPage } from '@/components/Docs/MarkdownPage';

export const runtime = 'nodejs';

export const metadata = {
  title: 'Security',
  description: 'Security posture and trust model for KEYS.',
};

export default async function SecurityPage() {
return (
    <MarkdownPage
      title="Security"
      description="Security posture, controls, and trust model overview."
      filePath="docs/SECURITY.md"
    />
  );
}
