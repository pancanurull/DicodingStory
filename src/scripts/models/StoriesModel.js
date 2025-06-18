import { ApiService } from '../services/ApiService.js';
import { StorageService } from '../services/StorageService.js';
import { NetworkUtils } from '../utils/network.js';
import { StoryDB } from '../db.js';

export class StoriesModel {
    constructor() {
        this.apiService = new ApiService();
        this.storageService = new StorageService();
        this.storyDB = new StoryDB();
    }

    async getAllStories(params = {}) {
        try {
            await NetworkUtils.checkConnection();
            
            const token = this.storageService.getToken();
            const requestParams = {
                ...params,
                ...(token && { token })
            };

            const response = await this.apiService.getStories(requestParams);
            const stories = response.listStory || [];
            
            await this.saveStoriesToDB(stories);
            
            return {
                ...response,
                listStory: stories
            };
        } catch (error) {
            console.error('Failed to get stories from API, trying from DB:', error);
            const offlineStories = await this.getStoriesFromDB();
            
            // Tambahkan transformasi data offline
            const transformedStories = this.transformStoryData(offlineStories);
            
            return {
                listStory: transformedStories,
                message: 'Anda sedang offline, menampilkan data terakhir yang tersedia'
            };
        }
    }

    async saveStoriesToDB(stories) {
        try {
            await this.storyDB.initDB();
            for (const story of stories) {
                await this.storyDB.saveStory({
                    ...story,
                    hasLocation: story.lat && story.lon
                });
            }
        } catch (error) {
            console.error('Failed to save stories to DB:', error);
        }
    }

    async getStoriesFromDB() {
        try {
            await this.storyDB.initDB();
            const stories = await this.storyDB.getStories();
            return this.transformStoryData(stories);
        } catch (error) {
            console.error('Failed to get stories from DB:', error);
            return [];
        }
    }

    async getStoriesWithLocation() {
        try {
            const response = await this.getAllStories({ location: 1 });
            
            // Filter tambahan untuk memastikan hanya story dengan lokasi yang dikembalikan
            const storiesWithLocation = response.listStory.filter(story => 
                story.lat !== null && story.lon !== null
            );
            
            return {
                ...response,
                listStory: storiesWithLocation
            };
        } catch (error) {
            console.error('Failed to get stories with location:', error);
            
            // Tambahkan konteks error khusus lokasi
            if (error.message.includes('Gagal memuat stories')) {
                throw new Error('Gagal memuat stories dengan lokasi. ' + error.message.split(':')[1]);
            }
            throw new Error('Gagal memuat stories dengan lokasi. Silakan coba lagi.');
        }
    }

    async getFeaturedStories(limit = 6) {
        try {
            const response = await this.getAllStories({ size: limit });
            
            // Validasi response lebih ketat
            if (!response.listStory || response.listStory.length === 0) {
                throw new Error('Tidak ada featured stories yang tersedia');
            }
            
            // Pastikan jumlah story tidak melebihi limit
            const featuredStories = response.listStory.slice(0, limit);
            
            return {
                ...response,
                listStory: featuredStories
            };
        } catch (error) {
            console.error('Failed to get featured stories:', error);
            
            // Tangani kasus khusus ketika tidak ada story
            if (error.message.includes('Tidak ada')) {
                throw error; // Propagate as-is
            }
            
            throw new Error('Gagal memuat featured stories: ' + (error.message || 'Silakan coba lagi.'));
        }
    }

    async getStoryDetail(id) {
        try {
            // Cek koneksi internet terlebih dahulu
            await NetworkUtils.checkConnection();

            const token = this.storageService.getToken();
            if (!token) {
                throw new Error('Anda harus login untuk melihat detail story.');
            }

            // Validasi ID story
            if (!id || typeof id !== 'string') {
                throw new Error('ID story tidak valid');
            }

            const response = await this.apiService.getStoryDetail(id, token);
            
            // Validasi response detail
            if (!response || !response.story) {
                throw new Error('Format response detail tidak valid');
            }

            return {
                ...response,
                story: this.transformStoryData([response.story])[0] // Transform single story
            };
        } catch (error) {
            console.error('Failed to get story detail:', error);
            
            if (error.message.includes('404')) {
                throw new Error('Story tidak ditemukan. ID mungkin tidak valid.');
            } else if (error.message.includes('403')) {
                throw new Error('Anda tidak memiliki akses untuk melihat story ini.');
            }
            
            throw new Error('Gagal memuat detail story: ' + (error.message || 'Silakan coba lagi.'));
        }
    }

