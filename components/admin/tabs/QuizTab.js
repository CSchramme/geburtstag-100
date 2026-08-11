'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

async function quizOp(op, payload) {
  return api('/api/admin/quiz', { method: 'POST', body: { op, ...payload } });
}

export default function QuizTab({ quiz }) {
  const [editRoundId, setEditRoundId] = useState(quiz.activeRoundId);
  const editRound = quiz.rounds.find((r) => r.id === editRoundId) || quiz.rounds[0];
  const activeRound = quiz.rounds.find((r) => r.id === quiz.activeRoundId);
  const activeCandidate = activeRound?.candidates[quiz.activeCandidateIndex];

  return (
    <div className="stack">
      <div className="panel">
        <div className="spread">
          <p className="panel-title mt-0">Anzeige für die Gäste</p>
          <button
            type="button"
            className={`seal-toggle ${quiz.visible ? 'is-on' : ''}`}
            onClick={() => quizOp(quiz.visible ? 'hide' : 'show')}
            aria-pressed={quiz.visible}
            aria-label="Rätsel ein-/ausblenden"
          />
        </div>

        <div className="quiz-round-tabs">
          {quiz.rounds.map((r) => (
            <button
              key={r.id}
              type="button"
              className={`btn btn-sm ${quiz.activeRoundId === r.id ? 'btn-gold' : 'btn-ghost'}`}
              onClick={() => quizOp('setRound', { roundId: r.id })}
            >
              {r.name}
            </button>
          ))}
        </div>

        {activeRound && (
          <div className="quiz-control">
            <div className="inline-form">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                disabled={quiz.activeCandidateIndex <= 0}
                onClick={() => quizOp('setCandidate', { index: quiz.activeCandidateIndex - 1 })}
              >
                ◄ Vorherige Person
              </button>
              <span className="small muted">
                Person {activeRound.candidates.length ? quiz.activeCandidateIndex + 1 : 0} / {activeRound.candidates.length}
              </span>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                disabled={quiz.activeCandidateIndex >= activeRound.candidates.length - 1}
                onClick={() => quizOp('setCandidate', { index: quiz.activeCandidateIndex + 1 })}
              >
                Nächste Person ►
              </button>
            </div>

            {activeCandidate ? (
              <>
                <p className="quiz-secret-name">Geheimnis: <strong>{activeCandidate.name}</strong></p>
                <ol className="admin-list">
                  {activeCandidate.clues.map((clue, i) => (
                    <li key={i} className="admin-list-row">
                      <span className={`badge ${i < quiz.revealedClueCount ? 'badge-green' : 'badge-gold'}`}>
                        {i < quiz.revealedClueCount ? 'gezeigt' : 'verborgen'}
                      </span>
                      <div className="admin-list-body"><p>{clue}</p></div>
                    </li>
                  ))}
                </ol>
                <div className="inline-form">
                  <button type="button" className="btn btn-ghost btn-sm" disabled={quiz.revealedClueCount <= 0} onClick={() => quizOp('unreveal')}>
                    Hinweis verbergen
                  </button>
                  <button
                    type="button"
                    className="btn btn-gold btn-sm"
                    disabled={quiz.revealedClueCount >= activeCandidate.clues.length}
                    onClick={() => quizOp('reveal')}
                  >
                    Nächsten Hinweis zeigen
                  </button>
                  {quiz.answerRevealed ? (
                    <button type="button" className="btn btn-wine btn-sm" onClick={() => quizOp('hideAnswer')}>
                      Antwort verbergen
                    </button>
                  ) : (
                    <button type="button" className="btn btn-wine btn-sm" onClick={() => quizOp('revealAnswer')}>
                      Antwort auflösen
                    </button>
                  )}
                </div>
              </>
            ) : (
              <p className="muted">Diese Runde hat noch keine Personen. Lege sie unten an.</p>
            )}
          </div>
        )}
      </div>

      <div className="panel">
        <p className="panel-title">Personen bearbeiten</p>
        <div className="quiz-round-tabs">
          {quiz.rounds.map((r) => (
            <button
              key={r.id}
              type="button"
              className={`btn btn-sm ${editRoundId === r.id ? 'btn-gold' : 'btn-ghost'}`}
              onClick={() => setEditRoundId(r.id)}
            >
              {r.name}
            </button>
          ))}
        </div>

        <div className="stack">
          {editRound?.candidates.map((c) => (
            <CandidateEditor key={c.id} roundId={editRound.id} candidate={c} />
          ))}
        </div>

        <AddCandidateForm roundId={editRound?.id} />
      </div>
    </div>
  );
}

function CandidateEditor({ roundId, candidate }) {
  const [name, setName] = useState(candidate.name);
  const [clues, setClues] = useState(candidate.clues);

  function saveName() {
    quizOp('updateCandidate', { roundId, candidateId: candidate.id, name });
  }

  function updateClue(i, value) {
    const next = clues.slice();
    next[i] = value;
    setClues(next);
  }

  function saveClues(next) {
    quizOp('updateCandidate', { roundId, candidateId: candidate.id, clues: next });
  }

  function addClue() {
    const next = [...clues, ''];
    setClues(next);
  }

  function removeClue(i) {
    const next = clues.filter((_, idx) => idx !== i);
    setClues(next);
    saveClues(next);
  }

  return (
    <div className="quiz-candidate">
      <input
        className="input"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={saveName}
        placeholder="Name (Geheimnis)"
      />
      <div className="stack" style={{ marginTop: 8 }}>
        {clues.map((clue, i) => (
          <div className="inline-form" key={i}>
            <input
              className="input"
              value={clue}
              onChange={(e) => updateClue(i, e.target.value)}
              onBlur={() => saveClues(clues)}
              placeholder={`Hinweis ${i + 1}`}
            />
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeClue(i)}>✕</button>
          </div>
        ))}
        <button type="button" className="btn btn-ghost btn-sm" onClick={addClue}>+ Hinweis</button>
      </div>
      <button
        type="button"
        className="btn btn-wine btn-sm"
        style={{ marginTop: 10 }}
        onClick={() => quizOp('deleteCandidate', { roundId, candidateId: candidate.id })}
      >
        Person entfernen
      </button>
      <div className="divider" />
    </div>
  );
}

function AddCandidateForm({ roundId }) {
  const [name, setName] = useState('');

  async function add(e) {
    e.preventDefault();
    if (!name.trim() || !roundId) return;
    await quizOp('addCandidate', { roundId, name, clues: [''] });
    setName('');
  }

  return (
    <form className="inline-form" onSubmit={add} style={{ marginTop: 14 }}>
      <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Neue Person (Name)" />
      <button type="submit" className="btn btn-gold btn-sm">+ Hinzufügen</button>
    </form>
  );
}
