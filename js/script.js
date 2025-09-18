// Mobile App with Authentication and Admin Panel
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let teamMembers = JSON.parse(localStorage.getItem('teamMembers')) || [];
let projects = JSON.parse(localStorage.getItem('projects')) || [];
let users = JSON.parse(localStorage.getItem('users')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let collaborationRequests = JSON.parse(localStorage.getItem('collaborationRequests')) || [];
let activeCollaborations = JSON.parse(localStorage.getItem('activeCollaborations')) || [];

document.addEventListener('DOMContentLoaded', function() {
    console.log('Mobile App loaded successfully!');
    
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
            roleSelect.innerHTML = '<option value="user">User</option><option value="admin">Admin</option>';
        }
    }
    
    // Authentication event listeners
    document.getElementById('loginBtn').addEventListener('click', login);
    document.getElementById('registerBtn').addEventListener('click', register);
    
    // Mobile navigation
    const menuBtn = document.getElementById('menuBtn');
    const profileBtn = document.getElementById('profileBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const mobileNav = document.getElementById('mobileNav');
    const navItems = document.querySelectorAll('.nav-item');
    const footerBtns = document.querySelectorAll('.footer-btn');
    const pages = document.querySelectorAll('.page');
    
    // Toggle mobile menu
    menuBtn?.addEventListener('click', function() {
        mobileNav.classList.toggle('open');
    });
    
    // Profile button click - redirect to profile page
    profileBtn?.addEventListener('click', function() {
        showPage('profile');
    });
    
    // Logout button click
    logoutBtn?.addEventListener('click', function() {
        if (confirm('Do you want to logout?')) {
            logout();
        }
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (mobileNav && !mobileNav.contains(e.target) && !menuBtn?.contains(e.target)) {
            mobileNav.classList.remove('open');
        }
    });
    
    // Page navigation
    window.showPage = function(pageId) {
        pages.forEach(page => page.classList.remove('active'));
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
        }
        
        // Update active states
        navItems.forEach(item => item.classList.remove('active'));
        footerBtns.forEach(btn => btn.classList.remove('active'));
        
        document.querySelector(`[href="#${pageId}"]`)?.classList.add('active');
        document.querySelector(`[data-page="${pageId}"]`)?.classList.add('active');
        
        mobileNav?.classList.remove('open');
        updateStats();
        
        if (pageId === 'admin') {
            setTimeout(() => {
                loadAdminData();
                if (currentUser && currentUser.role === 'admin') {
                    viewAllUsersTodos();
                }
            }, 300);
        }
    }
    
    // Navigation event listeners
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const pageId = this.getAttribute('href').substring(1);
            if (pageId) {
                showPage(pageId);
            }
        });
    });
    
    footerBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const pageId = this.getAttribute('data-page');
            if (pageId) {
                showPage(pageId);
            }
        });
    });
    
    // Todo functionality
    const addTodoBtn = document.getElementById('addTodoBtn');
    const todoInput = document.getElementById('todoInput');
    const todoText = document.getElementById('todoText');
    const saveTodo = document.getElementById('saveTodo');
    const cancelTodo = document.getElementById('cancelTodo');
    
    addTodoBtn?.addEventListener('click', () => {
        todoInput.style.display = 'block';
        todoText.focus();
    });
    
    saveTodo?.addEventListener('click', () => {
        const text = todoText.value.trim();
        if (text) {
            todos.push({
                id: Date.now(),
                text: text,
                completed: false,
                date: new Date().toLocaleDateString(),
                userId: currentUser.id
            });
            saveTodos();
            renderTodos();
            todoText.value = '';
            todoInput.style.display = 'none';
            updateStats();
        }
    });
    
    cancelTodo?.addEventListener('click', () => {
        todoText.value = '';
        todoInput.style.display = 'none';
    });
    
    // Team management
    const addMemberBtn = document.getElementById('addMemberBtn');
    const memberInput = document.getElementById('memberInput');
    const memberUserSelect = document.getElementById('memberUserSelect');
    const memberRole = document.getElementById('memberRole');
    const saveMember = document.getElementById('saveMember');
    const cancelMember = document.getElementById('cancelMember');
    
    addMemberBtn?.addEventListener('click', () => {
        populateUserSelect();
        memberInput.style.display = 'block';
        memberUserSelect?.focus();
    });
    
    saveMember?.addEventListener('click', () => {
        const selectedUserId = parseInt(memberUserSelect.value);
        const role = memberRole.value;
        
        if (!selectedUserId || !role) {
            showNotification('Please select a user and role');
            return;
        }
        
        // Check if user is already a team member
        const existingMember = teamMembers.find(m => 
            m.selectedUserId === selectedUserId && m.userId === currentUser.id
        );
        
        if (existingMember) {
            showNotification('User is already a team member');
            return;
        }
        
        const selectedUser = users.find(u => u.id === selectedUserId);
        if (selectedUser) {
            teamMembers.push({
                id: Date.now(),
                name: selectedUser.username,
                email: selectedUser.email,
                selectedUserId: selectedUserId,
                role: role,
                joinDate: new Date().toLocaleDateString(),
                userId: currentUser.id
            });
            saveTeamMembers();
            renderTeamMembers();
            memberUserSelect.value = '';
            memberRole.value = 'Employee';
            memberInput.style.display = 'none';
            updateStats();
            showNotification('Team member added successfully!');
        }
    });
    
    cancelMember?.addEventListener('click', () => {
        memberUserSelect.value = '';
        memberRole.value = 'Employee';
        memberInput.style.display = 'none';
    });
    
    // Collaboration management
    const addCollabBtn = document.getElementById('addCollabBtn');
    const collaboratorEmail = document.getElementById('collaboratorEmail');
    
    addCollabBtn?.addEventListener('click', () => {
        const email = collaboratorEmail.value.trim();
        if (email) {
            sendCollaborationRequest(email);
            collaboratorEmail.value = '';
        }
    });
    
    // Project management
    const addProjectBtn = document.getElementById('addProjectBtn');
    const projectName = document.getElementById('projectName');
    
    addProjectBtn?.addEventListener('click', () => {
        const name = projectName.value.trim();
        if (name) {
            projects.push({
                id: Date.now(),
                name: name,
                createdDate: new Date().toLocaleDateString(),
                status: 'Active',
                userId: currentUser.id
            });
            saveProjects();
            renderProjects();
            projectName.value = '';
            updateStats();
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
    
    // Initialize app if logged in
    if (currentUser) {
        renderTodos();
        renderTeamMembers();
        renderProjects();
        renderCollaborationRequests();
        renderActiveCollaborations();
        updateStats();
        updateProfile();
    }
});

// Authentication functions
function showAuth() {
    document.getElementById('authContainer').style.display = 'flex';
    document.getElementById('appContainer').style.display = 'none';
}

function showApp() {
    document.getElementById('authContainer').style.display = 'none';
    document.getElementById('appContainer').style.display = 'flex';
    
    // Show admin features if user is admin
    if (currentUser && currentUser.role === 'admin') {
        document.querySelectorAll('.admin-only').forEach(el => {
            el.classList.add('show');
            el.style.display = el.classList.contains('footer-btn') ? 'flex' : 'block';
        });
        
        // Update team page title for admin
        const teamTitle = document.getElementById('teamPageTitle');
        if (teamTitle) teamTitle.textContent = 'Team Management';
    } else {
        // Hide admin features for regular users
        document.querySelectorAll('.admin-only').forEach(el => {
            el.classList.remove('show');
            el.style.display = 'none';
        });
        
        // Update team page title for users
        const teamTitle = document.getElementById('teamPageTitle');
        if (teamTitle) teamTitle.textContent = 'Team Collaboration';
    }
    
    renderTodos();
    renderTeamMembers();
    renderProjects();
    renderCollaborationRequests();
    renderActiveCollaborations();
    updateStats();
    updateProfile();
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

function login() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    
    if (!email || !password) {
        showNotification('Please fill all fields');
        return;
    }
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showApp();
        showNotification('Login successful!');
    } else {
        showNotification('Invalid credentials');
    }
}

