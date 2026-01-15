import 'server-only';

import { DEMO_KEYS } from '@/services/demoData';

// Required for `output: "export"` (static export mode).
export const dynamicParams = false;

export async function generateStaticParams() {
  // In `output: "export"` we must provide all params at build-time.
  // We export the demo keys as a minimal, self-contained set.
  return DEMO_KEYS.map((k) => ({ slug: k.slug }));
}

export default async function KeyDetailPage({ params }: { params: { slug: string } }) {
  const { KeyDetailClient } = await import('./client');
  return <KeyDetailClient slug={params.slug} />;
}
