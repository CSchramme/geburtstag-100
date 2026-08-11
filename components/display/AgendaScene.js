export default function AgendaScene({ agenda }) {
  return (
    <div className="display-scene">
      <h2 className="display-heading">Der Ablauf des Hoffestes</h2>
      {agenda.length ? (
        <ol className="display-timeline">
          {agenda.map((item) => (
            <li key={item.id}>
              <span className="display-timeline-time">{item.time}</span>
              <span className="display-timeline-title">{item.title}</span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="display-muted">Der Ablauf wird noch geschrieben …</p>
      )}
    </div>
  );
}
