'use client';

import { useEffect, useRef, useState } from 'react';

const TRANSITION_MS = 700;

// Crossfades between scenes: keeps the previous scene rendered (fading
// out) while the new one fades in on top, instead of an instant swap.
// sceneKey identifies WHICH scene is showing (so we only animate on an
// actual scene change, not on every content update within the same scene).
export default function SceneTransition({ sceneKey, children }) {
  const [current, setCurrent] = useState({ key: sceneKey, node: children });
  const [previous, setPrevious] = useState(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (sceneKey !== current.key) {
      setPrevious(current);
      setCurrent({ key: sceneKey, node: children });
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setPrevious(null), TRANSITION_MS);
    } else {
      setCurrent({ key: sceneKey, node: children });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneKey, children]);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  return (
    <div className="scene-transition">
      {previous && (
        <div className="scene-layer scene-layer-out" aria-hidden="true">
          {previous.node}
        </div>
      )}
      <div className="scene-layer scene-layer-in" key={current.key}>
        {current.node}
      </div>
    </div>
  );
}
