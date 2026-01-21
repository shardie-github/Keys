import { MarkdownPage } from '@/components/Docs/MarkdownPage';

export const runtime = 'nodejs';

export const metadata = {
  title: 'Terms',
  description: 'Terms of service for KEYS.',
};

export default async function TermsPage() {
  return (
    <MarkdownPage
      title="Terms of Service"
      description="Legal terms governing the use of KEYS."
      filePath="docs/TERMS_OF_SERVICE.md"
    />
  );
}
