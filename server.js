// server.js
// จุดเริ่มต้นของแอปพลิเคชัน: ตั้งค่า Express, middleware และเชื่อม routes

const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const artworkRoutes = require("./routes/artworkRoutes");


const app = express();
const PORT = process.env.PORT || 3000;

// ---------------------------------------------------------------------
// Path ของไฟล์ข้อมูล
// ---------------------------------------------------------------------
// Vercel (และ serverless runtime ทั่วไป) มี filesystem เป็น "read-only"
// ยกเว้นโฟลเดอร์ /tmp ที่เขียนได้ชั่วคราว (หายไปทุกครั้งที่ cold start)
// - bundledDataFilePath: ไฟล์ต้นทางที่ deploy มากับโค้ด (อ่านได้อย่างเดียวบน Vercel)
// - dataFilePath: path จริงที่ "อ่าน/เขียน" ระหว่างรัน จะชี้ไป /tmp เมื่อรันบน Vercel
//   และชี้ไปที่โฟลเดอร์ data/ ปกติเมื่อรันบนเครื่อง local (เขียนได้จริง ใช้พัฒนาสะดวก)
// routes/artworkRoutes.js ต้อง require ตัวแปรนี้จากไฟล์นี้ (module.exports) แทนการ
// ประกอบ path เอง เพื่อให้อ่าน/เขียนไฟล์เดียวกันเสมอไม่ว่าจะรันที่ไหน
const isServerless = !!process.env.VERCEL;
const bundledDataFilePath = path.join(__dirname, "data", "artworks.json");
const dataFilePath = isServerless
  ? path.join("/tmp", "artworks.json")
  : bundledDataFilePath;

// ทำสำเนาไฟล์ข้อมูลต้นทางไปไว้ที่ path ที่เขียนได้ (ครั้งแรกของแต่ละ cold start)
// กันไม่ให้ route อื่น ๆ อ่านไฟล์ที่ยังไม่มีอยู่จริงบน /tmp
function ensureDataFileExists() {
  if (!fs.existsSync(dataFilePath)) {
    fs.mkdirSync(path.dirname(dataFilePath), { recursive: true });
    fs.copyFileSync(bundledDataFilePath, dataFilePath);
  }
}
ensureDataFileExists();

// เก็บ path ไว้ใน app.locals เพื่อให้ routes/artworkRoutes.js อ่าน/เขียนไฟล์เดียวกันนี้เสมอ
// (แทนที่จะประกอบ path ขึ้นเองใน routes ซึ่งจะได้ path ที่ไม่ตรงกันบน serverless)
app.locals.dataFilePath = dataFilePath;

// ---------------------------------------------------------------------
// เชื่อมกับ Public API: Metropolitan Museum of Art Collection API (ไม่ต้องใช้ API key)
// ดึงข้อมูลผลงานศิลปะจริงมา "sync" ลงไฟล์ artworks.json ตอนเซิร์ฟเวอร์เริ่มทำงาน
// เพื่อให้ endpoint เดิมทั้งหมด (search, category, CRUD) อ่าน/เขียนไฟล์นี้ได้เหมือนเดิม
//
// หมายเหตุ: เดิมใช้ Art Institute of Chicago API แต่เปลี่ยนมาใช้ที่นี่แทน เพราะ
// เซิร์ฟเวอร์รูปภาพของ AIC (www.artic.edu/iiif/...) ตอนนี้โดน Cloudflare
// "bot challenge" บล็อกการโหลดรูปแบบ hotlink ทำให้ <img src> ในหน้าเว็บโหลดรูปไม่ขึ้นเลย
// แม้ตัว metadata API จะยังใช้งานได้ปกติก็ตาม (เป็นปัญหาฝั่ง AIC เอง ไม่ใช่บั๊กโค้ดเรา)
// ---------------------------------------------------------------------
const MET_API_BASE = "https://collectionapi.metmuseum.org/public/collection/v1";
const ARTWORK_COUNT = 50;
const REQUEST_TIMEOUT_MS = 15000; // เพิ่มจาก 8000ms เพราะ Met API บางครั้งตอบช้า
                                    // และ 8s เดิมทำให้ AbortController ยิง abort ก่อนได้ผลลัพธ์
