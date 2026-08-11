export default function ChronicleScene({ chronicle }) {
  const recent = chronicle.slice(-8);
  return (
    <div className="display-scene">
      <h2 className="display-heading">Die Chronik des Abends</h2>
      {recent.length ? (
        <ol className="display-timeline">
          {recent.map((item) => (
            <li key={item.id}>
              <span className="display-timeline-time">{item.time}</span>
              <span className="display-timeline-title">{item.title}</span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="display-muted">Die Schreiber des Hofes warten auf den ersten Eintrag …</p>
      )}
    </div>
  );
}
