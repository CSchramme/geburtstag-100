import CountdownClock from '@/components/CountdownClock';

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(`${dateStr}T00:00:00`);
    return new Intl.DateTimeFormat('de-DE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }).format(d);
  } catch {
    return dateStr;
  }
}

export default function Hero({ party, countdown }) {
  const dateLabel = formatDate(party.date);

  return (
    <section className="parchment hero-card">
      {countdown?.active && countdown.endsAt && (
        <div className="hero-countdown">
          <p className="label center-text">{countdown.label || 'Es ist gleich soweit'}</p>
          <CountdownClock endsAt={countdown.endsAt} size="lg" />
        </div>
      )}

      <p className="hero-intro">{party.introText}</p>

      <div className="divider-jewel" aria-hidden="true">
        <span />
      </div>

      <dl className="hero-facts">
        {dateLabel && (
          <div>
            <dt>Datum</dt>
            <dd>{dateLabel}{party.time ? ` · ${party.time} Uhr` : ''}</dd>
          </div>
        )}
        {party.location && (
          <div>
            <dt>Ort</dt>
            <dd>
              {party.location}
              {party.locationAddress ? <><br />{party.locationAddress}</> : null}
            </dd>
          </div>
        )}
        {party.dressCode && (
          <div>
            <dt>Gewandung</dt>
            <dd>{party.dressCode}</dd>
          </div>
        )}
      </dl>
    </section>
  );
}
