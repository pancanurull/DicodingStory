export class StoriesPresenter {
    constructor(model, view) {
        this.model = model;
        this.view = view;
    }

    async loadAllStories() {
        try {
            this.view.showLoading();
            
            // 1. Get raw data from API
            const response = await this.model.getAllStories({ location: 1 });
            
            // 2. Validate response structure
            if (!response || !response.listStory) {
                throw new Error('Invalid API response format');
            }

            // 3. Transform data for view
            const transformedStories = this.model.transformStoryData(response.listStory);
            
            // 4. Handle empty state
            if (!transformedStories || transformedStories.length === 0) {
                this.view.renderEmptyState();
                return;
            }
            
            // 5. Render the view
            this.view.renderAllStories(transformedStories);
            
        } catch (error) {
            // Enhanced error logging
            console.error('Error loading stories:', {
                message: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString()
            });
            
            // User-friendly error messages
            let userMessage = 'Gagal memuat stories. Silakan coba lagi.';
            
            if (error.message.includes('NetworkError')) {
                userMessage = 'Gagal terhubung ke internet. Periksa koneksi Anda.';
            } else if (error.message.includes('401')) {
                userMessage = 'Sesi telah berakhir. Silakan login kembali.';
            }
            
            this.view.renderError(userMessage);
            
        } finally {
            this.view.hideLoading();
        }
    }
}