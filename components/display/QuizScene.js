export default function QuizScene({ quiz }) {
  return (
    <div className="display-scene display-scene-center">
      <p className="display-heading">Das Rätsel des Hofnarren</p>
      <p className="display-sub">
        {quiz.roundName} · Person {quiz.candidateNumber} von {quiz.candidateCount}
      </p>

      {quiz.answer ? (
        <p className="display-answer">{quiz.answer}</p>
      ) : quiz.clues?.length ? (
        <ul className="display-clues">
          {quiz.clues.map((clue, i) => (
            <li key={i}>{clue}</li>
          ))}
        </ul>
      ) : (
        <p className="display-muted">Der Hofnarr schweigt noch …</p>
      )}
    </div>
  );
}
