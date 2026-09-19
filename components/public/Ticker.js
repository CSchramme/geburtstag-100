export default function Ticker({ ticker }) {
  const entries = (ticker?.text || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  if (!ticker?.active || !entries.length) return null;

  // Two full copies of the entry list, laid out end to end - the
  // ticker-scroll animation translates by exactly -50% of that combined
  // width, so the second copy lands where the first started and the loop
  // reads as seamless no matter how many entries there are.
  const loop = [...entries, ...entries];

  return (
    <div className="ticker" role="status">
      <div className="ticker-track">
        {loop.map((entry, i) => (
          <span key={i} className="ticker-item">
            {i > 0 && <span className="ticker-sep" aria-hidden="true">✦</span>}
            {entry}
          </span>
        ))}
      </div>
    </div>
  );
}
