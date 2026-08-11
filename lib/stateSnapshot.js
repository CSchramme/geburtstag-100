import { get } from './store';
import { toPublicState } from './views';

export function snapshotFor(isAdmin) {
  const state = get();
  return isAdmin ? state : toPublicState(state);
}
