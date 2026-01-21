import { MarkdownPage } from '@/components/Docs/MarkdownPage';

export const runtime = 'nodejs';

export const metadata = {
  title: 'Privacy',
  description: 'Privacy policy for KEYS.',
};

export default async function PrivacyPage() {
  return (
    <MarkdownPage
      title="Privacy Policy"
      description="How KEYS collects, uses, and protects data."
      filePath="docs/security/PRIVACY.md"
    />
  );
}
