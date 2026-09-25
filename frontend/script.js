// ========================================
// API Base URL
// ========================================
// ใช้ path แบบ relative (สตริงว่าง) แทนการ hardcode "http://localhost:3000"
// เพราะหลังแก้ server.js ให้ serve ทั้ง frontend และ API จากโดเมนเดียวกันแล้ว
// (ไม่ว่าจะรัน local ที่ http://localhost:3000 หรือ deploy จริงบน Vercel
// ที่โดเมนเช่น https://your-app.vercel.app) การอ้างอิง path แบบ relative
// เช่น `${API_BASE_URL}/api/artworks` จะกลายเป็น "/api/artworks" เสมอ
// และยิง request ไปที่โดเมนเดียวกับที่หน้าเว็บถูกโหลดมาโดยอัตโนมัติ
const API_BASE_URL = "";

// SVG placeholder ที่ฝังในหน้าเว็บเอง (แทน via.placeholder.com ที่เลิกให้บริการแล้ว)
// ใช้ตอน src รูปจริงโหลดไม่สำเร็จ (onerror)
const FALLBACK_IMAGE_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600">' +
    '<rect width="100%" height="100%" fill="#e4ddcd"/>' +
    '<text x="50%" y="50%" font-family="sans-serif" font-size="24" fill="#857a63" ' +
    'text-anchor="middle" dominant-baseline="middle">Image not found</text></svg>';
const FALLBACK_IMAGE = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(FALLBACK_IMAGE_SVG);

// ผลงานจริงจาก Met API บางชิ้นไม่มีชื่อศิลปิน (ของโบราณ/ไม่ทราบผู้สร้าง) หรือมีปีเป็น
// ค่าติดลบ (แปลว่า "ก่อนคริสตกาล" เช่น -700 = 700 ปีก่อนคริสตกาล) ซึ่งเป็นข้อมูลจริง
// ไม่ใช่บั๊ก แต่ต้อง format ให้อ่านง่ายแทนที่จะโชว์ตัวเลขดิบ ๆ หรือค่าว่าง
function formatArtist(artist) {
    return artist && String(artist).trim() ? artist : "Unknown Artist";
}

function formatYear(year) {
    if (year === null || year === undefined || year === "") {
        return "Year unknown";
    }
    const numericYear = Number(year);
    if (Number.isNaN(numericYear)) {
        return year;
    }
    return numericYear < 0 ? `${Math.abs(numericYear)} BCE` : `${numericYear}`;
}

const sortSelect =
    document.getElementById("sortSelect");

const recentlyViewed = [];

const backButton =
    document.getElementById("backButton");


backButton.addEventListener(
    "click",
    goBackArtwork
);

// ========================================
// DOM Elements
// ========================================

const artworkContainer =
document.getElementById("artworkContainer");

const resultCount =
document.getElementById("resultCount");

const searchInput =
document.getElementById("searchInput");

const searchButton =
document.getElementById("searchButton");

const categoryFilter =
document.getElementById("categoryFilter");

const detailModal =
document.getElementById("detailModal");

const closeModal =
document.getElementById("closeModal");

const addToQueueButton =
document.getElementById("addToQueueButton");

let currentDetailArtwork = null;
let currentArtworks = [];
let originalArtworks = [];
const artworkQueue = [];

function sortArtworks(artworks, sortBy = "title", direction = "asc") {

    const sortedArtworks = [...(artworks || [])];

    if (sortBy === "default") {
        return sortedArtworks;
    }

    const sortOptions = {
        "title-asc": ["title", "asc"],
        "title-desc": ["title", "desc"],
        "year-asc": ["year", "asc"],
        "year-desc": ["year", "desc"]
    };

    if (sortOptions[sortBy]) {
        [sortBy, direction] = sortOptions[sortBy];
    }

    const multiplier = direction === "desc" ? -1 : 1;

    // เทียบผลงาน 2 ชิ้นตาม field ที่เลือก (title หรือ year)
    // คืนค่า: ติดลบ = firstArtwork ควรมาก่อน, บวก = secondArtwork ควรมาก่อน, ศูนย์ = เท่ากัน
    function compareArtworks(firstArtwork, secondArtwork) {

        const firstValue = firstArtwork[sortBy];
        const secondValue = secondArtwork[sortBy];

        if (sortBy === "year") {
            return (Number(firstValue || 0) - Number(secondValue || 0)) * multiplier;
        }

        return String(firstValue || "").localeCompare(
            String(secondValue || ""),
            undefined,
            { sensitivity: "base" }
        ) * multiplier;

    }

    return selectionSort(sortedArtworks, compareArtworks);

}

