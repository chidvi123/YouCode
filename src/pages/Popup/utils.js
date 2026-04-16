export function formatTime(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;

  return h > 0 ? `${h}h ${m}m` : `${m}m ${s}s`;
}