function register() {
    const username = document.getElementById('regUsername').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value.trim();
    const role = document.getElementById('regRole').value;
    
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
    localStorage.setItem('users', JSON.stringify(users));
    
    currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    showApp();
    showNotification('Registration successful!');
}

window.logout = function() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    
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
        const profileInfo = document.querySelector('.profile-info h3');
        const profileRole = document.querySelector('.profile-info p');
        
        if (profileInfo) profileInfo.textContent = currentUser.username;
        if (profileRole) profileRole.textContent = currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1);
    }
}

// Admin functions
function loadAdminData() {
    if (currentUser && currentUser.role === 'admin') {
        const totalUsersEl = document.getElementById('totalUsers');
        const totalTodosEl = document.getElementById('totalTodos');
        
        if (totalUsersEl) totalUsersEl.textContent = users.length;
        if (totalTodosEl) totalTodosEl.textContent = todos.length;
        
        // Auto-load all users todos
        setTimeout(() => {
            if (document.getElementById('allUsersTodos')) {
                viewAllUsersTodos();
            }
        }, 500);
        
        const userList = document.getElementById('userList');
        userList.innerHTML = '';
        
        users.forEach(user => {
            const userItem = document.createElement('div');
            userItem.className = 'user-item';
            userItem.innerHTML = `
                <div class="user-info">
                    <div class="user-name">${user.username}</div>
                    <div class="user-role">${user.role} - ${user.email}</div>
                </div>
                <div class="user-actions">
                    <button class="delete-btn" onclick="deleteUser(${user.id})">✕</button>
                </div>
            `;
            userList.appendChild(userItem);
        });
        
        // Populate user select dropdowns
        populateAdminUserSelects();
        loadAdminCollaborations();
    }
}

