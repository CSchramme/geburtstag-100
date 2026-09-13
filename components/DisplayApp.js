'use client';

import { useLiveState } from '@/lib/useLiveState';
import Ticker from '@/components/public/Ticker';
import NowPlaying from '@/components/NowPlaying';
import IdleScene from '@/components/display/IdleScene';
import ChronicleScene from '@/components/display/ChronicleScene';
import CountdownScene from '@/components/display/CountdownScene';
import QuizScene from '@/components/display/QuizScene';
import PresentationScene from '@/components/display/PresentationScene';
import GalleryScene from '@/components/display/GalleryScene';
import GuestbookScene from '@/components/display/GuestbookScene';

export default function DisplayApp() {
  const { state } = useLiveState();

  if (!state) {
    return <div className="page-loading" />;
  }

  const scene = state.display.scene;

  return (
    <div className="display-root">
      <div className="display-body">
        {scene === 'idle' && <IdleScene party={state.party} />}
        {scene === 'chronicle' && <ChronicleScene chronicle={state.chronicle} />}
        {scene === 'countdown' && <CountdownScene countdown={state.countdown} />}
        {scene === 'quiz' && <QuizScene quiz={state.quiz} />}
        {scene === 'presentation' && <PresentationScene presentation={state.presentation} />}
        {scene === 'gallery' && <GalleryScene gallery={state.gallery} />}
        {scene === 'guestbook' && <GuestbookScene guestbook={state.guestbook} />}
      </div>

      <div className="display-footer">
        <Ticker ticker={state.ticker} />
        <div className="display-now-playing">
          <NowPlaying />
        </div>
      </div>
    </div>
  );
}
