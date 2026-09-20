export default function ChronicleScene({ chronicle, theme }) {
  const recent = chronicle.slice(-8);
  return (
    <div className="display-scene">
      <h2 className="display-heading">{theme.labels.chronicleSceneHeading}</h2>
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
        <p className="display-muted">{theme.labels.chronicleSceneEmptyState}</p>
      )}
    </div>
  );
}
