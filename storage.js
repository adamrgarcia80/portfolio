// Storage manager with Firebase Firestore (for cross-device sync) and IndexedDB fallback
// Images are stored in Cloudinary URLs, metadata syncs via Firebase

const DB_NAME = 'portfolioDB';
const DB_VERSION = 3;
const STORE_SECTIONS = 'sections';
const STORE_IMAGES = 'images';
const STORE_VIDEOS = 'videos';
const STORE_PROJECTS = 'projects';
const STORE_SITE_SETTINGS = 'siteSettings';

let db = null;

// Firebase helper functions
async function useFirebase() {
    try {
        // Check if Firebase is initialized
        if (window.firestore) {
            return true;
        }
        // Try to initialize from stored config
        const settings = await getSiteSettingsFromIndexedDB();
        if (settings.firebaseConfig && window.initFirebase) {
            window.initFirebase(settings.firebaseConfig);
            await new Promise(resolve => setTimeout(resolve, 500));
            return !!window.firestore;
        }
        return false;
    } catch (error) {
        console.error('Error checking Firebase:', error);
        return false;
    }
}

// Firebase operations (using Firestore)
async function firebaseGet(collectionName) {
    if (!window.firestore) return [];
    try {
        const { collection, getDocs, query, orderBy } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        const ref = collection(window.firestore, collectionName);
        const snapshot = await getDocs(query(ref, orderBy('order', 'asc')));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error(`Error getting ${collectionName} from Firebase:`, error);
        return [];
    }
}

async function firebaseSave(collectionName, item) {
    if (!window.firestore) return;
    try {
        const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        const ref = doc(window.firestore, collectionName, item.id);
        await setDoc(ref, item);
    } catch (error) {
        console.error(`Error saving ${collectionName} to Firebase:`, error);
    }
}

async function firebaseDelete(collectionName, id) {
    if (!window.firestore) return;
    try {
        const { doc, deleteDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        const ref = doc(window.firestore, collectionName, id);
        await deleteDoc(ref);
    } catch (error) {
        console.error(`Error deleting ${collectionName} from Firebase:`, error);
    }
}

async function firebaseGetDoc(collectionName, docId) {
    if (!window.firestore) return null;
    try {
        const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        const ref = doc(window.firestore, collectionName, docId);
        const snapshot = await getDoc(ref);
        if (snapshot.exists()) {
            return { id: snapshot.id, ...snapshot.data() };
        }
        return null;
    } catch (error) {
        console.error(`Error getting ${collectionName} doc from Firebase:`, error);
        return null;
    }
}

// IndexedDB helper (for fallback and site settings)
async function getSiteSettingsFromIndexedDB() {
    const database = await getDB();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction([STORE_SITE_SETTINGS], 'readonly');
        const store = transaction.objectStore(STORE_SITE_SETTINGS);
        const request = store.get('main');
        request.onsuccess = () => resolve(request.result || { id: 'main', bioText: '', footerLinks: [], cloudinaryConfig: {}, firebaseConfig: null });
        request.onerror = () => reject(request.error);
    });
}

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
    if (await useFirebase()) {
        const firebaseData = await firebaseGet('sections');
        // Also save to IndexedDB as backup
        if (firebaseData.length > 0) {
            const database = await getDB();
            const transaction = database.transaction([STORE_SECTIONS], 'readwrite');
            const store = transaction.objectStore(STORE_SECTIONS);
            firebaseData.forEach(item => store.put(item));
        }
        return firebaseData;
    }
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
    if (await useFirebase()) {
        await firebaseSave('sections', section);
    }
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
    if (await useFirebase()) {
        await firebaseDelete('sections', id);
    }
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
    if (await useFirebase()) {
        const firebaseData = await firebaseGet('images');
        // Also save to IndexedDB as backup
        if (firebaseData.length > 0) {
            const database = await getDB();
            const transaction = database.transaction([STORE_IMAGES], 'readwrite');
            const store = transaction.objectStore(STORE_IMAGES);
            firebaseData.forEach(item => store.put(item));
        }
        return firebaseData;
    }
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
    if (await useFirebase()) {
        await firebaseSave('images', image);
    }
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
    if (await useFirebase()) {
        await firebaseDelete('images', id);
    }
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
    if (await useFirebase()) {
        const firebaseData = await firebaseGet('projects');
        // Also save to IndexedDB as backup
        if (firebaseData.length > 0) {
            const database = await getDB();
            const transaction = database.transaction([STORE_PROJECTS], 'readwrite');
            const store = transaction.objectStore(STORE_PROJECTS);
            firebaseData.forEach(item => store.put(item));
        }
        return firebaseData;
    }
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
    if (await useFirebase()) {
        const firebaseData = await firebaseGetDoc('projects', id);
        if (firebaseData) {
            // Also save to IndexedDB as backup
            const database = await getDB();
            const transaction = database.transaction([STORE_PROJECTS], 'readwrite');
            const store = transaction.objectStore(STORE_PROJECTS);
            store.put(firebaseData);
        }
        return firebaseData;
    }
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
    if (await useFirebase()) {
        await firebaseSave('projects', project);
    }
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
    if (await useFirebase()) {
        await firebaseDelete('projects', id);
    }
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

// Site Settings (bio text and footer links) - always use IndexedDB for settings
async function getSiteSettings() {
    if (await useFirebase()) {
        const firebaseData = await firebaseGetDoc('siteSettings', 'main');
        if (firebaseData) {
            // Also save to IndexedDB
            const database = await getDB();
            const transaction = database.transaction([STORE_SITE_SETTINGS], 'readwrite');
            const store = transaction.objectStore(STORE_SITE_SETTINGS);
            store.put(firebaseData);
            return firebaseData;
        }
    }
    return await getSiteSettingsFromIndexedDB();
}

async function saveSiteSettings(settings) {
    if (await useFirebase()) {
        await firebaseSave('siteSettings', { id: 'main', ...settings });
    }
    const database = await getDB();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction([STORE_SITE_SETTINGS], 'readwrite');
        const store = transaction.objectStore(STORE_SITE_SETTINGS);
        const request = store.put({ id: 'main', ...settings });
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Get Cloudinary configuration
async function getCloudinaryConfig() {
    const settings = await getSiteSettings();
    return settings.cloudinaryConfig || { cloudName: '', uploadPreset: '' };
}

// Save Cloudinary configuration
async function saveCloudinaryConfig(config) {
    const settings = await getSiteSettings();
    settings.cloudinaryConfig = config;
    await saveSiteSettings(settings);
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

