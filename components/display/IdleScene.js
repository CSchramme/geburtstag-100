import Crest from '@/components/Crest';

export default function IdleScene({ party, theme }) {
  return (
    <div className="display-scene display-scene-center">
      <Crest size={180} preset={theme.preset} coupleNames={party.coupleNames} />
      <h1 className="display-huge">{party.eventTitle}</h1>
      <p className="display-couple">{party.coupleNames}</p>
      {party.subtitle && <p className="display-sub">{party.subtitle}</p>}
    </div>
  );
}
