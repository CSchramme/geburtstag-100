import Crest from '@/components/Crest';
import NowPlaying from '@/components/NowPlaying';

export default function Header({ party, theme }) {
  const labels = theme.labels;
  const nav = [
    { href: '#zusage', label: 'Zusage' },
    { href: '#sitzplatz', label: 'Sitzplatz' },
    { href: '#chronik', label: labels.navChronicle },
    { href: '#raetsel', label: 'Rätsel' },
    { href: '#wunschlied', label: 'Wunschlied' },
    { href: '#galerie', label: 'Galerie' },
    { href: '#gaestebuch', label: 'Gästebuch' }
  ];

  return (
    <header className="public-header">
      <div className="container public-header-inner">
        <Crest size={72} preset={theme.preset} coupleNames={party.coupleNames} />
        <h1 className="public-title">{party.eventTitle || '100 Jahre'}</h1>
        <p className="public-couple">{party.coupleNames}</p>
        {party.subtitle && <p className="public-subtitle">{party.subtitle}</p>}
        <nav className="public-nav" aria-label="Bereiche der Seite">
          {nav.map((n) => (
            <a key={n.href} href={n.href} className="public-nav-link">
              {n.label}
            </a>
          ))}
        </nav>
        <div className="public-header-now-playing">
          <NowPlaying compact />
        </div>
      </div>
    </header>
  );
}
