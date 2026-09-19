import { id as genId } from './store';
import { resolveRef } from './seating';
import { fireSound } from './sound';

const WELCOME_DURATION_MS = 8000;

// Shared by the admin "Anwesenheit" tab and the public self-check-in page -
// marks `ref` present and pops their name up on the beamer, unless they're
// already checked in (repeat calls, e.g. a guest tapping twice, are a
// harmless no-op). Call from inside a store.update() mutator. Returns
// whether this call actually changed anything.
export function checkIn(state, ref) {
  if (state.checkedIn.includes(ref)) return false;
  state.checkedIn.push(ref);

  const resolved = resolveRef(state.guests, state.rsvps, ref);
  state.display.welcome = {
    name: resolved ? resolved.name : '',
    nonce: genId(),
    revertAt: Date.now() + WELCOME_DURATION_MS
  };
  state.display.scene = 'welcome';
  fireSound(state, 'fanfare');
  return true;
}
