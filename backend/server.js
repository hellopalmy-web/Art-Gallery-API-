const express = require("express");
const path = require("node:path");
const cors = require("cors");
const createArtworkStorageModeMiddleware = require("./middleware/artworkStorageMode");
const { createErrorHandler } = require("./middleware/errorHandler");
const { createMetMuseumApi } = require("./services/metMuseumApi");
const { syncArtworksFromMet } = require("./services/metMuseumSync");
const artworkRoutes = require("./routes/artworkRoutes");

const app = express();
const PORT = process.env.PORT || 3000;
const isServerless = !!process.env.VERCEL;
const dataFilePath = path.join(__dirname, "data", "artworks.json");
const metMuseumApi = createMetMuseumApi();

app.locals.dataFilePath = dataFilePath;
app.locals.artworksReady = true;

app.use(cors());
app.use(express.json());
app.use("/images", express.static(path.join(__dirname, "..", "images")));

app.use(
  "/api/artworks",
  createArtworkStorageModeMiddleware({
    isServerless,
    isReady: () => app.locals.artworksReady,
  })
);
app.use("/api/artworks", artworkRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Art Gallery API is running",
  });
});

app.use(express.static(path.join(__dirname, "..", "frontend-dist")));

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "ไม่พบ endpoint ที่ร้องขอ",
  });
});

app.use(createErrorHandler());

if (isServerless) {
  console.info(
    "[Storage] Vercel is serving the bundled dataset read-only; CRUD is disabled because /tmp is not durable shared storage."
  );
} else {
  const syncOnStart = process.env.SYNC_ARTWORKS_ON_START === "true";
  app.listen(PORT, () => {
    console.log(`Art Gallery API กำลังทำงานที่ http://localhost:${PORT}`);
    if (syncOnStart) {
      void syncArtworksFromMet({
        filePath: dataFilePath,
        client: metMuseumApi,
      });
    } else {
      console.info(
        "[Met sync] Startup sync disabled; serving existing artworks.json. Set SYNC_ARTWORKS_ON_START=true to request an explicit refresh."
      );
    }
  });
}

module.exports = app;
