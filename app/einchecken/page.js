import CheckInApp from '@/components/CheckInApp';
import { get } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const { party } = get();
  return {
    title: `Einchecken – ${party?.eventTitle || party?.coupleNames || '100 Jahre'}`,
    robots: { index: false, follow: false }
  };
}

export default function CheckInPage() {
  return <CheckInApp />;
}
