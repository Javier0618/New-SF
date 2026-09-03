/**
 * TMDb Service calling backend proxy endpoints `/api/tmdb/...`
 */

export const fetchFromTMDb = async (endpoint, params = {}) => {
  const query = new URLSearchParams(params).toString();
  const url = `/api/tmdb/${endpoint}${query ? `?${query}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`TMDb API error: ${res.statusText}`);
  }
  return res.json();
};

export const searchTMDb = async (query, type = 'multi', page = 1) => {
  if (type === 'anime') {
    // TMDb doesn't have a direct 'anime' media_type, so search TV/movie and filter or tag
    return fetchFromTMDb('search/tv', { query, page, with_keywords: '210024' }); // or general search with query
  }
  return fetchFromTMDb(`search/${type}`, { query, page });
};

export const getTMDbDetails = async (id, mediaType = 'movie') => {
  const type = mediaType === 'anime' ? 'tv' : mediaType;
  const details = await fetchFromTMDb(`${type}/${id}`, { append_to_response: 'videos,credits,similar' });
  return details;
};

export const getTMDbSeasonDetails = async (tvId, seasonNumber) => {
  return fetchFromTMDb(`tv/${tvId}/season/${seasonNumber}`);
};
