const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const http = require("node:http");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const express = require("express");
const {
  atomicWriteJson,
  hasCrudChanges,
  writeSyncedArtworks,
  withFileLock,
} = require("../data/artworkStore");
const createArtworkStorageModeMiddleware = require("../middleware/artworkStorageMode");
const {
  createErrorHandler,
  formatErrorCause,
} = require("../middleware/errorHandler");
const artworkRoutes = require("../routes/artworkRoutes");

const sourceDataFile = path.join(__dirname, "..", "data", "artworks.json");

async function createApiServer(dataFilePath, { isServerless = false } = {}) {
  const app = express();
  const logs = [];
  app.locals.dataFilePath = dataFilePath;
  app.locals.artworksReady = true;
  app.use(express.json());
  app.use(
    "/api/artworks",
    createArtworkStorageModeMiddleware({
      isServerless,
      isReady: () => app.locals.artworksReady,
    })
  );
  app.use("/api/artworks", artworkRoutes);
  app.get("/test-cause", (req, res, next) => {
    next(new Error("wrapper failure", { cause: new Error("root failure") }));
  });
  app.use(createErrorHandler((message) => logs.push(message)));

  const server = http.createServer(app);
  server.listen(0, "127.0.0.1");
  await new Promise((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });

  return {
    baseUrl: `http://127.0.0.1:${server.address().port}`,
    logs,
    close: () =>
      new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      }),
  };
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

