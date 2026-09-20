export default function QuizTeaser({ quiz, theme }) {
  if (!quiz?.visible) return null;
  const labels = theme.labels;
  return (
    <section id="raetsel" className="section">
      <h2 className="section-title">{labels.quizSectionHeading}</h2>
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
          <p className="muted center-text">{labels.quizEmptyState}</p>
        )}
      </div>
    </section>
  );
}
