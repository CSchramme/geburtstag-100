'use client';

import { useState } from 'react';
import Crest from '@/components/Crest';
import OverviewTab from './tabs/OverviewTab';
import PartyTab from './tabs/PartyTab';
import ChronicleTab from './tabs/ChronicleTab';
import StageTab from './tabs/StageTab';
import MusicTab from './tabs/MusicTab';
import QuizTab from './tabs/QuizTab';
import GuestbookTab from './tabs/GuestbookTab';
import GalleryTab from './tabs/GalleryTab';
import PhotoboxTab from './tabs/PhotoboxTab';

const MANUAL_URL = 'https://claude.ai/code/artifact/a7343a7e-bcb3-49a2-b5ca-efceb3f2a09d';

const TABS = [
  { id: 'uebersicht', label: 'Übersicht' },
  { id: 'fest', label: 'Fest & Ablauf' },
  { id: 'chronik', label: 'Chronik' },
  { id: 'buehne', label: 'Bühne' },
  { id: 'musik', label: 'Musik' },
  { id: 'hofnarr', label: 'Hofnarr' },
  { id: 'gaestebuch', label: 'Gästebuch' },
  { id: 'galerie', label: 'Galerie' },
  { id: 'fotobox', label: 'Fotobox' }
];

function pendingCount(list) {
  return list.filter((x) => x.status === 'pending').length;
}

export default function AdminShell({ state, connected, onLogout }) {
  const [tab, setTab] = useState('uebersicht');

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    onLogout();
  }

  const badges = {
    gaestebuch: pendingCount(state.guestbook),
    galerie: pendingCount(state.gallery)
  };

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <div className="admin-topbar-brand">
          <Crest size={36} />
          <div>
            <strong>Kommandozentrale</strong>
            <span className="muted small"> · {state.party.coupleNames}</span>
          </div>
        </div>
        <div className="admin-topbar-actions">
          <span className={`badge ${connected ? 'badge-green' : 'badge-red'}`}>
            <span className="badge-dot" />
            {connected ? 'Verbunden' : 'Getrennt'}
          </span>
          <a className="btn btn-ghost btn-sm" href={MANUAL_URL} target="_blank" rel="noopener noreferrer">
            Anleitung
          </a>
          <button type="button" className="btn btn-ghost btn-sm" onClick={handleLogout}>
            Abmelden
          </button>
        </div>
      </header>

      <nav className="admin-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`admin-tab ${tab === t.id ? 'is-active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
            {badges[t.id] > 0 && <span className="admin-tab-badge">{badges[t.id]}</span>}
          </button>
        ))}
      </nav>

      <main className="admin-content">
        {tab === 'uebersicht' && <OverviewTab state={state} onNavigate={setTab} />}
        {tab === 'fest' && <PartyTab party={state.party} agenda={state.agenda} impressum={state.impressum} />}
        {tab === 'chronik' && <ChronicleTab chronicle={state.chronicle} />}
        {tab === 'buehne' && (
          <StageTab display={state.display} ticker={state.ticker} countdown={state.countdown} presentation={state.presentation} />
        )}
        {tab === 'musik' && <MusicTab music={state.music} />}
        {tab === 'hofnarr' && <QuizTab quiz={state.quiz} />}
        {tab === 'gaestebuch' && <GuestbookTab guestbook={state.guestbook} />}
        {tab === 'galerie' && <GalleryTab gallery={state.gallery} />}
        {tab === 'fotobox' && <PhotoboxTab />}
      </main>
    </div>
  );
}
