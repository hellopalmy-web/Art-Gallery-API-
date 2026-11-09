import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, Route, Routes } from "react-router-dom";
import GraphNav, { Breadcrumb } from "./components/GraphNav.jsx";
import BackgroundFX from "./components/BackgroundFX.jsx";
import { Queue } from "./dsa/Queue.js";
import { Stack } from "./dsa/Stack.js";
import { getLegacyTieRanks, mergeSort } from "./dsa/sort.js";
import { pagePath } from "./Graph.js";
import "../searchUtils.js";

const fallbackImage = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><rect width="100%" height="100%" fill="#e4ddcd"/><text x="50%" y="50%" font-family="sans-serif" font-size="24" fill="#857a63" text-anchor="middle" dominant-baseline="middle">Image not found</text></svg>')}`;

const copy = {
    en: {
        subtitle: "A little inspiration, from every era.", collection: "Collection", visit: "Your visit",
        home: "Home",
        pageOf: "Page", pagination: "Artwork pagination", previousPage: "Previous page", nextPage: "Next page",
        heroEyebrow: "ART, HISTORY & DISCOVERY", heroTitle: "Find a piece that speaks to you.",
        heroDescription: "Explore remarkable objects, the people who made them, and the stories that connect us across time.",
        heroLink: "Explore the collection", collectionEyebrow: "TAKE YOUR TIME", collectionTitle: "The collection",
        collectionNote: "Search, browse, and follow your curiosity.", searchLabel: "Search artworks, artists, years, or countries",
        searchPlaceholder: "Search artwork, artist, year, or country...", searchButton: "Search", category: "Category",
        allCategories: "All categories", sort: "Sort by", titleAsc: "Title: A to Z", titleDesc: "Title: Z to A",
        yearAsc: "Year: Old to new", yearDesc: "Year: New to old", onView: "ON VIEW", artworks: "Artworks",
        artist: "Artist", year: "Year", details: "View details", addQueue: "Add to viewing queue", added: "Added to your viewing queue",
        duplicate: "Already in your viewing queue", previous: "Previous", next: "Next", close: "Close artwork details",
        historyEyebrow: "PICK UP WHERE YOU LEFT OFF", history: "Recently viewed", back: "Back",
        queueEyebrow: "SAVE FOR LATER", queue: "Viewing queue", viewNext: "View next",
        favoritesEyebrow: "KEEP CLOSE", favorites: "Favorites", clearAll: "Clear all", noFavorites: "No favorite artworks yet.",
        noHistory: "No recently viewed artworks.", noQueue: "No artworks in queue.", noResults: "No artworks found.",
        emptyHistoryHint: "Open an artwork in the Collection to start your visit history.",
        emptyQueueHint: "Open an artwork in the Collection and choose Add to viewing queue.",
        emptyFavoritesHint: "Open an artwork in the Collection and select the heart to save it here.",
        loading: "Loading artworks...", loadError: "We couldn’t load the collection.", retry: "Try again",
        remove: "Remove", addFavorite: "Add to favorites", removeFavorite: "Remove from favorites",
        favoriteAdded: "Added to favorites", favoriteRemoved: "Removed from favorites", scrollTop: "Scroll to top",
        titleMatch: "Title match", artistMatch: "Artist match", yearMatch: "Year match", countryMatch: "Country match", unknownArtist: "Unknown Artist",
        languageSwitch: "Switch language", emptyQueue: "Your viewing queue is empty.", footer: "Made for curious minds."
    },
    th: {
        subtitle: "แรงบันดาลใจเล็ก ๆ จากทุกยุคสมัย", collection: "คอลเลกชัน", visit: "การเข้าชม",
        home: "หน้าแรก",
        pageOf: "หน้า", pagination: "เปลี่ยนหน้าผลงาน", previousPage: "หน้าก่อน", nextPage: "หน้าถัดไป",
        heroEyebrow: "ศิลปะ ประวัติศาสตร์ และการค้นพบ", heroTitle: "ค้นพบผลงานที่เชื่อมโยงกับคุณ",
        heroDescription: "สำรวจผลงานโดดเด่น เรื่องราวของผู้สร้าง และความเชื่อมโยงที่ทอดผ่านกาลเวลา",
        heroLink: "สำรวจคอลเลกชัน", collectionEyebrow: "ค่อย ๆ ใช้เวลากับศิลปะ", collectionTitle: "คอลเลกชัน",
        collectionNote: "ค้นหา เลือกชม และตามความอยากรู้อยากเห็นของคุณ", searchLabel: "ค้นหาผลงาน ศิลปิน ปี หรือประเทศ",
        searchPlaceholder: "ค้นหาชื่อผลงาน ศิลปิน ปี หรือประเทศ...", searchButton: "ค้นหา", category: "หมวดหมู่",
        allCategories: "ทุกหมวดหมู่", sort: "เรียงตาม", titleAsc: "ชื่อ: A ถึง Z", titleDesc: "ชื่อ: Z ถึง A",
        yearAsc: "ปี: เก่าไปใหม่", yearDesc: "ปี: ใหม่ไปเก่า", onView: "กำลังจัดแสดง", artworks: "ผลงานศิลปะ",
        artist: "ศิลปิน", year: "ปี", details: "ดูรายละเอียด", addQueue: "เพิ่มเข้าคิวเข้าชม", added: "เพิ่มแล้ว",
        duplicate: "มีอยู่ในคิวแล้ว", previous: "ก่อนหน้า", next: "ถัดไป", close: "ปิดรายละเอียดผลงาน",
        historyEyebrow: "กลับไปชมผลงานที่ดูล่าสุด", history: "ดูล่าสุด", back: "ย้อนกลับ",
        queueEyebrow: "บันทึกไว้ดูภายหลัง", queue: "คิวเข้าชม", viewNext: "ดูชิ้นถัดไป",
        favoritesEyebrow: "เก็บผลงานที่ชอบไว้", favorites: "รายการโปรด", clearAll: "ล้างทั้งหมด", noFavorites: "ยังไม่มีผลงานในรายการโปรด",
        noHistory: "ยังไม่มีผลงานที่ดูล่าสุด", noQueue: "ยังไม่มีผลงานในคิว", noResults: "ไม่พบผลงานศิลปะ",
        emptyHistoryHint: "เปิดชมผลงานจากคอลเลกชันเพื่อเริ่มบันทึกประวัติการเข้าชม",
        emptyQueueHint: "เปิดผลงานในคอลเลกชัน แล้วเลือกเพิ่มเข้าคิวเข้าชม",
        emptyFavoritesHint: "เปิดผลงานในคอลเลกชัน แล้วกดหัวใจเพื่อบันทึกไว้ที่นี่",
        loading: "กำลังโหลดผลงาน...", loadError: "โหลดคอลเลกชันไม่สำเร็จ", retry: "ลองอีกครั้ง",
        remove: "ลบออก", addFavorite: "เพิ่มในรายการโปรด", removeFavorite: "นำออกจากรายการโปรด",
        favoriteAdded: "เพิ่มในรายการโปรดแล้ว", favoriteRemoved: "นำออกจากรายการโปรดแล้ว", scrollTop: "เลื่อนกลับขึ้นด้านบน",
        titleMatch: "ตรงกับชื่อผลงาน", artistMatch: "ตรงกับชื่อศิลปิน", yearMatch: "ตรงกับปี", countryMatch: "ตรงกับประเทศ", unknownArtist: "ไม่ทราบชื่อศิลปิน",
        languageSwitch: "สลับภาษา", emptyQueue: "ไม่มีผลงานในคิวเข้าชมแล้ว", footer: "สร้างขึ้นเพื่อผู้ใฝ่รู้"
    }
};

