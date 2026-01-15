const FALLBACK_SITE_URL = 'https://keys.dev';

function normalizeSiteUrl(rawUrl: string) {
  const trimmed = rawUrl.trim();
  if (!trimmed) return FALLBACK_SITE_URL;

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  if (typeof URL !== 'undefined' && 'canParse' in URL && URL.canParse(withProtocol)) {
    return new URL(withProtocol).toString();
  }

  try {
    return new URL(withProtocol).toString();
  } catch {
    return FALLBACK_SITE_URL;
  }
}

export function resolveSiteUrl() {
  const rawUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!rawUrl) return FALLBACK_SITE_URL;
  return normalizeSiteUrl(rawUrl);
}
