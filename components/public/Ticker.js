export default function Ticker({ ticker }) {
  if (!ticker?.active || !ticker?.text?.trim()) return null;
  const text = ticker.text.trim();
  return (
    <div className="ticker" role="status">
      <div className="ticker-track">
        <span>{text}</span>
        <span>{text}</span>
        <span>{text}</span>
        <span>{text}</span>
      </div>
    </div>
  );
}
