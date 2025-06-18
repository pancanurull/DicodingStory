export class RouterService {
    constructor() {
        this.routes = new Map();
        this.currentRoute = null;
    }

    init() {
        this.handleRouteChange();
        window.addEventListener('hashchange', () => {
            this.handleRouteChange();
        });
    }

    addRoute(path, handler) {
        this.routes.set(path, handler);
    }

    getCurrentRoute() {
        const hash = window.location.hash.substring(1);
        return hash || 'home';
    }

    navigate(path) {
        if (path === this.currentRoute) return;

        if ('startViewTransition' in document) {
            document.startViewTransition(() => {
                this.currentRoute = path;
                window.location.hash = path === 'home' ? '' : path;
            });
        } else {
            this.currentRoute = path;
            window.location.hash = path === 'home' ? '' : path;
        }
    }

    updateActiveNavLink(route) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.page === route) {
                link.classList.add('active');
            }
        });
    }

    async navigateWithTransition(path, callback) {
        if (path === this.currentRoute) return;

        if ('startViewTransition' in document) {
            const transition = document.startViewTransition(async () => {
                this.currentRoute = path;
                window.location.hash = path === 'home' ? '' : path;
                
                document.documentElement.style.viewTransitionName = 'page';
                
                this.updateActiveNavLink(path);
                
                document.querySelectorAll('.page-section').forEach(section => {
                    section.classList.remove('active');
                });
                
                const activePage = document.getElementById(`${path}-page`);
                if (activePage) {
                    activePage.classList.add('active');
                }
                
                if (callback) await callback();
            });
            
            return transition;
        } else {
            this.currentRoute = path;
            window.location.hash = path === 'home' ? '' : path;
            this.updateActiveNavLink(path);
            
            document.querySelectorAll('.page-section').forEach(section => {
                section.classList.remove('active');
            });
            
            const activePage = document.getElementById(`${path}-page`);
            if (activePage) {
                activePage.classList.add('active');
            }
            
            if (callback) await callback();
        }
    }

    async handleRouteChange() {
        const newRoute = this.getCurrentRoute();
        if (newRoute !== this.currentRoute) {
            this.currentRoute = newRoute;
            
            this.updateActiveNavLink(newRoute);
            
            document.querySelectorAll('.page-section').forEach(section => {
                section.classList.remove('active');
            });
            
            const activePage = document.getElementById(`${newRoute}-page`);
            if (activePage) {
                activePage.classList.add('active');
            } else {
                // Tambahkan ini untuk menampilkan halaman 404
                document.getElementById('not-found-page').classList.add('active');
            }
            
            const handler = this.routes.get(newRoute) || this.routes.get('');
            if (handler) {
                await handler();
            }
        }
    }
}