// indexdb.js
const DB_NAME = "PatternDB";
const STORE_NAME = "patterns";
let db = null;

function openDB() {
    return new Promise((resolve, reject) => {
        if (db) return resolve(db);
        const request = indexedDB.open(DB_NAME, 1);

        request.onerror = (e) => reject(e.target.error);
        request.onsuccess = (e) => {
            db = e.target.result;
            resolve(db);
        };
        request.onupgradeneeded = (e) => {
            db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
                // Можно добавить индекс по тегам (не очень удобен для массивов частичного поиска),
                // поэтому мы будем брать все записи и фильтровать в JS.
            }
        };
    });
}

async function addPattern(pattern) {
    // pattern expected: { image, name, link, tags: ['a','b'] }
    const database = await openDB();
    return new Promise((resolve, reject) => {
        const tx = database.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        const req = store.add(pattern);

        req.onsuccess = (e) => resolve(e.target.result); // id inserted
        req.onerror = (e) => reject(e.target.error);
    });
}

async function getAllPatterns() {
    const database = await openDB();
    return new Promise((resolve, reject) => {
        const tx = database.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result);
        req.onerror = (e) => reject(e.target.error);
    });
}

async function deletePattern(id) {
    const database = await openDB();
    return new Promise((resolve, reject) => {
        const tx = database.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = (e) => reject(e.target.error);
    });
}

/**
 * Поиск по тегу (частичный, регистронезависимый)
 * Возвращает Promise<array of patterns>
 */
async function searchPatternsByTag(query) {
    const q = String(query || "").trim().toLowerCase();
    if (!q) return [];

    const all = await getAllPatterns();
    // tags may be array of strings or a single string in older records -> normalize
    const filtered = all.filter(p => {
        if (!p.tags) return false;
        const tagsArr = Array.isArray(p.tags) ? p.tags : String(p.tags).split(',').map(t => t.trim().toLowerCase());
        return tagsArr.some(t => t.includes(q));
    });
    return filtered;
}
