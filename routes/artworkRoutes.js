// routes/artworkRoutes.js
// รวม routes ทั้งหมดที่เกี่ยวกับ artwork ไว้ในที่เดียว แยกออกจาก server.js

const express = require("express");
const router = express.Router();

const {
  getAllArtworks,
  searchArtworks,
  getArtworksByCategory,
  getArtworkById,
  createArtwork,
  updateArtwork,
  deleteArtwork,
} = require("../controllers/artworkController");

// สำคัญ: ต้องประกาศ /search และ /category/:category ไว้ก่อน /:id
// เพราะ Express จับ route ตามลำดับบนลงล่าง
// ถ้าประกาศ /:id ไว้ก่อน คำว่า "search" หรือ "category" จะถูกตีความว่าเป็น :id แทน

// GET /api/artworks/search?q=  -> ค้นหาผลงานจาก title หรือ artist
router.get("/search", searchArtworks);

// GET /api/artworks/category/:category -> แสดงผลงานตาม category
router.get("/category/:category", getArtworksByCategory);

// GET /api/artworks -> แสดงผลงานศิลปะทั้งหมด
router.get("/", getAllArtworks);

// GET /api/artworks/:id -> แสดงรายละเอียดผลงานศิลปะตาม ID
router.get("/:id", getArtworkById);

// POST /api/artworks -> เพิ่มผลงานศิลปะใหม่
router.post("/", createArtwork);

// PUT /api/artworks/:id -> แก้ไขข้อมูลผลงานศิลปะ
router.put("/:id", updateArtwork);

// DELETE /api/artworks/:id -> ลบผลงานศิลปะ
router.delete("/:id", deleteArtwork);

module.exports = router;
