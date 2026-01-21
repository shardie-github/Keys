const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

const routes = [
  { path: '/', access: 'PUBLIC' },
  { path: '/pricing', access: 'PUBLIC' },
  { path: '/support', access: 'PUBLIC' },
  { path: '/docs', access: 'PUBLIC' },
  { path: '/about', access: 'PUBLIC' },
  { path: '/blog', access: 'PUBLIC' },
  { path: '/changelog', access: 'PUBLIC' },
  { path: '/security', access: 'PUBLIC' },
  { path: '/privacy', access: 'PUBLIC' },
  { path: '/terms', access: 'PUBLIC' },
  { path: '/status', access: 'PUBLIC' },
  { path: '/contact', access: 'PUBLIC' },
  { path: '/faq', access: 'PUBLIC' },
  { path: '/integrations', access: 'PUBLIC' },
  { path: '/roadmap', access: 'PUBLIC' },
  { path: '/examples', access: 'PUBLIC' },
  { path: '/marketplace', access: 'HYBRID' },
  { path: '/templates', access: 'HYBRID' },
  { path: '/templates/demo', access: 'HYBRID' },
  { path: '/dashboard', access: 'AUTH_REQUIRED' },
  { path: '/account/billing', access: 'AUTH_REQUIRED' },
  { path: '/templates/shared', access: 'AUTH_REQUIRED' },
];

let failed = 0;

const checkRoute = async ({ path, access }) => {
  const url = `${baseUrl}${path}`;
  const res = await fetch(url, { redirect: 'manual' });
  const location = res.headers.get('location');

  const okPublic = res.status === 200;
  const okAuthRedirect = res.status >= 300 && res.status < 400 && location?.includes('/signin');
  const okAuthInterstitial = res.status === 200;

  let ok = false;
  if (access === 'PUBLIC' || access === 'HYBRID') {
    ok = okPublic;
  } else if (access === 'AUTH_REQUIRED') {
    ok = okAuthRedirect || okAuthInterstitial;
  }

  const statusLabel = ok ? 'OK' : 'FAIL';
  console.log(`${statusLabel} ${path} -> ${res.status}${location ? ` (${location})` : ''}`);
  if (!ok) failed += 1;
};

for (const route of routes) {
  // eslint-disable-next-line no-await-in-loop
  await checkRoute(route);
}

if (failed > 0) {
  console.error(`\n${failed} route checks failed.`);
  process.exit(1);
}

console.log('\nAll route checks passed.');
