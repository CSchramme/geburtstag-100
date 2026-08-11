import ImpressumModal from './ImpressumModal';

export default function Footer({ impressum }) {
  return (
    <footer className="public-footer">
      <div className="divider" />
      <div className="container center-text stack">
        <ImpressumModal text={impressum?.text} />
      </div>
    </footer>
  );
}
