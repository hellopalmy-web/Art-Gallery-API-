# Art Gallery API

แกลเลอรี React + Vite พร้อม REST API ที่เขียนด้วย Node.js + Express.js และใช้ไฟล์ JSON เป็นฐานข้อมูลชั่วคราว

## ตารางส่วนร่วม

| ชื่อ-สกุล | รหัสนักศึกษา | ชิ้นงานที่รับผิดชอบ (ไฟล์ / component / route / DSA) | ช่วงที่นำเสนอในคลิป |
|---|---|---|---|
| นาย ชานน คำแสนโคมร (git: chanonkamsan / GitHub: chanonkamsan-tech) | 681310776 | **หน้าบ้านและ UI/UX:** `frontend/index.html`, `frontend/style.css`, `frontend/src/components/BackgroundFX.jsx`; ส่วนหน้าจอใน `frontend/src/App.jsx` ได้แก่ Home (`/`), Collection (`/collection`), Your Visit (`/your-visit`), การ์ดผลงาน, modal, สถานะ loading/empty/error, Favorites, Clear all, Sort by, สลับภาษา EN/TH และ intro | ช่วงที่ 1 (เปิดและตารางส่วนร่วม ~0:30)<br>ช่วงที่ 3 (Demo ระบบจริง/UX ~2:00)<br>ช่วงที่ 4 (อธิบายโค้ด React: ตาราง useState, useEffect, Component Tree และ props ~2:00)<br>**รวม ~4:30 นาที** |
| นางสาว อมลณัฐ เอื้อวัชโร (git: palmy / GitHub: hellopalmy-web) | 681310414 | **หลังบ้านและ DSA:** `backend/server.js`, `backend/routes/artworkRoutes.js`, `backend/controllers/artworkController.js`, `backend/middleware/`, `backend/services/`, `backend/data/`, `backend/tests/`; `frontend/searchUtils.js` และ `frontend/tests/` (รวม `dsa.test.js`); Graph + BFS ใน `frontend/src/Graph.js` และ `frontend/src/components/GraphNav.jsx`; Stack, Queue และ merge sort ใน `frontend/src/dsa/Stack.js`, `Queue.js`, `sort.js`; `frontend/benchmarks/dsaBenchmark.js`; `frontend/src/main.jsx` (HashRouter); `vite.config.js`, `vercel.json`, `README.md`, `docs/before-after/`; merge sort และ Set lookup ใน `frontend/src/App.jsx`<br>**ส่วนที่ทำร่วมกันใน `frontend/src/App.jsx`:** การต่อ `Routes`/`Route`/`Navigate`, `GraphNav`/`Breadcrumb` และ `pagePath`; Effect โหลด `/api/artworks` พร้อมจัดการ loading/error/retry และ state ข้อมูลที่รับจาก API | ช่วงที่ 2 (จากงานแรกสู่งานนี้: Before/After ~1:00)<br>ช่วงที่ 4 (Graph.js กับ nav ~1:00)<br>ช่วงที่ 5 (Express และ DSA พร้อม Big-O ~2:00)<br>ช่วงที่ 6 (สรุป ~0:30)<br>**รวม ~4:30 นาที** |

หมายเหตุ:
1. ตารางนี้ตรงกับ commit history ใน GitHub ของโปรเจกต์ 
2. สมาชิกทั้งสองคนช่วยกันทดสอบและตรวจทานทุกส่วน ตารางระบุชิ้นงานหลักที่แต่ละคนรับผิดชอบ
3. ทุกคนแนะนำชื่อและรหัสนักศึกษาก่อนเริ่มพูดในแต่ละช่วงของคลิป

## ข้อแนะนำจากงานแรก → สิ่งที่แก้

| ข้อแนะนำจากงานแรก | สิ่งที่แก้ในงานนี้ | หลักฐาน Before / After |
|---|---|---|
| อาจารย์แนะนำ: “ทำช่อง Sorting ให้ขนาดเท่ากับช่องอื่น” | Sort มี label “Sort by” และ dropdown ใช้สไตล์ร่วมกับ Category ทั้งความกว้าง ความสูง และพื้นผิว ดูที่ `frontend/src/App.jsx` และ `frontend/style.css` ซึ่งกำหนด `.sort-box` และใช้กฎร่วม `.filter-box select, .sort-box select` | Before:<br><img src="docs/before-after/01-before.png.png" width="300" alt="Before: sorting"><br>After:<br><img src="docs/before-after/01-after.png.png" width="300" alt="After: sorting"> |
| อาจารย์แนะนำ: “เพิ่มฟังก์ชัน Clear all สำหรับส่วน Viewing” | เพิ่ม Clear all ใน Recently viewed (`frontend/src/App.jsx`), Viewing queue  และ Favorites พร้อมปุ่มลบรายรายการและรูปย่อผ่าน `ListItem`  | Before (Recently viewed):<br><img src="docs/before-after/02-before-recent.png.png" width="300" alt="Before: recently viewed"><br>Before (Viewing queue):<br><img src="docs/before-after/02-before-queue.png.png" width="300" alt="Before: viewing queue"><br>After:<br><img src="docs/before-after/02-after.png.png" width="300" alt="After: viewing lists"> |
| อาจารย์แนะนำ: “ทำหน้าเว็บให้สวยขึ้น” | ปรับหน้าตาและโครงสร้างเป็น React + Vite แบบ Single-page application โดยแยก UI เป็น React components; การ์ดอยู่ใน `frontend/src/App.jsx` และ `frontend/style.css`, ส่วน modal อยู่ใน `frontend/src/App.jsx` และ `frontend/style.css` มีการใช้มุมโค้ง ฟอนต์หัวข้อ และรูปแบบปุ่ม/สีตาม stylesheet **หมายเหตุ:** โค้ดปัจจุบันใช้ React Router ผ่าน `HashRouter` แยกเป็น 3 หน้า คือ Home (`/`), Collection (`/collection`) และ Your Visit (`/your-visit`); เมนูนำทางสร้างจาก Graph ใน `frontend/src/Graph.js` ตามหน้าปัจจุบัน | Before (การ์ด):<br><img src="docs/before-after/03-before-cards.png.png" width="300" alt="Before: artwork cards"><br>Before (modal):<br><img src="docs/before-after/03-before-modal.png.png" width="300" alt="Before: artwork modal"><br>After (การ์ด):<br><img src="docs/before-after/03-after-cards.png.png" width="300" alt="After: artwork cards"><br>After (modal):<br><img src="docs/before-after/03-after-modal.png.png" width="300" alt="After: artwork modal"> |
| อาจารย์แนะนำ: “เพิ่มฟังก์ชันให้ผู้ใช้ให้น่าสนใจขึ้น” | เพิ่ม Favorites ด้วยปุ่มหัวใจ (`frontend/src/App.jsx), ปุ่มดูชิ้นก่อน/ถัดไปใน modal , Search Suggestions (`frontend/searchUtils.js`, `frontend/src/App.jsx), สลับภาษา EN/TH (`frontend/src/App.jsx`), ส่วน Your Visit , บันทึกสถานะลง `localStorage`  และ skeleton ระหว่างโหลด รูปแบบอยู่ใน `frontend/style.css | Before:<br><img src="docs/before-after/03-before-modal.png.png" width="300" alt="Before: artwork modal"><br>After (modal):<br><img src="docs/before-after/03-after-modal.png.png" width="300" alt="After: artwork modal"><br>After (การ์ด):<br><img src="docs/before-after/03-after-cards.png.png" width="300" alt="After: artwork cards"> |
| (เพิ่มเอง — ไม่ได้อยู่ในคำแนะนำของอาจารย์) ค้นหาครอบคลุมขึ้น | การกรองหลักใน `frontend/src/App.jsx` ค้นจากชื่อผลงาน ศิลปิน หมวดหมู่ ปี และข้อมูลประเทศ/วัฒนธรรม/คำอธิบาย; Search Suggestions ใช้ `frontend/searchUtils.js` ช่องค้นหาอยู่ที่ `frontend/src/App.jsx` และเป็น `type="search"` ซึ่งรองรับปุ่มล้างของเบราว์เซอร์ (ไม่มีปุ่ม ✕ แบบกำหนดเองในโค้ด) Placeholder ปัจจุบันคือ “Search artwork, artist, year, or country...”  ตรวจจากชุดข้อมูลและเงื่อนไขค้นหาปัจจุบันแล้ว คำว่า “china” ตรงกับ 3 ผลงาน | Before:<br><img src="docs/before-after/05-before.png.png" width="300" alt="Before: search results"><br>After:<br><img src="docs/before-after/05-after.png.png" width="300" alt="After: search results"> |

## โครงสร้างโปรเจกต์

```
art-gallery-api/
├── backend/
│   ├── controllers/
│   │   └── artworkController.js
│   ├── data/
│   │   ├── artworkStore.js    # Atomic write, file lock และ CRUD marker
│   │   └── artworks.json      # ฐานข้อมูลชั่วคราวแบบไฟล์ JSON
│   ├── middleware/
│   │   ├── artworkStorageMode.js
│   │   └── errorHandler.js
│   ├── routes/
│   │   └── artworkRoutes.js   # กำหนดเส้นทาง (routes) ทั้งหมดของ artwork
│   ├── services/
│   │   ├── metMuseumApi.js    # Met API client, timeout/retry/concurrency/validation
│   │   └── metMuseumSync.js   # ตรวจและเขียนข้อมูล Sync แบบ atomic
│   ├── tests/
│   │   ├── artworkApi.test.js # API integration tests ใช้สำเนา Dataset ชั่วคราว
│   │   └── metMuseumApi.test.js # Met API mock tests และ isolated sync tests
│   └── server.js              # Express API และ static server
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── BackgroundFX.jsx
│   │   │   └── GraphNav.jsx   # GraphNav และ Breadcrumb
│   │   ├── dsa/
│   │   │   ├── Queue.js       # FIFO queue พร้อม amortized O(1) dequeue
│   │   │   ├── sort.js        # stable merge sort และ legacy tie ranks
│   │   │   └── Stack.js       # bounded stack สำหรับ Recently Viewed
│   │   ├── App.jsx            # React app, Routes และ UI
│   │   ├── Graph.js           # Graph ของหน้าเว็บและ BFS
│   │   ├── main.jsx           # React root และ HashRouter
│   │   └── package.json       # กำหนด ESM เฉพาะ React source
│   ├── benchmarks/
│   │   └── dsaBenchmark.js    # เปรียบเทียบโครงสร้าง/อัลกอริทึม
│   ├── tests/
│   │   ├── dsa.test.js        # Stack, Queue, sort และ BFS
│   │   └── searchUtils.test.js
│   ├── index.html             # Vite entry point
│   ├── searchUtils.js         # Search suggestions utility
│   ├── script.js              # สคริปต์ frontend เดิมที่ยังอยู่ใน repository
│   └── style.css              # gallery styling
├── docs/
│   └── before-after/          # ภาพ Before/After
├── frontend-dist/             # Vite production build
├── vite.config.js             # Vite config และ /api proxy
├── vercel.json                # Vercel deployment config
├── package.json
├── package-lock.json
├── DECISION_LOG.md
├── .gitignore
└── README.md
```

## 🚀 เริ่มต้นใช้งานและรันโปรเจกต์

### ⚠️ ตรวจสอบตำแหน่งโฟลเดอร์ก่อน

โปรเจกต์นี้แบ่งเป็น 2 ส่วน คือ `backend` และ `frontend` หากแตกไฟล์ ZIP แล้วพบว่ามีโฟลเดอร์โปรเจกต์ซ้อนกัน ให้เข้าไปยังโฟลเดอร์ชั้นในที่มีทั้ง `backend`, `frontend` และ `package.json` อยู่ด้วยกันก่อน

```bash
# ตัวอย่าง: เข้าไปยังโฟลเดอร์โปรเจกต์ที่ถูกต้อง
cd art-gallery-api

