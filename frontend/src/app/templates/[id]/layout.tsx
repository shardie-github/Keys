import 'server-only';

import type { ReactNode } from 'react';

// Required for `output: "export"` (static export mode).
export const dynamicParams = false;

export async function generateStaticParams() {
  // Template IDs are discovered at runtime. Static export requires at least one
  // concrete param value to generate an HTML file for this route segment.
  // We provide a single placeholder ID and render a static "not available" page
  // in export mode (see child pages).
  return [{ id: 'demo' }];
}

export default function TemplateIdLayout({ children }: { children: ReactNode }) {
  return children;
}

