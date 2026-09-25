// controllers/artworkController.js
// ควบคุม logic ทั้งหมดที่เกี่ยวกับ artwork (อ่าน/เขียนไฟล์ JSON, ตรวจสอบข้อมูล, ส่ง response)

const fs = require("fs");
const path = require("path");

// path ของไฟล์ JSON ที่ใช้เป็นฐานข้อมูลชั่วคราว (ไฟล์ต้นทางที่ deploy มากับโค้ด)
const dataFilePath = path.join(__dirname, "..", "data", "artworks.json");

// -------- Helper Functions --------

// เลือก path ที่จะอ่าน/เขียนจริง: ใช้ path ที่ server.js เตรียมไว้ใน
// req.app.locals.dataFilePath ถ้ามี (จะชี้ไป /tmp เมื่อรันบน Vercel เพราะ
// filesystem จริงเขียนไม่ได้ และชี้ไปที่ dataFilePath ปกติเวลารัน local)
// ถ้าไม่มี req (เผื่อเรียกจากที่อื่นนอก request) ให้ใช้ dataFilePath เป็นค่า default
function resolveDataFilePath(req) {
  return (req && req.app && req.app.locals && req.app.locals.dataFilePath) || dataFilePath;
}

// อ่านข้อมูลทั้งหมดจากไฟล์ JSON แล้วแปลงเป็น array ของ object
function readArtworks(req) {
  const rawData = fs.readFileSync(resolveDataFilePath(req), "utf-8");
  return JSON.parse(rawData);
}

// เขียนข้อมูล array ของ artwork กลับลงไปในไฟล์ JSON
function writeArtworks(req, artworks) {
  fs.writeFileSync(resolveDataFilePath(req), JSON.stringify(artworks, null, 2), "utf-8");
}

// หา id ล่าสุดในไฟล์ แล้ว +1 เพื่อใช้เป็น id ของ artwork ใหม่
function getNextId(artworks) {
  if (artworks.length === 0) return 1;
  const maxId = Math.max(...artworks.map((artwork) => artwork.id));
  return maxId + 1;
}

// -------- Controller Functions --------

// GET /api/artworks
// แสดงผลงานศิลปะทั้งหมด
function getAllArtworks(req, res) {
  const artworks = readArtworks(req);
  res.status(200).json({
    success: true,
    total: artworks.length,
    data: artworks,
  });
}

// GET /api/artworks/search?q=
// ค้นหาผลงานจาก title หรือ artist (ไม่สนตัวพิมพ์เล็ก/ใหญ่)
// หมายเหตุ: route นี้ต้องถูกประกาศไว้ "ก่อน" route /:id ใน artworkRoutes.js
// ไม่เช่นนั้น Express จะเข้าใจว่า "search" คือค่า :id
function searchArtworks(req, res) {
  const query = req.query.q;

  if (!query || query.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "กรุณาระบุคำค้นหาผ่าน query parameter 'q'",
    });
  }

  const artworks = readArtworks(req);
  const keyword = query.toLowerCase();

  const results = artworks.filter(
    (artwork) =>
      artwork.title.toLowerCase().includes(keyword) ||
      artwork.artist.toLowerCase().includes(keyword)
  );

  res.status(200).json({
    success: true,
    total: results.length,
    data: results,
  });
}

// GET /api/artworks/category/:category
// แสดงผลงานตาม category (ไม่สนตัวพิมพ์เล็ก/ใหญ่)
function getArtworksByCategory(req, res) {
  const { category } = req.params;
  const artworks = readArtworks(req);

  const results = artworks.filter(
    (artwork) => artwork.category.toLowerCase() === category.toLowerCase()
  );

  res.status(200).json({
    success: true,
    total: results.length,
    data: results,
  });
}

// GET /api/artworks/:id
// แสดงรายละเอียดผลงานศิลปะตาม ID
function getArtworkById(req, res) {
  const id = parseInt(req.params.id);
  const artworks = readArtworks(req);

  const artwork = artworks.find((item) => item.id === id);

  if (!artwork) {
    return res.status(404).json({
      success: false,
      message: `ไม่พบผลงานศิลปะ id: ${id}`,
    });
  }

  res.status(200).json({
    success: true,
    data: artwork,
  });
}

// POST /api/artworks
// เพิ่มผลงานศิลปะใหม่
function createArtwork(req, res) {
  const { title, artist, year, category, description, image } = req.body;

  // ตรวจสอบข้อมูลที่จำเป็น: title และ artist ห้ามเป็นค่าว่าง
  if (!title || !title.trim() || !artist || !artist.trim()) {
    return res.status(400).json({
      success: false,
      message: "กรุณาระบุ title และ artist ให้ครบถ้วน",
    });
  }

  const artworks = readArtworks(req);

  const newArtwork = {
    id: getNextId(artworks),
    title,
    artist,
    year: year || null,
    category: category || "Uncategorized",
    description: description || "",
    image: image || "",
  };

  artworks.push(newArtwork);
  writeArtworks(req, artworks);

  res.status(201).json({
    success: true,
    message: "เพิ่มผลงานศิลปะสำเร็จ",
    data: newArtwork,
  });
}

// PUT /api/artworks/:id
// แก้ไขข้อมูลผลงานศิลปะ
function updateArtwork(req, res) {
  const id = parseInt(req.params.id);
  const artworks = readArtworks(req);

  const index = artworks.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: `ไม่พบผลงานศิลปะ id: ${id}`,
    });
  }

  const { title, artist, year, category, description, image } = req.body;

  // ตรวจสอบข้อมูลที่จำเป็น: title และ artist ห้ามเป็นค่าว่าง
  if (!title || !title.trim() || !artist || !artist.trim()) {
    return res.status(400).json({
      success: false,
      message: "กรุณาระบุ title และ artist ให้ครบถ้วน",
    });
  }

  // อัปเดตข้อมูล โดยคง id เดิมไว้
  const updatedArtwork = {
    id,
    title,
    artist,
    year: year || null,
    category: category || "Uncategorized",
    description: description || "",
    image: image || "",
  };

  artworks[index] = updatedArtwork;
  writeArtworks(req, artworks);

  res.status(200).json({
    success: true,
    message: "แก้ไขผลงานศิลปะสำเร็จ",
    data: updatedArtwork,
  });
}

// DELETE /api/artworks/:id
// ลบผลงานศิลปะ
function deleteArtwork(req, res) {
  const id = parseInt(req.params.id);
  const artworks = readArtworks(req);

  const index = artworks.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: `ไม่พบผลงานศิลปะ id: ${id}`,
    });
  }

  artworks.splice(index, 1);
  writeArtworks(req, artworks);

  // 204 No Content: ลบสำเร็จ ไม่มีข้อมูลส่งกลับ
  res.status(204).send();
}

module.exports = {
  getAllArtworks,
  searchArtworks,
  getArtworksByCategory,
  getArtworkById,
  createArtwork,
  updateArtwork,
  deleteArtwork,
};
