export default function StatsScene({ stats, theme }) {
  const { presentCount, expectedCount, guestbookCount, galleryCount, songRequestCount, topPhoto } = stats;

  const tiles = [
    { label: 'Gäste anwesend', value: `${presentCount} / ${expectedCount}` },
    { label: 'Einträge im Gästebuch', value: guestbookCount },
    { label: 'Fotos in der Galerie', value: galleryCount },
    { label: 'Musikwünsche', value: songRequestCount }
  ];

  return (
    <div className="display-scene display-scene-center">
      <p className="display-heading">{theme.labels.statsSceneHeading}</p>
      <div className="display-stats-grid">
        {tiles.map((s) => (
          <div key={s.label} className="display-stat-tile">
            <p className="display-stat-value">{s.value}</p>
            <p className="display-stat-label">{s.label}</p>
          </div>
        ))}
      </div>
      {topPhoto && (
        <div className="display-stat-photo">
          <img src={topPhoto.url} alt="" />
          <p className="display-stat-photo-caption">Beliebtestes Foto · {topPhoto.likes} ♥</p>
        </div>
      )}
    </div>
  );
}
