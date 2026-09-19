import Crest from '@/components/Crest';

export default function WelcomeScene({ party, welcome }) {
  const name = welcome?.name;

  return (
    <div className="display-scene display-scene-center">
      <Crest size={140} />
      {name ? (
        <div key={welcome.nonce || name} className="display-welcome-pop">
          <p className="display-heading">Herzlich willkommen</p>
          <h1 className="display-huge">{name}</h1>
        </div>
      ) : (
        <div key="generic" className="display-welcome-pop">
          <h1 className="display-huge">Willkommen!</h1>
          <p className="display-couple">{party.coupleNames}</p>
          <p className="display-sub">Seid herzlich gegrüßt zum Hoffest</p>
        </div>
      )}
    </div>
  );
}
