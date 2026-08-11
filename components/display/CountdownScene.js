import CountdownClock from '@/components/CountdownClock';

export default function CountdownScene({ countdown }) {
  return (
    <div className="display-scene display-scene-center">
      <p className="display-heading">{countdown.label || 'Es ist gleich soweit'}</p>
      {countdown.active && countdown.endsAt ? (
        <CountdownClock endsAt={countdown.endsAt} size="lg" />
      ) : (
        <p className="display-muted">Der Countdown ruht noch.</p>
      )}
    </div>
  );
}