    async addNewStory(storyData) {
        try {
            await NetworkUtils.checkConnection();

            const token = this.storageService.getToken();
            
            // Validasi data
            const errors = this.validateStoryData(storyData);
            if (errors.length > 0) {
                throw new Error(errors.join(', '));
            }

            const formData = new FormData();
            formData.append('description', storyData.description);
            formData.append('photo', storyData.photo);
            
            if (storyData.lat && storyData.lon) {
                formData.append('lat', storyData.lat);
                formData.append('lon', storyData.lon);
            }

            let response;
            if (token) {
                response = await this.apiService.addStory(formData, token);
            } else {
                response = await this.apiService.addStoryGuest(formData);
            }

            if (!response || response.error) {
                throw new Error(response?.message || 'Failed to add story');
            }

            return response;
        } catch (error) {
            console.error('Failed to add story:', error);
            throw error;
        }
    }

    validateStoryData(storyData) {
        const errors = [];

        if (!storyData.description || storyData.description.trim().length < 10) {
            errors.push('Deskripsi minimal 10 karakter.');
        }

        if (!storyData.photo) {
            errors.push('Foto wajib diupload.');
        } else {
            if (storyData.photo.size > 1024 * 1024) { // 1MB
                errors.push('Ukuran foto maksimal 1MB.');
            }
            
            if (!storyData.photo.type.startsWith('image/')) {
                errors.push('File harus berupa gambar (JPEG, PNG, dll).');
            }
        }

        if (storyData.lat !== undefined || storyData.lon !== undefined) {
            const lat = parseFloat(storyData.lat);
            const lon = parseFloat(storyData.lon);
            
            if (isNaN(lat)) {
                errors.push('Latitude tidak valid.');
            } else if (lat < -90 || lat > 90) {
                errors.push('Latitude harus antara -90 sampai 90.');
            }
            
            if (isNaN(lon)) {
                errors.push('Longitude tidak valid.');
            } else if (lon < -180 || lon > 180) {
                errors.push('Longitude harus antara -180 sampai 180.');
            }
        }

        return errors;
    }

    transformStoryData(stories) {
        if (!Array.isArray(stories)) {
            return [];
        }

        return stories.map(story => {
            const safeStory = {
                id: story.id || 'unknown',
                name: story.name || 'Anonymous',
                description: story.description || 'Tidak ada deskripsi',
                photoUrl: story.photoUrl || 'data:image/svg+xml,...', // placeholder image
                createdAt: story.createdAt || new Date().toISOString(),
                lat: story.lat !== undefined ? story.lat : null,
                lon: story.lon !== undefined ? story.lon : null
            };

            return {
                ...safeStory,
                formattedDate: this.formatDate(safeStory.createdAt),
                shortDescription: this.truncateText(safeStory.description, 100),
                hasLocation: safeStory.lat !== null && safeStory.lon !== null
            };
        });
    }

    formatDate(dateString) {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) throw new Error('Invalid date');
            
            return date.toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Tanggal tidak tersedia';
        }
    }

    truncateText(text, maxLength) {
        if (!text || typeof text !== 'string') return '';
        if (text.length <= maxLength) return text;
        
        return text.substring(0, maxLength) + '...';
    }

    searchStories(stories, query = '') {
        if (!Array.isArray(stories)) return [];
        if (!query || typeof query !== 'string') return [...stories];
        
        const lowercaseQuery = query.toLowerCase().trim();
        return stories.filter(story => {
            const storyName = story.name?.toLowerCase() || '';
            const storyDesc = story.description?.toLowerCase() || '';
            return storyName.includes(lowercaseQuery) || 
                   storyDesc.includes(lowercaseQuery);
        });
    }

    filterStoriesByLocation(stories, hasLocation = true) {
        if (!Array.isArray(stories)) return [];
        
        return stories.filter(story => {
            const hasCoords = story.lat !== null && story.lon !== null;
            return hasLocation ? hasCoords : !hasCoords;
        });
    }

    sortStories(stories, sortBy = 'newest') {
        if (!Array.isArray(stories)) return [];
        
        const sorted = [...stories];
        
        switch (sortBy) {
            case 'newest':
                return sorted.sort((a, b) => {
                    const dateA = new Date(a.createdAt || 0);
                    const dateB = new Date(b.createdAt || 0);
                    return dateB - dateA;
                });
                
            case 'oldest':
                return sorted.sort((a, b) => {
                    const dateA = new Date(a.createdAt || 0);
                    const dateB = new Date(b.createdAt || 0);
                    return dateA - dateB;
                });
                
            case 'name':
                return sorted.sort((a, b) => {
                    const nameA = a.name?.toLowerCase() || '';
                    const nameB = b.name?.toLowerCase() || '';
                    return nameA.localeCompare(nameB);
                });
                
            default:
                return sorted;
        }
    }
    async syncOfflineStories() {
        try {
            const offlineStories = await this.storyDB.getStories();
            if (offlineStories.length > 0) {
            const token = this.storageService.getToken();
            for (const story of offlineStories) {
                await this.apiService.addStory(story, token);
                await this.storyDB.deleteStory(story.id);
            }
            }
        } catch (error) {
            console.error('Sync failed:', error);
        }
    }
}