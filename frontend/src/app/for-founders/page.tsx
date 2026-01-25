import { redirect } from 'next/navigation';

export const runtime = 'nodejs';

export default function ForFoundersPage() {
  redirect('/what-is-keys');
}
