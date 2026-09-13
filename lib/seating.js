// Shared helpers for resolving seating "refs" — a table's guestRefs array
// holds strings like "g:<guestId>" (a manually registered guest) or
// "r:<rsvpId>" (a confirmed RSVP, which may cover more than one person).
// Used both server-side (public view, PDF export) and client-side (admin
// seating editor), so this file must stay free of Node-only APIs.

export function resolveRef(guests, rsvps, ref) {
  if (!ref) return null;
  if (ref.startsWith('g:')) {
    const g = guests.find((x) => x.id === ref.slice(2));
    return g ? { ref, name: g.name, count: 1, kind: 'guest' } : null;
  }
  if (ref.startsWith('r:')) {
    const r = rsvps.find((x) => x.id === ref.slice(2));
    return r ? { ref, name: r.name, count: r.guestCount || 1, kind: 'rsvp' } : null;
  }
  return null;
}

export function displayName(resolved) {
  const extra = resolved.count - 1;
  return extra > 0 ? `${resolved.name} (+${extra})` : resolved.name;
}

// Everyone who could be seated: manually registered guests plus everyone
// who confirmed attendance via RSVP.
export function seatablePool(guests, rsvps) {
  const guestEntries = guests.map((g) => ({ ref: `g:${g.id}`, name: g.name, count: 1, kind: 'guest' }));
  const rsvpEntries = rsvps
    .filter((r) => r.attending === 'yes')
    .map((r) => ({ ref: `r:${r.id}`, name: r.name, count: r.guestCount || 1, kind: 'rsvp' }));
  return [...guestEntries, ...rsvpEntries];
}

export function tableOccupants(guests, rsvps, table) {
  return (table.guestRefs || [])
    .map((ref) => resolveRef(guests, rsvps, ref))
    .filter(Boolean);
}

export function tableOccupancy(guests, rsvps, table) {
  return tableOccupants(guests, rsvps, table).reduce((sum, o) => sum + o.count, 0);
}

export function seatedRefSet(tables) {
  return new Set(tables.flatMap((t) => t.guestRefs || []));
}
