import Crest from '@/components/Crest';

export default function WelcomeScene({ party, welcome }) {
  const name = welcome?.name;

  return (
    <div className="display-scene display-scene-center">
      <Crest size={140} />
      {name ? (
        <>
          <p className="display-heading">Willkommen im Hoffest</p>
          <h1 className="display-huge">{name}</h1>
          <p className="display-sub">Die Pforten stehen Euch offen!</p>
        </>
      ) : (
        <>
          <h1 className="display-huge">Willkommen!</h1>
          <p className="display-couple">{party.coupleNames}</p>
          <p className="display-sub">Seid herzlich gegrüßt zum Hoffest</p>
        </>
      )}
    </div>
  );
}
