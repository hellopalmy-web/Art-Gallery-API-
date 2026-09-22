// server.js
// จุดเริ่มต้นของแอปพลิเคชัน: ตั้งค่า Express, middleware และเชื่อม routes

const express = require("express");
const path = require("path");
const artworkRoutes = require("./routes/artworkRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// middleware สำหรับแปลง request body ที่เป็น JSON ให้ใช้งานได้ผ่าน req.body
app.use(express.json());

// เปิดให้เข้าถึงไฟล์รูปภาพใน folder "images" ผ่าน URL /images/ชื่อไฟล์
// เช่น folder images/starry-night.jpg จะเปิดได้ที่ http://localhost:3000/images/starry-night.jpg
app.use("/images", express.static(path.join(__dirname, "images")));

// route ทดสอบง่าย ๆ สำหรับเช็คว่าเซิร์ฟเวอร์ทำงานอยู่
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Art Gallery API is running",
  });
});

// เชื่อม routes ทั้งหมดของ artwork ไว้ที่ prefix /api/artworks
app.use("/api/artworks", artworkRoutes);

// middleware จับ route ที่ไม่มีอยู่จริง (404)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "ไม่พบ endpoint ที่ร้องขอ",
  });
});

app.listen(PORT, () => {
  console.log(`Art Gallery API กำลังทำงานที่ http://localhost:${PORT}`);
});