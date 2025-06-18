// CSS imports
import '../styles/styles.css';

import App from './app.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize the app with proper DOM elements
  const app = new App();
  await app.init();

  // Handle hash changes for routing
  window.addEventListener('hashchange', async () => {
    await app.init();
  });
});