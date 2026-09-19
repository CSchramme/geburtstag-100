import { resolveRef, seatablePool } from './seating';

export function toPublicState(state) {
  return {
    party: state.party,
    chronicle: state.chronicle,
    ticker: state.ticker,
    music: { nowPlaying: state.music.nowPlaying },
    countdown: state.countdown,
    quiz: publicQuiz(state.quiz),
    presentation: state.presentation,
    display: state.display,
    sound: state.sound,
    guestbook: state.guestbook.filter((g) => g.status === 'approved'),
    gallery: state.gallery.filter((g) => g.status === 'approved'),
    seating: {
      tables: state.seating.tables.map((t) => ({
        id: t.id,
        name: t.name,
        x: t.x,
        y: t.y,
        vertical: Boolean(t.vertical),
        guestNames: (t.seatRefs || [])
          .filter(Boolean)
          .map((ref) => resolveRef(state.guests, state.rsvps, ref))
          .filter(Boolean)
          .map((r) => r.name)
      })),
      walls: state.seating.walls.map((w) => ({ id: w.id, x: w.x, y: w.y, length: w.length, vertical: Boolean(w.vertical) }))
    },
    stats: publicStats(state),
    // For the /einchecken self-check-in page: everyone who could check in
    // (name + opaque ref only, no RSVP notes or other guest metadata) plus
    // which refs already have. Consistent with how seating lookup already
    // exposes the full name list - not a new class of exposure for this
    // small private-party site.
    checkinRoster: seatablePool(state.guests, state.rsvps).map((p) => ({ ref: p.ref, name: p.name })),
    checkedIn: state.checkedIn,
    impressum: { text: state.impressum.text }
  };
}

// Counts only, computed server-side, for the beamer's "Statistik" scene -
// deliberately not the raw guests/rsvps/checkedIn arrays, which carry more
// than a beamer full of guests needs to see.
function publicStats(state) {
  const approvedGallery = state.gallery.filter((g) => g.status === 'approved');
  const topPhoto = approvedGallery.slice().sort((a, b) => (b.likes || 0) - (a.likes || 0))[0];
  return {
    presentCount: state.checkedIn.length,
    expectedCount: seatablePool(state.guests, state.rsvps).length,
    guestbookCount: state.guestbook.filter((g) => g.status === 'approved').length,
    galleryCount: approvedGallery.length,
    songRequestCount: state.songRequests.length,
    topPhoto: topPhoto && topPhoto.likes > 0 ? { url: topPhoto.url, likes: topPhoto.likes } : null
  };
}

function publicQuiz(quiz) {
  const round = quiz.rounds.find((r) => r.id === quiz.activeRoundId);
  const candidate = round?.candidates[quiz.activeCandidateIndex];
  const totalClues = candidate ? candidate.clues.length : 0;
  return {
    visible: quiz.visible,
    roundName: round?.name || '',
    candidateNumber: candidate ? quiz.activeCandidateIndex + 1 : 0,
    candidateCount: round ? round.candidates.length : 0,
    clues: candidate ? candidate.clues.slice(0, quiz.revealedClueCount) : [],
    totalClues,
    answer: quiz.answerRevealed ? candidate?.name || '' : ''
  };
}
