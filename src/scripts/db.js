export class StoryDB {
    constructor() {
        this.dbName = 'DicodingStoriesDB';
        this.storeName = 'stories';
        this.db = null;
    }

    async initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 3); // upgrade version

            request.onerror = (event) => {
                console.error('Database error:', event.target.error);
                reject(event.target.error);
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
                    store.createIndex('createdAt', 'createdAt', { unique: false });
                    store.createIndex('hasLocation', 'hasLocation', { unique: false });
                }
                // Tambah object store untuk favorit
                if (!db.objectStoreNames.contains('favorites')) {
                    db.createObjectStore('favorites', { keyPath: 'id' });
                }
            };
        });
    }

    async saveStory(story) {
    try {
        if (!this.db) await this.initDB();
        return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([this.storeName], 'readwrite');
        transaction.oncomplete = () => resolve();
        transaction.onerror = (event) => reject(event.target.error);
        const store = transaction.objectStore(this.storeName);
        store.put(story);
        });
    } catch (error) {
        console.error('Failed to save story:', error);
        throw error;
    }
    }

    async getStories() {
        try {
            if (!this.db) await this.initDB();
            return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.getAll();
            
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = (event) => {
                console.error('Error getting stories:', event.target.error);
                reject(event.target.error);
            };
            });
        } catch (error) {
            console.error('Error in getStories:', error);
            throw error;
        }
    }

    async deleteStory(id) {
        if (!this.db) await this.initDB();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            
            const request = store.delete(id);
            
            request.onsuccess = () => resolve();
            request.onerror = (event) => reject(event.target.error);
        });
    }

    async clearAll() {
        if (!this.db) await this.initDB();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            
            const request = store.clear();
            
            request.onsuccess = () => resolve();
            request.onerror = (event) => reject(event.target.error);
        });
    }

    // ===== FAVORITE STORY =====
    async saveFavorite(story) {
        try {
            if (!this.db) await this.initDB();
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction(['favorites'], 'readwrite');
                transaction.oncomplete = () => resolve();
                transaction.onerror = (event) => reject(event.target.error);
                const store = transaction.objectStore('favorites');
                store.put(story);
            });
        } catch (error) {
            console.error('Failed to save favorite:', error);
            throw error;
        }
    }

    async getFavorites() {
        try {
            if (!this.db) await this.initDB();
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction(['favorites'], 'readonly');
                const store = transaction.objectStore('favorites');
                const request = store.getAll();
                request.onsuccess = () => resolve(request.result || []);
                request.onerror = (event) => reject(event.target.error);
            });
        } catch (error) {
            console.error('Failed to get favorites:', error);
            throw error;
        }
    }

    async deleteFavorite(id) {
        try {
            if (!this.db) await this.initDB();
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction(['favorites'], 'readwrite');
                const store = transaction.objectStore('favorites');
                const request = store.delete(id);
                request.onsuccess = () => resolve();
                request.onerror = (event) => reject(event.target.error);
            });
        } catch (error) {
            console.error('Failed to delete favorite:', error);
            throw error;
        }
    }

    async isFavorite(id) {
        try {
            if (!this.db) await this.initDB();
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction(['favorites'], 'readonly');
                const store = transaction.objectStore('favorites');
                const request = store.get(id);
                request.onsuccess = () => resolve(!!request.result);
                request.onerror = (event) => reject(event.target.error);
            });
        } catch (error) {
            console.error('Failed to check favorite:', error);
            throw error;
        }
    }
}