const BATCH_SIZE = 10; // ยิง request พร้อมกันทีละ 10 แทน 50 พร้อมกัน
                        // (ยิงพร้อมกันเยอะเกินไปมักโดน rate-limit หรือ network
                        // ที่ไม่เสถียร/ผ่าน proxy ตัดการเชื่อมต่อ กลายเป็น abort เดิม ๆ)

// เดิมค้นด้วยคำกว้าง ๆ คำเดียว ("art") ทำให้ผลลัพธ์กระจุกตัวอยู่ที่ผลงานของ
// ช่างคนเดิม/ชุดเดิมเยอะ ๆ (เช่น แจกันของ Hugh C. Robertson หลายชิ้นติดกัน)
// เปลี่ยนมาค้นหลายคำที่ครอบคลุมหมวดหมู่ต่างกัน แล้วรวม objectID จากทุกคำเข้าด้วยกัน
// เพื่อให้ได้ผลงานที่หลากหลายขึ้น ลดโอกาสเจอช่างคนเดียวกันซ้ำ ๆ
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
const IDS_PER_TERM = 15; // ดึงมาต่อคำค้นเกินความต้องการเล็กน้อย เผื่อบางชิ้นดึงรายละเอียดไม่สำเร็จ

// Met API ไม่มี endpoint "ดึงรายการพร้อมข้อมูลครบ" ในคำขอเดียวแบบ AIC
// ต้องทำ 2 ขั้นตอน: (1) /search หาเลข objectID ที่มีรูปก่อน (2) /objects/{id}
// ดึงรายละเอียดของแต่ละชิ้นเป็น "ชุด" (batch) เพื่อไม่ให้ยิง request พร้อมกันเยอะเกินไป
async function fetchWithTimeout(url, timeoutMs, retries = 1) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal }); // Node 18+ มี fetch ให้ใช้เลย
    if (!res.ok) throw new Error("API ตอบ status " + res.status);
    return await res.json();
  } catch (err) {
    // AbortError = หมดเวลา (timeout), ลองใหม่อีกครั้งก่อนยอมแพ้
    if (retries > 0) {
      return fetchWithTimeout(url, timeoutMs, retries - 1);
    }
    // แนบสาเหตุจริง (err.name เช่น AbortError, TypeError = network ล้มเหลว/ต่อไม่ได้)
    throw new Error(`${err.message} [${err.name}] url=${url}`);
  } finally {
    clearTimeout(timeoutId);
  }
}

// ดึงทีละ batch เล็ก ๆ แทนการยิงทั้งหมดพร้อมกันในทีเดียว (ใช้ได้ทั้งค้นหาและดึงรายละเอียด)
async function fetchUrlsInBatches(urls, batchSize, timeoutMs) {
  const results = [];
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    const settled = await Promise.allSettled(
      batch.map((url) => fetchWithTimeout(url, timeoutMs))
    );
    results.push(...settled);
  }
  return results;
}

// รวม classification/medium ให้เป็น category เดียวกันเมื่อควรจะเป็นกลุ่มเดียวกันจริง ๆ
// เช่น medium ดิบจาก Met มักมีรายละเอียดยิบย่อยต่อท้ายด้วย comma (เช่น "Limestone, varnish")
// ซึ่งถ้าไม่ตัด จะกลายเป็นคนละ category กับ "Limestone" เฉย ๆ ทำให้ dropdown filter
// มีตัวเลือกกระจัดกระจายเกินจำเป็นโดยไม่ได้ช่วยผู้ใช้กรองอะไรเพิ่ม
function normalizeCategory(classification, medium) {
  const raw = (classification || medium || "Mixed Media").trim();
  const simplified = raw.split(",")[0].trim();
  return simplified || "Mixed Media";
}