// ========================================
// Selection Sort — เขียน logic เอง ไม่ใช้ Array.prototype.sort()
// ========================================
// แนวคิด: วนหาตัวที่ "ควรอยู่หน้าสุด" ในส่วนที่ยังไม่ได้เรียงทีละรอบ
// แล้วสลับ (swap) มาไว้ตำแหน่งปัจจุบัน ทำซ้ำจนครบทุกตำแหน่ง
// ความซับซ้อน O(n^2) เหมาะกับข้อมูลจำนวนไม่มาก เช่น ผลงานศิลปะไม่กี่สิบชิ้นในหน้านี้
function selectionSort(arr, compareFn) {

    const result = [...arr];

    for (let i = 0; i < result.length - 1; i++) {

        // สมมติว่าตำแหน่ง i คือตัวที่ควรอยู่หน้าสุดในส่วนที่เหลือไปก่อน
        let targetIndex = i;

        // วนหาตัวที่ "ควรมาก่อน" targetIndex จริง ๆ ในส่วนที่ยังไม่ได้เรียง
        for (let j = i + 1; j < result.length; j++) {
            if (compareFn(result[j], result[targetIndex]) < 0) {
                targetIndex = j;
            }
        }

        // ถ้าเจอตัวที่ควรมาก่อนมากกว่า ให้สลับตำแหน่งกัน
        if (targetIndex !== i) {
            [result[i], result[targetIndex]] = [result[targetIndex], result[i]];
        }

    }

    return result;


}

function enqueueArtwork(artwork) {

    if (!artwork || artworkQueue.some(item => item.id === artwork.id)) {
        return artworkQueue.length;
    }

    artworkQueue.push(artwork);
    return artworkQueue.length;

}

function dequeueArtwork() {
    return artworkQueue.shift() || null;
}

function peekArtworkQueue() {
    return artworkQueue[0] || null;
}


function displayQueue() {

    const queueContainer = document.getElementById("queueContainer");

    if (!queueContainer) {
        return;
    }

    queueContainer.innerHTML = "";

    if (artworkQueue.length === 0) {
        queueContainer.innerHTML = "<p>No artworks in queue.</p>";
        return;
    }

    artworkQueue.forEach((artwork, index) => {
        const item = document.createElement("div");
        item.className = "queue-item";
        item.textContent = `${index + 1}. ${artwork.title}`;
        queueContainer.appendChild(item);
    });

}

function addToQueue(artwork) {

    enqueueArtwork(artwork);
    displayQueue();

}

function viewNextArtwork() {

    const nextArtwork = dequeueArtwork();

    if (!nextArtwork) {
        alert("Queue is empty.");
        return;
    }

    displayQueue();
    showArtworkDetail(nextArtwork.id);

}

// ========================================
// Recently Viewed History
// ========================================

function pushHistory(artwork) {
    recentlyViewed.push(artwork);
    return recentlyViewed.length;
}

function popHistory() {
    return recentlyViewed.pop() || null;
}

function peekHistory() {
    return recentlyViewed[recentlyViewed.length - 1] || null;
}

function addToHistory(artwork) {

    pushHistory(artwork);

    displayHistory();

}

function displayHistory() {

    const historyContainer =
        document.getElementById("historyContainer");

    historyContainer.innerHTML = "";


    if (recentlyViewed.length === 0) {

        historyContainer.innerHTML =
            `<p>No recently viewed artworks.</p>`;

        return;

    }


    // แสดงจากล่าสุดไปเก่าสุด
    const history =
        [...recentlyViewed].reverse();


    history.forEach((artwork, index) => {

        const item =
            document.createElement("div");

        item.className = "history-item";

        item.innerHTML = `
            <span>
                ${index + 1}. ${artwork.title}
            </span>
        `;

        historyContainer.appendChild(item);

    });

    

}

