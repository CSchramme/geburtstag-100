import Crest from '@/components/Crest';

export default function IdleScene({ party }) {
  return (
    <div className="display-scene display-scene-center">
      <Crest size={180} />
      <h1 className="display-huge">{party.eventTitle}</h1>
      <p className="display-couple">{party.coupleNames}</p>
      {party.subtitle && <p className="display-sub">{party.subtitle}</p>}
    </div>
  );
}