# ตรวจสอบว่ามีโฟลเดอร์และ package.json อยู่ในตำแหน่งนี้
dir
# หรือ
ls
```

> **หมายเหตุ:** ในโปรเจกต์นี้ `package.json` และ dependencies อยู่ที่โฟลเดอร์หลัก ไม่ได้แยกอยู่ใน `backend` และ `frontend` ดังนั้นให้ติดตั้งแพ็กเกจจากโฟลเดอร์หลักเพียงครั้งเดียว และอย่ารัน `npm install` ภายในโฟลเดอร์ย่อย

### 📦 ติดตั้ง dependencies

เปิด Terminal ที่โฟลเดอร์หลักของโปรเจกต์ (โฟลเดอร์ที่มี `package.json`) แล้วรัน:

```bash
npm install
```

### 🖥️ รัน Backend

เปิด Terminal หน้าต่างแรก โดยให้ตำแหน่งอยู่ที่โฟลเดอร์หลักของโปรเจกต์ แล้วเริ่ม Backend:

```bash
npm run dev:backend
```

Backend จะทำงานที่ `http://localhost:3000` และให้เปิด Terminal นี้ค้างไว้

### 🌐 รัน Frontend

เปิด Terminal **อีกหน้าต่างหนึ่ง** และตรวจสอบให้แน่ใจว่าอยู่ที่โฟลเดอร์หลักของโปรเจกต์เช่นกัน จากนั้นเริ่ม Frontend:

```bash
npm run dev:frontend
```

เปิด URL ที่ Vite แสดงใน Terminal (โดยปกติคือ `http://localhost:5173`) โดยให้ Backend ยังทำงานอยู่ใน Terminal แรก

### 🔧 หากพบ Error `ENOENT: no such file or directory, open 'package.json'`

Error นี้มักหมายถึง Terminal อยู่ผิดโฟลเดอร์ หรืออยู่ใน `backend`/`frontend` ซึ่งไม่มี `package.json` ให้พิมพ์ `dir` (Windows) หรือ `ls` เพื่อดูตำแหน่งปัจจุบันและรายการไฟล์ จากนั้นใช้ `cd` กลับไปยังโฟลเดอร์หลักที่มี `package.json`, `backend` และ `frontend` แล้วลองใหม่

```bash
dir
# หรือ
ls

# ตัวอย่าง: กลับไปยังโฟลเดอร์หลักของโปรเจกต์
cd ..
```

### 📦 รันแบบ Production

หากต้องการ Build Frontend แล้วเริ่ม Express API และเว็บไซต์ด้วยคำสั่งเดียว ให้รันจากโฟลเดอร์หลัก:

```bash
npm start
```

โดยปกติ Backend ใช้ `backend/data/artworks.json` ที่มีอยู่และไม่ซิงก์ทับข้อมูลอัตโนมัติ หากต้องการสั่งซิงก์จาก Met API ตอนเริ่ม Backend โดยตั้งใจ ให้ใช้ `SYNC_ARTWORKS_ON_START=true npm run dev:backend` การแก้ไขหรือลบข้อมูลผ่าน CRUD จะสร้างไฟล์ `artworks.json.crud-modified` เพื่อป้องกันการซิงก์ครั้งต่อไปเขียนทับข้อมูลเหล่านั้น

