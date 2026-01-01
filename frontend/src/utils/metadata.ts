import { Metadata } from 'next';

interface PageMetadataOptions {
  title: string;
  description: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
}

export function generatePageMetadata({
  title,
  description,
  path = '/',
  image = '/og-image.png',
  noIndex = false,
}: PageMetadataOptions): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://keys.dev';
  const fullUrl = `${baseUrl}${path}`;

  return {
    title: `${title} | Keys`,
    description,
    alternates: {
      canonical: fullUrl,
    },
    openGraph: {
      title: `${title} | Keys`,
      description,
      url: fullUrl,
      siteName: 'Keys',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Keys`,
      description,
      images: [image],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        },
  };
}
