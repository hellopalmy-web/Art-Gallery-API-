# Art Gallery API

REST API พื้นฐานสำหรับจัดเก็บและแสดงข้อมูลผลงานศิลปะ เขียนด้วย Node.js + Express.js โดยใช้ไฟล์ JSON เป็นฐานข้อมูลชั่วคราว (ยังไม่เชื่อมต่อฐานข้อมูลจริง)

## โครงสร้างโปรเจกต์

```
art-gallery-api/
├── data/
│   └── artworks.json          # ฐานข้อมูลชั่วคราวแบบไฟล์ JSON
├── routes/
│   └── artworkRoutes.js       # กำหนดเส้นทาง (routes) ทั้งหมดของ artwork
├── controllers/
│   └── artworkController.js   # logic การทำงานของแต่ละ endpoint
├── server.js                  # จุดเริ่มต้นของแอปพลิเคชัน
├── package.json
└── README.md
```

## วิธีติดตั้ง

ต้องมี [Node.js](https://nodejs.org/) เวอร์ชัน 16 ขึ้นไปติดตั้งไว้ในเครื่อง

```bash
# 1. เข้าไปที่โฟลเดอร์โปรเจกต์
cd art-gallery-api

# 2. ติดตั้ง dependencies
npm install
```

## วิธีรันโปรเจกต์

```bash
# รันแบบปกติ
npm start

# หรือรันแบบ auto-restart เมื่อแก้โค้ด (ใช้ --watch ของ Node.js)
npm run dev
```

เมื่อรันสำเร็จจะเห็นข้อความ:
```
Art Gallery API กำลังทำงานที่ http://localhost:3000
```

สามารถเปลี่ยนพอร์ตได้ด้วย environment variable `PORT` เช่น `PORT=4000 npm start`

## รายละเอียด API แต่ละ Endpoint

Base URL: `http://localhost:3000/api/artworks`

| Method | Endpoint | คำอธิบาย |
|--------|----------|----------|
| GET | `/api/artworks` | แสดงผลงานศิลปะทั้งหมด |
| GET | `/api/artworks/search?q=` | ค้นหาผลงานจาก title หรือ artist |
| GET | `/api/artworks/category/:category` | แสดงผลงานตาม category |
| GET | `/api/artworks/:id` | แสดงรายละเอียดผลงานตาม ID |
| POST | `/api/artworks` | เพิ่มผลงานศิลปะใหม่ |
| PUT | `/api/artworks/:id` | แก้ไขข้อมูลผลงานศิลปะ |
| DELETE | `/api/artworks/:id` | ลบผลงานศิลปะ |

> **หมายเหตุ:** `/search` และ `/category/:category` ถูกจัดลำดับไว้ก่อน `/:id` ในไฟล์ routes เพื่อไม่ให้ Express เข้าใจผิดว่าคำว่า `search` หรือ `category` คือค่า id

---

### 1. GET /api/artworks

แสดงผลงานศิลปะทั้งหมด

**ตัวอย่าง Response (200 OK):**
```json
{
  "success": true,
  "total": 4,
  "data": [
    {
      "id": 1,
      "title": "The Starry Night",
      "artist": "Vincent van Gogh",
      "year": 1889,
      "category": "Painting",
      "description": "A famous painting depicting a night sky full of swirling stars over a small village.",
      "image": "https://example.com/starry-night.jpg"
    }
  ]
}
```

### 2. GET /api/artworks/:id

แสดงรายละเอียดผลงานศิลปะตาม ID

**ตัวอย่าง Request:** `GET /api/artworks/1`

**ตัวอย่าง Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "The Starry Night",
    "artist": "Vincent van Gogh",
    "year": 1889,
    "category": "Painting",
    "description": "A famous painting depicting a night sky full of swirling stars over a small village.",
    "image": "https://example.com/starry-night.jpg"
  }
}
```

**ถ้าไม่พบข้อมูล (404 Not Found):**
```json
{
  "success": false,
  "message": "ไม่พบผลงานศิลปะ id: 99"
}
```

### 3. POST /api/artworks

เพิ่มผลงานศิลปะใหม่ (ต้องส่ง `title` และ `artist` มาด้วย ห้ามเป็นค่าว่าง)

**ตัวอย่าง Request Body:**
```json
{
  "title": "Mona Lisa",
  "artist": "Leonardo da Vinci",
  "year": 1503,
  "category": "Painting",
  "description": "A half-length portrait painting.",
  "image": "https://example.com/mona-lisa.jpg"
}
```

**ตัวอย่าง Response (201 Created):**
```json
{
  "success": true,
  "message": "เพิ่มผลงานศิลปะสำเร็จ",
  "data": {
    "id": 5,
    "title": "Mona Lisa",
    "artist": "Leonardo da Vinci",
    "year": 1503,
    "category": "Painting",
    "description": "A half-length portrait painting.",
    "image": "https://example.com/mona-lisa.jpg"
  }
}
```

**ถ้าข้อมูลไม่ครบ (400 Bad Request):**
```json
{
  "success": false,
  "message": "กรุณาระบุ title และ artist ให้ครบถ้วน"
}
```

### 4. PUT /api/artworks/:id

แก้ไขข้อมูลผลงานศิลปะตาม ID (ต้องส่ง `title` และ `artist` มาด้วย ห้ามเป็นค่าว่าง)

**ตัวอย่าง Request:** `PUT /api/artworks/1`

**ตัวอย่าง Request Body:**
```json
{
  "title": "The Starry Night (Updated)",
  "artist": "Vincent van Gogh",
  "year": 1889,
  "category": "Painting",
  "description": "คำอธิบายที่แก้ไขใหม่",
  "image": "https://example.com/starry-night.jpg"
}
```

**ตัวอย่าง Response (200 OK):**
```json
{
  "success": true,
  "message": "แก้ไขผลงานศิลปะสำเร็จ",
  "data": {
    "id": 1,
    "title": "The Starry Night (Updated)",
    "artist": "Vincent van Gogh",
    "year": 1889,
    "category": "Painting",
    "description": "คำอธิบายที่แก้ไขใหม่",
    "image": "https://example.com/starry-night.jpg"
  }
}
```

**ถ้าไม่พบข้อมูล:** ส่ง 404 (รูปแบบเดียวกับข้อ 2)
**ถ้าข้อมูลไม่ครบ:** ส่ง 400 (รูปแบบเดียวกับข้อ 3)

### 5. DELETE /api/artworks/:id

ลบผลงานศิลปะตาม ID

**ตัวอย่าง Request:** `DELETE /api/artworks/1`

**Response:** `204 No Content` (ไม่มี body ส่งกลับ)

**ถ้าไม่พบข้อมูล (404 Not Found):**
```json
{
  "success": false,
  "message": "ไม่พบผลงานศิลปะ id: 99"
}
```

### 6. GET /api/artworks/search?q=

ค้นหาผลงานจาก `title` หรือ `artist` (ไม่สนตัวพิมพ์เล็ก/ใหญ่)

**ตัวอย่าง Request:** `GET /api/artworks/search?q=van gogh`

**ตัวอย่าง Response (200 OK):**
```json
{
  "success": true,
  "total": 1,
  "data": [
    {
      "id": 1,
      "title": "The Starry Night",
      "artist": "Vincent van Gogh",
      "year": 1889,
      "category": "Painting",
      "description": "A famous painting depicting a night sky full of swirling stars over a small village.",
      "image": "https://example.com/starry-night.jpg"
    }
  ]
}
```

**ถ้าไม่ระบุ q (400 Bad Request):**
```json
{
  "success": false,
  "message": "กรุณาระบุคำค้นหาผ่าน query parameter 'q'"
}
```

### 7. GET /api/artworks/category/:category

แสดงผลงานตาม category (ไม่สนตัวพิมพ์เล็ก/ใหญ่)

**ตัวอย่าง Request:** `GET /api/artworks/category/Painting`

**ตัวอย่าง Response (200 OK):**
```json
{
  "success": true,
  "total": 3,
  "data": [
    { "id": 1, "title": "The Starry Night", "artist": "Vincent van Gogh", "category": "Painting", "...": "..." }
  ]
}
```

---

## วิธีทดสอบด้วย Postman

1. เปิดโปรแกรม Postman แล้วสร้าง Collection ใหม่ชื่อ `Art Gallery API`
2. ตั้งค่า Base URL เป็น `http://localhost:3000` (ต้องรันเซิร์ฟเวอร์ด้วย `npm start` ก่อน)
3. สร้าง Request ตามตารางด้านล่าง:

