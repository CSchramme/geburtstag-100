export default function ExportPanel() {
  return (
    <div className="panel">
      <p className="panel-title">Erinnerungen sichern</p>
      <p className="small muted mt-0">Lädt die freigegebenen Inhalte als Datei herunter — zum Aufbewahren nach der Feier.</p>
      <div className="inline-form">
        <a className="btn btn-gold btn-sm" href="/api/admin/export/photos">
          Fotos als ZIP
        </a>
        <a className="btn btn-gold btn-sm" href="/api/admin/export/guestbook">
          Gästebuch als PDF
        </a>
      </div>
    </div>
  );
}