async function syncArtworksFromPublicAPI() {
  try {
    // ขั้นที่ 1: ค้นหลายคำ (ครอบคลุมหลายหมวดหมู่) แล้วรวม objectID ที่มีรูปภาพเข้าด้วยกัน
    // กันไม่ให้ได้ผลงานของช่างคนเดียวกัน/ชุดเดียวกันมากระจุกอยู่ด้วยกัน
    const searchUrls = SEARCH_TERMS.map(
      (term) => `${MET_API_BASE}/search?hasImages=true&q=${encodeURIComponent(term)}`
    );
    const searchSettled = await fetchUrlsInBatches(searchUrls, BATCH_SIZE, REQUEST_TIMEOUT_MS);

    const idSet = new Set();
    searchSettled
      .filter((r) => r.status === "fulfilled")
      .forEach((r) => {
        const ids = (r.value.objectIDs || []).slice(0, IDS_PER_TERM);
        ids.forEach((id) => idSet.add(id));
      });

    if (idSet.size === 0) {
      throw new Error("ไม่พบ objectID จากการค้นหา");
    }

    // ตัดให้เหลือตามจำนวนที่ต้องการ — "ไม่" สุ่มลำดับ (ตัดฟีเจอร์ shuffle เดิมออก)
    // เหตุผล: บน Vercel serverless แต่ละ request อาจไปตกที่คนละ lambda instance
    // ถ้าสุ่มลำดับ/สุ่มเลือกทุกครั้งที่ sync แต่ละ instance จะได้ผลงานคนละชุดกัน
    // พอผู้ใช้กด "View Details" ข้าม instance กัน id จะไม่ตรง กลายเป็น 404
    // "Cannot load artwork details" กลางงาน demo ได้ — ตัดความสุ่มออกให้ผลลัพธ์
    // เหมือนกันทุก instance/cold start (ตราบใดที่ Met API เองตอบผลการค้นหาคงที่)
    const objectIds = [...idSet].slice(0, ARTWORK_COUNT);

    // ขั้นที่ 2: ดึงรายละเอียดแต่ละชิ้นเป็นชุด ๆ (ชุดละ BATCH_SIZE) กันยิงพร้อมกันเยอะเกินไป
    const objectUrls = objectIds.map((id) => `${MET_API_BASE}/objects/${id}`);
    const settledResults = await fetchUrlsInBatches(objectUrls, BATCH_SIZE, REQUEST_TIMEOUT_MS);

    const failedCount = settledResults.filter((r) => r.status === "rejected").length;
    if (failedCount > 0) {
      console.log(`   (มี ${failedCount}/${objectIds.length} ชิ้นที่ดึงไม่สำเร็จ เช่น: ${settledResults.find((r) => r.status === "rejected")?.reason?.message})`);
    }

    const artworks = settledResults
      .filter((r) => r.status === "fulfilled")
      .map((r) => r.value)
      // เอาเฉพาะชิ้นที่มี URL รูปจริง ๆ (บาง object แม้ hasImages=true ก็อาจไม่มีรูปเดี่ยว ๆ)
      .filter((a) => a.primaryImageSmall || a.primaryImage)
      .map((a) => ({
        id: a.objectID,
        title: a.title || "Untitled",
        artist: a.artistDisplayName || "Unknown Artist",
        year: a.objectBeginDate || null,
        category: normalizeCategory(a.classification, a.medium),
        description: a.culture || a.country ? `ผลงานจาก ${a.culture || a.country}` : "",
        image: a.primaryImageSmall || a.primaryImage || null,
      }));

    if (artworks.length === 0) {
      throw new Error("ดึงรายละเอียดผลงานไม่สำเร็จสักชิ้น");
    }

    fs.writeFileSync(dataFilePath, JSON.stringify(artworks, null, 2), "utf-8");
    console.log(`✅ ซิงก์ข้อมูลจาก Metropolitan Museum of Art API สำเร็จ: ${artworks.length} ผลงาน`);
  } catch (err) {
    // ถ้าเน็ตล่ม / API ตอบช้าเกิน / API ตอบผิดพลาด / เขียนไฟล์ไม่ได้
    // ให้ใช้ไฟล์ artworks.json เดิมที่มีอยู่แล้วต่อไป เซิร์ฟเวอร์ต้องเดินหน้าต่อได้
    // ไม่ล่มเพราะ API ภายนอกมีปัญหาหรือ filesystem เขียนไม่ได้ (เช่นบน serverless)
    console.log(`⚠️  ดึงข้อมูลจาก API ไม่สำเร็จ ใช้ไฟล์ artworks.json เดิมแทน (${err.message})`);
  }
}


