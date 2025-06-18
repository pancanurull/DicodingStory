// presenters/HomePresenter.js
export class HomePresenter {
    constructor(model, view) {
        this.model = model;
        this.view = view;
    }

    async loadFeaturedStories() {
        try {
            this.view.showLoading();
            
            const response = await this.model.getFeaturedStories();
            
            if (!response || !response.listStory || response.listStory.length === 0) {
                this.view.renderEmptyState();
                return;
            }
            
            const transformedStories = this.model.transformStoryData(response.listStory);
            this.view.renderFeaturedStories(transformedStories);
        } catch (error) {
            console.error('Error loading featured stories:', error);
            this.view.handleError(error);
        }
    }
}