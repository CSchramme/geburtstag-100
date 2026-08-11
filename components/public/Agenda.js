export default function Agenda({ agenda }) {
  if (!agenda?.length) return null;
  return (
    <section id="ablauf" className="section">
      <h2 className="section-title">Der Ablauf des Hoffestes</h2>
      <ol className="timeline">
        {agenda.map((item) => (
          <li key={item.id} className="timeline-item">
            <span className="timeline-time">{item.time}</span>
            <div className="timeline-body">
              <strong>{item.title}</strong>
              {item.description && <p>{item.description}</p>}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