Met API ใช้ paginated Search endpoint `/public/collection/v1.1/search` และ Object endpoint `/public/collection/v1/objects/{id}` ตาม [เอกสาร Met API](https://metmuseum.github.io/); Search ส่ง `offset`/`limit` (ไม่เกิน 500) เพราะ endpoint `/v1/search` เดิมถูกเลิกใช้งานแล้ว Client จำกัดพร้อมกัน 4 requests, timeout 15 วินาที และ retry สูงสุด 2 ครั้งเฉพาะ network/timeout, HTTP 429 และ 5xx โดยเคารพ `Retry-After` สูงสุด 30 วินาทีต่อการรอ หาก API ล้มเหลว, ไม่พบข้อมูล หรือได้ response ไม่ครบ ระบบจะคง Dataset เดิมไว้และ Express ยังให้บริการไฟล์นั้นต่อ

`npm start` ให้บริการทั้งเว็บไซต์และ API ที่:
```
http://localhost:3000
```

Frontend ใช้ `HashRouter` และมี 3 route:
```
http://localhost:3000/#/
http://localhost:3000/#/collection
http://localhost:3000/#/your-visit
```

Home, Collection และ Your Visit เป็น route แยกกัน โดย `GraphNav` สร้างเมนูตามหน้าปัจจุบันจาก Graph และ `Breadcrumb` หาเส้นทางจาก Home ด้วย BFS; Favorites, Recently Viewed, Viewing Queue และภาษาบันทึกไว้ใน LocalStorage ของ browser

Vite dev server ใช้ `http://localhost:5173` และ proxy `/api` ไปยัง Express ที่พอร์ต 3000 สามารถเปลี่ยนพอร์ต API proxy ได้ด้วย `API_PORT` หรือกำหนด `API_PROXY_TARGET` โดยตรง สคริปต์เดิม `npm run dev:api` ยังคงใช้ได้และชี้ไปยัง Backend ตัวเดียวกัน

ตรวจสอบ production build และ tests ได้ด้วย `npm run build` และ `npm test` โดย build จะเขียนไฟล์ไว้ใน `frontend-dist/`

Backend integration tests ใน `backend/tests/artworkApi.test.js` ครอบคลุมทั้ง 6 routes, query ซ้ำ, ID และ PUT ที่ไม่ถูกต้อง, JSON เสียรูปแบบ, concurrent/atomic writes, การกัน Met Sync เขียนทับหลัง CRUD และโหมด read-only ของ Vercel โดยคัดลอก Dataset ไปยัง temporary directory ก่อนทดสอบ และตรวจว่าไฟล์จริงไม่เปลี่ยน การทดสอบ Met Sync ใช้ฟังก์ชันจัดเก็บหลัง Sync โดยตรง ไม่เรียก Met API ภายนอก

## เอกสารใบงาน 3.1–3.4: React State, Effects, Components และ Navigation

เอกสารส่วนนี้ตรวจจากทุกไฟล์ใน `frontend/src/` รวม [App.jsx](./frontend/src/App.jsx), [Graph.js](./frontend/src/Graph.js), [main.jsx](./frontend/src/main.jsx), [GraphNav.jsx](./frontend/src/components/GraphNav.jsx), [BackgroundFX.jsx](./frontend/src/components/BackgroundFX.jsx) และ DSA modules พบ `useState` 25 จุดใน `App` และ `useEffect` 16 จุด (15 จุดใน `App` และ 1 จุดใน `BackgroundFX`); การเพิ่ม Stack/Queue ใช้ `useRef` เป็นแหล่งตรรกะและ State เป็น Array snapshot จึงไม่ได้เพิ่ม State หรือ Effect

### ข้อ 3.1 — useState

`App` ประกาศ `useState` ทั้งหมด 25 จุด ไม่มี `useState` ใน component อื่นใต้ `frontend/src`:

| ชื่อ state | เก็บข้อมูลอะไร | อยู่ใน component | เปลี่ยนค่าเมื่อใด / โดยใคร | ทำไมต้องเป็น state |
|---|---|---|---|---|
| `artworks` | รายการผลงานที่โหลดจาก API | `App` — Collection, Search Suggestions, Modal | Effect โหลด `/api/artworks` เรียก `setArtworks` เมื่อได้ข้อมูลถูกต้อง | ผลจาก API เปลี่ยนได้และมีหลายส่วนใช้ร่วมกัน |
| `searchQuery` | ข้อความค้นหา | `App` — Search | `onChange` ของช่องค้นหาเรียก `setSearchQuery` | ใช้กรองรายการและสร้างคำแนะนำ พร้อมแสดงค่าที่พิมพ์ |
| `selectedCategory` | หมวดหมู่ที่เลือก (`all` เป็นค่าเริ่มต้น) | `App` — Category Filter | เปลี่ยนจาก select หรือถูกตั้งเป็น `all` เมื่อเลือก suggestion | สะท้อนตัวเลือกและใช้กรองรายการ |
| `sortOrder` | ลำดับเรียง เช่น `title-asc` หรือ `year-desc` | `App` — Sort | เปลี่ยนจาก select | การเลือกมีผลต่อรายการที่แสดงและค่าใน select |
| `currentPage` | หน้าปัจจุบัน เริ่มที่ 1 | `App` — Pagination | ปุ่มก่อนหน้า/ถัดไปเปลี่ยนค่า; Effect ตั้งกลับเป็น 1 เมื่อ query/filter/sort/รายการเป้าหมายเปลี่ยน | เก็บตำแหน่งหน้าที่ผู้ใช้เลือก |
| `loading` | สถานะโหลดข้อมูลหรือแสดง loading ระหว่างเปลี่ยนตัวกรอง | `App` — Collection | Effect โหลด API และ Effect หน่วง 120 ms หลัง query/category/sort เปลี่ยน | เลือกแสดง skeleton, loading หรือผลลัพธ์ |
| `error` | ข้อความผิดพลาดจากการโหลด หรือ `null` | `App` — Collection | Effect โหลด API ตั้งข้อความเมื่อผิดพลาด และล้างก่อนลองโหลดใหม่ | ควบคุม error UI และปุ่ม Retry |
| `recentlyViewed` | Array snapshot จาก Stack; รายการล่าสุดอยู่หน้าสุด จำกัด 40 รายการ | `App` — Your Visit และ Modal; instance อยู่ใน `useRef` | `mutateRecentlyViewed` เรียกเมธอด Stack แล้วตั้ง snapshot; เปิดงาน push, Back pop/peek, Remove กรองแล้วสร้าง Stack ใหม่, Clear all clear | State snapshot ทำให้ React render; Stack ref เป็นแหล่งตรรกะ และบันทึก array รูปแบบเดิมใน LocalStorage |
| `viewingQueue` | Array snapshot จาก Queue ตามลำดับ FIFO | `App` — Your Visit และ Modal; instance อยู่ใน `useRef` | `mutateViewingQueue` เรียกเมธอด Queue แล้วตั้ง snapshot; Add enqueue, View next dequeue, ✕ removeWhere, Clear all clear | State snapshot ทำให้ React render; Queue ref เป็นแหล่งตรรกะ และบันทึก array รูปแบบเดิมใน LocalStorage |
| `favorites` | Array ผลงานโปรด | `App` — Cards, Modal และ Your Visit | `toggleFavorite` หรือ Clear all เรียก `setFavorites`; ค่าเริ่มต้นอ่านจาก LocalStorage | แสดงสถานะ Favorite ให้ตรงกันในหลายส่วนและเก็บข้ามการโหลดหน้า |
| `language` | ภาษาปัจจุบัน `en` หรือ `th` | `App` — ข้อความและเมนู | Language Toggle สลับค่า; ค่าเริ่มต้นอ่านจาก LocalStorage | เปลี่ยนข้อความที่ render และตั้งภาษาเอกสาร |
| `selectedArtwork` | ผลงานที่เปิดใน Modal หรือ `null` | `App` — Artwork Modal | เปิดผลงาน, เปลี่ยนชิ้นใน Modal, Back หรือปิด Modal | ควบคุมรายละเอียดและการเปิด/ปิด Modal |
| `selectedArtworkId` | ID ผลงานที่เลือกจาก Search Suggestion หรือ `null` | `App` — Collection | `selectSuggestion` ตั้งค่า; การพิมพ์/เปลี่ยน filter หรือ sort/submit ล้างค่า | เก็บเป้าหมายให้ Effect เลื่อนและไฮไลต์ Card |
| `suggestionsOpen` | สถานะเปิดรายการ Search Suggestions | `App` — Search | focus, เปลี่ยนคำค้นหา, เลือก suggestion หรือ submit | ควบคุมการแสดงรายการคำแนะนำ |
| `searchFocused` | สถานะ focus ของช่องค้นหา | `App` — Search และ class บน `body` | focus, blur, เลือก suggestion หรือ submit | สถานะ focus มีผลต่อ UI และ class ของเอกสาร |
| `toast` | ข้อความแจ้งเตือน `{ type, message, key }` หรือ `null` | `App` — Toast | `showToast` ตั้งค่า; Effect ตั้งกลับเป็น `null` หลัง 2,200 ms | แสดงผลตอบรับชั่วคราวตามการกระทำ |
| `reloadKey` | ตัวนับที่ใช้สั่งโหลด API ใหม่ | `App` — Retry | ปุ่ม Retry เพิ่มค่าด้วย `setReloadKey` | ให้ Effect โหลดข้อมูลทำงานเมื่อสั่งลองใหม่ |
| `modalSource` | แหล่งรายการ Modal: `collection` หรือ `queue` | `App` — Artwork Modal | `openArtwork` และ `goBackArtwork` ตั้งค่า | กำหนดว่าการเลื่อน Modal ใช้รายการใด |
| `modalIndex` | index ของผลงานในชุดที่กำลังนำทาง | `App` — Artwork Modal | `openArtwork`, `navigateModal` และ `goBackArtwork` | ใช้ควบคุมปุ่มก่อนหน้า/ถัดไปและตำแหน่งรายการ |
| `queueSequence` | Array ลำดับผลงานที่กำลังดูใน Modal จาก queue | `App` — Artwork Modal | เปิดจาก queue, เดินไปชิ้นถัดไป หรือออกจาก queue mode | เก็บลำดับที่เปลี่ยนไปเพื่อให้ Modal นำทางต่อได้ |
| `highlightedArtworkId` | ID ของ Card ที่ไฮไลต์ชั่วคราว | `App` — Collection Card | Effect ตั้งหลังเลือก Suggestion และ timer ตั้งกลับเป็น `null` หลัง 2,800 ms | แสดงผลการเลือกบน UI |
| `scrollY` | ตำแหน่ง scroll แนวตั้ง | `App` — Scroll-to-top | `scroll` listener เรียก `setScrollY` | แสดงปุ่มเมื่อเลื่อนเกิน 360 px |
| `introPhase` | ระยะ Intro: `loading`, `exiting` หรือ `done` | `App` — Intro | เริ่มจาก `shouldShowIntro()`; timer ใน Intro Effect เปลี่ยนเป็น `exiting` และ `done` | ควบคุมขั้นตอนและการแสดง Intro |
| `introProgress` | ความคืบหน้า Intro ตั้งแต่ 0 ถึง 100 | `App` — Intro progress bar | Interval ทุก 50 ms อัปเดตค่า; Effect ตั้งเป็น 100 เมื่อจบ | progress ที่แสดงเปลี่ยนตามเวลา |
| `heroRevealed` | สถานะว่าข้อความ Hero แสดงแล้วหรือไม่ | `App` — Home Hero | ค่าเริ่มต้นอิง `prefers-reduced-motion`; Intro Effect ตั้งเป็น `true` เมื่อจบ | เลือก class สำหรับการแสดง Hero |

State อยู่ที่ `App` เพราะข้อมูลและ event handler หลายตัวใช้ร่วมกันระหว่าง route, Header, Collection, Your Visit และ Modal; เก็บไว้ที่ component แม่เดียวจึงทำให้ข้อมูลที่แชร์ไม่แยกเป็นคนละชุด `VisitPanel`, `EmptyVisitState` และ `ListItem` รับข้อมูลจาก props และไม่มี state ของตัวเอง

ค่าที่หาได้จาก state/props อื่นจึงไม่เก็บซ้ำ: `filteredArtworks`, `categories`, `suggestions` และ Set ของ Favorite ID คำนวณด้วย `useMemo`; `pageCount` และ `paginatedArtworks` คำนวณระหว่าง render เช่นเดียวกับข้อความจาก `t()`. Stack และ Queue instance อยู่ใน `useRef`; state และ LocalStorage ยังคงเป็น Array ปกติเพื่อรองรับ React render และข้อมูลเดิม

### ข้อ 3.2 — useEffect

พบ `useEffect` รวม 16 จุด: 15 จุดใน `App` และ 1 จุดใน `BackgroundFX`; component อื่นไม่มี `useEffect`:

| component | effect ทำอะไร | dependency array | ทำงานตอนไหน |
|---|---|---|---|
| `App` | โหลด `/api/artworks`, ตั้ง loading/error และ retry เมื่อ API กำลัง sync (`503`) หรือเกิด network error; cleanup ตั้งธงยกเลิก flow เก่า (ไม่ได้ abort fetch) | `[reloadKey]` | หลัง mount และเมื่อ Retry เปลี่ยน `reloadKey` |
| `App` | แสดง loading ชั่วคราวหลังเปลี่ยนเงื่อนไขค้นหา/กรอง/เรียง | `[searchQuery, selectedCategory, sortOrder]` | หลัง dependency เปลี่ยนเมื่อโหลดข้อมูลแล้ว; cleanup ล้าง timeout 120 ms |
| `App` | บันทึก Favorites ลง LocalStorage | `[favorites]` | หลัง mount และเมื่อ Favorites เปลี่ยน |
| `App` | บันทึก Recently Viewed ลง LocalStorage | `[recentlyViewed]` | หลัง mount และเมื่อประวัติเปลี่ยน |
| `App` | บันทึก Viewing Queue ลง LocalStorage | `[viewingQueue]` | หลัง mount และเมื่อ Queue เปลี่ยน |
| `App` | บันทึกภาษาและตั้ง `document.documentElement.lang` | `[language]` | หลัง mount และเมื่อภาษาเปลี่ยน |
| `App` | สลับ class `modal-open` บน `document.body` | `[selectedArtwork]` | เมื่อเปิด/ปิด Modal; cleanup ลบ class |
| `App` | สลับ class `search-focused` บน `document.body` | `[searchFocused]` | เมื่อสถานะ focus เปลี่ยน; cleanup ลบ class |
| `App` | สลับ class `intro-open` เพื่อควบคุมการเลื่อนระหว่าง Intro | `[introPhase]` | หลัง mount และเมื่อ Intro phase เปลี่ยน; cleanup ลบ class |
| `App` | สมัคร `scroll` listener เพื่ออัปเดต `scrollY` | `[]` | หลัง mount; cleanup ถอด listener |
| `App` | ถ้าไม่ลด motion ให้อัปเดต progress ทุก 50 ms, เริ่ม exit ที่ 950 ms และจบ Intro/เผย Hero ที่ 1,300 ms | `[]` | หลัง mount; cleanup ล้าง interval และ timeout |
| `App` | เลื่อนไปยัง Card ที่เลือกจาก Suggestion และไฮไลต์ Card ชั่วคราว | `[selectedArtworkId, loading, artworks]` | เมื่อ dependency เปลี่ยน; ข้ามถ้าไม่มี ID หรือยัง loading; cleanup ยกเลิก RAF ที่ค้าง |
| `App` | ซ่อน Toast หลัง 2,200 ms | `[toast]` | เมื่อ Toast เปลี่ยนและมีค่า; cleanup ล้าง timeout |
| `App` | สมัคร keydown เพื่อปิด Modal ด้วย Escape และนำทางด้วยลูกศร | `[selectedArtwork, modalIndex, modalSource, queueSequence, viewingQueue]` | เมื่อ dependency เปลี่ยนและมี artwork เปิดอยู่; cleanup ถอด listener |
| `App` | ตั้ง Pagination กลับหน้า 1 | `[searchQuery, selectedCategory, sortOrder, selectedArtworkId]` | หลัง mount และเมื่อเงื่อนไขค้นหา/กรอง/เรียงหรือ ID เปลี่ยน |
| `BackgroundFX` | เมื่ออุปกรณ์รองรับ hover และไม่ลด motion ให้รับ `pointermove`, เคลื่อนไหว spotlight/parallax และหยุด RAF เมื่อแท็บซ่อนหรือถึงเป้าหมาย | `[]` | หลัง mount; ข้ามการสมัคร listener เมื่อไม่รองรับ; cleanup ถอด listeners และยกเลิก RAF |

การเรียก API ผูกกับ `[reloadKey]` ไม่ได้ผูกกับ state ของผลลัพธ์ จึงไม่เรียกซ้ำจากการตั้ง `artworks/loading/error`; retry ใน effect มีเพดานจำนวนครั้งและ cleanup ป้องกัน flow ที่ยกเลิกแล้วตั้ง state ต่อ ส่วน Pagination Effect ไม่ขึ้นกับ `currentPage` จึงไม่วนซ้ำเพราะตัวเอง สำหรับ `[]` Effect ทำงานเมื่อติดตั้ง component และ cleanup ถอด listener/ล้าง timer เมื่อถอด component; เนื่องจาก `main.jsx` ครอบด้วย `StrictMode` ในโหมดพัฒนา React อาจทดสอบ setup/cleanup ซ้ำหนึ่งรอบ จึงไม่ควรตีความว่า API จะถูกเรียกเพียงครั้งเดียวในทุกโหมด

### ข้อ 3.3 — Component Tree และ Props

`main.jsx` สร้าง root โดยครอบ `App` ด้วย `StrictMode` และ `HashRouter`; `App` มี State 25 จุด, Effect 15 จุด, Stack/Queue instances ใน refs และ Favorite ID Set จาก `useMemo`; `BackgroundFX` มี Effect 1 จุด:

```text
main.jsx
└─ StrictMode
   └─ HashRouter
      └─ App
         ├─ BackgroundFX (Effect 1 จุด)
         ├─ Intro
         ├─ Header
         │  └─ GraphNav
         ├─ Breadcrumb
         ├─ Main
         │  └─ Routes
         │     ├─ Route "/"           → Home (Hero)
         │     ├─ Route "/collection" → Collection (Search, Suggestions, Filter,
         │     │                         Sort, Cards, Pagination)
         │     ├─ Route "/your-visit" → Your Visit
         │     │                         ├─ VisitPanel: Recently Viewed
         │     │                         ├─ VisitPanel: Viewing Queue
         │     │                         └─ VisitPanel: Favorites
         │     └─ Route "*"           → Navigate กลับ Home
         ├─ Artwork Modal (เมื่อเลือกผลงาน)
         ├─ Toast และ Scroll-to-top
         └─ Footer
```

Home, Collection และ Your Visit เป็น element ของ `Route` ที่ประกาศ inline ใน `App` ไม่ใช่ component page แยกไฟล์; `VisitPanel`, `EmptyVisitState` และ `ListItem` เป็น component แยกใน `App.jsx`
`App` เก็บ instance `Stack`/`Queue` ใน refs และส่ง `toArray()` เป็น state snapshot ให้ส่วนแสดงผล; Set ของ Favorite ID เป็นค่าคำนวณจาก `favorites` ไม่ใช่ state เพิ่ม

| ลูก | Props ที่ส่งจากแม่ไปลูก | Callback/ข้อมูลที่ส่งกลับจากลูก |
|---|---|---|
| `GraphNav` | `language`, `className` จาก `App` | ไม่มี callback prop; อ่าน route ปัจจุบันผ่าน `useLocation` และใช้ `Link` |
| `Breadcrumb` | `language` จาก `App` | ไม่มี callback prop; อ่าน route ปัจจุบันผ่าน `useLocation` |
| `VisitPanel` | `eyebrow`, `title`, `action`, `children` จาก `App` | ไม่มี callback prop โดยตรง; `action` และ `children` เป็น JSX ที่แม่สร้าง |
| `EmptyVisitState` | `icon`, `message`, `hint`, `collectionLabel` จาก `App` | ไม่มี callback prop; ภายในมี `Link` ไป Collection |
| `ListItem` | `artwork`, `onOpen`, `onRemove`, `removeLabel` จาก `App` | เรียก `onOpen()` เมื่อเปิดรายการ และ `onRemove()` เมื่อลบ; callback ที่ App ส่งขึ้นมาจัดการ Modal หรืออัปเดต Recently Viewed/Queue/Favorites |

ตัวอย่าง callback: `ListItem` ใน Recently Viewed เรียก `openArtwork(artwork)` และ `mutateRecentlyViewed(...)`; ใน Queue เรียก `openArtwork(artwork, "queue")` และ `mutateViewingQueue(...)`; ใน Favorites เรียก `toggleFavorite(artwork)` ส่วน Card/Search/Pagination อยู่ภายใน JSX ของ `App` จึงเรียก handler ของ `App` โดยตรง State อยู่ที่ `App` เพื่อให้ข้อมูลที่ต้องใช้ข้าม route และหลายส่วนของหน้าจอมีแหล่งจริงชุดเดียว โดย child รับ props และส่งการกระทำกลับผ่าน callback

### ข้อ 3.4 — Graph.js กับ Navigation

ใน [Graph.js](./frontend/src/Graph.js) มีคลาส `Graph` ที่เขียนเอง โดย `siteGraph` เก็บข้อมูลหน้าเว็บ 3 node ได้แก่ `Home`, `Collection` และ `Your Visit`; edge เป็นลิงก์แบบมีทิศทางที่กำหนดเมนูที่ไปต่อได้จากแต่ละหน้า มี 6 edge ในกราฟปัจจุบัน:

- Home → Collection, Your Visit
- Collection → Home, Your Visit
- Your Visit → Home, Collection

เก็บ node และ adjacency list ด้วย `Map` (`nodes` และ `adjacency`) โดย `getNeighbors()` คืนหน้าที่เชื่อมออกจากหน้าปัจจุบัน `GraphNav` ใน [GraphNav.jsx](./frontend/src/components/GraphNav.jsx) จึงสร้างเมนูจาก `getNeighbors(current.id)` แทนการเขียนเมนูคงที่ ส่วน route และลิงก์ใช้ `HashRouter` กับ React Router

`Breadcrumb` เรียก `shortestPath("home", current.id)` ซึ่งใช้ Breadth-First Search (BFS) สำรวจ adjacency list เพื่อหาเส้นทางสั้นสุดจาก Home ไปหน้าปัจจุบัน ใช้ `Map` เป็นทั้งตาราง parent/visited และ `Queue` ที่เขียนเองใน `frontend/src/dsa/Queue.js` สำหรับ frontier; BFS ใช้เวลา `O(V + E)` และพื้นที่ `O(V)` การใช้ adjacency list เหมาะกับกราฟนี้เพราะเก็บเฉพาะลิงก์ที่มีจริงและ `getNeighbors` ทำงานตามจำนวนลิงก์ออกจาก node ช่วยให้เมนูและ breadcrumb สอดคล้องกับเส้นทางนำทางชุดเดียวกัน

สรุปการนับจาก source: `useState` 25 จุด, `useEffect` 16 จุด (App 15 + BackgroundFX 1), route ของหน้า 3 เส้นทาง และ Graph มี 3 node/6 edge ตัวเลขเหล่านี้นับจากโค้ดปัจจุบัน ส่วนการทำงานจริงของ API และการแสดงผลต้องตรวจด้วยการรันแอป/ชุดทดสอบตามกรณีใช้งาน

## ข้อ 4 — DSA เชิงลึก

### React — Stack สำหรับ Recently Viewed

- **ไฟล์:** `frontend/src/dsa/Stack.js`, การเชื่อมกับ `App` ใน `frontend/src/App.jsx`
- **ข้อมูล/ผลต่อ UX:** เปิด artwork แล้ว push เป็นรายการล่าสุด; แสดงรายการล่าสุดก่อน, Back pop รายการปัจจุบันแล้ว peek รายการก่อนหน้า, ✕ ลบรายการ และ Clear all ล้างประวัติ
- **วิธีเก็บ:** Stack ใช้ circular buffer; `App` ถือ instance ใน `useRef` และ state เป็น `toArray()` snapshot เรียงล่าสุดก่อน การอัปเดตทั้งหมดผ่าน `mutateRecentlyViewed` แล้วค่อย set snapshot
- **Big-O:** push/pop/peek `O(1)`; push ของ stack ที่ไม่จำกัดเป็น `O(1)` แบบ amortized เมื่อขยาย buffer; `toArray` และ Remove `O(n)`; Clear `O(capacity)`. Recently Viewed จำกัด 40 รายการ
- **ความเข้ากันได้:** localStorage ยังคงเป็น JSON array เรียงล่าสุดก่อน อ่านข้อมูลเดิมได้; Back คงพฤติกรรมเดิม คือเอารายการปัจจุบันออกและเปิดรายการก่อนหน้าโดยไม่เพิ่มกลับเข้า Stack ทันที
- **ข้อจำกัด:** การทำ snapshot และบันทึก LocalStorage เป็น `O(n)` ทุกครั้งที่เปลี่ยนรายการ ซึ่งเหมาะกับประวัติที่จำกัดจำนวนไว้ แต่ไม่ได้ทำให้การ render/list persistence เป็น `O(1)`

### React — Queue สำหรับ Viewing Queue และ BFS

- **ไฟล์:** `frontend/src/dsa/Queue.js`, ใช้ใน `frontend/src/App.jsx` และ `frontend/src/Graph.js`
- **ข้อมูล/ผลต่อ UX:** Add to Queue เพิ่มท้าย FIFO; View next และการเดิน Modal ใน queue นำรายการแรกออก; ✕ ใช้ `removeWhere`; Clear all ล้าง queue การกด Back ยังคงย้อนตาม Recently Viewed ไม่ได้ย้อน enqueue รายการที่นำออกแล้ว
- **วิธีเก็บ:** Queue ใช้ array กับ head index; dequeue ไม่เรียก `Array.shift()` และบีบอัดส่วนที่ใช้แล้วเป็นครั้งคราว เมื่อกดเมนูลบรายตัวจะรักษาลำดับ FIFO ของรายการที่เหลือ `App` เก็บ instance ใน `useRef` และ state/LocalStorage เป็น Array snapshot แบบเดิม
- **Big-O:** enqueue `O(1)` amortized; dequeue `O(1)` amortized (การ compact บางครั้งใช้ `O(n)` แต่มีค่าใช้จ่ายเฉลี่ยต่อ dequeue คงที่); peek/size/isEmpty `O(1)`; toArray/removeWhere `O(n)`. การป้องกัน Add ซ้ำยังตรวจรายการด้วยการสแกน `O(n)`
- **BFS:** `Graph.shortestPath` ใช้ Queue เดียวกันเป็น frontier; เวลาค้นหา `O(V + E)`, พื้นที่ `O(V)`. ก่อนหน้านี้ BFS ใช้ Array กับ head index ซึ่ง dequeue ก็ `O(1)`; การเปลี่ยนมาใช้ Queue class ช่วย reuse โครงสร้างและระบุ FIFO ชัดเจน ไม่ได้อ้างว่าเพิ่มความเร็วเชิง asymptotic
- **ข้อจำกัด:** Queue ใน React และ BFS ใช้ implementation เดียวกัน แต่เป็นคนละ instance; Queue ไม่ persist ตัวเอง ส่วนการคงข้อมูลหลัง refresh ทำผ่าน snapshot ใน LocalStorage
- **Node module format:** root `package.json` เป็น CommonJS สำหรับ Backend; `frontend/src/package.json` กำหนด ESM เฉพาะ React source เพื่อให้ `node:test` import โมดูล `.js` ได้ โดยไม่เปลี่ยน module format ของ Backend หรือ CommonJS tests เดิม

### React — Set สำหรับเช็ก Favorites

- **ไฟล์:** `frontend/src/App.jsx`
- **ข้อมูล/ผลต่อ UX:** `favoriteIds` เป็น `Set` ที่สร้างจาก `favorites` ด้วย `useMemo`; การ์ดและ Modal ใช้ `Set.has()` เพื่อเลือกหัวใจสถานะ Favorite
- **Big-O:** สร้าง Set เมื่อ Array เปลี่ยน `O(F)` โดยเฉลี่ย; ตรวจ Favorite ต่อ artwork เป็น `O(1)` โดยเฉลี่ย เทียบกับ `Array.some()` เดิมที่กรณีเลวร้ายเป็น `O(F)` ต่อ artwork; การ render `N` การ์ดจึงเปลี่ยนจาก `O(NF)` เป็น `O(F + N)` ต่อรอบ memoization
- **ความเข้ากันได้:** `favorites` ยังคงเป็น Array ใน state และ LocalStorage; ใช้ string ID ทั้งตอนสร้าง Set และตรวจ lookup เพื่อคงการเทียบ ID แบบเดิม
- **ข้อจำกัด:** `Set.has` เป็นค่าเฉลี่ยตามพฤติกรรม hash table ของ JavaScript; Set ถูกสร้างใหม่เมื่อ Favorites เปลี่ยน และประโยชน์ด้านเวลาบนอุปกรณ์จริงขึ้นกับขนาดรายการ/จำนวนการ render

### React — Merge sort และลำดับ tie แบบเดิม

- **ไฟล์:** `frontend/src/dsa/sort.js`, ใช้ใน `frontend/src/App.jsx`; `selectionSort` สำหรับเทียบอยู่เฉพาะใน `frontend/benchmarks/dsaBenchmark.js`
- **ข้อมูล/ผลต่อ UX:** Collection ยังคง sort Title/Year ทั้ง ascending/descending; Year ว่างยังแปลงด้วย `Number(year || 0)` เหมือนเดิม
- **Big-O:** selection sort เดิม `O(n²)`; merge sort เป็น `O(n log n)` และใช้พื้นที่ `O(n)`. เพื่อรักษาลำดับเดิมของข้อมูลที่ comparator ให้ค่าเท่ากัน `getLegacyTieRanks` ใช้ segment tree จำลองลำดับการเลือก/สลับแบบเดิม ใช้ `O(n log n)` เวลาและ `O(n)` พื้นที่ แล้วส่ง rank เป็นตัวตัดสินกรณี tie ให้ stable merge sort ผลรวมยังเป็น `O(n log n)`
- **ความเข้ากันได้ที่ตรวจ:** เปรียบเทียบ output กับ selection sort เดิมบน Dataset ปัจจุบันครบ Title/Year ทั้ง ascending/descending และลำดับ ID ตรงกันทุกกรณีที่ตรวจ รวมรายการที่ title/year ซ้ำและปีว่าง
- **เหตุผลที่ไม่ใช้ `Array.prototype.sort()` ใน Collection:** native sort อาจเร็วใน runtime ที่ใช้ แต่ไม่ได้แสดงการ implement merge sort ตามเป้าหมาย DSA; ยัง benchmark เป็น baseline แยกต่างหาก
- **ข้อจำกัด:** Dataset ปัจจุบันมีเพียง 35 รายการ จึงไม่น่าทำให้ผู้ใช้เห็นความต่างชัด; การสร้าง tie-rank เพิ่ม constant factor และพื้นที่ `O(n)` เพื่อรักษาลำดับเดิม ขณะที่ tie-rank ไม่จำเป็นหากยอมรับ stable input order เป็นพฤติกรรมใหม่

### Express — โครงสร้างข้อมูลและการจัดการงานที่มีอยู่แล้ว

- **Concurrency ของ Met Museum API:** `backend/services/metMuseumApi.js` มี `mapWithConcurrency` ใช้ worker จำนวนไม่เกิน `min(items.length, concurrency)` (ค่าเริ่มต้น concurrency 4) กับตัวนับ `nextIndex` เพื่อแจกงาน และเขียนผลกลับตำแหน่งเดิมใน `results[index]`; เวลา/พื้นที่ scheduler เป็น `O(n)` นอกเหนือจากเวลาร้องขอเครือข่าย และผลลัพธ์ยังเรียงตาม input ไม่ใช่ลำดับที่ request เสร็จ
- **Retry:** `getJson` ลองซ้ำตามจำนวน retries ที่กำหนด (ค่าเริ่มต้น 2 retries) สำหรับ network/timeout, HTTP 429 และ 5xx; คำนวณ exponential backoff แบบมีเพดานและรองรับ `Retry-After` ไม่ retry status อื่น/JSON เสีย โค้ดนี้เป็น retry loop แบบมีขอบเขต ไม่ใช่คิวงานแยก
- **Deduplication:** `backend/services/metMuseumSync.js` ใช้ `Set` หลัง flatten object IDs จาก Search terms เพื่อคง ID ที่พบครั้งแรกและตัดซ้ำ; การสร้าง Set ใช้เวลาเฉลี่ย `O(k)` และพื้นที่ `O(k)` ตามจำนวน ID candidates
- **File lock:** `backend/data/artworkStore.js` ใช้ `Map` จาก resolved file path ไปยัง Promise tail; `withFileLock` ต่อ operation ของไฟล์เดียวกันเป็นลำดับ ทำให้เขียนไม่ชนกันภายใน Node process เดียว โดย lookup Map เฉลี่ย `O(1)`; ไม่ใช่ distributed lock ข้ามหลาย process/instance
- **Atomic write:** เขียนไฟล์ temporary ที่ชื่อไม่ซ้ำ, sync, แล้ว rename ทับปลายทางภายใต้ lock; เวลาเขียนขึ้นกับขนาด JSON `S` (อย่างน้อย `O(S)`) ช่วยไม่ให้ผู้อ่านเห็นไฟล์ JSON ที่เขียนค้างกลางทาง แต่ไม่ได้ทำให้ filesystem เขียนถาวรบน Vercel
- **ข้อจำกัด/ผล UX:** Backend เหล่านี้รองรับงาน sync และความถูกต้องของข้อมูล ไม่ใช่ endpoint Favorites หรือโครงสร้างที่เก็บสถานะผู้ใช้; favorites ยังอยู่ใน React/LocalStorage ฝั่ง browser

### ผล Benchmark จริง

รันจาก `npm run bench` ด้วย Node `v24.19.0`; warm-up 1 รอบและเฉลี่ย 3 รอบ วัดเวลาของ operation เป็น milliseconds; สคริปต์ใช้ข้อมูล sort แบบสุ่ม seed คงที่ เวลาเป็นผลเฉพาะ environment นี้และอาจต่างกันตามเครื่อง/runtime

#### Queue: รวมเวลา dequeue ครบ n รายการ

| n | `Array.shift()` (ms) | `Queue.dequeue()` (ms) | อัตราส่วน shift / Queue |
|---:|---:|---:|---:|
| 1,000 | 0.242 | 0.309 | 0.78 |
| 10,000 | 1.407 | 0.309 | 4.56 |
| 100,000 | 13,399.332 | 1.037 | 12,920.83 |

การ benchmark สร้าง/เติมข้อมูลก่อนจับเวลา และจับเวลาเฉพาะการเอารายการออกทั้งหมด; ผลชี้แนวโน้มของการย้ายหัว index แทนการเลื่อนสมาชิกของ Array ซ้ำ ไม่ใช่เวลาการใช้งานจริงของเว็บไซต์

#### Sort: ข้อมูลตัวเลข seed คงที่

| n | Selection sort (ms) | `mergeSort` (ms) | `Array.sort()` (ms) |
|---:|---:|---:|---:|
| 100 | 0.194 | 0.112 | 0.012 |
| 1,000 | 0.967 | 0.405 | 0.146 |
| 5,000 | 28.659 | 2.014 | 1.541 |

ที่ n เล็กผลจากค่าใช้จ่ายคงที่/engine ทำให้ merge sort ไม่ได้เร็วกว่าเสมอ; ที่ n 5,000 ในการรันนี้ merge sort เร็วกว่า selection sort แต่ช้ากว่า native sort และการ benchmark นี้วัด `mergeSort` โดยตรง ไม่รวม compatibility tie-rank ที่ Collection ใช้เพิ่มเพื่อคง output เดิม

#### Favorites: ค้นหา ID ที่อยู่ท้ายรายการ

| จำนวน Favorites | lookups/รอบ | `Array.some()` (ms) | `Set.has()` (ms) | อัตราส่วน some / Set |
|---:|---:|---:|---:|---:|
| 1,000 | 1,000 | 1.032 | 0.049 | 21.07 |
| 10,000 | 100 | 0.526 | 0.001 | 426.84 |
| 100,000 | 100 | 5.860 | 0.022 | 267.58 |

การวัด lookup ใช้กรณี hit ที่สมาชิกท้าย Array และสร้าง Set ก่อนจับเวลา ไม่รวมต้นทุนสร้าง Set; ค่า 0.001 ms สั้นมากและอัตราส่วนจึงไวต่อความละเอียดของ timer/โหลดเครื่อง ไม่ควรใช้เป็นคำรับรองความเร็วคงที่ Dataset ในแอปมี 35 artworks และ benchmark ขนาดใหญ่มีไว้แสดงแนวโน้มเชิงซับซ้อน ไม่ใช่การจำลอง UX ที่ผู้ใช้จะรู้สึกได้ในข้อมูลปัจจุบัน

## รายละเอียด API แต่ละ Endpoint

Base URL สำหรับ routes ของ artwork: `http://localhost:3000/api/artworks`

| Method | Endpoint | คำอธิบาย |
|--------|----------|----------|
| GET | `/api/artworks` | แสดงผลงานศิลปะทั้งหมด |
| GET | `/api/artworks/search?q=` | ค้นหาจาก title, artist, category หรือ year |
| GET | `/api/artworks/category/:category` | แสดงผลงานตาม category |
| GET | `/api/artworks/:id` | แสดงรายละเอียดผลงานตาม ID |
| PUT | `/api/artworks/:id` | แก้ไขข้อมูลผลงานศิลปะ |
| DELETE | `/api/artworks/:id` | ลบผลงานศิลปะ |

> **หมายเหตุ:** `/search` และ `/category/:category` ถูกจัดลำดับไว้ก่อน `/:id` ในไฟล์ routes เพื่อไม่ให้ Express เข้าใจผิดว่าคำว่า `search` หรือ `category` คือค่า id
>
> Server ยังมี `GET /api/health` แยกจาก artwork routes สำหรับตรวจสถานะ API; endpoint นี้กำหนดใน `backend/server.js` ไม่ได้อยู่ใน `backend/routes/artworkRoutes.js`

---

### 1. GET /api/artworks

แสดงผลงานศิลปะทั้งหมด

Response (200 OK) มี `success: true`, `total` ซึ่งเป็นจำนวนรายการ และ `data` ซึ่งเป็น Array ของผลงานทั้งหมด; ใน Dataset ปัจจุบัน `backend/data/artworks.json` มี 35 รายการ

### 2. GET /api/artworks/:id

แสดงรายละเอียดผลงานศิลปะตาม ID

**ตัวอย่าง Request:** `GET /api/artworks/466105`

**ตัวอย่าง Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 466105,
    "title": "Booklet with Scenes of the Passion",
    "artist": "Unknown Artist",
    "year": 1300,
    "category": "Ivories-Elephant",
    "description": "ผลงานจาก North French (carving); Upper Rhenish (painting)",
    "image": "https://images.metmuseum.org/CRDImages/md/web-large/DT133.jpg"
  }
}
```

ID ที่ไม่มีใน Dataset ตอบ `404 Not Found` โดย body มี `success: false` และข้อความ `ไม่พบผลงานศิลปะ id: <id>`; ID ที่ไม่ใช่ positive safe integer ตอบ `400 Bad Request`

### 3. PUT /api/artworks/:id

แก้ไขข้อมูลผลงานตาม ID โดย body ต้องเป็น JSON object และมี `title` กับ `artist` เป็นข้อความที่ไม่ว่าง; ถ้าส่ง `year` ต้องเป็นตัวเลขหรือ `null` และถ้าส่ง `category`, `description` หรือ `image` ต้องเป็นข้อความ

**ตัวอย่าง Request:** `PUT /api/artworks/466105`

**ตัวอย่าง Request Body:**
```json
{
  "title": "Booklet with Scenes of the Passion",
  "artist": "Unknown Artist",
  "year": 1300,
  "category": "Ivories-Elephant",
  "description": "ผลงานจาก North French (carving); Upper Rhenish (painting)",
  "image": "https://images.metmuseum.org/CRDImages/md/web-large/DT133.jpg"
}
```

**ตัวอย่าง Response (200 OK):**
```json
{
  "success": true,
  "message": "แก้ไขผลงานศิลปะสำเร็จ",
  "data": {
    "id": 466105,
    "title": "Booklet with Scenes of the Passion",
    "artist": "Unknown Artist",
    "year": 1300,
    "category": "Ivories-Elephant",
    "description": "ผลงานจาก North French (carving); Upper Rhenish (painting)",
    "image": "https://images.metmuseum.org/CRDImages/md/web-large/DT133.jpg"
  }
}
```

**ถ้าไม่พบข้อมูล:** ส่ง 404 (รูปแบบเดียวกับข้อ 2)
**ถ้า body หรือค่าฟิลด์ไม่ผ่าน validation:** ส่ง 400 (มี `success: false` และ `message` อธิบายข้อผิดพลาด); เมื่อไม่ส่งฟิลด์ `year`, `category`, `description` หรือ `image` ระบบกำหนดค่าเริ่มต้นเป็น `null`, `"Uncategorized"`, `""` และ `""` ตามลำดับ

### 4. DELETE /api/artworks/:id

ลบผลงานศิลปะตาม ID

**ตัวอย่าง Request:** `DELETE /api/artworks/466105`

**Response:** `204 No Content` (ไม่มี body ส่งกลับ)

ถ้า ID ไม่มีอยู่จะตอบ `404 Not Found`; อย่าทดลอง `DELETE` กับ Dataset ที่ต้องการเก็บไว้ ให้ใช้สำเนาข้อมูลสำหรับทดสอบ

### 5. GET /api/artworks/search?q=

ค้นหาผลงานจาก `title`, `artist`, `category` หรือ `year` (ไม่สนตัวพิมพ์เล็ก/ใหญ่)

**ตัวอย่าง Request:** `GET /api/artworks/search?q=Booklet`

**ตัวอย่าง Response (200 OK):**
```json
{
  "success": true,
  "total": 1,
  "data": [
    {
      "id": 466105,
      "title": "Booklet with Scenes of the Passion",
      "artist": "Unknown Artist",
      "year": 1300,
      "category": "Ivories-Elephant",
      "description": "ผลงานจาก North French (carving); Upper Rhenish (painting)",
      "image": "https://images.metmuseum.org/CRDImages/md/web-large/DT133.jpg"
    }
  ]
}
```

**ถ้าไม่ระบุ `q` หรือส่ง `q` ซ้ำ (400 Bad Request):**
```json
{
  "success": false,
  "message": "กรุณาระบุคำค้นหาผ่าน query parameter 'q' เพียงหนึ่งค่า"
}
```

### 6. GET /api/artworks/category/:category

แสดงผลงานตาม category แบบเทียบทั้งข้อความโดยไม่สนตัวพิมพ์เล็ก/ใหญ่

**ตัวอย่าง Request:** `GET /api/artworks/category/Ivories-Elephant`

**ตัวอย่าง Response (200 OK):**
```json
{
  "success": true,
  "total": 1,
  "data": [
    {
      "id": 466105,
      "title": "Booklet with Scenes of the Passion",
      "artist": "Unknown Artist",
      "year": 1300,
      "category": "Ivories-Elephant",
      "description": "ผลงานจาก North French (carving); Upper Rhenish (painting)",
      "image": "https://images.metmuseum.org/CRDImages/md/web-large/DT133.jpg"
    }
  ]
}
```

### GET /api/health

ตรวจสถานะ Express API (`backend/server.js`); เมื่อทำงานจะตอบ `200` พร้อม `success: true` และข้อความ `Art Gallery API is running`

---

## วิธีทดสอบด้วย Postman

1. เปิดโปรแกรม Postman แล้วสร้าง Collection ใหม่ชื่อ `Art Gallery API`
2. ตั้งค่า Base URL เป็น `http://localhost:3000` (ต้องรันเซิร์ฟเวอร์ด้วย `npm start` ก่อน)
3. สร้าง Request ตามตารางด้านล่าง:

