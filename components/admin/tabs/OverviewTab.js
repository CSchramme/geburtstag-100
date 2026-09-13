import { SCENE_LABELS } from '@/lib/displayScenes';
import QrCodePanel from './QrCodePanel';
import ExportPanel from './ExportPanel';

const MANUAL_URL = 'https://claude.ai/code/artifact/a7343a7e-bcb3-49a2-b5ca-efceb3f2a09d';

export default function OverviewTab({ state, onNavigate }) {
  const pendingGuestbook = state.guestbook.filter((g) => g.status === 'pending').length;
  const pendingGallery = state.gallery.filter((g) => g.status === 'pending').length;
  const pendingSongs = state.songRequests.filter((r) => r.status === 'pending').length;

  const cards = [
    {
      title: 'Aktuelle Bühnen-Szene',
      value: SCENE_LABELS[state.display.scene] || state.display.scene,
      action: 'buehne',
      cta: 'Bühne steuern'
    },
    {
      title: 'Ticker',
      value: state.ticker.active ? 'Aktiv' : 'Ausgeblendet',
      action: 'buehne',
      cta: 'Bühne steuern'
    },
    {
      title: 'Gästebuch wartet auf Freigabe',
      value: String(pendingGuestbook),
      action: 'gaestebuch',
      cta: 'Prüfen'
    },
    {
      title: 'Galerie wartet auf Freigabe',
      value: String(pendingGallery),
      action: 'galerie',
      cta: 'Prüfen'
    },
    {
      title: 'Offene Musikwünsche',
      value: String(pendingSongs),
      action: 'musik',
      cta: 'Ansehen'
    }
  ];

  return (
    <div className="stack">
      <div className="panel">
        <p className="panel-title">Willkommen, Hofmarschall</p>
        <p className="mt-0">
          Von hier aus lenkt Ihr das gesamte Hoffest: Musik, Bühne, Rätsel, Gästebuch und Galerie. Alle Änderungen
          erscheinen sofort auf der Gästeseite und dem Beamer.
        </p>
        <a className="btn btn-gold btn-sm" href={MANUAL_URL} target="_blank" rel="noopener noreferrer">
          Bedienungsanleitung öffnen
        </a>
      </div>

      <div className="overview-grid">
        {cards.map((c) => (
          <div key={c.title} className="panel overview-card">
            <p className="panel-title">{c.title}</p>
            <p className="overview-value">{c.value}</p>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => onNavigate(c.action)}>
              {c.cta}
            </button>
          </div>
        ))}
      </div>

      <QrCodePanel />
      <ExportPanel />
    </div>
  );
}
