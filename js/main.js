// Main Application Module - Event Listeners and Initialization

document.addEventListener('DOMContentLoaded', async function() {
    console.log('Mobile App loaded successfully!');
    
    // Initialize database
    await initAuthData();
    
    // Check if user is logged in
    if (currentUser) {
        showApp();
    } else {
        showAuth();
    }
    
    // Check for admin registration URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === 'true') {
        const roleSelect = document.getElementById('regRole');
        if (roleSelect) {
            roleSelect.style.display = 'block';
            roleSelect.value = 'admin';
        }
    }
    
    // Authentication event listeners
    document.getElementById('loginBtn')?.addEventListener('click', login);
    document.getElementById('registerBtn')?.addEventListener('click', register);
    
    // Mobile navigation - use delegation for dynamically loaded elements
    document.addEventListener('click', function(e) {
        if (e.target.id === 'menuBtn') {
            const mobileNav = document.getElementById('mobileNav');
            mobileNav?.classList.toggle('open');
        }
        
        if (e.target.id === 'profileBtn') {
            showPage('profile');
        }
        
        if (e.target.id === 'logoutBtn') {
            // Enhanced logout with animation
            e.target.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            e.target.disabled = true;
            
            setTimeout(() => {
                if (confirm('Are you sure you want to logout?')) {
                    logout();
                } else {
                    e.target.innerHTML = '<i class="fas fa-power-off"></i>';
                    e.target.disabled = false;
                }
            }, 300);
        }
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        const mobileNav = document.getElementById('mobileNav');
        const menuBtn = document.getElementById('menuBtn');
        if (mobileNav && !mobileNav.contains(e.target) && !menuBtn?.contains(e.target)) {
            mobileNav.classList.remove('open');
        }
    });
    
    // Navigation event listeners - use delegation since elements are loaded dynamically
    document.addEventListener('click', function(e) {
        console.log('Clicked:', e.target, 'Classes:', e.target.className);
        
        if (e.target.classList.contains('nav-item')) {
            e.preventDefault();
            const pageId = e.target.getAttribute('href').substring(1);
            console.log('Nav item clicked, pageId:', pageId);
            if (pageId) {
                showPage(pageId);
            }
        }
        
        if (e.target.classList.contains('footer-btn')) {
            const pageId = e.target.getAttribute('data-page');
            console.log('Footer btn clicked, pageId:', pageId);
            if (pageId) {
                showPage(pageId);
            }
        }
    });
    

    

    

    

    
    // Admin project management
    const adminAddProjectBtn = document.getElementById('adminAddProjectBtn');
    const adminProjectName = document.getElementById('adminProjectName');
    
    adminAddProjectBtn?.addEventListener('click', () => {
        if (currentUser && currentUser.role === 'admin') {
            const name = adminProjectName.value.trim();
            if (name) {
                projects.push({
                    id: Date.now(),
                    name: name,
                    createdDate: new Date().toLocaleDateString(),
                    status: 'Active',
                    createdBy: 'admin'
                });
                saveProjects();
                loadAdminProjects();
                adminProjectName.value = '';
                showNotification('Project created successfully!');
            }
        }
    });
    
    // Touch gestures
    let startX = 0;
    let startY = 0;
    
    document.addEventListener('touchstart', function(e) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    });
    
    document.addEventListener('touchend', function(e) {
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const diffX = startX - endX;
        const diffY = startY - endY;
        
        if (diffX < -50 && Math.abs(diffY) < 100) {
            mobileNav?.classList.add('open');
        }
        else if (diffX > 50 && Math.abs(diffY) < 100 && mobileNav?.classList.contains('open')) {
            mobileNav.classList.remove('open');
        }
    });
    
    // Dark mode initialization
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    if (savedDarkMode) {
        document.body.classList.add('dark-mode');
    }
    
    // Dark mode toggle using event delegation
    document.addEventListener('change', function(e) {
        if (e.target.id === 'darkMode') {
            if (e.target.checked) {
                document.body.classList.add('dark-mode');
                localStorage.setItem('darkMode', 'true');
            } else {
                document.body.classList.remove('dark-mode');
                localStorage.setItem('darkMode', 'false');
            }
        }
    });
    
    // Initialize app if logged in
    if (currentUser) {
        renderTodos();
        renderTeamMembers();
        renderCollaborationRequests();
        renderActiveCollaborations();
        updateStats();
        updateProfile();
        renderProjects();
    }
});