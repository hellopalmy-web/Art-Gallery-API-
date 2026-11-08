const MET_API_BASE =
  "https://collectionapi.metmuseum.org/public/collection/v1";
const MET_SEARCH_API =
  "https://collectionapi.metmuseum.org/public/collection/v1.1/search";
const RETRYABLE_STATUS = (status) => status === 429 || status >= 500;

class MetApiError extends Error {
  constructor(message, { url, status = null, cause = undefined } = {}) {
    super(message, { cause });
    this.name = "MetApiError";
    this.url = url;
    this.status = status;
  }
}

function formatCause(error) {
  const causes = [];
  const seen = new Set();
  let current = error;
  while (current && !seen.has(current)) {
    seen.add(current);
    causes.push(`${current.name || "Error"}: ${current.message || String(current)}`);
    current = current.cause;
  }
  return causes.join(" <- ");
}

function retryDelay(response, attempt, baseDelayMs, maxDelayMs) {
  const retryAfter = response?.headers?.get?.("retry-after");
  if (retryAfter) {
    const seconds = Number(retryAfter);
    const retryAt = Number.isFinite(seconds)
      ? Date.now() + seconds * 1000
      : Date.parse(retryAfter);
    if (Number.isFinite(retryAt)) {
      return Math.min(maxDelayMs, Math.max(0, retryAt - Date.now()));
    }
  }
  return Math.min(maxDelayMs, baseDelayMs * 2 ** attempt);
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function mapWithConcurrency(items, concurrency, callback) {
  const results = new Array(items.length);
  let nextIndex = 0;
  const workerCount = Math.min(items.length, concurrency);

  await Promise.all(
    Array.from({ length: workerCount }, async () => {
      while (true) {
        const index = nextIndex;
        nextIndex += 1;
        if (index >= items.length) {
          return;
        }
        results[index] = await callback(items[index], index);
      }
    })
  );
  return results;
}

function createMetMuseumApi({
  fetchImpl = globalThis.fetch,
  timeoutMs = 15000,
  retries = 2,
  concurrency = 4,
  retryBaseDelayMs = 300,
  maxRetryDelayMs = 30000,
  logger = console,
} = {}) {
  if (typeof fetchImpl !== "function") {
    throw new TypeError("A Fetch API implementation is required");
  }
  if (!Number.isInteger(concurrency) || concurrency < 1) {
    throw new RangeError("Met API concurrency must be a positive integer");
  }

  async function getJson(url) {
    for (let attempt = 0; attempt <= retries; attempt += 1) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      let response;
      let error;
      let shouldRetry = false;

      try {
        response = await fetchImpl(url, { signal: controller.signal });
        if (!response.ok) {
          shouldRetry = RETRYABLE_STATUS(response.status);
          let responseDetails = "";
          try {
            const body = await response.text();
            if (body) {
              responseDetails = `; response: ${body.slice(0, 1000)}`;
            }
          } catch (bodyError) {
            responseDetails = `; error body unavailable: ${formatCause(bodyError)}`;
          }
          throw new MetApiError(
            `Met API request failed: HTTP ${response.status} ${response.statusText || ""}${responseDetails}`.trim(),
            { url, status: response.status }
          );
        }

        const body = await response.text();
        try {
          return JSON.parse(body);
        } catch (parseError) {
          throw new MetApiError("Met API returned invalid JSON", {
            url,
            status: response.status,
            cause: parseError,
          });
        }
      } catch (requestError) {
        error = requestError;
        if (requestError instanceof MetApiError) {
          shouldRetry = shouldRetry || RETRYABLE_STATUS(requestError.status);
        } else {
          shouldRetry = true;
          const timedOut =
            controller.signal.aborted || requestError.name === "AbortError";
          error = new MetApiError(
            timedOut
              ? `Met API request timed out after ${timeoutMs}ms`
              : `Met API network request failed: ${requestError.message || requestError}`,
            { url, cause: requestError }
          );
        }
      } finally {
        clearTimeout(timeoutId);
      }

      if (!shouldRetry || attempt === retries) {
        throw error;
      }

      const delayMs = retryDelay(
        response,
        attempt,
        retryBaseDelayMs,
        maxRetryDelayMs
      );
      logger.warn?.(
        `[Met API] Retry ${attempt + 1}/${retries} in ${delayMs}ms; URL: ${url}; Status: ${error.status ?? "network/timeout"}; Cause: ${formatCause(error)}`
      );
      await wait(delayMs);
    }
    throw new Error("Unreachable Met API retry state");
  }

  async function search(term, { offset = 0, limit = 15 } = {}) {
    if (!Number.isSafeInteger(offset) || offset < 0) {
      throw new RangeError("Met API search offset must be a non-negative integer");
    }
    if (!Number.isInteger(limit) || limit < 1 || limit > 500) {
      throw new RangeError("Met API search limit must be between 1 and 500");
    }

    const url = new URL(MET_SEARCH_API);
    url.searchParams.set("hasImages", "true");
    url.searchParams.set("q", term);
    url.searchParams.set("offset", String(offset));
    url.searchParams.set("limit", String(limit));
    const payload = await getJson(url.toString());

    if (
      !payload ||
      typeof payload !== "object" ||
      !Object.prototype.hasOwnProperty.call(payload, "objectIDs") ||
      (payload.objectIDs !== null &&
        (!Array.isArray(payload.objectIDs) ||
          payload.objectIDs.length > limit ||
          payload.objectIDs.some(
            (id) => !Number.isSafeInteger(id) || id < 1
          ))) ||
      !Number.isSafeInteger(payload.total) ||
      payload.total < 0 ||
      (payload.total === 0 &&
        Array.isArray(payload.objectIDs) &&
        payload.objectIDs.length > 0)
    ) {
      throw new MetApiError("Met API returned an invalid search payload", {
        url: url.toString(),
        status: 200,
      });
    }
    return payload.objectIDs || [];
  }

  async function getObject(id) {
    const url = `${MET_API_BASE}/objects/${id}`;
    const payload = await getJson(url);
    if (
      !payload ||
      typeof payload !== "object" ||
      payload.objectID !== id ||
      [
        "title",
        "artistDisplayName",
        "primaryImageSmall",
        "primaryImage",
        "classification",
        "medium",
        "culture",
        "country",
      ].some(
        (field) =>
          payload[field] !== undefined &&
          payload[field] !== null &&
          typeof payload[field] !== "string"
      ) ||
      (payload.objectBeginDate !== undefined &&
        payload.objectBeginDate !== null &&
        (typeof payload.objectBeginDate !== "number" ||
          !Number.isFinite(payload.objectBeginDate)))
    ) {
      throw new MetApiError("Met API returned an invalid object payload", {
        url,
        status: 200,
      });
    }
    return payload;
  }

  return {
    getJson,
    search,
    getObject,
    searchMany: (terms, options) =>
      mapWithConcurrency(terms, concurrency, (term) => search(term, options)),
    getObjects: (ids) =>
      mapWithConcurrency(ids, concurrency, (id) => getObject(id)),
  };
}

module.exports = {
  MET_API_BASE,
  MetApiError,
  createMetMuseumApi,
  formatCause,
  mapWithConcurrency,
};
