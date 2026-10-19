export function parseNowPlaying(raw: string | null | undefined) {
  const value = raw?.replace(/\0/g, '').trim();
  if (!value) return null;
  // Only split the first separator: song names can also contain " - ".
  const separator = value.indexOf(' - ');
  if (separator < 1 || separator + 3 >= value.length) {
    return { title: value, artist: null };
  }
  return {
    artist: value.slice(0, separator).trim().replace(/\s*\[\+\]\s*/g, ' & '),
    title: value.slice(separator + 3).trim(),
  };
}
