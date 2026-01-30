import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import '@/utils/env-validation'; // Validate environment variables
import { interVariable } from '@/lib/fonts';
import { RootProvider } from '@/components/providers/root-provider';
import { Navigation } from '@/components/Navigation';
import { StructuredData, generateOrganizationSchema, generateSoftwareApplicationSchema } from '@/components/SEO/StructuredData';
import { resolveSiteUrl } from '@/utils/site-url';

const siteUrl = resolveSiteUrl();

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#2563eb' },
    { media: '(prefers-color-scheme: dark)', color: '#1e40af' },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Keys - Open Source Knowledge & Artifact Library',
    template: '%s | KEYS',
  },
  description: 'Keys is an open source library of prompts, notebooks, and runbooks. Use it as a starting point and adapt each artifact to your context.',
  keywords: [
    'open source library',
    'prompt library',
    'runbooks',
    'notebooks',
    'knowledge base',
    'developer workflows',
    'operations',
    'documentation',
    'templates',
    'artifact library',
    'engineering enablement',
    'LLM prompts',
    'workflow starting points',
  ],
  authors: [{ name: 'Keys' }],
  creator: 'Keys',
  publisher: 'Keys',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Keys',
  },
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/icon-192.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'KEYS',
    title: 'Keys - Open Source Knowledge & Artifact Library',
    description: 'Keys is an open source library of prompts, notebooks, and runbooks that teams adapt to their own tools and workflows.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Keys',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Keys - Open Source Knowledge & Artifact Library',
    description: 'Open source prompts, notebooks, and runbooks. Use Keys as a starting point and adapt each artifact to your context.',
    images: ['/og-image.png'],
    creator: '@cursorventure',
  },
  robots: {
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
  alternates: {
    canonical: '/',
  },
  category: 'technology',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" className={`scroll-smooth ${interVariable.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="canonical" href={siteUrl} />
        <meta name="theme-color" content="#2563eb" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#1e40af" media="(prefers-color-scheme: dark)" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Keys" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <StructuredData type="Organization" data={generateOrganizationSchema()} />
        <StructuredData type="SoftwareApplication" data={generateSoftwareApplicationSchema()} />
      </head>
      <body className={`${interVariable.className} antialiased bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100`}>
        <RootProvider>
          <div id="skip-to-content" className="sr-only">
            <a href="#main-content" className="skip-link">
              Skip to main content
            </a>
          </div>
          <Navigation />
          {children}
        </RootProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js')
                    .then(reg => console.log('SW registered:', reg))
                    .catch(err => console.log('SW registration failed:', err));
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
