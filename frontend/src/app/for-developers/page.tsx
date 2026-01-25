import { redirect } from 'next/navigation';

export const runtime = 'nodejs';

export default function ForDevelopersPage() {
  redirect('/what-is-keys');
}