function populateAdminUserSelects() {
    const userSelect = document.getElementById('adminUserSelect');
    const user1Select = document.getElementById('adminUser1Select');
    const user2Select = document.getElementById('adminUser2Select');
    
    if (userSelect) {
        userSelect.innerHTML = '<option value="">Select user to view data</option>';
        users.forEach(user => {
            userSelect.innerHTML += `<option value="${user.id}">${user.username} (${user.email})</option>`;
        });
    }
    
    if (user1Select && user2Select) {
        const userOptions = users.map(user => 
            `<option value="${user.id}">${user.username} (${user.email})</option>`
        ).join('');
        
        user1Select.innerHTML = '<option value="">Select first user</option>' + userOptions;
        user2Select.innerHTML = '<option value="">Select second user</option>' + userOptions;
    }
}

window.viewUserData = function() {
    const userId = parseInt(document.getElementById('adminUserSelect').value);
    if (!userId) return;
    
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    const userTodos = todos.filter(t => t.userId === userId);
    const userTeamMembers = teamMembers.filter(m => m.userId === userId);
    const userProjects = projects.filter(p => p.userId === userId);
    
    const dataDisplay = document.getElementById('userDataDisplay');
    dataDisplay.innerHTML = `
        <h4>${user.username}'s Data</h4>
        
        <div class="user-data-section">
            <h5>Todos (${userTodos.length})</h5>
            ${userTodos.map(todo => 
                `<div class="data-item">${todo.text} - ${todo.completed ? 'Completed' : 'Pending'}</div>`
            ).join('')}
        </div>
        
        <div class="user-data-section">
            <h5>Team Members (${userTeamMembers.length})</h5>
            ${userTeamMembers.map(member => 
                `<div class="data-item">${member.name} - ${member.role}</div>`
            ).join('')}
        </div>
        
        <div class="user-data-section">
            <h5>Projects (${userProjects.length})</h5>
            ${userProjects.map(project => 
                `<div class="data-item">${project.name} - ${project.status}</div>`
            ).join('')}
        </div>
    `;
}