| ชื่อ Request | Method | URL |
|---|---|---|
| Get All Artworks | GET | `http://localhost:3000/api/artworks` |
| Get Artwork By Id | GET | `http://localhost:3000/api/artworks/466105` |
| Search Artworks | GET | `http://localhost:3000/api/artworks/search?q=Booklet` |
| Get By Category | GET | `http://localhost:3000/api/artworks/category/Ivories-Elephant` |
| Update Artwork | PUT | `http://localhost:3000/api/artworks/466105` |
| Delete Artwork | DELETE | `http://localhost:3000/api/artworks/466105` |

4. สำหรับ **PUT**:
   - ไปที่แท็บ **Body** → เลือก **raw** → เลือกประเภทเป็น **JSON**
   - วาง JSON ตัวอย่าง เช่น:
     ```json
     {
       "title": "Booklet with Scenes of the Passion",
       "artist": "Unknown Artist",
       "year": 1300,
       "category": "Ivories-Elephant",
       "description": "ผลงานจาก North French (carving); Upper Rhenish (painting)",
       "image": "https://images.metmuseum.org/CRDImages/md/web-large/DT133.jpg"
     }
     ```
   - PUT และ DELETE เปลี่ยนไฟล์ Dataset ในเครื่อง; ให้ทดลองกับสำเนาข้อมูล และอย่าส่ง DELETE กับ Dataset ที่ต้องการเก็บ
