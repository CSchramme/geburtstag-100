'use client';

import { useRotatingIndex } from '@/lib/useRotatingIndex';

export default function GuestbookScene({ guestbook, theme }) {
  const index = useRotatingIndex(guestbook.length, 7000);

  if (!guestbook.length) {
    return (
      <div className="display-scene display-scene-center">
        <p className="display-muted">Noch ist das Gästebuch leer.</p>
      </div>
    );
  }

  const entry = guestbook[index];

  return (
    <div className="display-scene display-scene-center">
      <p className="display-heading">{theme.labels.guestbookSceneHeading}</p>
      <p key={entry.id} className="display-answer display-quote">„{entry.message}"</p>
      <p className="display-sub">— {entry.name}</p>
    </div>
  );
}