window.adminCreateCollaboration = function() {
    const user1Id = parseInt(document.getElementById('adminUser1Select').value);
    const user2Id = parseInt(document.getElementById('adminUser2Select').value);
    
    if (!user1Id || !user2Id) {
        showNotification('Please select both users');
        return;
    }
    
    if (user1Id === user2Id) {
        showNotification('Cannot collaborate with same user');
        return;
    }
    
    const existingCollab = activeCollaborations.find(c => 
        (c.user1Id === user1Id && c.user2Id === user2Id) ||
        (c.user1Id === user2Id && c.user2Id === user1Id)
    );
    
    if (existingCollab) {
        showNotification('Collaboration already exists');
        return;
    }
    
    const user1 = users.find(u => u.id === user1Id);
    const user2 = users.find(u => u.id === user2Id);
    
    activeCollaborations.push({
        id: Date.now(),
        user1Id: user1Id,
        user1Name: user1.username,
        user1Email: user1.email,
        user2Id: user2Id,
        user2Name: user2.username,
        user2Email: user2.email,
        createdDate: new Date().toLocaleDateString(),
        createdBy: 'admin'
    });
    
    saveActiveCollaborations();
    loadAdminCollaborations();
    showNotification('Collaboration created successfully!');
}

function loadAdminCollaborations() {
    const collabList = document.getElementById('adminCollabList');
    if (!collabList) return;
    
    if (activeCollaborations.length === 0) {
        collabList.innerHTML = '<p>No active collaborations</p>';
        return;
    }
    
    collabList.innerHTML = '<h4>Active Collaborations</h4>';
    
    activeCollaborations.forEach(collab => {
        const collabItem = document.createElement('div');
        collabItem.className = 'admin-collab-item';
        collabItem.innerHTML = `
            <div>
                <div class="collab-users">${collab.user1Name} ↔ ${collab.user2Name}</div>
                <div style="font-size: 0.9rem; color: #666;">
                    ${collab.user1Email} & ${collab.user2Email}
                </div>
                <div style="font-size: 0.8rem; color: #999;">
                    Created: ${collab.createdDate} ${collab.createdBy ? '(by admin)' : ''}
                </div>
            </div>
            <button class="reject-btn" onclick="adminEndCollaboration(${collab.id})">End</button>
        `;
        collabList.appendChild(collabItem);
    });
}

window.adminEndCollaboration = function(collabId) {
    activeCollaborations = activeCollaborations.filter(c => c.id !== collabId);
    saveActiveCollaborations();
    loadAdminCollaborations();
    showNotification('Collaboration ended by admin');
}

window.viewAllUsersTodos = function() {
    const allTodosContainer = document.getElementById('allUsersTodos');
    if (!allTodosContainer) {
        console.log('allUsersTodos container not found');
        return;
    }
    
    console.log('Loading todos for', users.length, 'users');
    allTodosContainer.innerHTML = '';
    
    users.forEach(user => {
        const userTodos = todos.filter(t => t.userId === user.id);
        
        const userSection = document.createElement('div');
        userSection.className = 'user-todos-section';
        
        const completedCount = userTodos.filter(t => t.completed).length;
        const totalCount = userTodos.length;
        
        userSection.innerHTML = `
            <div class="user-todos-header">
                <div>
                    <strong>${user.username}</strong> (${user.email})
                    <div style="font-size: 0.9rem; opacity: 0.9;">${user.role}</div>
                </div>
                <div style="text-align: right;">
                    <div>${completedCount}/${totalCount} completed</div>
                    <div style="font-size: 0.8rem; opacity: 0.8;">Joined: ${user.joinDate}</div>
                </div>
            </div>
            <div class="user-todos-list" id="userTodos_${user.id}"></div>
        `;
        
        allTodosContainer.appendChild(userSection);
        
        const todosList = document.getElementById(`userTodos_${user.id}`);
        
        if (userTodos.length === 0) {
            todosList.innerHTML = '<div class="no-todos">No todos created yet</div>';
        } else {
            userTodos.forEach(todo => {
                const todoItem = document.createElement('div');
                todoItem.className = `admin-todo-item ${todo.completed ? 'completed' : ''}`;
                todoItem.innerHTML = `
                    <div class="admin-todo-text ${todo.completed ? 'completed' : ''}">
                        ${todo.text}
                        <div style="font-size: 0.8rem; color: #6c757d; margin-top: 0.25rem;">
                            Created: ${todo.date}
                        </div>
                    </div>
                    <div class="admin-todo-status ${todo.completed ? 'completed' : 'pending'}">
                        ${todo.completed ? '✓ Done' : '⏳ Pending'}
                    </div>
                `;
                todosList.appendChild(todoItem);
            });
        }
    });
    
    if (users.length === 0) {
        allTodosContainer.innerHTML = '<div class="no-todos">No registered users found</div>';
    } else {
        console.log('Displayed todos for', users.length, 'users');
    }
}

