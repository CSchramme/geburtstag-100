'use client';

import { useLiveState } from '@/lib/useLiveState';
import { resolveTheme } from '@/lib/theme';
import ThemeStyle from '@/components/ThemeStyle';
import Ticker from '@/components/public/Ticker';
import NowPlaying from '@/components/NowPlaying';
import IdleScene from '@/components/display/IdleScene';
import WelcomeScene from '@/components/display/WelcomeScene';
import ChronicleScene from '@/components/display/ChronicleScene';
import CountdownScene from '@/components/display/CountdownScene';
import QuizScene from '@/components/display/QuizScene';
import PresentationScene from '@/components/display/PresentationScene';
import GalleryScene from '@/components/display/GalleryScene';
import GuestbookScene from '@/components/display/GuestbookScene';
import StatsScene from '@/components/display/StatsScene';
import FarewellScene from '@/components/display/FarewellScene';
import SoundEffectsListener from '@/components/display/SoundEffectsListener';
import SceneTransition from '@/components/display/SceneTransition';

export default function DisplayApp() {
  const { state } = useLiveState();

  if (!state) {
    return <div className="page-loading" />;
  }

  const theme = resolveTheme(state.theme);
  const scene = state.display.scene;

  let sceneNode = null;
  if (scene === 'idle') sceneNode = <IdleScene party={state.party} theme={theme} />;
  else if (scene === 'welcome') sceneNode = <WelcomeScene party={state.party} welcome={state.display.welcome} theme={theme} />;
  else if (scene === 'chronicle') sceneNode = <ChronicleScene chronicle={state.chronicle} theme={theme} />;
  else if (scene === 'countdown') sceneNode = <CountdownScene countdown={state.countdown} sound={state.sound} />;
  else if (scene === 'quiz') sceneNode = <QuizScene quiz={state.quiz} theme={theme} />;
  else if (scene === 'presentation') sceneNode = <PresentationScene presentation={state.presentation} />;
  else if (scene === 'gallery') sceneNode = <GalleryScene gallery={state.gallery} theme={theme} />;
  else if (scene === 'guestbook') sceneNode = <GuestbookScene guestbook={state.guestbook} theme={theme} />;
  else if (scene === 'stats') sceneNode = <StatsScene stats={state.stats} theme={theme} />;
  else if (scene === 'farewell') sceneNode = <FarewellScene party={state.party} theme={theme} />;

  return (
    <div className="display-root">
      <ThemeStyle cssVars={theme.cssVars} />
      <SoundEffectsListener sound={state.sound} />
      <div className="display-body">
        <SceneTransition sceneKey={scene}>{sceneNode}</SceneTransition>
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
