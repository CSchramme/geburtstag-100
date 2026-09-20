export default function Chronicle({ chronicle, theme }) {
  const labels = theme.labels;
  return (
    <section id="chronik" className="section">
      <h2 className="section-title">{labels.publicChronicleHeading}</h2>
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
        <p className="muted center-text">{labels.publicChronicleEmptyState}</p>
      )}
    </section>
  );
}
