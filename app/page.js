import PublicApp from '@/components/PublicApp';

// Forces the layout's generateMetadata (browser tab title) to be computed
// per-request instead of baked in at build time, so it reflects live party
// data without a redeploy.
export const dynamic = 'force-dynamic';

export default function HomePage() {
  return <PublicApp />;
}
