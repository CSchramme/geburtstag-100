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