// middleware สำหรับแปลง request body ที่เป็น JSON ให้ใช้งานได้ผ่าน req.body

app.use(cors());

app.use(express.json());


// เปิดให้เข้าถึงไฟล์รูปภาพใน folder "images" ผ่าน URL /images/ชื่อไฟล์
// เช่น folder images/starry-night.jpg จะเปิดได้ที่ http://localhost:3000/images/starry-night.jpg
app.use("/images", express.static(path.join(__dirname, "images")));

// เชื่อม routes ทั้งหมดของ artwork ไว้ที่ prefix /api/artworks
// (วางก่อน static frontend เพื่อให้ /api/* ไม่ถูกตีความเป็นไฟล์ static)
app.use("/api/artworks", artworkRoutes);

// route ทดสอบง่าย ๆ สำหรับเช็คว่า API ทำงานอยู่
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Art Gallery API is running",
  });
});

// เปิดให้เข้าถึงหน้าเว็บ (index.html, style.css, script.js) ที่อยู่ในโฟลเดอร์ frontend/
// ทำให้ deploy โปรเจกต์เดียวบน Vercel ได้ทั้ง frontend + API พร้อมกัน
app.use(express.static(path.join(__dirname, "frontend")));

// middleware จับ route ที่ไม่มีอยู่จริง (404)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "ไม่พบ endpoint ที่ร้องขอ",
  });
});

// ---------------------------------------------------------------------
// Vercel รัน server.js เป็น serverless function (import แล้วเรียก app โดยตรง
// ไม่มีการ "listen" port เอง) ส่วน local development ยังต้องเปิด server
// ด้วย app.listen() ตามปกติ (เช่น `node server.js` หรือ `npm run dev`)
// process.env.VERCEL มีค่าอัตโนมัติเมื่อรันบน Vercel เท่านั้น
// ---------------------------------------------------------------------
if (isServerless) {
  // บน serverless ปล่อยให้ sync ทำงาน "เบื้องหลัง" แยกต่างหาก ไม่ await
  // เพราะไม่อยากให้ request แรกที่เข้ามารอ cold start + sync นานเกินไป
  syncArtworksFromPublicAPI();
} else {
  // รัน local: ต้อง "รอ" ให้ sync เสร็จก่อนเปิดรับ request จริง (app.listen)
  // เหตุผล: เดิมยิง sync แบบไม่ await แล้วเปิด server ทันที ทำให้มีช่วงเวลาสั้น ๆ
  // ที่ frontend โหลดรายการผลงานจากไฟล์ "เก่า/seed" ไปแสดงก่อน (เช่น id 1-8)
  // แต่พอ sync จาก Met API เสร็จ ไฟล์ artworks.json จะถูกเขียนทับด้วย objectID
  // ชุดใหม่ทั้งหมด — พอผู้ใช้กด "View Details" บนการ์ดที่ id เดิมไม่มีอยู่ในไฟล์
  // ใหม่แล้ว จะได้ 404 กลายเป็น alert "Cannot load artwork details."
  // การ await ตรงนี้ทำให้หน้าเว็บเห็นข้อมูลชุดสุดท้ายที่ sync เสร็จแล้วเสมอ
  // ไม่มีช่วงเวลาที่ id ไม่ตรงกันแบบนี้อีก
  syncArtworksFromPublicAPI().finally(() => {
    app.listen(PORT, () => {
      console.log(`Art Gallery API กำลังทำงานที่ http://localhost:${PORT}`);
    });
  });
}

module.exports = app;