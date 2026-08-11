'use client';

import { useLiveState } from '@/lib/useLiveState';
import Header from '@/components/public/Header';
import Ticker from '@/components/public/Ticker';
import Hero from '@/components/public/Hero';
import Agenda from '@/components/public/Agenda';
import Chronicle from '@/components/public/Chronicle';
import QuizTeaser from '@/components/public/QuizTeaser';
import GallerySection from '@/components/public/GallerySection';
import GuestbookSection from '@/components/public/GuestbookSection';
import Footer from '@/components/public/Footer';

export default function PublicApp() {
  const { state } = useLiveState();

  if (!state) {
    return (
      <div className="page-loading">
        <p className="label">Das Tor wird geöffnet …</p>
      </div>
    );
  }

  return (
    <div className="page">
      <Header party={state.party} />
      <Ticker ticker={state.ticker} />

      <main className="container public-main stack-lg">
        <Hero party={state.party} countdown={state.countdown} />
        <Agenda agenda={state.agenda} />
        <Chronicle chronicle={state.chronicle} />
        <QuizTeaser quiz={state.quiz} />
        <GallerySection gallery={state.gallery} />
        <GuestbookSection guestbook={state.guestbook} />
      </main>

      <Footer impressum={state.impressum} />
    </div>
  );
}