5. กด **Send** แล้วดูผลลัพธ์ที่ส่วน Response ด้านล่าง ตรวจสอบ status code ที่เกี่ยวข้อง เช่น 200, 204, 400, 404 หรือ 503 ในโหมด read-only และ body ที่ได้กลับมา

## หมายเหตุ

- การแก้ไขและลบข้อมูลในเครื่องจะเขียนไฟล์ `backend/data/artworks.json` แบบ atomic และจัดลำดับการเขียนภายใน Node.js process เดียวกัน
- บน Vercel API อ่าน Dataset ที่มากับ Deployment แบบ read-only; `PUT` และ `DELETE` ตอบ `503` เพราะโปรเจกต์ยังไม่มี durable shared storage ห้ามถือว่า `/tmp` หรือ filesystem ของ serverless เป็นพื้นที่ถาวร
- หากต้องการ CRUD บน Vercel ต้องตั้งค่า storage ภายนอกที่รองรับการเขียนถาวรและการเข้าถึงร่วมกันก่อน
- Favorites เป็นฟีเจอร์ Frontend เท่านั้น โดยใช้ React state และ LocalStorage ของ browser; Backend ไม่มี endpoint สำหรับ Favorites, User หรือ Authentication. `backend/routes/artworkRoutes.js` มี 6 artwork routes ตามตาราง และ `backend/server.js` มี `GET /api/health` แยกต่างหาก
