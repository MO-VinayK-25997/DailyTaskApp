// Page Loader Module - Load HTML pages dynamically
class PageLoader {
    constructor() {
        this.loadedPages = new Set();
        this.pageContainer = null;
    }

    async init() {
        this.pageContainer = document.getElementById('pageContainer');
        await this.loadCommonComponents();
        
        // Handle browser back/forward buttons
        window.addEventListener('popstate', (e) => {
            const pageId = e.state?.page || window.location.hash.substring(1) || 'home';
            this.showPageWithoutHistory(pageId);
        });
        
        // Load initial page from URL or default to home
        const initialPage = window.location.hash.substring(1) || 'home';
        await this.loadPage(initialPage);
        
        // Show the initial page
        const targetPage = document.getElementById(initialPage);
        if (targetPage) {
            targetPage.classList.add('active');
        }
        this.updateNavigation(initialPage);
    }

    async loadCommonComponents() {
        try {
            // Load header
            const headerResponse = await fetch('includes/header.html');
            const headerHtml = await headerResponse.text();
            document.getElementById('headerContainer').innerHTML = headerHtml;

            // Load navigation
            const navResponse = await fetch('includes/navigation.html');
            const navHtml = await navResponse.text();
            document.getElementById('navContainer').innerHTML = navHtml;

            // Load footer
            const footerResponse = await fetch('includes/footer.html');
            const footerHtml = await footerResponse.text();
            document.getElementById('footerContainer').innerHTML = footerHtml;
        } catch (error) {
            console.error('Error loading common components:', error);
        }
    }

    async loadPage(pageName) {
        if (this.loadedPages.has(pageName)) {
            return;
        }

        try {
            const response = await fetch(`pages/${pageName}.html`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            const html = await response.text();
            
            // Directly insert the HTML
            this.pageContainer.insertAdjacentHTML('beforeend', html);
            
            this.loadedPages.add(pageName);
        } catch (error) {
            console.error(`Error loading page ${pageName}:`, error);
            // Create fallback page
            this.pageContainer.innerHTML += `<div class="page" id="${pageName}"><h2>Page not found</h2></div>`;
            this.loadedPages.add(pageName);
        }
    }

    async showPage(pageId) {
        // Load page if not already loaded
        if (!this.loadedPages.has(pageId)) {
            await this.loadPage(pageId);
        }

        // Hide all pages
        const pages = document.querySelectorAll('.page');
        pages.forEach(page => page.classList.remove('active'));

        // Show target page
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
        }

        // Update URL without page reload
        history.pushState({ page: pageId }, '', `#${pageId}`);

        // Update navigation states
        this.updateNavigation(pageId);
    }

    updateNavigation(pageId) {
        const navItems = document.querySelectorAll('.nav-item');
        const footerBtns = document.querySelectorAll('.footer-btn');
        
        navItems.forEach(item => item.classList.remove('active'));
        footerBtns.forEach(btn => btn.classList.remove('active'));
        
        document.querySelector(`[href="#${pageId}"]`)?.classList.add('active');
        document.querySelector(`[data-page="${pageId}"]`)?.classList.add('active');
    }
}

    async showPageWithoutHistory(pageId) {
        // Load page if not already loaded
        if (!this.loadedPages.has(pageId)) {
            await this.loadPage(pageId);
        }

        // Hide all pages
        const pages = document.querySelectorAll('.page');
        pages.forEach(page => page.classList.remove('active'));

        // Show target page
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
        }

        // Update navigation states
        this.updateNavigation(pageId);
        
        // Trigger page-specific functions
        if (pageId === 'reports') {
            setTimeout(() => generateReport(), 100);
        }
        
        if (pageId === 'admin' && window.currentUser && window.currentUser.role === 'admin') {
            setTimeout(() => loadAdminData(), 100);
        }
    }
}

// Global page loader instance
window.pageLoader = new PageLoader();