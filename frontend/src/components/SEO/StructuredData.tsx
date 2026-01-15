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
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'KEYS',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://keys.dev',
    logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://keys.dev'}/icon-512.png`,
    description: 'KEYS is a marketplace of structured assets (notebooks, prompts, workflows) that unlock practical capability in Cursor, Jupyter, GitHub, Stripe, and more—without competing with them.',
    sameAs: [
      'https://twitter.com/cursorventure',
      'https://github.com/keys-dev',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      email: 'support@keys.dev',
    },
  };
}

export function generateSoftwareApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'KEYS',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1247',
      bestRating: '5',
      worstRating: '1',
    },
    description: 'A marketplace of structured assets (notebooks, prompts, workflows) that unlock practical capability in Cursor, Jupyter, GitHub, Stripe, and more.',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://keys.dev',
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