| ชื่อ Request | Method | URL |
|---|---|---|
| Get All Artworks | GET | `http://localhost:3000/api/artworks` |
| Get Artwork By Id | GET | `http://localhost:3000/api/artworks/1` |
| Search Artworks | GET | `http://localhost:3000/api/artworks/search?q=starry` |
| Get By Category | GET | `http://localhost:3000/api/artworks/category/Painting` |
| Create Artwork | POST | `http://localhost:3000/api/artworks` |
| Update Artwork | PUT | `http://localhost:3000/api/artworks/1` |
| Delete Artwork | DELETE | `http://localhost:3000/api/artworks/1` |

4. สำหรับ **POST** และ **PUT**:
   - ไปที่แท็บ **Body** → เลือก **raw** → เลือกประเภทเป็น **JSON**
   - วาง JSON ตัวอย่าง เช่น:
     ```json
     {
       "title": "Mona Lisa",
       "artist": "Leonardo da Vinci",
       "year": 1503,
       "category": "Painting",
       "description": "A half-length portrait painting.",
       "image": "https://example.com/mona-lisa.jpg"
     }
     ```
5. กด **Send** แล้วดูผลลัพธ์ที่ส่วน Response ด้านล่าง ตรวจสอบทั้ง status code (200, 201, 204, 400, 404) และ body ที่ได้กลับมา

## หมายเหตุ

- ข้อมูลจะถูกบันทึกลงไฟล์ `data/artworks.json` จริง ๆ เมื่อมีการเพิ่ม/แก้ไข/ลบ ดังนั้นข้อมูลจะยังอยู่แม้ปิด-เปิดเซิร์ฟเวอร์ใหม่
- โปรเจกต์นี้ยังไม่มีระบบ Authentication, User, Favorite หรือฟีเจอร์อื่นนอกเหนือจาก 7 endpoint ที่ระบุไว้ด้านบน
