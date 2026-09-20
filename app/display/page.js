import DisplayApp from '@/components/DisplayApp';
import { get } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const { party } = get();
  return {
    title: `Beamer – ${party?.eventTitle || party?.coupleNames || '100 Jahre'}`,
    robots: { index: false, follow: false }
  };
}

export default function DisplayPage() {
  return <DisplayApp />;
}
