const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const { createMetMuseumApi, MET_API_BASE } = require("../services/metMuseumApi");
const { syncArtworksFromMet } = require("../services/metMuseumSync");

const sourceDataFile = path.join(__dirname, "..", "data", "artworks.json");

function jsonResponse(payload, status = 200, headers = {}) {
  return new Response(JSON.stringify(payload), { status, headers });
}

async function withDatasetCopy(callback) {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "met-sync-test-"));
  const sourceBytes = await fs.readFile(sourceDataFile);
  const filePath = path.join(directory, "artworks.json");
  await fs.copyFile(sourceDataFile, filePath);

  try {
    await callback({ directory, filePath, sourceBytes });
  } finally {
    assert.deepEqual(await fs.readFile(sourceDataFile), sourceBytes);
    await fs.rm(directory, { recursive: true, force: true });
  }
}

test("Met API builds correct endpoints and treats null objectIDs as no results", async () => {
  const requestedUrls = [];
  const api = createMetMuseumApi({
    fetchImpl: async (url) => {
      requestedUrls.push(url);
      if (url.includes("/search?")) {
        return jsonResponse({ total: 0, objectIDs: null });
      }
      return jsonResponse({ objectID: 42 });
    },
    retryBaseDelayMs: 0,
  });

  assert.deepEqual(await api.search("oil painting & ink"), []);
  await api.getObject(42);
  assert.equal(
    requestedUrls[0],
    `https://collectionapi.metmuseum.org/public/collection/v1.1/search?hasImages=true&q=oil+painting+%26+ink&offset=0&limit=15`
  );
  assert.equal(requestedUrls[1], `${MET_API_BASE}/objects/42`);
});

test("Met API rejects invalid JSON and malformed response payloads", async () => {
  const invalidJsonClient = createMetMuseumApi({
    fetchImpl: async () => new Response("{invalid", { status: 200 }),
    retries: 0,
  });
  await assert.rejects(invalidJsonClient.search("painting"), (error) => {
    assert.match(error.message, /invalid JSON/);
    assert.match(error.url, /\/search\?/);
    assert.equal(error.status, 200);
    return true;
  });

  const invalidPayloadClient = createMetMuseumApi({
    fetchImpl: async () => jsonResponse({ total: 2, objectIDs: [1, "bad"] }),
    retries: 0,
  });
  await assert.rejects(invalidPayloadClient.search("painting"), /invalid search payload/);
});

test("Met API retries 429 and 5xx with a bounded attempt count", async () => {
  let rateLimitAttempts = 0;
  const rateLimitClient = createMetMuseumApi({
    fetchImpl: async () => {
      rateLimitAttempts += 1;
      return rateLimitAttempts === 1
        ? jsonResponse({ message: "rate limited" }, 429, { "retry-after": "0" })
        : jsonResponse({ total: 1, objectIDs: [11] });
    },
    retries: 2,
    retryBaseDelayMs: 0,
    logger: { warn() {} },
  });
  assert.deepEqual(await rateLimitClient.search("painting"), [11]);
  assert.equal(rateLimitAttempts, 2);

  let serverErrorAttempts = 0;
  const serverErrorClient = createMetMuseumApi({
    fetchImpl: async () => {
      serverErrorAttempts += 1;
      return jsonResponse({ message: "unavailable" }, 500);
    },
    retries: 2,
    retryBaseDelayMs: 0,
    logger: { warn() {} },
  });
  await assert.rejects(serverErrorClient.search("painting"), (error) => {
    assert.equal(error.status, 500);
    assert.match(error.url, /\/search\?/);
    assert.match(error.message, /unavailable/);
    return true;
  });
  assert.equal(serverErrorAttempts, 3);

  let clientErrorAttempts = 0;
  const clientErrorClient = createMetMuseumApi({
    fetchImpl: async () => {
      clientErrorAttempts += 1;
      return jsonResponse({ message: "bad request" }, 400);
    },
    retries: 2,
    retryBaseDelayMs: 0,
    logger: { warn() {} },
  });
  await assert.rejects(clientErrorClient.search("painting"), { status: 400 });
  assert.equal(clientErrorAttempts, 1);
});

test("Met API retries a transient network failure and then succeeds", async () => {
  let attempts = 0;
  const api = createMetMuseumApi({
    fetchImpl: async () => {
      attempts += 1;
      if (attempts === 1) {
        throw new TypeError("socket disconnected");
      }
      return jsonResponse({ total: 1, objectIDs: [81] });
    },
    retries: 1,
    retryBaseDelayMs: 0,
    logger: { warn() {} },
  });

  assert.deepEqual(await api.search("painting"), [81]);
  assert.equal(attempts, 2);
});

test("Met API times out, retries only a finite number of times, and reports cause", async () => {
  let attempts = 0;
  const api = createMetMuseumApi({
    fetchImpl: (_url, { signal }) => {
      attempts += 1;
      return new Promise((resolve, reject) => {
        signal.addEventListener(
          "abort",
          () => reject(new DOMException("The operation was aborted", "AbortError")),
          { once: true }
        );
      });
    },
    timeoutMs: 10,
    retries: 1,
    retryBaseDelayMs: 0,
    logger: { warn() {} },
  });

  await assert.rejects(api.search("painting"), (error) => {
    assert.match(error.message, /timed out/);
    assert.match(error.url, /\/search\?/);
    assert.match(error.cause.message, /aborted/);
    return true;
  });
  assert.equal(attempts, 2);
});

