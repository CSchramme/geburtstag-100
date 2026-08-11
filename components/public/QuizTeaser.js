export default function QuizTeaser({ quiz }) {
  if (!quiz?.visible) return null;
  return (
    <section id="raetsel" className="section">
      <h2 className="section-title">Das Rätsel des Hofnarren</h2>
      <div className="panel quiz-card">
        <p className="label center-text mt-0">
          {quiz.roundName} · Person {quiz.candidateNumber} von {quiz.candidateCount}
        </p>
        {quiz.answer ? (
          <p className="quiz-answer">{quiz.answer}</p>
        ) : quiz.clues?.length ? (
          <ul className="quiz-clues">
            {quiz.clues.map((clue, i) => (
              <li key={i}>{clue}</li>
            ))}
          </ul>
        ) : (
          <p className="muted center-text">Der Hofnarr schweigt noch – gleich kommt der erste Hinweis …</p>
        )}
      </div>
    </section>
  );
}