test("artwork API validations, file safety, and serverless storage policy", async (t) => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "art-gallery-api-"));
  const dataFilePath = path.join(tempDir, "artworks.json");
  const serverlessDataFilePath = path.join(tempDir, "vercel-artworks.json");
  const sourceBytes = await fs.readFile(sourceDataFile);
  await fs.copyFile(sourceDataFile, dataFilePath);
  await fs.copyFile(sourceDataFile, serverlessDataFilePath);

  const api = await createApiServer(dataFilePath);
  const serverlessApi = await createApiServer(serverlessDataFilePath, {
    isServerless: true,
  });
  t.after(async () => {
    await Promise.all([api.close(), serverlessApi.close()]);
    assert.deepEqual(await fs.readFile(sourceDataFile), sourceBytes);
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  const original = await readJson(dataFilePath);
  assert.ok(original.length >= 3, "the copied fixture needs at least three items");
  const [first, second, third] = original;
  const request = (url, options) => fetch(`${api.baseUrl}${url}`, options);
  const jsonRequest = (method, body) => ({
    method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  await t.test("GET all, search, category, and ID endpoints", async () => {
    const allResponse = await request("/api/artworks");
    const allBody = await allResponse.json();
    assert.equal(allResponse.status, 200);
    assert.equal(allBody.total, original.length);

    const searchResponse = await request(
      `/api/artworks/search?q=${encodeURIComponent(first.title)}`
    );
    const searchBody = await searchResponse.json();
    assert.equal(searchResponse.status, 200);
    assert.ok(searchBody.data.some((item) => item.id === first.id));

    const duplicateQuery = await request(
      `/api/artworks/search?q=painting&q=sculpture`
    );
    assert.equal(duplicateQuery.status, 400);
    assert.equal((await duplicateQuery.json()).success, false);

    const emptyQuery = await request("/api/artworks/search?q=%20%20");
    assert.equal(emptyQuery.status, 400);

    const categoryResponse = await request(
      `/api/artworks/category/${encodeURIComponent(first.category)}`
    );
    const categoryBody = await categoryResponse.json();
    assert.equal(categoryResponse.status, 200);
    assert.ok(categoryBody.data.some((item) => item.id === first.id));

    const byIdResponse = await request(`/api/artworks/${first.id}`);
    assert.equal(byIdResponse.status, 200);
    assert.equal((await byIdResponse.json()).data.id, first.id);

    for (const invalidId of ["abc", "1.5", "0", "9007199254740992"]) {
      const response = await request(`/api/artworks/${invalidId}`);
      assert.equal(response.status, 400, `GET must reject ID ${invalidId}`);
    }

    const missing = await request("/api/artworks/999999999");
    assert.equal(missing.status, 404);
  });

  await t.test("PUT validates data and rejects malformed JSON", async () => {
    const malformedId = await request(
      "/api/artworks/abc",
      jsonRequest("PUT", { title: "Bad ID", artist: "Tester" })
    );
    assert.equal(malformedId.status, 400);

    for (const body of [
      { title: "Invalid year", artist: "Tester", year: "1900" },
      { title: "Invalid category", artist: "Tester", category: [] },
      [],
    ]) {
      const response = await request(
        `/api/artworks/${first.id}`,
        jsonRequest("PUT", body)
      );
      assert.equal(response.status, 400);
    }

    const invalidJson = await request(`/api/artworks/${first.id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: '{"title":',
    });
    assert.equal(invalidJson.status, 400);
    assert.equal((await invalidJson.json()).message, "Invalid JSON request body");

    const validUpdate = await request(
      `/api/artworks/${first.id}`,
      jsonRequest("PUT", {
        title: "Temporary API test update",
        artist: first.artist,
        year: first.year,
        category: first.category,
        description: first.description,
        image: first.image,
      })
    );
    assert.equal(validUpdate.status, 200);
    assert.equal((await validUpdate.json()).data.title, "Temporary API test update");
    assert.equal(await hasCrudChanges(dataFilePath), true);

    const afterUpdate = await fs.readFile(dataFilePath, "utf8");
    assert.equal(
      await writeSyncedArtworks(dataFilePath, [{ id: 1, title: "Met overwrite" }]),
      false
    );
    assert.equal(await fs.readFile(dataFilePath, "utf8"), afterUpdate);
  });

  await t.test("concurrent atomic writes preserve valid JSON and both updates", async () => {
    const update = (artwork, title) =>
      request(
        `/api/artworks/${artwork.id}`,
        jsonRequest("PUT", {
          title,
          artist: artwork.artist,
          year: artwork.year,
          category: artwork.category,
          description: artwork.description,
          image: artwork.image,
        })
      );

    const responses = await Promise.all([
      update(second, "Concurrent test update A"),
      update(third, "Concurrent test update B"),
    ]);
    assert.deepEqual(
      responses.map((response) => response.status),
      [200, 200]
    );

    const stored = await readJson(dataFilePath);
    assert.equal(
      stored.find((item) => item.id === second.id).title,
      "Concurrent test update A"
    );
    assert.equal(
      stored.find((item) => item.id === third.id).title,
      "Concurrent test update B"
    );
    const leftovers = (await fs.readdir(tempDir)).filter((name) =>
      name.endsWith(".tmp")
    );
    assert.deepEqual(leftovers, []);

    const atomicFile = path.join(tempDir, "atomic-write.json");
    await Promise.all(
      Array.from({ length: 20 }, (_, index) =>
        withFileLock(atomicFile, () =>
          atomicWriteJson(atomicFile, { index, content: "complete" })
        )
      )
    );
    assert.equal((await readJson(atomicFile)).content, "complete");
  });

  await t.test("DELETE endpoint and malformed ID validation", async () => {
    const malformedId = await request(`/api/artworks/nope`, {
      method: "DELETE",
    });
    assert.equal(malformedId.status, 400);

    const deleted = await request(`/api/artworks/${second.id}`, {
      method: "DELETE",
    });
    assert.equal(deleted.status, 204);
    assert.equal((await readJson(dataFilePath)).some((item) => item.id === second.id), false);

    const missing = await request("/api/artworks/999999999", {
      method: "DELETE",
    });
    assert.equal(missing.status, 404);
  });

  await t.test("Vercel mode remains read-only and error logs include root causes", async () => {
    const baseline = await fs.readFile(serverlessDataFilePath, "utf8");
    const getResponse = await fetch(`${serverlessApi.baseUrl}/api/artworks`);
    assert.equal(getResponse.status, 200);

    for (const method of ["PUT", "DELETE"]) {
      const response = await fetch(
        `${serverlessApi.baseUrl}/api/artworks/${first.id}`,
        method === "PUT"
          ? jsonRequest(method, { title: "Denied", artist: "Tester" })
          : { method }
      );
      assert.equal(response.status, 503);
    }
    assert.equal(await fs.readFile(serverlessDataFilePath, "utf8"), baseline);

    const failed = await fetch(`${api.baseUrl}/test-cause`);
    assert.equal(failed.status, 500);
    assert.match(api.logs.join("\n"), /wrapper failure/);
    assert.match(api.logs.join("\n"), /root failure/);
    assert.match(
      formatErrorCause(new Error("outer", { cause: new Error("inner") })),
      /outer.*inner/
    );
  });
});