test("Met API request concurrency stays within the configured limit", async () => {
  let activeRequests = 0;
  let maximumActiveRequests = 0;
  const api = createMetMuseumApi({
    fetchImpl: async () => {
      activeRequests += 1;
      maximumActiveRequests = Math.max(maximumActiveRequests, activeRequests);
      await new Promise((resolve) => setTimeout(resolve, 5));
      activeRequests -= 1;
      return jsonResponse({ total: 0, objectIDs: null });
    },
    concurrency: 2,
  });

  await api.searchMany(["one", "two", "three", "four", "five"]);
  assert.equal(maximumActiveRequests, 2);
});

test("failed, empty, or incomplete sync preserves the copied artworks.json fallback", async (t) => {
  await withDatasetCopy(async ({ filePath }) => {
    const original = await fs.readFile(filePath, "utf8");
    const logs = [];
    const logger = {
      info: (message) => logs.push(message),
      warn: (message) => logs.push(message),
      error: (message) => logs.push(message),
    };

    await t.test("all searches return no results", async () => {
      const noResultsClient = createMetMuseumApi({
        fetchImpl: async () => jsonResponse({ total: 0, objectIDs: null }),
        concurrency: 2,
      });
      assert.equal(
        await syncArtworksFromMet({
          filePath,
          client: noResultsClient,
          logger,
          searchTerms: ["no matches"],
        }),
        "no-results"
      );
      assert.equal(await fs.readFile(filePath, "utf8"), original);
    });

    await t.test("one search request fails after retries", async () => {
      const failedClient = createMetMuseumApi({
        fetchImpl: async () => jsonResponse({ message: "unavailable" }, 500),
        retries: 1,
        retryBaseDelayMs: 0,
        logger: { warn() {} },
      });
      assert.equal(
        await syncArtworksFromMet({
          filePath,
          client: failedClient,
          logger,
          searchTerms: ["painting"],
        }),
        "failed"
      );
      assert.equal(await fs.readFile(filePath, "utf8"), original);
      assert.match(logs.join("\n"), /Status: 500/);
      assert.match(logs.join("\n"), /collectionapi\.metmuseum\.org/);
    });

    await t.test("invalid API response preserves the fallback file", async () => {
      const invalidResponseClient = createMetMuseumApi({
        fetchImpl: async () => new Response("{invalid", { status: 200 }),
        retries: 0,
      });
      assert.equal(
        await syncArtworksFromMet({
          filePath,
          client: invalidResponseClient,
          logger,
          searchTerms: ["painting"],
        }),
        "failed"
      );
      assert.equal(await fs.readFile(filePath, "utf8"), original);
      assert.match(logs.join("\n"), /invalid JSON/);
    });

    await t.test("an object request fails after another search succeeds", async () => {
      const incompleteClient = createMetMuseumApi({
        fetchImpl: async (url) => {
          if (url.includes("/search?")) {
            return jsonResponse({ total: 2, objectIDs: [21, 22] });
          }
          return url.endsWith("/21")
            ? jsonResponse({
                objectID: 21,
                title: "Complete response",
                primaryImageSmall: "https://example.test/21.jpg",
              })
            : jsonResponse({ message: "temporarily unavailable" }, 500);
        },
        retries: 1,
        retryBaseDelayMs: 0,
        logger: { warn() {} },
        concurrency: 2,
      });
      assert.equal(
        await syncArtworksFromMet({
          filePath,
          client: incompleteClient,
          logger,
          searchTerms: ["painting"],
        }),
        "failed"
      );
      assert.equal(await fs.readFile(filePath, "utf8"), original);
    });

    await t.test("not enough usable image records does not replace fallback", async () => {
      const missingImageClient = createMetMuseumApi({
        fetchImpl: async (url) =>
          url.includes("/search?")
            ? jsonResponse({ total: 2, objectIDs: [41, 42] })
            : jsonResponse({
                objectID: Number(url.split("/").pop()),
                title: "No image",
                primaryImage: "",
                primaryImageSmall: "",
              }),
        concurrency: 2,
      });
      assert.equal(
        await syncArtworksFromMet({
          filePath,
          client: missingImageClient,
          logger,
          searchTerms: ["painting"],
          idsPerTerm: 2,
          artworkCount: 2,
        }),
        "failed"
      );
      assert.equal(await fs.readFile(filePath, "utf8"), original);
      assert.match(logs.join("\n"), /only 0\/2 usable artworks/);
    });

    await t.test("successful complete response updates only the temporary copy", async () => {
      const successClient = createMetMuseumApi({
        fetchImpl: async (url) =>
          url.includes("/search?")
            ? jsonResponse({ total: 3, objectIDs: [31, 32, 33] })
            : Number(url.split("/").pop()) === 31
              ? jsonResponse({
                  objectID: 31,
                  title: "Artwork without image",
                })
              : jsonResponse({
                  objectID: Number(url.split("/").pop()),
                  title: `Artwork ${url.split("/").pop()}`,
                  artistDisplayName: "Test Artist",
                  objectBeginDate: 1900,
                  classification: "Painting, Oil",
                  primaryImageSmall: `https://example.test/${url.split("/").pop()}.jpg`,
                }),
        concurrency: 2,
      });
      assert.equal(
        await syncArtworksFromMet({
          filePath,
          client: successClient,
          logger,
          searchTerms: ["painting"],
          idsPerTerm: 3,
          artworkCount: 2,
        }),
        "updated"
      );
      const updated = JSON.parse(await fs.readFile(filePath, "utf8"));
      assert.equal(updated.length, 2);
      assert.deepEqual(updated.map((artwork) => artwork.id), [32, 33]);
      assert.equal(updated[0].category, "Painting");
    });
  });
});
