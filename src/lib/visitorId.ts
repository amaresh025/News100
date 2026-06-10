// Stable per-browser visitor ID (for likes throttle, not security)
export function getVisitorId(): string {
  const KEY = 'n100_visitor_id';
  let v = localStorage.getItem(KEY);
  if (!v) {
    v = crypto.randomUUID();
    localStorage.setItem(KEY, v);
  }
  return v;
}