window.deleteUser = function(userId) {
    if (currentUser && currentUser.role === 'admin' && userId !== currentUser.id) {
        users = users.filter(u => u.id !== userId);
        localStorage.setItem('users', JSON.stringify(users));
        loadAdminData();
        showNotification('User deleted');
    }
}

window.clearAllData = function() {
    if (currentUser && currentUser.role === 'admin') {
        if (confirm('Are you sure you want to clear all data?')) {
            todos = [];
            teamMembers = [];
            projects = [];
            saveTodos();
            saveTeamMembers();
            saveProjects();
            renderTodos();
            renderTeamMembers();
            renderProjects();
            updateStats();
            showNotification('All data cleared');
        }
    }
}

window.exportData = function() {
    if (currentUser && currentUser.role === 'admin') {
        const data = {
            users: users,
            todos: todos,
            teamMembers: teamMembers,
            projects: projects
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'app-data.json';
        link.click();
        
        showNotification('Data exported');
    }
}

// Collaboration functions
function sendCollaborationRequest(email) {
    const targetUser = users.find(u => u.email === email);
    
    if (!targetUser) {
        showNotification('User not found');
        return;
    }
    
    if (targetUser.id === currentUser.id) {
        showNotification('Cannot collaborate with yourself');
        return;
    }
    
    const existingRequest = collaborationRequests.find(r => 
        (r.fromUserId === currentUser.id && r.toUserId === targetUser.id) ||
        (r.fromUserId === targetUser.id && r.toUserId === currentUser.id)
    );
    
    if (existingRequest) {
        showNotification('Request already exists');
        return;
    }
    
    const existingCollab = activeCollaborations.find(c => 
        (c.user1Id === currentUser.id && c.user2Id === targetUser.id) ||
        (c.user1Id === targetUser.id && c.user2Id === currentUser.id)
    );
    
    if (existingCollab) {
        showNotification('Already collaborating');
        return;
    }
    
    collaborationRequests.push({
        id: Date.now(),
        fromUserId: currentUser.id,
        fromUserName: currentUser.username,
        fromUserEmail: currentUser.email,
        toUserId: targetUser.id,
        toUserName: targetUser.username,
        toUserEmail: targetUser.email,
        status: 'pending',
        createdDate: new Date().toLocaleDateString()
    });
    
    saveCollaborationRequests();
    renderCollaborationRequests();
    showNotification('Collaboration request sent!');
}

function acceptCollaborationRequest(requestId) {
    const request = collaborationRequests.find(r => r.id === requestId);
    if (!request) return;
    
    activeCollaborations.push({
        id: Date.now(),
        user1Id: request.fromUserId,
        user1Name: request.fromUserName,
        user1Email: request.fromUserEmail,
        user2Id: request.toUserId,
        user2Name: request.toUserName,
        user2Email: request.toUserEmail,
        createdDate: new Date().toLocaleDateString()
    });
    
    collaborationRequests = collaborationRequests.filter(r => r.id !== requestId);
    
    saveCollaborationRequests();
    saveActiveCollaborations();
    renderCollaborationRequests();
    renderActiveCollaborations();
    renderTodos();
    showNotification('Collaboration accepted!');
}

function rejectCollaborationRequest(requestId) {
    collaborationRequests = collaborationRequests.filter(r => r.id !== requestId);
    saveCollaborationRequests();
    renderCollaborationRequests();
    showNotification('Request rejected');
}

function endCollaboration(collabId) {
    activeCollaborations = activeCollaborations.filter(c => c.id !== collabId);
    saveActiveCollaborations();
    renderActiveCollaborations();
    renderTodos();
    showNotification('Collaboration ended');
}

function renderCollaborationRequests() {
    const requestsContainer = document.getElementById('collabRequests');
    if (!requestsContainer) return;
    
    const myRequests = collaborationRequests.filter(r => r.toUserId === currentUser.id);
    
    if (myRequests.length === 0) {
        requestsContainer.innerHTML = '';
        return;
    }
    
    requestsContainer.innerHTML = '<h4>Collaboration Requests</h4>';
    
    myRequests.forEach(request => {
        const requestItem = document.createElement('div');
        requestItem.className = 'collab-request';
        requestItem.innerHTML = `
            <div>
                <strong>${request.fromUserName}</strong> wants to collaborate
                <div style="font-size: 0.9rem; color: #666;">${request.fromUserEmail}</div>
            </div>
            <div class="collab-actions">
                <button class="accept-btn" onclick="acceptCollaborationRequest(${request.id})">Accept</button>
                <button class="reject-btn" onclick="rejectCollaborationRequest(${request.id})">Reject</button>
            </div>
        `;
        requestsContainer.appendChild(requestItem);
    });
}

function renderActiveCollaborations() {
    const collabContainer = document.getElementById('activeCollabs');
    if (!collabContainer) return;
    
    const myCollabs = activeCollaborations.filter(c => 
        c.user1Id === currentUser.id || c.user2Id === currentUser.id
    );
    
    if (myCollabs.length === 0) {
        collabContainer.innerHTML = '';
        return;
    }
    
    collabContainer.innerHTML = '<h4>Active Collaborations</h4>';
    
    myCollabs.forEach(collab => {
        const partnerName = collab.user1Id === currentUser.id ? collab.user2Name : collab.user1Name;
        const partnerEmail = collab.user1Id === currentUser.id ? collab.user2Email : collab.user1Email;
        
        const collabItem = document.createElement('div');
        collabItem.className = 'collab-item';
        collabItem.innerHTML = `
            <div>
                <strong>Collaborating with ${partnerName}</strong>
                <div style="font-size: 0.9rem; color: #666;">${partnerEmail}</div>
            </div>
            <button class="reject-btn" onclick="endCollaboration(${collab.id})">End</button>
        `;
        collabContainer.appendChild(collabItem);
    });
}

function saveCollaborationRequests() {
    localStorage.setItem('collaborationRequests', JSON.stringify(collaborationRequests));
}

function saveActiveCollaborations() {
    localStorage.setItem('activeCollaborations', JSON.stringify(activeCollaborations));
}

// Filter data by current user
function getUserTodos() {
    return todos.filter(todo => todo.userId === currentUser.id);
}

function getSharedTodos() {
    const myCollabs = activeCollaborations.filter(c => 
        c.user1Id === currentUser.id || c.user2Id === currentUser.id
    );
    
    const partnerIds = myCollabs.map(c => 
        c.user1Id === currentUser.id ? c.user2Id : c.user1Id
    );
    
    return todos.filter(todo => partnerIds.includes(todo.userId));
}

function getUserTeamMembers() {
    return teamMembers.filter(member => member.userId === currentUser.id);
}

function getUserProjects() {
    return projects.filter(project => project.userId === currentUser.id);
}

// Todo functions
function renderTodos() {
    const todoList = document.getElementById('todoList');
    if (!todoList) return;
    
    todoList.innerHTML = '';
    const userTodos = getUserTodos();
    const sharedTodos = getSharedTodos();
    
    // Render user's own todos
    userTodos.forEach(todo => {
        const todoItem = document.createElement('div');
        todoItem.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        todoItem.innerHTML = `
            <div class="todo-text">${todo.text}</div>
            <div class="todo-actions">
                <button class="complete-btn" onclick="toggleTodo(${todo.id})">
                    ${todo.completed ? '↶' : '✓'}
                </button>
                <button class="delete-btn" onclick="deleteTodo(${todo.id})">✕</button>
            </div>
        `;
        todoList.appendChild(todoItem);
    });
    
    // Render shared todos if any
    if (sharedTodos.length > 0) {
        const sharedSection = document.createElement('div');
        sharedSection.className = 'shared-todos';
        sharedSection.innerHTML = '<h4>Team Member Tasks</h4>';
        
        sharedTodos.forEach(todo => {
            const partnerName = getPartnerName(todo.userId);
            const todoCard = document.createElement('div');
            todoCard.className = 'card team-todo-card';
            todoCard.innerHTML = `
                <div class="team-member-header">
                    <span class="member-badge">${partnerName}</span>
                    <span class="status-badge ${todo.completed ? 'completed' : 'pending'}">
                        ${todo.completed ? '✓ Done' : '⏳ Pending'}
                    </span>
                </div>
                <div class="todo-content">
                    <div class="todo-text ${todo.completed ? 'completed' : ''}">${todo.text}</div>
                    <div class="todo-date">Created: ${todo.date}</div>
                </div>
            `;
            sharedSection.appendChild(todoCard);
        });
        
        todoList.appendChild(sharedSection);
    }
}

function getPartnerName(userId) {
    const user = users.find(u => u.id === userId);
    return user ? user.username : 'Unknown';
}

function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo && todo.userId === currentUser.id) {
        todo.completed = !todo.completed;
        saveTodos();
        renderTodos();
        updateStats();
    }
}

