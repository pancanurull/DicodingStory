// views/StoriesView.js
import { StoriesModel } from '../models/StoriesModel.js';
import { StoriesPresenter } from '../presenters/StoriesPresenter.js';
import { StoryCard } from './components/StoryCard.js';
import { MapService } from '../services/MapService.js';

export class StoriesView {
    constructor() {
        this.model = new StoriesModel();
        this.presenter = new StoriesPresenter(this.model, this);
        this.mapService = new MapService('stories-map');
        this.storiesContainer = null;
    }

async render() {
    this.storiesContainer = document.getElementById('stories-container');
    this.initMap(); // Inisialisasi peta terlebih dahulu
    await this.presenter.loadAllStories();
}

updateMapWithStories(stories) {
    if (!stories || stories.length === 0) return;
    
    // Filter hanya stories yang punya lokasi valid
    const validStories = stories.filter(story => 
        story.lat !== null && 
        story.lon !== null &&
        !isNaN(story.lat) && 
        !isNaN(story.lon)
    );
    
    this.mapService.clearMarkers();
    
    validStories.forEach(story => {
        const popupContent = `
            <div class="map-popup">
                <img src="${story.photoUrl}" alt="${story.name}" class="map-popup-image">
                <h4>${story.name}</h4>
                <p>${story.shortDescription || 'Tidak ada deskripsi'}</p>
                <small>${story.formattedDate || ''}</small>
            </div>
        `;
        
        this.mapService.addMarker(
            [parseFloat(story.lat), parseFloat(story.lon)],
            popupContent
        );
    });
    
    // Fit map hanya jika ada markers
    if (validStories.length > 0) {
        this.mapService.fitToMarkers();
    }
}

    showLoading() {
        document.getElementById('stories-loading').style.display = 'flex';
    }

    hideLoading() {
        document.getElementById('stories-loading').style.display = 'none';
    }

    renderAllStories(stories) {
        if (!this.storiesContainer) return;

        if (!stories || stories.length === 0) {
            this.renderEmptyState();
            return;
        }

        // Clear previous content
        this.storiesContainer.innerHTML = '';

        // Create and append story cards
        stories.forEach(story => {
            const storyCard = new StoryCard(story);
            this.storiesContainer.appendChild(storyCard.render());
        });

        // Update map with story locations
        this.updateMapWithStories(stories.filter(s => s.lat && s.lon));
    }

    renderEmptyState() {
        this.storiesContainer.innerHTML = `
            <div class="empty-state" role="alert" aria-label="Tidak ada cerita yang tersedia">
                <i class="fas fa-book-open" aria-hidden="true"></i>
                <h3>Belum ada cerita</h3>
                <p>Jadilah yang pertama membagikan cerita Anda!</p>
                <button class="btn btn-primary" onclick="navigateToPage('add-story')">
                    <i class="fas fa-plus" aria-hidden="true"></i> Tambah Cerita
                </button>
            </div>
        `;
    }

    renderError(message) {
        this.storiesContainer.innerHTML = `
            <div class="error-message" role="alert">
                <i class="fas fa-exclamation-triangle" aria-hidden="true"></i>
                <p>${message || 'Gagal memuat cerita. Silakan coba lagi.'}</p>
                <button class="btn btn-secondary" onclick="location.reload()">
                    <i class="fas fa-sync-alt" aria-hidden="true"></i> Muat Ulang
                </button>
            </div>
        `;
    }

    initMap() {
        this.mapService.initMap([-2.5489, 118.0149], 5); // Center on Indonesia
        // Hapus baris ini agar tidak double control layers:
        // this.mapService.addTileLayers();
    }

    updateMapWithStories(stories) {
        if (!stories || stories.length === 0) return;
        
        this.mapService.clearMarkers();
        
        stories.forEach(story => {
            const popupContent = `
                <div class="map-popup">
                    <img src="${story.photoUrl}" alt="${story.name}" class="map-popup-image">
                    <h4>${story.name}</h4>
                    <p>${story.description || 'Tidak ada deskripsi'}</p>
                    <small>${story.formattedDate || ''}</small>
                </div>
            `;
            
            this.mapService.addMarker(
                [story.lat, story.lon],
                popupContent
            );
        });
        
        if (stories.length > 1) {
            this.mapService.fitToMarkers();
        } else if (stories.length === 1) {
            this.mapService.setView([stories[0].lat, stories[0].lon], 13);
        }
    }
}