function formatYear(year, language) {
    if (year === null || year === undefined || year === "") return language === "th" ? "ไม่ทราบปี" : "Year unknown";
    const numericYear = Number(year);
    if (Number.isNaN(numericYear)) return year;
    if (numericYear >= 0) return String(numericYear);
    return `${Math.abs(numericYear)} ${language === "th" ? "ปีก่อนคริสตกาล" : "BCE"}`;
}

function getStoredFavorites() {
    try {
        const stored = JSON.parse(localStorage.getItem("artGalleryFavorites") || "[]");
        return Array.isArray(stored) ? stored : [];
    } catch {
        return [];
    }
}

function getStoredList(key) {
    try {
        const stored = JSON.parse(localStorage.getItem(key) || "[]");
        return Array.isArray(stored) ? stored : [];
    } catch {
        return [];
    }
}

function shouldShowIntro() {
    return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function App() {
    const recentlyViewedStackRef = useRef(null);
    const viewingQueueRef = useRef(null);
    if (recentlyViewedStackRef.current === null) {
        recentlyViewedStackRef.current = new Stack(getStoredList("artGalleryRecentlyViewed"), 40);
    }
    if (viewingQueueRef.current === null) {
        viewingQueueRef.current = new Queue();
        getStoredList("artGalleryViewingQueue").forEach((artwork) => viewingQueueRef.current.enqueue(artwork));
    }

    const [artworks, setArtworks] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [sortOrder, setSortOrder] = useState("title-asc");
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [recentlyViewed, setRecentlyViewed] = useState(() => recentlyViewedStackRef.current.toArray());
    const [viewingQueue, setViewingQueue] = useState(() => viewingQueueRef.current.toArray());
    const [favorites, setFavorites] = useState(getStoredFavorites);
    const [language, setLanguage] = useState(() => localStorage.getItem("artGalleryLanguage") === "th" ? "th" : "en");
    const [selectedArtwork, setSelectedArtwork] = useState(null);
    const [selectedArtworkId, setSelectedArtworkId] = useState(null);
    const [suggestionsOpen, setSuggestionsOpen] = useState(false);
    const [searchFocused, setSearchFocused] = useState(false);
    const [toast, setToast] = useState(null);
    const [reloadKey, setReloadKey] = useState(0);
    const [modalSource, setModalSource] = useState("collection");
    const [modalIndex, setModalIndex] = useState(-1);
    const [queueSequence, setQueueSequence] = useState([]);
    const [highlightedArtworkId, setHighlightedArtworkId] = useState(null);
    const [scrollY, setScrollY] = useState(0);
    const [introPhase, setIntroPhase] = useState(() => shouldShowIntro() ? "loading" : "done");
    const [introProgress, setIntroProgress] = useState(0);
    const [heroRevealed, setHeroRevealed] = useState(() => !shouldShowIntro());
    const favoriteIds = useMemo(() => new Set(favorites.map((artwork) => String(artwork.id))), [favorites]);
    const hasLoaded = useRef(false);
    const cardRefs = useRef(new Map());
    const highlightTimer = useRef(null);
    const toastTimer = useRef(null);
    const t = (key) => copy[language][key] || copy.en[key] || key;

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);

        async function loadCollection() {
            let retryCount = 0;
            const waitForRetry = () => new Promise((resolve) => window.setTimeout(resolve, 500));

            while (!cancelled) {
                try {
                    const response = await fetch("/api/artworks");
                    if (response.status === 503) {
                        const status = await response.json().catch(() => null);
                        if (status?.loading && retryCount < 240) {
                            retryCount += 1;
                            await waitForRetry();
                            continue;
                        }
                    }
                    if (!response.ok) throw new Error(`Request failed (${response.status})`);

                    const payload = await response.json();
                    const items = Array.isArray(payload) ? payload : payload.data;
                    if (!Array.isArray(items)) throw new Error("Invalid artwork response");
                    setArtworks(items);
                    hasLoaded.current = true;
                    setLoading(false);
                    return;
                } catch (fetchError) {
                    if (cancelled) return;
                    if (fetchError instanceof TypeError && retryCount < 40) {
                        retryCount += 1;
                        await waitForRetry();
                        continue;
                    }
                    setError(fetchError.message || t("loadError"));
                    hasLoaded.current = true;
                    setLoading(false);
                    return;
                }
            }
        }

        loadCollection();

        return () => { cancelled = true; };
    }, [reloadKey]);

    useEffect(() => {
        if (!hasLoaded.current) return undefined;
        setLoading(true);
        const timer = window.setTimeout(() => setLoading(false), 120);
        return () => window.clearTimeout(timer);
    }, [searchQuery, selectedCategory, sortOrder]);

    useEffect(() => {
        localStorage.setItem("artGalleryFavorites", JSON.stringify(favorites));
    }, [favorites]);

    useEffect(() => {
        localStorage.setItem("artGalleryRecentlyViewed", JSON.stringify(recentlyViewed));
    }, [recentlyViewed]);

    useEffect(() => {
        localStorage.setItem("artGalleryViewingQueue", JSON.stringify(viewingQueue));
    }, [viewingQueue]);

    useEffect(() => {
        localStorage.setItem("artGalleryLanguage", language);
        document.documentElement.lang = language;
    }, [language]);

    useEffect(() => {
        document.body.classList.toggle("modal-open", Boolean(selectedArtwork));
        return () => document.body.classList.remove("modal-open");
    }, [selectedArtwork]);

    useEffect(() => {
        document.body.classList.toggle("search-focused", searchFocused);
        return () => document.body.classList.remove("search-focused");
    }, [searchFocused]);

    useEffect(() => {
        document.body.classList.toggle("intro-open", introPhase !== "done");
        return () => document.body.classList.remove("intro-open");
    }, [introPhase]);

    useEffect(() => {
        const onScroll = () => setScrollY(window.scrollY);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        if (introPhase === "done") return undefined;

        const duration = 950;
        const startedAt = performance.now();
        const progressTimer = window.setInterval(() => {
            const progress = Math.min(100, ((performance.now() - startedAt) / duration) * 100);
            setIntroProgress(Math.round(progress));
        }, 50);
        const exitTimer = window.setTimeout(() => setIntroPhase("exiting"), duration);
        const revealTimer = window.setTimeout(() => {
            window.clearInterval(progressTimer);
            setIntroProgress(100);
            setIntroPhase("done");
            setHeroRevealed(true);
        }, duration + 350);

        return () => {
            window.clearInterval(progressTimer);
            window.clearTimeout(exitTimer);
            window.clearTimeout(revealTimer);
        };
    }, []);

    useEffect(() => {
        if (!selectedArtworkId || loading) return undefined;
        const frame = window.requestAnimationFrame(() => {
            const card = cardRefs.current.get(String(selectedArtworkId));
            if (!card) return;
            card.scrollIntoView({ behavior: "smooth", block: "center" });
            setHighlightedArtworkId(String(selectedArtworkId));
            window.clearTimeout(highlightTimer.current);
            highlightTimer.current = window.setTimeout(() => setHighlightedArtworkId(null), 2800);
        });
        return () => window.cancelAnimationFrame(frame);
    }, [selectedArtworkId, loading, artworks]);

    useEffect(() => {
        if (!toast) return undefined;
        window.clearTimeout(toastTimer.current);
        toastTimer.current = window.setTimeout(() => setToast(null), 2200);
        return () => window.clearTimeout(toastTimer.current);
    }, [toast]);

    useEffect(() => {
        if (!selectedArtwork) return undefined;
        const onKeyDown = (event) => {
            if (event.key === "Escape") setSelectedArtwork(null);
            if (event.key === "ArrowLeft") navigateModal(-1);
            if (event.key === "ArrowRight") navigateModal(1);
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [selectedArtwork, modalIndex, modalSource, queueSequence, viewingQueue]);

    const filteredArtworks = useMemo(() => {
        const query = searchQuery.trim().toLocaleLowerCase();
        const base = selectedArtworkId ? artworks : artworks.filter((artwork) => {
            const matchesQuery = !query || [artwork.title, artwork.artist, artwork.category, artwork.year, artwork.country, artwork.culture, artwork.description]
                .some((value) => String(value ?? "").toLocaleLowerCase().includes(query));
            const matchesCategory = selectedCategory === "all" || String(artwork.category || "").toLocaleLowerCase() === selectedCategory.toLocaleLowerCase();
            return matchesQuery && matchesCategory;
        });

        const compareArtworks = (first, second) => {
            if (sortOrder.startsWith("year")) {
                const difference = Number(first.year || 0) - Number(second.year || 0);
                return sortOrder === "year-desc" ? -difference : difference;
            }
            const difference = String(first.title || "").localeCompare(String(second.title || ""), undefined, { sensitivity: "base" });
            return sortOrder === "title-desc" ? -difference : difference;
        };
        const legacyRanks = getLegacyTieRanks(base, compareArtworks);
        const decorated = base.map((artwork, index) => ({ artwork, index }));
        return mergeSort(decorated, (first, second) => {
            const order = compareArtworks(first.artwork, second.artwork);
            return order || legacyRanks.get(first.index) - legacyRanks.get(second.index);
        }).map(({ artwork }) => artwork);
    }, [artworks, searchQuery, selectedCategory, sortOrder, selectedArtworkId]);

    const pageSize = 12;
    const pageCount = Math.max(1, Math.ceil(filteredArtworks.length / pageSize));
    const paginatedArtworks = filteredArtworks.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedCategory, sortOrder, selectedArtworkId]);

    const categories = useMemo(() => [...new Set(artworks.map((artwork) => artwork.category).filter(Boolean))].sort(), [artworks]);
    const suggestions = useMemo(() => {
        if (!searchQuery.trim() || !window.ArtGallerySearchUtils) return [];
        return window.ArtGallerySearchUtils.getSearchSuggestions(artworks, searchQuery);
    }, [artworks, searchQuery]);

    function showToast(type, message) {
        setToast({ type, message, key: Date.now() });
    }

    function mutateRecentlyViewed(operation) {
        const stack = recentlyViewedStackRef.current;
        const result = operation(stack);
        setRecentlyViewed(stack.toArray());
        return result;
    }

    function mutateViewingQueue(operation) {
        const queue = viewingQueueRef.current;
        const result = operation(queue);
        setViewingQueue(queue.toArray());
        return result;
    }

    function addToRecentlyViewed(artwork) {
        mutateRecentlyViewed((stack) => {
            const withoutDuplicate = stack.toArray()
                .filter((item) => String(item.id) !== String(artwork.id));
            stack.clear();
            for (let index = withoutDuplicate.length - 1; index >= 0; index -= 1) {
                stack.push(withoutDuplicate[index]);
            }
            stack.push(artwork);
        });
    }

    function openArtwork(artwork, source = "collection") {
        setSelectedArtwork(artwork);
        setModalSource(source);
        if (source === "queue") {
            setQueueSequence([artwork]);
            setModalIndex(0);
        } else {
            setModalIndex(filteredArtworks.findIndex((item) => String(item.id) === String(artwork.id)));
            setQueueSequence([]);
        }
        addToRecentlyViewed(artwork);
    }

    function navigateModal(direction) {
        if (!selectedArtwork) return;
        if (modalSource === "queue") {
            const nextIndex = modalIndex + direction;
            if (nextIndex >= 0 && nextIndex < queueSequence.length) {
                setModalIndex(nextIndex);
                setSelectedArtwork(queueSequence[nextIndex]);
                addToRecentlyViewed(queueSequence[nextIndex]);
                return;
            }
            if (direction > 0 && !viewingQueueRef.current.isEmpty()) {
                const nextArtwork = mutateViewingQueue((queue) => queue.dequeue());
                const nextSequence = [...queueSequence, nextArtwork];
                setQueueSequence(nextSequence);
                setModalIndex(nextSequence.length - 1);
                setSelectedArtwork(nextArtwork);
                addToRecentlyViewed(nextArtwork);
            }
            return;
        }

        const nextIndex = modalIndex + direction;
        if (nextIndex < 0 || nextIndex >= filteredArtworks.length) return;
        const nextArtwork = filteredArtworks[nextIndex];
        setModalIndex(nextIndex);
        setSelectedArtwork(nextArtwork);
        addToRecentlyViewed(nextArtwork);
    }

    function viewNextFromQueue() {
        if (viewingQueueRef.current.isEmpty()) {
            showToast("error", t("emptyQueue"));
            return;
        }
        const first = mutateViewingQueue((queue) => queue.dequeue());
        openArtwork(first, "queue");
    }

    function goBackArtwork() {
        if (recentlyViewedStackRef.current.size() < 2) return;

        mutateRecentlyViewed((stack) => stack.pop());
        const previousArtwork = recentlyViewedStackRef.current.peek();
        setSelectedArtwork(previousArtwork);
        setModalSource("collection");
        setModalIndex(filteredArtworks.findIndex((item) => String(item.id) === String(previousArtwork.id)));
        setQueueSequence([]);
    }

    function handleQueueAdd(artwork) {
        if (viewingQueueRef.current.toArray().some((item) => String(item.id) === String(artwork.id))) {
            showToast("error", t("duplicate"));
            return;
        }
        mutateViewingQueue((queue) => queue.enqueue(artwork));
        showToast("success", t("added"));
    }

    function toggleFavorite(artwork) {
        const exists = favoriteIds.has(String(artwork.id));
        setFavorites((current) => exists
            ? current.filter((item) => String(item.id) !== String(artwork.id))
            : [...current, artwork]);
        showToast("success", t(exists ? "favoriteRemoved" : "favoriteAdded"));
    }

    function selectSuggestion(suggestion) {
        setSuggestionsOpen(false);
        setSearchFocused(false);
        setSelectedCategory("all");
        setSelectedArtworkId(String(suggestion.id));
    }

    function handleSearchSubmit(event) {
        event.preventDefault();
        setSuggestionsOpen(false);
        setSearchFocused(false);
        setSelectedArtworkId(null);
    }

    const isFavorite = (id) => favoriteIds.has(String(id));

    return (
        <div className="app-shell">
            <BackgroundFX />
            {introPhase !== "done" && (
                <div className={`splash-screen splash-${introPhase}`} aria-hidden={introPhase === "exiting"}>
                    <div className="splash-star-field" aria-hidden="true" />
                    <div className="splash-content">
                        <div className="splash-mark" aria-hidden="true"><span>A</span><span>G</span></div>
                        <div className="splash-progress-track" role="progressbar" aria-label={language === "th" ? "กำลังโหลดแกลเลอรี" : "Loading gallery"} aria-valuemin="0" aria-valuemax="100" aria-valuenow={introProgress}>
                            <span className="splash-progress-fill" />
                        </div>
                    </div>
                </div>
            )}

            <header className="header">
                <div className="header-inner">
                    <Link className="logo" to={pagePath("home")} aria-label="Art Gallery home">ART<span>GALLERY</span></Link>
                    <p className="subtitle">{t("subtitle")}</p>
                    <GraphNav language={language} className="site-nav" />
                    <button className="language-toggle" type="button" aria-label={t("languageSwitch")} onClick={() => setLanguage((current) => current === "en" ? "th" : "en")}>
                        {language === "en" ? "ไทย" : "English"}
                    </button>
                </div>
            </header>

            <Breadcrumb language={language} />

            <main className="container app-main">
                <Routes>
                    <Route path={pagePath("home")} element={
                        <section className="hero" aria-labelledby="heroTitle">
                            <div className="hero-atmosphere" aria-hidden="true">
                                <span className="hero-star-layer hero-stars-distant" />
                                <span className="hero-star-layer hero-stars-near" />
                                <span className="light-speck light-speck-one" />
                                <span className="light-speck light-speck-two" />
                                <span className="light-speck light-speck-three" />
                                <span className="light-speck light-speck-four" />
                            </div>
                            <div className="hero-content">
                                <div className={`hero-copy${heroRevealed ? " hero-revealed" : " hero-awaiting-reveal"}`}>
                                    <p className="small-title">{t("heroEyebrow")}</p>
                                    <h1 id="heroTitle">{t("heroTitle")}</h1>
                                    <p>{t("heroDescription")}</p>
                                    <Link className="hero-link" to={pagePath("collection")}>{t("heroLink")} <span aria-hidden="true">↓</span></Link>
                                </div>
                                <div className="hero-art" aria-hidden="true">
                                    <span className="hero-art-frame" />
                                    <span className="hero-art-mark">A<br />G</span>
                                    <span className="hero-art-caption">A WORLD OF ART<br />AT YOUR FINGERTIPS</span>
                                </div>
                            </div>
                        </section>
                    } />

                    <Route path={pagePath("collection")} element={
                        <section className="collection-section" aria-labelledby="collectionTitle">
                    <div className="collection-intro">
                        <div><p className="eyebrow">{t("collectionEyebrow")}</p><h2 id="collectionTitle">{t("collectionTitle")}</h2></div>
                        <p className="collection-note">{t("collectionNote")}</p>
                    </div>

                    <form className="controls" role="search" onSubmit={handleSearchSubmit}>
                        <div className="search-wrapper">
                            <div className="search-box">
                                <label className="sr-only" htmlFor="searchInput">{t("searchLabel")}</label>
                                <span className="search-icon" aria-hidden="true">⌕</span>
                                <input
                                    id="searchInput"
                                    type="search"
                                    value={searchQuery}
                                    placeholder={t("searchPlaceholder")}
                                    autoComplete="off"
                                    onFocus={() => { setSearchFocused(true); setSuggestionsOpen(true); }}
                                    onBlur={() => setSearchFocused(false)}
                                    onChange={(event) => { setSearchQuery(event.target.value); setSelectedArtworkId(null); setSuggestionsOpen(true); }}
                                    aria-expanded={suggestionsOpen && suggestions.length > 0}
                                    aria-controls="searchSuggestions"
                                />
                                <button type="submit">{t("searchButton")}</button>
                            </div>
                            {suggestionsOpen && suggestions.length > 0 && (
                                <div id="searchSuggestions" className="search-suggestions" role="listbox">
                                    {suggestions.map((suggestion) => (
                                        <button className="suggestion-item" type="button" role="option" key={suggestion.id} data-artwork-id={suggestion.id} onMouseDown={(event) => event.preventDefault()} onClick={() => selectSuggestion(suggestion)}>
                                            <img className="suggestion-thumb" src={suggestion.image || fallbackImage} alt="" />
                                            <span className="suggestion-copy">
                                                <span className="suggestion-main">{suggestion.title}</span>
                                                <span className="suggestion-meta">{t(suggestion.kind === "artist" ? "artistMatch" : suggestion.kind === "year" ? "yearMatch" : suggestion.kind === "country" ? "countryMatch" : "titleMatch")} · {suggestion.artist || t("unknownArtist")} {suggestion.year ? `· ${suggestion.year}` : ""}</span>
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="filter-box">
                            <label htmlFor="categoryFilter">{t("category")}</label>
                            <select id="categoryFilter" value={selectedCategory} onChange={(event) => { setSelectedCategory(event.target.value); setSelectedArtworkId(null); }}>
                                <option value="all">{t("allCategories")}</option>
                                {categories.map((category) => <option value={category} key={category}>{category}</option>)}
                            </select>
                        </div>

                        <div className="sort-box">
                            <label htmlFor="sortSelect">{t("sort")}</label>
                            <select id="sortSelect" value={sortOrder} onChange={(event) => { setSortOrder(event.target.value); setSelectedArtworkId(null); }}>
                                <option value="title-asc">{t("titleAsc")}</option>
                                <option value="title-desc">{t("titleDesc")}</option>
                                <option value="year-asc">{t("yearAsc")}</option>
                                <option value="year-desc">{t("yearDesc")}</option>
                            </select>
                        </div>
                    </form>

                    <div className="section-header">
                        <div><p className="eyebrow">{t("onView")}</p><h2>{t("artworks")}</h2></div>
                        <p id="resultCount" aria-live="polite">{loading ? t("loading") : `${filteredArtworks.length} ${t("artworks").toLocaleLowerCase()}`}</p>
                    </div>

                    {error ? (
                        <div className="gallery-state error-state" role="alert">
                            <p>{t("loadError")}</p>
                            <button className="queue-button" type="button" onClick={() => setReloadKey((key) => key + 1)}>{t("retry")}</button>
                        </div>
                    ) : loading ? (
                        <div className="gallery skeleton-grid" aria-label={t("loading")}>
                            {Array.from({ length: 8 }, (_, index) => <div className="skeleton-card" key={index}><div className="skeleton-image" /><div className="skeleton-line" /><div className="skeleton-line short" /></div>)}
                        </div>
                    ) : filteredArtworks.length === 0 ? (
                        <div className="gallery-state"><p>{t("noResults")}</p></div>
                    ) : (
                        <div className="gallery" aria-live="polite">
                            {paginatedArtworks.map((artwork) => (
                                <article
                                    className={`card${String(highlightedArtworkId) === String(artwork.id) ? " search-match-highlight" : ""}`}
                                    key={artwork.id}
                                    data-artwork-id={artwork.id}
                                    ref={(element) => { if (element) cardRefs.current.set(String(artwork.id), element); else cardRefs.current.delete(String(artwork.id)); }}
                                    role="button"
                                    tabIndex={0}
                                    aria-label={`${artwork.title} — ${artwork.artist || t("unknownArtist")}`}
                                    onClick={() => openArtwork(artwork)}
                                    onKeyDown={(event) => { if (event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); openArtwork(artwork); } }}
                                >
                                    <div className="card-image-wrap" data-view-label={t("clickToView")}>
                                        <img className="card-image" src={artwork.image || fallbackImage} alt={artwork.title} onError={(event) => { event.currentTarget.src = fallbackImage; }} />
                                        <button className="favorite-toggle card-favorite-toggle" type="button" aria-label={isFavorite(artwork.id) ? t("removeFavorite") : t("addFavorite")} aria-pressed={isFavorite(artwork.id)} onClick={(event) => { event.stopPropagation(); toggleFavorite(artwork); }}>
                                            <span aria-hidden="true">{isFavorite(artwork.id) ? "♥" : "♡"}</span>
                                        </button>
                                    </div>
                                    <div className="card-info">
                                        <span className="card-category">{artwork.category}</span>
                                        <h3 className="card-title">{artwork.title}</h3>
                                        <p className="card-artist">{artwork.artist || t("unknownArtist")}</p>
                                        <p className="card-year">{formatYear(artwork.year, language)}</p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                    {!error && !loading && pageCount > 1 && (
                        <nav className="pagination" aria-label={t("pagination")}>
                            <button type="button" className="pagination-button" disabled={currentPage === 1} onClick={() => setCurrentPage((page) => page - 1)}>{t("previousPage")}</button>
                            <span aria-live="polite">{t("pageOf")} {currentPage} / {pageCount}</span>
                            <button type="button" className="pagination-button" disabled={currentPage === pageCount} onClick={() => setCurrentPage((page) => page + 1)}>{t("nextPage")}</button>
                        </nav>
                    )}
                        </section>
                    } />

                    <Route path={pagePath("yourVisit")} element={
                        <section className="visit-section" aria-label={t("visit")}>
                    <VisitPanel eyebrow={t("historyEyebrow")} title={t("history")} action={<div className="list-panel-actions">
                        <button className="queue-button button-secondary" type="button" onClick={goBackArtwork} disabled={recentlyViewed.length < 2}>{t("back")}</button>
                        {recentlyViewed.length > 0 && <button className="list-clear-button" type="button" onClick={() => mutateRecentlyViewed((stack) => stack.clear())}>{t("clearAll")}</button>}
                    </div>}>
                        <div id="historyContainer">
                            {recentlyViewed.length === 0 ? <EmptyVisitState icon="◷" message={t("noHistory")} hint={t("emptyHistoryHint")} collectionLabel={t("collection")} /> : recentlyViewed.map((artwork) => (
                                <ListItem key={artwork.id} artwork={artwork} onOpen={() => openArtwork(artwork)} onRemove={() => mutateRecentlyViewed((stack) => {
                                    const remaining = stack.toArray().filter((item) => String(item.id) !== String(artwork.id));
                                    stack.clear();
                                    for (let index = remaining.length - 1; index >= 0; index -= 1) stack.push(remaining[index]);
                                })} removeLabel={t("remove")} />
                            ))}
                        </div>
                    </VisitPanel>
                    <VisitPanel eyebrow={t("queueEyebrow")} title={t("queue")} action={<div className="list-panel-actions">
                        <button className="queue-button" type="button" onClick={viewNextFromQueue}>{t("viewNext")} <span aria-hidden="true">→</span></button>
                        {viewingQueue.length > 0 && <button className="list-clear-button" type="button" onClick={() => mutateViewingQueue((queue) => queue.clear())}>{t("clearAll")}</button>}
                    </div>}>
                        <div id="queueContainer">
                            {viewingQueue.length === 0 ? <EmptyVisitState icon="＋" message={t("noQueue")} hint={t("emptyQueueHint")} collectionLabel={t("collection")} /> : viewingQueue.map((artwork) => (
                                <ListItem key={artwork.id} artwork={artwork} onOpen={() => openArtwork(artwork, "queue")} onRemove={() => mutateViewingQueue((queue) => queue.removeWhere((item) => String(item.id) === String(artwork.id)))} removeLabel={t("remove")} />
                            ))}
                        </div>
                    </VisitPanel>
                    <VisitPanel eyebrow={t("favoritesEyebrow")} title={t("favorites")} action={favorites.length > 0 && <button className="list-clear-button" type="button" onClick={() => setFavorites([])}>{t("clearAll")}</button>}>
                        <div id="favoritesContainer">
                            {favorites.length === 0 ? <EmptyVisitState icon="♡" message={t("noFavorites")} hint={t("emptyFavoritesHint")} collectionLabel={t("collection")} /> : favorites.map((artwork) => (
                                <ListItem key={artwork.id} artwork={artwork} onOpen={() => openArtwork(artwork)} onRemove={() => toggleFavorite(artwork)} removeLabel={t("removeFavorite")} />
                            ))}
                        </div>
                    </VisitPanel>
                        </section>
                    } />

                    <Route path="*" element={<Navigate to={pagePath("home")} replace />} />
                </Routes>
            </main>

            {selectedArtwork && (
                <div className="modal" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) setSelectedArtwork(null); }}>
                    <div className="modal-content" role="dialog" aria-modal="true" aria-labelledby="detailTitle">
                        <button id="closeModal" className="close-button" type="button" aria-label={t("close")} onClick={() => setSelectedArtwork(null)}>×</button>
                        <div className="modal-image-panel"><img id="detailImage" src={selectedArtwork.image || fallbackImage} alt={selectedArtwork.title} onError={(event) => { event.currentTarget.src = fallbackImage; }} /></div>
                        <div className="detail-info">
                            <span id="detailCategory" className="category">{selectedArtwork.category}</span>
                            <h2 id="detailTitle">{selectedArtwork.title}</h2>
                            <p className="artist"><strong>{t("artist")}:</strong> <span id="detailArtist">{selectedArtwork.artist || t("unknownArtist")}</span></p>
                            <p><strong>{t("year")}:</strong> <span id="detailYear">{formatYear(selectedArtwork.year, language)}</span></p>
                            <p id="detailDescription" className="description">{selectedArtwork.description}</p>
                            <div className="detail-actions">
                                <button id="addToQueueButton" className="queue-button" type="button" onClick={() => handleQueueAdd(selectedArtwork)}>{t("addQueue")}</button>
                                <button id="modalFavoriteButton" className="favorite-toggle modal-favorite-toggle" type="button" aria-label={isFavorite(selectedArtwork.id) ? t("removeFavorite") : t("addFavorite")} aria-pressed={isFavorite(selectedArtwork.id)} onClick={() => toggleFavorite(selectedArtwork)}>
                                    <span aria-hidden="true">{isFavorite(selectedArtwork.id) ? "♥" : "♡"}</span>
                                </button>
                            </div>
                        </div>
                        <button id="previousArtworkButton" className="modal-arrow modal-arrow-previous" type="button" aria-label={t("previous")} disabled={modalIndex <= 0} onClick={() => navigateModal(-1)}>←</button>
                        <button id="nextArtworkButton" className="modal-arrow modal-arrow-next" type="button" aria-label={t("next")} disabled={modalSource === "queue" ? modalIndex >= queueSequence.length - 1 && viewingQueue.length === 0 : modalIndex >= filteredArtworks.length - 1} onClick={() => navigateModal(1)}>→</button>
                    </div>
                </div>
            )}

            {toast && <div className={`queue-toast ${toast.type}`} role="status" key={toast.key}><span className="queue-toast-mark" aria-hidden="true" />{toast.message}</div>}
            <button className={`scroll-top-button${scrollY > 360 ? " visible" : ""}`} type="button" aria-label={t("scrollTop")} title={t("scrollTop")} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}><span aria-hidden="true">↑</span></button>

            <footer className="footer"><div className="footer-inner"><Link className="footer-logo" to={pagePath("home")}>ART<span>GALLERY</span></Link><p>{t("footer")}</p></div></footer>
        </div>
    );
}

function VisitPanel({ eyebrow, title, action, children }) {
    return <section className="visit-panel"><div className="section-header"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div>{action}</div>{children}</section>;
}

function EmptyVisitState({ icon, message, hint, collectionLabel }) {
    return (
        <div className="empty-visit-state">
            <span className="empty-visit-icon" aria-hidden="true">{icon}</span>
            <p className="empty-visit-message">{message}</p>
            <p className="empty-visit-hint">{hint}</p>
            <Link to={pagePath("collection")}>{collectionLabel}</Link>
        </div>
    );
}

function ListItem({ artwork, onOpen, onRemove, removeLabel }) {
    return (
        <div className="queue-item">
            <button className="list-open-button" type="button" onClick={onOpen}>
                <img className="list-thumbnail" src={artwork.image || fallbackImage} alt="" onError={(event) => { event.currentTarget.src = fallbackImage; }} />
                <span className="list-item-title">{artwork.title}</span>
            </button>
            <button className="list-remove-button" type="button" aria-label={`${removeLabel}: ${artwork.title}`} onClick={onRemove}>×</button>
        </div>
    );
}