function deleteTodo(id) {
    todos = todos.filter(t => t.id !== id || t.userId !== currentUser.id);
    saveTodos();
    renderTodos();
    updateStats();
}

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// Team functions
function populateUserSelect() {
    const memberUserSelect = document.getElementById('memberUserSelect');
    if (!memberUserSelect) return;
    
    memberUserSelect.innerHTML = '<option value="">Select a registered user</option>';
    
    // Filter out current user and already added team members
    const existingMemberIds = getUserTeamMembers().map(m => m.selectedUserId);
    const availableUsers = users.filter(u => 
        u.id !== currentUser.id && !existingMemberIds.includes(u.id)
    );
    
    availableUsers.forEach(user => {
        memberUserSelect.innerHTML += `<option value="${user.id}">${user.username} (${user.email})</option>`;
    });
}

function renderTeamMembers() {
    const teamList = document.getElementById('teamList');
    if (!teamList) return;
    
    teamList.innerHTML = '';
    const userTeamMembers = getUserTeamMembers();
    
    userTeamMembers.forEach(member => {
        const memberItem = document.createElement('div');
        memberItem.className = 'member-item';
        memberItem.innerHTML = `
            <div class="member-info">
                <div class="member-name">${member.name}</div>
                <div class="member-role">${member.role} - ${member.email}</div>
                <div style="font-size: 0.8rem; color: #999;">Added: ${member.joinDate}</div>
            </div>
            <div class="member-actions">
                <button class="delete-btn" onclick="deleteMember(${member.id})">✕</button>
            </div>
        `;
        teamList.appendChild(memberItem);
    });
}

