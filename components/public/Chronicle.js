export default function Chronicle({ chronicle }) {
  return (
    <section id="chronik" className="section">
      <h2 className="section-title">Die Chronik des Abends</h2>
      {chronicle?.length ? (
        <ol className="timeline timeline-live">
          {chronicle.map((item) => (
            <li key={item.id} className="timeline-item">
              <span className="timeline-time">{item.time}</span>
              <div className="timeline-body">
                <strong>{item.title}</strong>
                {item.text && <p>{item.text}</p>}
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="muted center-text">Die Schreiber des Hofes warten noch auf den ersten Eintrag …</p>
      )}
    </section>
  );
}
