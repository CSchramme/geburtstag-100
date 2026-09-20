import AdminApp from '@/components/AdminApp';
import { get } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const { party } = get();
  return {
    title: `Verwaltung – ${party?.eventTitle || party?.coupleNames || '100 Jahre'}`,
    robots: { index: false, follow: false }
  };
}

export default function AdminPage() {
  return <AdminApp />;
}