function deleteMember(id) {
    teamMembers = teamMembers.filter(m => m.id !== id || m.userId !== currentUser.id);
    saveTeamMembers();
    renderTeamMembers();
    updateStats();
}

function saveTeamMembers() {
    localStorage.setItem('teamMembers', JSON.stringify(teamMembers));
}

// Project functions
function renderProjects() {
    const projectList = document.getElementById('projectList');
    if (!projectList) return;
    
    projectList.innerHTML = '';
    const userProjects = getUserProjects();
    
    userProjects.forEach(project => {
        const projectItem = document.createElement('div');
        projectItem.className = 'project-item';
        projectItem.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong>${project.name}</strong>
                    <div style="font-size: 0.9rem; color: #666;">${project.status}</div>
                </div>
                <button class="delete-btn" onclick="deleteProject(${project.id})">✕</button>
            </div>
        `;
        projectList.appendChild(projectItem);
    });
}

function deleteProject(id) {
    projects = projects.filter(p => p.id !== id || p.userId !== currentUser.id);
    saveProjects();
    renderProjects();
    updateStats();
}

function saveProjects() {
    localStorage.setItem('projects', JSON.stringify(projects));
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
    
    if (todoCountEl) todoCountEl.textContent = userTodos.filter(t => !t.completed).length;
    if (teamCountEl) teamCountEl.textContent = userTeamMembers.length;
    if (projectCountEl) projectCountEl.textContent = userProjects.length;
    if (completedTodosEl) completedTodosEl.textContent = userTodos.filter(t => t.completed).length;
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

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from { transform: translate(-50%, -100%); opacity: 0; }
        to { transform: translate(-50%, 0); opacity: 1; }
    }
`;
document.head.appendChild(style);