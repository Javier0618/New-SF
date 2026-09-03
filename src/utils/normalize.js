/**
  * Removes accents, diacritics, and special characters from a string, converting to lowercase.
  * E.g. "Canción Árbol Él" -> "cancion arbol el"
  */
export function normalizeText(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accent marks
    .replace(/[^a-z0-9\s]/g, '')     // remove non-alphanumeric chars except space
    .trim();
}

/**
 * Checks if search string matches target text (ignoring accents and case)
 */
export function matchesSearch(targetText, queryText) {
  if (!queryText) return true;
  if (!targetText) return false;
  const normTarget = normalizeText(targetText);
  const normQuery = normalizeText(queryText);
  return normTarget.includes(normQuery);
}

/**
 * Formats runtime in minutes to "Xh Ym"
 */
export function formatRuntime(minutes) {
  if (!minutes || isNaN(minutes)) return null;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs === 0) return `${mins}m`;
  if (mins === 0) return `${hrs}h`;
  return `${hrs}h ${mins}m`;
}

/**
 * Formats date string to release year
 */
export function getYear(dateString) {
  if (!dateString) return '';
  return dateString.split('-')[0] || dateString;
}

/**
 * Get full image URL from TMDB path or fallback
 */
export function getImageUrl(path, size = 'w500', fallback = '/placeholder.jpg') {
  if (!path) return fallback;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}
