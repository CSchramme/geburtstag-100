// Reference frame shared by the admin floor-plan editor and the public
// "where do I sit" mini-map, so a table's stored x/y means the same thing
// in both places.
export const CANVAS_WIDTH = 900;
export const CANVAS_HEIGHT = 520;

// First letter of the last "word" in a name, ignoring a trailing
// "(Begleitung N)" annotation - used to disambiguate two seated people who
// share a first name (e.g. two "Michael"s at different tables).
export function lastNameInitial(name) {
  const clean = name.replace(/\s*\([^)]*\)\s*$/, '').trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  return parts.length > 1 ? parts[parts.length - 1][0].toUpperCase() : null;
}

// Shared helpers for resolving seating "refs" — a table's seatRefs array
// has one entry per physical seat: either null (empty) or a string like
// "g:<guestId>" (a manually registered guest) or "r:<rsvpId>:<n>" (the nth
// person covered by a confirmed RSVP — n=0 is the named guest, n>=1 are
// their unnamed "+1" companions, each getting their own seat). Used both
// server-side (public view, PDF export) and client-side (admin seating
// editor), so this file must stay free of Node-only APIs.

export function resolveRef(guests, rsvps, ref) {
  if (!ref) return null;
  if (ref.startsWith('g:')) {
    const g = guests.find((x) => x.id === ref.slice(2));
    return g ? { ref, name: g.name, kind: 'guest' } : null;
  }
  if (ref.startsWith('r:')) {
    const [, rsvpId, idxStr] = ref.split(':');
    const r = rsvps.find((x) => x.id === rsvpId);
    if (!r) return null;
    const idx = Number(idxStr || 0);
    const name = idx === 0 ? r.name : `${r.name} (Begleitung ${idx})`;
    return { ref, name, kind: 'rsvp' };
  }
  return null;
}

// Everyone who could be seated: manually registered guests, plus one entry
// per person covered by a confirmed RSVP (a party of 3 becomes 3 separate,
// individually seatable entries).
export function seatablePool(guests, rsvps) {
  const guestEntries = guests.map((g) => ({ ref: `g:${g.id}`, name: g.name, kind: 'guest' }));
  const rsvpEntries = [];
  rsvps
    .filter((r) => r.attending === 'yes')
    .forEach((r) => {
      const count = r.guestCount || 1;
      for (let i = 0; i < count; i++) {
        rsvpEntries.push({
          ref: `r:${r.id}:${i}`,
          name: i === 0 ? r.name : `${r.name} (Begleitung ${i})`,
          kind: 'rsvp'
        });
      }
    });
  return [...guestEntries, ...rsvpEntries];
}
