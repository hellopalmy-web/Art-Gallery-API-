(function (global) {
  function normalizeText(value) {
    return String(value ?? '').trim().toLowerCase();
  }

  function getSearchSuggestions(artworks, keyword) {
    const query = normalizeText(keyword);

    if (!query) {
      return [];
    }

    return (artworks || [])
      .map((artwork, index) => {
        const title = String(artwork?.title ?? '');
        const artist = String(artwork?.artist ?? '');
        const year = String(artwork?.year ?? '');
        const country = String(artwork?.country ?? artwork?.culture ?? artwork?.description ?? '');
        const titleLower = title.toLowerCase();
        const artistLower = artist.toLowerCase();
        const yearLower = year.toLowerCase();
        const countryLower = country.toLowerCase();

        const titleIndex = titleLower.indexOf(query);
        const artistIndex = artistLower.indexOf(query);
        const yearIndex = yearLower.indexOf(query);
        const countryIndex = countryLower.indexOf(query);

        if (titleIndex === -1 && artistIndex === -1 && yearIndex === -1 && countryIndex === -1) {
          return null;
        }

        let kind = 'title';
        let priority = 50;

        if (titleIndex !== -1) {
          kind = 'title';
          priority = titleIndex === 0 ? 0 : titleIndex < 4 ? 5 : 10;
        } else if (artistIndex !== -1) {
          kind = 'artist';
          priority = artistIndex === 0 ? 15 : 20;
        } else if (yearIndex !== -1) {
          kind = 'year';
          priority = 30;
        } else {
          kind = 'country';
          priority = countryIndex === 0 ? 35 : 40;
        }

        return {
          id: artwork?.id ?? `${title}-${artist}-${year}`,
          title,
          artist,
          year,
          image: artwork?.image ?? '',
          kind,
          priority,
          originalIndex: index,
          label: kind === 'artist' ? `${artist} • ${title}` : kind === 'year' ? `${title} • ${year}` : title,
        };
      })
      .filter(Boolean)
      .sort((left, right) => {
        if (left.priority !== right.priority) {
          return left.priority - right.priority;
        }

        return left.originalIndex - right.originalIndex;
      })
      .slice(0, 6);
  }

  const api = { getSearchSuggestions };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  global.ArtGallerySearchUtils = api;
})(typeof window !== 'undefined' ? window : globalThis);
