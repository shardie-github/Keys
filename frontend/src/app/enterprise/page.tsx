import { MarkdownPage } from '@/components/Docs/MarkdownPage';

export const runtime = 'nodejs';

export const metadata = {
  title: 'Enterprise',
  description: 'Managed distribution and support for organizations that want Keys on their terms.',
};

export default async function EnterprisePage() {
return (
    <MarkdownPage
      title="Enterprise"
      description="Managed distribution and support for organizations."
      filePath="docs/site/ENTERPRISE.md"
    />
  );
}
