// Authentication Module - Global Variables
window.users = [];
window.currentUser = null;

// Make variables globally accessible
let users = window.users;
let currentUser = window.currentUser;

// Initialize data from JSON files
async function initAuthData() {
    try {
        users = await db.getUsers() || [];
        currentUser = await db.getCurrentUser();
        todos = await db.getTodos() || [];
        projects = await db.getProjects() || [];
        teamMembers = await db.getTeamMembers() || [];
        activeCollaborations = await db.getActiveCollaborations() || [];
        collaborationRequests = await db.getCollaborationRequests() || [];
        
        // Fallback to localStorage if Firebase fails
        if (!users.length) {
            const localUsers = localStorage.getItem('dailyTaskApp_users');
            users = localUsers ? JSON.parse(localUsers) : [];
        }
        
        window.users = users;
        window.currentUser = currentUser;
        window.todos = todos;
        window.projects = projects;
        window.teamMembers = teamMembers;
        window.activeCollaborations = activeCollaborations;
        window.collaborationRequests = collaborationRequests;
        
        console.log('Data initialized successfully');
    } catch (error) {
        console.error('Error initializing data:', error);
        // Initialize with empty arrays
        users = [];
        todos = [];
        projects = [];
        teamMembers = [];
        activeCollaborations = [];
        collaborationRequests = [];
        currentUser = null;
    }
}

// Authentication functions
function showAuth() {
    document.getElementById('loaderContainer').style.display = 'none';
    document.getElementById('authContainer').style.display = 'flex';
    document.getElementById('appContainer').style.display = 'none';
}

