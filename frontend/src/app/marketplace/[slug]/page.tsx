import { redirect } from 'next/navigation';

export const runtime = 'nodejs';

export default function MarketplaceSlugPage({ params }: { params: { slug: string } }) {
  redirect(`/library/${params.slug}`);
}