function goBackArtwork() {

    if (recentlyViewed.length <= 1) {

        alert("No previous artwork.");

        return;

    }


    // เอา Artwork ปัจจุบันออกจาก Stack
    popHistory();


    // ดู Artwork ก่อนหน้า
    const previousArtwork =
        peekHistory();


    displayHistory();


    renderArtworkDetail(previousArtwork.id).catch(handleArtworkDetailError);

}

// ========================================
// Sort Listener
// ========================================

sortSelect.addEventListener(
    "change",
    function () {

        const artworksToSort =
            sortSelect.value === "default"
                ? originalArtworks
                : currentArtworks;

        const sortedArtworks = sortArtworks(
            artworksToSort,
            sortSelect.value
        );

        displayArtworks(sortedArtworks);

    }
);

// ========================================
// Get All Artworks
// ========================================

async function fetchArtworks() {

try {

    artworkContainer.innerHTML =
        `<p class="message">Loading artworks...</p>`;

    const response = await fetch(
        `${API_BASE_URL}/api/artworks`
    );

    if (!response.ok) {
        throw new Error("Cannot fetch artworks");
    }

    const data = await response.json();

    /*
     * API บางโปรเจกต์อาจส่งกลับมาเป็น array โดยตรง
     * หรือส่งกลับมาในรูป { data: [...] }
     */

    const artworks =
        Array.isArray(data)
            ? data
            : data.data;

    originalArtworks = [...(artworks || [])];
    currentArtworks = artworks || [];

    displayArtworks(artworks);

    createCategoryOptions(artworks);

} catch (error) {

    console.error(error);

    artworkContainer.innerHTML =
        `<p class="message">
            Cannot connect to the Art Gallery API.
        </p>`;

    resultCount.textContent = "Error";

}

}

// ========================================
// Display Artworks
// ========================================

function displayArtworks(artworks) {

artworkContainer.innerHTML = "";
currentArtworks = artworks || [];

if (!artworks || artworks.length === 0) {

    artworkContainer.innerHTML =
        `<p class="message">
            No artworks found.
        </p>`;

    resultCount.textContent =
        "0 artworks";

    return;
}


resultCount.textContent =
    `${artworks.length} artworks`;


artworks.forEach(artwork => {

    const card =
        document.createElement("div");

    card.className = "card";


    card.innerHTML = `

        <img
            class="card-image"
            src="${artwork.image}"
            alt="${artwork.title}"
            onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}'"
        >

        <div class="card-info">

            <span class="card-category">
                ${artwork.category}
            </span>

            <h3 class="card-title">
                ${artwork.title}
            </h3>

            <p class="card-artist">
                ${formatArtist(artwork.artist)}
            </p>

            <p class="card-year">
                ${formatYear(artwork.year)}
            </p>

            <button
                class="detail-button"
                data-artwork-id="${artwork.id}"
            >
                View Details
            </button>

        </div>
    `;


    artworkContainer.appendChild(card);

    card.querySelector(".detail-button").addEventListener(
        "click",
        () => showArtworkDetail(artwork.id)
    );

});

}

// ========================================
// Create Category Options
// ========================================

function createCategoryOptions(artworks) {

const categories = [];

artworks.forEach(artwork => {

    if (!categories.includes(artwork.category)) {

        categories.push(artwork.category);

    }

});


categoryFilter.innerHTML = `
    <option value="all">
        All Categories
    </option>
`;


categories.forEach(category => {

    const option =
        document.createElement("option");

    option.value = category;

    option.textContent = category;

    categoryFilter.appendChild(option);

});

}

// ========================================
// Search Artwork
// ========================================

