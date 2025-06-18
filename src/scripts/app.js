import { RouterService } from './services/RouterService.js';
import { HomeView } from './views/HomeView.js';
import { StoriesView } from './views/StoriesView.js';
import { AddStoryView } from './views/AddStoryView.js';
import { LoginView } from './views/LoginView.js';
import { AuthModel } from './models/AuthModel.js';
import { NotificationModel } from './models/NotificationModel.js';

class App {
    constructor() {
        this.router = new RouterService();
        this.authModel = new AuthModel();
        this.notificationModel = new NotificationModel();
    }

    async init() {
        this.setupRoutes();
        this.router.init();
        this.setupMobileMenu();
        this.updateAuthUI();
        this.checkAuth();

        if (this.authModel.isAuthenticated()) {
            await this.initNotifications();
        }
    }

    setupRoutes() {
        this.router.addRoute('home', async () => {
            const homeView = new HomeView();
            await homeView.render();
            this.updateAuthUI();
        });

        this.router.addRoute('stories', async () => {
            const storiesView = new StoriesView();
            await storiesView.render();
            this.updateAuthUI();
        });

        this.router.addRoute('add-story', async () => {
            const addStoryView = new AddStoryView();
            await addStoryView.render();
            this.updateAuthUI();
        });

        this.router.addRoute('login', async () => {
            const loginView = new LoginView();
            await loginView.render();
            this.updateAuthUI();
        });

        this.router.addRoute('logout', async () => {
            await this.handleLogout();
        });

        this.router.addRoute('', async () => {
            this.router.navigate('home');
        });
    }    setupMobileMenu() {
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const navLinks = document.getElementById('nav-links');
        
        // Handle menu button click
        mobileMenuBtn.addEventListener('click', () => {
            const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
            mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);
            mobileMenuBtn.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (event) => {
            if (!event.target.closest('#mobile-menu-btn') && 
                !event.target.closest('#nav-links') && 
                navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
            }
        });

        // Close menu when clicking on a link
        navLinks.addEventListener('click', (event) => {
            if (event.target.tagName === 'A') {
                navLinks.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
            }
        });

        // Handle escape key
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
            }
        });
    }

    updateAuthUI() {
        const authNavItem = document.getElementById('auth-nav-item');
        const authNavLink = document.getElementById('auth-nav-link');
        
        if (!authNavItem || !authNavLink) return;
        
        if (this.authModel.isAuthenticated()) {
            authNavLink.innerHTML = '<i class="fas fa-sign-out-alt" aria-hidden="true"></i> Logout';
            authNavLink.href = '#logout';
            authNavLink.onclick = (e) => {
                e.preventDefault();
                this.handleLogout();
            };
            authNavLink.classList.add('logout');
        } else {
            authNavLink.innerHTML = '<i class="fas fa-sign-in-alt" aria-hidden="true"></i> Login';
            authNavLink.href = '#login';
            authNavLink.onclick = null;
            authNavLink.classList.remove('logout');
        }
    }

    async handleLogout() {
        try {
            await this.authModel.logout();
            this.updateAuthUI();
            this.router.navigate('login');
            
            // Hapus subscription notifikasi
            if ('serviceWorker' in navigator) {
                const registration = await navigator.serviceWorker.ready;
                const subscription = await registration.pushManager.getSubscription();
                if (subscription) {
                    await this.notificationModel.unsubscribeFromNotifications(subscription.endpoint);
                }
            }
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }

    checkAuth() {
        const currentRoute = this.router.getCurrentRoute();
        const isAuthRoute = currentRoute === 'login' || currentRoute === 'logout';
        
        if (!this.authModel.isAuthenticated() && !isAuthRoute) {
            this.router.navigate('login');
        } else if (this.authModel.isAuthenticated() && currentRoute === 'login') {
            this.router.navigate('home');
        }
    }

    async initNotifications() {
        try {
            const permission = await this.notificationModel.checkNotificationPermission();
            
            if (permission === 'default') {
                const result = await this.notificationModel.requestNotificationPermission();
                if (result !== 'granted') return;
            } else if (permission !== 'granted') {
                return;
            }
            
            const registration = await this.notificationModel.registerServiceWorker();
            const subscription = await this.notificationModel.createSubscription(registration);
            await this.notificationModel.subscribeToNotifications(subscription);
            
            console.log('Push notifications subscribed');
        } catch (error) {
            console.error('Notification setup failed:', error);
        }
    }
}

    document.addEventListener('DOMContentLoaded', async () => {
        const app = new App();
        await app.init();
        
        window.navigateToPage = (page) => {
            app.router.navigate(page);
        };
        
        window.showRegisterForm = () => {
            document.getElementById('register-section').style.display = 'block';
        };
    });

App.prototype.updateOnlineStatus = function() {
    const statusElement = document.createElement('div');
    statusElement.id = 'network-status';
    statusElement.style.position = 'fixed';
    statusElement.style.bottom = '10px';
    statusElement.style.right = '10px';
    statusElement.style.padding = '8px 16px';
    statusElement.style.borderRadius = '20px';
    statusElement.style.zIndex = '1000';
    
    if (navigator.onLine) {
        statusElement.textContent = 'Online';
        statusElement.style.background = 'var(--success-gradient)';
    } else {
        statusElement.textContent = 'Offline';
        statusElement.style.background = 'var(--secondary-gradient)';
    }
    
    document.body.appendChild(statusElement);
    
    window.addEventListener('online', () => {
        statusElement.textContent = 'Online';
        statusElement.style.background = 'var(--success-gradient)';
        setTimeout(() => {
            statusElement.remove();
        }, 3000);
    });
    
    window.addEventListener('offline', () => {
        statusElement.textContent = 'Offline';
        statusElement.style.background = 'var(--secondary-gradient)';
    });
};

export default App;