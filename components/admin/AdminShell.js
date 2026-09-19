'use client';

import { useEffect, useRef, useState } from 'react';
import Crest from '@/components/Crest';
import { playSoundEffect } from '@/lib/playSoundEffect';
import OverviewTab from './tabs/OverviewTab';
import PartyTab from './tabs/PartyTab';
import RsvpTab from './tabs/RsvpTab';
import AttendanceTab from './tabs/AttendanceTab';
import SeatingTab from './tabs/SeatingTab';
import ChronicleTab from './tabs/ChronicleTab';
import StageTab from './tabs/StageTab';
import MasterTab from './tabs/MasterTab';
import MusicTab from './tabs/MusicTab';
import QuizTab from './tabs/QuizTab';
import GuestbookTab from './tabs/GuestbookTab';
import GalleryTab from './tabs/GalleryTab';
import PhotoboxTab from './tabs/PhotoboxTab';

const MANUAL_URL = 'https://claude.ai/code/artifact/a7343a7e-bcb3-49a2-b5ca-efceb3f2a09d';

const TABS = [
  { id: 'uebersicht', label: 'Übersicht' },
  { id: 'fest', label: 'Fest' },
  { id: 'zusagen', label: 'Zusagen' },
  { id: 'sitzplan', label: 'Sitzplan' },
  { id: 'anwesenheit', label: 'Anwesenheit' },
  { id: 'chronik', label: 'Chronik' },
  { id: 'buehne', label: 'Bühne' },
  { id: 'master', label: 'Master' },
  { id: 'musik', label: 'Musik' },
  { id: 'hofnarr', label: 'Hofnarr' },
  { id: 'gaestebuch', label: 'Gästebuch' },
  { id: 'galerie', label: 'Galerie' },
  { id: 'fotobox', label: 'Fotobox' }
];

function pendingCount(list) {
  return list.filter((x) => x.status === 'pending').length;
}

const TOAST_LIFETIME_MS = 9000;

export default function AdminShell({ state, connected, onLogout }) {
  const [tab, setTab] = useState('uebersicht');
  const [toasts, setToasts] = useState([]);
  const seenRef = useRef(null);

  // Notify about new guestbook/gallery/song-request submissions as they
  // arrive, regardless of which tab is currently open - a popup + chime,
  // since a badge count alone is easy to miss while running the party.
  useEffect(() => {
    if (!state) return;
    if (!seenRef.current) {
      seenRef.current = {
        guestbook: new Set(state.guestbook.map((g) => g.id)),
        gallery: new Set(state.gallery.map((g) => g.id)),
        songRequests: new Set(state.songRequests.map((s) => s.id))
      };
      return;
    }
    const seen = seenRef.current;
    const fresh = [];

    state.guestbook.forEach((g) => {
      if (seen.guestbook.has(g.id)) return;
      seen.guestbook.add(g.id);
      fresh.push({ id: `gb-${g.id}`, tab: 'gaestebuch', title: 'Neuer Gästebuch-Eintrag', body: `${g.name}: „${g.message}“` });
    });
    state.gallery.forEach((g) => {
      if (seen.gallery.has(g.id)) return;
      seen.gallery.add(g.id);
      fresh.push({ id: `gal-${g.id}`, tab: 'galerie', title: 'Neues Foto in der Galerie', body: g.name || g.caption || 'Ohne Namen' });
    });
    state.songRequests.forEach((s) => {
      if (seen.songRequests.has(s.id)) return;
      seen.songRequests.add(s.id);
      fresh.push({ id: `sr-${s.id}`, tab: 'master', title: 'Neuer Musikwunsch', body: s.text });
    });

    if (fresh.length) {
      setToasts((prev) => [...prev, ...fresh]);
      playSoundEffect('chime', 70);
      fresh.forEach((t) => {
        setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== t.id)), TOAST_LIFETIME_MS);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.guestbook, state?.gallery, state?.songRequests]);

  function dismissToast(id) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  function openToast(t) {
    setTab(t.tab);
    dismissToast(t.id);
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    onLogout();
  }

  const badges = {
    gaestebuch: pendingCount(state.guestbook),
    galerie: pendingCount(state.gallery),
    master: state.songRequests.filter((r) => r.status === 'pending').length
  };

  return (
    <div className="admin-shell">
      {toasts.length > 0 && (
        <div className="admin-toast-stack">
          {toasts.map((t) => (
            <div key={t.id} className="admin-toast" onClick={() => openToast(t)}>
              <div className="admin-toast-body">
                <strong>{t.title}</strong>
                <p>{t.body}</p>
              </div>
              <button
                type="button"
                className="admin-toast-close"
                onClick={(e) => {
                  e.stopPropagation();
                  dismissToast(t.id);
                }}
                aria-label="Schließen"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

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
        {tab === 'fest' && <PartyTab party={state.party} impressum={state.impressum} />}
        {tab === 'zusagen' && <RsvpTab rsvps={state.rsvps} />}
        {tab === 'sitzplan' && (
          <SeatingTab seating={state.seating} guests={state.guests} rsvps={state.rsvps} checkedIn={state.checkedIn} />
        )}
        {tab === 'anwesenheit' && <AttendanceTab guests={state.guests} rsvps={state.rsvps} checkedIn={state.checkedIn} />}
        {tab === 'chronik' && <ChronicleTab chronicle={state.chronicle} />}
        {tab === 'buehne' && (
          <StageTab display={state.display} ticker={state.ticker} countdown={state.countdown} presentation={state.presentation} />
        )}
        {tab === 'master' && <MasterTab sound={state.sound} songRequests={state.songRequests} />}
        {tab === 'musik' && <MusicTab music={state.music} />}
        {tab === 'hofnarr' && <QuizTab quiz={state.quiz} />}
        {tab === 'gaestebuch' && <GuestbookTab guestbook={state.guestbook} />}
        {tab === 'galerie' && <GalleryTab gallery={state.gallery} />}
        {tab === 'fotobox' && <PhotoboxTab />}
      </main>
    </div>
  );
}
