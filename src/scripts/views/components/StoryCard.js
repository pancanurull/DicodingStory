export class StoryCard {
    constructor(story) {
        this.story = story;
    }

    render() {
        const card = document.createElement('article');
        card.className = 'glass-card story-card';
        card.dataset.storyId = this.story.id;
        card.setAttribute('role', 'article');
        card.setAttribute('aria-label', `Cerita oleh ${this.story.name}`);

        const hasLocation = this.story.lat && this.story.lon;
        const locationIcon = hasLocation ? 
            '<i class="fas fa-map-marker-alt" aria-hidden="true"></i>' : '';

        card.innerHTML = `
            <img 
                src="${this.story.photoUrl}" 
                alt="Story oleh ${this.story.name}"
                class="story-card-img"
                loading="lazy"
                onerror="this.onerror=null;this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'300\\' height=\\'200\\' viewBox=\\'0 0 300 200\\'%3E%3Crect width=\\'300\\' height=\\'200\\' fill=\\'%23667eea\\'/%3E%3Ctext x=\\'50%\\' y=\\'50%\\' font-size=\\'16\\' text-anchor=\\'middle\\' fill=\\'white\\'%3EGambar tidak tersedia%3C/text%3E%3C/svg%3E'">
            <div class="story-card-content">
                <div class="story-card-user">
                    <img src="/icons/user.png" alt="${this.story.name}" class="story-card-user-img" />
                    <span class="story-card-user-name">${this.story.name}</span>
                    <span class="story-card-date">${this.story.formattedDate || 'Tanggal tidak tersedia'}</span>
                </div>
                <div class="story-card-desc">${this.story.description || 'Tidak ada deskripsi'}</div>
                ${hasLocation ? `<div class="story-card-location">${locationIcon} Lokasi tersedia</div>` : ''}
                <div class="story-card-actions">
                    <button aria-label="Suka cerita ini"><i class="fas fa-heart"></i></button>
                    <button aria-label="Bagikan cerita"><i class="fas fa-share-alt"></i></button>
                </div>
            </div>
        `;
        return card;
    }
}