export async function api(path, options = {}) {
  const res = await fetch(path, {
    method: options.method || (options.body ? 'POST' : 'GET'),
    headers: options.body instanceof FormData ? undefined : { 'Content-Type': 'application/json' },
    body: options.body instanceof FormData ? options.body : options.body ? JSON.stringify(options.body) : undefined,
    credentials: 'same-origin'
  });
  let json = null;
  try {
    json = await res.json();
  } catch {
    // empty body
  }
  if (!res.ok) {
    throw new Error(json?.error || `Anfrage fehlgeschlagen (${res.status})`);
  }
  return json;
}
