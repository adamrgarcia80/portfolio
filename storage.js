// Storage manager using IndexedDB for large file support
// Can store hundreds of MB or even GB of data

const DB_NAME = 'portfolioDB';
const DB_VERSION = 3;
const STORE_SECTIONS = 'sections';
const STORE_IMAGES = 'images';
const STORE_VIDEOS = 'videos';
const STORE_PROJECTS = 'projects';
const STORE_SITE_SETTINGS = 'siteSettings';

let db = null;

// Initialize database
function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            
            // Create object stores if they don't exist
            if (!db.objectStoreNames.contains(STORE_SECTIONS)) {
                db.createObjectStore(STORE_SECTIONS, { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains(STORE_IMAGES)) {
                db.createObjectStore(STORE_IMAGES, { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains(STORE_VIDEOS)) {
                db.createObjectStore(STORE_VIDEOS, { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains(STORE_PROJECTS)) {
                db.createObjectStore(STORE_PROJECTS, { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains(STORE_SITE_SETTINGS)) {
                db.createObjectStore(STORE_SITE_SETTINGS, { keyPath: 'id' });
            }
        };
    });
}

// Get database instance
async function getDB() {
    if (db) return db;
    return await initDB();
}

// Sections
async function getSections() {
    const database = await getDB();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction([STORE_SECTIONS], 'readonly');
        const store = transaction.objectStore(STORE_SECTIONS);
        const request = store.getAll();
        
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
    });
}

async function saveSection(section) {
    const database = await getDB();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction([STORE_SECTIONS], 'readwrite');
        const store = transaction.objectStore(STORE_SECTIONS);
        const request = store.put(section);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function deleteSection(id) {
    const database = await getDB();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction([STORE_SECTIONS], 'readwrite');
        const store = transaction.objectStore(STORE_SECTIONS);
        const request = store.delete(id);
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

// Images
async function getImages() {
    const database = await getDB();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction([STORE_IMAGES], 'readonly');
        const store = transaction.objectStore(STORE_IMAGES);
        const request = store.getAll();
        
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
    });
}

async function saveImage(image) {
    const database = await getDB();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction([STORE_IMAGES], 'readwrite');
        const store = transaction.objectStore(STORE_IMAGES);
        const request = store.put(image);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function deleteImage(id) {
    const database = await getDB();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction([STORE_IMAGES], 'readwrite');
        const store = transaction.objectStore(STORE_IMAGES);
        const request = store.delete(id);
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

// Videos
async function getVideos() {
    const database = await getDB();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction([STORE_VIDEOS], 'readonly');
        const store = transaction.objectStore(STORE_VIDEOS);
        const request = store.getAll();
        
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
    });
}

async function saveVideo(video) {
    const database = await getDB();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction([STORE_VIDEOS], 'readwrite');
        const store = transaction.objectStore(STORE_VIDEOS);
        const request = store.put(video);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function deleteVideo(id) {
    const database = await getDB();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction([STORE_VIDEOS], 'readwrite');
        const store = transaction.objectStore(STORE_VIDEOS);
        const request = store.delete(id);
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

// Get all data
async function getAllData() {
    const [sections, images, videos] = await Promise.all([
        getSections(),
        getImages(),
        getVideos()
    ]);
    
    return { sections, images, videos };
}

// Projects
async function getProjects() {
    const database = await getDB();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction([STORE_PROJECTS], 'readonly');
        const store = transaction.objectStore(STORE_PROJECTS);
        const request = store.getAll();
        
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
    });
}

async function getProject(id) {
    const database = await getDB();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction([STORE_PROJECTS], 'readonly');
        const store = transaction.objectStore(STORE_PROJECTS);
        const request = store.get(id);
        
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
    });
}

async function saveProject(project) {
    const database = await getDB();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction([STORE_PROJECTS], 'readwrite');
        const store = transaction.objectStore(STORE_PROJECTS);
        const request = store.put(project);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function deleteProject(id) {
    const database = await getDB();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction([STORE_PROJECTS], 'readwrite');
        const store = transaction.objectStore(STORE_PROJECTS);
        const request = store.delete(id);
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

// Get sections for a specific project
async function getSectionsForProject(projectId) {
    const sections = await getSections();
    return sections.filter(s => s.projectId === projectId);
}

// Get images for a specific project
async function getImagesForProject(projectId) {
    const images = await getImages();
    return images.filter(img => img.projectId === projectId);
}

// Get videos for a specific project
async function getVideosForProject(projectId) {
    const videos = await getVideos();
    return videos.filter(vid => vid.projectId === projectId);
}

// Site Settings (bio text and footer links)
async function getSiteSettings() {
    const database = await getDB();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction([STORE_SITE_SETTINGS], 'readonly');
        const store = transaction.objectStore(STORE_SITE_SETTINGS);
        const request = store.get('main');
        
        request.onsuccess = () => resolve(request.result || { id: 'main', bioText: '', footerLinks: [] });
        request.onerror = () => reject(request.error);
    });
}

async function saveSiteSettings(settings) {
    const database = await getDB();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction([STORE_SITE_SETTINGS], 'readwrite');
        const store = transaction.objectStore(STORE_SITE_SETTINGS);
        const request = store.put({ id: 'main', ...settings });
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Initialize with default content if empty
async function initializeDefaults() {
    const sections = await getSections();
    if (sections.length === 0) {
        const defaults = [
            {
                id: "1",
                content: "Lorem Ipsum",
                style: "header",
                order: 0
            },
            {
                id: "2",
                content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
                style: "body-regular",
                order: 1
            },
            {
                id: "3",
                content: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
                style: "body-bold",
                order: 2
            }
        ];
        
        for (const section of defaults) {
            await saveSection(section);
        }
    }
}

