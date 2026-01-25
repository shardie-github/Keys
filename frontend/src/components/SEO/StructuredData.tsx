import { resolveSiteUrl } from '@/utils/site-url';

interface StructuredDataProps {
  type: 'Organization' | 'SoftwareApplication' | 'WebSite' | 'BreadcrumbList' | 'FAQPage';
  data: Record<string, unknown>;
}

export function StructuredData({ type, data }: StructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  );
}

export function generateOrganizationSchema() {
  const siteUrl = resolveSiteUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Keys',
    url: siteUrl,
    logo: `${siteUrl.replace(/\/$/, '')}/icon-512.png`,
    description: 'Keys is an open source library of prompts, notebooks, and runbooks for modern software and operations workflows.',
    sameAs: [
      'https://twitter.com/cursorventure',
      'https://github.com/cursor-venture-companion',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      email: 'support@cursor-venture-companion.com',
    },
  };
}

export function generateSoftwareApplicationSchema() {
  const siteUrl = resolveSiteUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Keys',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    description: 'A curated, open source library of prompts, notebooks, and runbooks that teams can adapt to their workflows.',
    url: siteUrl,
  };
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
