// services/StorageService.js
export class StorageService {
    constructor() {
        this.tokenKey = 'dicoding_stories_token';
        this.userKey = 'dicoding_stories_user';
    }

    // Token management
    saveToken(token) {
        try {
            localStorage.setItem(this.tokenKey, token);
            return true;
        } catch (error) {
            console.error('Failed to save token:', error);
            return false;
        }
    }

    getToken() {
        try {
            return localStorage.getItem(this.tokenKey);
        } catch (error) {
            console.error('Failed to get token:', error);
            return null;
        }
    }

    removeToken() {
        try {
            localStorage.removeItem(this.tokenKey);
            return true;
        } catch (error) {
            console.error('Failed to remove token:', error);
            return false;
        }
    }

    // User data management
    saveUser(user) {
        try {
            localStorage.setItem(this.userKey, JSON.stringify(user));
            return true;
        } catch (error) {
            console.error('Failed to save user:', error);
            return false;
        }
    }

    getUser() {
        try {
            const userData = localStorage.getItem(this.userKey);
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('Failed to get user:', error);
            return null;
        }
    }

    removeUser() {
        try {
            localStorage.removeItem(this.userKey);
            return true;
        } catch (error) {
            console.error('Failed to remove user:', error);
            return false;
        }
    }

    // Check authentication status
    isAuthenticated() {
        const token = this.getToken();
        return token !== null && token !== '';
    }

    // Clear all stored data
    clearAll() {
        try {
            this.removeToken();
            this.removeUser();
            return true;
        } catch (error) {
            console.error('Failed to clear all data:', error);
            return false;
        }
    }

    // Generic storage methods
    set(key, value) {
        try {
            const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
            localStorage.setItem(key, serializedValue);
            return true;
        } catch (error) {
            console.error(`Failed to store ${key}:`, error);
            return false;
        }
    }

    get(key, defaultValue = null) {
        try {
            const value = localStorage.getItem(key);
            if (value === null) return defaultValue;
            
            // Try to parse JSON, return as string if it fails
            try {
                return JSON.parse(value);
            } catch {
                return value;
            }
        } catch (error) {
            console.error(`Failed to get ${key}:`, error);
            return defaultValue;
        }
    }

    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`Failed to remove ${key}:`, error);
            return false;
        }
    }

    // Check if storage is available
    isAvailable() {
        try {
            const testKey = '__storage_test__';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            return true;
        } catch {
            return false;
        }
    }
}