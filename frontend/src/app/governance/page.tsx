import { MarkdownPage } from '@/components/Docs/MarkdownPage';

export const runtime = 'nodejs';

export const metadata = {
  title: 'Governance',
  description: 'Curation philosophy, review standards, and artifact quality guidelines.',
};

export default async function GovernancePage() {
  return (
    // @ts-expect-error - Async Server Component (Next.js 13+)
    <MarkdownPage
      title="Governance"
      description="How artifacts are curated, reviewed, and maintained."
      filePath="docs/site/GOVERNANCE.md"
    />
  );
}
