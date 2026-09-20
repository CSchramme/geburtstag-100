'use client';

import { useRotatingIndex } from '@/lib/useRotatingIndex';

export default function GalleryScene({ gallery, theme }) {
  const index = useRotatingIndex(gallery.length, 6000);

  if (!gallery.length) {
    return (
      <div className="display-scene display-scene-center">
        <p className="display-muted">{theme.labels.gallerySceneEmptyState}</p>
      </div>
    );
  }

  const photo = gallery[index];

  return (
    <div className="display-scene display-scene-center display-scene-flush">
      <img key={photo.id} src={photo.url} alt="" className="display-slide" />
      {(photo.caption || photo.name) && (
        <p className="display-caption">
          {photo.caption}
          {photo.name && <span className="display-muted"> — {photo.name}</span>}
        </p>
      )}
    </div>
  );
}
