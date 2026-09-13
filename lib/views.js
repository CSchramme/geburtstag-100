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
    guestbook: state.guestbook.filter((g) => g.status === 'approved'),
    gallery: state.gallery.filter((g) => g.status === 'approved'),
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
