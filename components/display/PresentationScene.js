export default function PresentationScene({ presentation }) {
  if (presentation.mode === 'embed' && presentation.embedUrl) {
    return (
      <div className="display-scene display-scene-flush">
        <iframe
          src={presentation.embedUrl}
          className="display-embed"
          allow="autoplay"
          title="Präsentation"
        />
      </div>
    );
  }

  if (presentation.mode === 'slides' && presentation.slides?.length) {
    const url = presentation.slides[presentation.currentSlideIndex] || presentation.slides[0];
    return (
      <div className="display-scene display-scene-center display-scene-flush">
        <img src={url} alt="" className="display-slide" />
      </div>
    );
  }

  return (
    <div className="display-scene display-scene-center">
      <p className="display-muted">Noch keine Präsentation live geschaltet.</p>
    </div>
  );
}
