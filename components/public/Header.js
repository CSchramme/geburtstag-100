import Crest from '@/components/Crest';
import NowPlaying from '@/components/NowPlaying';

const NAV = [
  { href: '#ablauf', label: 'Ablauf' },
  { href: '#chronik', label: 'Chronik' },
  { href: '#raetsel', label: 'Rätsel' },
  { href: '#galerie', label: 'Galerie' },
  { href: '#gaestebuch', label: 'Gästebuch' }
];

export default function Header({ party }) {
  return (
    <header className="public-header">
      <div className="container public-header-inner">
        <Crest size={72} />
        <h1 className="public-title">{party.eventTitle || '100 Jahre'}</h1>
        <p className="public-couple">{party.coupleNames}</p>
        {party.subtitle && <p className="public-subtitle">{party.subtitle}</p>}
        <nav className="public-nav" aria-label="Bereiche der Seite">
          {NAV.map((n) => (
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