async function searchArtworks() {

const keyword =
    searchInput.value.trim();


// ถ้าไม่มีคำค้นหา ให้แสดงทั้งหมด
if (keyword === "") {

    fetchArtworks();

    return;

}


try {

    artworkContainer.innerHTML =
        `<p class="message">
            Searching...
        </p>`;


    const response = await fetch(
        `${API_BASE_URL}/api/artworks/search?q=${encodeURIComponent(keyword)}`
    );


    if (!response.ok) {
        throw new Error("Search failed");
    }


    const data =
        await response.json();


    const artworks =
        Array.isArray(data)
            ? data
            : data.data;

    originalArtworks = [...(artworks || [])];
    displayArtworks(artworks);

} catch (error) {

    console.error(error);

    artworkContainer.innerHTML =
        `<p class="message">
            Search failed.
        </p>`;

}

}

// ========================================
// Filter Category
// ========================================

async function filterByCategory() {

const category =
    categoryFilter.value;


// ถ้าเลือก All Categories
if (category === "all") {

    fetchArtworks();

    return;

}


try {

    artworkContainer.innerHTML =
        `<p class="message">
            Loading category...
        </p>`;


    const response = await fetch(
        `${API_BASE_URL}/api/artworks/category/${encodeURIComponent(category)}`
    );


    if (!response.ok) {
        throw new Error("Category filter failed");
    }


    const data =
        await response.json();


    const artworks =
        Array.isArray(data)
            ? data
            : data.data;

    originalArtworks = [...(artworks || [])];
    displayArtworks(artworks);


} catch (error) {

    console.error(error);

    artworkContainer.innerHTML =
        `<p class="message">
            Cannot load this category.
        </p>`;

}

}

// ========================================
// Get Artwork Detail
// ========================================

async function renderArtworkDetail(id) {

    detailModal.classList.remove("hidden");
    document.body.classList.add("modal-open");
    document.getElementById("detailTitle").textContent = "Loading...";

    const response = await fetch(
        `${API_BASE_URL}/api/artworks/${id}`
    );


    if (!response.ok) {
        throw new Error("Artwork not found");
    }


    const data =
        await response.json();


    const artwork =
        data.data || data;

    currentDetailArtwork = artwork;

    // ใส่ข้อมูลลงใน Modal

    document.getElementById("detailImage").src =
        artwork.image;

    document.getElementById("detailImage").alt =
        artwork.title;


    document.getElementById("detailCategory").textContent =
        artwork.category;


    document.getElementById("detailTitle").textContent =
        artwork.title;


    document.getElementById("detailArtist").textContent =
        formatArtist(artwork.artist);


    document.getElementById("detailYear").textContent =
        formatYear(artwork.year);


    document.getElementById("detailDescription").textContent =
        artwork.description;

    return artwork;

}

async function showArtworkDetail(id) {

try {

    const artwork = await renderArtworkDetail(id);
    addToHistory(artwork);

} catch (error) {

    handleArtworkDetailError(error);

}

}

function handleArtworkDetailError(error) {

    console.error(error);

    closeArtworkDetail();

    alert("Cannot load artwork details.");

}

            
// ========================================
// Close Modal
// ========================================

function closeArtworkDetail() {

detailModal.classList.add("hidden");
document.body.classList.remove("modal-open");

}

// ========================================
// Event Listeners
// ========================================

searchButton.addEventListener(
"click",
searchArtworks
);

searchInput.addEventListener(
"keydown",
function(event) {

    if (event.key === "Enter") {

        searchArtworks();

    }

}

);

categoryFilter.addEventListener(
"change",
filterByCategory
);

closeModal.addEventListener(
"click",
closeArtworkDetail
);

addToQueueButton.addEventListener(
"click",
function() {

    if (!currentDetailArtwork) {
        alert("Please open an artwork first.");
        return;
    }

    addToQueue(currentDetailArtwork);

}
);

document.addEventListener(
"keydown",
function(event) {

    if (event.key === "Escape" && !detailModal.classList.contains("hidden")) {

        closeArtworkDetail();

    }

}
);

// คลิกพื้นที่ด้านนอก Modal เพื่อปิด

detailModal.addEventListener(
"click",
function(event) {

    if (event.target === detailModal) {

        closeArtworkDetail();

    }

    

}
);

const viewNextButton =
    document.getElementById("viewNextButton");


viewNextButton.addEventListener(
    "click",
    viewNextArtwork
);



// ========================================
// Start Application
// ========================================

fetchArtworks();
