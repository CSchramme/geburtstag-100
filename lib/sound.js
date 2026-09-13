import { id } from './store';
import { SOUND_KEYS } from './soundCatalog';

// Sets a one-shot "play this now" trigger on the state. Call from inside a
// store.update() mutator. The nonce guarantees the display client sees a
// change even if the same effect fires twice in a row.
export function fireSound(state, key) {
  if (!SOUND_KEYS.includes(key)) return;
  state.sound.trigger = { key, nonce: id(), at: Date.now() };
}
