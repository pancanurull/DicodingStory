// views/HomeView.js
import { StoriesModel } from '../models/StoriesModel.js';
import { HomePresenter } from '../presenters/HomePresenter.js';
import { StoryCard } from './components/StoryCard.js';

export class HomeView {
    constructor() {
        this.model = new StoriesModel();
        this.presenter = new HomePresenter(this.model, this);
        this.featuredStoriesContainer = null;
    }

    async render() {
        this.featuredStoriesContainer = document.getElementById('featured-stories');
        if (this.featuredStoriesContainer) {
            await this.presenter.loadFeaturedStories();
        }
    }

    showLoading() {
        if (this.featuredStoriesContainer) {
            this.featuredStoriesContainer.innerHTML = `
                <div class="loading" role="status" aria-label="Memuat featured stories">
                    <div class="spinner"></div>
                    <p>Memuat cerita terbaru...</p>
                </div>
            `;
        }
    }

    handleError(error) {
        if (error.message.includes('koneksi internet')) {
            this.renderError('Tidak ada koneksi internet. Periksa jaringan Anda.');
        } else if (error.message.includes('Sesi telah berakhir')) {
            this.renderError('Sesi Anda telah berakhir. Silakan login kembali.');
            this.navigateToLoginAfterDelay();
        } else {
            this.renderError(error.message || 'Gagal memuat cerita terbaru. Silakan coba lagi.');
        }
    }

    navigateToLoginAfterDelay() {
        setTimeout(() => {
            window.location.hash = 'login';
        }, 3000);
    }

    renderFeaturedStories(stories) {
        if (!this.featuredStoriesContainer) return;

        if (!stories || stories.length === 0) {
            this.renderEmptyState();
            return;
        }

        this.featuredStoriesContainer.innerHTML = '';

        stories.forEach(story => {
            const storyCard = new StoryCard(story);
            this.featuredStoriesContainer.appendChild(storyCard.render());
        });

        this.addStoryCardListeners();
    }

    renderEmptyState() {
        if (!this.featuredStoriesContainer) return;

        this.featuredStoriesContainer.innerHTML = `
            <div class="empty-state" role="alert" aria-label="Tidak ada cerita yang tersedia">
                <i class="fas fa-book-open fa-3x" aria-hidden="true"></i>
                <h3>Belum ada cerita</h3>
                <p>Mulailah dengan membagikan cerita Anda sendiri!</p>
                <div class="empty-actions">
                    ${this.model.isAuthenticated() ? `
                    <button class="btn btn-primary" onclick="navigateToPage('add-story')">
                        <i class="fas fa-plus"></i> Tambah Cerita
                    </button>
                    ` : `
                    <button class="btn btn-primary" onclick="navigateToPage('login')">
                        <i class="fas fa-sign-in-alt"></i> Login untuk Membagikan Cerita
                    </button>
                    `}
                    <button class="btn btn-secondary" onclick="navigateToPage('stories')">
                        <i class="fas fa-book-reader"></i> Lihat Semua Cerita
                    </button>
                </div>
            </div>
        `;
    }

    renderError(message) {
        if (!this.featuredStoriesContainer) return;

        this.featuredStoriesContainer.innerHTML = `
            <div class="error-message" role="alert">
                <i class="fas fa-exclamation-triangle" aria-hidden="true"></i>
                <h3>Terjadi Kesalahan</h3>
                <p>${message || 'Gagal memuat cerita terbaru.'}</p>
                <div class="error-actions">
                    <button class="btn btn-primary" onclick="location.reload()">
                        <i class="fas fa-sync-alt"></i> Coba Lagi
                    </button>
                    <button class="btn btn-secondary" onclick="navigateToPage('stories')">
                        <i class="fas fa-book-open"></i> Lihat Semua Cerita
                    </button>
                </div>
            </div>
        `;
    }

    addStoryCardListeners() {
        const cards = this.featuredStoriesContainer.querySelectorAll('.story-card');
        cards.forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.story-actions')) {
                    const storyId = card.dataset.storyId;
                    console.log(`View story ${storyId}`);
                }
            });
        });
    }
}