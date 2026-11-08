// routes/artworkRoutes.js
// เชื่อม endpoint แต่ละเส้นเข้ากับ logic จริงใน controllers/artworkController.js
// ลำดับ route สำคัญ: /search และ /category/:category ต้องมาก่อน /:id เสมอ
// ไม่เช่นนั้น Express จะเข้าใจผิดว่า "search" หรือชื่อ category คือค่า :id

const express = require("express");
const router = express.Router();

const {
  getAllArtworks,
  searchArtworks,
  getArtworksByCategory,
  getArtworkById,
  updateArtwork,
  deleteArtwork,
} = require("../controllers/artworkController");

router.get("/", getAllArtworks);
router.get("/search", searchArtworks);
router.get("/category/:category", getArtworksByCategory);
router.get("/:id", getArtworkById);

router.put("/:id", updateArtwork);
router.delete("/:id", deleteArtwork);

module.exports = router;
