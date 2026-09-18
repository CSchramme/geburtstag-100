import { resolveRef } from './seating';

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
    impressum: { text: state.impressum.text }
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