function showApp() {
    document.getElementById('loaderContainer').style.display = 'none';
    document.getElementById('authContainer').style.display = 'none';
    document.getElementById('appContainer').style.display = 'flex';
    
    // Load pages directly without page loader
    document.getElementById('headerContainer').innerHTML = `
        <header class="mobile-header">
            <button class="menu-btn" id="menuBtn">☰</button>
            <h1>Daily Task App</h1>
            <div class="header-actions">
                <button class="profile-btn" id="profileBtn">👤</button>
                <button class="logout-btn" id="logoutBtn" title="Logout"><i class="fas fa-power-off"></i></button>
            </div>
        </header>
    `;
    
    document.getElementById('navContainer').innerHTML = `
        <nav class="mobile-nav" id="mobileNav">
            <a href="#home" class="nav-item active">🏠 Home</a>
            <a href="#todos" class="nav-item">📝 Todo List</a>
            <a href="#team" class="nav-item">👥 Team</a>
            <a href="#reports" class="nav-item">📊 Reports</a>
            <a href="#admin" class="nav-item admin-only">👑 Admin</a>
            <a href="#profile" class="nav-item">👤 Profile</a>
            <a href="#settings" class="nav-item">⚙️ Settings</a>
        </nav>
    `;
    
    document.getElementById('footerContainer').innerHTML = `
        <footer class="mobile-footer">
            <button class="footer-btn active" data-page="home">🏠</button>
            <button class="footer-btn" data-page="todos">📝</button>
            <button class="footer-btn" data-page="team">👥</button>
            <button class="footer-btn" data-page="reports">📊</button>
            <button class="footer-btn admin-only" data-page="admin">👑</button>
            <button class="footer-btn" data-page="profile">👤</button>
            <button class="footer-btn" data-page="settings">⚙️</button>
        </footer>
    `;
    
    // Load home page directly
    fetch('pages/home.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById('pageContainer').innerHTML = html;
            setTimeout(() => updateStats(), 100);
        })
        .catch(() => {
            document.getElementById('pageContainer').innerHTML = `
                <div class="page active" id="home">
                    <h2>Dashboard</h2>
                    <div class="card">
                        <h3>Today's Summary</h3>
                        <div class="stats">
                            <div class="stat-item">
                                <span class="stat-number" id="todoCount">0</span>
                                <span class="stat-label">Todos</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
    
    // Show admin features if user is admin
    if (currentUser && currentUser.role === 'admin') {
        setTimeout(() => {
            document.querySelectorAll('.admin-only').forEach(el => {
                el.classList.add('show');
            });
        }, 100);
    }
}

window.showLogin = function() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    if (loginForm && registerForm) {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    }
}

window.showRegister = function() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    if (loginForm && registerForm) {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    }
}

async function login() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    
    if (!email || !password) {
        showNotification('Please fill all fields');
        return;
    }
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        window.currentUser = currentUser;
        await db.saveCurrentUser(currentUser);
        showApp();
        showNotification('Login successful!');
    } else {
        showNotification('Invalid credentials');
    }
}

async function register() {
    const username = document.getElementById('regUsername').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value.trim();
    const roleSelect = document.getElementById('regRole');
    const role = roleSelect.style.display === 'none' ? 'user' : roleSelect.value;
    
    if (!username || !email || !password) {
        showNotification('Please fill all fields');
        return;
    }
    
    if (users.find(u => u.email === email)) {
        showNotification('Email already exists');
        return;
    }
    
    const newUser = {
        id: Date.now(),
        username: username,
        email: email,
        password: password,
        role: role,
        joinDate: new Date().toLocaleDateString()
    };
    
    users.push(newUser);
    window.users = users;
    await db.saveUsers(users);
    
    currentUser = newUser;
    window.currentUser = currentUser;
    await db.saveCurrentUser(currentUser);
    
    showApp();
    showNotification('Registration successful!');
}

window.logout = async function() {
    currentUser = null;
    window.currentUser = null;
    await db.saveCurrentUser(null);
    
    // Hide admin features
    document.querySelectorAll('.admin-only').forEach(el => {
        el.classList.remove('show');
        el.style.display = 'none';
    });
    
    showAuth();
    showNotification('Logged out successfully');
}

// Update profile display
function updateProfile() {
    if (currentUser) {
        const profileUsername = document.getElementById('profileUsername');
        const profileRole = document.getElementById('profileRole');
        const displayUsername = document.getElementById('displayUsername');
        const displayEmail = document.getElementById('displayEmail');
        const displayRole = document.getElementById('displayRole');
        const displayJoinDate = document.getElementById('displayJoinDate');
        
        if (profileUsername) profileUsername.textContent = currentUser.username;
        if (profileRole) profileRole.textContent = currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1);
        if (displayUsername) displayUsername.textContent = currentUser.username;
        if (displayEmail) displayEmail.textContent = currentUser.email;
        if (displayRole) displayRole.textContent = currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1);
        if (displayJoinDate) displayJoinDate.textContent = currentUser.joinDate;
    }
}

// Setup profile event listeners
window.setupProfileEventListeners = function() {
    const editProfileBtn = document.getElementById('editProfileBtn');
    const saveProfile = document.getElementById('saveProfile');
    const cancelEdit = document.getElementById('cancelEdit');
    const profileDetails = document.getElementById('profileDetails');
    const profileEdit = document.getElementById('profileEdit');
    
    editProfileBtn?.addEventListener('click', () => {
        profileDetails.style.display = 'none';
        profileEdit.style.display = 'block';
        
        document.getElementById('editUsername').value = currentUser.username;
        document.getElementById('editEmail').value = currentUser.email;
        document.getElementById('editPassword').value = '';
    });
    
    saveProfile?.addEventListener('click', async () => {
        const newUsername = document.getElementById('editUsername').value.trim();
        const newEmail = document.getElementById('editEmail').value.trim();
        const newPassword = document.getElementById('editPassword').value.trim();
        
        if (!newUsername || !newEmail) {
            showNotification('Username and email are required');
            return;
        }
        
        // Check if email is already taken by another user
        const emailExists = users.find(u => u.email === newEmail && u.id !== currentUser.id);
        if (emailExists) {
            showNotification('Email already exists');
            return;
        }
        
        // Update user data
        currentUser.username = newUsername;
        currentUser.email = newEmail;
        if (newPassword) {
            currentUser.password = newPassword;
        }
        
        // Update in users array
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            users[userIndex] = currentUser;
        }
        
        // Save to database
        await db.saveUsers(users);
        await db.saveCurrentUser(currentUser);
        
        // Update display
        updateProfile();
        
        // Hide edit form
        profileDetails.style.display = 'block';
        profileEdit.style.display = 'none';
        
        showNotification('Profile updated successfully');
    });
    
    cancelEdit?.addEventListener('click', () => {
        profileDetails.style.display = 'block';
        profileEdit.style.display = 'none';
    });
}