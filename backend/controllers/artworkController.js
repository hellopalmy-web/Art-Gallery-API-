const fs = require("node:fs/promises");
const path = require("node:path");
const {
  atomicWriteJson,
  markCrudChanged,
  withFileLock,
} = require("../data/artworkStore");

const defaultDataFilePath = path.join(__dirname, "..", "data", "artworks.json");

function resolveDataFilePath(req) {
  return req.app.locals.dataFilePath || defaultDataFilePath;
}

async function readArtworks(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

function parseArtworkId(value) {
  if (!/^[1-9]\d*$/.test(value)) {
    return null;
  }

  const id = Number(value);
  return Number.isSafeInteger(id) ? id : null;
}

function validateArtworkBody(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return "Request body must be a JSON object";
  }
  if (typeof body.title !== "string" || !body.title.trim()) {
    return "กรุณาระบุ title เป็นข้อความที่ไม่ว่าง";
  }
  if (typeof body.artist !== "string" || !body.artist.trim()) {
    return "กรุณาระบุ artist เป็นข้อความที่ไม่ว่าง";
  }
  if (
    body.year !== undefined &&
    body.year !== null &&
    (typeof body.year !== "number" || !Number.isFinite(body.year))
  ) {
    return "year ต้องเป็นตัวเลขหรือ null";
  }
  for (const field of ["category", "description", "image"]) {
    if (body[field] !== undefined && typeof body[field] !== "string") {
      return `${field} ต้องเป็นข้อความ`;
    }
  }
  return null;
}

function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

const getAllArtworks = asyncHandler(async (req, res) => {
  const artworks = await readArtworks(resolveDataFilePath(req));
  res.status(200).json({
    success: true,
    total: artworks.length,
    data: artworks,
  });
});

const searchArtworks = asyncHandler(async (req, res) => {
  const { q: query } = req.query;
  if (typeof query !== "string" || query.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "กรุณาระบุคำค้นหาผ่าน query parameter 'q' เพียงหนึ่งค่า",
    });
  }

  const keyword = query.trim().toLowerCase();
  const artworks = await readArtworks(resolveDataFilePath(req));
  const results = artworks.filter((artwork) => {
    const title = String(artwork.title ?? "").toLowerCase();
    const artist = String(artwork.artist ?? "").toLowerCase();
    const category = String(artwork.category ?? "").toLowerCase();
    const year = String(artwork.year ?? "").toLowerCase();

    return (
      title.includes(keyword) ||
      artist.includes(keyword) ||
      category.includes(keyword) ||
      year.includes(keyword)
    );
  });

  res.status(200).json({
    success: true,
    total: results.length,
    data: results,
  });
});

const getArtworksByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const artworks = await readArtworks(resolveDataFilePath(req));
  const results = artworks.filter(
    (artwork) =>
      typeof artwork.category === "string" &&
      artwork.category.toLowerCase() === category.toLowerCase()
  );

  res.status(200).json({
    success: true,
    total: results.length,
    data: results,
  });
});

const getArtworkById = asyncHandler(async (req, res) => {
  const id = parseArtworkId(req.params.id);
  if (id === null) {
    return res.status(400).json({
      success: false,
      message: "Artwork ID must be a positive safe integer",
    });
  }

  const artworks = await readArtworks(resolveDataFilePath(req));
  const artwork = artworks.find((item) => item.id === id);
  if (!artwork) {
    return res.status(404).json({
      success: false,
      message: `ไม่พบผลงานศิลปะ id: ${id}`,
    });
  }

  res.status(200).json({ success: true, data: artwork });
});

const updateArtwork = asyncHandler(async (req, res) => {
  const id = parseArtworkId(req.params.id);
  if (id === null) {
    return res.status(400).json({
      success: false,
      message: "Artwork ID must be a positive safe integer",
    });
  }

  const validationError = validateArtworkBody(req.body);
  if (validationError) {
    return res.status(400).json({ success: false, message: validationError });
  }

  const filePath = resolveDataFilePath(req);
  const result = await withFileLock(filePath, async () => {
    const artworks = await readArtworks(filePath);
    const index = artworks.findIndex((item) => item.id === id);
    if (index === -1) {
      return null;
    }

    const { title, artist, year, category, description, image } = req.body;
    const updatedArtwork = {
      id,
      title,
      artist,
      year: year ?? null,
      category: category || "Uncategorized",
      description: description || "",
      image: image || "",
    };

    await markCrudChanged(filePath);
    artworks[index] = updatedArtwork;
    await atomicWriteJson(filePath, artworks);
    return updatedArtwork;
  });

  if (!result) {
    return res.status(404).json({
      success: false,
      message: `ไม่พบผลงานศิลปะ id: ${id}`,
    });
  }

  res.status(200).json({
    success: true,
    message: "แก้ไขผลงานศิลปะสำเร็จ",
    data: result,
  });
});

const deleteArtwork = asyncHandler(async (req, res) => {
  const id = parseArtworkId(req.params.id);
  if (id === null) {
    return res.status(400).json({
      success: false,
      message: "Artwork ID must be a positive safe integer",
    });
  }

  const filePath = resolveDataFilePath(req);
  const deleted = await withFileLock(filePath, async () => {
    const artworks = await readArtworks(filePath);
    const index = artworks.findIndex((item) => item.id === id);
    if (index === -1) {
      return false;
    }

    await markCrudChanged(filePath);
    artworks.splice(index, 1);
    await atomicWriteJson(filePath, artworks);
    return true;
  });

  if (!deleted) {
    return res.status(404).json({
      success: false,
      message: `ไม่พบผลงานศิลปะ id: ${id}`,
    });
  }

  res.status(204).send();
});

module.exports = {
  getAllArtworks,
  searchArtworks,
  getArtworksByCategory,
  getArtworkById,
  updateArtwork,
  deleteArtwork,
};
