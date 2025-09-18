// Utility Functions Module

// Helper functions for user data
function getUserTodos() {
    return todos.filter(todo => todo.userId === currentUser.id);
}

function getUserTeamMembers() {
    return teamMembers.filter(member => member.userId === currentUser.id);
}

function getUserProjects() {
    return projects.filter(project => project.userId === currentUser.id);
}

// Save functions
function saveProjects() {
    window.projects = projects;
    db.saveProjects(projects);
}

function saveTeamMembers() {
    window.teamMembers = teamMembers;
    db.saveTeamMembers(teamMembers);
}

function saveActiveCollaborations() {
    window.activeCollaborations = activeCollaborations;
    db.saveActiveCollaborations(activeCollaborations);
}

// Render functions
function renderProjects() {
    // Projects rendering logic if needed
}

// Update dashboard stats
function updateStats() {
    if (!currentUser) return;
    
    const userTodos = getUserTodos();
    const userTeamMembers = getUserTeamMembers();
    const userProjects = getUserProjects();
    
    const todoCountEl = document.getElementById('todoCount');
    const teamCountEl = document.getElementById('teamCount');
    const projectCountEl = document.getElementById('projectCount');
    const completedTodosEl = document.getElementById('completedTodos');
    const activeProjectsEl = document.getElementById('activeProjects');
    
    if (todoCountEl) todoCountEl.textContent = userTodos.filter(t => t.status !== 'completed').length;
    if (teamCountEl) {
        const userTeamMembers = getUserTeamMembers();
        const myCollaborations = activeCollaborations.filter(c => 
            c.user1Id === currentUser.id || c.user2Id === currentUser.id
        );
        teamCountEl.textContent = userTeamMembers.length + myCollaborations.length;
    }
    if (projectCountEl) {
        const userTodos = getUserTodos();
        const projectsWithTodos = [...new Set(userTodos.map(t => t.projectId))].filter(id => id);
        projectCountEl.textContent = projectsWithTodos.length;
    }
    if (completedTodosEl) completedTodosEl.textContent = userTodos.filter(t => t.status === 'completed').length;
    if (activeProjectsEl) activeProjectsEl.textContent = userProjects.filter(p => p.status === 'Active').length;
}

// Utility functions
window.showNotification = function(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 5rem;
        left: 50%;
        transform: translateX(-50%);
        background: #333;
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        z-index: 2000;
        animation: slideDown 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Page navigation
window.showPage = function(pageId) {
    console.log('showPage called with:', pageId);
    
    fetch(`pages/${pageId}.html`)
        .then(response => {
            console.log('Fetch response:', response.status);
            return response.text();
        })
        .then(html => {
            console.log('HTML loaded for:', pageId);
            document.getElementById('pageContainer').innerHTML = html;
            
            // Add active class to the loaded page
            const loadedPage = document.getElementById(pageId);
            if (loadedPage) {
                loadedPage.classList.add('active');
            }
            
            // Update navigation active states
            document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
            document.querySelectorAll('.footer-btn').forEach(btn => btn.classList.remove('active'));
            
            document.querySelector(`[href="#${pageId}"]`)?.classList.add('active');
            document.querySelector(`[data-page="${pageId}"]`)?.classList.add('active');
            
            const mobileNav = document.getElementById('mobileNav');
            mobileNav?.classList.remove('open');
            updateStats();
            
            // Initialize page-specific functionality
            if (pageId === 'todos') {
                setTimeout(() => {
                    populateProjectSelect();
                    renderTodos();
                    setupTodoEventListeners();
                }, 100);
            }
            
            if (pageId === 'team') {
                setTimeout(() => {
                    renderCollaborationRequests();
                    renderActiveCollaborations();
                    setupTeamEventListeners();
                }, 100);
            }
            
            if (pageId === 'profile') {
                setTimeout(() => {
                    updateProfile();
                    setupProfileEventListeners();
                }, 100);
            }
            
            if (pageId === 'reports') {
                setTimeout(() => generateReport(), 100);
            }
            
            if (pageId === 'admin' && currentUser && currentUser.role === 'admin') {
                setTimeout(() => loadAdminData(), 100);
            }
            
            if (pageId === 'settings') {
                setTimeout(() => {
                    const darkModeToggle = document.getElementById('darkMode');
                    if (darkModeToggle) {
                        darkModeToggle.checked = localStorage.getItem('darkMode') === 'true';
                    }
                }, 100);
            }
            
            if (pageId === 'home') {
                setTimeout(() => updateStats(), 100);
            }
        })
        .catch(error => {
            console.error('Error loading page:', error);
            document.getElementById('pageContainer').innerHTML = `<div class="page active" id="${pageId}"><h2>Page not found</h2></div>`;
        });
}

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from { transform: translate(-50%, -100%); opacity: 0; }
        to { transform: translate(-50%, 0); opacity: 1; }
    }
`;
document.head.appendChild(style);