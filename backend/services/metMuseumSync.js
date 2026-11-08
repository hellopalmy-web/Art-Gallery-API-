const { hasCrudChanges, writeSyncedArtworks } = require("../data/artworkStore");
const { formatCause } = require("./metMuseumApi");

const ARTWORK_COUNT = 50;
const IDS_PER_TERM = 15;
const SEARCH_TERMS = [
  "painting",
  "sculpture",
  "ceramics",
  "drawing",
  "photograph",
  "textile",
  "jewelry",
  "furniture",
  "print",
  "bronze",
];

function normalizeCategory(classification, medium) {
  const raw = (classification || medium || "Mixed Media").trim();
  return raw.split(",")[0].trim() || "Mixed Media";
}

function toArtwork(object) {
  return {
    id: object.objectID,
    title: object.title || "Untitled",
    artist: object.artistDisplayName || "Unknown Artist",
    year: object.objectBeginDate || null,
    category: normalizeCategory(object.classification, object.medium),
    description:
      object.culture || object.country
        ? `ผลงานจาก ${object.culture || object.country}`
        : "",
    image: object.primaryImageSmall || object.primaryImage || null,
  };
}

async function syncArtworksFromMet({
  filePath,
  client,
  logger = console,
  searchTerms = SEARCH_TERMS,
  artworkCount = ARTWORK_COUNT,
  idsPerTerm = IDS_PER_TERM,
}) {
  try {
    if (await hasCrudChanges(filePath)) {
      logger.info?.(
        "[Met sync] Skipped: CRUD changes are recorded; current artworks.json was preserved."
      );
      return "skipped-crud";
    }

    const searchResults = await client.searchMany(searchTerms, {
      offset: 0,
      limit: idsPerTerm,
    });
    const ids = [...new Set(searchResults.flatMap((idsForTerm) =>
      idsForTerm.slice(0, idsPerTerm)
    ))];

    if (ids.length === 0) {
      logger.warn?.(
        "[Met sync] No results; existing artworks.json remains available as fallback."
      );
      return "no-results";
    }

    const artworks = [];
    for (
      let offset = 0;
      offset < ids.length && artworks.length < artworkCount;
      offset += artworkCount
    ) {
      const objects = await client.getObjects(
        ids.slice(offset, offset + artworkCount)
      );
      artworks.push(
        ...objects
          .filter((object) => object.primaryImageSmall || object.primaryImage)
          .map(toArtwork)
          .slice(0, artworkCount - artworks.length)
      );
    }

    if (artworks.length < artworkCount) {
      throw new Error(
        `Met API returned only ${artworks.length}/${artworkCount} usable artworks from ${ids.length} candidate IDs; existing data was preserved`
      );
    }

    const written = await writeSyncedArtworks(filePath, artworks);
    if (!written) {
      logger.info?.(
        "[Met sync] Skipped: CRUD changes completed during sync; current artworks.json was preserved."
      );
      return "skipped-crud";
    }

    logger.info?.(
      `[Met sync] Updated artworks.json with ${artworks.length} artworks from ${ids.length} successful object responses.`
    );
    return "updated";
  } catch (error) {
    logger.error?.(
      `[Met sync] Failed; existing artworks.json remains available as fallback. URL: ${error.url || "n/a"}; Status: ${error.status ?? "n/a"}; Cause: ${formatCause(error)}`
    );
    return "failed";
  }
}

module.exports = {
  ARTWORK_COUNT,
  IDS_PER_TERM,
  SEARCH_TERMS,
  syncArtworksFromMet,
};
