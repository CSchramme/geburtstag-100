import { NextResponse } from 'next/server';
import { get, update, id as genId } from '@/lib/store';

export const runtime = 'nodejs';

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const { op } = body;

  update((state) => {
    const quiz = state.quiz;
    const round = quiz.rounds.find((r) => r.id === (body.roundId || quiz.activeRoundId));

    switch (op) {
      case 'addCandidate': {
        if (!round) break;
        round.candidates.push({
          id: genId(),
          name: body.name || '',
          clues: Array.isArray(body.clues) ? body.clues.filter(Boolean) : []
        });
        break;
      }
      case 'updateCandidate': {
        if (!round) break;
        const c = round.candidates.find((x) => x.id === body.candidateId);
        if (c) {
          if (typeof body.name === 'string') c.name = body.name;
          if (Array.isArray(body.clues)) c.clues = body.clues.filter(Boolean);
        }
        break;
      }
      case 'deleteCandidate': {
        if (!round) break;
        round.candidates = round.candidates.filter((x) => x.id !== body.candidateId);
        break;
      }
      case 'setRound': {
        if (quiz.rounds.some((r) => r.id === body.roundId)) {
          quiz.activeRoundId = body.roundId;
          quiz.activeCandidateIndex = 0;
          quiz.revealedClueCount = 0;
          quiz.answerRevealed = false;
        }
        break;
      }
      case 'setCandidate': {
        quiz.activeCandidateIndex = Math.max(0, Number(body.index) || 0);
        quiz.revealedClueCount = 0;
        quiz.answerRevealed = false;
        break;
      }
      case 'reveal': {
        const active = round?.candidates[quiz.activeCandidateIndex];
        const max = active ? active.clues.length : 0;
        quiz.revealedClueCount = Math.min(max, quiz.revealedClueCount + 1);
        break;
      }
      case 'unreveal': {
        quiz.revealedClueCount = Math.max(0, quiz.revealedClueCount - 1);
        break;
      }
      case 'revealAnswer': {
        quiz.answerRevealed = true;
        break;
      }
      case 'hideAnswer': {
        quiz.answerRevealed = false;
        break;
      }
      case 'show': {
        quiz.visible = true;
        break;
      }
      case 'hide': {
        quiz.visible = false;
        break;
      }
      default:
        break;
    }
  });

  return NextResponse.json({ ok: true, quiz: get().quiz });
}
