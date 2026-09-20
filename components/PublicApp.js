'use client';

import { useLiveState } from '@/lib/useLiveState';
import { resolveTheme } from '@/lib/theme';
import ThemeStyle from '@/components/ThemeStyle';
import Header from '@/components/public/Header';
import Ticker from '@/components/public/Ticker';
import Hero from '@/components/public/Hero';
import RsvpSection from '@/components/public/RsvpSection';
import SeatingLookup from '@/components/public/SeatingLookup';
import Chronicle from '@/components/public/Chronicle';
import QuizTeaser from '@/components/public/QuizTeaser';
import GallerySection from '@/components/public/GallerySection';
import GuestbookSection from '@/components/public/GuestbookSection';
import SongRequestSection from '@/components/public/SongRequestSection';
import Footer from '@/components/public/Footer';

export default function PublicApp() {
  const { state } = useLiveState();

  if (!state) {
    const fallback = resolveTheme();
    return (
      <div className="page-loading">
        <ThemeStyle cssVars={fallback.cssVars} />
        <p className="label">{fallback.labels.publicLoadingText}</p>
      </div>
    );
  }

  const theme = resolveTheme(state.theme);

  return (
    <div className="page">
      <ThemeStyle cssVars={theme.cssVars} />
      <Header party={state.party} theme={theme} />
      <Ticker ticker={state.ticker} />

      <main className="container public-main stack-lg">
        <Hero party={state.party} countdown={state.countdown} theme={theme} />
        <RsvpSection theme={theme} />
        <SeatingLookup seating={state.seating} />
        <Chronicle chronicle={state.chronicle} theme={theme} />
        <QuizTeaser quiz={state.quiz} theme={theme} />
        <SongRequestSection />
        <GallerySection gallery={state.gallery} theme={theme} />
        <GuestbookSection guestbook={state.guestbook} theme={theme} />
      </main>

      <Footer impressum={state.impressum} />
    </div>
  );
}
