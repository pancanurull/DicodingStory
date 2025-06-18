// presenters/AddStoryPresenter.js
export class AddStoryPresenter {
    constructor(model, view) {
        this.model = model;
        this.view = view;
    }

    async addNewStory(storyData) {
        try {
            this.view.showLoading();
            
            // Validate story data
            const errors = this.model.validateStoryData(storyData);
            if (errors.length > 0) {
                throw new Error(errors[0]);
            }
            
            // Add story through model
            const response = await this.model.addNewStory(storyData);
            
            // Show success message
            this.view.showSuccess(response.message);
            
            // If we want to navigate after success
            // window.location.hash = 'stories';
        } catch (error) {
            console.error('Error adding story:', error);
            this.view.showError(error.message);
        } finally {
            this.view.hideLoading();
        }
    }
}