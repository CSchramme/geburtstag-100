import Crest from '@/components/Crest';

export default function FarewellScene({ party }) {
  return (
    <div className="display-scene display-scene-center">
      <Crest size={140} />
      <h1 className="display-huge">Danke, dass Ihr dabei wart!</h1>
      <p className="display-couple">{party.coupleNames}</p>
      <p className="display-sub">Kommt gut nach Hause — bis zum nächsten Fest!</p>
    </div>
  );
}
